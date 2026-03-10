import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import journalReducer from './journalSlice';
import challengeReducer from './challengeSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    journal: journalReducer,
    challenge: challengeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
