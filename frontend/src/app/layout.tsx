import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import type { Metadata } from 'next';
import { Cinzel, JetBrains_Mono, Playfair_Display, Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google';
import './globals.css';

import AuthModal from '@/components/AuthModal';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/context/AuthContext';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-cinzel',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-serif',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Helio Events · Discover & Host World-Class Gatherings',
  description: 'Discover popular events in your city and featured calendars from the Helio Events community.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const fontVars = `${plusJakarta.variable} ${cinzel.variable} ${jetbrainsMono.variable} ${playfairDisplay.variable} ${spaceGrotesk.variable}`;
  return (
    <html lang="en" className={`${fontVars} dark`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans selection:bg-blue-500 selection:text-white antialiased bg-[#0b0e14] text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 font-sans">
            {children}
          </main>
          <Footer />
          <AuthModal />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
