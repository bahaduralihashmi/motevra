import { AdminPaymentMethods } from "@/components/admin-payment-methods";
import "./payment-dashboard.css";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function AdminPaymentsPage() {
  return (
    <section className="admin-subpage">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">MOTEVRA FINANCE</p>
          <h1>Payment dashboard</h1>
          <p className="admin-page-description">Manage payment methods, countries, currencies, customer instructions and gateway credentials.</p>
        </div>
      </div>
      <AdminPaymentMethods />
    </section>
  );
}
