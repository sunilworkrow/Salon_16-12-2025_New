"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyUserPage() {
  const router = useRouter();
  const params = useSearchParams();

  const token = params.get("token");
  const email = params.get("email");

  const [message, setMessage] = useState("Verifying your account...");

  useEffect(() => {
    async function verifyAccount() {
      const res = await fetch("/api/verify-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("Your email is verified! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setMessage(data.message || "Verification failed.");
      }
    }

    if (token && email) {
      verifyAccount();
    }
  }, [token, email, router]);

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="bg-white p-10 rounded shadow text-center">
        <h2 className="text-xl font-semibold">{message}</h2>
      </div>
    </div>
  );
}
