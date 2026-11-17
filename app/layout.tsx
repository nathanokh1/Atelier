import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Atelier — free browser studio",
  description:
    "A free, browser-first studio. Layers, move, resize, blend modes and export — no install, your images never leave your device.",
  keywords: ["photo editor", "free photo editor", "image editor", "layers", "browser editor", "Atelier"],
  applicationName: "Atelier",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Atelier" },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#101216",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
