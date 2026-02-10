import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ProfileDataProvider } from "@/lib/profileStore";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "UNLOCK - Student University Application Platform",
  description: "Manage your university applications with UNLOCK",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <ProfileDataProvider>
          {children}
        </ProfileDataProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
