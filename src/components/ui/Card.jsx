export default function Card({ title, children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl shadow p-5 ${className}`}>
      {title && <h2 className="text-lg font-semibold mb-3">{title}</h2>}
      {children}
    </div>
  );
}
