import { auth, signIn, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin";
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
  const params = searchParams ? await searchParams : {};
  const callbackUrl = getSafeCallbackUrl(params.callbackUrl);
  const isAdminSignIn = callbackUrl.startsWith("/admin");

  let session = null;
  try {
    session = await auth();
  } catch {
    session = null;
  }

  if (session?.user) {
    if (isAdminSignIn) {
      const admin = await getAdminUser();
      if (admin) redirect(callbackUrl);

      return (
        <>
          <SiteHeader />
          <main>
            <section className="page-hero">
              <div className="container narrow">
                <p className="eyebrow">ADMIN SIGN-IN</p>
                <h1>Switch to the admin account.</h1>
                <p className="hero-copy">
                  This browser is currently signed in with a customer account.
                  Sign out, then choose your MOTEVRA administrator Google account.
                </p>
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/signin?callbackUrl=%2Fadmin" });
                  }}
                >
                  <button className="button button-dark" type="submit">
                    Sign out and choose admin account
                  </button>
                </form>
              </div>
            </section>
          </main>
          <SiteFooter />
        </>
      );
    }

    redirect("/account");
  }

  const googleReady = Boolean(
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
  );

  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero">
          <div className="container narrow">
            <p className="eyebrow">{isAdminSignIn ? "ADMIN SIGN-IN" : "MOTEVRA ACCOUNT"}</p>
            <h1>{isAdminSignIn ? "Sign in to the admin account." : "Sign in to your garage."}</h1>
            <p className="hero-copy">
              {isAdminSignIn
                ? "Choose the Google account that is authorized as a MOTEVRA administrator."
                : "Save vehicles, manage orders and keep your automotive shopping connected across devices."}
            </p>

            {googleReady ? (
              <form
                action={async () => {
                  "use server";
                  if (isAdminSignIn) {
                    await signIn(
                      "google",
                      { redirectTo: callbackUrl },
                      { prompt: "select_account" },
                    );
                  } else {
                    await signIn("google", { redirectTo: callbackUrl });
                  }
                }}
                className="auth-card"
              >
                <button className="button button-dark" type="submit">
                  Continue with Google
                </button>
                <p>
                  {isAdminSignIn
                    ? "Google will ask you to choose an account before continuing."
                    : "Secure Google sign-in is ready."}
                </p>
              </form>
            ) : (
              <div className="empty-state">
                <span>ACCOUNT SETUP</span>
                <h2>Sign-in is being configured.</h2>
                <p>
                  The storefront is online, but Google authentication credentials
                  have not been configured in the deployment yet.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
