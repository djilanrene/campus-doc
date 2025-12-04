'use client';

import type { Metadata } from "next"; // Keep Metadata import for type definition
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider, useAuth } from "@/hooks/useAuth"; // Import AuthProvider and useAuth
import { ToastProvider, useToast } from "@/context/ToastContext"; // Import ToastProvider and useToast


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata remains here as it's typically exported from a RootLayout that is a Server Component.
// Though this RootLayout is currently a client component due to state management,
// Next.js will still try to use this metadata if it's a server component.
// For now, it's a client component for direct state management.
export const metadata = {
  title: "Campus Doc",
  description: "Plateforme de partage de documents pour la FASEG",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col font-sans text-slate-900`}
      >
        <AuthProvider>
          <ToastProvider>
            <LayoutContent>{children}</LayoutContent>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

// Separate component to use hooks from AuthProvider and ToastProvider
function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  // const { showToast } = useToast(); // showToast is not directly used in LayoutContent itself, but passed to Header

  if (loading) {
    // Optionally render a global loading spinner here
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement de l'application...</p>
      </div>
    );
  }

  return (
    <>
      <Header user={user} onLogout={logout} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </>
  );
}
