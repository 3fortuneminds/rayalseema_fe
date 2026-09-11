import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  name,
  icon: Icon,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword && showPassword ? "text" : type;

  return (
    <div className="input-group">
      {label && <label htmlFor={name}>{label}</label>}
      <div className={`input-field${Icon ? " has-icon" : ""}${isPassword ? " has-toggle" : ""}`}>
        {Icon && <Icon size={16} className="input-field-icon" aria-hidden="true" />}
        <input
          id={name}
          name={name}
          type={resolvedType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={error ? "input-error" : ""}
        />
        {isPassword && (
          <button
            type="button"
            className="input-field-toggle"
            onClick={() => setShowPassword((s) => !s)}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
}
