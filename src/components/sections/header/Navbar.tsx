"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-xl font-bold text-white">
          LOGO
        </div>

        <div className="hidden md:flex items-center gap-10 text-sm font-medium text-gray-300">
          <Link href="/" className="hover:text-white transition">
            Home
          </Link>
          <Link href="/about" className="hover:text-white transition">
            About
          </Link>
          <Link href="/community" className="hover:text-white transition">
            Community
          </Link>
          <Link href="/chat" className="hover:text-white transition">
            Chat
          </Link>
        </div>

        {/* Right */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="px-4 py-2 text-sm text-white hover:text-gray-300 transition"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm rounded-lg bg-white text-black hover:bg-gray-200 transition"
          >
            Register
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-white"
          aria-label="Toggle Menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-black/95 border-t border-white/10">
          <div className="flex flex-col px-6 py-6 gap-4 text-gray-300">
            <Link href="/" onClick={() => setOpen(false)} className="hover:text-white">
              Home
            </Link>
            <Link href="/about" onClick={() => setOpen(false)} className="hover:text-white">
              About
            </Link>
            <Link
              href="/community"
              onClick={() => setOpen(false)}
              className="hover:text-white"
            >
              Community
            </Link>
            <Link href="/chat" onClick={() => setOpen(false)} className="hover:text-white">
              Chat
            </Link>

            <div className="pt-4 border-t border-white/10 flex gap-4">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="w-full text-center px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="w-full text-center px-4 py-2 rounded-lg bg-white text-black hover:bg-gray-200"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
