import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from '@/components/navigation/navbar';

import { Providers } from '@/components/providers';
import "@copilotkit/react-ui/styles.css";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "TradeMentor - Learn Trading with AI",
  description: "Mobile-first paper trading platform with AI copilot and voice rooms for learning stock trading",
  keywords: "trading, paper trading, stock market, learning, AI copilot, education",
  authors: [{ name: "TradeMentor Team" }],
  creator: "TradeMentor",
  publisher: "TradeMentor",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0ea5e9' },
    { media: '(prefers-color-scheme: dark)', color: '#0284c7' },
  ],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TradeMentor',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale} className="h-full">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased h-full bg-gradient-to-br from-brand-50 via-white to-emerald-50`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <Navbar />
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
