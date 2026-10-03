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
    default: "MOTEVRA | Tyres, Wheels, Auto Parts & Car Accessories",
    template: "%s | MOTEVRA",
  },
  description:
    "Shop tyres, wheels, rims, auto parts, batteries and car accessories online with MOTEVRA. Find tyres by size, explore trusted automotive products and get clear product information before you buy.",
  keywords: [
    "tyres in Pakistan",
    "car tyres Pakistan",
    "buy tyres online Pakistan",
    "tyre shop Pakistan",
    "car tyres Lahore",
    "wheels and rims Pakistan",
    "alloy wheels Pakistan",
    "auto parts Pakistan",
    "car batteries Pakistan",
    "car accessories Pakistan",
    "car care products Pakistan",
    "Autogrip tyres",
    "tyre prices Pakistan",
    "online auto parts store Pakistan",
  ],
  applicationName: "MOTEVRA",
  category: "automotive",
  creator: "MOTEVRA",
  publisher: "MOTEVRA",
  formatDetection: { telephone: false },
  openGraph: {
    title: "MOTEVRA | Tyres, Wheels, Auto Parts & Car Accessories",
    description: "Buy tyres, wheels, rims, auto parts, batteries and car accessories online in Pakistan with MOTEVRA.",
    url: "https://www.motevra.com",
    siteName: "MOTEVRA",
    type: "website",
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title: "MOTEVRA | Tyres, Wheels & Auto Parts",
    description: "A modern automotive marketplace for tyres, wheels, parts and accessories.",
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
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
