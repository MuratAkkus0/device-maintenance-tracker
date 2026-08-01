import { useState } from "react";
import { registerSchema } from "@wartungstermine/shared";
import TextField from "./TextField";

function buildFieldErrors(zodError) {
  const errors = {};
  for (const issue of zodError.issues) {
    const key = issue.path[0];
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}

function RegisterForm({ onSubmit, isSubmitting, submitError }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const result = registerSchema.safeParse(form);
    if (!result.success) {
      setFieldErrors(buildFieldErrors(result.error));
      return;
    }
    setFieldErrors({});
    onSubmit(result.data);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <TextField
        id="name"
        label="Full name"
        value={form.name}
        onChange={(e) => update("name", e.target.value)}
        required
        autoComplete="name"
        error={fieldErrors.name}
      />
      <TextField
        id="email"
        label="Email"
        type="email"
        value={form.email}
        onChange={(e) => update("email", e.target.value)}
        required
        autoComplete="email"
        error={fieldErrors.email}
      />
      <TextField
        id="password"
        label="Password"
        type="password"
        value={form.password}
        onChange={(e) => update("password", e.target.value)}
        required
        autoComplete="new-password"
        hint="At least 8 characters."
        error={fieldErrors.password}
      />
      {submitError && (
        <p role="alert" className="field-error">
          {submitError}
        </p>
      )}
      <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}

export default RegisterForm;
