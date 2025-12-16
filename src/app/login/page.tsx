"use client";

import { useState } from "react";
import { CiLock, CiMail } from "react-icons/ci";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Modal from "../components/login-modal";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error" | "warning" | null>(null);
  const [modalMessage, setModalMessage] = useState("");

  const router = useRouter();

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    let hasError = false;

    if (!email.trim()) {
      newErrors.email = "Email is required";
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
      hasError = true;
    }

    if (!password) {
      newErrors.password = "Password is required";
      hasError = true;
    }

    setErrors(newErrors);
    return !hasError;
  };

  const handleSubmit = async () => {
    setErrors({});
    setShowModal(false);
    setModalType(null);
    setModalMessage("");

    if (!validate()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {


        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user)); // ✅ save user data

        setShowModal(false);

        if (data.user.role === 'admin') {
          router.push('/dashboard'); // admin dashboard
        } else if (data.user.role === 'staff') {
          router.push('/home'); // staff dashboard
        } else {
          alert('Invalid role');
        }
      }


      else {
        setModalMessage(data.message || "Login failed. Please check your credentials.");
        setModalType("error");
        setShowModal(true);
      }
    } catch (err) {
      setModalMessage("Something went wrong. Please try again later.");
      setModalType("error");
      setShowModal(true);
      console.error("Error deleting:", err);
    }

    setLoading(false);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleModalContinue = () => {
    setShowModal(false);
    if (modalType === "success") {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen md:flex flex-row-reverse">
      {/* Left side form */}
      <div className="hidden flex-1 md:flex items-center justify-center bg-gray-50 relative">
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full -translate-x-16 -translate-y-16"></div>

        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md mx-4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">Login</h2>

          <div className="space-y-6">
            {/* Email */}
            <div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <CiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  placeholder="Input your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-12 h-12 rounded-lg w-full bg-[aliceblue] border-l-4 text-[#000000] ${errors.email ? "border-l-red-500" : "border-l-blue-500"
                    }`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-2 pl-2">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <CiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  placeholder="Input your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-12 h-12 rounded-lg w-full bg-[aliceblue] border-l-4 text-[#000000] ${errors.password ? "border-l-red-500" : "border-l-blue-500"
                    }`}
                />
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-2 pl-2">{errors.password}</p>}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
              disabled={loading}
            >
              {loading ? "Processing..." : "LOGIN"}
            </button>

            {/* Forgot Password */}
            <div className="text-center text-blue-600">
              <Link href="/forgot-password">
                <button className="underline cursor-pointer">Forgot password</button>
              </Link>
            </div>
            <div className="md:hidden text-center">
              <Link href="/signup" prefetch={true}>
                <button className="bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-2 rounded-lg font-semibold text-sm transition-colors">
                  SIGN UP
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right side welcome message */}
      <div className="md:h-[auto] h-[100vh] flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-20 right-20 w-40 h-40 bg-blue-500/30 rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-60 h-60 bg-blue-400/20 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/10 rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-purple-600 to-pink-500 rounded-full translate-x-20 translate-y-20"></div>

        <div className="text-center text-white z-10">
          <h1 className="text-4xl font-bold mb-4">WELCOME!</h1>
          <p className="text-lg mb-8 opacity-90">Enter your details and start your journey with us</p>


          <div className="md:hidden flex-1 flex items-center justify-center bg-gray-50 relative rounded-2xl">


            <div className="bg-white p-4 rounded-2xl shadow-lg w-full max-w-md">
              <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">Login</h2>

              <div className="space-y-6">
                {/* Email */}
                <div>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <CiMail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      placeholder="Input your Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`pl-12 h-12 rounded-lg w-full bg-[aliceblue] border-l-4 text-[#000000] ${errors.email ? "border-l-red-500" : "border-l-blue-500"
                        }`}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm mt-2 pl-2">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <CiLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      placeholder="Input your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`pl-12 h-12 rounded-lg w-full bg-[aliceblue] border-l-4 text-[#000000] ${errors.password ? "border-l-red-500" : "border-l-blue-500"
                        }`}
                    />
                  </div>
                  {errors.password && <p className="text-red-500 text-sm mt-2 pl-2">{errors.password}</p>}
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "LOGIN"}
                </button>

                {/* Forgot Password */}
                <div className="text-center text-blue-600">
                  <Link href="/forgot-password">
                    <button className="underline cursor-pointer">Forgot password</button>
                  </Link>
                </div>
                <div className="md:hidden text-center">
                  <Link href="/signup" prefetch={true}>
                    <button className="bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-2 rounded-lg font-semibold text-sm transition-colors">
                      SIGN UP
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>


          <Link className="hidden md:block" href="/signup" prefetch={true}>
            <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold cursor-pointer">
              SIGN UP
            </button>
          </Link>
        </div>
      </div>

      {/* Modal for API response only */}
      {showModal && (
        <Modal
          modalType={modalType}
          message={modalMessage}
          onClose={handleModalClose}
          onContinue={handleModalContinue}
        />
      )}
    </div>
  );
}
