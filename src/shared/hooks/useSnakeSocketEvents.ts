import { useEffect } from 'react';
import { useAppDispatch } from '@/store/store';
import { socket } from '@/services/sockets/socketClient';
import {
  GameNotification as GameNotificationType,
  PlayerSnake,
  FoodPellet,
  PlayerPublicInfo,
  GameBoard,
} from '@/store/types';
import {
  setLocalPlayerId,
  updateMyIndividualGameState,
  updateSharedGameState,
  setMyPlayerDefeated,
  setMyGameRunningState,
} from '@/store/gameSlice/gameSlice';

interface BackendJoinedSuccessfullyPayload {
  playerId: string;
  name: string;
  team: 'red' | 'blue';
  color: string;
}

interface BackendIndividualStatePayload {
  snake: PlayerSnake;
  food: FoodPellet | null;
  gameBoard: GameBoard;
}

interface BackendSharedStatePayload {
  teamScores: { red: number; blue: number };
  activePlayers: PlayerPublicInfo[];
}

interface BackendPlayerDefeatedPayload {
  reason?: string;
  finalScore?: number;
  levelReached?: number;
}

interface UseSnakeSocketEventsProps {
  dispatchNotification: (
    notificationData: Omit<GameNotificationType, 'id' | 'timestamp' | 'isRead'>
  ) => void;
  setIsPlayerJoined: (isJoined: boolean) => void;
}

export default function useSnakeSocketEvents({
  dispatchNotification,
  setIsPlayerJoined,
}: UseSnakeSocketEventsProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const onConnect = () => {
      if (socket.id) {
        dispatch(setLocalPlayerId(socket.id));
      }
    };

    const onGameJoinedSuccessfully = (data: BackendJoinedSuccessfullyPayload) => {
      if (data.playerId === socket.id) {
        setIsPlayerJoined(true);
        dispatch(setMyGameRunningState({ isRunning: false, isPaused: false }));
        dispatchNotification({
          type: 'success',
          message: `Welcome, ${data.name}! Click 'Start My Game' or press Spacebar when ready.`,
        });
      }
    };

    const onGameJoinFailed = (data: { message: string }) => {
      dispatchNotification({
        type: 'error',
        message: `Could not join: ${data.message}`,
      });
      setIsPlayerJoined(false);
    };

    const onYourGameStateUpdate = (data: BackendIndividualStatePayload) => {
      dispatch(updateMyIndividualGameState(data));
    };

    const onSharedGameStateUpdate = (data: BackendSharedStatePayload) => {
      dispatch(updateSharedGameState(data));
    };

    const onYouAreDefeated = (data: BackendPlayerDefeatedPayload) => {
      dispatch(setMyPlayerDefeated(data));
    };

    const onServerNotification = (
      notif: Omit<GameNotificationType, 'id' | 'timestamp' | 'isRead'> & {
        details?: any;
      }
    ) => {
      const newNotif = { ...notif };
      const fromPlayerId = notif.details?.fromPlayerId;
      const fromPlayerName = notif.details?.fromPlayerName || notif.details?.playerName;

      if (newNotif.type === 'FRIEND_REQUEST' && fromPlayerName && fromPlayerId) {
        newNotif.actions = [
          {
            label: 'Accept',
            onClickAction: 'ACCEPT_FRIEND',
            payload: { friendId: fromPlayerId, fromPlayerName },
          },
          {
            label: 'Decline',
            onClickAction: 'DECLINE_FRIEND',
            payload: { friendId: fromPlayerId, fromPlayerName },
          },
        ];
      }

      dispatchNotification(newNotif);
    };

    const onInfoMessage = (data: { message: string; title?: string }) => {
      dispatchNotification({
        type: 'info',
        message: data.message,
        details: { title: data.title || 'Info' },
      });
    };

    const onErrorMessage = (data: { message: string; event?: string; title?: string }) => {
      dispatchNotification({
        type: 'error',
        message: data.message || 'An error occurred on the server.',
        details: { title: data.title || 'Error' },
      });
    };

    socket.on('connect', onConnect);
    socket.on('game:joined_successfully', onGameJoinedSuccessfully);
    socket.on('game:join_failed', onGameJoinFailed);
    socket.on('game:your_state', onYourGameStateUpdate);
    socket.on('game:shared_state', onSharedGameStateUpdate);
    socket.on('player:you_are_defeated', onYouAreDefeated);
    socket.on('notification:new', onServerNotification);
    socket.on('info', onInfoMessage);
    socket.on('error', onErrorMessage);

    return () => {
      socket.off('connect', onConnect);
      socket.off('game:joined_successfully', onGameJoinedSuccessfully);
      socket.off('game:join_failed', onGameJoinFailed);
      socket.off('game:your_state', onYourGameStateUpdate);
      socket.off('game:shared_state', onSharedGameStateUpdate);
      socket.off('player:you_are_defeated', onYouAreDefeated);
      socket.off('notification:new', onServerNotification);
      socket.off('info', onInfoMessage);
      socket.off('error', onErrorMessage);
    };
  }, [dispatch, dispatchNotification, setIsPlayerJoined]);
}
