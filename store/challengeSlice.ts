import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { challengeAPI } from '../utils/api';

interface DayProgress {
  day: number;
  task: string;
  completed: boolean;
  scratched: boolean;
  completedAt: string | null;
}

interface Challenge {
  _id: string;
  userId: string;
  category: string;
  title: string;
  description: string;
  startDate: string;
  progress: DayProgress[];
  completedDays: number;
  status: 'active' | 'completed' | 'abandoned';
}

interface Suggestion {
  category: string;
  title: string;
  description: string;
  priority: string;
}

interface ChallengeState {
  challenges: Challenge[];
  activeChallenge: Challenge | null;
  suggestions: Suggestion[];
  loading: boolean;
  error: string | null;
}

const initialState: ChallengeState = {
  challenges: [],
  activeChallenge: null,
  suggestions: [],
  loading: false,
  error: null,
};

export const fetchSuggestions = createAsyncThunk(
  'challenge/fetchSuggestions',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await challengeAPI.getSuggestions(userId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch suggestions');
    }
  }
);

export const startChallenge = createAsyncThunk(
  'challenge/start',
  async (data: { userId: string; category: string }, { rejectWithValue }) => {
    try {
      const response = await challengeAPI.start(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start challenge');
    }
  }
);

export const fetchChallenges = createAsyncThunk(
  'challenge/fetchAll',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await challengeAPI.getAll(userId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch challenges');
    }
  }
);

export const completeDay = createAsyncThunk(
  'challenge/completeDay',
  async ({ challengeId, day, note }: { challengeId: string; day: number; note?: string }, { rejectWithValue }) => {
    try {
      const response = await challengeAPI.completeDay(challengeId, day, note);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to complete day');
    }
  }
);

const challengeSlice = createSlice({
  name: 'challenge',
  initialState,
  reducers: {
    setActiveChallenge: (state, action) => {
      state.activeChallenge = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuggestions.fulfilled, (state, action) => {
        state.suggestions = action.payload;
      })
      .addCase(startChallenge.pending, (state) => {
        state.loading = true;
      })
      .addCase(startChallenge.fulfilled, (state, action) => {
        state.loading = false;
        state.activeChallenge = action.payload;
        state.challenges.unshift(action.payload);
      })
      .addCase(startChallenge.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchChallenges.fulfilled, (state, action) => {
        state.challenges = action.payload;
        state.activeChallenge = action.payload.find((c: Challenge) => c.status === 'active') || null;
      })
      .addCase(completeDay.fulfilled, (state, action) => {
        state.activeChallenge = action.payload;
        const idx = state.challenges.findIndex((c) => c._id === action.payload._id);
        if (idx >= 0) {
          state.challenges[idx] = action.payload;
        }
      });
  },
});

export const { setActiveChallenge } = challengeSlice.actions;
export default challengeSlice.reducer;
