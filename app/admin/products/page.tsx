import ProductsClient from "./products-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function ProductsAdmin() {
  return <ProductsClient />;
}
