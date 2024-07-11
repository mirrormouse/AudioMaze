import { Constants } from './Constants';
import { Room } from './Room';
import { Player } from './Player';

interface Point {
    x: number;
    y: number;
}

export class Renderer3D {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private wallIntersections: Point[] = [];

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
    }
    getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }
    resize(width: number, height: number) {
        this.canvas.width = width;
        this.canvas.height = height;
        // 必要に応じて、レンダリングパラメータを更新
    }


    render(room: Room, player: Player) {
        if (this.wallIntersections.length === 0) {
            this.calculateWallIntersections(room);
        }

        this.ctx.fillStyle = Constants.COLORS.CEILING;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height / 2);

        this.ctx.fillStyle = Constants.COLORS.FLOOR;
        this.ctx.fillRect(0, this.canvas.height / 2, this.canvas.width, this.canvas.height / 2);

        const rayCount = this.canvas.width;
        const fovRadians = (Constants.FIELD_OF_VIEW * Math.PI) / 180;
        const rayStep = fovRadians / rayCount;

        for (let i = 0; i < rayCount; i++) {
            const rayAngle = player.direction + fovRadians / 2 - rayStep * i;
            const { intersection, distance } = this.castRay(player.x, player.y, rayAngle, room);

            if (intersection) {
                const adjustedDistance = distance * Math.cos(rayAngle - player.direction);
                const wallHeight = (Constants.WALL_HEIGHT / adjustedDistance) * (this.canvas.height / 2);

                const colorFactor = Math.max(0, Math.min(1, 1 - adjustedDistance / Constants.MAX_RENDER_DISTANCE));
                const wallColor = this.interpolateColor(Constants.COLORS.WALL_FAR, Constants.COLORS.WALL_NEAR, colorFactor);

                this.ctx.fillStyle = wallColor;
                this.ctx.fillRect(
                    i,
                    this.canvas.height / 2 - wallHeight / 2,
                    1,
                    wallHeight
                );

                // 壁の境目を描画
                if (this.isNearWallIntersection(intersection, distance)) {
                    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(i, this.canvas.height / 2 - wallHeight / 2);
                    this.ctx.lineTo(i, this.canvas.height / 2 + wallHeight / 2);
                    this.ctx.stroke();
                }
            }
        }
    }

    private calculateWallIntersections(room: Room) {
        for (let i = 0; i < room.walls.length; i++) {
            for (let j = i + 1; j < room.walls.length; j++) {
                const intersection = this.getIntersection(
                    room.walls[i].x1, room.walls[i].y1, room.walls[i].x2, room.walls[i].y2,
                    room.walls[j].x1, room.walls[j].y1, room.walls[j].x2, room.walls[j].y2
                );
                if (intersection) {
                    this.wallIntersections.push(intersection);
                }
            }
        }
    }

    private isNearWallIntersection(point: Point, distance: number): boolean {
        const baseThreshold = 2.0; // 基本の閾値
        const dynamicThreshold = baseThreshold * (distance / 1000);
        return this.wallIntersections.some(intersection =>
            Math.abs(point.x - intersection.x) < dynamicThreshold &&
            Math.abs(point.y - intersection.y) < dynamicThreshold
        );
    }

    private castRay(x: number, y: number, angle: number, room: Room): { intersection: Point | null, distance: number } {
        const rayLength = Math.max(room.width, room.height);
        const endX = x + rayLength * Math.cos(angle);
        const endY = y - rayLength * Math.sin(angle);

        let closestIntersection = null;
        let minDistance = Infinity;

        room.walls.forEach(wall => {
            const intersection = this.getIntersection(x, y, endX, endY, wall.x1, wall.y1, wall.x2, wall.y2);
            if (intersection) {
                const distance = Math.sqrt((intersection.x - x) ** 2 + (intersection.y - y) ** 2);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestIntersection = intersection;
                }
            }
        });

        return { intersection: closestIntersection, distance: minDistance };
    }

    private getIntersection(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): Point | null {
        const den = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
        if (den === 0) return null;

        const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / den;
        const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / den;

        if (ua < 0 || ua > 1 || ub < 0 || ub > 1) return null;

        return {
            x: x1 + ua * (x2 - x1),
            y: y1 + ua * (y2 - y1),
        };
    }

    private interpolateColor(color1: string, color2: string, factor: number): string {
        const r1 = parseInt(color1.slice(1, 3), 16);
        const g1 = parseInt(color1.slice(3, 5), 16);
        const b1 = parseInt(color1.slice(5, 7), 16);

        const r2 = parseInt(color2.slice(1, 3), 16);
        const g2 = parseInt(color2.slice(3, 5), 16);
        const b2 = parseInt(color2.slice(5, 7), 16);

        const r = Math.round(r1 + factor * (r2 - r1));
        const g = Math.round(g1 + factor * (g2 - g1));
        const b = Math.round(b1 + factor * (b2 - b1));

        return `rgb(${r}, ${g}, ${b})`;
    }
}