import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "@/components/ui/toaster";
import { ConditionalLayout } from "@/components/layout/conditional-layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tutorly - Find Your Perfect Tutor",
  description: "Connect with qualified tutors in Ethiopia. Personalized learning experiences with expert guidance tailored just for you.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white scroll-smooth`}>
        <AuthProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
