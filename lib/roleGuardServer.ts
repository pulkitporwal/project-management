import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export type AppRole = "admin" | "manager" | "employee";

export async function allowRoles(roles: AppRole[]) {
  const session = await auth();
  if (!session || !session.user) {
    return { ok: false, res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (!roles.includes(session.user.role)) {
    return { ok: false, res: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { ok: true, session };
}

export function hasRole(role: AppRole, roles: AppRole[]) {
  return roles.includes(role);
}
