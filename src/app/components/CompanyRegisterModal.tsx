"use client";

import { useState } from "react";
import { useUser } from "../context/UserContext";
import { MdFormatTextdirectionLToR } from "react-icons/md";
import { LiaIndustrySolid } from "react-icons/lia";
import { FaCheck } from "react-icons/fa6"
import { useRouter } from "next/navigation";


export default function CompanyRegisterModal({
  onClose,
  email,
  userId,
}: {
  onClose: () => void;
  userId: number | undefined;
  email: string;
}) {
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [modal, setModal] = useState(false)


  const { user, setUser } = useUser();

const router = useRouter();

  const handleSubmit = async () => {
    if (!companyName || !industry || !address) {
      setMessage("Please fill in all fields.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/company", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "register",
        userId,
        companyName,
        industry,
        address,
      }),
    });

    const data = await res.json();

    if (data.success && data.companies_id) {

      setUser({
        ...user!,
        companies_id: data.companies_id,
      });

      await fetch("/api/signup/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // router.push(`/verify-email?email=${email}`);
       setModal(true);
      return;

    
    }

   

    setMessage(data.message || "Failed to register company.");
    setLoading(false);
  };


  const handleClose = () => {

    // setModal(false)
    // onClose()

    router.push("/login")

  }

  return (
    <div className="fixed inset-0 bg-[#00000080] bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white text-black p-8 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">Register Your Company</h2>

        <div className="space-y-4">

          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <MdFormatTextdirectionLToR className="h-5 w-5 text-gray-400" />

            </div>
            <input
              type="text"
              placeholder="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="pl-12 h-12 rounded-lg w-full bg-[aliceblue] border-l-4"
            />
          </div>

          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <LiaIndustrySolid className="h-5 w-5 text-gray-400" />

            </div>
            <input
              type="text"
              placeholder="Industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="pl-12 h-12 rounded-lg w-full bg-[aliceblue] border-l-4"
            />
          </div>


          <textarea
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-[aliceblue] border-[#dcdcdc] pl-2 rounded-lg border p-2 rounded resize-none"
            rows={3}
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg mt-4"
          disabled={loading}
        >
          {loading ? "Register Company" : "Register Company"}
        </button>

      </div>

      {
        modal && (
          <>
            <div className="fixed inset-0 bg-[#00000080] bg-opacity-60 flex items-center justify-center z-50">
              <div className="bg-white text-black p-8 rounded-lg w-full max-w-md shadow-lg text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaCheck className="text-white text-[35px]" />
                </div>
                <h2 className="text-[16px]  text-gray-600  mb-4">
                  You have registered successfully! A verification email has been sent. Please check your Eamil - <b className="text-bold">{email}</b> verify your account.

                </h2>

                <button
                  onClick={handleClose}
                  className="w-auto  px-10 py-1 bg-white text-gray-800 hover:bg-gray-50 rounded-full border border-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </>
        )
      }

    </div>
  );
}
