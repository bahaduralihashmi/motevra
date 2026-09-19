import { createProduct } from "@/app/actions/products";
import { ProductImageFields } from "@/components/admin/product-image-fields";

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f97316]">Admin</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-slate-900">Add new product</h1>
      </div>

      <form action={createProduct} className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
            <input name="name" defaultValue="Continental PremiumContact 6" className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#f97316]" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Slug</label>
            <input name="slug" defaultValue="continental-premiumcontact-6" className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#f97316]" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">SKU</label>
            <input name="sku" defaultValue="TYR-205-55-R16-001" className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#f97316]" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Brand</label>
            <input name="brand" defaultValue="Continental" className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#f97316]" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
            <input name="category" defaultValue="Summer Tyres" className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#f97316]" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Price</label>
            <input name="price" type="number" defaultValue={39900} className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#f97316]" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Stock</label>
            <input name="stock" type="number" defaultValue={24} className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#f97316]" />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
          <textarea name="description" defaultValue="Premium all-road tyre engineered for comfort, performance, and long-distance reliability." className="min-h-32 w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#f97316]" />
        </div>

        <ProductImageFields />

        <div className="border-t border-slate-200 pt-6">
          <div className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Tyre specifications</div>
          <div className="grid gap-4 sm:grid-cols-3">
            <input name="width" type="number" placeholder="Width (225)" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3" />
            <input name="aspectRatio" type="number" placeholder="Aspect ratio (45)" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3" />
            <input name="rimSize" type="number" placeholder="Rim diameter (18)" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3" />
            <input name="constructionType" defaultValue="R" placeholder="Construction (R)" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3" />
            <input name="loadIndex" type="number" placeholder="Load index (91)" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3" />
            <input name="speedRating" placeholder="Speed rating (W)" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3" />
            <select name="season" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3"><option value="">Season / tyre type</option><option value="SUMMER">Summer</option><option value="ALL_SEASON">All-season</option><option value="WINTER">Winter</option><option value="RAIN">Rain</option></select>
            <select name="tyreType" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3"><option value="">Vehicle type</option><option value="PASSENGER">Passenger</option><option value="SUV">Light Truck / SUV</option><option value="LIGHT_TRUCK">Commercial</option><option value="PERFORMANCE">Performance</option></select>
            <select name="condition" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3"><option value="NEW">New</option><option value="USED">Used</option><option value="TAKE_OFF">Take-off</option></select>
            <input name="treadDepth" type="number" step="0.01" placeholder="Tread depth (mm)" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3" />
            <input name="dotCode" pattern="[0-9]{4}" placeholder="DOT code (1224)" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3" />
            <select name="quantityUnit" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3"><option value="SINGLE">Single</option><option value="PAIR">Pair</option><option value="SET_OF_FOUR">Set of 4</option></select>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"><input type="checkbox" name="runFlat" value="true" /> Run-flat technology</label>
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"><input type="checkbox" name="repairs" value="true" /> Repairs or patches</label>
            <textarea name="repairDescription" placeholder="Repair or patch description" className="min-h-24 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 sm:col-span-2" />
            <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="deliveryOptions" value="LOCAL_PICKUP" /> Local pickup</label>
            <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="deliveryOptions" value="FREIGHT_SHIPPING" /> Freight shipping</label>
          </div>
        </div>

        <button type="submit" className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-slate-900">
          Save product
        </button>
      </form>
    </div>
  );
}
