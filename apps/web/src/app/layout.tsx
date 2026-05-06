// app/layout.tsx

import type { Metadata } from "next";

import { Inter } from "next/font/google";

import "./globals.css";

import Providers from "./providers";

import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ["latin"],

  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "InvoiceHub",

  description:
    "Manage and post invoices beautifully",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={inter.variable}
    >
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}