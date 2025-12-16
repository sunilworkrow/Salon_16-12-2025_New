"use client"

import { useState, useEffect } from "react"
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi"
import { FaRegEdit } from "react-icons/fa";
import { IoMdArrowBack } from "react-icons/io";
import { MdKeyboardBackspace } from "react-icons/md";
import Modal from "@/app/components/login-modal";
import { useUser } from "@/app/context/UserContext";

interface Branch {
  id: number
  name: string
  address: string
  city: string
  state: string
  country: string
  pin: number
}

export default function Page() {

  const [branches, setBranches] = useState<Branch[]>([]);



  const [showAddBranch, setShowAddBranch] = useState(false)
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [country, setCountry] = useState("")
  const [pin, setPin] = useState("")

  const [modalType, setModalType] = useState<"success" | null>(null);
  const [modalMessage, setModalMessage] = useState("");
  const [errors, setErrors] = useState<{ name?: string, address?: string, city?: string, state?: string, country?: string }>({});
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedAddress, setEditedAddress] = useState("");
  const [editedCity, setEditedCity] = useState("");
  const [editedState, setEditedState] = useState("");
  const [editedCountry, setEditedCountry] = useState("");
  const [editedPin, setEditedPin] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [deleteBranchId, setDeleteBranchId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);




  const { user } = useUser();


  const handleEdit = (id: number) => {
    const branch = branches.find((b) => b.id === id);
    if (branch) {
      setEditingBranch(branch);
      setEditedName(branch.name);
      setEditedAddress(branch.address);
      setEditedCity(branch.city);
      setEditedState(branch.state);
      setEditedCountry(branch.country);
      setEditedPin(branch.pin.toString());



      setIsEditModalOpen(true);
    }
  };


  const handleAddNew = () => {
    setShowAddBranch(true)
  }

  const handleBack = () => {
    setShowAddBranch(false)
  }


  // show all branch

  const fetchCategory = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("/api/branches", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      console.log("resultresultresultresult", result)

      if (res.ok && result.success && Array.isArray(result.data)) {
        setBranches(result.data);
      } else {
        setBranches([]);
      }
    } catch (err) {
      console.error("Error fetching Branches:", err);
      setBranches([]);
    }
  };



  useEffect(() => {
    if (user?.companies_id) {
      fetchCategory();
    }
  }, [user?.companies_id]);



  // save barnch in database 

  const handleSubmit = async () => {
    const newErrors: { name?: string; address?: string; city?: string; state?: string; country?: string; pin?: string; } = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!city.trim()) {
      newErrors.city = "city is required";
    }
    if (!state.trim()) {
      newErrors.state = "state is required";
    }
    if (!country.trim()) {
      newErrors.country = "country is required";
    }
    if (!pin.trim()) {
      newErrors.pin = "Address is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/branches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          address,  // ✅ send address to backend
          city,
          state,
          country,
          pin,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setName("");
        setAddress("");
        setModalMessage("Branch added successfully!");
        setModalType("success");
        fetchCategory();
        setShowAddBranch(false);
      } else {
        setModalMessage(data.message || "Something went wrong");
        setModalType("success");
      }
    } catch (err) {
      console.error("Branch error:", err);
      setModalMessage("Something went wrong");
      setModalType("success");
    }
  };




  // barnch delet code 

  const handleDelete = async () => {
    if (!deleteBranchId) return;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/branches", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: deleteBranchId }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setBranches((prev) => prev.filter((b) => b.id !== deleteBranchId));

        setShowDeleteConfirm(false);

        // Show toast
        setToastMessage("Branch deleted successfully!");
        setShowToast(true);

        setTimeout(() => {
          setShowToast(false);
          setToastMessage("");
        }, 2000);
      }


      else {
        console.error("Failed to delete branch:", result.message);
      }
    } catch (err) {
      console.error("Error deleting branch:", err);
    }
  };





  // update submit

  const handleUpdateSubmit = async () => {
    if (!editingBranch) return;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/branches", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: editingBranch.id,
          name: editedName,
          address: editedAddress,
          city: editedCity,
          state: editedState,
          country: editedCountry,
          pin: editedPin
        }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setBranches((prev) =>
          prev.map((b) =>
            b.id === editingBranch.id ? { ...b, name: editedName, address: editedAddress, city: editedCity, state: editedState, country: editedCountry, pin: editedPin } : b
          )
        );
        setIsEditModalOpen(false);
        setEditingBranch(null);
      } else {
        console.error("Update failed:", result.message);
      }
    } catch (err) {
      console.error("Error updating branch:", err);
    }
  };





  return (
    <div className="w-full mx-auto">

      {modalType && (
        <Modal
          modalType={modalType}
          message={modalMessage}
          errors={{}}
          onClose={() => setModalType(null)}
        />
      )}

      {/* Header */}
      <div className="rounded-lg md:p-6 p-4 border bg-[#ffffff] border-[#dcdcdc] mb-6">
        <h1 className="text-2xl font-bold">Branch</h1>
      </div>


      {!showAddBranch ? (

        <div>
          <div className="bg-black text-white rounded-t-lg md:px-6 px-4 py-3 border border-[#3a3a3a] flex justify-between items-center">
            <h2 className="text-lg font-medium hidden md:block">List Of Your Approved Branch</h2>
            <h2 className="text-lg font-medium md:hidden">List Of Approved Branch</h2>
            <div>
              <button
                onClick={handleAddNew}
                className="hidden md:flex bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors font-medium flex items-center gap-2 cursor-pointer"
              >
                <FiPlus className="w-4 h-4" />

              </button>

              <button
                onClick={handleAddNew}
                className="md:hidden bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors font-medium flex items-center gap-2 cursor-pointer"
              >
                <FiPlus className="w-4 h-4" />

              </button>
            </div>
          </div>

          <div className="rounded-b-lg md:p-6 p-4 mb-6 border bg-[#ffffff] border-[#dcdcdc]">
            <div className="overflow-auto">
              <table className="w-full border border-[#dcdcdc] whitespace-nowrap">
                <thead>
                  <tr>
                    <th className="text-left py-4 px-4 md:px-6 font-semibold border border-gray-600">Branch Name</th>
                    <th className="text-left py-4 px-4 md:px-6 font-semibold border border-gray-600">Address</th>
                    <th className="text-left py-4 px-4 md:px-6 font-semibold border border-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map((branch) => (
                    <tr key={branch.id} className="border-b border-[#dcdcdc]">
                      <td className="border-r border-[#dcdcdc] py-4 px-4 md:px-6">{branch.name}</td>
                      <td className="border-r border-[#dcdcdc] py-4 px-4 md:px-6">{branch.address}, {branch.city} {branch.state}, {branch.country}, {branch.pin}</td>
                      <td className="border-r border-[#dcdcdc] py-4 px-4 md:px-6">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(branch.id)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded flex items-center gap-1 text-sm"
                          >

                            <FaRegEdit className="w-3 h-3" />

                          </button>


                          <button
                            onClick={() => {
                              setDeleteBranchId(branch.id);
                              setShowDeleteConfirm(true);
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded flex items-center gap-1 text-sm"
                          >
                            <FiTrash2 className="w-3 h-3" />

                          </button>


                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (

        <div>
          <div className="bg-black text-white rounded-t-lg px-6 py-3 border border-[#3a3a3a] flex justify-between items-center">
            <h2 className="text-lg font-medium">Add Of Approved Branch</h2>
            <button
              onClick={handleBack}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-5 rounded-lg transition-colors font-medium flex items-center gap-2 cursor-pointer"
            >
              {/* <IoMdArrowBack  /> */}
              <MdKeyboardBackspace className="text-[20px]" />

            </button>
          </div>

          <div className="rounded-b-lg p-6 border bg-[#ffffff] border-[#dcdcdc] text-gray-600">

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-800 mb-1">

                Branch Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-[#ffffff] border-[#dcdcdc] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="branch..."
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}

            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-800 mb-1">

                Branch Street
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-[#ffffff] border-[#dcdcdc] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="address..."
              />

              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}

            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Branch City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-[#ffffff] border-[#dcdcdc] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="city..."
              />

              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}

            </div>



            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Branch State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-[#ffffff] border-[#dcdcdc] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="state..."
              />
              {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Branch Country
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-[#ffffff] border-[#dcdcdc] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="country..."
              />
              {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Branch Pin
              </label>
              <input
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-[#ffffff] border-[#dcdcdc] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="pin..."
              />
            </div>

            <div className="flex justify-center pt-6">
              <button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-6 rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                Submit
              </button>
            </div>

          </div>
        </div>
      )}


      {isEditModalOpen && (
        <div className="fixed inset-0 bg-[#00000080] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-gray-900">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Edit Branch</h2>

            {/* Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Branch Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-[#ffffff] border-[#dcdcdc] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Address */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-800 mb-1">Branch Street</label>
              <input
                type="text"
                value={editedAddress}
                onChange={(e) => setEditedAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-[#ffffff] border-[#dcdcdc] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* City */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-800 mb-1">Branch City</label>
              <input
                type="text"
                value={editedCity}
                onChange={(e) => setEditedCity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-[#ffffff] border-[#dcdcdc] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* State */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-800 mb-1">Branch State</label>
              <input
                type="text"
                value={editedState}
                onChange={(e) => setEditedState(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-[#ffffff] border-[#dcdcdc] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Country */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-800 mb-1">Branch Country</label>
              <input
                type="text"
                value={editedCountry}
                onChange={(e) => setEditedCountry(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-[#ffffff] border-[#dcdcdc] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Pin */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-800 mb-1">Branch Pin</label>
              <input
                type="text"
                value={editedPin}
                onChange={(e) => setEditedPin(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-[#ffffff] border-[#dcdcdc] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-10 py-1 bg-white hover:bg-gray-50 rounded-full border border-gray-300 mt-6 font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdateSubmit}
                className="px-10 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded-full mt-6 font-semibold"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}



      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-[#000000a1] bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
            <h2 className="text-lg font-bold text-gray-800">Confirm Delete</h2>
            <p className="mt-3 text-gray-600">Are you sure you want to delete this branch?</p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
              >
                No
              </button>

              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}


      {showToast && (
        <div className="fixed top-5 right-5 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-[9999] animate-fade-in">
          {toastMessage}
        </div>
      )}





    </div>
  )
}
