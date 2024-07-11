export class Room {
    width: number;
    height: number;
    walls: { x1: number; y1: number; x2: number; y2: number }[];

    constructor(width: number, height: number, walls: { x1: number; y1: number; x2: number; y2: number }[]) {
        this.width = width;
        this.height = height;
        this.walls = walls;
    }


    draw(ctx: CanvasRenderingContext2D, scale: number = 1) {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3 * scale;  // 線の太さを調整
        ctx.beginPath();
        this.walls.forEach(wall => {
            ctx.moveTo(wall.x1 * scale, wall.y1 * scale);
            ctx.lineTo(wall.x2 * scale, wall.y2 * scale);
        });
        ctx.stroke();
    }

    isPathClear(x1: number, y1: number, x2: number, y2: number): boolean {
        return !this.lineIntersectsAnyWall(x1, y1, x2, y2);
    }

    lineIntersectsAnyWall(x1: number, y1: number, x2: number, y2: number): boolean {
        return this.walls.some(wall => this.lineIntersectsWall(x1, y1, x2, y2, wall));
    }

    private lineIntersectsWall(x1: number, y1: number, x2: number, y2: number, wall: { x1: number; y1: number; x2: number; y2: number }): boolean {
        const det = (x2 - x1) * (wall.y2 - wall.y1) - (y2 - y1) * (wall.x2 - wall.x1);
        if (det === 0) return false;
        const lambda = ((wall.y2 - wall.y1) * (wall.x2 - x1) + (wall.x1 - wall.x2) * (wall.y2 - y1)) / det;
        const gamma = ((y1 - y2) * (wall.x2 - x1) + (x2 - x1) * (wall.y2 - y1)) / det;
        return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }

    countWallsBetween(x1: number, y1: number, x2: number, y2: number): number {
        return this.walls.filter(wall => this.lineIntersectsWall(x1, y1, x2, y2, wall)).length;
    }
}