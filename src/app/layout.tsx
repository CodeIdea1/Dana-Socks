// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Dana Socks",
  description: "Dana Socks",
  icons: 'icon.ico'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="ltr">
      <body className={`${inter.className} ${playfairDisplay.variable}`}>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main style={{ minHeight: 'calc(100vh - 80px)' }}>
              {children}
            </main>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}