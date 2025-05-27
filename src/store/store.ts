import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import preferenceReducer from './preferencesSlice/preferenceSlice';
import notificationReducer from './notificationSlice/notificationSlice';
import scoreReducer from './scoreSlice/scoreSlice';
import gameReducer from './gameSlice/gameSlice';

export const store = configureStore({
  reducer: {
    preferences: preferenceReducer,
    notification: notificationReducer,
    score: scoreReducer,
    game: gameReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;