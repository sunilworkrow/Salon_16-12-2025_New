"use client";

import Sidebar from "@/app/components/Sidebar";
import { useEffect, useState } from "react";

interface SubmittedService {
  id: number;
  service_name: string;
  price: number;
  branch_name: string;
  selected_date: string;
}

export default function StaffDashboardPage() {
  const [services, setServices] = useState<SubmittedService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [filteredServices, setFilteredServices] = useState<SubmittedService[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedRow, setSelectedRow] = useState<number | null>(null); // To track which row was clicked

  useEffect(() => {
    const fetchServices = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token not found. Please login again.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${window.location.origin}/api/staffdashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        console.log("datadatadatadata", data);

        if (!data.success) {
          setError(data.message || "Failed to fetch services");
          setServices([]);
        } else {
          setServices(data.services);
          setFilteredServices(data.services); // Set initial filtered data
        }
      } catch (err) {
        console.error(err);
        setError("Something went wrong while fetching services");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const calculateTotalPrice = (data: SubmittedService[]) => {
    return data.reduce((sum, service) => sum + Number(service.price), 0);
  };



  const formatTimeIST = (dateString: string) => {
    if (!dateString) return "";

    return new Date(dateString).toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };




  const applyTabFilter = (tab: string) => {
    setActiveTab(tab);
    let filtered: SubmittedService[] = [];

    if (tab === "all") {
      filtered = services;
    } else if (tab === "day") {
      const todayString = new Date().toISOString().split('T')[0];
      filtered = services.filter(
        (service) => new Date(service.selected_date).toISOString().split('T')[0] === todayString
      );
    } else if (tab === "week") {
      const today = new Date();
      const firstDayOfWeek = today.getDate() - today.getDay();
      const startOfWeek = new Date(today.setDate(firstDayOfWeek)).toISOString().split('T')[0];
      filtered = services.filter(
        (service) => new Date(service.selected_date).toISOString().split('T')[0] >= startOfWeek
      );
    } else if (tab === "month") {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      filtered = services.filter(
        (service) => new Date(service.selected_date).toISOString().split('T')[0] >= firstDayOfMonth
      );
    }

    setFilteredServices(filtered);
    setTotalPrice(calculateTotalPrice(filtered)); // Update the total price when filter is applied
  };

  const handleRowClick = (serviceId: number) => {
    setSelectedRow(serviceId === selectedRow ? null : serviceId); // Toggle the selected row
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (error) return <div className="text-center mt-20 text-red-500">{error}</div>;

  return (
    

<div className="md:flex h-screen bg-gray-50">

      <div className="flex-1 overflow-auto">
        <div className="md:p-6">
          <h1 className="text-2xl font-bold md:mb-6 my-4">Dashboard</h1>
          <div className="p-4  mb-4 rounded border border-[#dcdcdc] bg-white rounded-lg">
            <div className="flex md:gap-4 gap-3">
              <button
                className={`md:px-5 px-[9px] py-1 md:py-2 cursor-pointer rounded ${activeTab === "all" ? "bg-black text-white" : "border border-[#8f8f8f]"}`}
                onClick={() => applyTabFilter("all")}
              >
                All Data
              </button>
              <button
                className={`md:px-5 px-[9px] py-1 md:py-2 cursor-pointer rounded ${activeTab === "day" ? "bg-black text-white" : "border border-[#8f8f8f]"}`}
                onClick={() => applyTabFilter("day")}
              >
                Day
              </button>
              <button
                className={`md:px-5 px-[9px] py-1 md:py-2 rounded cursor-pointer ${activeTab === "week" ? "bg-black text-white" : "border border-[#8f8f8f]"}`}
                onClick={() => applyTabFilter("week")}
              >
                This Week
              </button>
              <button
                className={`md:px-5 px-[9px] py-1 md:py-2 rounded cursor-pointer ${activeTab === "month" ? "bg-black text-white" : "border border-[#8f8f8f]"}`}
                onClick={() => applyTabFilter("month")}
              >
                This Month
              </button>
            </div>
          </div>

          {filteredServices.length === 0 ? (
            <div className="text-gray-600 text-center">No services found.</div>
          ) : (
            <div className="bg-white shadow rounded-xl p-4 border border-gray-200 ">
              <table className="w-full text-left border-collapse overflow-auto md:w-full w-[90%] mx-auto">
                <thead>
                  <tr className="border-b border-[#dcdcdc]">
                    <th className="border p-2">Service Name</th>
                    <th className="border p-2">Price</th>
                    <th className="border p-2">Branch</th>
                    <th className="border p-2">Date</th>
                    <th className="border p-2">time</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredServices.map((s) => (
                    <tr
                      key={s.id}
                      className={`border-b border-[#dcdcdc] ${selectedRow === s.id ? "" : ""}`}
                      onClick={() => handleRowClick(s.id)}
                    >
                      <td className="border-r border-[#dcdcdc] p-2">{s.service_name}</td>
                      <td className="border-r border-[#dcdcdc] p-2">₹{s.price}</td>
                      <td className="border-r border-[#dcdcdc] p-2">{s.branch_name}</td>
                      <td className="border-r border-[#dcdcdc] p-2">
                        {new Date(s.selected_date).toLocaleDateString()}
                      </td>
                      <td className="border-r border-[#dcdcdc] p-2">
                        {formatTimeIST(s.selected_date)}
                      </td>


                    </tr>
                  ))}

                  <tr className="border-b border-[#dcdcdc] font-bold">
                    <td className="border-r border-[#dcdcdc] p-2">Total Price</td>
                    <td className="border-r border-[#dcdcdc] p-2">₹{totalPrice} /-</td>
                    <td className="border-r border-[#dcdcdc] p-2"></td>
                    <td className="border-r border-[#dcdcdc] p-2"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      </div>
    
  );
}
