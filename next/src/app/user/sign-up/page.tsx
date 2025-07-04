"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";
// import { useRouter } from "next/navigation";
import { FaUserPlus } from "react-icons/fa";

interface SignUpFormInputs {
  name: string;
  last_name: string;
  mobile: string;
  email: string;
  password: string;
}

export default function SignUpPage() {

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignUpFormInputs>();
  const [signUpValidation, setSignUpValidation] = useState("");
  const [showOtpSection, setShowOtpSection] = useState(false); // State to toggle OTP section
  const [otp, setOtp] = useState(["", "", "", ""]); // Array to store OTP digits

  // const router = useRouter();

  const handleSignUp: SubmitHandler<SignUpFormInputs> = async (data) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          last_name: data.last_name,
          mobile: data.mobile,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Sign-Up failed");
      }
      setShowOtpSection(true);

      alert("Sign-Up successful! Please log in.");
      reset();
      // router.push("/user/login");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setSignUpValidation(error.message);
      } else {
        setSignUpValidation("An unexpected error occurred");
      }
    }
  };
  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return; // Allow only numeric input

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Automatically move to the next input box if a digit is entered
    if (value && index < otp.length - 1) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) (nextInput as HTMLInputElement).focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Move to the previous input box on backspace if the current box is empty
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) (prevInput as HTMLInputElement).focus();
    }
  };

  const handleOtpSubmit = () => {
    const otpValue = otp.join("");
    if (otpValue.length === 4) {
      alert(`OTP Verified: ${otpValue}`);
    } else {
      alert("Please enter a valid 4-digit OTP.");
    }
  };


return (
  <div className="min-h-screen flex items-center justify-center bg-[url('/images/hotel.jpg')] bg-cover bg-center relative">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0" />
    <div className="relative z-10 w-full max-w-md mx-auto bg-white/70 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/30">
      <div className="bg-gradient-to-r from-fuchsia-600 to-sky-500 px-8 py-6 rounded-t-2xl text-white text-center text-2xl font-bold tracking-wide shadow-md flex items-center gap-2 justify-center">
        <FaUserPlus /> Sign Up
      </div>
      {!showOtpSection ? (
        <form className="p-8 space-y-6" onSubmit={handleSubmit(handleSignUp)}>
          <input
            type="text"
            className="w-full p-4 text-lg bg-white/60 rounded-xl border-none shadow focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder-gray-400"
            {...register("name", { required: "Name is required" })}
            placeholder="Your Name"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          <input
            type="text"
            className="w-full p-4 text-lg bg-white/60 rounded-xl border-none shadow focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder-gray-400"
            {...register("last_name", { required: "Last name is required" })}
            placeholder="Last Name"
          />
          {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>}
          <input
            type="text"
            className="w-full p-4 text-lg bg-white/60 rounded-xl border-none shadow focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder-gray-400"
            {...register("mobile", { required: "Mobile number is required" })}
            placeholder="Mobile Number"
          />
          {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile.message}</p>}
          <input
            type="email"
            className="w-full p-4 text-lg bg-white/60 rounded-xl border-none shadow focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder-gray-400"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            placeholder="Email Address"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          <input
            type="password"
            className="w-full p-4 text-lg bg-white/60 rounded-xl border-none shadow focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder-gray-400"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            placeholder="Password"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          {signUpValidation && (
            <p className="text-red-600 text-base text-center font-medium">{signUpValidation}</p>
          )}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-sky-500 to-fuchsia-500 text-white py-3 rounded-xl text-lg font-semibold shadow-lg hover:from-fuchsia-500 hover:to-sky-500 transition-all duration-200"
          >
            Sign Up
          </button>
          <p className="text-xs text-center text-gray-500 mt-2">
            Already have an account?{' '}
            <Link href="/user/login" className="text-fuchsia-600 font-semibold hover:underline hover:text-sky-600 transition">
              Log In
            </Link>
          </p>
        </form>
      ) : (
        <div className="p-8 space-y-6">
          <p className="text-gray-700 text-base text-center">
            An OTP has been sent to your mobile number. Please enter it below to verify your account.
          </p>
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-input-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, index)}
                onKeyDown={(e) => handleOtpKeyDown(e, index)}
                className="w-14 h-14 text-center text-2xl bg-white/60 rounded-xl border-none shadow focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder-gray-400 mx-1"
              />
            ))}
          </div>
          <button
            onClick={handleOtpSubmit}
            className="w-full bg-gradient-to-r from-sky-500 to-fuchsia-500 text-white py-3 rounded-xl text-lg font-semibold shadow-lg hover:from-fuchsia-500 hover:to-sky-500 transition-all duration-200"
          >
            Verify OTP
          </button>
        </div>
      )}
    </div>
  </div>
);
}