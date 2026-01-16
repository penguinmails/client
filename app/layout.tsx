import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./[locale]/globals.css";
import { cn } from "@/lib/utils";
import { CoreProviders } from "@/components/core-providers";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { Toaster } from "sonner";
import { routing } from "@/lib/config/i18n/routing";
import { LocaleFallbackToast } from "@/components/locale-fallback-toast";
import { ChunkErrorHandler } from "@/components";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Penguin Mails - Email Outreach & Domain Warm-up",
  description:
    "Enter the world of Penguin Mails, where every message is a delightful surprise!",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/img/pengo_32X32.png",
    other: [
      { rel: "icon", url: "/img/pengo_16X16.png", sizes: "16x16" },
      { rel: "icon", url: "/img/pengo_32X32.png", sizes: "32x32" },
      { rel: "icon", url: "/img/pengo_48X48.png", sizes: "48x48" },
    ],
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: requestedLocale } = await params;

  // Use default locale if requested one is invalid (graceful fallback)
  const isValidLocale = hasLocale(routing.locales, requestedLocale);
  const locale = isValidLocale ? requestedLocale : routing.defaultLocale;

  return (
    <html lang={locale} suppressHydrationWarning={true}>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased flex flex-col",
          `${geistSans.variable} ${geistMono.variable} antialiased`
        )}
      >
        <CoreProviders>
          <NextIntlClientProvider locale={locale}>
            <ChunkErrorHandler>
              {!isValidLocale && (
                <LocaleFallbackToast requestedLocale={requestedLocale} />
              )}
              {children}
            </ChunkErrorHandler>
          </NextIntlClientProvider>
        </CoreProviders>
        <Toaster />
      </body>
    </html>
  );
}
