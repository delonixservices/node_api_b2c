"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  FaTachometerAlt, FaHotel, FaPlaneDeparture, FaGift, FaSignOutAlt, FaSearch
} from "react-icons/fa";
import { GiCash } from "react-icons/gi";
import { HiUsers } from "react-icons/hi2";
import { IoCard, IoSettingsSharp } from "react-icons/io5";
import { RiChatHistoryFill, RiDiscountPercentFill } from "react-icons/ri";
import { MdCancel, MdMoneyOff, MdCardGiftcard, MdImage, MdSecurity } from "react-icons/md";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { jwtDecode } from "jwt-decode";
import { 
  getCurrentAdminRole, 
  isAdmin, 
  isEmployee, 
  hasAdminAccess 
} from "@/utils/adminApi";

export default function AdminSidebar() {
  const path = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  // Get role from token
  useEffect(() => {
    const currentRole = getCurrentAdminRole();
    setRole(currentRole);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin");
    router.push("/admin/auth/login");
  };

  console.log("AdminSidebar component loaded");
  const navItems = [
    // Admin only items
    { href: "/admin/dashboard", label: "Dashboard", icon: <FaTachometerAlt className="text-lg" />, roles: ["admin"] },
    { href: "/admin/users", label: "Users", icon: <HiUsers className="text-lg" />, roles: ["admin"] },
    { href: "/admin/ip-blocking", label: "IP Blocking", icon: <MdSecurity className="text-lg" />, roles: ["admin"] },
    { href: "/admin/settings", label: "Settings", icon: <IoSettingsSharp className="text-lg" />, roles: ["admin"] },
    
    // Both admin and employee items
    { href: "/admin/transactions", label: "Transactions", icon: <IoCard className="text-lg" />, roles: ["admin", "employee"] },
    { href: "/admin/cancel", label: "Cancelled", icon: <MdCancel className="text-lg" />, roles: ["admin", "employee"] },
    { href: "/admin/refund", label: "Refunded", icon: <MdMoneyOff className="text-lg" />, roles: ["admin", "employee"] },
    { href: "/admin/coupons", label: "Coupon Code", icon: <RiDiscountPercentFill className="text-lg" />, roles: ["admin", "employee"] },
    { href: "/admin/payments", label: "Payment", icon: <GiCash className="text-lg" />, roles: ["admin", "employee"] },
    { href: "/admin/history", label: "History", icon: <RiChatHistoryFill className="text-lg" />, roles: ["admin", "employee"] },
    { href: "/admin/meta-search", label: "Meta Search", icon: <FaSearch className="text-lg" />, roles: ["admin", "employee"] },
    { href: "/admin/offers/banners", label: "Offer Banners", icon: <MdImage className="text-lg" />, roles: ["admin", "employee"] },
    { href: "/admin/offers/flights-offers", label: "Flights Offers", icon: <FaPlaneDeparture className="text-lg" />, roles: ["admin", "employee"] },
    { href: "/admin/offers/holidaypackages", label: "Holiday Packages", icon: <MdCardGiftcard className="text-lg" />, roles: ["admin", "employee"] },
    { href: "/admin/offers/hotel-offers", label: "Hotel Offers", icon: <FaHotel className="text-lg" />, roles: ["admin", "employee"] },
    { href: "/admin/offers/specialoffers", label: "Special Offers", icon: <FaGift className="text-lg" />, roles: ["admin", "employee"] },
  ];

  return (
    <div className={`h-screen bg-white shadow-lg transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} flex flex-col`}>
      <div className="flex items-center justify-between py-4 px-4 border-b border-gray-200">
        {!isCollapsed && (
          <Link href="/admin">
            <Image
              src="/images/logo.png"
              alt="Tripbazaar"
              width={250}
              height={80}
              className="w-32 h-14 object-contain object-center"
            />
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
        >
          {isCollapsed ? <IoIosArrowForward className="text-violet-600" /> : <IoIosArrowBack className="text-violet-600" />}
        </button>
      </div>

      <ul className="flex-1 overflow-y-auto py-4">
        {navItems
          .filter(item => !item.roles || item.roles.includes(role || ""))
          .map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 ${
                  path === item.href
                    ? "bg-violet-600 text-white hover:bg-violet-700"
                    : "text-violet-600 hover:bg-violet-100 hover:text-violet-800"
                }`}
                title={isCollapsed ? item.label : ""}
              >
                {item.icon}
                {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            </li>
          ))}
      </ul>

      <div className="border-t border-gray-200 p-4">
        <div className={`flex ${isCollapsed ? 'flex-col items-center gap-2' : 'items-center justify-between'}`}>
          <button
            type="button"
            onClick={handleLogout}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-violet-600 hover:bg-violet-100 hover:text-violet-800 ${
              isCollapsed ? 'w-full justify-center' : ''
            }`}
            title={isCollapsed ? "Logout" : ""}
          >
            <FaSignOutAlt className="text-lg" />
            {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
          {!isCollapsed && (
            <Link
              href="/admin/auth/sign-up"
              className="text-sm text-violet-600 font-medium hover:underline"
            >
              Sign up
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}