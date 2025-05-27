import { createSlice, PayloadAction } from '@reduxjs/toolkit';
interface TeamScoreState {
  playerTeam: 'red' | 'blue' | null;
  teamScores: { 
    red: number;
    blue: number;
  };
}

const initialState: TeamScoreState = {
  playerTeam: null,
  teamScores: { red: 0, blue: 0 },
};

const scoreSlice = createSlice({
  name: 'score',
  initialState,
  reducers: {
    setPlayerTeamChoice(state, action: PayloadAction<'red' | 'blue'>) {
      state.playerTeam = action.payload;
    },
    updateTeamScores(state, action: PayloadAction<{ red: number; blue: number }>) {
      state.teamScores = action.payload;
    },

  },
});

export const { setPlayerTeamChoice, updateTeamScores } = scoreSlice.actions;
export default scoreSlice.reducer;