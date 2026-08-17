import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function TextField({ label, error, registration, type = "text", showPasswordToggle, ...rest }) {
  const [show, setShow] = useState(false);
  const inputType = type === "password" && show ? "text" : type;
  const enableToggle = typeof showPasswordToggle === "boolean" ? showPasswordToggle : type === "password";

  return (
    <label className="flex flex-col gap-2">
      <span className="label text-muted">{label}</span>
      <div className="relative">
        <input
          type={inputType}
          aria-invalid={Boolean(error)}
          className={`w-full border bg-transparent px-4 py-3 text-sm outline-none transition-colors focus:border-ink ${
            error ? "border-accent" : "border-line"
          }`}
          {...registration}
          {...rest}
        />

        {enableToggle && type === "password" && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-pressed={show}
            title={show ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && <span className="text-xs text-accent">{error.message}</span>}
    </label>
  );
}
