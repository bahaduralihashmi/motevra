export default function AdminInventoryPage() {
  const items = [
    { sku: "TYR-205-55-R16", warehouse: "Karachi Hub", stock: 48, reserved: 12 },
    { sku: "TYR-225-45-R17", warehouse: "Lahore Hub", stock: 29, reserved: 7 },
    { sku: "TYR-245-40-R18", warehouse: "Islamabad Hub", stock: 19, reserved: 4 },
  ];

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f97316]">Admin</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-slate-900">Inventory</h1>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
            <tr>
              <th className="px-5 py-4">SKU</th>
              <th className="px-5 py-4">Warehouse</th>
              <th className="px-5 py-4">Stock</th>
              <th className="px-5 py-4">Reserved</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.sku} className="border-t border-slate-200">
                <td className="px-5 py-4 font-semibold text-slate-900">{item.sku}</td>
                <td className="px-5 py-4">{item.warehouse}</td>
                <td className="px-5 py-4">{item.stock}</td>
                <td className="px-5 py-4">{item.reserved}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
