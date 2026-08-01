import { useCallback, useEffect, useState } from "react";
import * as devicesApi from "../api/devices.api";
import { getErrorMessage } from "../api/errors";

// Fetches a devices page for the given (server-side) filter params and
// exposes the loading/error/data triple plus a setter so callers can patch
// individual devices in place after a mutation without a full refetch.
export function useDeviceList(params) {
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  const paramsKey = JSON.stringify(params ?? {});

  const load = useCallback(() => {
    setIsLoading(true);
    setError("");
    devicesApi
      .listDevices(JSON.parse(paramsKey))
      .then((result) => setDevices(result.data))
      .catch((err) => setError(getErrorMessage(err, "Could not load devices.")))
      .finally(() => setIsLoading(false));
  }, [paramsKey]);

  useEffect(() => {
    load();
  }, [load, reloadToken]);

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  const removeDevice = useCallback((id) => {
    setDevices((prev) => prev.filter((device) => device.id !== id));
  }, []);

  const upsertDevice = useCallback((device) => {
    setDevices((prev) => {
      const exists = prev.some((d) => d.id === device.id);
      return exists ? prev.map((d) => (d.id === device.id ? device : d)) : [device, ...prev];
    });
  }, []);

  return { devices, isLoading, error, refetch, removeDevice, upsertDevice, setDevices };
}
