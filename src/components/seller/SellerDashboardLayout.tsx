import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import SellerSidebar from './SellerSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Loader2 } from 'lucide-react';

interface SellerDashboardLayoutProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SellerDashboardLayout({ className, ...props }: SellerDashboardLayoutProps) {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (!user || role !== "seller") {
        navigate("/");
      }
    }
  }, [user, role, authLoading, roleLoading, navigate]);

  if (authLoading || roleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <SellerSidebar />

      {/* Main content */}
      <main className="flex-1 p-8 md:ml-64">
        <Outlet />
      </main>
    </div>
  );
}

