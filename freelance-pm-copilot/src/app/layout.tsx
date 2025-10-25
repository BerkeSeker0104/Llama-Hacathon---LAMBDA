import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "Serbest PM Asistanı",
  description: "Serbest çalışanlar için yapay zeka destekli proje yönetimi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="font-sans antialiased">
        <ErrorBoundary>
          <ToastProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
