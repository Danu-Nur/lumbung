import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter as FontSans, Space_Grotesk } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/providers/auth-provider";
import { SyncProvider } from "@/providers/sync-provider";
import { QueryProvider } from "@/providers/query-provider";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/lib/auth";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSpace = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
});

export const metadata: Metadata = {
  title: "Inventory Pro - Warehouse Management System",
  description: "Production-ready warehouse inventory management system",
};

export default async function RootLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const session = await auth();
  console.log("[Layout] Session found:", !!session, session?.user?.email);

  return (
    <html lang={locale} suppressHydrationWarning className={cn("scroll-smooth")}>
      <body
        suppressHydrationWarning
        className={cn(
          "min-h-screen bg-background text-foreground font-sans antialiased",
          fontSans.variable,
          fontSpace.variable
        )}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <AuthProvider session={session}>
                <SyncProvider>
                  {children}
                  <Toaster />
                </SyncProvider>
              </AuthProvider>
            </QueryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
