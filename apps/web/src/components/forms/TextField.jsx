function TextField({
  id,
  label,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
  hint,
  error,
  placeholder,
  max,
  autoComplete,
  className = "form-field",
}) {
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className={className}>
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value ?? ""}
        onChange={onChange}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        max={max}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
      />
      {hint && (
        <span id={hintId} className="field-hint">
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} className="field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export default TextField;
