// src/types/models.ts
export interface Plant {
  id: string;
  name: string;
  species: string;
  image?: string;
  lastWatered: Date;
  nextWateringDate: Date;
  moistureLevel: number; // 0-100
  lightLevel: number; // 0-100
  temperatureLevel: number; // in Celsius
  healthStatus: "excellent" | "good" | "needs_attention" | "critical";
  wateringSchedule: {
    frequency: number; // days between watering
    amount: number; // ml of water
  };
  notes?: string;
  addedDate: Date;
}

export interface BlumentopfDevice {
  id: string;
  name: string;
  connected: boolean;
  batteryLevel: number; // 0-100
  lastSyncDate: Date;
  plantId?: string; // Reference to the plant in this pot
  firmwareVersion: string;
  macAddress: string;
  waterReservoirLevel: number; // 0-100
  autoWatering: boolean;
  lightingSchedule?: {
    enabled: boolean;
    startTime: string; // "HH:MM" format
    endTime: string; // "HH:MM" format
    intensity: number; // 0-100
  };
}

export interface PlantHistory {
  date: Date;
  moistureLevel: number;
  lightLevel: number;
  temperatureLevel: number;
  watered: boolean;
  waterAmount?: number;
}
