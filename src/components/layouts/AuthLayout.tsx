"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const AuthLayout = ({ children, allowedRoles }: AuthLayoutProps) => {
  const { profile, status } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  const loading = status === "loading";
  const user = profile; 

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login"); // redirect if not logged in
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.replace("/unauthorized"); // redirect if role not allowed
      }
    }
  }, [user, loading, allowedRoles, router]);

  if (loading || !user) return <p>Loading...</p>;

  return <>{children}</>;
};

export default AuthLayout;
