import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tortillómetro - La mejor tortilla, el mejor bar",
  description: "App colaborativa para valorar las tortillas de patata de los bares con tus compañeros de trabajo.",
  keywords: ["tortilla", "patata", "bares", "valoración", "ranking", "español", "tapa"],
  authors: [{ name: "Tortillómetro Team" }],
  icons: {
    icon: "/tortilla-icon.png",
  },
  openGraph: {
    title: "Tortillómetro",
    description: "La mejor tortilla, el mejor bar - Valora las tortillas con tus compañeros",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
