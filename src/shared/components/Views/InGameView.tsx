'use client';
import React, { useRef, useEffect, useCallback } from 'react';
import { PlayerSnake, FoodPellet, GameBoard } from '@/store/types';
import { socket } from '@/services/sockets/socketClient';

interface InGameViewProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  snake: PlayerSnake;
  food: FoodPellet | null;
  gameBoard: GameBoard;
  isMyGameActive: boolean;
  showOverlayMessage?: string; 
  isDefeated?: boolean; 
  onRetryGame?: () => void; 
}

const FOOD_COLOR = '#FF6347';

export default function InGameView({
  canvasRef, snake, food, gameBoard, isMyGameActive,
  showOverlayMessage, isDefeated, onRetryGame
}: InGameViewProps) {

  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isMyGameActive) return; 

    let direction: PlayerSnake['direction'] | null = null;
    switch (event.key.toLowerCase()) {
      case 'arrowup': case 'w': direction = 'UP'; break;
      case 'arrowdown': case 's': direction = 'DOWN'; break;
      case 'arrowleft': case 'a': direction = 'LEFT'; break;
      case 'arrowright': case 'd': direction = 'RIGHT'; break;
    }
    if (direction) {
      event.preventDefault();
      socket.emit('player:change_direction', { direction });
    }
  }, [isMyGameActive]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);


  const shadeColor = (color: string, percent: number): string => {
    if (!color || typeof color !== 'string' || !color.startsWith('#') || (color.length !== 7 && color.length !== 4)) {
      return '#CCCCCC';
    }
    let R = parseInt(color.length === 4 ? color.substring(1, 2) + color.substring(1, 2) : color.substring(1, 3), 16);
    let G = parseInt(color.length === 4 ? color.substring(2, 3) + color.substring(2, 3) : color.substring(3, 5), 16);
    let B = parseInt(color.length === 4 ? color.substring(3, 4) + color.substring(3, 4) : color.substring(5, 7), 16);
    R = Math.floor(R * (100 + percent) / 100); G = Math.floor(G * (100 + percent) / 100); B = Math.floor(B * (100 + percent) / 100);
    R = (R < 255) ? R : 255; G = (G < 255) ? G : 255; B = (B < 255) ? B : 255;
    R = (R > 0) ? R : 0; G = (G > 0) ? G : 0; B = (B > 0) ? B : 0;
    return "#" + ("0" + R.toString(16)).slice(-2) + ("0" + G.toString(16)).slice(-2) + ("0" + B.toString(16)).slice(-2);
  };

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (canvas && container && gameBoard) {
      const containerPadding = 16;
      const availableWidth = container.clientWidth - containerPadding;
      const availableHeight = container.clientHeight - containerPadding;

      const maxCellSizeByWidth = Math.floor(availableWidth / gameBoard.width);
      const maxCellSizeByHeight = Math.floor(availableHeight / gameBoard.height);

      const optimalCellSize = Math.max(10, Math.min(maxCellSizeByWidth, maxCellSizeByHeight, gameBoard.gridSize));

      canvas.width = gameBoard.width * optimalCellSize;
      canvas.height = gameBoard.height * optimalCellSize;
    }
  }, [canvasRef, containerRef, gameBoard]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameBoard || !snake) {
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          if (!canvas.width || !canvas.height) {
            const parent = canvas.parentElement;
            canvas.width = parent?.clientWidth ? parent.clientWidth - 20 : 300;
            canvas.height = parent?.clientHeight ? parent.clientHeight - 20 : 200;
          }
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#121826';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.font = "16px Arial";
          ctx.fillStyle = "rgba(255,255,255,0.7)";
          ctx.textAlign = "center";
          ctx.fillText(showOverlayMessage || "Loading game board...", canvas.width / 2, canvas.height / 2);
        }
      }
      return;
    }

    const optimalGridSize = canvas.width / gameBoard.width;
    const context = canvas.getContext('2d');
    if (!context) return;
    contextRef.current = context;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#121826';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = '#374151';
    context.lineWidth = 1;
    for (let x = 0; x <= gameBoard.width; x++) {
      context.beginPath(); context.moveTo(x * optimalGridSize, 0);
      context.lineTo(x * optimalGridSize, canvas.height); context.stroke();
    }
    for (let y = 0; y <= gameBoard.height; y++) {
      context.beginPath(); context.moveTo(0, y * optimalGridSize);
      context.lineTo(canvas.width, y * optimalGridSize); context.stroke();
    }

    if (snake.segments) {
      context.globalAlpha = snake.isDefeated ? 0.4 : (isMyGameActive ? 1 : 0.6);
      snake.segments.forEach((segment, index) => {
        context.fillStyle = index === 0 ? shadeColor(snake.color, -20) : snake.color;
        context.fillRect(
          segment.x * optimalGridSize + 1, segment.y * optimalGridSize + 1,
          optimalGridSize - 2, optimalGridSize - 2
        );
        if (index === 0 && !snake.isDefeated) {
          context.fillStyle = 'white';
          const eyeSize = optimalGridSize / 7;
          const headX = segment.x * optimalGridSize; const headY = segment.y * optimalGridSize;
          let eye1X = 0, eye1Y = 0, eye2X = 0, eye2Y = 0;
          const offset1 = optimalGridSize * 0.25;
          const offset2 = optimalGridSize * 0.75 - eyeSize;

          switch (snake.direction) {
            case 'UP': eye1X = headX + offset1; eye1Y = headY + offset1; eye2X = headX + offset2; eye2Y = headY + offset1; break;
            case 'DOWN': eye1X = headX + offset1; eye1Y = headY + offset2; eye2X = headX + offset2; eye2Y = headY + offset2; break;
            case 'LEFT': eye1X = headX + offset1; eye1Y = headY + offset1; eye2X = headX + offset1; eye2Y = headY + offset2; break;
            case 'RIGHT': default: eye1X = headX + offset2; eye1Y = headY + offset1; eye2X = headX + offset2; eye2Y = headY + offset2; break;
          }
          context.beginPath(); context.arc(eye1X + eyeSize / 2, eye1Y + eyeSize / 2, eyeSize / 1.5, 0, 2 * Math.PI); context.fill();
          context.beginPath(); context.arc(eye2X + eyeSize / 2, eye2Y + eyeSize / 2, eyeSize / 1.5, 0, 2 * Math.PI); context.fill();
        }
      });
      context.globalAlpha = 1;
    }

    if (food) {
      context.fillStyle = food.color || FOOD_COLOR;
      context.beginPath();
      context.arc(
        food.x * optimalGridSize + optimalGridSize / 2,
        food.y * optimalGridSize + optimalGridSize / 2,
        optimalGridSize / 2.5, 0, 2 * Math.PI
      );
      context.fill();
      context.strokeStyle = shadeColor(food.color || FOOD_COLOR, -25);
      context.lineWidth = 1.5; context.stroke();
    }
  }, [snake, food, gameBoard, canvasRef, isMyGameActive, resizeCanvas, showOverlayMessage]);


  return (
    <div ref={containerRef} className="relative flex flex-col items-center justify-center w-full h-full"> {/* Contenedor para el canvas */}
      <canvas
        ref={canvasRef}
        className="border-2 border-gray-600 rounded-lg shadow-xl bg-gray-800"
      ></canvas>
      {(showOverlayMessage && !isDefeated) && ( 
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 z-20 text-white pointer-events-none">
          <p className="text-xl sm:text-2xl font-bold mb-4">{showOverlayMessage}</p>
        </div>
      )}
      {isDefeated && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm z-30">
          <div className="text-center p-4 sm:p-6 md:p-8 bg-gray-700 rounded-xl shadow-xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-yellow-400">
              You have been defeated!
            </h2>
            {snake && <p className="text-base sm:text-lg md:text-xl mb-3 sm:mb-4 md:mb-6 text-gray-300">
              Final Score: {snake.score}, Level Reached: {snake.level}.
            </p>}
            {onRetryGame && ( 
              <button onClick={onRetryGame} className="px-3 py-2 sm:px-5 sm:py-3 bg-green-600 hover:bg-green-500 rounded-lg text-sm sm:text-md md:text-lg font-semibold">
                Back to Join Screen
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}