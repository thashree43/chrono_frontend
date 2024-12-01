import { useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import { extractToken } from './extracttoken';

const getCookieByName = (name) => {
  const cookieMatch = document.cookie.match(`(^|;)\\s*${name}=([^;]+)`);
  return cookieMatch ? decodeURIComponent(cookieMatch[2]) : undefined;
};

export const useGetToken = (name) => {
  try {
    const token = useSelector((state) => state.user.token);

    if (token) {
      return extractToken(token);
    }

    const cookieToken = Cookies.get(name) || getCookieByName(name);
    if (!cookieToken) {
      return null;
    }

    return extractToken(cookieToken);
  } catch (error) {
    console.error('Error in useGetToken:', error);
    return null;
  }
};
