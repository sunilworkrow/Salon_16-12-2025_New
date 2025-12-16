"use client";

import { useState, useEffect } from "react";
import { IoMdArrowBack } from "react-icons/io";
import Modal from "@/app/components/login-modal";
import { useUser } from "@/app/context/UserContext";
import { AiOutlineFileAdd } from "react-icons/ai";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi"
import { FaRegEdit } from "react-icons/fa";
import { MdKeyboardBackspace } from "react-icons/md";


interface Service {
  id: number;
  name: string;
  price: string;
  branch_name: string;
  category_name: string;
 branch_id: number;
category_id: number;
  image: string;
}



export default function Page() {
  const [Category, setCategory] = useState<Service[]>([]);
  const [branches, setBranches] = useState<Service[]>([]);
  const [modalType, setModalType] = useState<"success" | null>(null);
  const [modalMessage, setModalMessage] = useState("");

  const [services, setServices] = useState<Service[]>([]);

  const [showAddBranch, setShowAddBranch] = useState(false);

  const [editingBranch, setEditingBranch] = useState<Service | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedBranch, setEditedBranch] = useState("");
  const [editedCategory, setEditedCategory] = useState("");
  const [editedImage, setEditedImage] = useState("");
  const [editedPrice, setEditedPrice] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const [actButton, aetActButton] = useState("all")

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [errors, setErrors] = useState<{

    name?: string;
    price?: string;
    branch?: string;
    category?: string;
    image?: string;
  }>({});

  const { user } = useUser();


  //  console.log("User info hsgdfsdh:", user);


  // category api use 

  const fetchCategory = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("/api/category", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          companies_id: user?.companies_id?.toString() || "",
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

  // branch api use 

  const fetchBranches = async () => {
    try {

      const token = localStorage.getItem("token");

      const res = await fetch("/api/branches", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      // console.log("result.data", result);

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
      fetchBranches();
    }
  }, [user?.companies_id]);



  useEffect(() => {
    fetchCategory();
    fetchBranches();
  }, []);


  const filteredServices =
    actButton === "all"
      ? services
      : services.filter(s => String(s.branch_id) === actButton)




  const validateForm = () => {
    const newErrors: {
      name?: string;
      price?: string;
      branch?: string;
      category?: string;
      image?: string;
    } = {};

    if (!name.trim()) newErrors.name = "Service name is required";
    if (!image.trim()) newErrors.name = "Service image is required";
    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0) newErrors.price = "Valid price is required";
    if (!selectedBranch) newErrors.branch = "Branch is required";
    if (!selectedCategory) newErrors.category = "Category is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    if (!validateForm()) return;

    try {
      const response = await fetch("/api/all-services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          price,
          image,
          branch_id: selectedBranch,
          category_id: selectedCategory,

        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setModalMessage("Service added successfully!");
        setModalType("success");

        const branchName = branches.find(b => b.id.toString() === selectedBranch)?.name || "";
        const categoryName = Category.find(c => c.id.toString() === selectedCategory)?.name || "";

        setServices(prev => [
          ...prev,
          {
            id: result.insertId || Date.now(),
            name,
            price,
            image,
            branch_id: Number(selectedBranch),
            category_id: Number(selectedCategory),
            branch_name: branchName,
            category_name: categoryName,
          },
        ]);

        setName("");
        setPrice("");
        setImage("");
        setSelectedBranch("");
        setSelectedCategory("");
        setShowAddBranch(false);
      } else {
        setModalMessage(result.message || "Something went wrong");
        setModalType("success");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setModalMessage("Something went wrong");
      setModalType("success");
    }
  };



  // ************************** get all services ********************************


  const fetchServices = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/all-services", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (res.ok && result.success && Array.isArray(result.data)) {
        setServices(result.data);
      } else {
        console.error("Unexpected data format", result);
        setServices([]);
      }
    } catch (err) {
      console.error("Error fetching Services:", err);
      setServices([]);
    }
  };



  useEffect(() => {
    if (!user?.companies_id) return;

    fetchCategory();
    fetchBranches();
    fetchServices();
  }, [user?.companies_id]); // ensures stable array length




  // ************************** delete services ********************************



  const handleDeleteService = async (id: number) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/all-services", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setServices(prev => prev.filter(service => service.id !== id));

        setShowDeleteConfirm(false);

        setToastMessage("Service deleted successfully!");
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


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string); // Base64 string
    };
    reader.readAsDataURL(file);
  };


  const handleEdit = (id: number) => {
    const service = services.find(s => s.id === id);

    if (service) {
      setEditingBranch(service);
      setEditedName(service.name);
      setEditedPrice(service.price);
      setEditedImage(service.image);

      // Use IDs, not names!
      setEditedBranch(service.branch_id?.toString() ?? "");
      setEditedCategory(service.category_id?.toString() ?? "");

      setIsEditModalOpen(true);
    }
  };





  // update submit

  const handleUpdateSubmit = async () => {
    if (!editingBranch) return;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/all-services", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: editingBranch.id,
          name: editedName,
          price: editedPrice,
          image: editedImage,
          branch_id: editedBranch,
          category_id: editedCategory,
        }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setServices(prev =>
          prev.map(s =>
            s.id === editingBranch.id
              ? {
                ...s,
                name: editedName,
                price: editedPrice,
                image: editedImage,
                branch_id: Number(editedBranch),
                category_id: Number(editedCategory),

                branch_name: branches.find(b => b.id.toString() === editedBranch)?.name || s.branch_name,
                category_name: Category.find(c => c.id.toString() === editedCategory)?.name || s.category_name,
              }
              : s
          )
        );


        setIsEditModalOpen(false);
        setEditingBranch(null);
      }



      else {
        console.error("Update failed:", result.message);
      }
    } catch (err) {
      console.error("Error updating branch:", err);
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
        <h1 className="text-2xl font-bold">All Services</h1>
      </div>

      <div className="p-4 mb-4 rounded border border-[#dcdcdc] bg-white rounded-lg">
        <div className="space-y-2 space-x-2">

          <button
            onClick={() => aetActButton("all")}
            className={`px-5 py-2 cursor-pointer rounded 
  ${actButton === "all" ? "bg-black text-white" : "border border-[#8f8f8f]"}`}
          >
            All Branches
          </button>

          {branches.map((branch) => (
            <button
              key={branch.id}
              onClick={() => aetActButton(String(branch.id))}
              className={`px-5 py-2 cursor-pointer rounded 
      ${actButton === String(branch.id) ? "bg-black text-white" : "border border-[#8f8f8f]"}`}
            >
              {branch.name}
            </button>
          ))}

        </div>
      </div>


      {
        !showAddBranch ? (
          <div>

            <div className="bg-black text-white rounded-t-lg md:px-6 px-4 py-3 border border-[#3a3a3a] flex justify-between items-center">
              <h2 className="text-lg font-medium">List of Services</h2>
              <button
                onClick={() => setShowAddBranch(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                <FiPlus className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-12 gap-3  rounded-b-lg md:p-6 p-4 mb-6 border bg-[#ffffff] border-[#dcdcdc] ">

              {
                filteredServices.map((service) => (

                  <div key={service.id} className="md:col-span-3 col-span-12 w-full max-w-sm shadow-lg border border-[#dcdcdc] rounded-b-lg bg-[#ffffff]">
                    <div className="bg-blue-500 h-4 rounded-t-lg p-0 " />
                    <div className="md:p-6 p-4 space-y-4    text-gray-800">
                      <div className="flex justify-center items-center">
                        <img className="h-[82px] w-[80px] rounded-md object-cover" src={service.image} />
                      </div>

                      <div className="flex items-center gap-3 justify-center mb-3">

                        <span className="text-xl font-semibold ">{service.name}</span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="">Branch -</span>
                          <span className=" font-medium">{service.branch_name}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className=" font-medium">Category -</span>
                          <span className="">{service.category_name}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className=" font-medium">Price -</span>
                          <span className=" font-semibold">{service.price}</span>
                        </div>


                      </div>

                      <div className="flex gap-3 justify-center items-center">

                        <button

                          onClick={() => {
                            setDeleteId(service.id);
                            setShowDeleteConfirm(true);
                          }}

                          className="flex items-center justify-center gap-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors font-medium cursor-pointer">
                          <FiTrash2 className="w-3 h-3" />

                        </button>

                        <button
                          onClick={() => handleEdit(service.id)}
                          className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors font-medium  cursor-pointer flex items-center justify-center gap-1"
                        >
                          <FaRegEdit className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                ))
              }



            </div>

          </div>
        ) : (


          //  Add New Form
          <div>
            <div className="bg-black text-white rounded-t-lg px-6 py-3 border border-[#3a3a3a] flex justify-between items-center">
              <h2 className="text-lg font-medium">Add New Service</h2>
              <button
                onClick={() => setShowAddBranch(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg flex items-center gap-2"
              >
                <MdKeyboardBackspace className="text-[20px]" />
              </button>
            </div>

            <div className="rounded-b-lg p-6 border bg-[#ffffff] border-[#dcdcdc] text-gray-800">
              <div className="mb-2">
                <label className="block text-sm font-medium mb-2">
                  Enter Service Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border bg-[#ffffff] border-[#dcdcdc] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="service"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}

              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium mb-2">
                  Branch Name <span className="text-red-500">*</span>
                </label>

                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full px-3 py-3 rounded-lg border bg-[#fffff] border-[#dcdcdc] focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                {errors.branch && <p className="text-red-500 text-sm mt-1">{errors.branch}</p>}

              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium mb-2">
                  Category Name <span className="text-red-500">*</span>
                </label>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-3 rounded-lg border bg-[#fffff] border-[#dcdcdc] focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {Category.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}


              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium mb-2">
                  Uplode image
                </label>
                <div className="flex items-center w-full pl-3 gap-1 py-2 rounded-lg border bg-[#ffffff] border-[#dcdcdc]">
                  <AiOutlineFileAdd className="text-[18px]" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full pr-3 py-2 rounded-lg border-0 bg-[#ffffff] border-[#dcdcdc]"
                  />
                </div>
                {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}

                {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}

              </div>


              <div className="mb-2">
                <label className="block text-sm font-medium mb-2">
                  Price  (INR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border bg-[#ffffff] border-[#dcdcdc] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}

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
        )
      }


      {
        isEditModalOpen && (
          <div className="fixed inset-0 bg-[#00000080] bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-gray-900">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center border-b-1 pb-2">Edit Services</h2>



              <div className="mb-4">
                <label className="block text-sm font-medium ">
                  Service Name <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full px-3 py-[10px] rounded-lg border bg-[#ffffff] border-[#dcdcdc] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium ">
                  Branch Name <span className="text-red-500">*</span>
                </label>

                <select
                  value={editedBranch}
                  onChange={(e) => setEditedBranch(e.target.value)}
                  className="w-full px-3 py-[10px] rounded-lg border border-[#dcdcdc]"
                >
                  <option value="">Select Branch</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>


              </div>


              <div className="mb-4">
                <label className="block text-sm font-medium ">
                  Category Name <span className="text-red-500">*</span>
                </label>

                <select
                  value={editedCategory}
                  onChange={(e) => setEditedCategory(e.target.value)}
                  className="w-full px-3 py-[10px] rounded-lg border border-[#dcdcdc]"
                >
                  <option value="">Select Category</option>
                  {Category.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>


              </div>

              <div className="flex items-center w-full pl-3 gap-1 py-2 rounded-lg border bg-[#ffffff] border-[#dcdcdc]">
                <AiOutlineFileAdd className="text-[18px]" />
                <input
                  type="file"
                  className="w-full pr-3 py-[10px] rounded-lg border-0 bg-[#ffffff] border-[#dcdcdc] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onloadend = () => setEditedImage(reader.result as string);
                    reader.readAsDataURL(file);
                  }}
                />
              </div>



              <div className="my-4">
                <label className="block text-sm font-medium ">
                  Price <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  value={editedPrice}
                  onChange={(e) => setEditedPrice(e.target.value)}
                  className="w-full px-3 py-[10px] rounded-lg border bg-[#ffffff] border-[#dcdcdc] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>


              <div className="flex justify-center gap-4 mt-4">

                <button
                  onClick={handleUpdateSubmit}
                  className="w-auto px-6 py-2 bg-green-700 hover:bg-green-800 text-[#ffffff] rounded-md border border-green-700 font-semibold cursor-pointer shadow-md"
                >
                  Update
                </button>

                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-auto px-6 py-2 bg-red-500 hover:bg-red-600 text-[#ffffff] rounded-md border border-red-500 font-semibold cursor-pointer shadow-md"
                >
                  Cancel
                </button>

              </div>
            </div>
          </div>
        )
      }




      {
        showDeleteConfirm && (
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


                {/* <button
                onClick={handleDeleteService}
                
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Yes
              </button> */}

                <button
                  onClick={() => deleteId !== null && handleDeleteService(deleteId)}
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                >
                  Yes
                </button>

              </div>
            </div>
          </div>
        )
      }


      {
        showToast && (
          <div className="fixed top-5 right-5 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-[9999] animate-fade-in">
            {toastMessage}
          </div>
        )
      }


    </div >
  );
}
