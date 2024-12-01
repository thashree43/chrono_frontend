import { useState } from 'react';
import { Input, Button } from '@material-tailwind/react';
import Logo from '../assets/logo-svg.svg';
import { useLoginMutation } from '../api/Userapi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { setUserInfor, setUserToken } from '../api/authslice';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setEmailError('Invalid email address');
      return;
    }
    // Authenticate user
    console.log('Logging in with', { email, password });
    const response = await login({ email, password }).unwrap();
    console.log(response);

    if (response) {
      toast.success('user Logined successfully');
      localStorage.setItem('userInfo', JSON.stringify(response));
      dispatch(setUserInfor(response.user));
      dispatch(setUserToken(response.token));
      navigate('/');
      setEmail('');
      setPassword('');
      navigate('/home');
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://tecdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
          alt="Login background"
          className="w-full h-full object-cover opacity-30"
        />
      </div>

      {/* Login Form Container */}
      <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-sm shadow-2xl rounded-xl p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src={Logo} // Update with your logo path or URL
            alt="Logo"
            className="w-24 h-24 mx-auto mb-4"
          />
          <h2 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600">Please enter your credentials</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <Input
              variant="outlined"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError('');
              }}
              error={!!emailError}
              className="w-full"
              containerProps={{
                className: 'mb-2',
              }}
            />
            {emailError && (
              <p className="text-red-500 text-sm mb-2">{emailError}</p>
            )}
          </div>

          <div className="relative">
            <Input
              variant="outlined"
              label="Password"
              type={passwordVisible ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pr-10" // Add padding to the right for icon space
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
            >
              {passwordVisible ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 1l22 22M4.93 4.93c2.34 2.34 5.46 3.77 8.58 3.77s6.24-1.43 8.58-3.77c2.34-2.34 3.77-5.46 3.77-8.58s-1.43-6.24-3.77-8.58C15.67 1.43 12.55 0 9.43 0 6.31 0 3.19 1.43 0.85 4.27c-.63.84-.85 1.82-.85 2.73 0 .91.22 1.88.85 2.73C3.19 12.57 6.31 14 9.43 14c1.57 0 3.09-.34 4.46-.94M12 12h.01" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3C6.48 3 2 6.48 2 10s4.48 7 10 7 10-3.48 10-7-4.48-7-10-7zm0 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
                </svg>
              )}
            </button>
          </div>

          <a
            href="/reset-password"
            className="text-sm text-blue-500 hover:text-blue-700 mt-2 inline-block"
          >
            Forgot Password?
          </a>

          <Button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 transition-colors duration-300"
          >
            {isLoading ? <span>Sign in...</span> : 'Sign Up'}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Dont have an account?{' '}
              <a
                href="/signup"
                className="text-blue-500 hover:text-blue-700 font-semibold"
              >
                Sign Up
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
