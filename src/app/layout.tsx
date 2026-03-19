import type { Metadata } from "next";
import { Inter, Archivo_Black } from "next/font/google";
import "./globals.css";


import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";
import Script from "next/script";
import AppOverlays from "@/components/app-overlays";
import { Providers } from "@/components/providers";
import { PortfolioDataProvider } from "@/contexts/PortfolioDataContext";

import { prisma } from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  const config = await prisma.config.findFirst();
  if (!config) return { title: "Portfolio" };

  return {
    title: config.title,
    description: config.descriptionLong,
    keywords: config.keywords,
    authors: [{ name: config.author }],
    openGraph: {
      title: config.title,
      description: config.descriptionShort,
      url: config.site,
      images: [
        {
          url: "/assets/og-placeholder.png", // Replaced static ogImg with generic
          width: 800,
          height: 600,
          alt: "Portfolio preview",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: config.title,
      description: config.descriptionShort,
      images: ["/assets/og-placeholder.png"],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={[inter.variable, archivoBlack.variable, "font-display"].join(" ")} suppressHydrationWarning>
      <head>
        <Script
          defer
          src={process.env.UMAMI_DOMAIN}
          data-website-id={process.env.UMAMI_SITE_ID}
        ></Script>
        {/* <Analytics /> */}
      </head>
      <body>
        <Providers>
          <PortfolioDataProvider>
            <Header />
            {children}
            <Footer />
            <AppOverlays />
          </PortfolioDataProvider>
        </Providers>
      </body>
    </html>
  );
}
