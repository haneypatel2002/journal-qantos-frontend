import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { userAPI } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserState {
  id: string | null;
  name: string;
  streakCount: number;
  lastEntryDate: string | null;
  entryCount: number;
  moodDistribution: Array<{ _id: string; count: number }>;
  isOnboarded: boolean;
  theme: 'dark' | 'light';
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  id: null,
  name: '',
  streakCount: 0,
  lastEntryDate: null,
  entryCount: 0,
  moodDistribution: [],
  isOnboarded: false,
  theme: 'dark',
  loading: false,
  error: null,
};

export const createUser = createAsyncThunk(
  'user/create',
  async (name: string, { rejectWithValue }) => {
    try {
      const response = await userAPI.create(name);
      await AsyncStorage.setItem('userId', response.data._id);
      await AsyncStorage.setItem('userName', response.data.name);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create user');
    }
  }
);

export const fetchUser = createAsyncThunk(
  'user/fetch',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await userAPI.get(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  }
);

export const loadStoredUser = createAsyncThunk(
  'user/loadStored',
  async (_, { rejectWithValue }) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const userName = await AsyncStorage.getItem('userName');
      const theme = await AsyncStorage.getItem('theme') as 'dark' | 'light' | null;
      
      return { 
        id: userId, 
        name: userName, 
        theme: theme || 'dark' 
      };
    } catch (error: any) {
      return rejectWithValue('Failed to load stored user');
    }
  }
);

export const updateUser = createAsyncThunk(
  'user/update',
  async ({ id, name }: { id: string; name: string }, { rejectWithValue }) => {
    try {
      const response = await userAPI.update(id, { name });
      await AsyncStorage.setItem('userName', response.data.name);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user');
    }
  }
);

export const deleteUserAccount = createAsyncThunk(
  'user/delete',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      await userAPI.delete(id);
      dispatch(clearUser());
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete account');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser: (state) => {
      state.id = null;
      state.name = '';
      state.isOnboarded = false;
      state.streakCount = 0;
      state.entryCount = 0;
      state.moodDistribution = [];
      AsyncStorage.removeItem('userId');
      AsyncStorage.removeItem('userName');
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem('theme', state.theme);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.id = action.payload._id;
        state.name = action.payload.name;
        state.streakCount = action.payload.streakCount || 0;
        state.isOnboarded = true;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.id = action.payload._id;
        state.name = action.payload.name;
        state.streakCount = action.payload.streakCount || 0;
        state.lastEntryDate = action.payload.lastEntryDate;
        state.entryCount = action.payload.entryCount || 0;
        state.moodDistribution = action.payload.moodDistribution || [];
        state.isOnboarded = true;
      })
      .addCase(loadStoredUser.fulfilled, (state, action) => {
        if (action.payload.id && action.payload.name) {
          state.id = action.payload.id;
          state.name = action.payload.name || '';
          state.isOnboarded = true;
        }
        state.theme = (action.payload.theme as 'dark' | 'light') || 'dark';
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.name = action.payload.name;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUser, toggleTheme } = userSlice.actions;
export default userSlice.reducer;
