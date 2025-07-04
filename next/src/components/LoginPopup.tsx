"use client";

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { FaTimes, FaMobile, FaKey } from 'react-icons/fa';

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (userData: { name?: string; mobile?: string }) => void;
}

interface MobileFormInputs {
  mobile: string;
}

export default function LoginPopup({ isOpen, onClose, onLoginSuccess }: LoginPopupProps) {
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);

  const mobileForm = useForm<MobileFormInputs>();

  const handleMobileSubmit: SubmitHandler<MobileFormInputs> = async (data) => {
    setIsLoading(true);
    setError('');
    
    try {
      // For now, just simulate OTP sending
      console.log('Sending OTP to:', data.mobile);
      setMobileNumber(data.mobile);
      setStep('otp');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) (nextInput as HTMLInputElement).focus();
    }
  };

  const handleOtpSubmit = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 4) {
      setError('Please enter a valid 4-digit OTP.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // For now, just simulate successful login
      console.log('Verifying OTP:', otpValue);
      
      const mockUser = { name: 'Test User', mobile: mobileNumber };
      localStorage.setItem('user', JSON.stringify(mockUser));

      if (onLoginSuccess) {
        onLoginSuccess(mockUser);
      }

      onClose();
      setStep('mobile');
      setOtp(['', '', '', '']);
      setMobileNumber('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setStep('mobile');
    setOtp(['', '', '', '']);
    setMobileNumber('');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-fuchsia-600 to-sky-500 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {step === 'mobile' ? <FaMobile /> : <FaKey />}
            {step === 'mobile' ? 'Login to Book Faster' : 'Enter OTP'}
          </h2>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-6">
          {step === 'mobile' ? (
            <form onSubmit={mobileForm.handleSubmit(handleMobileSubmit)} className="space-y-4">
              <p className="text-gray-600 text-sm mb-4">
                Enter your mobile number to receive a one-time password for quick login.
              </p>
              
              <input
                type="tel"
                placeholder="Enter Mobile Number"
                className="w-full p-4 text-lg bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                {...mobileForm.register('mobile', { 
                  required: 'Mobile number is required',
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: 'Please enter a valid 10-digit mobile number'
                  }
                })}
              />
              {mobileForm.formState.errors.mobile && (
                <p className="text-red-500 text-sm">{mobileForm.formState.errors.mobile.message}</p>
              )}

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-sky-500 to-fuchsia-500 text-white py-3 rounded-xl text-lg font-semibold shadow-lg hover:from-fuchsia-500 hover:to-sky-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600 text-sm mb-4">
                We&apos;ve sent a 4-digit OTP to <span className="font-semibold">{mobileNumber}</span>
              </p>
              
              <div className="flex justify-center gap-3 mb-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-input-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    className="w-14 h-14 text-center text-2xl bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                  />
                ))}
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <button
                onClick={handleOtpSubmit}
                disabled={isLoading || otp.join('').length !== 4}
                className="w-full bg-gradient-to-r from-sky-500 to-fuchsia-500 text-white py-3 rounded-xl text-lg font-semibold shadow-lg hover:from-fuchsia-500 hover:to-sky-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Verify & Login'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep('mobile')}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  ← Back to mobile number
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 