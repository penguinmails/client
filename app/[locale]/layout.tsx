import { AuthProvider } from "@features/auth/ui/context/auth-provider";
import { AppProviders } from "@/components/providers";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/lib/config/i18n/routing";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { CoreProviders } from "@/components/core-providers";
import { Toaster } from "sonner";
import { ChunkErrorHandler } from "@/components";
import { cookies } from "next/headers";
import { LocaleFallbackToast } from "@/components/locale-fallback-toast";
import type { Metadata } from "next";

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

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Providing all messages to the client
  const messages = await getMessages();
  const cookieStore = await cookies();
  const localeFallbackCookie = cookieStore.get("pm_locale_fallback")?.value;

  return (
    <html lang={locale} suppressHydrationWarning={true}>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased flex flex-col",
          `${geistSans.variable} ${geistMono.variable} antialiased`,
        )}
      >
        <CoreProviders>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ChunkErrorHandler>
              {!!localeFallbackCookie?.trim() && (
                <LocaleFallbackToast requestedLocale={localeFallbackCookie} />
              )}
              <AppProviders>
                <AuthProvider>{children}</AuthProvider>
              </AppProviders>
            </ChunkErrorHandler>
          </NextIntlClientProvider>
        </CoreProviders>
        <Toaster />
      </body>
    </html>
  );
}
