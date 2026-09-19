import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { AppSessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MOTEVRA | Premium tyres and automotive essentials",
  description:
    "MOTEVRA is a premium automotive marketplace for tyres, wheels, accessories, and future mobility essentials.",
  metadataBase: new URL("https://motevra.example.com"),
  openGraph: {
    title: "MOTEVRA",
    description: "Premium international automotive marketplace",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MOTEVRA",
    description: "Premium tyres and automotive accessories",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white text-slate-900">
        <AppSessionProvider>{children}</AppSessionProvider>
      </body>
    </html>
  );
}
