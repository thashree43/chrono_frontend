import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useVerifyOtpMutation, useResendOtpMutation } from '../api/userApi';
import Modal from '../reusablecomponent/Modal';

// eslint-disable-next-line react/prop-types
const Otp = ({ email }) => {
  const [otp, setOtp] = useState({
    otp1: '',
    otp2: '',
    otp3: '',
    otp4: '',
  });
  const [otpErrors, setOtpErrors] = useState({});
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
  });
  const [counter, setCounter] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [isOtpExpired, setIsOtpExpired] = useState(false);

  const [verifyOtp] = useVerifyOtpMutation();
  const [resendOtp] = useResendOtpMutation();
  const navigate = useNavigate();

  // Timer effect
  useEffect(() => {
    const timer =
      counter > 0 && setTimeout(() => setCounter(counter - 1), 1000);

    // When timer reaches 0, mark OTP as expired
    if (counter === 0) {
      setIsResendDisabled(false);
      setIsOtpExpired(true);
    }

    return () => clearTimeout(timer);
  }, [counter]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validate input is a single digit
    if (/^\d?$/.test(value)) {
      setOtp((prev) => ({ ...prev, [name]: value }));

      // Clear any previous error for this field
      setOtpErrors((prev) => ({ ...prev, [name]: '' }));

      // Auto-focus to next input if current input is filled
      const nextInput = document.getElementById(
        `otp${parseInt(name.slice(-1)) + 1}`
      );
      if (value && nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if OTP is expired
    if (isOtpExpired) {
      toast.error('OTP has expired. Please resend OTP.');
      return;
    }

    // Validate OTP
    const errors = {};
    Object.keys(otp).forEach((key) => {
      if (!otp[key]) {
        errors[key] = 'This field is required';
      }
    });

    if (Object.keys(errors).length > 0) {
      setOtpErrors(errors);
      return;
    }

    try {
      // Send OTP verification request with individual OTP fields
      const response = await verifyOtp({
        email,
        otp1: otp.otp1,
        otp2: otp.otp2,
        otp3: otp.otp3,
        otp4: otp.otp4,
      }).unwrap();

      toast.success(response.message);
      navigate('/'); // Redirect to login after successful verification
    } catch (error) {
      toast.error(error?.data?.message || 'Verification failed');
    }
  };

  const handleResend = async () => {
    // If OTP is not expired, prevent resending
    if (!isOtpExpired) {
      toast.warning('Please wait until OTP expires.');
      return;
    }

    try {
      // Call resend OTP API
      const response = await resendOtp({ email }).unwrap();

      // Reset timer and state
      setCounter(60);
      setIsResendDisabled(true);
      setIsOtpExpired(false);

      // Clear previous OTP inputs
      setOtp({
        otp1: '',
        otp2: '',
        otp3: '',
        otp4: '',
      });

      // Show success modal
      setModalState({
        isOpen: true,
        title: 'OTP Resent',
        message: response.message || 'A new OTP has been sent to your email.',
      });

      // Reset error states
      setOtpErrors({});
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to resend OTP');
    }
  };

  const handleModalClose = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };
  console.log(isResendDisabled, 'isresnddiasbled');

  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gray-50 py-12">
      <div className="relative bg-white px-6 pt-10 pb-9 shadow-xl mx-auto w-full max-w-lg rounded-2xl">
        <div className="mx-auto flex w-full max-w-md flex-col space-y-16">
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <div className="font-semibold text-3xl">
              <p>Email Verification</p>
            </div>
            <div className="flex flex-row text-sm font-medium text-gray-400">
              <p>We have sent a code to your email {email}</p>
            </div>
            {isOtpExpired && (
              <div className="text-red-500 text-sm">
                OTP has expired. Please resend.
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col space-y-16">
              <div className="flex flex-row items-center justify-between mx-auto w-full max-w-xs">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="w-16 h-16">
                    <input
                      className={`w-full h-full flex flex-col items-center justify-center text-center px-5 outline-none rounded-xl border ${
                        otpErrors[`otp${index + 1}`]
                          ? 'border-red-500'
                          : 'border-gray-200'
                      } text-lg bg-white focus:bg-gray-50 focus:ring-1 ring-blue-700`}
                      type="text"
                      maxLength="1"
                      name={`otp${index + 1}`}
                      id={`otp${index + 1}`}
                      value={otp[`otp${index + 1}`]}
                      onChange={handleChange}
                      disabled={isOtpExpired}
                    />
                    {otpErrors[`otp${index + 1}`] && (
                      <p className="text-red-500 text-xs mt-1">
                        {otpErrors[`otp${index + 1}`]}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-col space-y-5">
                <button
                  type="submit"
                  className={`flex flex-row items-center justify-center text-center w-full border rounded-xl outline-none py-5 ${
                    isOtpExpired
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-700 border-none text-white'
                  } text-sm shadow-sm`}
                  disabled={isOtpExpired}
                >
                  Verify Account
                </button>

                <div className="flex flex-row items-center justify-center text-center text-sm font-medium space-x-1 text-gray-500">
                  <p>Didnt receive code?</p>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={!isOtpExpired}
                    className={`flex flex-row items-center ${
                      !isOtpExpired
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-blue-600'
                    }`}
                  >
                    Resend
                    {!isOtpExpired && (
                      <span className="ml-2">
                        (00:{counter < 10 ? `0${counter}` : counter})
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <Modal
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        title={modalState.title}
        message={modalState.message}
      />
    </div>
  );
};

export default Otp;
