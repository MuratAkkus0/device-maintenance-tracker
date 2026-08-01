import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { MdDeleteForever } from "react-icons/md";
import * as staffApi from "../api/staff.api";
import { getErrorMessage } from "../api/errors";
import { useAuth } from "../auth/useAuth";
import StaffForm from "../components/forms/StaffForm";
import LoadingScreen from "../components/LoadingScreen";
import ErrorBanner from "../components/ErrorBanner";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";

function StaffView() {
  const { isAdmin } = useAuth();
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function load() {
    setIsLoading(true);
    setError("");
    staffApi
      .listStaff()
      .then(setStaff)
      .catch((err) => setError(getErrorMessage(err, "Could not load staff.")))
      .finally(() => setIsLoading(false));
  }

  useEffect(load, []);

  async function handleAdd(data) {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const created = await staffApi.createStaff(data);
      setStaff((prev) => [...prev, created]);
      toast.success("Staff member added successfully.");
      return true;
    } catch (err) {
      setSubmitError(getErrorMessage(err, "Could not add this staff member."));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirmDelete() {
    if (!staffToDelete) return;
    setIsDeleting(true);
    try {
      await staffApi.deleteStaff(staffToDelete.id);
      setStaff((prev) => prev.filter((s) => s.id !== staffToDelete.id));
      toast.success("Staff member deleted successfully.");
    } catch (err) {
      // A staff member who still owns a device returns 409 - surfaced as a
      // clean, actionable message instead of the old dangling-reference
      // white screen.
      toast.error(getErrorMessage(err, "Could not delete this staff member."));
    } finally {
      // Always dismiss the confirmation dialog - on success the row is
      // gone, on failure the toast already explains why, so leaving the
      // modal stuck open (blocking the rest of the page) serves no one.
      setStaffToDelete(null);
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Staff</h1>
          <p>People who can own a laptop.</p>
        </div>
      </div>

      {isAdmin && (
        <div className="form-card">
          <StaffForm onSubmit={handleAdd} isSubmitting={isSubmitting} submitError={submitError} />
        </div>
      )}

      {isLoading && <LoadingScreen label="Loading staff..." />}
      {!isLoading && error && <ErrorBanner message={error} onRetry={load} />}
      {!isLoading && !error && staff.length === 0 && (
        <EmptyState message="No staff members have been added yet." />
      )}

      {!isLoading && !error && staff.length > 0 && (
        <table className="list-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {staff.map((person) => (
              <tr key={person.id}>
                <td data-label="Name">
                  {person.firstName} {person.lastName}
                </td>
                <td data-label="Department">{person.department}</td>
                {isAdmin && (
                  <td data-label="Actions">
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => setStaffToDelete(person)}
                      aria-label={`Delete ${person.firstName} ${person.lastName}`}
                    >
                      <MdDeleteForever aria-hidden="true" size={20} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ConfirmDialog
        open={Boolean(staffToDelete)}
        title="Delete staff member"
        description={
          staffToDelete
            ? `Delete ${staffToDelete.firstName} ${staffToDelete.lastName}? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        isBusy={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setStaffToDelete(null)}
      />
    </>
  );
}

export default StaffView;
