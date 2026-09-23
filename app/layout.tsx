import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { CurrencyProvider } from "@/components/currency-provider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.motevra.com"),
  title: {
    default: "MOTEVRA | Tyres, Wheels & Auto Parts in Pakistan",
    template: "%s | MOTEVRA",
  },
  description:
    "Shop tyres, wheels, auto parts, batteries, accessories and car care at MOTEVRA — a modern automotive marketplace for drivers in Pakistan.",
  applicationName: "MOTEVRA",
  alternates: { canonical: "/" },
  openGraph: {
    title: "MOTEVRA | Tyres, Wheels & Auto Parts in Pakistan",
    description: "Shop tyres, wheels, parts and accessories for your drive.",
    url: "https://www.motevra.com",
    siteName: "MOTEVRA",
    type: "website",
  },
  robots: { index: true, follow: true },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "MOTEVRA",
      url: "https://www.motevra.com",
    },
    {
      "@type": "WebSite",
      name: "MOTEVRA",
      url: "https://www.motevra.com",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://www.motevra.com/shop?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body>
        <CurrencyProvider>
          <Script
            id="motevra-structured-data"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
          {adsenseClient ? (
            <Script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
              crossOrigin="anonymous"
              strategy="afterInteractive"
            />
          ) : null}
          {children}
        </CurrencyProvider>
      </body>
    </html>
  );
}
