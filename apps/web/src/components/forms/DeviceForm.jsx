import { useMemo, useState } from "react";
import { createDeviceSchema, DEVICE_TYPES } from "@wartungstermine/shared";
import TextField from "./TextField";
import SelectField from "./SelectField";

const today = new Date().toISOString().slice(0, 10);

function buildFieldErrors(zodError) {
  const errors = {};
  for (const issue of zodError.issues) {
    const key = issue.path[0];
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}

function toPayload(form) {
  return {
    type: form.type,
    macAddress: form.macAddress.trim(),
    purchaseDate: form.purchaseDate,
    lastServiceDate: form.lastServiceDate,
    maintenanceIntervalMonths: form.maintenanceIntervalMonths
      ? Number(form.maintenanceIntervalMonths)
      : undefined,
    ownerStaffId: form.type === "LAPTOP" && form.locationId ? Number(form.locationId) : undefined,
    roomId: form.type === "DESKTOP" && form.locationId ? Number(form.locationId) : undefined,
    technicianId: form.technicianId ? Number(form.technicianId) : undefined,
  };
}

function DeviceForm({ initialDevice, staffOptions, roomOptions, technicianOptions, onSubmit, onCancel, isSubmitting, submitError }) {
  const isEdit = Boolean(initialDevice);

  const [form, setForm] = useState(() => ({
    type: initialDevice?.type || DEVICE_TYPES.LAPTOP,
    macAddress: initialDevice?.macAddress || "",
    purchaseDate: initialDevice?.purchaseDate?.slice(0, 10) || "",
    lastServiceDate: initialDevice?.lastServiceDate?.slice(0, 10) || "",
    maintenanceIntervalMonths: initialDevice?.maintenanceIntervalMonths ?? "",
    locationId: String(initialDevice?.ownerStaffId ?? initialDevice?.roomId ?? ""),
    technicianId: String(initialDevice?.technicianId ?? ""),
  }));
  const [fieldErrors, setFieldErrors] = useState({});

  const locationOptions = useMemo(
    () =>
      form.type === "LAPTOP"
        ? staffOptions.map((s) => ({ value: String(s.id), label: `${s.firstName} ${s.lastName}` }))
        : roomOptions.map((r) => ({ value: String(r.id), label: r.name })),
    [form.type, staffOptions, roomOptions]
  );

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = toPayload(form);
    const result = createDeviceSchema.safeParse(payload);

    if (!result.success) {
      setFieldErrors(buildFieldErrors(result.error));
      return;
    }

    setFieldErrors({});
    onSubmit(result.data);
  }

  return (
    <form onSubmit={handleSubmit} className="form-grid" noValidate>
      <SelectField
        id="type"
        label="Device type"
        value={form.type}
        onChange={(e) => update("type", e.target.value)}
        required
        error={fieldErrors.type}
        options={[
          { value: DEVICE_TYPES.LAPTOP, label: "Laptop" },
          { value: DEVICE_TYPES.DESKTOP, label: "Desktop" },
        ]}
      />

      <SelectField
        id="locationId"
        label={form.type === "LAPTOP" ? "Owner" : "Room"}
        value={form.locationId}
        onChange={(e) => update("locationId", e.target.value)}
        required
        error={fieldErrors.ownerStaffId || fieldErrors.roomId}
        options={locationOptions}
        placeholder={form.type === "LAPTOP" ? "Select an owner" : "Select a room"}
      />

      <SelectField
        id="technicianId"
        label="Responsible technician"
        value={form.technicianId}
        onChange={(e) => update("technicianId", e.target.value)}
        required
        error={fieldErrors.technicianId}
        options={technicianOptions.map((t) => ({ value: String(t.id), label: `${t.name} (${t.email})` }))}
        placeholder="Select a technician"
      />

      <TextField
        id="maintenanceIntervalMonths"
        label="Maintenance interval (months)"
        type="number"
        value={form.maintenanceIntervalMonths}
        onChange={(e) => update("maintenanceIntervalMonths", e.target.value)}
        required
        error={fieldErrors.maintenanceIntervalMonths}
        hint="Between 1 and 60 months."
      />

      <TextField
        id="macAddress"
        label="MAC address (optional)"
        value={form.macAddress}
        onChange={(e) => update("macAddress", e.target.value)}
        placeholder="00:1A:2B:3C:4D:5E"
        error={fieldErrors.macAddress}
      />

      <TextField
        id="purchaseDate"
        label="Purchase date"
        type="date"
        value={form.purchaseDate}
        onChange={(e) => update("purchaseDate", e.target.value)}
        required
        max={today}
        error={fieldErrors.purchaseDate}
      />

      <TextField
        id="lastServiceDate"
        label="Last service date"
        type="date"
        value={form.lastServiceDate}
        onChange={(e) => update("lastServiceDate", e.target.value)}
        required
        max={today}
        error={fieldErrors.lastServiceDate}
        hint="Used to compute the next due date."
      />

      {submitError && (
        <p role="alert" className="field-error form-field--full">
          {submitError}
        </p>
      )}

      <div className="form-actions form-field--full">
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Add device"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default DeviceForm;
