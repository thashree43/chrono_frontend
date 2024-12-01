import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userInfo: (() => {
    try {
      return JSON.parse(localStorage.getItem('userInfo')) || null;
    } catch {
      return null;
    }
  })(),
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserToken: (state, action) => {
      state.token = action.payload;
    },
    setUserInfor: (state, action) => {
      state.userInfo = action.payload;
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
      console.log('the data may her ');
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
      console.log('the data has added to  the localstorage ');
    },
    clearUserInfo(state) {
      state.userInfo = null;
      localStorage.removeItem('userInfo');
    },
    clearUserToken(state) {
      state.token = null;
    },
  },
});

export const { setUserToken, setUserInfor, clearUserInfo, clearUserToken } =
  authSlice.actions;
export default authSlice.reducer;
