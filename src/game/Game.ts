import { AudioManager } from './AudioManager';
import { Room } from './Room';
import { Player } from './Player';
import { AudioSourcePath } from './AudioConstants';
import { Renderer3D } from './Renderer3D';

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

    constructor(canvas: HTMLCanvasElement, room: Room, player: Player, audioSources: AudioSourceData[]) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.room = room;
        this.player = player;
        this.audioSources = audioSources;

        // キャンバスのサイズを調整
        this.canvas.width = 1200; // 全体の幅を増やす
        this.canvas.height = 600;

        this.audioManager = new AudioManager(this.room);
        audioSources.forEach(source => {
            this.audioManager.addSource(source.x, source.y, source.path, source.movementPath);
        });

        // 3Dレンダラーの初期化（3D表示用のキャンバス）
        const canvas3D = document.createElement('canvas');
        canvas3D.width = 800; // 3D表示の幅
        canvas3D.height = 600;
        this.renderer3D = new Renderer3D(canvas3D);

        // 2Dマップ用のキャンバスを作成
        this.map2DCanvas = document.createElement('canvas');
        this.map2DCanvas.width = 300; // 2Dマップの幅を増やす
        this.map2DCanvas.height = 300; // 2Dマップの高さも増やす
        this.map2DCtx = this.map2DCanvas.getContext('2d')!;

        window.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    private handleKeyDown(e: KeyboardEvent) {
        const moveSpeed = 1;
        const rotateSpeed = Math.PI / 18; // 10度（π/18ラジアン）

        switch (e.key) {
            case 'ArrowUp':
                this.player.move(
                    Math.cos(this.player.direction) * moveSpeed,
                    -Math.sin(this.player.direction) * moveSpeed,
                    this.room
                );
                break;
            case 'ArrowDown':
                this.player.move(
                    -Math.cos(this.player.direction) * moveSpeed,
                    Math.sin(this.player.direction) * moveSpeed,
                    this.room
                );
                break;
            case 'ArrowLeft':
                this.player.rotate(rotateSpeed);
                break;
            case 'ArrowRight':
                this.player.rotate(-rotateSpeed);
                break;
        }
    }

    private updateAudio() {
        this.audioManager.updateAudio(
            this.player.x,
            this.player.y,
            this.player.direction
        );
    }

    private draw() {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 3D表示の描画
        this.renderer3D.render(this.room, this.player);
        this.ctx.drawImage(this.renderer3D.canvas, 0, 0);

        // 2Dマップの描画
        this.map2DCtx.clearRect(0, 0, this.map2DCanvas.width, this.map2DCanvas.height);
        const scale = this.map2DCanvas.width / this.room.width;
        this.room.draw(this.map2DCtx, scale);
        this.player.draw(this.map2DCtx, scale);

        // 音源の描画
        this.audioSources.forEach((source, index) => {
            const currentPosition = this.audioManager.getSourcePosition(index);
            if (currentPosition) {
                this.map2DCtx.fillStyle = 'red';
                this.map2DCtx.beginPath();
                this.map2DCtx.arc(
                    currentPosition.x * scale,
                    currentPosition.y * scale,
                    4, // 音源の点の大きさを少し大きくする
                    0,
                    Math.PI * 2
                );
                this.map2DCtx.fill();
            }
        });

        // 2Dマップを3D表示の右側に配置
        this.ctx.drawImage(this.map2DCanvas, 850, 50);
    }

    update() {
        this.updateAudio();
        this.draw();
        requestAnimationFrame(this.update.bind(this));
    }

    start() {
        this.audioManager.start();
        this.update();
    }

    stop() {
        this.audioManager.stop();
    }
}