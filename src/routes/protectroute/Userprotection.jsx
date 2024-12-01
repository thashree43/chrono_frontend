// Updated Userprotection.js
import { useNavigate } from 'react-router-dom';
import { useGetToken } from '../../token/gettoken';
import { useEffect } from 'react';

// eslint-disable-next-line react/prop-types
const Userprotection = ({ component: Component }) => {
  const navigate = useNavigate();
  const token = useGetToken('jwt'); // Use 'jwt' instead of 'userToken'

  useEffect(() => {
    // If no JWT token exists, redirect to login page
    if (!token) {
      navigate('/');
    }
  }, [navigate, token]);

  // Render protected component only if token exists
  return token ? <Component /> : null;
};

export default Userprotection;
