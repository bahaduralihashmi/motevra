"use client";

import { useEffect, useMemo, useState } from "react";
import { PAYMENT_FIELD_DEFINITIONS, PAYMENT_METHOD_LABELS, fieldsForProvider } from "@/lib/payment-provider-fields";

type M = {
  id: string;
  name: string;
  provider: string;
  type: string;
  countries: string[];
  currencies: string[];
  instructions?: string | null;
  mode: string;
  enabled: boolean;
  sortOrder: number;
  hasCredentials: boolean;
  settings?: Record<string, string> | null;
};

const countries = ["PK","US","CA","GB","AE","SA","QA","KW","AU","NZ","SG","MY","IN","CN","JP","KR","DE","FR","IT","ES","NL","BE","AT","CH","SE","NO","DK","PL","TR","ZA","BR","MX","TH","ID"];
const currencies = ["PKR","USD","CAD","GBP","AED","SAR","QAR","KWD","AUD","NZD","SGD","MYR","INR","CNY","JPY","KRW","EUR","CHF","SEK","NOK","DKK","PLN","TRY","ZAR","BRL","MXN","THB","IDR"];
const providers = Object.keys(PAYMENT_METHOD_LABELS);
const types: Record<string, string> = { COD: "COD", BANK_TRANSFER: "BANK", JAZZCASH: "WALLET", EASYPAISA: "WALLET", MCB_EGATE: "ONLINE", RAAST: "QR", STRIPE: "ONLINE", PAYPAL: "ONLINE", OTHER: "ONLINE" };

const blank = {
  name: "",
  provider: "BANK_TRANSFER",
  countries: ["PK"],
  currencies: ["PKR"],
  mode: "LIVE",
  enabled: false,
  sortOrder: 0,
  instructions: "",
  credentials: {} as Record<string,string>,
  settings: {} as Record<string,string>,
};

function providerRequirements(provider: string) {
  const map: Record<string, string[]> = {
    COD: ["Enable only for the countries where you actually offer cash collection."],
    BANK_TRANSFER: ["Bank name, account title, account number and/or IBAN.", "Customer transfer instructions and order-reference rules."],
    JAZZCASH: ["Merchant ID, merchant password and integrity salt.", "Provider gateway URL.", "Provider account must be approved for the required merchant/payment flow."],
    EASYPAISA: ["Store ID and merchant hash key when supplied.", "Gateway URL and confirmation URL from Easypaisa.", "Merchant account must be enabled for the selected integration."],
    MCB_EGATE: ["MPGS merchant ID and API password.", "MCB-provided API base URL, API version and Checkout JS URL.", "MCB eGate merchant onboarding/UAT and production approval."],
    RAAST: ["Merchant alias and/or IBAN.", "QR image or customer payment instructions.", "Manual payment verification unless a supported bank/API flow is implemented."],
    STRIPE: ["Live secret key and publishable key.", "Stripe account must be activated for your business/country.", "Checkout callback URL must be registered/allowed as required by your Stripe setup."],
    PAYPAL: ["Client ID and client secret.", "Production API base URL.", "PayPal merchant account must be approved for receiving payments."],
    OTHER: ["Provider-specific API credentials and integration documentation.", "A server-side connector must exist before live payments can be processed."],
  };
  return map[provider] || map.OTHER;
}

