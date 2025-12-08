"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItemProps {
  href: string;
  className?: string | ((args: { isActive: boolean }) => string);
  children: React.ReactNode;
}

export function NavItem({ href, className, children }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  const computedClassName =
    typeof className === "function"
      ? className({ isActive })
      : className;

  return (
    <Link href={href} className={cn(computedClassName)}>
      {children}
    </Link>
  );
}
