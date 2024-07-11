'use client';
import React, { useState, useEffect, useRef } from 'react';
import { createStage1 } from '@/game/Stage1';
import { createStage2 } from '@/game/Stage2';
import '@/styles/App.css';

const App: React.FC = () => {
    const [currentStage, setCurrentStage] = useState(1);
    const [isGameActive, setIsGameActive] = useState(false);
    const [gameSize, setGameSize] = useState({ width: 1200, height: 600 });
    const [isPortrait, setIsPortrait] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const totalStages = 3; // 全ステージ数

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.clientWidth;
                const containerHeight = containerRef.current.clientHeight;
                const newIsPortrait = containerHeight > containerWidth;

                setIsPortrait(newIsPortrait);

                let newWidth, newHeight;
                if (newIsPortrait) {
                    newWidth = containerWidth;
                    newHeight = containerHeight;
                } else {
                    if (containerWidth / containerHeight > 2) {
                        newHeight = containerHeight;
                        newWidth = newHeight * 2;
                    } else {
                        newWidth = containerWidth;
                        newHeight = newWidth / 2;
                    }
                }

                setGameSize({ width: newWidth, height: newHeight });
                if (gameRef.current) {
                    gameRef.current.resize(newWidth, newHeight, newIsPortrait);
                }
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // 初期サイズの設定

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (isGameActive && canvasRef.current && !gameRef.current) {
            const onStageComplete = () => {
                if (currentStage < totalStages) {
                    setCurrentStage(prev => prev + 1);
                } else {
                    setIsGameActive(false);
                }
            };

            const isFinalStage = currentStage === totalStages;

            switch (currentStage) {
                case 1:
                    gameRef.current = createStage1(canvasRef.current, onStageComplete, isFinalStage, isPortrait);
                    break;
                case 2:
                    gameRef.current = createStage2(canvasRef.current, onStageComplete, isFinalStage, isPortrait);
                    break;
                // ... 他のステージ
            }

            gameRef.current.start();
            gameRef.current.resize(gameSize.width, gameSize.height, isPortrait);
        }

        return () => {
            if (gameRef.current) {
                gameRef.current.stop();
                gameRef.current = null;
            }
        };
    }, [isGameActive, currentStage]);

    // }, [isGameActive, currentStage, isPortrait, gameSize]);

    const handleMakeGuess = () => {
        if (gameRef.current) {
            gameRef.current.makeGuess();
        }
    };

    const handleReturnToMenu = () => {
        setIsGameActive(false);
        setCurrentStage(1);
        if (gameRef.current) {
            gameRef.current.stop();
            gameRef.current = null;
        }
    };

    const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        // console.log('click', event.clientX, event.clientY);
        if (gameRef.current) {
            const rect = canvasRef.current!.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            gameRef.current.handleClick(x, y);
            gameRef.current.handleDirectionButtonClick(x, y);
        }
    };

    const handleCanvasRelease = () => {
        console.log('release');
        if (gameRef.current) {
            gameRef.current.handleRelease();
        }
    };

    return (
        <div ref={containerRef} className="game-container">
            {!isGameActive ? (
                <div className="start-screen">
                    <h1 className="game-title">音源探索ゲーム</h1>
                    <button
                        className="start-button"
                        onClick={() => setIsGameActive(true)}
                    >
                        ゲームスタート
                    </button>
                </div>
            ) : (
                <div className={`game-screen ${isPortrait ? 'portrait' : 'landscape'}`} style={{ width: `${gameSize.width}px`, height: `${gameSize.height}px` }}>
                    <canvas
                        ref={canvasRef}
                        width={gameSize.width}
                        height={gameSize.height}
                        onMouseDown={handleCanvasClick}
                        onMouseUp={handleCanvasRelease}
                        onMouseLeave={handleCanvasRelease}
                        onTouchStart={(e) => handleCanvasClick(e.touches[0] as any)}
                        onTouchEnd={handleCanvasRelease}
                    />
                    <div className="controls">
                        <div className="map-container">
                            {/* 2Dマップはゲーム内で描画されるため、ここでは何も表示しません */}
                        </div>
                        <div className="buttons">
                            <button
                                className="game-button decision-button"
                                onClick={handleMakeGuess}
                            >
                                決定
                            </button>
                            <button
                                className="game-button menu-button"
                                onClick={handleReturnToMenu}
                            >
                                メニューに戻る
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;