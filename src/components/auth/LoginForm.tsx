"use client";
// @ts-nocheck


import React, { useState } from "react";
import { Role } from "@/data/role";
import { useDispatch } from "react-redux";
import { signIn } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { AppDispatch } from "@/store";
import { useLanguage } from "@/contexts/LanguageContext";
import { Icon } from "@iconify/react";

interface Props {
  role: Role;
  onBack: () => void;
}

const LoginForm = ({ role, onBack }: Props) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState<string>(`${role}@CrisisOne.com`);
  const [password, setPassword] = useState<string>("Demo@1234!");
  const [error, setError] = useState<string>("");
  const [msg, setMsg] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  React.useEffect(() => {
    setEmail(`${role}@CrisisOne.com`);
  }, [role]);

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const validate = () => {
    // Check if fields are empty
    if (!email || !password) {
      setError(t("common.error") + ": Email & Password required");
      return false;
    }

    // RELAXED VALIDATION FOR TESTING
    // If it's a gmail, we allow any password of any length
    if (email.endsWith("@gmail.com")) {
      setError("");
      return true;
    }

    // Also relax for the demo account
    if (email.toLowerCase().endsWith("@crisisone.com")) {
      setError("");
      return true;
    }

    // Standard validation but very loose for testing as requested
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email format");
      return false;
    }

    // Any password length is fine for testing
    if (password.length < 1) {
      setError("Password is required");
      return false;
    }

    setError(""); 
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (!validate()) return;

      const user: any = await dispatch(signIn({ email, password, role }));
      
      if (user.error) {
        setError(user.error.message || "Invalid credentials");
        return;
      }
      
      if ((user as any)?.meta?.requestStatus === "fulfilled") {
        setMsg(t("common.success") + "! Redirecting...");
        router.push("/dashboard");
      }
    } catch (error: any) {
      setError("Failed to log in. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setError("");
      }, 5000);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-blue-200 rounded-xl p-8 shadow">
      <button
        onClick={onBack}
        className="text-sm text-blue-500 mb-4 hover:underline flex items-center gap-1"
      >
        <span>←</span> {t("auth.change_role")}
      </button>

      <h2 className="text-2xl font-bold text-blue-700 mb-1 capitalize">
        {t(`roles.${role}`)} {t("nav.login")}
      </h2>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-4 text-xs text-blue-700">
        <span className="font-semibold">Note:</span> Demo credentials pre-filled. Gmail bypass active.
      </div>
      <p className="text-sm text-blue-600 mb-6">{t("auth.signin_title")}</p>

      {error && (
        <p className="border-2 border-red-600 rounded-lg mb-3 px-3 py-2 bg-red-50 text-red-800 text-sm text-center">
          {error}
        </p>
      )}

      {msg && (
        <p className="border-2 border-green-600 rounded-lg mb-3 px-3 py-2 bg-green-50 text-green-800 text-sm text-center">
          {msg}
        </p>
      )}

      {/* EMAIL */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
          {t("auth.email")}
        </label>
        <input
          type="email"
          defaultValue={email}
          placeholder={t("auth.email_placeholder")}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* PASSWORD */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
          {t("auth.password")}
        </label>
        <input
          type="password"
          defaultValue={password}
          placeholder={t("auth.password_placeholder")}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {/* LOGIN BUTTON */}
      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white py-2 rounded-md
             hover:bg-blue-700 transition mb-4 flex items-center justify-center gap-2"
        disabled={loading}
      >
        {loading && (
          <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
        )}
        <span>{loading ? t("auth.signing_in") : t("auth.signin_btn")}</span>
      </button>

      {/* GOOGLE LOGIN */}
      <button
        className="w-full flex items-center justify-center gap-2 border
                   border-blue-300 py-2 rounded-md hover:bg-blue-50 transition"
      >
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="google"
          className="w-5 h-5"
        />
        Continue with Google
      </button>
    </div>
  );
};

export default LoginForm;
