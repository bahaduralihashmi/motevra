import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const dynamic = "force-dynamic";

type SignInPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSafeCallbackUrl(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate) return "/account";

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const base = siteUrl || "https://www.motevra.com";
    const url = new URL(candidate, base);

    if (url.origin !== new URL(base).origin) return "/account";

    return url.pathname + url.search + url.hash || "/account";
  } catch {
    return "/account";
  }
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  let session = null;
  try { session = await auth(); } catch { session = null; }
  if (session?.user) redirect("/account");

  const googleReady = Boolean(
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
  );
  const params = searchParams ? await searchParams : {};
  const callbackUrl = getSafeCallbackUrl(params.callbackUrl);

  return <><SiteHeader /><main><section className="page-hero"><div className="container narrow">
    <p className="eyebrow">MOTEVRA ACCOUNT</p><h1>Sign in to your garage.</h1>
    <p className="hero-copy">Save vehicles, manage orders and keep your automotive shopping connected across devices.</p>
    {googleReady ? <form action={async () => { "use server"; await signIn("google", { redirectTo: callbackUrl }); }} className="auth-card">
      <button className="button button-dark" type="submit">Continue with Google</button>
      <p>Secure Google sign-in is ready.</p>
    </form> : <div className="empty-state"><span>ACCOUNT SETUP</span><h2>Sign-in is being configured.</h2><p>The storefront is online, but Google authentication credentials have not been configured in the deployment yet.</p></div>}
  </div></section></main><SiteFooter /></>;
}
