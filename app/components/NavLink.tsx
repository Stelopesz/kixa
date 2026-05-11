"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string | ((props: { isActive: boolean }) => string);
}

export default function NavLink({ to, children, className }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === to;
  const resolvedClass = typeof className === "function" ? className({ isActive }) : className;
  return (
    <Link href={to} className={cn(resolvedClass)}>
      {children}
    </Link>
  );
}
