import SupplierCatalogClient from "./supplier-catalog-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function SupplierCatalogAdmin() {
  return <SupplierCatalogClient />;
}
