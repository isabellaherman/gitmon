"use client";

import { useMemo } from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  const { icon, label } = useMemo(() => {
    if (isDark) {
      return {
        icon: <Sun className="size-4" aria-hidden="true" />,
        label: "Alternar para modo claro",
      };
    }

    return {
      icon: <Moon className="size-4" aria-hidden="true" />,
      label: "Alternar para modo escuro",
    };
  }, [isDark]);

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className={cn("rounded-full border-border/60 bg-background/80 backdrop-blur", className)}
      aria-label={label}
      title={label}
      type="button"
    >
      {icon}
    </Button>
  );
}
