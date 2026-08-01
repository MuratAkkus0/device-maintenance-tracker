import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import * as devicesApi from "../api/devices.api";
import * as staffApi from "../api/staff.api";
import * as roomsApi from "../api/rooms.api";
import { getErrorMessage } from "../api/errors";
import { useAuth } from "../auth/useAuth";
import { deriveTechnicianOptions } from "../utils/deriveTechnicianOptions";
import DeviceForm from "../components/forms/DeviceForm";
import LoadingScreen from "../components/LoadingScreen";
import ErrorBanner from "../components/ErrorBanner";

function DeviceFormView() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [device, setDevice] = useState(null);
  const [staffOptions, setStaffOptions] = useState([]);
  const [roomOptions, setRoomOptions] = useState([]);
  const [technicianOptions, setTechnicianOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setLoadError("");
      try {
        const [staff, rooms, allDevices, currentDevice] = await Promise.all([
          staffApi.listStaff(),
          roomsApi.listRooms(),
          devicesApi.listDevices({ pageSize: 200 }),
          isEdit ? devicesApi.getDevice(Number(id)) : Promise.resolve(null),
        ]);
        if (cancelled) return;
        setStaffOptions(staff);
        setRoomOptions(rooms);
        setTechnicianOptions(deriveTechnicianOptions(allDevices.data, user));
        setDevice(currentDevice);
      } catch (error) {
        if (!cancelled) setLoadError(getErrorMessage(error, "Could not load the form data."));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, isEdit, user]);

  async function handleSubmit(payload) {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      if (isEdit) {
        await devicesApi.updateDevice(Number(id), payload);
        toast.success("Device updated successfully.");
      } else {
        await devicesApi.createDevice(payload);
        toast.success("Device added successfully.");
      }
      navigate("/devices");
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Could not save this device."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <LoadingScreen label="Loading form..." />;
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>{isEdit ? "Edit device" : "Add device"}</h1>
          <p>{isEdit ? "Update this device's details." : "Register a new laptop or desktop."}</p>
        </div>
      </div>

      {loadError && <ErrorBanner message={loadError} />}

      {!loadError && (
        <div className="form-card">
          <DeviceForm
            initialDevice={device}
            staffOptions={staffOptions}
            roomOptions={roomOptions}
            technicianOptions={technicianOptions}
            onSubmit={handleSubmit}
            onCancel={() => navigate(-1)}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        </div>
      )}
    </>
  );
}

export default DeviceFormView;
