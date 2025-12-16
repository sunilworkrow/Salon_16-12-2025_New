"use client";

import React, { useEffect, useState } from "react";

interface StaffClients {
  id: number;
  staff_id: number;
  service_id: number;
  price: string | number;
  branch_id: number;
  companies_id: number;
  created_at: string;
  branch_name?: string;
  service_name?: string;
  staff_name?: string;
}

export default function Page() {
  const [data, setData] = useState<StaffClients[]>([]);
  const [filteredData, setFilteredData] = useState<StaffClients[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [staffName, setStaffName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchClients = async () => {
    const token = localStorage.getItem("token");

    try {

      const res = await fetch("/api/staff-services-list", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (res.ok && result.success && Array.isArray(result.data)) {
        setData(result.data);
        setFilteredData(result.data); // default show all
      } else {
        console.error("Unexpected data format", result);
        setData([]);
      }
    } catch (err) {
      console.error("Error fetching clients:", err);
      setData([]);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

 const formatDate = (dateString: string) => {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};



  // Get today's date info
  const today = new Date();
  const todayString = today.toISOString().split("T")[0];

  // Week start (Monday)
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1);
  const weekStartString = weekStart.toISOString().split("T")[0];

  // Month start
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthStartString = monthStart.toISOString().split("T")[0];




  const applyTabFilter = (tab: string) => {
    setActiveTab(tab);

    if (tab === "all") {
      setFilteredData(data);
      return;
    }

    if (tab === "day") {
      setFilteredData(
        data.filter((item) => formatDate(item.created_at) === todayString)
      );
      return;
    }

    if (tab === "week") {
      setFilteredData(
        data.filter((item) => {
          const d = formatDate(item.created_at);
          return d >= weekStartString && d <= todayString;
        })
      );
      return;
    }

    if (tab === "month") {
      setFilteredData(
        data.filter((item) => {
          const d = formatDate(item.created_at);
          return d >= monthStartString && d <= todayString;
        })
      );
      return;
    }
  };




  // ---------------- FILTER FUNCTION ----------------
  const handleFilter = () => {
    let filtered = data;

    if (staffName) {
      filtered = filtered.filter((item) => item.staff_name === staffName);
    }

    if (startDate) {
      filtered = filtered.filter(
        (item) => formatDate(item.created_at) >= startDate
      );
    }

    if (endDate) {
      filtered = filtered.filter(
        (item) => formatDate(item.created_at) <= endDate
      );
    }

    setFilteredData(filtered);
  };

  // Extract unique staff names for dropdown
  const uniqueStaffNames = Array.from(
    new Set(data.map((item) => item.staff_name))
  );

  return (
    <div className="w-full">

      {/* Page Header */}
      <div className="rounded-lg md:p-6 p-4 border bg-[#ffffff] border-[#dcdcdc] mb-6">
        <h1 className="text-2xl font-bold">Staff Services</h1>
      </div>

      {/* ---------------- FILTER SECTION ---------------- */}
      <div className="p-4 mb-4 rounded border border-[#dcdcdc] bg-white rounded-lg overflow-auto">
        <div className="flex gap-4 whitespace-nowrap">

          <button
            className={`md:px-5 px-4 py-2 cursor-pointer rounded ${activeTab === "all" ? "bg-black text-white" : "border border-[#8f8f8f]"
              }`}
            onClick={() => applyTabFilter("all")}
          >
            All Data
          </button>

          <button
            className={`md:px-5 px-4 py-2 cursor-pointer rounded ${activeTab === "day" ? "bg-black text-white" : "border border-[#8f8f8f]"
              }`}
            onClick={() => applyTabFilter("day")}
          >
            Day
          </button>

          <button
            className={`md:px-5 px-4 py-2 rounded cursor-pointer ${activeTab === "week" ? "bg-black text-white" : "border border-[#8f8f8f]"
              }`}
            onClick={() => applyTabFilter("week")}
          >
            This Week
          </button>

          <button
            className={`md:px-5 px-4 py-2 rounded cursor-pointer ${activeTab === "month" ? "bg-black text-white" : "border border-[#8f8f8f]"
              }`}
            onClick={() => applyTabFilter("month")}
          >
            This Month
          </button>

        </div>
      </div>


      {/* ---------------- TABLE ---------------- */}
      <div>
        <div className="bg-black text-white rounded-t-lg px-6 py-3 border border-[#3a3a3a] flex justify-between items-center">
          <h2 className="text-lg font-medium">List of Staff Services</h2>
        </div>

        <div className="rounded-b-lg md:p-6 p-4 mb-6 border bg-[#ffffff] border-[#dcdcdc]">

          {/* ---------------- FILTER SECTION ---------------- */}
          <div className=" mb-4">
            <h2 className="font-semibold mb-3">Filter Data</h2>

            {/* Staff Name Filter */}
            <div className="flex gap-4 mb-3 overflow-auto">
              <select
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                className="border px-3 py-2 rounded md:w-1/3"
              >
                <option value="">Select staff name</option>
                {uniqueStaffNames.map((name, index) => (
                  <option key={index} value={name!}>
                    {name}
                  </option>
                ))}
              </select>

              {/* Start Date */}
              <input
                type="date"
                className="border px-3 py-2 rounded"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />

              {/* End Date */}
              <input
                type="date"
                className="border px-3 py-2 rounded"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />

              {/* Submit Button */}
              <button
                onClick={handleFilter}
                className="bg-black text-white md:px-5 px-4 py-2 rounded"
              >
                Submit
              </button>
            </div>
          </div>
          <div className="overflow-x-auto whitespace-nowrap">
            <table className="w-full border border-gray-800">
              <thead>
                <tr>
                  <th className="text-left py-4 px-4 md:px-6 border border-gray-600">Staff Name</th>
                  <th className="text-left py-4 px-4 md:px-6 border border-gray-600">Service Name</th>
                  <th className="text-left py-4 px-4 md:px-6 border border-gray-600">Price</th>
                  <th className="text-left py-4 px-4 md:px-6 border border-gray-600">Branch</th>
                  <th className="text-left py-4 px-4 md:px-6 border border-gray-600">Date</th>
                </tr>
              </thead>

              <tbody>
                {filteredData.map((row) => (
                  <tr key={row.id} className="border-b border-l border-[#dcdcdc]">
                    <td className="py-4 px-4 md:px-6 border-r border-[#dcdcdc]">{row.staff_name}</td>
                    <td className="py-4 px-4 md:px-6 border-r border-[#dcdcdc]">{row.service_name}</td>
                    <td className="py-4 px-4 md:px-6 border-r border-[#dcdcdc]">{row.price}</td>
                    <td className="py-4 px-4 md:px-6 border-r border-[#dcdcdc]">{row.branch_name}</td>
                    <td className="py-4 px-4 md:px-6 border-r border-[#dcdcdc]">
                      {formatDate(row.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredData.length === 0 && (
              <p className="text-center py-4 text-gray-600">
                No records found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
