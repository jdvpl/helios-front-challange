export interface SnakeSegment {
  x: number;
  y: number;
}

export interface PlayerSnake {
  id: string;
  name: string;
  segments: SnakeSegment[];
  direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  color: string;
  team: 'red' | 'blue';
  score: number;
  isLocalPlayer?: boolean;
  isDefeated?: boolean;
  level?: number;
  isPaused?: boolean;
}

export interface FoodPellet {
  id: string;
  x: number;
  y: number;
  color: string;
  value?: number;
}

export interface GameBoard {
  width: number;
  height: number;
  gridSize: number;
}

export interface PlayerPublicInfo {
  id: string;
  name: string;
  team: 'red' | 'blue';
  score: number;
  level: number;
  isDefeated?: boolean;
  isPaused?: boolean;
}

export interface GameState {
  mySnake: PlayerSnake | null;
  myFood: FoodPellet | null;
  myGameBoard: GameBoard | null;
  isMyGameActive: boolean;
  localPlayerId: string | null;
  teamScores: { red: number; blue: number };
  allPlayersInfo: PlayerPublicInfo[];
}

export interface GameNotification {
  id: string;
  type: 'game' | 'social' | 'pvp' | 'FRIEND_ACCEPTED' |'challenge' | 'GAME_INVITE' | 'FRIEND_REQUEST' | 'GAME_EVENT' | 'GAME_OVER' | 'info' | 'error' | 'success' | 'ITEM_ACQUIRED' | 'LEVEL_UP' | 'PVP_DEFEAT' | 'PVP_VICTORY' | 'CHALLENGE_COMPLETED' | 'SOCIAL_INFO';
  message: string;
  timestamp: number;
  isRead: boolean;
  relatedEntityId?: string;
  details?: {
    fromPlayerId?: string;
    fromPlayerName?: string;
    [key: string]: any;
  };
  actions?: Array<{ label: string; onClickAction: string; payload?: any }>;
}