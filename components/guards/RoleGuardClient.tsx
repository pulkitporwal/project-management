"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

type AppRole = "admin" | "manager" | "employee";

export function RoleGuardClient({ allowed, children }: { allowed: AppRole[]; children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || !session.user) {
      router.replace("/auth/signin");
      return;
    }
    if (!allowed.includes(session.user.role)) {
      router.replace("/");
    }
  }, [status, session, router, allowed]);

  if (status === "loading") return null;
  if (!session || !session.user) return null;
  if (!allowed.includes(session.user.role)) return null;
  return <>{children}</>;
}
