import { getAdminProducts } from "@/lib/catalog";
import Link from "next/link";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f97316]">Admin</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-slate-900">Products</h1>
        </div>
        <Link href="/admin/products/new" className="inline-flex rounded-full bg-[#f97316] px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white">
          New product
        </Link>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
            <tr>
              <th className="px-5 py-4">Name</th>
              <th className="px-5 py-4">Slug</th>
              <th className="px-5 py-4">Stock</th>
              <th className="px-5 py-4">Price</th>
              <th className="px-5 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-slate-200">
                <td className="px-5 py-4 font-semibold text-slate-900">{product.name}</td>
                <td className="px-5 py-4">{product.slug}</td>
                <td className="px-5 py-4">{product.stock}</td>
                <td className="px-5 py-4">PKR {Number(product.price).toLocaleString()}</td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                    {product.status ?? "ACTIVE"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
