"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaPhoneAlt, FaUser } from "react-icons/fa";
import { FaPen } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

type FormData = {
  id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
};

export default function ProfilePage() {
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const router = useRouter();

  // Fetch user ID from localStorage
  useEffect(() => {
    const fetchUserId = () => {
      try {
        const userJson = localStorage.getItem("user");
        if (!userJson) {
          console.error("User object not found in localStorage");
          return;
        }

        const user = JSON.parse(userJson);
        const id = user?._id;
        if (id) {
          setUserId(id); // Save the userId to state
          console.log("User ID:", id);
          console.log("User name:", user.name);
        } else {
          console.error("userId not found in user object");
        }
      } catch (error) {
        console.error("Error parsing user object from localStorage:", error);
      }
    };

    fetchUserId();
  }, []);

  const { register, watch, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      mobile: "",
      email: "",
      id: "",
    },
  });

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token not found");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data = await res.json();

        // Update form with fetched data
        reset({
          firstName: data.name || "",
          lastName: data.last_name  || "",
          mobile: data.mobile || "",
          email: data.email || "",
          id: userId || "",
        });
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [reset, userId]);

  const toggleEditProfile = () => {
    setShowEditProfile(!showEditProfile);
  };

  const editProfile = async (formData: FormData) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token not found");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/auth/user-profile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: userId,
            name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      const result = await res.json();
      console.log("Profile updated:", result);
      setShowEditProfile(false);

      // Update local storage user data if needed
      if (result.data) {
        const userString = localStorage.getItem("user");
        if (userString) {
          const user = JSON.parse(userString);
          const updatedUser = {
            ...user,
            name: result.data.firstName || user.firstName,
            lastName: result.data.lastName || user.lastName,
            email: result.data.email || user.email,
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading profile...</div>;
  }

  return (
    <section className="p-4 md:p-8 bg-gradient-to-br from-fuchsia-50 to-blue-50 min-h-screen">
      <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto">
        {/* Profile card */}
        <div className="md:w-1/3">
          <div className="text-center px-6 py-10 border rounded-3xl shadow-xl bg-white/80 backdrop-blur-md relative">
            <motion.div
              whileHover={{ scale: 1.06, boxShadow: "0 8px 32px 0 rgba(123, 31, 162, 0.15)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="profile-pic mb-4 w-28 h-28 bg-gradient-to-br from-fuchsia-500 to-blue-500 text-white text-6xl rounded-full mx-auto flex items-center justify-center shadow-lg border-4 border-white -mt-20 cursor-pointer"
            >
              <FaUser />
            </motion.div>
            <h4 className="text-fuchsia-800 my-2 text-2xl font-bold tracking-tight">
              {watch("firstName")} {watch("lastName")}
            </h4>
            <div className="space-y-2 text-stone-600 mt-4">
              <p className="flex items-center justify-center gap-2 text-base">
                <FaPhoneAlt className="text-fuchsia-500" /> {watch("mobile")}
              </p>
              <p className="flex items-center justify-center gap-2 text-base">
                <MdEmail className="text-blue-500" /> {watch("email")}
              </p>
            </div>
          </div>
        </div>

        {/* Profile details / Edit form */}
        <div className="md:w-2/3">
          <div className="border rounded-3xl shadow-xl p-8 bg-white/90 backdrop-blur-md relative min-h-[340px]">
            <button
              type="button"
              className="absolute top-6 right-6 text-base font-semibold cursor-pointer flex items-center gap-2 text-blue-600 hover:text-fuchsia-600 transition-colors duration-200 bg-white/70 px-3 py-1.5 rounded-full shadow-sm border border-blue-100 hover:border-fuchsia-200"
              onClick={toggleEditProfile}
            >
              <FaPen /> {showEditProfile ? "Cancel" : "Edit"}
            </button>

            <AnimatePresence mode="wait">
              {!showEditProfile ? (
                <motion.div
                  key="profile-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="space-y-4 mt-4"
                >
                  <p className="text-stone-500 text-lg">
                    <strong className="text-stone-800">Name:</strong>{" "}
                    {watch("firstName")} {watch("lastName")}
                  </p>
                  <p className="text-stone-500 text-lg">
                    <strong className="text-stone-800">Phone:</strong>{" "}
                    {watch("mobile")}
                  </p>
                  <p className="text-stone-500 text-lg">
                    <strong className="text-stone-800">Email:</strong>{" "}
                    {watch("email")}
                  </p>
                  {/* Buttons for Verify Phone Number and Reset Password */}
  <div className="flex flex-col md:flex-row gap-4 mt-6">
    <button
      type="button"
      onClick={() => alert("Phone verification initiated!")}
      className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-all duration-200"
    >
      Verify Phone Number
    </button>
    <button
      type="button"
      onClick={() => router.push('/user/account/password')}
      className="w-full md:w-auto bg-fuchsia-600 text-white px-6 py-2 rounded-lg font-semibold shadow-md hover:bg-fuchsia-700 transition-all duration-200"
    >
      Update Password
    </button>
  </div>
                </motion.div>
              

              ) : (
                <motion.form
                  key="profile-edit"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="space-y-6 mt-8"
                  onSubmit={handleSubmit(editProfile)}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input
                      type="text"
                      placeholder="First Name"
                      {...register("firstName", { required: true })}
                      className="p-3 border-2 border-fuchsia-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-fuchsia-400 transition w-full text-lg bg-white/80 placeholder:text-stone-400"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      {...register("lastName", { required: true })}
                      className="p-3 border-2 border-fuchsia-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-fuchsia-400 transition w-full text-lg bg-white/80 placeholder:text-stone-400"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Phone"
                    disabled
                    {...register("mobile")}
                    className="w-full p-3 border-2 border-blue-100 rounded-xl bg-gray-100 text-lg placeholder:text-stone-400 cursor-not-allowed opacity-80"
                  />

                  <input
                    type="email"
                    placeholder="Email"
                    {...register("email", { required: true })}
                    className="w-full p-3 border-2 border-fuchsia-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-fuchsia-400 transition text-lg bg-white/80 placeholder:text-stone-400"
                  />

                  <div className="flex justify-end">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.04, boxShadow: "0 0 0 0.2rem #e879f9, 0 8px 32px 0 rgba(123, 31, 162, 0.10)" }}
                      transition={{ type: "spring", stiffness: 300, damping: 18 }}
                      className="bg-gradient-to-r from-fuchsia-600 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:from-fuchsia-700 hover:to-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
                    >
                      Update
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}