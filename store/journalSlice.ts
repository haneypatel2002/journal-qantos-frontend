import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { journalAPI } from '../utils/api';

interface JournalEntry {
  _id: string;
  userId: string;
  date: string;
  mood: string;
  content: string;
  timestamp: string;
}

interface MoodDataPoint {
  date: string;
  mood: string;
}

interface JournalState {
  entries: JournalEntry[];
  currentEntry: JournalEntry | null;
  moodData: MoodDataPoint[];
  selectedDate: string;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const today = new Date().toISOString().split('T')[0];

const initialState: JournalState = {
  entries: [],
  currentEntry: null,
  moodData: [],
  selectedDate: today,
  loading: false,
  saving: false,
  error: null,
};

export const saveEntry = createAsyncThunk(
  'journal/save',
  async (data: { userId: string; date: string; mood: string; content: string }, { rejectWithValue }) => {
    try {
      const response = await journalAPI.create(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save entry');
    }
  }
);

export const fetchEntries = createAsyncThunk(
  'journal/fetchAll',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await journalAPI.getAll(userId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch entries');
    }
  }
);

export const fetchEntryByDate = createAsyncThunk(
  'journal/fetchByDate',
  async ({ userId, date }: { userId: string; date: string }, { rejectWithValue }) => {
    try {
      const response = await journalAPI.getByDate(userId, date);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch entry');
    }
  }
);

export const fetchMoodData = createAsyncThunk(
  'journal/fetchMoodData',
  async ({ userId, months }: { userId: string; months?: number }, { rejectWithValue }) => {
    try {
      const response = await journalAPI.getMoodData(userId, months);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch mood data');
    }
  }
);

const journalSlice = createSlice({
  name: 'journal',
  initialState,
  reducers: {
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
      state.currentEntry = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveEntry.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveEntry.fulfilled, (state, action) => {
        state.saving = false;
        state.currentEntry = action.payload;
        // Update or add to entries list
        const idx = state.entries.findIndex((e) => e.date === action.payload.date);
        if (idx >= 0) {
          state.entries[idx] = action.payload;
        } else {
          state.entries.unshift(action.payload);
        }
      })
      .addCase(saveEntry.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })
      .addCase(fetchEntries.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload;
      })
      .addCase(fetchEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchEntryByDate.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEntryByDate.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEntry = action.payload;
      })
      .addCase(fetchEntryByDate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMoodData.fulfilled, (state, action) => {
        state.moodData = action.payload;
      });
  },
});

export const { setSelectedDate } = journalSlice.actions;
export default journalSlice.reducer;
