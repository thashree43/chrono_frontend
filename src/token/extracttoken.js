import Cookies from 'js-cookie';

export const extractToken = (token) => {
  if (!token) {
    return null;
  }

  try {
    const tokenPart = token.split('.')[1];
    if (!tokenPart) {
      console.error('Invalid token format');
      return null;
    }

    const decodedToken = JSON.parse(atob(tokenPart));

    if (decodedToken.exp * 1000 < Date.now()) {
      Cookies.remove('jwt');
      return null;
    }

    return decodedToken;
  } catch (error) {
    console.error('Token decoding error:', error);
    return null;
  }
};
