import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/store/provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Multiplayer Snake Arena",
  description: "Real-time competitive multiplayer snake game with notifications.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-gray-900`}>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}