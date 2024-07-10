import { Game } from './Game';
import { Room } from './Room';
import { Player } from './Player';
import { AudioSourcePath } from './AudioConstants';

export function createStage1(canvas: HTMLCanvasElement) {
    const roomWidth = 800;
    const roomHeight = 600;

    const walls = [
        // 外壁
        { x1: 0, y1: 0, x2: roomWidth, y2: 0 },
        { x1: roomWidth, y1: 0, x2: roomWidth, y2: roomHeight },
        { x1: roomWidth, y1: roomHeight, x2: 0, y2: roomHeight },
        { x1: 0, y1: roomHeight, x2: 0, y2: 0 },
        // 内部の壁
        { x1: 300, y1: 0, x2: 300, y2: 400 },
        { x1: 500, y1: 200, x2: 500, y2: 600 },
        { x1: 100, y1: 300, x2: 400, y2: 300 },
    ];

    const room = new Room(roomWidth, roomHeight, walls);
    const player = new Player(50, 50, 10, 5);

    const rectangularPath: AudioSourcePath = {
        points: [
            { x: 200, y: 100 },
            { x: 600, y: 100 },
            { x: 600, y: 500 },
            { x: 200, y: 500 },
        ],
        speed: 50
    };

    const audioSources = [
        { x: 700, y: 500, path: '/audio/source1.wav' },
        // { x: 200, y: 100, path: '/audio/source2.wav', movementPath: rectangularPath }
    ];

    const game = new Game(canvas, room, player, audioSources);
    return game;
}