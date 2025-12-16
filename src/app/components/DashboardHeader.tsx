"use client";

import { CiSearch, CiBellOn } from "react-icons/ci";
import { IoMdMenu } from "react-icons/io"; // <-- NEW
import { useEffect, useState } from "react";
import Image from "next/image";

type Props = {
  onLogout: () => void;
  onMenuClick: () => void; // <-- NEW
};

type UserType = {
  name: string;
  image?: string;
};

export default function DashboardHeader({ onLogout, onMenuClick }: Props) {
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("/api/get-profile", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        const result = await res.json();

        if (result.success) {
          const fullName = `${result.data.name || ""} ${result.data.lastName || ""}`.trim();
          setUser({ name: fullName, image: result.data.image });
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    fetchUser();
  }, []);

  if (!user) {
    return (
      <header className="sticky top-0 z-10 bg-[#ebebeb] custom-shadow p-4 text-sm text-gray-400">
        Loading...
      </header>
    );
  }

  const getInitials = (name: string) => name.split(" ").map((p) => p[0]).join("").toUpperCase();

  return (
    <header className="p-4 flex items-center justify-between sticky top-0 bg-[#ebebeb] z-10 custom-shadow">

      {/* 🌟 MOBILE MENU BUTTON */}
      <div className="md:hidden flex gap-3 itms-center">
        <button
          onClick={onMenuClick}
          className=" text-gray-800 bg-[#ffffff] px-2 py-2 rounded-md"
        >
          <IoMdMenu size={20} className="font-semibold" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#000000] rounded-full flex items-center justify-center">
            <Image src="/img/logo.png" alt="" height={60} width={60} />
          </div>
          <h1 className="font-bold text-lg">Workrow</h1>
        </div>

      </div>

      {/* Search Bar */}
      <div className="relative w-1/2 hidden md:block">
        <CiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900" />
        <input
          type="text"
          placeholder="Search campaign, customer, etc."
          className="w-full pl-10 pr-4 py-2 bg-[#ffffff] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Notification */}
        <button className="relative text-gray-800">
          <CiBellOn size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
        </button>

        {/* Avatar + Name + Logout */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden flex items-center justify-center">
            {user.image ? (
              <Image src={user.image} alt="User" className="w-full h-full object-cover" height={30} width={30} />
            ) : (
              <span className="text-white font-semibold text-sm">{getInitials(user.name)}</span>
            )}
          </div>

          <div className="hidden md:block">
            <p className="text-gray-800 font-medium">{user.name}</p>
            <p className="text-xs text-gray-400">Admin</p>
          </div>

          <button
            onClick={onLogout}
            className="rounded-lg border border-[#909090] text-xs px-3 py-1 text-gray-800 hover:bg-red-500 hover:border-red-500"
          >
            Logout
          </button>
        </div>
      </div>

    </header>
  );
}
