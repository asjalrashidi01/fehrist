"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon, LogOut, Settings } from "lucide-react";

export function Sidebar() {
  const { theme, setTheme } = useTheme();

  return (
    <aside className="h-screen w-18 flex flex-col justify-between p-4 bg-surface border-r border-border transition-colors duration-300">
      {/* Theme Toggle */}
      <div className="flex justify-center pt-1">
        <Button
          variant="sidebar"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="cursor-pointer transition-colors duration-200 rounded-2xl"
          aria-label="Toggle Theme"
        >
          {theme === "light" ? <Sun size={20} /> : <Moon size={20} />}
        </Button>
      </div>

      {/* Utility Buttons */}
      <div className="flex flex-col items-center gap-5 pb-1">
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