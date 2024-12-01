import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import Logo from '../assets/logo-svg.svg';
import { useRegiterpostMutation } from '../api/userApi';
import PasswordStrengthField from '../reusablecomponent/Passwordfield';
import Otp from './Otp';

export const RegistrationForm = () => {
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [registerUser, { isLoading }] = useRegiterpostMutation();

  const [showPasswordField, setShowPasswordField] = useState(false);

  const validationSchema = Yup.object().shape({
    username: Yup.string()
      .min(3, 'Name must be at least 3 characters')
      .max(50, 'Name must be at most 50 characters')
      .required('Name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    mobile: Yup.string()
      .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
      .required('Phone number is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Password must include uppercase, lowercase, number, and special character'
      )
      .required('Password is required'),
  });

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      mobile: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = {
          username: values.username,
          email: values.email,
          mobile: values.mobile,
          password: values.password,
        };

        const response = await registerUser(formData).unwrap();
        console.log(response, 'Registration successful');

        setUserEmail(values.email);
        setShowOtpModal(true);
        resetForm();
        setShowPasswordField(false);
      } catch (error) {
        toast.error(error?.data?.message || 'Registration Failed');
        console.error('Registration Error:', error);
      }
    },
  });

  return (
    <div className="relative h-[100vh] items-center flex justify-center px-5 lg:px-0">
      {showOtpModal ? (
        <div className="fixed inset-0 flex items-center justify-center bg-white">
          <Otp email={userEmail} onClose={() => setShowOtpModal(false)} />
        </div>
      ) : (
        <div className="max-w-screen-xl bg-white border shadow sm:rounded-lg flex justify-center flex-1">
          <div className="flex-1 bg-blue-900 text-center hidden md:flex">
            <div
              className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(https://tecdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp)`,
              }}
            ></div>
          </div>
          <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
            <div className="flex flex-col items-center">
              <div className="mb-6">
                <img src={Logo} alt="Logo" className="w-24 h-24 mx-auto mb-4" />
              </div>

              <div className="text-center">
                <h1 className="text-2xl xl:text-4xl font-extrabold text-blue-900">
                  Sign up
                </h1>
                <p className="text-[12px] text-gray-500">
                  Hey, enter your details to create your account
                </p>
              </div>

              <div className="w-full flex-1 mt-8">
                <form
                  onSubmit={formik.handleSubmit}
                  className="mx-auto max-w-xs flex flex-col gap-4"
                >
                  {/* Input Fields */}
                  <div>
                    <input
                      className={`w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border ${
                        formik.touched.username && formik.errors.username
                          ? 'border-red-500'
                          : 'border-gray-200'
                      } placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white`}
                      type="text"
                      name="username"
                      placeholder="Enter your name"
                      {...formik.getFieldProps('username')}
                    />
                    {formik.touched.username && formik.errors.username && (
                      <div className="text-red-500 text-xs mt-1">
                        {formik.errors.username}
                      </div>
                    )}
                  </div>

                  <div>
                    <input
                      className={`w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border ${
                        formik.touched.email && formik.errors.email
                          ? 'border-red-500'
                          : 'border-gray-200'
                      } placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white`}
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      {...formik.getFieldProps('email')}
                    />
                    {formik.touched.email && formik.errors.email && (
                      <div className="text-red-500 text-xs mt-1">
                        {formik.errors.email}
                      </div>
                    )}
                  </div>

                  <div>
                    <input
                      className={`w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border ${
                        formik.touched.mobile && formik.errors.mobile
                          ? 'border-red-500'
                          : 'border-gray-200'
                      } placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white`}
                      type="tel"
                      name="mobile"
                      placeholder="Enter your phone"
                      {...formik.getFieldProps('mobile')}
                    />
                    {formik.touched.mobile && formik.errors.mobile && (
                      <div className="text-red-500 text-xs mt-1">
                        {formik.errors.mobile}
                      </div>
                    )}
                  </div>

                  <div>
                    {showPasswordField ? (
                      <PasswordStrengthField
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={(e) => {
                          formik.handleBlur(e);
                          if (formik.values.password === '') {
                            setShowPasswordField(false);
                          }
                        }}
                        error={
                          formik.touched.password && formik.errors.password
                        }
                      />
                    ) : (
                      <input
                        className={`w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border ${
                          formik.touched.password && formik.errors.password
                            ? 'border-red-500'
                            : 'border-gray-200'
                        } placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white`}
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        onFocus={() => setShowPasswordField(true)}
                        {...formik.getFieldProps('password')}
                      />
                    )}
                    {formik.touched.password && formik.errors.password && (
                      <div className="text-red-500 text-xs mt-1">
                        {formik.errors.password}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-5 tracking-wide font-semibold bg-blue-900 text-gray-100 w-full py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none disabled:opacity-50"
                  >
                    {isLoading ? <span>Registering...</span> : 'Sign Up'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationForm;
