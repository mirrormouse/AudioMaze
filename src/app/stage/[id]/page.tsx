'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createStage1 } from '@/game/Stage1';
import { createStage2 } from '@/game/Stage2';

export default function Stage({ params }: { params: { id: string } }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameStarted, setGameStarted] = useState(false);
    const gameRef = useRef<any>(null);

    useEffect(() => {
        if (canvasRef.current) {
            const stageId = parseInt(params.id);
            switch (stageId) {
                case 1:
                    gameRef.current = createStage1(canvasRef.current);
                    break;
                case 2:
                    gameRef.current = createStage2(canvasRef.current);
                    break;
                default:
                    console.error('Invalid stage ID');
            }
        }
    }, [params.id]);

    const handleStartGame = () => {
        if (gameRef.current) {
            gameRef.current.start();
            setGameStarted(true);
        }
    };

    return (
        <div className="min-h-screen bg-cream-100 p-8">
            <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">ステージ {params.id}</h1>
            <div className="bg-white rounded-lg shadow-md p-6">
                <canvas ref={canvasRef} />
                {!gameStarted && (
                    <button
                        onClick={handleStartGame}
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        ゲームを開始
                    </button>
                )}
                <p className="text-gray-600 mt-4">
                </p>
            </div>
            <Link href="/" className="mt-8 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                メインページに戻る
            </Link>
        </div>
    );
}