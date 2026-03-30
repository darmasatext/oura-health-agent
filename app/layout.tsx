import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { Navigation } from "@/components/layout/Navigation";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard de Salud | Oura Ring",
  description: "Visualiza y analiza tus datos biométricos de Oura Ring: sueño, recuperación, actividad e insights personalizados.",
  openGraph: {
    title: 'Oura Health Dashboard',
    description: 'Dashboard interactivo de salud y biometría',
    type: 'website',
    locale: 'es_MX',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-gray-50">
        <ErrorBoundary>
          <ClientProviders>
            <Navigation />
            <main className="flex-1 pb-4">
              {children}
            </main>
            <footer className="py-6 px-4 text-center border-t border-gray-300 bg-white mt-auto">
              <p className="text-base text-gray-600">
                Hecho con <span className="text-red-500 text-lg">❤️</span> por <strong className="text-gray-800">TextAI</strong> y <strong className="text-blue-600">OpenClaw</strong> <span className="text-lg">🦞</span>
              </p>
            </footer>
          </ClientProviders>
        </ErrorBoundary>
      </body>
    </html>
  );
}
