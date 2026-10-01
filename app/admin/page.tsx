import { AdminDashboard } from "@/components/admin-dashboard";
import { AdminProductForm } from "@/components/admin-product-form";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <section className="admin-dashboard-page">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">MOTEVRA COMMERCE</p>
          <h1>Dashboard</h1>
          <p className="admin-page-description">Manage your catalogue, suppliers and customer orders from one place.</p>
        </div>
        <div className="admin-page-actions">
          <a className="button button-dark" href="#add-product">+ Add product</a>
        </div>
      </div>
      <AdminDashboard />
      <AdminProductForm />
    </section>
  );
}
