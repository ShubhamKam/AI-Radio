import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import playerReducer from './slices/playerSlice';
import contentReducer from './slices/contentSlice';
import radioReducer from './slices/radioSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    player: playerReducer,
    content: contentReducer,
    radio: radioReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
