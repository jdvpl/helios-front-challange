import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameNotification } from '../types'; 

interface NotificationState {
  items: GameNotification[];
}

const initialState: NotificationState = {
  items: [],
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<GameNotification, 'isRead'>>) => {
      const newNotification: GameNotification = {
        ...action.payload,
        isRead: false,
      };
      state.items.unshift(newNotification);
      if (state.items.length > 30) {
        state.items.pop();
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.items.forEach(item => {
        item.isRead = true;
      });
    },
    clearAllNotifications: (state) => {
      state.items = [];
    },
    processAndRemoveActionedNotification: (state, action: PayloadAction<{ notificationId: string; actionType: string }>) => {
      const { notificationId, actionType } = action.payload;
      const index = state.items.findIndex(n => n.id === notificationId);
      if (index !== -1) {
        state.items[index].isRead = true;

        const singleActionTypes = ["ACCEPT_FRIEND", "DECLINE_FRIEND", "ACCEPT_GAME_INVITE", "DECLINE_GAME_INVITE"];
        if (singleActionTypes.includes(actionType)) {
          state.items.splice(index, 1);
        }
      }
    }
  },
});

export const {
  addNotification,
  markAllNotificationsAsRead,
  clearAllNotifications,
  processAndRemoveActionedNotification
} = notificationSlice.actions;

export default notificationSlice.reducer;