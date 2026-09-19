export const siteConfig = {
  name: "MOTEVRA",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  description: "Premium international automotive marketplace for tyres, wheels, accessories, and performance essentials.",
  ogImage: "/og-image.png",
};

export function buildCanonicalUrl(pathname: string) {
  return `${siteConfig.url}${pathname}`;
}
