import ReduxProvider from '@/store/provider';
import React from 'react'
import DashboardLayout from '@/components/DashboardLayout';

function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReduxProvider>
      <DashboardLayout title="Crisis Response" subtitle="Coordinating emergency efforts">
        {children}
      </DashboardLayout>
    </ReduxProvider>
  )
}

export default DashboardRouteLayout