import type { Metadata } from 'next';
import '@/styles/globals.css';
import { SentinelProvider } from '@/lib/storage/context';

export const metadata: Metadata = {
  title: 'LABEL SENTINEL | Legal Metrology & Regulatory Compliance Platform',
  description:
    'Automated regulatory compliance platform for The Legal Metrology (Packaged Commodities) Rules, 2011.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SentinelProvider>
          {children}
        </SentinelProvider>
      </body>
    </html>
  );
}
