import './globals.css';
import type {Metadata} from 'next';
import type {ReactNode} from 'react';

export const metadata: Metadata = {
  title: 'AI Storytelling',
  description: 'A premium editorial storytelling experience built with Next.js.'
};

export default function RootLayout({children}: {children: ReactNode}) {
  return (
    <html suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
