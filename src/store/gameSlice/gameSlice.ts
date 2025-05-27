import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameState, PlayerSnake, FoodPellet, GameBoard, PlayerPublicInfo } from '../types';

const initialGameBoardConfig: GameBoard = { width: 20, height: 15, gridSize: 20 };

const initialState: GameState = {
  mySnake: null,
  myFood: null,
  myGameBoard: initialGameBoardConfig, 
  isMyGameActive: false, 
  localPlayerId: null,
  teamScores: { red: 0, blue: 0 },
  allPlayersInfo: [],
};

interface BackendIndividualStatePayload {
  snake: PlayerSnake; 
  food: FoodPellet | null;
  gameBoard: GameBoard; 
}

interface BackendSharedStatePayload {
    teamScores: { red: number, blue: number };
    activePlayers: PlayerPublicInfo[];
}

interface BackendPlayerDefeatedPayload { 
    reason?: string;
    finalScore?: number;
    levelReached?: number;
}

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setLocalPlayerId(state, action: PayloadAction<string | null>) {
      state.localPlayerId = action.payload;
      if (!action.payload) { 
        state.mySnake = null;
        state.myFood = null;
        state.myGameBoard = initialGameBoardConfig;
        state.isMyGameActive = false;
      }
    },
    updateMyIndividualGameState(state, action: PayloadAction<BackendIndividualStatePayload>) {
      const backendSnake = action.payload.snake;
      const wasPaused = state.mySnake?.isPaused ?? false;

      state.mySnake = { 
        ...backendSnake, 
        isLocalPlayer: backendSnake.id === state.localPlayerId,
        isPaused: backendSnake.isPaused !== undefined ? backendSnake.isPaused : wasPaused, 
      };
      state.myFood = action.payload.food;
      state.myGameBoard = action.payload.gameBoard;
      if (state.mySnake.isDefeated) {
          state.isMyGameActive = false;
      } else if (state.mySnake.isPaused) {
          state.isMyGameActive = false;
      }

    },
    updateSharedGameState(state, action: PayloadAction<BackendSharedStatePayload>) {
      state.teamScores = action.payload.teamScores;
      state.allPlayersInfo = action.payload.activePlayers;
    },
    setMyPlayerDefeated(state, action: PayloadAction<BackendPlayerDefeatedPayload>) {
      if (state.mySnake) {
        state.mySnake.isDefeated = true;
        state.mySnake.isPaused = false; 
        if (action.payload.finalScore !== undefined) state.mySnake.score = action.payload.finalScore;
        if (action.payload.levelReached !== undefined) state.mySnake.level = action.payload.levelReached;
      }
      state.isMyGameActive = false; 
    },
    setMyGameRunningState(state, action: PayloadAction<{ isRunning: boolean, isPaused?: boolean}>) {
        const { isRunning, isPaused } = action.payload;
        
        if (state.mySnake) {
            state.mySnake.isPaused = isPaused ?? false;
            if (isRunning && !state.mySnake.isPaused) {
                state.isMyGameActive = true;
                state.mySnake.isDefeated = false; 
            } else { 
                state.isMyGameActive = false;
            }
        } else {
            state.isMyGameActive = false; 
        }
    },
    prepareForRetry(state) { 
      if(state.mySnake) {
          state.mySnake.isDefeated = false; 
          state.mySnake.isPaused = false;
      }
      state.isMyGameActive = false; 
      state.myFood = null; 
    },
    resetFullLocalGameState(state) { 
        state.mySnake = null;
        state.myFood = null;
        state.myGameBoard = initialGameBoardConfig; 
        state.isMyGameActive = false;
    }
  },
});

export const {
  setLocalPlayerId,
  updateMyIndividualGameState,
  updateSharedGameState,
  setMyPlayerDefeated,
  setMyGameRunningState, 
  prepareForRetry,
  resetFullLocalGameState, 
} = gameSlice.actions;
export default gameSlice.reducer;