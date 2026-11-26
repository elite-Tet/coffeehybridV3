import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next, Big_Shoulders, Geist_Mono } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "@/components/layout/providers/NextAuthProvider";
import ThemeProvider from "@/components/layout/providers/ThemeProvider";
import SiteChrome from "@/components/layout/SiteChrome";
import { Toaster } from "@/components/ui/sonner";

// Body: built for legibility (Braille Institute), fits the a11y-first brief.
const body = Atkinson_Hyperlegible_Next({
  variable: "--font-body",
  subsets: ["latin"],
});

// Display: condensed board face; opsz axis lets .display pin it to its display cut.
const board = Big_Shoulders({
  variable: "--font-board",
  subsets: ["latin"],
  axes: ["opsz"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CoffeeHybrid — order ahead, pick up fresh",
  description: "Order your coffee on your phone, show your pickup code at the counter, and skip the line.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "dark",
  themeColor: "#1c130e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${body.variable} ${board.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <NextAuthProvider>
            <SiteChrome>{children}</SiteChrome>
            <Toaster position="top-center" richColors />
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
