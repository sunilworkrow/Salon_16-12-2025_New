"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function StaffInvitePage() {
    const params = useSearchParams();
    const router = useRouter();

    const token = params.get("token");
    const email = params.get("email");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token || !email) {
            setError("Invalid or missing invite link.");
        }
    }, [token, email]);

    const handleSubmit = async () => {
        setError("");

        if (!password || !confirmPassword) {
            setError("Please enter password and confirm password.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        const res = await fetch("/api/staff/complete-invite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, token, password }),
        });

        const result = await res.json();

        setLoading(false);

        if (res.ok && result.success) {
            alert("Password set successfully! Please login.");
            router.push("/login"); // redirect to login
        } else {
            setError(result.message || "Something went wrong.");
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded-lg">
            <h1 className="text-2xl font-bold text-center">Set Your Password</h1>

            {error && <p className="text-red-500 mt-3">{error}</p>}

            <div className="mt-6">
                <label className="block mb-1">Email</label>
                <input
                    type="email"
                    value={email || ""}
                    disabled
                    className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
                />
            </div>

            <div className="mt-4">
                <label className="block mb-1">New Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border rounded"
                />
            </div>

            <div className="mt-4">
                <label className="block mb-1">Confirm Password</label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2 border rounded"
                />
            </div>

            <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full mt-6 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
                {loading ? "Saving..." : "Set Password"}
            </button>
        </div>
    );
}
