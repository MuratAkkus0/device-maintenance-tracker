import { useState } from "react";
import DeviceCard from "./DeviceCard";
import EmptyState from "./EmptyState";
import ErrorBanner from "./ErrorBanner";

function SkeletonGrid({ count }) {
  return (
    <div className="device-list__grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton skeleton-card" />
      ))}
    </div>
  );
}

function DeviceList({
  title,
  devices,
  isLoading,
  error,
  onRetry,
  emptyMessage = "No devices found.",
  limit,
  isAdmin,
  onSelectDevice,
  onDeleteDevice,
  onSendReminder,
  sendingReminderId,
}) {
  const [showAll, setShowAll] = useState(false);
  const visibleDevices = limit && !showAll ? devices.slice(0, limit) : devices;
  const hasMore = Boolean(limit) && devices.length > limit;

  return (
    <section className="device-list" aria-labelledby={`${title}-heading`}>
      <div className="device-list__header">
        <h2 id={`${title}-heading`}>{title}</h2>
        {!isLoading && !error && <span className="device-list__count">{devices.length}</span>}
      </div>

      {error && (
        <div style={{ padding: "1rem" }}>
          <ErrorBanner message={error} onRetry={onRetry} />
        </div>
      )}

      {isLoading && !error && <SkeletonGrid count={limit ?? 3} />}

      {!isLoading && !error && devices.length === 0 && <EmptyState message={emptyMessage} />}

      {!isLoading && !error && devices.length > 0 && (
        <>
          <div className="device-list__grid" role="list">
            {visibleDevices.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                isAdmin={isAdmin}
                onSelect={onSelectDevice}
                onDelete={onDeleteDevice}
                onSendReminder={onSendReminder}
                isSendingReminder={sendingReminderId === device.id}
              />
            ))}
          </div>
          {hasMore && (
            <div className="device-list__footer">
              <button type="button" className="btn-link" onClick={() => setShowAll((v) => !v)}>
                {showAll ? "Show less" : `Show all ${devices.length}`}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default DeviceList;
