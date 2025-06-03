import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "@/components/ui/toaster";
import { MainLayout } from "@/components/layout/main-layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TutorHub - Find Ethiopian Tutors",
  description: "Connect with qualified Ethiopian tutors for personalized learning experiences.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <MainLayout>{children}</MainLayout>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
