export default function AdminLoader({ label = "Loading" }) {
  return (
    <div className="admin-loader" role="status" aria-live="polite" aria-label={label}>
      <span className="admin-loader__spinner" aria-hidden="true" />
    </div>
  );
}
