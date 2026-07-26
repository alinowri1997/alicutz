"use client";

import * as React from "react";
import {useRouter} from "next/navigation";

import {LoginScreen} from "@/components/admin/modules";
import {useAdminSession} from "@/hooks/use-admin-session";

export function AdminLoginClient(): React.JSX.Element {
  const {isAuthenticated, isLoading, signIn, forgotPassword} = useAdminSession();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/admin/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div className="min-h-screen bg-[#080808]" aria-hidden="true" />;
  }

  return <LoginScreen onSubmit={signIn} onForgotPassword={forgotPassword} />;
}