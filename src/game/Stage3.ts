import { Game } from './Game';
import { Room } from './Room';
import { Player } from './Player';
import { AudioSourcePath } from './AudioConstants';

export function createStage3(canvas: HTMLCanvasElement, onStageComplete: () => void, isFinalStage: boolean, isPortrait: boolean) {
    const roomWidth = 1200;
    const roomHeight = 1000;

    const walls = [
        // 外壁
        { x1: 0, y1: 0, x2: 1200, y2: 0 },
        { x1: 1200, y1: 0, x2: 1200, y2: 1000 },
        { x1: 1200, y1: 1000, x2: 0, y2: 1000 },
        { x1: 0, y1: 1000, x2: 0, y2: 0 },
        // 内部の壁
        { x1: 300, y1: 0, x2: 700, y2: 400 },
        { x1: 600, y1: 500, x2: 600, y2: 900 },
        { x1: 900, y1: 0, x2: 900, y2: 600 },
        { x1: 650, y1: 200, x2: 900, y2: 200 },
        { x1: 0, y1: 600, x2: 400, y2: 250 },
        { x1: 300, y1: 700, x2: 1200, y2: 700 },
    ];

    const room = new Room(roomWidth, roomHeight, walls);
    const player = new Player(50, 50, 10, 15);

    const audioSources = [
        { x: 700, y: 100, path: '/audio/water.mp3' },
    ];

    const game = new Game(canvas,
        room,
        player,
        audioSources,
        onStageComplete,
        isFinalStage,
        3, // ステージ番号
        "水滴を探せ！", // ステージの指示
        isPortrait,
    );
    return game;
}