import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { deleteVehicle, saveVehicle } from "@/app/actions/vehicles";
import type { Vehicle } from "@prisma/client";

export default async function VehiclesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  let vehicles: Vehicle[] = [];
  if (process.env.DATABASE_URL) {
    try {
      vehicles = await (await import("@/lib/db")).db.vehicle.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" } });
    } catch {
      vehicles = [];
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f97316]">My vehicles</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-slate-900">Saved vehicles</h1>
      </div>

      {!process.env.DATABASE_URL ? (
        <div className="mb-8 rounded-[1.75rem] border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          Connect PostgreSQL to save vehicle profiles and retrieve their compatibility matches.
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <form action={saveVehicle} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Add vehicle</div>
          <div className="mt-5 space-y-4">
            <input name="manufacturer" required placeholder="Manufacturer e.g. Toyota" className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3" />
            <input name="model" required placeholder="Model e.g. Corolla" className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3" />
            <input name="yearFrom" required type="number" min="1950" max="2100" placeholder="Model year" className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3" />
            <input name="engine" placeholder="Engine or trim (optional)" className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3" />
            <button disabled={!process.env.DATABASE_URL} className="w-full rounded-full bg-[#f97316] px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white disabled:cursor-not-allowed disabled:opacity-50">Save vehicle</button>
          </div>
        </form>

        <div className="space-y-4">
          {vehicles.length ? vehicles.map((vehicle) => (
            <div key={vehicle.id} className="flex items-center justify-between rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f97316]">{vehicle.yearFrom}</div>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.05em] text-slate-900">{vehicle.manufacturer} {vehicle.model}</h2>
                {vehicle.engine ? <p className="mt-1 text-sm text-slate-600">{vehicle.engine}</p> : null}
              </div>
              <form action={deleteVehicle}>
                <input type="hidden" name="id" value={vehicle.id} />
                <button className="text-sm font-semibold text-slate-500 underline underline-offset-4 hover:text-red-600">Remove</button>
              </form>
            </div>
          )) : (
            <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">No saved vehicles yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
