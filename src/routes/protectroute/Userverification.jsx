import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useGetToken } from '../../token/gettoken';

// eslint-disable-next-line react/prop-types
const Userverificationroute = ({ component: Component }) => {
  const navigate = useNavigate();
  const token = useGetToken('jwt'); // Fetch token from cookies

  useEffect(() => {
    if (token) {
      navigate('/home'); // Redirect to home if token exists
    }
  }, [navigate, token]);

  return token ? null : <Component />;
};

export default Userverificationroute;
