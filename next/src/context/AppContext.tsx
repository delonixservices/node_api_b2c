"use client";

import Notify from "@/components/notify";
// import { useRouter } from "next/navigation";
import { createContext, useContext, useState } from "react";

interface AppContextType {
  // seller: string | null;
  // sellerNm: string | null;
  // sellerTm: string | null;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  // checkSellerLogin: () => boolean;
  // loginSeller: (
  //   sellerId: string,
  //   sellerName: string,
  //   sellerTime: string
  // ) => void;
  // logoutSeller: () => void;
  // customer: string | null;
  // customerNm: string | null;
  // customerTm: string | null;
  // checkCustomerLogin: () => boolean;
  // loginCustomer: (
  //   customerId: string,
  //   customerName: string,
  //   customerTime: string
  // ) => void;
  // logoutCustomer: () => void;
  // admin: string | null;
  // adminNm: string | null;
  // adminRole: string | null;
  // adminTm: string | null;
  // checkAdminLogin: () => boolean;
  // loginAdmin: (
  //   admId: string,
  //   admName: string,
  //   admRole: string,
  //   admTime: string
  // ) => void;
  // logoutAdmin: () => void;
}

const AppContext = createContext<AppContextType>({
  // seller: null,
  // sellerNm: null,
  // sellerTm: null,
  loading: true,
  setLoading: () => {},
  // checkSellerLogin: () => false,
  // loginSeller: () => {},
  // logoutSeller: () => {},
  // customer: null,
  // customerNm: null,
  // customerTm: null,
  // checkCustomerLogin: () => false,
  // loginCustomer: () => {},
  // logoutCustomer: () => {},
  // admin: null,
  // adminNm: null,
  // adminRole: null,
  // adminTm: null,
  // checkAdminLogin: () => false,
  // loginAdmin: () => {},
  // logoutAdmin: () => {},
});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  // const [seller, setSeller] = useState<string | null>(null);
  // const [sellerNm, setSellerNm] = useState<string | null>(null);
  // const [sellerTm, setSellerTm] = useState<string | null>(null);
  // const [customer, setCustomer] = useState<string | null>(null);
  // const [customerNm, setCustomerNm] = useState<string | null>(null);
  // const [customerTm, setCustomerTm] = useState<string | null>(null);
  // const [admin, setAdmin] = useState<string | null>(null);
  // const [adminNm, setAdminNm] = useState<string | null>(null);
  // const [adminRole, setAdminRole] = useState<string | null>(null);
  // const [adminTm, setAdminTm] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // const router = useRouter();

  // const checkSellerLogin = () => {
  //   const storedSellerId = localStorage.getItem("sellerId");
  //   const storedSellerName = localStorage.getItem("sellerName");
  //   const storedSellerTime = localStorage.getItem("sellerTime");
  //   if (storedSellerId && storedSellerName && storedSellerTime) {
  //     const now = new Date();
  //     if (now.getTime() > +storedSellerTime) logoutSeller();

  //     setSeller(storedSellerId);
  //     setSellerNm(storedSellerName);
  //     setSellerTm(storedSellerTime);
  //     return true;
  //   }

  //   logoutSeller();
  //   return false;
  // };

  // const loginSeller = (
  //   sellerId: string,
  //   sellerName: string,
  //   sellerTime: string
  // ) => {
  //   setSeller(sellerId);
  //   setSellerNm(sellerName);
  //   setSellerTm(sellerTime);
  //   localStorage.setItem("sellerId", sellerId);
  //   localStorage.setItem("sellerName", sellerName);
  //   localStorage.setItem("sellerTime", sellerTime);
  // };

  // const logoutSeller = () => {
  //   setSeller("");
  //   setSellerNm("");
  //   setSellerTm("");
  //   localStorage.removeItem("sellerId");
  //   localStorage.removeItem("sellerName");
  //   localStorage.removeItem("sellerTime");
  //   router.push("/vendor");
  // };

  // const checkCustomerLogin = () => {
  //   const storedCustomerId = localStorage.getItem("customerId");
  //   const storedCustomerName = localStorage.getItem("customerName");
  //   const storedCustomerTime = localStorage.getItem("customerTime");
  //   if (storedCustomerId && storedCustomerName && storedCustomerTime) {
  //     const now = new Date();
  //     if (now.getTime() > +storedCustomerTime) logoutCustomer();

  //     setCustomer(storedCustomerId);
  //     setCustomerNm(storedCustomerName);
  //     setCustomerTm(storedCustomerTime);
  //     return true;
  //   }

  //   logoutCustomer();
  //   return false;
  // };

  // const loginCustomer = (
  //   customerId: string,
  //   customerName: string,
  //   customerTime: string
  // ) => {
  //   setCustomer(customerId);
  //   setCustomerNm(customerName);
  //   setCustomerTm(customerTime);
  //   localStorage.setItem("customerId", customerId);
  //   localStorage.setItem("customerName", customerName);
  //   localStorage.setItem("customerTime", customerTime);
  // };

  // const logoutCustomer = () => {
  //   setCustomer("");
  //   setCustomerNm("");
  //   setCustomerTm("");
  //   localStorage.removeItem("customerId");
  //   localStorage.removeItem("customerName");
  //   localStorage.removeItem("customerTime");
  //   router.push("/");
  // };

  // const checkAdminLogin = () => {
  //   const storedAdmId = localStorage.getItem("admId");
  //   const storedAdmName = localStorage.getItem("admName");
  //   const storedAdmRole = localStorage.getItem("admRole");
  //   const storedAdmTime = localStorage.getItem("admTime");
  //   if (storedAdmId && storedAdmName && storedAdmRole && storedAdmTime) {
  //     const now = new Date();
  //     if (now.getTime() > +storedAdmTime) logoutAdmin();

  //     setAdmin(storedAdmId);
  //     setAdminNm(storedAdmName);
  //     setAdminRole(storedAdmRole);
  //     setAdminTm(storedAdmTime);

  //     return true;
  //   }

  //   logoutAdmin();
  //   return false;
  // };

  // const loginAdmin = (
  //   admId: string,
  //   admName: string,
  //   admRole: string,
  //   admTime: string
  // ) => {
  //   setAdmin(admId);
  //   setAdminNm(admName);
  //   setAdminRole(admRole);
  //   setAdminTm(admTime);
  //   localStorage.setItem("admId", admId);
  //   localStorage.setItem("admName", admName);
  //   localStorage.setItem("admRole", admRole);
  //   localStorage.setItem("admTime", admTime);
  // };

  // const logoutAdmin = () => {
  //   setAdmin(null);
  //   setAdminNm(null);
  //   setAdminRole(null);
  //   setAdminTm(null);
  //   localStorage.removeItem("admId");
  //   localStorage.removeItem("admName");
  //   localStorage.removeItem("admRole");
  //   localStorage.removeItem("admTime");
  //   router.push("/admin");
  // };

  return (
    <AppContext.Provider
      value={{
        // seller,
        // sellerNm,
        // sellerTm,
        // checkSellerLogin,
        // loginSeller,
        // logoutSeller,
        // customer,
        // customerNm,
        // customerTm,
        // checkCustomerLogin,
        // loginCustomer,
        // logoutCustomer,
        // admin,
        // adminNm,
        // adminRole,
        // adminTm,
        // checkAdminLogin,
        // loginAdmin,
        // logoutAdmin,
        loading,
        setLoading,
      }}
    >
      <Notify />
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
