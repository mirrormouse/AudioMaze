import { AudioConstants, AudioSourcePath } from './AudioConstants';
import { Room } from './Room';

interface AudioSource {
    x: number;
    y: number;
    audio: HTMLAudioElement;
    panner: StereoPannerNode;
    gainNode: GainNode;
    path?: AudioSourcePath;
    currentPathIndex: number;
    lastUpdateTime: number;
    moveSpeed: number;
    moveDirection: number;
}

export class AudioManager {
    private context: AudioContext;
    private sources: AudioSource[];
    private listener: AudioListener;
    private room: Room;

    constructor(room: Room) {
        this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.sources = [];
        this.listener = this.context.listener;
        this.room = room;
        this.applyMobileVolumeBoost();
    }

    addSource(x: number, y: number, audioPath: string, movementPath?: AudioSourcePath) {
        const audio = new Audio(audioPath);
        const source = this.context.createMediaElementSource(audio);
        const panner = this.context.createStereoPanner();
        const gainNode = this.context.createGain();
        gainNode.gain.setValueAtTime(0.5, this.context.currentTime); // 初期音量を0.5に設定

        source.connect(gainNode);
        gainNode.connect(panner);
        panner.connect(this.context.destination);

        audio.loop = true;

        this.sources.push({
            x, y, audio, panner, gainNode,
            path: movementPath,
            currentPathIndex: 0,
            lastUpdateTime: this.context.currentTime,
            moveSpeed: 0.2,
            moveDirection: 1
        });
    }

