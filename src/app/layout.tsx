import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { MobileHeader } from "@/components/MobileHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TurnControl — Airline Ground Stay Control",
  description: "Live turnaround and ground stay control system for airline station operations.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex h-full overflow-hidden bg-slate-950 text-slate-100">
        <Sidebar />
        <div className="flex flex-1 flex-col min-h-0">
          {/* Mobile-only sticky top bar */}
          <MobileHeader />
          {/* Main scrollable content */}
          <main className="flex flex-1 flex-col overflow-y-auto scrollbar-thin pb-16 md:pb-0">
            {children}
          </main>
        </div>
        {/* Mobile bottom nav */}
        <MobileNav />
      </body>
    </html>
  );
}
