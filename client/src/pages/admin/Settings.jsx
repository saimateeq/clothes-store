import { isStripeEnabled } from "../../lib/stripe";

function StatusRow({ label, ok, hint }) {
  return (
    <div className="flex items-center justify-between border-b border-line py-3 text-sm last:border-0">
      <span>{label}</span>
      <span className={`label ${ok ? "text-ink" : "text-muted"}`}>{ok ? "Configured" : hint}</span>
    </div>
  );
}

export default function Settings() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="label text-accent">Store</span>
        <h1 className="font-heading text-4xl">Settings</h1>
      </div>

      <div className="border border-line p-6">
        <h2 className="label mb-2 text-muted">Integration Status</h2>
        <p className="mb-4 text-xs text-muted">
          These are configured via environment variables (server/.env and client/.env), not editable here — see the
          README for setup instructions.
        </p>
        <StatusRow label="Stripe Payments" ok={isStripeEnabled} hint="Not configured" />
        <StatusRow label="Cloudinary Image Hosting" ok={false} hint="Check server logs on boot" />
        <StatusRow label="Email (SMTP)" ok={false} hint="Check server logs on boot" />
      </div>

      <div className="border border-line p-6">
        <h2 className="label mb-4 text-muted">Store Rules (Current Defaults)</h2>
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Currency</dt>
            <dd>USD</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Free Shipping Threshold</dt>
            <dd>$100</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Standard / Express Shipping</dt>
            <dd>$8 / $20</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Default Low Stock Threshold</dt>
            <dd>5 units</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Return Window</dt>
            <dd>30 days</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-muted">
          Editable, persisted store settings (currency switching, dynamic tax rates, custom thresholds) are a
          natural next step — currently these live in{" "}
          <code>server/services/checkoutPricingService.js</code> and per-product{" "}
          <code>lowStockThreshold</code>.
        </p>
      </div>
    </div>
  );
}
