import { AudioManager } from './AudioManager';
import { Room } from './Room';
import { Player } from './Player';
import { AudioSourcePath } from './AudioConstants';
import { Renderer3D } from './Renderer3D';
import { ClearScreen } from './ClearScreen';
import { FailureNotification } from './FailureNotification';
import { DirectionButtons } from './DirectionButtons';

interface AudioSourceData {
    x: number;
    y: number;
    path: string;
    movementPath?: AudioSourcePath;
}

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private audioManager: AudioManager;
    private room: Room;
    private player: Player;
    private audioSources: AudioSourceData[];
    private renderer3D: Renderer3D;
    private map2DCanvas: HTMLCanvasElement;
    private map2DCtx: CanvasRenderingContext2D;
    private clearScreen: ClearScreen;
    private guessCount: number = 0; // 推測回数
    private showSources: boolean = false; // 音源の位置を表示するかどうか
    private isCleared: boolean = false; // ステージクリアしたかどうか
    private onStageComplete: () => void; // ステージクリア時のコールバック
    private isFinalStage: boolean; // 最終ステージかどうか
    private failureNotification: FailureNotification; // 失敗画面
    private threshold: number = 50; // 成功判定の閾値
    private stageNumber: number; // ステージ番号
    private stageInstruction: string; // ステージの指示
    private isPortrait: boolean = false; // 縦向きのレイアウトかどうか
    private isFailureScreenVisible: boolean = false;
    private directionButtons: DirectionButtons;


    constructor(canvas: HTMLCanvasElement,
        room: Room,
        player: Player,
        audioSources: AudioSourceData[],
        onStageComplete: () => void,
        isFinalStage: boolean,
        stageNumber: number,
        stageInstruction: string,
        isPortrait: boolean) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.room = room;
        this.player = player;
        this.audioSources = audioSources;

        this.stageNumber = stageNumber;
        this.stageInstruction = stageInstruction;

        this.canvas.width = 1200;
        this.canvas.height = 600;

        this.audioManager = new AudioManager(this.room);
        audioSources.forEach(source => {
            this.audioManager.addSource(source.x, source.y, source.path, source.movementPath);
        });

        this.update = this.update.bind(this);

        this.renderer3D = new Renderer3D(this.createOffscreenCanvas(800, 600));
        this.directionButtons = new DirectionButtons(this.ctx);

        this.map2DCanvas = this.createOffscreenCanvas(300, 300);
        this.map2DCtx = this.map2DCanvas.getContext('2d')!;

        this.isPortrait = isPortrait;

        this.clearScreen = new ClearScreen(this.canvas.width, this.canvas.height);
        this.failureNotification = new FailureNotification(this.canvas.width, this.canvas.height, isPortrait);

        this.onStageComplete = onStageComplete;
        this.isFinalStage = isFinalStage;
        this.clearScreen = new ClearScreen(this.canvas.width, this.canvas.height);

        this.resize(canvas.width, canvas.height, isPortrait);
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    resize(width: number, height: number, isPortrait: boolean) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.isPortrait = isPortrait;

        if (isPortrait) {
            // 縦向きのレイアウト
            this.renderer3D.resize(width, height * 0.6);
            this.map2DCanvas.width = width * 0.5;
            this.map2DCanvas.height = height * 0.3;
            this.directionButtons.resize(width, height, width, height * 0.6);
        } else {
            // 横向きのレイアウト
            this.renderer3D.resize(width * 2 / 3, height);
            this.map2DCanvas.width = width / 4;
            this.map2DCanvas.height = width / 4;
            this.directionButtons.resize(width, height, width * 2 / 3, height);
        }

        this.clearScreen.resize(width, height);
        this.failureNotification.resize(width, height, isPortrait);


        this.draw();
    }


    private createOffscreenCanvas(width: number, height: number): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }

    private handleKeyDown(e: KeyboardEvent) {
        if (this.isCleared) return;

        const moveSpeed = 1;
        const rotateSpeed = Math.PI / 18; // 10度（π/18ラジアン）

        switch (e.key.toLowerCase()) {
            case 'arrowup':
            case 'w':
                this.player.move(
                    Math.cos(this.player.direction) * moveSpeed,
                    -Math.sin(this.player.direction) * moveSpeed,
                    this.room
                );
                break;
            case 'arrowdown':
            case 's':
                this.player.move(
                    -Math.cos(this.player.direction) * moveSpeed,
                    Math.sin(this.player.direction) * moveSpeed,
                    this.room
                );
                break;
            case 'arrowleft':
            case 'a':
                this.player.rotate(rotateSpeed);
                break;
            case 'arrowright':
            case 'd':
                this.player.rotate(-rotateSpeed);
                break;
        }
    }

    handleDirectionButtonClick(x: number, y: number) {
        if (this.isCleared) return;
        const direction = this.directionButtons.handleClick(x, y);
        this.handleDirection(direction);
        this.directionButtons.handlePress(x, y);
    }

    handleDirection(direction: string) {
        const moveSpeed = 1;
        const rotateSpeed = Math.PI / 18; // 10度（π/18ラジアン）

        if (direction) {
            switch (direction) {
                case 'up':
                    this.player.move(
                        Math.cos(this.player.direction) * moveSpeed,
                        -Math.sin(this.player.direction) * moveSpeed,
                        this.room
                    );
                    break;
                case 'down':
                    this.player.move(
                        -Math.cos(this.player.direction) * moveSpeed,
                        Math.sin(this.player.direction) * moveSpeed,
                        this.room
                    );
                    break;
                case 'left':
                    this.player.rotate(rotateSpeed);
                    break;
                case 'right':
                    this.player.rotate(-rotateSpeed);
                    break;
            }
        }
    }



    makeGuess() {
        if (this.isFailureScreenVisible) return; // 失敗画面表示中は操作を無視

        this.guessCount++;
        const closestSource = this.findClosestSource();
        const distance = Math.sqrt(
            (this.player.x - closestSource.x) ** 2 +
            (this.player.y - closestSource.y) ** 2
        );

        if (distance < this.threshold) {
            this.isCleared = true;
            this.clearScreen.show(distance, this.guessCount, this.onStageComplete, this.isFinalStage);
        } else {
            this.isFailureScreenVisible = true;
            this.failureNotification.show(this.guessCount, distance, this.threshold);
        }
    }

    handleClick(x: number, y: number) {
        if (this.isCleared) {
            this.clearScreen.handleClick(x, y);
        } else if (this.isFailureScreenVisible) {
            if (this.failureNotification.handleClick(x, y)) {
                this.isFailureScreenVisible = false;
            }
        }
    }



    private findClosestSource(): AudioSourceData {
        return this.audioSources.reduce((closest, current) => {
            const closestDist = Math.hypot(closest.x - this.player.x, closest.y - this.player.y);
            const currentDist = Math.hypot(current.x - this.player.x, current.y - this.player.y);
            return currentDist < closestDist ? current : closest;
        });
    }

    private draw() {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);


        if (this.isPortrait) {
            // 縦向きのレイアウト
            const render3DHeight = this.canvas.height * 0.6;
            this.renderer3D.render(this.room, this.player);
            this.ctx.drawImage(this.renderer3D.getCanvas(), 0, 0, this.canvas.width, render3DHeight);

            this.directionButtons.draw(this.canvas.width, this.canvas.height * 0.6);

            // 2Dマップ
            this.drawMap(0, render3DHeight, this.canvas.width * 0.45, this.canvas.height * 0.3);

            // ステージ情報の表示
            this.drawStageInfo(20, 40, '24px', '18px');
        } else {
            // 横向きのレイアウト
            const render3DWidth = Math.floor(this.canvas.width * 2 / 3);
            this.renderer3D.render(this.room, this.player);
            this.ctx.drawImage(this.renderer3D.getCanvas(), 0, 0, render3DWidth, this.canvas.height);

            this.directionButtons.draw(this.canvas.width * 2 / 3, this.canvas.height);

            // 2Dマップ
            this.drawMap(render3DWidth, 50, this.canvas.width / 4, this.canvas.width / 4);

            // ステージ情報の表示
            this.drawStageInfo(20, 40, '24px', '18px');
        }

        if (this.isCleared) {
            this.clearScreen.draw(this.ctx);
        } else if (this.isFailureScreenVisible) {
            this.failureNotification.draw(this.ctx);
        }
    }

    private drawStageInfo(x: number, y: number, titleSize: string, instructionSize: string) {

        this.ctx.textAlign = 'left';
        this.ctx.fillStyle = 'black';
        this.ctx.font = `bold ${titleSize} Arial`;
        this.ctx.fillText(`ステージ ${this.stageNumber}`, x, y);
        this.ctx.font = `${instructionSize} Arial`;
        this.ctx.fillText(this.stageInstruction, x, y + parseInt(titleSize) + 10);
    }


    private drawMap(x: number, y: number, width: number, height: number) {
        this.map2DCtx.clearRect(0, 0, this.map2DCanvas.width, this.map2DCanvas.height);
        const scale = Math.min(width / this.room.width, height / this.room.height);
        this.room.draw(this.map2DCtx, scale);
        this.player.draw(this.map2DCtx, scale);

        if (this.showSources) {
            this.audioSources.forEach((source, index) => {
                const currentPosition = this.audioManager.getSourcePosition(index);
                if (currentPosition) {
                    this.map2DCtx.fillStyle = 'red';
                    this.map2DCtx.beginPath();
                    this.map2DCtx.arc(
                        currentPosition.x * scale,
                        currentPosition.y * scale,
                        4,
                        0,
                        Math.PI * 2
                    );
                    this.map2DCtx.fill();
                }
            });
        }

        this.ctx.drawImage(this.map2DCanvas, x, y, width, height);
    }

    handleRelease() {
        this.directionButtons.handleRelease();
    }

    update() {
        if (!this.isCleared) {
            this.audioManager.updateAudio(
                this.player.x,
                this.player.y,
                this.player.direction
            );
        }
        const direction = this.directionButtons.update();
        if (direction) {
            this.handleDirection(direction);
        }
        this.draw();
        requestAnimationFrame(this.update);
    }

    start() {
        this.audioManager.start();
        this.update();
    }

    stop() {
        this.audioManager.stop();
    }

    toggleSourceVisibility() {
        this.showSources = !this.showSources;
    }
}