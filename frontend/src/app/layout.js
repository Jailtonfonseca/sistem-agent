import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import '@/utils/errorMonitor';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Sistem-Agent',
  description: 'Gerenciamento de Docker + Chat IA',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-900 text-white`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 lg:ml-64 p-6 lg:p-8 pt-16 lg:pt-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}