"use client";

import StaffHeader from './staffHeader';
import { useState, useEffect } from 'react';
import Sidebar from "@/app/components/Sidebar";
import { usePathname } from "next/navigation";
import { IoMdMenu } from "react-icons/io";

interface Props {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  const pathname = usePathname();

  const [user, setUser] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  
  const [openSidebar, setOpenSidebar] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");

    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }

    setLoading(false);
  }, []);

  // ✔ Sidebar only on these staff pages
  const showSidebar =
    pathname.startsWith("/home/staff-dashboard") ||
    pathname.startsWith("/home/profile");

  return (
    <div className="min-h-screen bg-gray-100">

  
      {loading ? (
        <div className="bg-gray-100 py-4 px-8 text-gray-400 text-center">
          Loading user...
        </div>
      ) : user ? (
        <StaffHeader name={user.name} />
      ) : null}

     
      {showSidebar && (
        <button
          onClick={() => setOpenSidebar(true)}
          className="md:hidden absolute top-[73px] left-4 bg-white p-2 rounded "
        >
          <IoMdMenu size={24} />
        </button>
      )}

    
      <div className="flex h-screen bg-gray-50">

        
        {showSidebar && (
          <div className="hidden md:block">
            <Sidebar darkMode={false} />
          </div>
        )}


        {showSidebar && (
          <div
            className={`
              fixed top-[61px] left-0 h-full z-40 md:hidden transition-transform duration-300 w-full
              ${openSidebar ? "translate-x-0" : "-translate-x-full"}
            `}
          >
            <Sidebar darkMode={false} />

            
            <div
              onClick={() => setOpenSidebar(false)}
              className="fixed inset-0 bg-[#00000061] bg-opacity-40 w-full z-[-1]"
            />
          </div>
        )}

      
        <div className="flex-1">
          {children}
        </div>

      </div>
    </div>
  );
}
