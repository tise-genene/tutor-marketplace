'use client';

import { useSession } from "@/lib/auth-client";

function AuthContent({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthContent>{children}</AuthContent>
  );
} 