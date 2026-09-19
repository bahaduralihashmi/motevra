import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) redirect("/account");

  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero">
          <div className="container narrow">
            <p className="eyebrow">MOTEVRA ACCOUNT</p>
            <h1>Sign in to your garage.</h1>
            <p className="hero-copy">Save vehicles, manage orders and keep your automotive shopping connected across devices.</p>
            <form action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/account" });
            }} className="auth-card">
              <button className="button button-dark" type="submit">Continue with Google</button>
              <p>Authentication is powered by Auth.js / NextAuth with the Prisma database adapter.</p>
            </form>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
