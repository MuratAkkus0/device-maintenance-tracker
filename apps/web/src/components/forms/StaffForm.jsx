import { useState } from "react";
import { createStaffSchema } from "@wartungstermine/shared";
import TextField from "./TextField";

function buildFieldErrors(zodError) {
  const errors = {};
  for (const issue of zodError.issues) {
    const key = issue.path[0];
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}

function StaffForm({ onSubmit, isSubmitting, submitError }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", department: "" });
  const [fieldErrors, setFieldErrors] = useState({});

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const result = createStaffSchema.safeParse(form);
    if (!result.success) {
      setFieldErrors(buildFieldErrors(result.error));
      return;
    }
    setFieldErrors({});
    const ok = await onSubmit(result.data);
    if (ok) setForm({ firstName: "", lastName: "", department: "" });
  }

  return (
    <form onSubmit={handleSubmit} className="form-grid" noValidate>
      <TextField
        id="firstName"
        label="First name"
        value={form.firstName}
        onChange={(e) => update("firstName", e.target.value)}
        required
        error={fieldErrors.firstName}
      />
      <TextField
        id="lastName"
        label="Last name"
        value={form.lastName}
        onChange={(e) => update("lastName", e.target.value)}
        required
        error={fieldErrors.lastName}
      />
      <TextField
        id="department"
        label="Department"
        value={form.department}
        onChange={(e) => update("department", e.target.value)}
        required
        error={fieldErrors.department}
        className="form-field form-field--full"
      />
      {submitError && (
        <p role="alert" className="field-error form-field--full">
          {submitError}
        </p>
      )}
      <div className="form-actions form-field--full">
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add staff member"}
        </button>
      </div>
    </form>
  );
}

export default StaffForm;
