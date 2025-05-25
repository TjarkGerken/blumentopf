// src/context/PlantProvider.tsx
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { Plant, BlumentopfDevice, PlantHistory } from "../types/models";
import {
  plantService,
  deviceService,
  plantHistoryService,
} from "../services/supabaseService";

interface PlantContextType {
  plants: Plant[];
  devices: BlumentopfDevice[];
  plantHistory: Record<string, PlantHistory[]>;
  selectedPlantId: string | null;
  loading: boolean;
  error: string | null;
  setSelectedPlantId: (id: string | null) => void;
  getPlantById: (id: string) => Plant | undefined;
  getDeviceById: (id: string) => BlumentopfDevice | undefined;
  getDeviceForPlant: (plantId: string) => BlumentopfDevice | undefined;
  waterPlant: (plantId: string, amount: number) => Promise<void>;
  updatePlantSettings: (plant: Plant) => Promise<void>;
  updateDeviceSettings: (device: BlumentopfDevice) => Promise<void>;
  refreshData: () => Promise<void>;
  loadPlantHistory: (plantId: string) => Promise<void>;
  associateDeviceWithPlant: (
    deviceId: string,
    plantId: string,
  ) => Promise<void>;
  disassociateDevice: (deviceId: string) => Promise<void>;
}

const PlantContext = createContext<PlantContextType | null>(null);

export const PlantProvider = ({ children }: { children: ReactNode }) => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [devices, setDevices] = useState<BlumentopfDevice[]>([]);
  const [plantHistory, setPlantHistory] = useState<
    Record<string, PlantHistory[]>
  >({});
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Set selected plant to first plant when plants load
  useEffect(() => {
    if (plants.length > 0 && !selectedPlantId) {
      setSelectedPlantId(plants[0].id);
    }
  }, [plants, selectedPlantId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [plantsData, devicesData] = await Promise.all([
        plantService.getAll(),
        deviceService.getAll(),
      ]);

      setPlants(plantsData);
      setDevices(devicesData);

      // Load history for all plants
      const historyPromises = plantsData.map(async (plant) => {
        const history = await plantHistoryService.getByPlantId(plant.id);
        return { plantId: plant.id, history };
      });

      const historyResults = await Promise.all(historyPromises);
      const historyData: Record<string, PlantHistory[]> = {};

      historyResults.forEach(({ plantId, history }) => {
        historyData[plantId] = history;
      });

      setPlantHistory(historyData);
    } catch (err) {
      console.error("Error loading initial data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await loadInitialData();
  };

  const loadPlantHistory = async (plantId: string) => {
    try {
      const history = await plantHistoryService.getByPlantId(plantId);
      setPlantHistory((prev) => ({
        ...prev,
        [plantId]: history,
      }));
    } catch (err) {
      console.error("Error loading plant history:", err);
    }
  };

  const getPlantById = (id: string) => {
    return plants.find((plant) => plant.id === id);
  };

  const getDeviceById = (id: string) => {
    return devices.find((device) => device.id === id);
  };

  const getDeviceForPlant = (plantId: string) => {
    return devices.find((device) => device.plantId === plantId);
  };

  const waterPlant = async (plantId: string, amount: number) => {
    try {
      setError(null);

      // Update plant in database
      const updatedPlant = await plantService.waterPlant(plantId, amount);

      // Update local state
      setPlants((prev) =>
        prev.map((plant) => (plant.id === plantId ? updatedPlant : plant)),
      );

      // Reload history for this plant
      await loadPlantHistory(plantId);
    } catch (err) {
      console.error("Error watering plant:", err);
      setError("Failed to water plant. Please try again.");
      throw err;
    }
  };

  const updatePlantSettings = async (updatedPlant: Plant) => {
    try {
      setError(null);

      const result = await plantService.update(updatedPlant.id, updatedPlant);

      setPlants((prev) =>
        prev.map((plant) => (plant.id === updatedPlant.id ? result : plant)),
      );
    } catch (err) {
      console.error("Error updating plant:", err);
      setError("Failed to update plant. Please try again.");
      throw err;
    }
  };

  const updateDeviceSettings = async (updatedDevice: BlumentopfDevice) => {
    try {
      setError(null);

      const result = await deviceService.update(
        updatedDevice.id,
        updatedDevice,
      );

      setDevices((prev) =>
        prev.map((device) =>
          device.id === updatedDevice.id ? result : device,
        ),
      );
    } catch (err) {
      console.error("Error updating device:", err);
      setError("Failed to update device. Please try again.");
      throw err;
    }
  };

  const associateDeviceWithPlant = async (
    deviceId: string,
    plantId: string,
  ) => {
    try {
      setError(null);

      const result = await deviceService.associateWithPlant(deviceId, plantId);

      setDevices((prev) =>
        prev.map((device) => (device.id === deviceId ? result : device)),
      );
    } catch (err) {
      console.error("Error associating device with plant:", err);
      setError("Failed to associate device with plant. Please try again.");
      throw err;
    }
  };

  const disassociateDevice = async (deviceId: string) => {
    try {
      setError(null);

      const result = await deviceService.disassociateFromPlant(deviceId);

      setDevices((prev) =>
        prev.map((device) => (device.id === deviceId ? result : device)),
      );
    } catch (err) {
      console.error("Error disassociating device:", err);
      setError("Failed to disassociate device. Please try again.");
      throw err;
    }
  };

  return (
    <PlantContext.Provider
      value={{
        plants,
        devices,
        plantHistory,
        selectedPlantId,
        loading,
        error,
        setSelectedPlantId,
        getPlantById,
        getDeviceById,
        getDeviceForPlant,
        waterPlant,
        updatePlantSettings,
        updateDeviceSettings,
        refreshData,
        loadPlantHistory,
        associateDeviceWithPlant,
        disassociateDevice,
      }}
    >
      {children}
    </PlantContext.Provider>
  );
};

export const usePlants = () => {
  const context = useContext(PlantContext);

  if (!context) {
    throw new Error("usePlants must be used within a PlantProvider");
  }

  return context;
};
