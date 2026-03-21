"use client";

import React, { useEffect, useState } from "react";
import Snowfall from "react-snowfall";
import { useTheme } from "next-themes";
import { usePortfolioData } from "@/contexts/PortfolioDataContext";

export default function SnowfallWrapper() {
  const { data } = usePortfolioData();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !data?.config?.snowfallEnabled) {
    return null;
  }

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = currentTheme === "dark";
  
  const snowColor = isDark
    ? data.config.snowfallColorDark
    : data.config.snowfallColorLight;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <Snowfall color={snowColor || (isDark ? "#ffffff" : "#000000")} />
    </div>
  );
}
