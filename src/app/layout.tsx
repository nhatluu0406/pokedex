import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Outfit } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/shared/ServiceWorkerRegister";
import { ThemeInitializer } from "@/components/shared/ThemeInitializer";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { parseTheme, THEME_COOKIE } from "@/lib/theme-cookie";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Pokedex",
  description:
    "Browse all 1025 Pokémon with animated Gen V sprites, stats, evolution chains, and more.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Pokedex",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/icon-192.png",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Pokedex",
    description:
      "Browse all 1025 Pokémon with animated Gen V sprites, stats, evolution chains, and more.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f8fc" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1117" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = parseTheme(cookieStore.get(THEME_COOKIE)?.value);

  return (
    <html lang="en" data-theme={theme} suppressHydrationWarning>
      <body className={outfit.className}>
        <ThemeProvider initialTheme={theme}>
          <ThemeInitializer />
          <ServiceWorkerRegister />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
