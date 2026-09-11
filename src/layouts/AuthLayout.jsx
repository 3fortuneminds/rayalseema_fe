export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-visual" role="img" aria-label="Rayalseema Dhaba & Family Restaurant — Authentic Rayalaseema food, delivered with care." />
        <div className="auth-form-col">
          {title && <h1 className="auth-title">{title}</h1>}
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
