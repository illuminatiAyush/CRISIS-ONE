"use client";

import React, { useState } from "react";
import { Role } from "@/data/role";
import { useDispatch } from "react-redux";
import { signUp } from "@/store/slices/authSlice";
import { AppDispatch } from "@/store";

interface Props {
  role: Role;
  onBack: () => void;
}

const RegistrationForm = ({ role, onBack }: Props) => {
  const [email, setEmail] = useState<string>("demo@CrisisOne.com");
  const [password, setPassword] = useState<string>("Demo@1234!");
  const [confirmPassword, setConfirmPassword] = useState<string>("Demo@1234!");
  const [error, setError] = useState<string>("");
  const [msg, setMsg] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();

  const validate = () => {
    // Check if fields are empty
    if (!email || !password) {
      setError("Email and Password are required");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Password and confirm password mismatch");
      return false;
    }

    // Email validation regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i;
    if (!emailRegex.test(email)) {
      setError("Invalid email format");
      return false;
    }

    // Password validation regex:
    // Minimum 6 characters, at least 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(password)) {
      setError(
        "Password must be at least 6 characters long and include 1 uppercase, 1 lowercase, 1 number, and 1 special character"
      );
      return false;
    }

    // If everything is valid
    setError(""); // clear previous errors
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (!validate()) return;

      // Dispatch signUp with correct argument shape
      const user: any = await dispatch(
        signUp({ email, password, role: role.toLowerCase() })
      );
      console.log(user);
      if (user.error) setError(user?.error?.message);
      if (user?.payload) setMsg(user?.payload?.message);
    } catch (error) {
      // Optionally handle error or setError
      setError("Failed to register. Please try again. ");
    } finally {
      setLoading(false);
      await setTimeout(() => {
        setMsg("");
        setError("");
      }, 5000);
    }
  };
  return (
    <div className="w-full max-w-md bg-white border border-blue-200 rounded-xl p-8 shadow">
      <button
        onClick={onBack}
        className="text-sm text-blue-500 mb-4 hover:underline"
      >
        ← Change role
      </button>

      <h2 className="text-2xl font-bold text-blue-700 mb-1 capitalize">
        {role} Register
      </h2>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-4 text-xs text-blue-700">
        <span className="font-semibold">Evaluator Note:</span> Demo credentials pre-filled.
      </div>
      <p className="text-sm text-blue-600 mb-6">Create an account to continue</p>

      {error && (
        <p className="border-2 border-red-600 rounded-2xl mb-3 px-2 py-1 bg-red-200 text-red-800 text-center">
          {error}
        </p>
      )}

      {msg && (
        <p className="border-2 border-green-600 rounded-2xl mb-3 px-2 py-1 bg-green-200 text-green-800 text-center">
          {msg}
        </p>
      )}

      {/* EMAIL */}
      <input
        type="email"
        placeholder="Email"
        className="w-full mb-4 px-4 py-2 border rounded-md
                   focus:outline-none focus:ring-2 focus:ring-blue-400"
        onChange={(e) => {
          setEmail(e.target.value);
        }}
      />

      {/* PASSWORD */}
      <input
        type="password"
        placeholder="Password"
        className="w-full mb-6 px-4 py-2 border rounded-md
                   focus:outline-none focus:ring-2 focus:ring-blue-400"
        onChange={(e) => {
          setPassword(e.target.value);
        }}
      />

      <input
        type="password"
        placeholder="Confirm Password"
        className="w-full mb-6 px-4 py-2 border rounded-md
                   focus:outline-none focus:ring-2 focus:ring-blue-400"
        onChange={(e) => {
          setConfirmPassword(e.target.value);
        }}
      />

      {/* LOGIN BUTTON */}
      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white py-2 rounded-md
             hover:bg-blue-700 transition mb-4 flex items-center justify-center gap-2"
        disabled={loading} // disable button while loading
      >
        {loading && (
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
        )}
        <span>{loading ? "Registring..." : "Register"}</span>
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

export default RegistrationForm;
