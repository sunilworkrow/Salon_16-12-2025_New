"use client";
import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { FaUserCircle } from "react-icons/fa";
import { HiMenu, HiX } from "react-icons/hi";
import Link from "next/link";

interface StaffHeaderProps {
  name: string;
}

export default function StaffHeader({ name }: StaffHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <header className="sticky z-1 top-0 bg-white shadow-md py-4 px-6 flex items-center justify-between">

      {/* LOGO */}
      <div className="relative z-[99] flex items-center gap-2">
        <div className="w-6 h-6 bg-[#000000] rounded-full flex items-center justify-center">
          <Image src="/img/logo.png" alt="Logo" height={40} width={40} />
        </div>
        <h1 className="font-bold text-lg">Workrow</h1>
      </div>

      {/* DESKTOP NAV */}
      <div className="hidden md:flex justify-between items-center w-full ml-10">

        <div className="flex items-center gap-4">

          <Link
            href="/home"
            className={`px-2 py-1 font-medium border-b-[3px] transition 
              ${pathname === "/home"
                ? "border-blue-600 font-semibold"
                : "border-transparent"}`}
          >
            Home
          </Link>

          <Link
            href="/home/staff-dashboard"
            className={`px-2 py-1 font-medium border-b-[3px] transition 
              ${pathname === "/home/staff-dashboard"
                ? "border-blue-600 font-semibold"
                : "border-transparent"}`}
          >
            Go to Dashboard
          </Link>

        </div>

        <div className="flex gap-3 items-center">
          <h1 className="font-medium text-gray-800 flex gap-1 items-center">
            <FaUserCircle />
            <span className="text-blue-600 capitalize">{name}</span>
          </h1>

          <button
            onClick={handleLogout}
            className="border border-black text-black px-4 py-1 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* MOBILE MENU BUTTON */}

      <div className="flex itms-center gap-2">

        <h1 className="md:hidden font-medium text-gray-800 flex gap-1 items-center">
          <FaUserCircle className="text-[18px]" />
          <span className="text-blue-600 capitalize">{name}</span>
        </h1>


        <button className="md:hidden text-3xl" onClick={() => setOpen(true)}>
          <HiMenu />
        </button>
      </div>

      {/* MOBILE SIDEBAR (RIGHT SIDE SLIDE + SMOOTH ANIMATION) */}
      <div
        className={`fixed inset-0 z-50 flex transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}

      >

        <div
          className={`w-full bg-white h-full p-5 shadow-xl transform transition-transform duration-300 ease-in-out
            ${open ? "translate-x-0" : "translate-x-full"}`}
        >
          {/* CLOSE BUTTON */}
          <div className="flex justify-end">
            <button className="text-3xl" onClick={() => setOpen(false)}>
              <HiX />
            </button>
          </div>

          {/* MENU ITEMS */}
          <div className="flex flex-col gap-4 mt-6">

            <Link
              href="/home"
              onClick={() => setOpen(false)}
              className={`p-2 font-medium rounded border-[#e5e5e5]
                ${pathname === "/home" ? "bg-blue-100 text-blue-600" : ""}`}
            >
              Home
            </Link>

            <Link
              href="/home/staff-dashboard"
              onClick={() => setOpen(false)}
              className={`p-2 font-medium rounded border-1 border-[#e5e5e5]
                ${pathname === "/home/staff-dashboard" ? "bg-blue-100 text-blue-600" : ""}`}
            >
              Go to Dashboard
            </Link>
            <div>
              <button
                onClick={handleLogout}
                className="p-2 border text-left rounded border-black bg-[#000000] text-[#ffffff]"
              >
                Logout
              </button>
            </div>

          </div>
        </div>


        {/* OVERLAY */}
        <div
          className="w-[24%] bg-black/40"
          onClick={() => setOpen(false)}
        ></div>

        {/* SIDEBAR */}

      </div>
    </header>
  );
}
