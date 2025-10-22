"use client";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";
import {
  ClapperboardIcon,
  LayoutDashboardIcon,
  SearchIcon,
  ListIcon,
} from "lucide-react";

export default function Header() {
  const links = [
    { to: "/", label: "Home", icon: <ClapperboardIcon /> },
    { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboardIcon /> },
    { to: "/search", label: "Buscar", icon: <SearchIcon /> },
    { to: "/lists", label: "Listas", icon: <ListIcon /> },
  ] as const;

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-sm font-medium">
          {links.map(({ to, label, icon }) => {
            return (
              <Link key={to} href={to} className="flex items-center gap-2">
                {icon}
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
      <hr />
    </div>
  );
}
