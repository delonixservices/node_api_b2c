"use client";
import { useState,useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

// ✅ Define a type for the form input
type SignUpFormInputs = {
  name: string;
  email: string;
  mobile: string;
  password: string;
};

export default function AdminSignUpPage() {
  const { register, handleSubmit } = useForm<SignUpFormInputs>();
  const router = useRouter();

    const [checkingAuth, setCheckingAuth] = useState(true);
  
    useEffect(() => {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        router.replace("/admin/auth/login");
      } else {
        setCheckingAuth(false);
      }
    }, [router]);
    
    if (checkingAuth) return null; // or a loader
  // ❌ Replace 'any' with the defined type
  const onSubmit = async (data: SignUpFormInputs) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/admin/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          mobile: Number(data.mobile),
          password: data.password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("✅ Admin created:", result);
        alert(result.message || "Signup successful!");

        router.push("/admin/auth/login");
      } else {
        console.error("❌ Signup failed:", result);
        alert(result?.message || "Signup failed");
      }
    } catch (error) {
      console.error("❗ Error during signup:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/images/login-bg.jpg')] bg-cover bg-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-violet-600">
              Admin Sign Up
            </h2>
            <p className="text-gray-600">Create your admin account</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 text-base rounded outline-none focus:border-gray-500"
                placeholder="Full Name"
                {...register("name", { required: true })}
              />
            </div>
            <div>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-300 text-base rounded outline-none focus:border-gray-500"
                placeholder="Email Address"
                {...register("email", { required: true })}
              />
            </div>
            <div>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 text-base rounded outline-none focus:border-gray-500"
                placeholder="Mobile Number"
                {...register("mobile", { required: true })}
              />
            </div>
            <div>
              <input
                type="password"
                className="w-full px-4 py-2 border border-gray-300 text-base rounded outline-none focus:border-gray-500"
                placeholder="Password"
                {...register("password", { required: true })}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2 px-4 rounded transition-all ease-in-out"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
