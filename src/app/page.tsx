'use client';
import dynamic from 'next/dynamic';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { toggleGameEvents, toggleSocialEvents, toggleChallengeEvents } from '@/store/preferencesSlice/preferenceSlice';

const SnakeArenaGame = dynamic(() => import('@/shared/components/Game/SnakeArena'), {
  ssr: false,
  loading: () => <p className="text-white text-center text-xl mt-10">Loading Snake Arena...</p>
});

export default function Home() {
  const dispatch = useAppDispatch();
  const preferences = useAppSelector((state) => state.preferences);

  return (
    <main className="h-screen w-screen flex flex-col items-center justify-center bg-gray-900 text-white relative overflow-hidden">
      <SnakeArenaGame />

      <div className="absolute bottom-4 right-4 z-20 p-3 bg-gray-700 bg-opacity-80 rounded-lg text-white text-xs shadow-lg">
        <h4 className="font-bold mb-2 text-sm">Notification Preferences:</h4>
        <label className="flex items-center gap-2 cursor-pointer mb-1">
          <input type="checkbox" checked={preferences.gameEvents} onChange={() => dispatch(toggleGameEvents())} className="form-checkbox h-4 w-4 text-blue-400 rounded bg-gray-600 border-gray-500 focus:ring-blue-500" />
          Game Events
        </label>
        <label className="flex items-center gap-2 cursor-pointer mb-1">
          <input type="checkbox" checked={preferences.socialEvents} onChange={() => dispatch(toggleSocialEvents())} className="form-checkbox h-4 w-4 text-green-400 rounded bg-gray-600 border-gray-500 focus:ring-green-500" />
          Social Events
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={preferences.challengeEvents} onChange={() => dispatch(toggleChallengeEvents())} className="form-checkbox h-4 w-4 text-yellow-400 rounded bg-gray-600 border-gray-500 focus:ring-yellow-500" />
          Challenge Events
        </label>
      </div>
    </main>
  );
}