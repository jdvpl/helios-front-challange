'use client';
import React from 'react';

interface JoinScreenProps {
  playerName: string;
  onPlayerNameChange: (name: string) => void;
  preferredTeam: 'red' | 'blue' | null;
  onTeamChange: (team: 'red' | 'blue') => void;
  onJoinGame: () => void;
  isSocketConnected: boolean;
}

const JoinScreen: React.FC<JoinScreenProps> = ({
  playerName, onPlayerNameChange, preferredTeam, onTeamChange, onJoinGame, isSocketConnected
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white p-4">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 text-green-400 text-center">Snake Arena - Individual Boards</h1>
      <div className="bg-gray-700 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md">
        <div className="mb-4">
          <label htmlFor="playerNameGlobal" className="block text-lg mb-1 text-gray-300">Your Name:</label>
          <input
            id="playerNameGlobal"
            type="text"
            value={playerName}
            onChange={(e) => onPlayerNameChange(e.target.value)}
            maxLength={20}
            className="w-full p-3 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="mb-6">
          <p className="text-lg mb-2 text-gray-300">Choose Your Team:</p>
          <div className="flex gap-4">
            <button
              onClick={() => onTeamChange('red')}
              className={`flex-1 p-3 rounded-md font-semibold transition-all ${preferredTeam === 'red' ? 'bg-red-500 ring-2 ring-red-400' : 'bg-red-700 hover:bg-red-600'}`}
            >
              Red
            </button>
            <button
              onClick={() => onTeamChange('blue')}
              className={`flex-1 p-3 rounded-md font-semibold transition-all ${preferredTeam === 'blue' ? 'bg-blue-500 ring-2 ring-blue-400' : 'bg-blue-700 hover:bg-blue-600'}`}
            >
              Blue
            </button>
          </div>
        </div>
        <button
          onClick={onJoinGame}
          disabled={!playerName.trim() || !preferredTeam || !isSocketConnected}
          className="w-full p-4 bg-green-600 hover:bg-green-500 rounded-md text-xl font-bold transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isSocketConnected ? "Join Game Lobby" : "Connecting..."}
        </button>
        {!isSocketConnected && <p className="text-xs text-yellow-400 mt-2 text-center">Attempting to connect...</p>}
      </div>
    </div>
  );
};

export default JoinScreen;