export function AdminPaymentMethods() {
  const [rows, setRows] = useState<M[]>([]);
  const [form, setForm] = useState<any>(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    load();
  }, []);

  async function load() {
    setBusy(true);
    try {
      const r = await fetch("/api/admin/payment-methods", { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setRows(j.paymentMethods || []);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Unable to load payment methods.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setEditing(null);
    setForm({ ...blank, countries: ["PK"], currencies: ["PKR"], credentials: {}, settings: {} });
  }

  function toggleList(key: "countries" | "currencies", value: string) {
    setForm((x: any) => ({
      ...x,
      [key]: x[key].includes(value) ? x[key].filter((a: string) => a !== value) : [...x[key], value],
    }));
  }

  function providerChange(provider: string) {
    setForm((x: any) => ({
      ...x,
      provider,
      name: x.name || PAYMENT_METHOD_LABELS[provider],
      credentials: {},
      settings: {},
    }));
  }

  function edit(m: M) {
    setEditing(m.id);
    setForm({
      name: m.name,
      provider: m.provider,
      countries: m.countries,
      currencies: m.currencies,
      mode: m.mode,
      enabled: m.enabled,
      sortOrder: m.sortOrder,
      instructions: m.instructions || "",
      credentials: {},
      settings: m.settings || {},
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setCred(key: string, value: string) {
    setForm((x: any) => ({ ...x, credentials: { ...x.credentials, [key]: value } }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const cleanCreds = Object.fromEntries(Object.entries(form.credentials || {}).filter(([, value]) => String(value).trim()));
    const body = {
      name: form.name,
      provider: form.provider,
      type: types[form.provider] || "ONLINE",
      countries: form.countries,
      currencies: form.currencies,
      mode: form.mode,
      enabled: form.enabled,
      sortOrder: Number(form.sortOrder || 0),
      instructions: form.instructions,
      credentials: Object.keys(cleanCreds).length ? cleanCreds : undefined,
      settings: form.settings || {},
    };
    try {
      const r = await fetch("/api/admin/payment-methods", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { ...body, id: editing } : body),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setMsg(editing ? "Payment method updated." : "Payment connection saved securely.");
      reset();
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Unable to save payment method.");
    } finally {
      setBusy(false);
    }
  }

  async function test(id: string) {
    setTesting(id);
    setMsg("");
    try {
      const r = await fetch("/api/admin/payment-methods/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const j = await r.json();
      setMsg(r.ok ? j.message : j.error);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Connection test failed.");
    } finally {
      setTesting(null);
    }
  }

  async function toggleEnabled(m: M) {
    const r = await fetch("/api/admin/payment-methods", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: m.id, enabled: !m.enabled }),
    });
    const j = await r.json();
    if (!r.ok) return setMsg(j.error);
    setRows(x => x.map(q => q.id === m.id ? j.paymentMethod : q));
  }

  async function remove(id: string) {
    if (!confirm("Delete this payment method?")) return;
    const r = await fetch("/api/admin/payment-methods?id=" + encodeURIComponent(id), { method: "DELETE" });
    const j = await r.json();
    if (!r.ok) return setMsg(j.error);
    setRows(x => x.filter(m => m.id !== id));
    setMsg("Payment method deleted.");
  }

  const currentFields = useMemo(() => fieldsForProvider(form.provider), [form.provider]);
  const requirements = providerRequirements(form.provider);

  return (
    <div className="payment-admin">
      <div className="payment-provider-strip">
        {providers.map(p => (
          <button key={p} type="button" className={form.provider === p ? "provider-chip active" : "provider-chip"} onClick={() => providerChange(p)}>
            {PAYMENT_METHOD_LABELS[p]}
          </button>
        ))}
      </div>

      <form className="admin-form payment-form" onSubmit={save}>
        <div className="payment-form-head">
          <div>
            <p className="eyebrow">{editing ? "EDIT CONNECTION" : "PAYMENT CONNECTION"}</p>
            <h2>{editing ? "Update " + PAYMENT_METHOD_LABELS[form.provider] : PAYMENT_METHOD_LABELS[form.provider]}</h2>
            <p className="muted">Secret credentials are encrypted on the server. They are never returned to this browser after saving.</p>
          </div>
          {editing && <button type="button" className="button" onClick={reset}>Cancel</button>}
        </div>

        <div className="form-section-grid">
          <label className="admin-field admin-field-wide"><span>Connection name <b>*</b></span><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={PAYMENT_METHOD_LABELS[form.provider]} /><small>Internal name shown to the admin.</small></label>
          <label className="admin-field"><span>Environment <b>*</b></span><select value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value })}><option value="SANDBOX">Sandbox / Test</option><option value="LIVE">Live / Production</option></select></label>
          <label className="admin-field"><span>Sort order</span><input type="number" min="0" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: e.target.value })} placeholder="0" /></label>
        </div>

        <div className="payment-scope">
          <div><div className="payment-section-title"><span>01</span><div><strong>Availability</strong><small>Select where this method can appear at checkout.</small></div></div><div className="payment-check-grid">{countries.map(c => <label className="check" key={c}><input type="checkbox" checked={form.countries.includes(c)} onChange={() => toggleList("countries", c)} />{c}</label>)}</div></div>
          <div><div className="payment-section-title"><span>02</span><div><strong>Currency</strong><small>Select the currencies accepted by this method.</small></div></div><div className="payment-check-grid">{currencies.map(c => <label className="check" key={c}><input type="checkbox" checked={form.currencies.includes(c)} onChange={() => toggleList("currencies", c)} />{c}</label>)}</div></div>
        </div>

        <div className="payment-credentials">
          <div className="payment-section-title"><span>03</span><div><strong>Merchant credentials</strong><small>Enter exactly the credentials issued by your payment provider.</small></div></div>
          <div className="form-section-grid">
            {currentFields.map((field: any) => (
              <label className="admin-field" key={field.key}>
                <span>{field.label}{field.secret && <em>SECRET</em>}</span>
                <input type={field.secret ? "password" : "text"} value={form.credentials?.[field.key] || ""} onChange={e => setCred(field.key, e.target.value)} placeholder={editing && rows.find(x => x.id === editing)?.hasCredentials && !form.credentials?.[field.key] ? "Saved — leave blank to keep" : field.placeholder} />
                {field.help && <small>{field.help}</small>}
              </label>
            ))}
          </div>
        </div>

        {(form.provider === "STRIPE" || form.provider === "PAYPAL" || form.provider === "JAZZCASH" || form.provider === "EASYPAISA" || form.provider === "MCB_EGATE") && (
          <div className="payment-settings">
            <div className="payment-section-title"><span>04</span><div><strong>Gateway & callback settings</strong><small>Use the provider values supplied during merchant onboarding.</small></div></div>
            <div className="form-section-grid">
              {(form.provider === "STRIPE" || form.provider === "PAYPAL") && <label className="admin-field"><span>Success URL</span><input value={form.settings?.successUrl || ""} onChange={e => setForm((x: any) => ({ ...x, settings: { ...x.settings, successUrl: e.target.value } }))} placeholder={origin ? origin + (form.provider === "STRIPE" ? "/api/payments/stripe/callback?session_id={CHECKOUT_SESSION_ID}" : "/api/payments/paypal/callback") : "Automatic MOTEVRA callback"} /><small>Leave blank to use the MOTEVRA callback.</small></label>}
              {form.provider === "STRIPE" && <label className="admin-field"><span>Cancel URL</span><input value={form.settings?.cancelUrl || ""} onChange={e => setForm((x: any) => ({ ...x, settings: { ...x.settings, cancelUrl: e.target.value } }))} placeholder={origin + "/order-success?payment=cancelled"} /></label>}
              {form.provider === "PAYPAL" && <label className="admin-field"><span>Cancel URL</span><input value={form.settings?.cancelUrl || ""} onChange={e => setForm((x: any) => ({ ...x, settings: { ...x.settings, cancelUrl: e.target.value } }))} placeholder={origin + "/order-success?payment=cancelled"} /></label>}
              {form.provider === "PAYPAL" && <label className="admin-field"><span>API base URL</span><input value={form.settings?.apiBaseUrl || ""} onChange={e => setForm((x: any) => ({ ...x, settings: { ...x.settings, apiBaseUrl: e.target.value } }))} placeholder="https://api-m.paypal.com" /></label>}
              {(form.provider === "JAZZCASH" || form.provider === "EASYPAISA") && <label className="admin-field"><span>Gateway URL <b>*</b></span><input value={form.settings?.gatewayUrl || ""} onChange={e => setForm((x: any) => ({ ...x, settings: { ...x.settings, gatewayUrl: e.target.value } }))} placeholder="Provider gateway URL" /></label>}
              {form.provider === "EASYPAISA" && <label className="admin-field"><span>Confirmation URL <b>*</b></span><input value={form.settings?.confirmUrl || ""} onChange={e => setForm((x: any) => ({ ...x, settings: { ...x.settings, confirmUrl: e.target.value } }))} placeholder="Provider confirmation endpoint" /></label>}
              {form.provider === "MCB_EGATE" && <><label className="admin-field"><span>MPGS API base URL <b>*</b></span><input value={form.settings?.apiBaseUrl || ""} onChange={e => setForm((x: any) => ({ ...x, settings: { ...x.settings, apiBaseUrl: e.target.value } }))} placeholder="MCB-provided MPGS base URL" /></label><label className="admin-field"><span>API version</span><input value={form.settings?.apiVersion || "61"} onChange={e => setForm((x: any) => ({ ...x, settings: { ...x.settings, apiVersion: e.target.value } }))} placeholder="61" /></label><label className="admin-field"><span>Checkout JS URL <b>*</b></span><input value={form.settings?.checkoutJsUrl || ""} onChange={e => setForm((x: any) => ({ ...x, settings: { ...x.settings, checkoutJsUrl: e.target.value } }))} placeholder="MCB-provided Checkout.js URL" /></label></>}
            </div>
          </div>
        )}

        {(form.provider === "BANK_TRANSFER" || form.provider === "RAAST") && (
          <div className="payment-settings">
            <div className="payment-section-title"><span>04</span><div><strong>Customer payment instructions</strong><small>These instructions are shown when the customer selects this method.</small></div></div>
            <label className="admin-field admin-field-wide"><span>Instructions</span><textarea value={form.instructions || ""} onChange={e => setForm({ ...form, instructions: e.target.value })} placeholder="Tell customers exactly how to pay and what reference they must include." /></label>
          </div>
        )}

        <div className="payment-readiness">
          <div><strong>Required for {PAYMENT_METHOD_LABELS[form.provider]}</strong><small>Complete these items before enabling live checkout.</small></div>
          <ul>{requirements.map(item => <li key={item}>{item}</li>)}</ul>
        </div>

        <div className="payment-endpoints">
          <div className="payment-section-title"><span>05</span><div><strong>MOTEVRA callback endpoints</strong><small>Copy these into the provider portal when the provider asks for a return/callback URL.</small></div></div>
          <div className="endpoint-list">
            {form.provider === "STRIPE" && <code>{origin}/api/payments/stripe/callback?session_id={"{"}CHECKOUT_SESSION_ID{"}"}</code>}
            {form.provider === "PAYPAL" && <code>{origin}/api/payments/paypal/callback</code>}
            {form.provider === "JAZZCASH" && <code>{origin}/api/payments/jazzcash/callback</code>}
            {form.provider === "EASYPAISA" && <code>{origin}/api/payments/easypaisa/callback</code>}
            {form.provider === "MCB_EGATE" && <code>{origin}/api/payments/mcb/callback?transaction={"{"}PAYMENT_TRANSACTION_ID{"}"}</code>}
            {form.provider === "ALIBABA" && <code>{origin}/api/admin/supplier-connections/callback</code>}
            {!["STRIPE","PAYPAL","JAZZCASH","EASYPAISA","MCB_EGATE","ALIBABA"].includes(form.provider) && <span className="muted">No provider callback is required by the current MOTEVRA flow. Use the instructions above.</span>}
          </div>
        </div>

        <div className="admin-form-actions">
          <label className="check payment-enabled"><input type="checkbox" checked={form.enabled} onChange={e => setForm({ ...form, enabled: e.target.checked })} /> Enable this method at checkout</label>
          <button className="button button-dark" disabled={busy}>{busy ? "Saving…" : editing ? "Save payment connection" : "Save payment connection"}</button>
          {editing && <button type="button" className="button" onClick={reset}>Cancel</button>}
        </div>
        {msg && <div className="admin-message">{msg}</div>}
      </form>

      <div className="payment-list">
        <div className="payment-list-head"><div><p className="eyebrow">CONNECTED METHODS</p><h2>Payment methods</h2></div><span>{rows.filter(x => x.enabled).length} enabled</span></div>
        <div className="payment-method-cards">
          {rows.map(m => (
            <article className="payment-method-card" key={m.id}>
              <div className="payment-card-top"><div><span className="payment-provider-label">{PAYMENT_METHOD_LABELS[m.provider] || m.provider}</span><h3>{m.name}</h3></div><span className={m.enabled ? "payment-status on" : "payment-status"}>{m.enabled ? "ENABLED" : "DISABLED"}</span></div>
              <p>{m.countries.length ? m.countries.join(" · ") : "All countries"} <span>•</span> {m.currencies.length ? m.currencies.join(" · ") : "All currencies"}</p>
              <small>{m.hasCredentials ? "Credentials stored securely" : "No credentials stored"} · {m.mode}</small>
              <div className="payment-card-actions"><button className="button button-small" onClick={() => test(m.id)} disabled={testing === m.id}>{testing === m.id ? "Testing…" : "Test connection"}</button><button className={m.enabled ? "button button-small button-dark" : "button button-small"} onClick={() => toggleEnabled(m)}>{m.enabled ? "Disable" : "Enable"}</button><button className="button button-small" onClick={() => edit(m)}>Edit</button><button className="button button-small" onClick={() => remove(m.id)}>Delete</button></div>
            </article>
          ))}
        </div>
        {!rows.length && !busy && <div className="empty-state"><span>PAYMENT METHODS</span><h2>No connections yet.</h2><p>Select a payment method above, enter its credentials, verify the required onboarding items, then enable it for checkout.</p></div>}
      </div>
    </div>
  );
}
