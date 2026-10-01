import InventoryClient from "./inventory-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function InventoryAdmin() {
  return <InventoryClient />;
}
