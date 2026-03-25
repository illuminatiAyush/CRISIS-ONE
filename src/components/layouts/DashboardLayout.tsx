"use client";

import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <DashboardSidebar />
      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
