import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import AuthInit from "./auth-init";
import GlobalProvider from "@/contexts/GlobalProvider";
import AccessibilityPanel from "@/components/ui/AccessibilityPanel";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CrisisOne | Disaster Response",
  description: "Advanced Crisis Intelligence and Disaster Response Platform",
  icons: {
    icon: "/icon/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GlobalProvider>
          <Providers>
            <AuthInit />
            {children}
            <AccessibilityPanel />
          </Providers>
        </GlobalProvider>
      </body>
    </html>
  );
}
