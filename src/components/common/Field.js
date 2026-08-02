export function Field({ label, hint, children }) {
  return (
    <label className="field">
      <span className="field-label">
        {label}
        {hint && <span>{hint}</span>}
      </span>
      {children}
    </label>
  );
}
