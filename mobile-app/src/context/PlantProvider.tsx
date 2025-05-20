// src/context/PlantContext.tsx
import React, { createContext, useState, useContext, ReactNode } from "react";
import { Plant, BlumentopfDevice, PlantHistory } from "../types/models";
import { mockPlants, mockDevices, mockPlantHistory } from "../data/mockData";

interface PlantContextType {
  plants: Plant[];
  devices: BlumentopfDevice[];
  plantHistory: Record<string, PlantHistory[]>;
  selectedPlantId: string | null;
  setSelectedPlantId: (id: string | null) => void;
  getPlantById: (id: string) => Plant | undefined;
  getDeviceById: (id: string) => BlumentopfDevice | undefined;
  getDeviceForPlant: (plantId: string) => BlumentopfDevice | undefined;
  waterPlant: (plantId: string, amount: number) => void;
  updatePlantSettings: (plant: Plant) => void;
  updateDeviceSettings: (device: BlumentopfDevice) => void;
}

const PlantContext = createContext<PlantContextType | null>(null);

export const PlantProvider = ({ children }: { children: ReactNode }) => {
  const [plantsData, setPlantsData] = useState<Plant[]>(mockPlants);
  const [devicesData, setDevicesData] =
    useState<BlumentopfDevice[]>(mockDevices);
  const [plantHistoryData, setPlantHistoryData] =
    useState<Record<string, PlantHistory[]>>(mockPlantHistory);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(
    plantsData[0]?.id || null,
  );

  const getPlantById = (id: string) => {
    return plantsData.find((plant) => plant.id === id);
  };

  const getDeviceById = (id: string) => {
    return devicesData.find((device) => device.id === id);
  };

  const getDeviceForPlant = (plantId: string) => {
    return devicesData.find((device) => device.plantId === plantId);
  };

  const waterPlant = (plantId: string, amount: number) => {
    // In a real app, this would send a request to the IoT device
    setPlantsData((prev) =>
      prev.map((plant) =>
        plant.id === plantId
          ? {
              ...plant,
              lastWatered: new Date(),
              moistureLevel: Math.min(100, plant.moistureLevel + 20),
              healthStatus: "good" as const,
            }
          : plant,
      ),
    );

    // Add to history
    setPlantHistoryData((prev) => ({
      ...prev,
      [plantId]: [
        {
          date: new Date(),
          moistureLevel: getPlantById(plantId)?.moistureLevel || 0,
          lightLevel: getPlantById(plantId)?.lightLevel || 0,
          temperatureLevel: getPlantById(plantId)?.temperatureLevel || 0,
          watered: true,
          waterAmount: amount,
        },
        ...(prev[plantId] || []),
      ],
    }));
  };

  const updatePlantSettings = (updatedPlant: Plant) => {
    setPlantsData((prev) =>
      prev.map((plant) =>
        plant.id === updatedPlant.id ? updatedPlant : plant,
      ),
    );
  };

  const updateDeviceSettings = (updatedDevice: BlumentopfDevice) => {
    setDevicesData((prev) =>
      prev.map((device) =>
        device.id === updatedDevice.id ? updatedDevice : device,
      ),
    );
  };

  return (
    <PlantContext.Provider
      value={{
        plants: plantsData,
        devices: devicesData,
        plantHistory: plantHistoryData,
        selectedPlantId,
        setSelectedPlantId,
        getPlantById,
        getDeviceById,
        getDeviceForPlant,
        waterPlant,
        updatePlantSettings,
        updateDeviceSettings,
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
