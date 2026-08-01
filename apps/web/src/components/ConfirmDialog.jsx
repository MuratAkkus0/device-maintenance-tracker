import { useEffect, useRef } from "react";

// Wraps the native <dialog> element: it gives us Escape-to-close, a
// backdrop, and focus containment without any hand-rolled a11y plumbing.
function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDangerous = true,
  isBusy = false,
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="app-dialog"
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      aria-labelledby="confirm-dialog-title"
    >
      <div className="app-dialog__header">
        <h2 id="confirm-dialog-title">{title}</h2>
      </div>
      <div className="app-dialog__body">
        <p>{description}</p>
      </div>
      <div className="app-dialog__footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isBusy}>
          {cancelLabel}
        </button>
        <button
          type="button"
          className={isDangerous ? "btn btn-danger" : "btn btn-primary"}
          onClick={onConfirm}
          disabled={isBusy}
        >
          {isBusy ? "Please wait..." : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}

export default ConfirmDialog;
