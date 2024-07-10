import { Room } from './Room';

export class Player {
    x: number;
    y: number;
    radius: number;
    speed: number;
    direction: number;

    constructor(x: number, y: number, radius: number, speed: number) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = speed;
        this.direction = 0;
    }

    move(dx: number, dy: number, room: Room) {
        const newX = this.x + dx * this.speed;
        const newY = this.y + dy * this.speed;

        if (newX - this.radius < 0 || newX + this.radius > room.width ||
            newY - this.radius < 0 || newY + this.radius > room.height) {
            return; // 部屋の境界外への移動を防ぐ
        }

        if (room.isPathClear(this.x, this.y, newX, newY)) {
            this.x = newX;
            this.y = newY;
        }

    }

    rotate(angle: number) {
        this.direction += angle;
        this.direction = (this.direction + 2 * Math.PI) % (2 * Math.PI);
    }

    draw(ctx: CanvasRenderingContext2D, scale: number = 1) {
        const scaledX = this.x * scale;
        const scaledY = this.y * scale;
        const scaledRadius = this.radius * scale;

        // プレイヤーの円を描画
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.arc(scaledX, scaledY, scaledRadius, 0, Math.PI * 2);
        ctx.fill();

        // プレイヤーの向きを示す矢印を描画
        ctx.fillStyle = 'black';
        ctx.beginPath();
        const arrowLength = scaledRadius * 2;
        const arrowWidth = scaledRadius * 1;

        const tipX = scaledX + Math.cos(this.direction) * arrowLength;
        const tipY = scaledY - Math.sin(this.direction) * arrowLength;

        ctx.moveTo(tipX, tipY);
        ctx.lineTo(
            tipX - Math.cos(this.direction + Math.PI / 6) * arrowWidth,
            tipY + Math.sin(this.direction + Math.PI / 6) * arrowWidth
        );
        ctx.lineTo(
            tipX - Math.cos(this.direction - Math.PI / 6) * arrowWidth,
            tipY + Math.sin(this.direction - Math.PI / 6) * arrowWidth
        );
        ctx.closePath();
        ctx.fill();
    }
}