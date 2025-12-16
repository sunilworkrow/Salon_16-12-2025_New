"use client";
import React, { useEffect, useState } from "react";
import { IoIosRemove } from "react-icons/io";
import { IoMdAdd } from "react-icons/io";

interface Service {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Category {
  category_name: string;
  services: Service[];
}

export default function StaffServicesPage() {
  const [data, setData] = useState<[string, Category][]>([]);
  // const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [showSelected, setShowSelected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const [activeTab, setActiveTab] = useState("all");

  // toast state
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | null;
    visible: boolean;
  }>({ message: "", type: null, visible: false });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type, visible: true });
    window.setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, 2000);
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token not found. Please login again.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${window.location.origin}/api/staffservices`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();
        console.log("API Response:", json);

        if (!json.success) {
          setError(json.message || "Failed to fetch services.");
          setData([]);
        } else if (!Array.isArray(json.data) || json.data.length === 0) {
          setData([]);
        } else {

          const toDataUrl = (img: any) => {
            const placeholder = "/images/placeholder.png";
            if (!img) return placeholder;


            if (typeof img === "string" && img.startsWith("data:")) return img;


            if (typeof img === "string" && /^https?:\/\//i.test(img)) return img;


            if (typeof img === "string" && img.startsWith("/")) {
              return `${window.location.origin}${img}`;
            }


            if (typeof img === "string") {

              const sample = img.slice(0, 100);
              if (/^[A-Za-z0-9+/=]+$/.test(sample.replace(/\s+/g, ""))) {
                // assume jpeg; change if your DB stores png or other types
                return `data:image/jpeg;base64,${img}`;
              }
            }

            // fallback
            return placeholder;
          };

          const grouped = json.data.reduce((acc: any, item: any) => {
            if (!acc[item.category_id]) {
              acc[item.category_id] = {
                category_name: item.category_name,
                services: [],
              };
            }

            acc[item.category_id].services.push({
              id: item.service_id,
              name: item.service_name,
              image: toDataUrl(item.service_image),
              price: Number(item.service_price) || 0,
              quantity: 1,
            });

            return acc;
          }, {});

          setData(Object.entries(grouped));
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Something went wrong while fetching services.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // const toggleCategory = (id: number) => {
  //   setExpandedCategory(expandedCategory === id ? null : id);
  // };

  const filteredData = activeTab === "all"  ? data  : data.filter(([catId]) => catId === activeTab);



  const submitServices = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Token not found");

    try {
      const res = await fetch(`${window.location.origin}/api/staffSelectedServices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ services: selectedServices }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("Services submitted successfully!", "success");
        setSelectedServices([]);
        setShowSelected(false);
      } else {
        showToast(data.message || "Failed to submit services", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Something went wrong!", "error");
    }
  };

  const toggleService = (service: Service) => {
    const existing = selectedServices.find((s) => s.id === service.id);

    if (existing) {
      setSelectedServices((prev) => prev.filter((s) => s.id !== service.id));
    } else {
      setSelectedServices((prev) => [...prev, { ...service, quantity: 1 }]);
    }
  };

  const increaseQuantity = (serviceId: number) => {
    setSelectedServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, quantity: s.quantity + 1 } : s))
    );
  };

  const decreaseQuantity = (serviceId: number) => {
    setSelectedServices((prev) =>
      prev.map((s) =>
        s.id === serviceId && s.quantity > 1 ? { ...s, quantity: s.quantity - 1 } : s
      )
    );
  };

  const totalPrice = selectedServices.reduce(
    (sum, service) => sum + service.price * service.quantity,
    0
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg font-semibold">Loading services...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500 font-semibold">
        {error}
      </div>
    );
  }

  return (

    <div style={{
      backgroundImage:
        "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/img/bg.jpg')",
    }}>

      <div className="relative py-2 md:px-14 px-4 min-h-screen">
        {/* Toast */}
        <div aria-live="polite" className="pointer-events-none fixed top-6 right-6 z-50">
          <div
            className={`max-w-xs w-full transform transition-all duration-300 origin-top-right ${toast.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
              }`}
          >
            {toast.type === "success" && (
              <div role="status" className="pointer-events-auto rounded-lg shadow-lg px-4 py-2 bg-green-600 text-white font-medium">
                {toast.message}
              </div>
            )}

            {toast.type === "error" && (
              <div role="status" className="pointer-events-auto rounded-lg shadow-lg px-4 py-2 bg-red-600 text-white font-medium">
                {toast.message}
              </div>
            )}
          </div>
        </div>

        {showSelected ? (

          <div>
            <div className="flex justify-between md:my-6 my-4 items-center">
              <h1 className="text-2xl font-bold text-[#ffffff]">Selected Services</h1>

              <button className="bg-black text-white rounded-lg px-10 py-2 hover:bg-gray-800" onClick={() => setShowSelected(false)}>
                Back
              </button>
            </div>

            {selectedServices.length === 0 ? (
              <div className="text-center text-gray-600">No services selected.</div>
            ) : (
              <div>
                <div className="space-y-2">
                  {selectedServices.map((s) => (
                    <div key={s.id} className="bg-white rounded-xl shadow p-4 border border-gray-200 flex justify-between items-center">

                      <div className="flex items-center gap-2">
                        <img
                          className="h-[40px] w-[40px] rounded-md object-cover"
                          src={s.image}
                          alt={s.name}
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/images/placeholder.png";
                          }}
                        />
                        <span className="font-medium">{s.name}</span>
                        <h2 className="font-semibold md:hidden text-[18px]">₹{s.price * s.quantity}</h2>
                      </div>

                      <div className="md:flex items-center gap-5 hidden">
                        <div className="flex gap-2 items-center">
                          <button onClick={() => increaseQuantity(s.id)} className="border-1 border-[#9f9f9f] text-[#484848] px-[6px] py-[2px] flex items-center justify-center rounded-md w-[37px]">
                            <IoMdAdd />
                          </button>
                          <span className="w-[18px] text-center">{s.quantity}</span>
                          <button onClick={() => decreaseQuantity(s.id)} className="border-1 border-[#9f9f9f] text-[#484848] px-[6px] py-[2px] flex items-center justify-center rounded-md w-[37px]">
                            <IoIosRemove />
                          </button>
                        </div>

                        <span className="font-semibold">₹{s.price * s.quantity}</span>

                        <button onClick={() => toggleService(s)} className="px-4 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700">
                          Remove
                        </button>
                      </div>

                      <div className="md:hidden text-end">
                        <button onClick={() => toggleService(s)} className="px-4 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700">
                          Remove
                        </button>

                        <div className="flex gap-[3px] items-center mt-2">
                          <button onClick={() => increaseQuantity(s.id)} className="border-1 border-[#9f9f9f] text-[#484848] px-[6px] py-[2px] flex items-center justify-center rounded-md w-[37px]">
                            <IoMdAdd />
                          </button>
                          <span className="w-[18px] text-center">{s.quantity}</span>
                          <button onClick={() => decreaseQuantity(s.id)} className="border-1 border-[#9f9f9f] text-[#484848] px-[6px] py-[2px] flex items-center justify-center rounded-md w-[37px]">
                            <IoIosRemove />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex justify-between font-bold text-lg text-[#ffffff]">
                  <span>Total:</span>
                  <span className="text-[22px] border-b-[3px] border-[#ffffff]">₹{totalPrice} /-</span>
                </div>

                <div className="flex justify-center mt-6">
                  <button className="bg-black text-white rounded-lg px-10 py-2 hover:bg-gray-800" onClick={submitServices}>
                    Submit
                  </button>
                </div>
              </div>
            )}
          </div>

        ) : (

          <div className="space-y-4">
            <h1 className="text-2xl font-bold md:mb-3 md:mt-6 text-[#ffffff]">Staff Services List</h1>


            <div className="p-4 mb-4 rounded border border-[#dcdcdc] bg-white rounded-lg">
              <div className="space-y-2 space-x-2">

                {/* ALL CATEGORY BUTTON */}
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-5 py-2 cursor-pointer rounded 
                 ${activeTab === "all" ? "bg-black text-white" : "border border-[#8f8f8f]"}`}
                >
                  All Category
                </button>

                {/* CATEGORY BUTTONS */}
                {data.map(([catId, category]) => (
                  <button
                    key={catId}
                    onClick={() => setActiveTab(catId)}
                    className={` px-5 py-2 cursor-pointer rounded 
                  ${activeTab === catId ? "bg-black text-white" : "border border-[#8f8f8f]"}`}
                  >
                    {category.category_name}
                  </button>
                ))}
              </div>

            </div>



            {data.length === 0 ? (
              <div className="text-gray-600 text-center">No services found.</div>
            ) : (
              filteredData.map(([catId, category]) => (

                <div key={catId} className="bg-white md:rounded-2xl rounded-md shadow-md p-4">
                  <div

                    className="cursor-pointer flex justify-between items-center transition">
                    <h2 className="text-lg font-semibold text-gray-800">{category.category_name}</h2>
                  </div>


                  <div className="py-4">
                    <div className="grid grid-cols-12 gap-4">
                      {category.services.map((service) => {
                        const isSelected = selectedServices.some((s) => s.id === service.id);

                        return (

                          <div
                            key={service.id}
                            onClick={() => toggleService(service)}
                            className="flex items-center justify-between md:col-span-6 col-span-12 p-4 bg-white border border-gray-200 rounded-lg transition cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                className="h-[60px] w-[60px] rounded-md object-cover"
                                src={service.image}
                                alt={service.name}
                                loading="lazy"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = "/images/placeholder.png";
                                }}
                              />


                              <div className="font-medium text-[17px] text-gray-800">{service.name}</div>

                            </div>

                            <div className="flex items-center gap-3">


                              <div className="text-[#23415a] text-[17px] font-semibold">₹{service.price}</div>

                              <button
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                  e.stopPropagation();
                                  toggleService(service);
                                }}
                                className={`px-4 py-2 rounded-md text-white font-medium w-full ${isSelected ? "bg-red-600 hover:bg-red-700" : "bg-black hover:bg-gray-800"}`}
                              >
                                {isSelected ? "Remove" : "Add Service"}
                              </button>
                            </div>


                          </div>


                        );
                      })}
                    </div>
                  </div>

                  {/* )} */}

                </div>
              ))
            )}

            <div className="flex justify-center">
              <button className="hover:bg-blue-600 bg-[#ffffff] text-[#000000] font-semibold rounded-lg mt-4 py-2 px-14" onClick={() => setShowSelected(true)}>
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
