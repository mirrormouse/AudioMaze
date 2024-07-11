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
    const player = new Player(50, 50, 10, 5);

    const circularPath: AudioSourcePath = {
        points: Array.from({ length: 60 }, (_, i) => {
            const angle = (i / 60) * Math.PI * 2;
            return {
                x: 500 + Math.cos(angle) * 200,
                y: 400 + Math.sin(angle) * 200
            };
        }),
        speed: 100 // ピクセル/秒
    };

    const audioSources = [
        { x: 900, y: 700, path: '/audio/source1.wav' },
        { x: 100, y: 700, path: '/audio/source2.wav' },
        { x: 500, y: 400, path: '/audio/source3.wav', movementPath: circularPath }
    ];

    const game = new Game(canvas,
        room,
        player,
        audioSources,
        onStageComplete,
        isFinalStage,
        2, // ステージ番号
        "音源を探せ！", // ステージの指示
        isPortrait,
    );
    return game;
}