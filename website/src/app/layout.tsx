import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import UrduMagicInit from "@/components/UrduMagicInit";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "UrduMagic | Modern Urdu Language Integration",
  description: "A lightweight library for English, Urdu script, and Roman Urdu language switching.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          Warm up the connection to Google Fonts CDN so the Noto Nastaliq Urdu
          font (injected by the UrduMagic library on Urdu activation) loads faster.
          This does NOT add an external dependency — the library already loads
          this font when the user switches to Urdu mode.
        */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <UrduMagicInit />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

