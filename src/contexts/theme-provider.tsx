"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

// next-themes injects an inline <script> to set the theme before hydration
// (prevents a flash of the wrong theme). React 19 / Next 16 emit a dev-only
// "Encountered a script tag" warning for any <script> rendered inside a
// component. The script still runs correctly from the server-rendered HTML,
// so this filters out that single false-positive warning in development.
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalConsoleError = console.error;
  console.error = (...consoleArguments: unknown[]) => {
    if (
      typeof consoleArguments[0] === "string" &&
      consoleArguments[0].includes("Encountered a script tag")
    ) {
      return;
    }
    originalConsoleError.apply(console, consoleArguments);
  };
}

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
