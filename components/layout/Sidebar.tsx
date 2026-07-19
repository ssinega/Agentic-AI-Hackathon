"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SIDEBAR_ITEMS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import {
  LayoutGrid,
  Folder,
  Upload,
  Lightbulb,
  Tags,
  Users,
  Target,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react";


const iconMap: Record<string, any> = {
  LayoutGrid,
  Folder,
  Upload,
  Lightbulb,
  Tags,
  Users,
  Target,
  FileText,
  MessageSquare,
  Settings,
};

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  const handleLogout = async () => {
    // TODO: Implement logout
  };

  return (
    <aside className="w-64 border-r border-border bg-card">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10 flex-shrink-0 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center overflow-hidden group-hover:shadow-lg group-hover:shadow-indigo-500/50 transition-all duration-300">
              <Image
                src="/logo.svg"
                alt="DiscoveryOS Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain p-1"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">DiscoveryOS</span>
              <span className="text-xs text-muted-foreground">Research Platform</span>
            </div>
          </Link>
        </div>


        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive(item.href) ? "default" : "ghost"}
                  className="w-full justify-start"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* User Menu */}
        <div className="border-t border-border p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive/90 hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}
