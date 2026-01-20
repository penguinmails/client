"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button/button";
import { Moon, Sun, Monitor } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Use requestAnimationFrame to avoid cascading renders
    const id = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg animate-pulse">
        <div className="h-8 w-8 rounded-md bg-muted" />
        <div className="h-8 w-8 rounded-md bg-muted" />
        <div className="h-8 w-8 rounded-md bg-muted" />
      </div>
    );
  }

  const themes = [
    { name: "light", icon: Sun },
    { name: "dark", icon: Moon },
    { name: "system", icon: Monitor },
  ] as const;

  return (
    <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg border border-border/40">
      {themes.map(({ name, icon: Icon }) => (
        <Button
          key={name}
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-md transition-all duration-200",
            theme === name 
              ? "bg-background shadow-sm text-foreground scale-105" 
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          )}
          onClick={() => setTheme(name)}
          title={`${name.charAt(0).toUpperCase() + name.slice(1)} theme`}
        >
          <Icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
}
