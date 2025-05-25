// src/hooks/useDeviceStatus.ts
import { useState, useEffect } from "react";
import { wateringService, DeviceStatus } from "../services/wateringService";

export const useDeviceStatus = (deviceId: string | null) => {
  const [status, setStatus] = useState<DeviceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!deviceId) {
      setStatus(null);
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | null = null;

    const loadStatus = async () => {
      try {
        setLoading(true);
        setError(null);

        // Initial load
        const initialStatus = await wateringService.getDeviceStatus(deviceId);
        setStatus(initialStatus);

        // Subscribe to updates
        unsubscribe = wateringService.subscribeToDeviceStatus(
          deviceId,
          (updatedStatus) => {
            setStatus(updatedStatus);
          },
        );
      } catch (err) {
        console.error("Error loading device status:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load device status",
        );
      } finally {
        setLoading(false);
      }
    };

    loadStatus();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [deviceId]);

  const isOnline = status?.onlineStatus || false;
  const lastSeen = status?.lastSeen;
  const isRecent = lastSeen ? Date.now() - lastSeen.getTime() < 60000 : false; // Within 1 minute

  return {
    status,
    loading,
    error,
    isOnline: isOnline && isRecent,
    lastSeenAgo: lastSeen ? Date.now() - lastSeen.getTime() : null,
  };
};
