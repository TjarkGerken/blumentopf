// src/hooks/useWateringCommand.ts
import { useState, useEffect } from "react";
import { wateringService, WateringCommand } from "../services/wateringService";

export const useWateringCommand = (commandId: string | null) => {
  const [command, setCommand] = useState<WateringCommand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!commandId) {
      setCommand(null);
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | null = null;

    const loadCommand = async () => {
      try {
        setLoading(true);
        setError(null);

        // Initial load
        const initialCommand = await wateringService.getCommand(commandId);
        setCommand(initialCommand);

        // Subscribe to updates
        unsubscribe = wateringService.subscribeToCommand(
          commandId,
          (updatedCommand) => {
            setCommand(updatedCommand);
          },
        );
      } catch (err) {
        console.error("Error loading watering command:", err);
        setError(err instanceof Error ? err.message : "Failed to load command");
      } finally {
        setLoading(false);
      }
    };

    loadCommand();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [commandId]);

  return { command, loading, error };
};
