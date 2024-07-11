import { Constants } from './Constants';

export class DirectionButtons {
    private ctx: CanvasRenderingContext2D;
    private width: number = 0;
    private height: number = 0;
    private buttonSize: number = 60;
    private buttonPadding: number = 10;
    private pressedButton: string | null = null;
    private pressStartTime: number = 0;
    private lastRepeatTime: number = 0;


    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
    }

    draw(width: number, height: number) {
        this.width = width;
        this.height = height;
        const centerX = width / 2;
        const bottomY = height - this.buttonPadding;

        // console.log(centerX, bottomY);


        // 上ボタン
        this.drawTriangleButton(centerX, bottomY - this.buttonSize * 1.6, 0);
        // 左ボタン
        this.drawTriangleButton(centerX - this.buttonSize, bottomY - this.buttonSize, -Math.PI / 2);
        // 下ボタン
        this.drawTriangleButton(centerX, bottomY - this.buttonSize * 0.4, Math.PI);
        // 右ボタン
        this.drawTriangleButton(centerX + this.buttonSize, bottomY - this.buttonSize, Math.PI / 2);
    }

    private drawTriangleButton(x: number, y: number, rotation: number) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(rotation);

        this.ctx.beginPath();
        this.ctx.moveTo(0, -this.buttonSize / 2);
        this.ctx.lineTo(-this.buttonSize / 2, this.buttonSize / 2);
        this.ctx.lineTo(this.buttonSize / 2, this.buttonSize / 2);
        this.ctx.closePath();

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fill();

        this.ctx.restore();
    }

    handleClick(x: number, y: number): string | null {
        const centerX = this.width / 2;
        const bottomY = this.height - this.buttonPadding;

        // 上ボタン
        if (this.isPointInTriangle(x, y, centerX, bottomY - this.buttonSize * 1.6, 0)) {
            return 'up';
        }
        // 左ボタン
        else if (this.isPointInTriangle(x, y, centerX - this.buttonSize, bottomY - this.buttonSize, -Math.PI / 2)) {
            return 'left';
        }
        // 下ボタン
        else if (this.isPointInTriangle(x, y, centerX, bottomY - this.buttonSize * 0.4, Math.PI)) {
            return 'down';
        }
        // 右ボタン
        else if (this.isPointInTriangle(x, y, centerX + this.buttonSize, bottomY - this.buttonSize, Math.PI / 2)) {
            return 'right';
        }

        return null;
    }

    private isPointInTriangle(px: number, py: number, cx: number, cy: number, rotation: number): boolean {
        const halfSize = this.buttonSize / 2;

        // 点を三角形の中心を原点とする座標系に変換
        const dx = px - cx;
        const dy = py - cy;

        // 回転を逆に適用
        const rotatedX = Math.cos(-rotation) * dx - Math.sin(-rotation) * dy;
        const rotatedY = Math.sin(-rotation) * dx + Math.cos(-rotation) * dy;

        // 三角形の内部判定
        return rotatedY > -halfSize &&
            rotatedY < halfSize &&
            rotatedX > -halfSize &&
            rotatedX < halfSize &&
            rotatedY < rotatedX + halfSize &&
            rotatedY < -rotatedX + halfSize;
    }

    resize(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    handlePress(x: number, y: number): string | null {
        const direction = this.handleClick(x, y);
        if (direction) {
            this.pressedButton = direction;
            this.pressStartTime = Date.now();
            this.lastRepeatTime = this.pressStartTime;
        }
        return direction;
    }

    handleRelease() {
        this.pressedButton = null;
    }

    update(): string | null {


        if (!this.pressedButton) return null;


        const currentTime = Date.now();
        const pressDuration = currentTime - this.pressStartTime;

        if (pressDuration >= Constants.BUTTON_LONG_PRESS_DELAY) {

            if (currentTime - this.lastRepeatTime >= Constants.BUTTON_REPEAT_INTERVAL) {

                this.lastRepeatTime = currentTime;
                return this.pressedButton;
            }
        }

        return null;
    }


}