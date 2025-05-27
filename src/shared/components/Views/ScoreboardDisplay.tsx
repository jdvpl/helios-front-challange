'use client';
import React from 'react';
import { PlayerPublicInfo } from '@/store/types';

interface ScoreboardDisplayProps {
  teamScores: { red: number; blue: number };
  allPlayersInfo: PlayerPublicInfo[];
  localPlayerId: string | null;
}

const ScoreboardDisplay: React.FC<ScoreboardDisplayProps> = ({ teamScores, allPlayersInfo, localPlayerId }) => {
  const localPlayerPublicInfo = allPlayersInfo.find(p => p.id === localPlayerId);

  return (
    <div className="absolute top-2 z-40 left-2 md:left-4 bg-gray-700 bg-opacity-80 p-3 rounded-lg shadow-lg text-white text-xs md:text-sm max-w-[calc(100vw-2rem)] sm:max-w-xs md:max-w-sm ">
      <h3 className="font-bold text-sm md:text-base mb-2 border-b border-gray-600 pb-1">Global Scores</h3>
      <div className="mb-2">
        <span className="font-semibold text-red-400">Red Team: {teamScores.red}</span> | <span className="font-semibold text-blue-400">Blue Team: {teamScores.blue}</span>
      </div>
      <h4 className="font-semibold mt-2 mb-1">Players Online: {allPlayersInfo.length}</h4>
      {localPlayerPublicInfo && (
        <div className="mt-2 pt-2 border-t border-gray-600 text-left">
          <p className="font-bold">You: {localPlayerPublicInfo.name} (Lvl {localPlayerPublicInfo.level})</p>
          <p>Your Score: {localPlayerPublicInfo.score} <span style={{ color: localPlayerPublicInfo.team === 'red' ? '#FCA5A5' : '#93C5FD' }}>({localPlayerPublicInfo.team})</span></p>
          {localPlayerPublicInfo.isDefeated && <p className="text-red-400 italic">You are defeated!</p>}
          {localPlayerPublicInfo.isPaused && !localPlayerPublicInfo.isDefeated && <p className="text-yellow-400 italic">Game Paused</p>}
        </div>
      )}
    </div>
  );
};

export default ScoreboardDisplay;