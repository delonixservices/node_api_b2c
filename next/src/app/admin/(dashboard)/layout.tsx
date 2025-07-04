"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/sideBar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  console.log("AdminSidebar component loaded");
  console.log("RootLayout component loaded");

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.replace("/admin/auth/login");
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-violet-600 text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="w-full h-screen flex">
      <nav className="h-full flex flex-col justify-between bg-white shadow-lg transition-all duration-300">
        <AdminSidebar />
      </nav>
      <section className="flex-1 bg-gray-100 p-6 h-screen overflow-y-auto">
        {children}
      </section>
    </main>
  );
}