    private applyMobileVolumeBoost() {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
            AudioConstants.VOLUME_AMPLIFICATION *= 2.0; // モバイルデバイスの場合、音量増幅ファクターを1.5倍に
        }
    }

    updateAudio(playerX: number, playerY: number, playerDirection: number) {
        const currentTime = this.context.currentTime;

        this.updateListenerPosition(playerX, playerY, playerDirection, currentTime);

        this.sources.forEach(source => {
            this.updateSourcePosition(source, currentTime);

            const paths = this.calculateReflectedPaths(source.x, source.y, playerX, playerY);

            let totalVolume = 0;
            let totalWeightedX = 0;
            let totalWeightedY = 0;
            let totalWeight = 0;

            paths.forEach((path) => {
                const delay = Math.max(0, path.distance / AudioConstants.SPEED_OF_SOUND);
                const distanceForVolume = Math.max(1, path.distance);
                const volumeBeforeAttenuation = 1 / (distanceForVolume / 100);
                const volume = Math.min(1, Math.max(0, volumeBeforeAttenuation * path.attenuation));


                totalVolume += volume;

                if (path.isReflected) {
                    totalWeightedX += (path.endX - playerX) * volume;
                    totalWeightedY += (path.endY - playerY) * volume;
                } else {
                    totalWeightedX += 0.1 * (source.x - playerX) * volume;
                    totalWeightedY += 0.1 * (source.y - playerY) * volume;
                }

                totalWeight += volume;

                // 反射音の処理（実際のWeb Audio APIの実装では、ここで反射音を生成し遅延させる）
            });

            // 残響音の追加
            const reverbDelay = Math.max(0, this.room.width / AudioConstants.SPEED_OF_SOUND);
            const reverbVolume = Math.min(1, Math.max(0, totalVolume * AudioConstants.REVERB_DECAY));
            totalVolume += reverbVolume;

            // 音量の正規化と適用
            const normalizedVolume = Math.min(1, Math.max(0.001, totalVolume * AudioConstants.VOLUME_AMPLIFICATION));
            source.gainNode.gain.setValueAtTime(normalizedVolume, currentTime);
            console.log('Normalized Volume:', normalizedVolume);

            // パンの計算
            if (totalWeight > 0) {
                const avgX = totalWeightedX / totalWeight;
                const avgY = totalWeightedY / totalWeight;
                const relativeX = Math.sin(playerDirection) * avgX + Math.cos(playerDirection) * avgY;
                const relativeY = Math.cos(playerDirection) * avgX - Math.sin(playerDirection) * avgY;
                // console.log('PlayerDirection:', playerDirection)
                // console.log('avgX:', avgX, 'avgY:', avgY)
                // console.log('Relative X:', relativeX, 'Relative Y:', relativeY)
                const pan = Math.max(-1, Math.min(1, relativeX / (Math.abs(relativeY) || 1)));
                source.panner.pan.setValueAtTime(pan, currentTime);
            } else {
                source.panner.pan.setValueAtTime(0, currentTime);
            }

            // ドップラー効果の計算
            const directPath = paths.find(p => !p.isReflected) || paths[0];
            if (directPath) {
                const distance = Math.max(0.1, directPath.distance);
                const dx = directPath.endX - playerX;
                const dy = directPath.endY - playerY;
                const totalDistance = Math.sqrt(dx * dx + dy * dy);

                // 相対速度の計算を安全に行う
                let relativeSpeed = 0;
                if (totalDistance > 0) {
                    relativeSpeed = source.moveSpeed * source.moveDirection * (dx / totalDistance);
                }

                // ドップラーシフトの計算と範囲の制限
                const dopplerShift = AudioConstants.SPEED_OF_SOUND / (AudioConstants.SPEED_OF_SOUND - relativeSpeed);
                const clampedDopplerShift = Math.max(0.5, Math.min(2, dopplerShift));

                // 値が有限であることを確認してから設定
                if (isFinite(clampedDopplerShift)) {
                    source.audio.playbackRate = clampedDopplerShift;
                } else {
                    console.warn('Invalid doppler shift calculated:', clampedDopplerShift);
                }
            }
        });
    }

    private updateListenerPosition(x: number, y: number, direction: number, currentTime: number) {
        this.listener.positionX.setValueAtTime(x, currentTime);
        this.listener.positionY.setValueAtTime(y, currentTime);
        this.listener.forwardX.setValueAtTime(Math.cos(direction), currentTime);
        this.listener.forwardY.setValueAtTime(Math.sin(direction), currentTime);
        this.listener.upX.setValueAtTime(0, currentTime);
        this.listener.upY.setValueAtTime(0, currentTime);
        this.listener.upZ.setValueAtTime(1, currentTime);
    }

    private updateSourcePosition(source: AudioSource, currentTime: number) {
        if (source.path && source.path.points.length > 1) {
            const elapsedTime = currentTime - source.lastUpdateTime;
            const distanceMoved = elapsedTime * source.path.speed;

            let remainingDistance = distanceMoved;
            while (remainingDistance > 0) {
                const nextIndex = (source.currentPathIndex + 1) % source.path.points.length;
                const currentPoint = source.path.points[source.currentPathIndex];
                const nextPoint = source.path.points[nextIndex];

                const dx = nextPoint.x - currentPoint.x;
                const dy = nextPoint.y - currentPoint.y;
                const segmentLength = Math.sqrt(dx * dx + dy * dy);
                const segmentDirectionX = dx / segmentLength;
                const segmentDirectionY = dy / segmentLength;
                const movedX = source.x + segmentDirectionX * remainingDistance;
                const movedY = source.y + segmentDirectionY * remainingDistance;

                const dotProduct = (movedX - nextPoint.x) * (currentPoint.x - nextPoint.x) +
                    (movedY - nextPoint.y) * (currentPoint.y - nextPoint.y);

                if (dotProduct < 0) {
                    source.currentPathIndex = nextIndex;
                    remainingDistance -= segmentLength;
                    source.x = nextPoint.x;
                    source.y = nextPoint.y;
                } else {
                    const ratio = remainingDistance / segmentLength;
                    source.x = source.x + dx * ratio;
                    source.y = source.y + dy * ratio;
                    remainingDistance = 0;
                }
            }

            source.lastUpdateTime = currentTime;
        }
    }

    private calculateReflectedPaths(sourceX: number, sourceY: number, listenerX: number, listenerY: number) {
        const paths = [];

        // 直接音のパスを計算（壁による遮蔽を考慮）
        const directPath = this.calculatePath(sourceX, sourceY, listenerX, listenerY);
        if (!this.room.lineIntersectsAnyWall(sourceX, sourceY, listenerX, listenerY)) {
            paths.push(directPath);
        } else {
            // 遮蔽がある場合、大幅に減衰させた直接音を追加
            paths.push({ ...directPath, attenuation: AudioConstants.OBSTRUCTION_COEFFICIENT });
        }

        // 反射音のパスを計算
        this.calculateReflectedPathsRecursive(sourceX, sourceY, listenerX, listenerY, AudioConstants.MAX_REFLECTIONS, [], paths);

        return paths;
    }

    private calculatePath(x1: number, y1: number, x2: number, y2: number) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return { distance, isReflected: false, endX: x2, endY: y2, attenuation: 1 };
    }

    private calculateReflectedPathsRecursive(currentX: number, currentY: number, listenerX: number, listenerY: number, remainingReflections: number, currentPath: any[], paths: any[]) {
        if (remainingReflections === 0) return;

        this.room.walls.forEach(wall => {
            const reflectedPoint = this.reflectPoint(currentX, currentY, wall);

            if (!this.room.lineIntersectsAnyWall(currentX, currentY, reflectedPoint.x, reflectedPoint.y) &&
                !this.room.lineIntersectsAnyWall(reflectedPoint.x, reflectedPoint.y, listenerX, listenerY)) {

                const newPath = [...currentPath, { x: reflectedPoint.x, y: reflectedPoint.y }];
                const totalDistance = this.calculatePathDistance(currentX, currentY, ...newPath.map(p => [p.x, p.y]).flat(), listenerX, listenerY);
                const attenuation = Math.pow(AudioConstants.REFLECTION_COEFFICIENT, AudioConstants.MAX_REFLECTIONS - remainingReflections + 1);

                paths.push({
                    distance: totalDistance,
                    reflections: AudioConstants.MAX_REFLECTIONS - remainingReflections + 1,
                    path: newPath,
                    endX: reflectedPoint.x,
                    endY: reflectedPoint.y,
                    attenuation: attenuation,
                    isReflected: true
                });

                // 次の反射を計算
                this.calculateReflectedPathsRecursive(reflectedPoint.x, reflectedPoint.y, listenerX, listenerY, remainingReflections - 1, newPath, paths);
            }
        });
    }

    private reflectPoint(x: number, y: number, wall: { x1: number, y1: number, x2: number, y2: number }) {
        const dx = wall.x2 - wall.x1;
        const dy = wall.y2 - wall.y1;
        const a = (dx * dx - dy * dy) / (dx * dx + dy * dy);
        const b = 2 * dx * dy / (dx * dx + dy * dy);
        const x2 = a * (x - wall.x1) + b * (y - wall.y1) + wall.x1;
        const y2 = b * (x - wall.x1) - a * (y - wall.y1) + wall.y1;
        return { x: 2 * x2 - x, y: 2 * y2 - y };
    }

    private calculatePathDistance(...points: number[]) {
        let totalDistance = 0;
        for (let i = 0; i < points.length - 2; i += 2) {
            const x1 = points[i];
            const y1 = points[i + 1];
            const x2 = points[i + 2];
            const y2 = points[i + 3];
            totalDistance += this.calculateDistance(x1, y1, x2, y2);
        }
        return totalDistance;
    }

    private calculateDistance(x1: number, y1: number, x2: number, y2: number) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    start() {
        if (this.context.state === 'suspended') {
            this.context.resume().then(() => {
                console.log('AudioContext resumed successfully');
                this.playAllSources();
            });
        } else {
            this.playAllSources();
        }
    }

    private playAllSources() {
        this.sources.forEach(source => {
            source.audio.play().catch(error => {
                console.error('Error playing audio:', error);
            });
        });
    }

    stop() {
        this.sources.forEach(source => source.audio.pause());
        this.context.suspend();
    }

    getSourcePosition(index: number): { x: number; y: number } | null {
        if (index >= 0 && index < this.sources.length) {
            return { x: this.sources[index].x, y: this.sources[index].y };
        }
        return null;
    }
}