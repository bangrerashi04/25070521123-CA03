export default function StatCard({ icon, label, value, hint, tone = 'violet' }) {
  return (
    <div className={`stat stat--${tone}`}>
      <span className="stat__icon">{icon}</span>
      <div className="stat__body">
        <span className="stat__label">{label}</span>
        <strong className="stat__value">{value}</strong>
        <span className="stat__hint">{hint}</span>
      </div>
    </div>
  );
}
