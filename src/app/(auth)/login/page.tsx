"use client";

import React, { useState } from "react";
import RoleSelection from "@/components/common/RoleSelection";
import LoginForm from "@/components/auth/LoginForm";
import { Role } from "@/data/role";

const page = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<Role | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center
                    bg-gradient-to-b from-blue-50 to-blue-100 px-6">
      {step === 1 && (
        <RoleSelection
          onSelect={(selectedRole) => {
            setRole(selectedRole);
            setStep(2);
          }}
        />
      )}

      {step === 2 && role && (
        <LoginForm
          role={role}
          onBack={() => setStep(1)}
        />
      )}
    </div>
  );
};

export default page;
