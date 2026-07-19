"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Moon, Sun, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";

export function Header() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          {/* Logo for mobile/tablet */}
          <Link href="/" className="md:hidden flex items-center space-x-2 group">
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <Image
                src="/logo.svg"
                alt="DiscoveryOS"
                width={32}
                height={32}
                className="w-6 h-6"
              />
            </div>
            <span className="font-bold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">DO</span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          {/* User Info */}
          {user && (
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium">{user.name || user.email}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
