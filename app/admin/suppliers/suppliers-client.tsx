"use client";

import { useEffect, useMemo, useState } from "react";

const types = [
  ["MOTEVRA", "MOTEVRA / Local inventory"],
  ["CJ_DROPSHIPPING", "CJ Dropshipping"],
  ["ALIBABA", "Alibaba.com / 1688"],
  ["OTHER", "Other supplier"],
] as const;

type CredentialField = { key: string; label: string; secret?: boolean; placeholder: string; help: string };

const credentialFields: Record<string, CredentialField[]> = {
  CJ_DROPSHIPPING: [
    { key: "apiKey", label: "CJ API key", secret: true, placeholder: "Paste CJ API key", help: "Used to authenticate the CJ server-side connector." },
  ],
  ALIBABA: [
    { key: "appKey", label: "App Key", placeholder: "Alibaba App Key", help: "Application identifier issued by Alibaba Open Platform." },
    { key: "appSecret", label: "App Secret", secret: true, placeholder: "Alibaba App Secret", help: "Application secret; keep it private." },
    { key: "accessToken", label: "Access token", secret: true, placeholder: "Seller access token", help: "Required for authorized API calls; obtain it through Alibaba authorization." },
    { key: "refreshToken", label: "Refresh token", secret: true, placeholder: "Refresh token (if issued)", help: "Store when the selected Alibaba authorization flow provides one." },
    { key: "webhookSecret", label: "Webhook / signing secret", secret: true, placeholder: "Webhook secret (if provided)", help: "Used when the supplier provides signed event callbacks." },
  ],
  OTHER: [
    { key: "apiKey", label: "API key", secret: true, placeholder: "Supplier API key", help: "Primary API credential." },
    { key: "apiSecret", label: "API secret", secret: true, placeholder: "Supplier API secret", help: "Private credential, if required." },
    { key: "accessToken", label: "Access token", secret: true, placeholder: "Access token", help: "Use when the supplier uses token-based authorization." },
    { key: "webhookSecret", label: "Webhook secret", secret: true, placeholder: "Webhook signing secret", help: "Use when the supplier signs webhook events." },
  ],
};

const blank = { name: "", slug: "", type: "CJ_DROPSHIPPING", website: "", apiBaseUrl: "", externalAccountId: "" };

