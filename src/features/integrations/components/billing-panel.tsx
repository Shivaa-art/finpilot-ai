export function BillingPanel() {
  return (
    <div className="max-w-lg rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-soft">
      <h2 className="text-sm font-semibold text-dark">Current plan</h2>
      <div className="mt-3 flex items-center justify-between rounded-xl bg-primary-light px-4 py-3">
        <span className="text-sm font-medium text-primary-dark">Beta — Free</span>
        <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-white">Active</span>
      </div>
      <p className="mt-4 text-xs text-muted">
        This is not connected to a real payment processor. No card is charged, and no subscription is active — this
        panel is a placeholder for real billing (e.g. Stripe) once the product is ready to charge for usage.
      </p>
    </div>
  );
}
