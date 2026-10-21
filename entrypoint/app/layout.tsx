import type { ReactNode } from 'react';
import Link from 'next/link';
import { DevReload } from '@/components/DevReload';
import { ThemeToggle } from '@/components/ThemeToggle';
import './globals.css';

export const metadata = { title: 'MFE SSR + Shadow DOM POC' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uk">
      <body>
        <header>
          <b>entrypoint</b>
          <Link href="/">All</Link>
          <Link href="/billing">Billing</Link>
          <Link href="/profile">Profile</Link>
          <ThemeToggle />
        </header>
        <main>
          <h2>Глобальний h2 entrypoint (червоний)</h2>
          {children}
        </main>
        {process.env.NODE_ENV !== 'production' && <DevReload />}
      </body>
    </html>
  );
}
