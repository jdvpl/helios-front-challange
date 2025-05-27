import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { socket, connectSocket } from '@/services/sockets/socketClient';
import { GameNotification as GameNotificationType, PlayerPublicInfo } from '@/store/types';
import { setPlayerTeamChoice } from '@/store/scoreSlice/scoreSlice';
import { addNotification, markAllNotificationsAsRead } from '@/store/notificationSlice/notificationSlice';
import { resetFullLocalGameState, setMyGameRunningState, prepareForRetry } from '@/store/gameSlice/gameSlice';
import { nanoid } from 'nanoid';

import InGameView from '../Views/InGameView';
import JoinScreen from '../Views/JoinScreen';
import ScoreboardDisplay from '../Views/ScoreboardDisplay';
import PlayersListModal from '../Views/PlayersListModal';
import NotificationBellIcon from '../Notification/NotificationBellIcon';
import { NotificationList } from '../Notification/NotificationList';

import useSnakeSocketEvents from '../../hooks/useSnakeSocketEvents';

export default function SnakeArena() {
  const dispatch = useAppDispatch();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    mySnake, myFood, myGameBoard, isMyGameActive,
    localPlayerId, teamScores, allPlayersInfo
  } = useAppSelector((state) => state.game);
  const { playerTeam: localPlayerTeamChoice } = useAppSelector(state => state.score);
  const preferences = useAppSelector((state) => state.preferences);
  const notificationsFromStore = useAppSelector((state) => state.notification.items);

  const [playerNameFromInput, setPlayerNameFromInput] = useState(`Player_${nanoid(4)}`);
  const [isPlayerJoined, setIsPlayerJoined] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(socket.connected);
  const [showNotificationList, setShowNotificationList] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [showPlayersListModal, setShowPlayersListModal] = useState(false);
  const [gameWasPausedByModal, setGameWasPausedByModal] = useState(false);

  useEffect(() => {
    setUnreadNotificationCount(notificationsFromStore.filter(n => !n.isRead).length);
  }, [notificationsFromStore]);

  const dispatchNotification = useCallback((notificationData: Omit<GameNotificationType, 'id' | 'timestamp' | 'isRead'>) => {
    let shouldShowInList = false;
    const type = notificationData.type;
    const gameEventTypes = ['GAME_EVENT', 'GAME_OVER', 'ITEM_ACQUIRED', 'LEVEL_UP', 'PVP_DEFEAT', 'PVP_VICTORY'];
    const socialEventTypes = ['SOCIAL_INFO', 'FRIEND_REQUEST', 'FRIEND_ACCEPTED'];
    const challengeEventTypes = ['CHALLENGE_COMPLETED'];
    const directDisplayTypes = ['info', 'error', 'success'];

    if (gameEventTypes.includes(type) && preferences.gameEvents) shouldShowInList = true;
    else if (socialEventTypes.includes(type) && preferences.socialEvents) shouldShowInList = true;
    else if (challengeEventTypes.includes(type) && preferences.challengeEvents) shouldShowInList = true;
    else if (directDisplayTypes.includes(type)) shouldShowInList = true;

    if (shouldShowInList) {
      const newNotificationForList = { ...notificationData, id: nanoid(), timestamp: Date.now() };
      dispatch(addNotification(newNotificationForList));
    }
  }, [dispatch, preferences]);

  const handlePauseMyGameForModal = useCallback(() => {
    if (localPlayerId && socket.connected && isMyGameActive && mySnake && !mySnake.isPaused && !mySnake.isDefeated) {
      socket.emit('player:pause_my_game');
      dispatch(setMyGameRunningState({ isRunning: true, isPaused: true }));
      setGameWasPausedByModal(true);
      dispatchNotification({ type: 'info', message: "Game paused." });
    }
  }, [localPlayerId, isMyGameActive, mySnake, dispatch, dispatchNotification]);

  const handleResumeMyGameAfterModal = useCallback(() => {
    if (localPlayerId && socket.connected && mySnake && mySnake.isPaused && gameWasPausedByModal && !mySnake.isDefeated) {
      socket.emit('player:start_my_game');
      dispatch(setMyGameRunningState({ isRunning: true, isPaused: false }));
      dispatchNotification({ type: 'info', message: "Game resumed." });
    }
    setGameWasPausedByModal(false);
  }, [localPlayerId, mySnake, dispatch, gameWasPausedByModal, dispatchNotification]);

  const handleToggleNotificationList = useCallback(() => {
    setShowNotificationList(prev => {
      const newShowState = !prev;
      if (newShowState) {
        dispatch(markAllNotificationsAsRead());
        if (showPlayersListModal) setShowPlayersListModal(false);
        else if (isMyGameActive && mySnake && !mySnake.isPaused && !mySnake.isDefeated) handlePauseMyGameForModal();
      } else {
        if (!showPlayersListModal) handleResumeMyGameAfterModal();
      }
      return newShowState;
    });
  }, [dispatch, showPlayersListModal, handlePauseMyGameForModal, handleResumeMyGameAfterModal, isMyGameActive, mySnake]);

  const handleTogglePlayersListModal = useCallback(() => {
    setShowPlayersListModal(prev => {
      const newShowState = !prev;
      if (newShowState) {
        if (showNotificationList) setShowNotificationList(false);
        else if (isMyGameActive && mySnake && !mySnake.isPaused && !mySnake.isDefeated) handlePauseMyGameForModal();
      } else {
        if (!showNotificationList) handleResumeMyGameAfterModal();
      }
      return newShowState;
    });
  }, [showNotificationList, handlePauseMyGameForModal, handleResumeMyGameAfterModal, isMyGameActive, mySnake]);

  useSnakeSocketEvents({ dispatchNotification, setIsPlayerJoined });

  useEffect(() => {
    connectSocket();
    const updateConnectionStatus = () => {
      setIsSocketConnected(socket.connected);
      if (!socket.connected && isPlayerJoined) {
        setIsPlayerJoined(false);
        dispatch(resetFullLocalGameState());
        dispatchNotification({ type: 'error', message: "Disconnected from server." });
      }
    };
    socket.on('connect', updateConnectionStatus);
    socket.on('disconnect', updateConnectionStatus);
    updateConnectionStatus();

    return () => {
      socket.off('connect', updateConnectionStatus);
      socket.off('disconnect', updateConnectionStatus);
    }
  }, [isPlayerJoined, dispatch, dispatchNotification]);

  const handlePlayerNameChange = useCallback((newName: string) => setPlayerNameFromInput(newName), []);
  const handleTeamChange = useCallback((team: 'red' | 'blue') => dispatch(setPlayerTeamChoice(team)), [dispatch]);

  const handleJoinGame = useCallback(() => {
    if (playerNameFromInput.trim() && localPlayerTeamChoice && localPlayerId && socket.connected) {
      socket.emit('player:join_game', { name: playerNameFromInput, preferredTeam: localPlayerTeamChoice });
    } else {
      let errorMsg = "Cannot join: ";
      if (!playerNameFromInput.trim()) errorMsg += "Name required. ";
      if (!localPlayerTeamChoice) errorMsg += "Team required. ";
      if (!localPlayerId || !socket.connected) errorMsg += "Connection issue. ";
      dispatchNotification({ type: 'error', message: errorMsg });
    }
  }, [playerNameFromInput, localPlayerTeamChoice, localPlayerId, dispatchNotification]);

  const handleStartOrResumeMyGame = useCallback(() => {
    if (showNotificationList || showPlayersListModal) {
      dispatchNotification({ type: 'info', message: "Close open windows to start/resume game." });
      return;
    }
    if (localPlayerId && socket.connected) {
      if (mySnake && (mySnake.isDefeated || !isMyGameActive || mySnake.isPaused)) {
        socket.emit('player:start_my_game');
        dispatch(setMyGameRunningState({ isRunning: true, isPaused: false }));
      } else if (!mySnake && isPlayerJoined) {
        dispatchNotification({ type: 'info', message: "Waiting for game data... Click again if needed." });
      }
    } else {
      dispatchNotification({ type: 'error', message: "Cannot start/resume. Not connected or player ID missing." });
    }
  }, [localPlayerId, mySnake, isMyGameActive, dispatch, dispatchNotification, showNotificationList, showPlayersListModal, isPlayerJoined]);

  const handlePauseMyGame = useCallback(() => {
    if (localPlayerId && socket.connected && isMyGameActive && mySnake && !mySnake.isPaused && !mySnake.isDefeated) {
      socket.emit('player:pause_my_game');
      dispatch(setMyGameRunningState({ isRunning: true, isPaused: true }));
    }
  }, [localPlayerId, isMyGameActive, mySnake, dispatch]);

  const handleSendFriendRequest = useCallback((targetPlayer: PlayerPublicInfo) => {
    if (!localPlayerId || !playerNameFromInput.trim() || !targetPlayer) {
      dispatchNotification({ type: 'error', message: "Cannot send friend request: Your info or target info is missing." });
      return;
    }
    socket.emit('social:send_friend_request', {
      toPlayerId: targetPlayer.id,
      fromPlayerName: playerNameFromInput
    });
    dispatchNotification({ type: 'info', message: `Friend request sent to ${targetPlayer.name}.` });
    setShowPlayersListModal(false);
    handleResumeMyGameAfterModal();
  }, [localPlayerId, playerNameFromInput, dispatchNotification, handleResumeMyGameAfterModal]);

  const handleLeaveGame = useCallback(() => {
    setIsPlayerJoined(false);
    dispatch(resetFullLocalGameState());
  }, [dispatch]);

  useEffect(() => {
    const handleSpaceBar = (event: KeyboardEvent) => {
      if (showNotificationList || showPlayersListModal) return;
      if (event.code === 'Space' && isPlayerJoined && mySnake) {
        event.preventDefault();
        if (mySnake.isDefeated || !isMyGameActive || mySnake.isPaused) {
          handleStartOrResumeMyGame();
        }
      }
    };
    if (isPlayerJoined) {
      window.addEventListener('keydown', handleSpaceBar);
    }
    return () => {
      window.removeEventListener('keydown', handleSpaceBar);
    };
  }, [isPlayerJoined, mySnake, isMyGameActive, handleStartOrResumeMyGame, showNotificationList, showPlayersListModal]);


  if (!isPlayerJoined) {
    return (<JoinScreen playerName={playerNameFromInput} onPlayerNameChange={handlePlayerNameChange} preferredTeam={localPlayerTeamChoice} onTeamChange={handleTeamChange} onJoinGame={handleJoinGame} isSocketConnected={isSocketConnected} />);
  }

  if (!mySnake || !myGameBoard) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-white p-4">
        <h1 className="text-3xl font-bold mb-4">Loading Your Game Board...</h1>
        <p>Waiting for server data. If this persists, try rejoining.</p>
        <button onClick={handleLeaveGame} className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded text-white">
          Back to Join Screen
        </button>
      </div>
    );
  }

  const isSnakeCurrentlyPaused = mySnake.isPaused;
  const isSnakeCurrentlyDefeated = mySnake.isDefeated;
  const gameIsEffectivelyRunning = isMyGameActive && !isSnakeCurrentlyPaused && !isSnakeCurrentlyDefeated;

  const showStartButton = !isMyGameActive && !isSnakeCurrentlyDefeated && !isSnakeCurrentlyPaused;
  const showResumeButton = isMyGameActive && isSnakeCurrentlyPaused && !isSnakeCurrentlyDefeated;
  const showPauseButton = gameIsEffectivelyRunning;
  const showRetryButton = isSnakeCurrentlyDefeated;

  let mainActionButtonText = "Start My Game";
  let mainActionButtonColor = "bg-blue-500 hover:bg-blue-600";
  let mainActionButtonIsVisible = showStartButton;

  if (showResumeButton) {
    mainActionButtonText = "Resume Game"; mainActionButtonColor = "bg-green-500 hover:bg-green-600"; mainActionButtonIsVisible = true;
  } else if (showRetryButton) {
    mainActionButtonText = "Retry Game"; mainActionButtonColor = "bg-orange-500 hover:bg-orange-600"; mainActionButtonIsVisible = true;
  }

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden pt-16 md:pt-20 bg-gray-900">
      <ScoreboardDisplay
        teamScores={teamScores}
        allPlayersInfo={allPlayersInfo}
        localPlayerId={localPlayerId}
      />
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        <button onClick={handleTogglePlayersListModal} className="p-2 rounded-full hover:bg-gray-700 text-gray-300 focus:outline-none" title="Show Players List">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-3.741-1.5a3 3 0 00-3.741 1.5M15 11.973c0-1.231.996-2.227 2.227-2.227 1.096 0 2.044.686 2.193 1.641M5.25 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM3.25 19.125a7.125 7.125 0 0114.25 0v.003l-.001.118a12.735 12.735 0 01-14.248 0l-.001-.118A7.125 7.125 0 013.25 19.125z" />
          </svg>
        </button>
        <NotificationBellIcon onClick={handleToggleNotificationList} unreadCount={unreadNotificationCount} />
      </div>

      {showNotificationList && (
        <div className="absolute top-16 right-4 w-full max-w-xs sm:max-w-sm z-50 shadow-2xl">
          <NotificationList onClose={() => { setShowNotificationList(false); handleResumeMyGameAfterModal(); }} />
        </div>
      )}
      <PlayersListModal
        players={allPlayersInfo}
        localPlayerId={localPlayerId}
        onSendFriendRequest={handleSendFriendRequest}
        onClose={() => { setShowPlayersListModal(false); handleResumeMyGameAfterModal(); }}
        isVisible={showPlayersListModal}
      />

      <div className="flex-grow flex items-center justify-center w-full max-w-full max-h-[calc(100vh-100px)] md:max-h-[calc(100vh-120px)] p-2">
        <InGameView
          canvasRef={canvasRef} snake={mySnake} food={myFood} gameBoard={myGameBoard}
          isMyGameActive={gameIsEffectivelyRunning}
          showOverlayMessage={mySnake.isPaused ? "Game Paused (Press Space or Resume)" : showStartButton ? "Click 'Start My Game' or Press Space" : undefined}
          isDefeated={mySnake.isDefeated}
          onRetryGame={() => { dispatch(prepareForRetry()); }}
        />
      </div>

      <div className="flex-shrink-0 p-2 sm:p-3 flex flex-wrap justify-center items-center gap-2 sm:gap-3 z-20 w-full bg-gray-800 bg-opacity-75 fixed bottom-0 left-0 right-0">
        {mainActionButtonIsVisible && (
          <button onClick={handleStartOrResumeMyGame} className={`px-3 py-2 sm:px-4 sm:py-2 text-white font-semibold rounded-lg shadow-md ${mainActionButtonColor}`}>
            {mainActionButtonText}
          </button>
        )}
        {showPauseButton && (
          <button onClick={handlePauseMyGame} className="px-3 py-2 sm:px-4 sm:py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg shadow-md">
            Pause
          </button>
        )}
        <button onClick={handleLeaveGame} className="px-3 py-2 sm:px-4 sm:py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md">
          Leave Lobby
        </button>
      </div>
    </div>
  );
}