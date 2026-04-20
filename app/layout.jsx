import { Sora, Nunito_Sans } from 'next/font/google';
import './globals.css';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['600', '700', '800'],
});

const nunito = Nunito_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700'],
});

export const metadata = {
  title: 'LockIn UI',
  description: 'Clean nutrition interface built with Next.js',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${nunito.variable}`}>{children}</body>
    </html>
  );
}
