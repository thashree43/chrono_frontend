import { combineReducers, configureStore } from '@reduxjs/toolkit';
import userReducer from './api/authslice.js';
import { UserApislice } from './api/userApi.jsx';

const rootreducer = combineReducers({
  user: userReducer,
  [UserApislice.reducerPath]: UserApislice.reducer,
});

export const Store = configureStore({
  reducer: rootreducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(UserApislice.middleware),
});
