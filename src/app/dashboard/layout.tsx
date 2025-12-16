"use client";

import Sidebar from "@/app/components/Sidebar";
import DashboardHeader from "@/app/components/DashboardHeader";
import { UserProvider, useUser } from "@/app/context/UserContext";
import { useEffect, useState } from "react";
import CompanyRegisterModal from "@/app/components/CompanyRegisterModal";
import Loader from "@/app/components/Loader";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <DashboardContent>{children}</DashboardContent>
    </UserProvider>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); 
  const darkMode = true;

  useEffect(() => {
    const checkCompany = async () => {
      if (!user?.id) return;

      const res = await fetch("/api/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "check", userId: user.id }),
      });

      const data = await res.json();
      if (!data.exists) setShowModal(true);
    };

    checkCompany();
  }, [user?.id]);

  return (
    <>
      {loading && <Loader />}

      <div className={`flex h-screen ${darkMode ? "bg-[#121212] text-white" : "bg-white text-black"}`}>

       
        <div className="hidden md:block">
          <Sidebar darkMode={darkMode} />
        </div>

   
        <div
          className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-[#121212] text-white transition-transform duration-300 md:hidden 
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <Sidebar darkMode={darkMode} />
        </div>

        
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-[#00000073] bg-opacity-40 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        <div className="flex-1 overflow-auto bg-[#ebebeb] text-gray-800">
          <DashboardHeader onLogout={logout} onMenuClick={() => setSidebarOpen(true)} /> {/* 👍 pass toggle */}
          <main className="md:px-6 px-4 py-4">{children}</main>
        </div>

      </div>

      {showModal && (
        <CompanyRegisterModal
          userId={user?.id}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
