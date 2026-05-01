import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import ChatWidget from "@/components/ChatWidget";
import { ThemeProvider } from "@/lib/theme-context";
import { LanguageProvider } from "@/lib/language-context";
import { UserProvider } from "@/lib/user-context";

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
      <body className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
        <ErrorBoundary>
          <ThemeProvider>
            <LanguageProvider>
              <UserProvider>
                <ClientProviders>
                  <Navigation />
                  <main className="flex-1 pb-4">
                    {children}
                  </main>
                  <Footer />
                  <ChatWidget />
                </ClientProviders>
              </UserProvider>
            </LanguageProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
