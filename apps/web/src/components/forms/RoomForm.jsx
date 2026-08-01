import { useState } from "react";
import { createRoomSchema } from "@wartungstermine/shared";
import TextField from "./TextField";

function buildFieldErrors(zodError) {
  const errors = {};
  for (const issue of zodError.issues) {
    const key = issue.path[0];
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}

function RoomForm({ onSubmit, isSubmitting, submitError }) {
  const [name, setName] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  async function handleSubmit(e) {
    e.preventDefault();
    const result = createRoomSchema.safeParse({ name });
    if (!result.success) {
      setFieldErrors(buildFieldErrors(result.error));
      return;
    }
    setFieldErrors({});
    const ok = await onSubmit(result.data);
    if (ok) setName("");
  }

  return (
    <form onSubmit={handleSubmit} className="form-grid" noValidate>
      <TextField
        id="name"
        label="Room name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        error={fieldErrors.name}
        className="form-field form-field--full"
      />
      {submitError && (
        <p role="alert" className="field-error form-field--full">
          {submitError}
        </p>
      )}
      <div className="form-actions form-field--full">
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add room"}
        </button>
      </div>
    </form>
  );
}

export default RoomForm;
