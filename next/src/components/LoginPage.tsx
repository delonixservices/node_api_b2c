"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';

interface LoginFormInputs {
  mobile: string;
  password: string;
}

interface ForgotPasswordFormInputs {
  forgotMobile: string;
}

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const { register, handleSubmit } = useForm<LoginFormInputs>();
  const [loginValidation, setLoginValidation] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const router = useRouter();

  const handleLogin: SubmitHandler<LoginFormInputs> = async (data) => {
    setLoginValidation('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Login failed');

      localStorage.setItem('token', result.token);
      localStorage.setItem('refreshToken', result.refreshToken);
      localStorage.setItem('user', JSON.stringify(result.user));
      if (onLoginSuccess) onLoginSuccess();
      router.push('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setLoginValidation(err.message);
      } else {
        setLoginValidation('Unexpected error occurred.');
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white/70 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/30">
      <div className="bg-gradient-to-r from-fuchsia-600 to-sky-500 px-8 py-6 rounded-t-2xl text-white text-center text-2xl font-bold tracking-wide shadow-md">
        Welcome Back
      </div>
      <form onSubmit={handleSubmit(handleLogin)} className="p-8 space-y-6">
        <input
          type="text"
          placeholder="Mobile Number"
          className="w-full p-4 text-lg bg-white/60 rounded-xl border-none shadow focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder-gray-400"
          {...register('mobile', { required: true })}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-4 text-lg bg-white/60 rounded-xl border-none shadow focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder-gray-400"
          {...register('password', { required: true })}
        />
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => setShowForgotModal(true)}
            className="text-sm text-sky-600 hover:underline hover:text-fuchsia-600 font-medium transition"
          >
            Forgot Password?
          </button>
        </div>
        {loginValidation && (
          <p className="text-red-600 text-base text-center font-medium">{loginValidation}</p>
        )}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-sky-500 to-fuchsia-500 text-white py-3 rounded-xl text-lg font-semibold shadow-lg hover:from-fuchsia-500 hover:to-sky-500 transition-all duration-200"
        >
          Login
        </button>
        <p className="text-xs text-center text-gray-500 mt-2">
          By logging in, you agree to our{' '}
          <Link href="/terms" target="_blank" className="text-sky-600 underline hover:text-fuchsia-600">Terms</Link>{' '}
          &{' '}
          <Link href="/privacy-policy" target="_blank" className="text-sky-600 underline hover:text-fuchsia-600">Privacy Policy</Link>
        </p>
      </form>
      <div className="border-t border-white/30 px-8 py-5 text-center text-base text-gray-700 bg-white/40">
        New here?{' '}
        <Link href="/user/sign-up" className="text-fuchsia-600 font-semibold hover:underline hover:text-sky-600 transition">
          Create an account
        </Link>
      </div>
      {showForgotModal && <ForgotPasswordModal isOpen={showForgotModal} onClose={() => setShowForgotModal(false)} />}
    </div>
  );
}

function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormInputs>();

  const onSubmit: SubmitHandler<ForgotPasswordFormInputs> = async (data) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: data.forgotMobile }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Reset failed');

      alert('Password reset instructions sent!');
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Something went wrong.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-stone-700 mb-4">Forgot Password</h3>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <input
            type="text"
            placeholder="Enter your registered mobile number"
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
            {...register('forgotMobile', { required: 'Mobile number is required' })}
          />
          {errors.forgotMobile && (
            <p className="text-red-500 text-sm">{errors.forgotMobile.message}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-red-600 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 transition"
            >
              Send Reset Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 