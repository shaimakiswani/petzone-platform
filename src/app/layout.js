import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import ChatbotWidget from "@/components/ChatbotWidget";
import ErrorBoundary from "@/components/ErrorBoundary";

import { LanguageProvider } from "@/context/LanguageContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "PetZone Platform",
  description: "Find your new best friend, supplies, clinics, and more.",
};

import SupportBubble from "@/components/SupportBubble";

export default function RootLayout({ children }) {
  return (
    <html>
      <body className={`${inter.className} min-h-screen flex flex-col relative`}>
        <ErrorBoundary>
          <LanguageProvider>
            <AuthProvider>
              <FavoritesProvider>
                <Navbar />
                <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                  {children}
                </main>
                <ChatbotWidget />
                <SupportBubble />
              </FavoritesProvider>
            </AuthProvider>
          </LanguageProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
