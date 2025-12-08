import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin" | "manager" | "employee";
      department: string;
      jobTitle: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role: "admin" | "manager" | "employee";
    department: string;
    jobTitle: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "admin" | "manager" | "employee";
    department: string;
    jobTitle: string;
  }
}