export default function SuppliersClient() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [connections, setConnections] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [connect, setConnect] = useState<any>(null);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [connectionMsg, setConnectionMsg] = useState("");
  const [form, setForm] = useState(blank);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/suppliers", { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      const list = j.suppliers || [];
      setSuppliers(list);
      const cr = await fetch("/api/admin/supplier-connections", { cache: "no-store" });
      if (cr.ok) {
        const cj = await cr.json();
        const map: Record<string, any> = {};
        for (const item of cj.credentials || []) map[item.supplierId] = item;
        setConnections(map);
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Unable to load suppliers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg("Adding supplier…");
    try {
      const r = await fetch("/api/admin/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setMsg("Supplier added.");
      setForm({ ...blank });
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Unable to add supplier.");
    }
  }

  function openConnect(supplier: any) {
    setConnect(supplier);
    setCredentials({});
    setConnectionMsg("");
  }

  async function connectSupplier(e: React.FormEvent) {
    e.preventDefault();
    if (!connect) return;
    setConnectionMsg("Saving credentials securely…");
    try {
      const fields = Object.fromEntries(Object.entries(credentials).filter(([, value]) => String(value).trim()));
      if (!Object.keys(fields).length) throw new Error("Enter at least one credential.");
      const body = { supplierId: connect.id, provider: connect.type, fields };
      const r = await fetch("/api/admin/supplier-connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setConnectionMsg(j.message || "Credentials saved.");
      setCredentials({});
      await load();
    } catch (e) {
      setConnectionMsg(e instanceof Error ? e.message : "Unable to save supplier credentials.");
    }
  }

  async function disconnect(id: string) {
    const current = connections[id];
    if (!current?.id || !confirm("Disconnect this supplier credential?")) return;
    const r = await fetch("/api/admin/supplier-connections?id=" + encodeURIComponent(current.id), { method: "DELETE" });
    const j = await r.json();
    if (!r.ok) return setMsg(j.error || "Unable to disconnect.");
    setMsg("Supplier credentials disconnected.");
    await load();
  }

  const fields = useMemo(() => credentialFields[connect?.type] || credentialFields.OTHER, [connect?.type]);

  return (
    <section className="admin-subpage">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">MOTEVRA OPERATIONS</p>
          <h1>Suppliers</h1>
          <p className="admin-page-description">Create supplier records, store connector credentials securely, and prepare product, inventory, shipping and order synchronization.</p>
        </div>
        <div className="admin-page-actions">
          <a className="button button-dark" href="#add-supplier">+ Add supplier</a>
        </div>
      </div>

      {msg && <div className="admin-message">{msg}</div>}

      <section className="admin-form admin-form-card" id="add-supplier">
        <div className="admin-form-heading">
          <p className="eyebrow">SUPPLIER PROFILE</p>
          <h2>Add supplier</h2>
          <p className="muted">First create the supplier profile. Add secret API credentials separately after the profile exists.</p>
        </div>
        <form className="admin-form-inner" onSubmit={save}>
          <div className="form-section-grid">
            <label className="admin-field admin-field-wide">
              <span>Supplier name <b>*</b></span>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. CJ Dropshipping" required />
              <small>Internal name shown in your admin panel.</small>
            </label>
            <label className="admin-field">
              <span>Supplier type <b>*</b></span>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {types.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="admin-field">
              <span>Slug</span>
              <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="cj-dropshipping" />
              <small>Leave blank to generate automatically.</small>
            </label>
            <label className="admin-field">
              <span>Website</span>
              <input type="url" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://supplier.example" />
            </label>
            <label className="admin-field">
              <span>API base URL</span>
              <input type="url" value={form.apiBaseUrl} onChange={e => setForm({ ...form, apiBaseUrl: e.target.value })} placeholder="https://api.supplier.example" />
              <small>Only enter the endpoint supplied by the provider.</small>
            </label>
            <label className="admin-field">
              <span>External account / store ID</span>
              <input value={form.externalAccountId} onChange={e => setForm({ ...form, externalAccountId: e.target.value })} placeholder="Merchant, seller or store ID" />
            </label>
          </div>
          <div className="admin-form-actions">
            <button className="button button-dark" type="submit">Create supplier profile</button>
          </div>
        </form>
      </section>

      <section className="admin-list-section">
        <div className="admin-list-heading">
          <div><p className="eyebrow">SUPPLIER CONNECTIONS</p><h2>Configured suppliers</h2></div>
          <span>{suppliers.length} suppliers</span>
        </div>
        {loading ? <div className="admin-loading">Loading suppliers…</div> : suppliers.length === 0 ? (
          <div className="empty-state"><span>SUPPLIERS</span><h2>No suppliers yet.</h2><p>Create a supplier profile above.</p></div>
        ) : (
          <div className="supplier-cards">
            {suppliers.map(s => {
              const connection = connections[s.id];
              return (
                <article className="supplier-card" key={s.id}>
                  <div className="supplier-card-top">
                    <div><span className="supplier-type-label">{s.type}</span><h3>{s.name}</h3></div>
                    <span className={s.status === "ACTIVE" ? "payment-status on" : "payment-status"}>{s.status === "ACTIVE" ? "ACTIVE" : "INACTIVE"}</span>
                  </div>
                  <div className="supplier-meta-grid">
                    <div><span>PRODUCTS</span><strong>{s._count?.products ?? 0}</strong></div>
                    <div><span>WAREHOUSES</span><strong>{s._count?.warehouses ?? 0}</strong></div>
                    <div><span>SUPPLIER ORDERS</span><strong>{s._count?.supplierOrders ?? 0}</strong></div>
                    <div><span>CREDENTIALS</span><strong>{connection?.status === "CONNECTED" ? "Connected" : connection?.status === "CONFIGURED" ? "Configured" : "Not set"}</strong></div>
                  </div>
                  <div className="supplier-card-details">
                    <p><b>API:</b> {s.apiBaseUrl || "Not configured"}</p>
                    <p><b>Account:</b> {s.externalAccountId || "Not provided"}</p>
                  </div>
                  <div className="supplier-card-actions">
                    <button className="button button-dark" type="button" onClick={() => openConnect(s)}>{connection ? "Update credentials" : "Connect API"}</button>
                    {connection && <button className="button" type="button" onClick={() => disconnect(s.id)}>Disconnect</button>}
                    {s.type === "CJ_DROPSHIPPING" && <a className="button" href="/admin/suppliers/cj">CJ Catalogue</a>}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {connect && (
        <section className="admin-form admin-form-card supplier-connect-card">
          <div className="admin-form-heading">
            <p className="eyebrow">SECURE CREDENTIALS</p>
            <h2>Connect {connect.name}</h2>
            <p className="muted">{connect.type === "CJ_DROPSHIPPING" ? "CJ credentials are tested against CJ before the connection is marked connected." : "Credentials are encrypted before storage. For suppliers without a connector implemented yet, the dashboard stores configuration but does not claim live API connectivity."}</p>
          </div>
          <form className="admin-form-inner" onSubmit={connectSupplier}>
            <div className="form-section-grid">
              {fields.map(field => (
                <label className="admin-field" key={field.key}>
                  <span>{field.label}</span>
                  <input type={field.secret ? "password" : "text"} value={credentials[field.key] || ""} onChange={e => setCredentials({ ...credentials, [field.key]: e.target.value })} placeholder={field.placeholder} />
                  <small>{field.help}</small>
                </label>
              ))}
            </div>
            <div className="admin-form-actions">
              <button className="button button-dark" type="submit">{connect.type === "CJ_DROPSHIPPING" ? "Test & connect CJ" : "Save encrypted credentials"}</button>
              <button className="button" type="button" onClick={() => setConnect(null)}>Close</button>
            </div>
            {connectionMsg && <div className="admin-message">{connectionMsg}</div>}
          </form>
        </section>
      )}

      <section className="integration-checklist">
        <div><p className="eyebrow">BEFORE LIVE FULFILLMENT</p><h2>Supplier integration checklist</h2></div>
        <div className="checklist-grid">
          <div><b>01 · Authentication</b><span>API key or App Key/App Secret + authorization token.</span></div>
          <div><b>02 · Catalog</b><span>Product ID, SKU, variant ID and supplier cost mapping.</span></div>
          <div><b>03 · Inventory</b><span>Warehouse ID, available stock and sync frequency.</span></div>
          <div><b>04 · Shipping</b><span>Shipping method IDs, destination countries and freight rules.</span></div>
          <div><b>05 · Orders</b><span>Order creation, payment/fulfillment status and external order ID.</span></div>
          <div><b>06 · Tracking</b><span>Tracking number, carrier, tracking URL and webhook/polling strategy.</span></div>
        </div>
      </section>
    </section>
  );
}
