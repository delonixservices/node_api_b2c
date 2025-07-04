"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

type LoginFormInputs = {
  email: string;
  password: string;
};

export default function AdminLogPage() {
  const { register, handleSubmit } = useForm<LoginFormInputs>();
  const router = useRouter();

  const login = async (data: LoginFormInputs) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (response.ok && result.status === 200) {
        const token = result.data.token;
        const admin = result.data.admin;

        localStorage.setItem("admin_token", token);
        localStorage.setItem("admin", JSON.stringify(admin));

        console.log("✅ Login successful");
        router.push("/admin/dashboard");
      } else {
        console.error("❌ Login failed:", result);
        alert(result?.message || "Login failed");
      }
    } catch (error) {
      console.error("❗ Error during login:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/images/login-bg.jpg')] bg-cover bg-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-violet-600">Admin Login</h2>
            <p className="text-gray-600">Please enter your email and password</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(login)}>
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
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
