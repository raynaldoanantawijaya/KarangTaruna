"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// The props definition is loosely checking. Since next-themes provider types can vary slightly, 
// using React.ComponentProps is distinct. But let's keep it simple.
// Using explicit 'any' for children/props to safely wrap, or just use NextThemesProvider props.

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
