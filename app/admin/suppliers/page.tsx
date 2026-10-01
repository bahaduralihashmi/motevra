import SuppliersClient from "./suppliers-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function SuppliersAdmin() {
  return <SuppliersClient />;
}
