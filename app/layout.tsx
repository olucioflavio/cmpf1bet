import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google"; // Next 14/15 font way
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "F1 Betting App",
  description: "Bet on F1 2026 races",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-black text-foreground`}
      >
        <Navbar />
        <main className="flex-1 flex flex-col w-full items-center">
          {children}
        </main>
      </body>
    </html>
  );
}
