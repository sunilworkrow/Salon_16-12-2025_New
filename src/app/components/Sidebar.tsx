"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { CiUser } from "react-icons/ci";
import { AiOutlineBranches } from "react-icons/ai";
import { FaServicestack } from "react-icons/fa";
import { TbReportAnalytics } from "react-icons/tb";
import { IoQrCodeOutline } from "react-icons/io5";
import { LuLayoutDashboard } from "react-icons/lu";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import Image from "next/image";
import { LuUsersRound } from "react-icons/lu";
import { FaUserTie } from "react-icons/fa";
import { CiViewList } from "react-icons/ci";

interface SidebarProps {
  darkMode: boolean;
}

export default function Sidebar({ darkMode }: SidebarProps) {
  const pathname = usePathname();
  const [servicesOpen, setServicesOpen] = useState(false);
  const [role, setRole] = useState<"admin" | "staff" | null>(null);

  

  // Get user role from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setRole(payload.role);
    } catch {
      setRole(null);
    }
  }, []);

  if (role === null) {
  return <div className="w-64 h-full bg-gray-100" />; // or loader
}

  // Define menu based on role
  const navItems = role === "staff"
    ? [
      { href: "/home/staff-dashboard", label: "Staff Dashboard", icon: <LuLayoutDashboard /> },
      { href: "/home/profile", label: "Profile", icon: <LuLayoutDashboard /> },
      { label: "Services", icon: <FaServicestack />, isDropdown: true },
    ]
    : [
      { href: "/dashboard", label: "Dashboard", icon: <LuLayoutDashboard /> },
      { href: "/dashboard/branches", label: "Branches", icon: <AiOutlineBranches /> },
      { href: "/dashboard/qr-builder", label: "QR Builder", icon: <IoQrCodeOutline /> },
      { label: "Services", icon: <FaServicestack />, isDropdown: true },
      { href: "/dashboard/report", label: "Report", icon: <TbReportAnalytics /> },
      { href: "/dashboard/staff", label: "Staff", icon: <LuUsersRound /> },
      { href: "/dashboard/staff-service-list", label: "Staff Service list", icon: <CiViewList /> },
      { href: "/dashboard/clients", label: "Clients", icon: <FaUserTie /> },
      { href: "/dashboard/profile", label: "Profile", icon: <CiUser /> },
    ];

  return (
    <div className={`w-64 h-full ${darkMode ? "bg-[#f9f9f9] text-gray-800 " : "bg-gray-100"} border-r border-[#c1c1c1] flex flex-col`}>

{
      role ==="staff" ? "": (     
      <div className="px-4 py-[22px] flex items-center gap-2 custom-shadow">
        <div className="w-6 h-6 bg-[#000000] rounded-full flex items-center justify-center">
          <Image src="/img/logo.png" alt="" height={60} width={60} />
        </div>
        <h1 className="font-bold text-lg">Workrow</h1>
      </div>) 

      }

      <nav className="flex-1 px-2 py-4 space-y-2">
        {navItems.map((item) =>
          item.isDropdown ? (
            <div key="services-dropdown">
              {role !== "staff" && (
                <button
                  onClick={() => setServicesOpen(!servicesOpen)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md ${pathname.includes("services") ? "bg-blue-600 text-white" : "hover:border hover:border-[#434343]"
                    }`}
                >
                  <span className="flex items-center gap-3">{item.icon}{item.label}</span>
                  {servicesOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
                </button>
              )}

              {servicesOpen && (
                <div className="ml-8 mt-2 space-y-1">
                  <Link
                    href={role === "staff" ? "/home/staff-dashboard" : "/dashboard/services/category"}
                    className={`block px-3 py-2 rounded-md ${pathname === "/dashboard/services/category" ? "bg-blue-600 text-white" : "text-gray-800 hover:border hover:border-[#434343]"}`}
                  >
                    {role === "staff" ? "" : "Services Category"}
                  </Link>
                  
                  {role !== "staff" && (
                    <Link
                      href="/dashboard/services/all-services"
                      className={`block px-3 py-2 rounded-md ${pathname === "/dashboard/services/all-services" ? "bg-blue-600 text-white" : "text-gray-800 hover:border hover:border-[#434343]"}`}
                    >
                      All Services
                    </Link>
                  )}
                </div>
              )}
            </div>
          ) : (
            <Link
              key={item.href}
              href={item.href!}
              className={`flex items-center gap-3 px-3 py-2 rounded-md ${pathname === item.href ? "bg-blue-600 text-white" : "hover:border hover:border-[#434343]"
                }`}
            >
              {item.icon}<span>{item.label}</span>
            </Link>
          )
        )}
      </nav>
    </div>
  );
}
