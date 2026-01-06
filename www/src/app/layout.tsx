import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PolyRPC - The Invisible Bridge between Python and TypeScript',
  description: 'Real-time type inference from Python (FastAPI/Pydantic) to TypeScript. Get the tRPC experience without abandoning Python.',
  keywords: ['polyrpc', 'python', 'typescript', 'fastapi', 'pydantic', 'type-safe', 'api'],
  openGraph: {
    title: 'PolyRPC',
    description: 'The Invisible Bridge between Python and TypeScript',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-white min-h-screen`}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
