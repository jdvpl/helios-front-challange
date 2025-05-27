'use client';
import React from 'react';
import { PlayerPublicInfo } from '@/store/types';

interface PlayersListModalProps {
  players: PlayerPublicInfo[];
  localPlayerId: string | null;
  onSendFriendRequest: (targetPlayer: PlayerPublicInfo) => void;
  onClose: () => void;
  isVisible: boolean;
}

const PlayersListModal: React.FC<PlayersListModalProps> = ({ players, localPlayerId, onSendFriendRequest, onClose, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40 p-4 backdrop-blur-sm">
      <div className="bg-gray-800 border border-gray-700 p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-600">
          <h3 className="text-lg font-semibold text-green-400">Players Online</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        {players.length > 0 ? (
          <ul className="overflow-y-auto space-y-2 flex-grow pr-2">
            {players.map(p => (
              <li key={p.id} className={`flex justify-between items-center p-2 rounded-md text-sm ${p.id === localPlayerId ? 'bg-green-700 bg-opacity-30' : 'bg-gray-700 hover:bg-gray-600'}`}>
                <div className="text-white">
                  {p.name} <span style={{ color: p.team === 'red' ? '#FCA5A5' : '#93C5FD' }}>({p.team})</span>
                  <span className="block text-xs text-gray-400">
                    Lvl: {p.level}, Score: {p.score} 
                    {p.isDefeated ? ' (Defeated)' : (p.isPaused ? ' (Paused)' : '')}
                  </span>
                </div>
                {p.id !== localPlayerId && (
                  <button 
                    onClick={() => onSendFriendRequest(p)} 
                    className="px-2.5 py-1 text-xs bg-purple-600 hover:bg-purple-700 rounded text-white transition-colors flex-shrink-0"
                  >
                    Add Friend
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-center py-4">No other players currently in game.</p>
        )}
      </div>
    </div>
  );
};

export default PlayersListModal;