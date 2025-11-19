"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon, LogOut, Settings, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export function Sidebar() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  return (
    <aside className="h-screen w-18 flex flex-col justify-between p-4 bg-surface border-r border-border transition-colors duration-300">
      <div className="flex flex-col items-center gap-5 pt-1">

        {/* Home Button (NEW) */}
        <Button
          variant="sidebar"
          size="icon"
          onClick={() => router.push("/")}
          className="cursor-pointer transition-colors duration-200 rounded-2xl"
          aria-label="Go Home"
        >
          <Home size={20} />
        </Button>
      </div>

      {/* Utility Buttons */}
      <div className="flex flex-col items-center gap-5">
        {/* Theme Toggle */}
        <Button
          variant="sidebar"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="cursor-pointer transition-colors duration-200 rounded-2xl"
          aria-label="Toggle Theme"
        >
          {theme === "light" ? <Sun size={20} /> : <Moon size={20} />}
        </Button>
        
        {/* Settings */}
        <Button
          variant="sidebar"
          size="icon"
          className="cursor-pointer transition-colors duration-200 rounded-2xl"
          aria-label="Settings"
        >
          <Settings size={20} />
        </Button>

        {/* Logout */}
        <Button
          variant="sidebaraccent"
          size="icon"
          className="cursor-pointer transition-colors duration-200 rounded-2xl"
          aria-label="Logout"
        >
          <LogOut size={20} />
        </Button>
      </div>
    </aside>
  );
}