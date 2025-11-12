import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fehrist",
  description: "Fehrist – AI-powered focus and task app for mindful productivity.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem 
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}