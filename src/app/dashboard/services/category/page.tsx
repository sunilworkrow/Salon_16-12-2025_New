"use client";

import { useState, useEffect } from "react";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { MdKeyboardBackspace } from "react-icons/md";
import Modal from "@/app/components/login-modal";
import { useUser } from "@/app/context/UserContext";
import { FaRegEdit } from "react-icons/fa";


interface Branch {
  id: number;
  name: string;
}

export default function Page() {
  const [Category, setCategory] = useState<Branch[]>([]);

  const [showAddBranch, setShowAddBranch] = useState(false);
  const [name, setName] = useState("");
  const [modalType, setModalType] = useState<"success" | null>(null);
  const [modalMessage, setModalMessage] = useState("");
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [editedName, setEditedName] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);


  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { user } = useUser();

  console.log("User object:", user);


  const fetchCategory = async () => {
    try {

      const token = localStorage.getItem("token");

      const res = await fetch("/api/category", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      if (res.ok && result.success && Array.isArray(result.data)) {
        setCategory(result.data);
      } else {
        setCategory([]);
      }
    } catch (err) {
      console.error("Error fetching Category:", err);
      setCategory([]);
    }
  };


  useEffect(() => {
    if (user?.companies_id) {
      fetchCategory();
    }
  }, [user?.companies_id]);



  // Add new category

  const handleSubmit = async () => {
    const newErrors: { name?: string } = {};
    if (!name.trim()) {
      newErrors.name = "Name is required";
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const user_id = user?.id;
    const companies_id = user?.companies_id;
    const token = localStorage.getItem("token"); // ✅ get token

    if (!user_id || !companies_id || !token) {
      setModalMessage("User, Company ID, or Token is missing");
      setModalType("success");
      return;
    }

    try {
      const res = await fetch("/api/category", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // ✅ add token here
        },
        body: JSON.stringify({ name, user_id, companies_id }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setName("");
        setModalMessage("Category added successfully!");
        setModalType("success");
        fetchCategory();
        setShowAddBranch(false);
      } else {
        setModalMessage(data.message || "Something went wrong");
        setModalType("success");
      }
    } catch (err) {
      console.error("Add error:", err);
      setModalMessage("Something went wrong");
      setModalType("success");
    }
  };





  const handleEdit = (id: number) => {
    const branch = Category.find((b) => b.id === id);
    if (branch) {
      setEditingBranch(branch);
      setEditedName(branch.name);
      setIsEditModalOpen(true);
    }
  };

  // update 

  const handleUpdateSubmit = async () => {
    if (!editingBranch) return;

    const user_id = user?.id;
    const companies_id = user?.companies_id;

    if (!user_id || !companies_id) {
      console.error("User or Company info missing!");
      return;
    }

    // ✅ Get token (adjust based on your storage)
    const token = localStorage.getItem("token"); // or from context

    if (!token) {
      console.error("Token missing!");
      return;
    }

    try {
      const res = await fetch("/api/category", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // ✅ Add token here
        },
        body: JSON.stringify({
          id: editingBranch.id,
          name: editedName,
          user_id,
          companies_id,
        }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        fetchCategory();
        setIsEditModalOpen(false);
        setEditingBranch(null);
      } else {
        console.error("Update failed:", result.message);
      }
    } catch (err) {
      console.error("Error updating:", err);
    }
  };



  // Delete category
  const handleDelete = async (id: number) => {
    // ✅ Get token from localStorage (or wherever you store it)
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("Token missing!");
      return;
    }

    try {
      const res = await fetch("/api/category", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // ✅ Token header
        },
        body: JSON.stringify({ id }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        fetchCategory();

        setShowDeleteConfirm(false);

        setToastMessage("Service Category deleted successfully!");
        setShowToast(true);

        setTimeout(() => {
          setShowToast(false);
          setToastMessage("");
        }, 2000);

      } else {
        console.error("Delete failed:", result.message);
      }
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };







  return (
    <div className="w-full">

      {modalType && (
        <Modal
          modalType={modalType}
          message={modalMessage}
          errors={{}}
          onClose={() => setModalType(null)}
        />
      )}


      <div className="rounded-lg md:p-6 p-4 border bg-[#ffffff] border-[#dcdcdc] mb-6">
        <h1 className="text-2xl font-bold">Services Category</h1>
      </div>


      {!showAddBranch ? (
        <div>

          <div className="bg-black text-white rounded-t-lg px-6 py-3 border border-[#3a3a3a] flex justify-between items-center">
            <h2 className="text-lg font-medium">List of Categories</h2>
            <button
              onClick={() => setShowAddBranch(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2  py-2 px-4 rounded-lg transition-colors font-medium flex items-center gap-2"
            >
              <FiPlus className="w-4 h-4" />
            </button>
          </div>


          <div className="rounded-b-lg p-6 mb-6 border bg-[#ffffff] border-[#dcdcdc]">
            <table className="w-full border border-[#dcdcdc]">
              <thead>
                <tr>
                  <th className="text-left py-4 md:px-6 px-4 border border-gray-600">Category Name</th>
                  <th className="text-left py-4 md:px-6 px-4 border border-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Category.map((branch) => (
                  <tr key={branch.id} className="border-b border-[#dcdcdc]">
                    <td className="py-4 md:px-6 px-4 border-r border-[#dcdcdc]">{branch.name}</td>
                    <td className="py-4 md:px-6 px-4 border-r border-[#dcdcdc]">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(branch.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm flex gap-1 items-center"
                        >
                          <FaRegEdit className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => {
                            setDeleteId(branch.id);      // store id
                            setShowDeleteConfirm(true);  // open modal
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm flex gap-1 items-center"
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
      ) : (
        // Add New Form
        <div>
          <div className="bg-black text-white rounded-t-lg px-6 py-3 border border-[#3a3a3a] flex justify-between items-center">
            <h2 className="text-lg font-medium">Add New Category</h2>
            <button
              onClick={() => setShowAddBranch(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center gap-2"
            >
              <MdKeyboardBackspace className="text-[20px]" />
            </button>
          </div>

          <div className="rounded-b-lg p-6 border bg-[#ffffff] border-[#dcdcdc] text-gray-600">
            <div>
              <label className="block text-sm font-medium mb-2">
                Enter Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-[#ffffff] border-[#dcdcdc] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="category..."
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div className="flex justify-center pt-6">
              <button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors font-medium"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-[#00000080] flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center text-gray-900">
            <h2 className="text-2xl font-bold mb-4">Edit Category</h2>
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-auto px-10 py-1 bg-white text-gray-800 border border-gray-300 rounded-full font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSubmit}
                className="w-auto px-10 py-1 bg-white text-gray-800 border border-gray-300 rounded-full font-semibold"
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
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteId(null);
                }}
                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
              >
                No
              </button>


              <button
                onClick={() => deleteId !== null && handleDelete(deleteId)}
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
  );
}
