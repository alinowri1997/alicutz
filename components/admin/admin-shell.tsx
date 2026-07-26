"use client";

import * as React from "react";
import {usePathname, useRouter} from "next/navigation";

import {AdminHeader} from "@/components/admin/admin-header";
import {AdminSidebar} from "@/components/admin/admin-sidebar";
import {useAdminSession} from "@/hooks/use-admin-session";
import {ADMIN_NAV_ITEMS} from "@/lib/admin-dashboard";

export function AdminShell({children}: {children: React.ReactNode}): React.JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const {signOut} = useAdminSession();
  const [open, setOpen] = React.useState(false);

  const activeItem = ADMIN_NAV_ITEMS.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)) ?? ADMIN_NAV_ITEMS[0];

  const handleLogout = async (): Promise<void> => {
    await signOut();
    router.replace("/admin/login");
  };

  return (
    <div key={pathname} className="min-h-screen bg-background text-text lg:flex">
      <AdminSidebar open={open} onClose={() => setOpen(false)} onLogout={() => void handleLogout()} />

      <div className="min-w-0 flex-1 lg:ml-[18rem]">
        <AdminHeader
          title={activeItem.label}
          subtitle="Premium admin operations"
          onMenuOpen={() => setOpen(true)}
        />
        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
