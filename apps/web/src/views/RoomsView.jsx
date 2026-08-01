import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { MdDeleteForever } from "react-icons/md";
import * as roomsApi from "../api/rooms.api";
import { getErrorMessage } from "../api/errors";
import { useAuth } from "../auth/useAuth";
import RoomForm from "../components/forms/RoomForm";
import LoadingScreen from "../components/LoadingScreen";
import ErrorBanner from "../components/ErrorBanner";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";

function RoomsView() {
  const { isAdmin } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function load() {
    setIsLoading(true);
    setError("");
    roomsApi
      .listRooms()
      .then(setRooms)
      .catch((err) => setError(getErrorMessage(err, "Could not load rooms.")))
      .finally(() => setIsLoading(false));
  }

  useEffect(load, []);

  async function handleAdd(data) {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const created = await roomsApi.createRoom(data);
      setRooms((prev) => [...prev, created]);
      toast.success("Room added successfully.");
      return true;
    } catch (err) {
      setSubmitError(getErrorMessage(err, "Could not add this room."));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirmDelete() {
    if (!roomToDelete) return;
    setIsDeleting(true);
    try {
      await roomsApi.deleteRoom(roomToDelete.id);
      setRooms((prev) => prev.filter((r) => r.id !== roomToDelete.id));
      toast.success("Room deleted successfully.");
    } catch (err) {
      // A room that still holds devices returns 409 - surfaced as a clean,
      // actionable message instead of a dashboard crash.
      toast.error(getErrorMessage(err, "Could not delete this room."));
    } finally {
      // Always dismiss the confirmation dialog - on success the row is
      // gone, on failure the toast already explains why, so leaving the
      // modal stuck open (blocking the rest of the page) serves no one.
      setRoomToDelete(null);
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Rooms</h1>
          <p>Physical spaces a desktop computer can be located in.</p>
        </div>
      </div>

      {isAdmin && (
        <div className="form-card">
          <RoomForm onSubmit={handleAdd} isSubmitting={isSubmitting} submitError={submitError} />
        </div>
      )}

      {isLoading && <LoadingScreen label="Loading rooms..." />}
      {!isLoading && error && <ErrorBanner message={error} onRetry={load} />}
      {!isLoading && !error && rooms.length === 0 && (
        <EmptyState message="No rooms have been added yet." />
      )}

      {!isLoading && !error && rooms.length > 0 && (
        <table className="list-table">
          <thead>
            <tr>
              <th>Name</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id}>
                <td data-label="Name">{room.name}</td>
                {isAdmin && (
                  <td data-label="Actions">
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => setRoomToDelete(room)}
                      aria-label={`Delete ${room.name}`}
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
        open={Boolean(roomToDelete)}
        title="Delete room"
        description={roomToDelete ? `Delete ${roomToDelete.name}? This cannot be undone.` : ""}
        confirmLabel="Delete"
        isBusy={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setRoomToDelete(null)}
      />
    </>
  );
}

export default RoomsView;
