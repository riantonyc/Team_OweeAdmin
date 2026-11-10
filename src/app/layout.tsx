import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SMART ADMIN — MUAYTHAI PORPROV XIV KALBAR",
  description: "Smart Admin Database Atlet Muaythai Porprov XIV Kalbar — Team Oweee",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0B0F19",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`dark ${jakartaSans.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased bg-[#0B0F17] text-[#F8FAFC]">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
