import ShippingSettingsClient from "./shipping-settings-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function ShippingAdmin() {
  return <ShippingSettingsClient />;
}
