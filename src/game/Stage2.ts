import { Game } from './Game';
import { Room } from './Room';
import { Player } from './Player';
import { AudioSourcePath } from './AudioConstants';

export function createStage2(canvas: HTMLCanvasElement, onStageComplete: () => void, isFinalStage: boolean, isPortrait: boolean) {
    const roomWidth = 1000;
    const roomHeight = 800;

    const walls = [
        // 外壁
        { x1: 0, y1: 0, x2: roomWidth, y2: 0 },
        { x1: roomWidth, y1: 0, x2: roomWidth, y2: roomHeight },
        { x1: roomWidth, y1: roomHeight, x2: 0, y2: roomHeight },
        { x1: 0, y1: roomHeight, x2: 0, y2: 0 },
        // 内部の壁
        { x1: 300, y1: 0, x2: 300, y2: 400 },
        { x1: 700, y1: 400, x2: 700, y2: 800 },
        { x1: 0, y1: 600, x2: 500, y2: 600 },
        { x1: 500, y1: 200, x2: 1000, y2: 200 },
    ];

    const room = new Room(roomWidth, roomHeight, walls);
    const player = new Player(50, 50, 10, 15);



    const audioSources = [
        { x: 900, y: 100, path: '/audio/dog_bark.mp3' },
    ];

    const game = new Game(canvas,
        room,
        player,
        audioSources,
        onStageComplete,
        isFinalStage,
        2, // ステージ番号
        "犬を探せ！", // ステージの指示
        isPortrait,
    );
    return game;
}