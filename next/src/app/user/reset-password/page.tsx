"use client";

import { useState } from "react";
import { FaUser } from "react-icons/fa6";

export default function ResetPasswordPage() {
  const [resetObj, setResetObj] = useState({
    password: "",
    newpassword: "",
  });
  const [validation, setValidation] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResetObj((prev) => ({
      ...prev,
      [name]: value,
    }));
  }; 

  const resetPassword = () => {
    // Password validation
    if (resetObj.password !== resetObj.newpassword) {
      setValidation("Passwords don't match");
      return;
    }

    // Password reset logic here
    setValidation("Password reset successfully");
  };

  return (
    <div className="container mx-auto my-4 px-4">
      <div className="flex justify-center">
        <div className="w-full sm:w-5/12 md:w-6/12 lg:w-5/12 xl:w-4/12">
          <div className="bg-white rounded-lg shadow-md mb-10">
            <div className="p-4 border-b bg-fuchsia-600 rounded-t-lg">
              <h5 className="text-white text-lg flex items-center gap-2 font-medium">
                <FaUser />
                Reset Password
              </h5>
            </div>

            <form className="p-4 space-y-4">
              <div>
                <input
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  name="password"
                  value={resetObj.password}
                  onChange={handleInputChange}
                  placeholder="Enter Your New Password"
                />
              </div>

              <div>
                <input
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  name="newpassword"
                  value={resetObj.newpassword}
                  onChange={handleInputChange}
                  placeholder="Enter Your Confirm Password"
                />
              </div>

              <button
                onClick={resetPassword}
                className="w-full bg-sky-600 text-white py-2 text-lg rounded hover:bg-sky-700 transition-all ease-in-out"
              >
                Submit
              </button>

              {validation && (
                <span className="text-sm text-red-600">{validation}</span>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
