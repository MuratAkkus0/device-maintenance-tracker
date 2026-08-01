function TextAreaField({
  id,
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  error,
  rows = 3,
  maxLength,
  className = "form-field form-field--full",
}) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={className}>
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <textarea
        id={id}
        name={id}
        value={value ?? ""}
        onChange={onChange}
        required={required}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
      />
      {error && (
        <span id={errorId} className="field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export default TextAreaField;
