import VariantsClient from "./variants-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function VariantsAdmin() {
  return <VariantsClient />;
}
