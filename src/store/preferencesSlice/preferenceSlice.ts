import { createSlice } from '@reduxjs/toolkit';

interface Preferences {
  gameEvents: boolean;
  socialEvents: boolean;
  challengeEvents: boolean;
}

const initialState: Preferences = {
  gameEvents: true,
  socialEvents: true,
  challengeEvents: true,
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    toggleGameEvents: (state) => { state.gameEvents = !state.gameEvents; },
    toggleSocialEvents: (state) => { state.socialEvents = !state.socialEvents; },
    toggleChallengeEvents: (state) => { state.challengeEvents = !state.challengeEvents; },
  },
});

export const { toggleGameEvents, toggleSocialEvents, toggleChallengeEvents } = preferencesSlice.actions;
export default preferencesSlice.reducer;