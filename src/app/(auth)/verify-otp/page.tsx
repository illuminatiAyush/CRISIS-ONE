"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

type OtpAction = "LOGIN" | "RETRY" | "REGISTER_AGAIN";

export default function VerifyOtpPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [action, setAction] = useState<OtpAction | null>(null);

  const handleVerify = async () => {
    setLoading(true);
    setMessage("");
    setAction(null);

    try {
      const res = await axios.post("/api/auth/verify-otp", { email, otp });

      setAction(res.data.action);
      setMessage(res.data.message);

      // LOGIN → redirect after delay
      if (res.data.action === "LOGIN") {
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    } catch (err: any) {
      const data = err.response?.data;

      setAction(data?.action || "RETRY");
      setMessage(data?.error || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const showRegisterAgain = action === "REGISTER_AGAIN" || action === "RETRY";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-4 border p-6 rounded-xl bg-white shadow">
        <h1 className="text-xl font-semibold text-center">Verify OTP</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <input
          type="text"
          placeholder="6-digit OTP"
          className="w-full border p-2 rounded"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          disabled={loading}
        />

        {message && (
          <p
            className={`text-sm text-center ${
              action === "LOGIN" ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>

        {showRegisterAgain && (
          <button
            onClick={() => router.push("/register")}
            className="w-full border py-2 rounded text-sm hover:bg-gray-100 transition"
          >
            Register Again
          </button>
        )}
      </div>
    </div>
  );
}
