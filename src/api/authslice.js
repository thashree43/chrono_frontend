import { createSlice } from '@reduxjs/toolkit';

const getUserInfoFromStorage = () => {
  try {
    const storedUserInfo = localStorage.getItem('userInfo');
    return storedUserInfo ? JSON.parse(storedUserInfo) : null;
  } catch {
    return null;
  }
};

const getTokenFromStorage = () => {
  try {
    return localStorage.getItem('token') || null;
  } catch {
    return null;
  }
};

const initialState = {
  userInfo: getUserInfoFromStorage(),
  token: getTokenFromStorage(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserToken: (state, action) => {
      state.token = action.payload;
      try {
        localStorage.setItem('token', action.payload);
      } catch (error) {
        console.error('Error storing token', error);
      }
    },

    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
      try {
        localStorage.setItem('userInfo', JSON.stringify(action.payload));
      } catch (error) {
        console.error('Error storing user info', error);
      }
    },

    clearUserInfo: (state) => {
      state.userInfo = null;
      try {
        localStorage.removeItem('userInfo');
      } catch (error) {
        console.error('Error removing user info', error);
      }
    },

    clearUserToken: (state) => {
      state.token = null;
      try {
        localStorage.removeItem('token');
      } catch (error) {
        console.error('Error removing token', error);
      }
    },

    logout: (state) => {
      state.userInfo = null;
      state.token = null;
      try {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
      } catch (error) {
        console.error('Error during logout', error);
      }
    }
  },
});

export const { 
  setUserToken, 
  setUserInfo, 
  clearUserInfo, 
  clearUserToken,
  logout 
} = authSlice.actions;

export default authSlice.reducer;