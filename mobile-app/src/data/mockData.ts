// src/data/mockData.ts
import { Plant, BlumentopfDevice, PlantHistory } from "../types/models";

export const mockPlants: Plant[] = [
  {
    id: "1",
    name: "Fritz the Ficus",
    species: "Ficus Elastica",
    image: "https://placehold.co/400x400?text=Ficus",
    lastWatered: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    nextWateringDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    moistureLevel: 65,
    lightLevel: 78,
    temperatureLevel: 22,
    healthStatus: "good",
    wateringSchedule: {
      frequency: 5, // days
      amount: 200, // ml
    },
    addedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
  },
  {
    id: "2",
    name: "Sally the Snake Plant",
    species: "Sansevieria",
    image: "https://placehold.co/400x400?text=Sansevieria",
    lastWatered: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    nextWateringDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    moistureLevel: 35,
    lightLevel: 55,
    temperatureLevel: 21,
    healthStatus: "needs_attention",
    wateringSchedule: {
      frequency: 14, // days
      amount: 100, // ml
    },
    notes: "Needs less water, more light",
    addedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
  },
];

export const mockDevices: BlumentopfDevice[] = [
  {
    id: "1",
    name: "Living Room Pot",
    connected: true,
    batteryLevel: 78,
    lastSyncDate: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
    plantId: "1",
    firmwareVersion: "1.2.3",
    macAddress: "00:11:22:33:44:55",
    waterReservoirLevel: 67,
    autoWatering: true,
    lightingSchedule: {
      enabled: true,
      startTime: "08:00",
      endTime: "18:00",
      intensity: 80,
    },
  },
  {
    id: "2",
    name: "Bedroom Pot",
    connected: true,
    batteryLevel: 45,
    lastSyncDate: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    plantId: "2",
    firmwareVersion: "1.2.3",
    macAddress: "66:77:88:99:AA:BB",
    waterReservoirLevel: 32,
    autoWatering: false,
  },
];

export const mockPlantHistory: Record<string, PlantHistory[]> = {
  "1": Array.from({ length: 30 }).map((_, index) => ({
    date: new Date(Date.now() - index * 24 * 60 * 60 * 1000),
    moistureLevel: 60 + Math.floor(Math.random() * 20) - 10,
    lightLevel: 75 + Math.floor(Math.random() * 15) - 5,
    temperatureLevel: 22 + Math.floor(Math.random() * 4) - 2,
    watered: index % 5 === 0,
    waterAmount: index % 5 === 0 ? 200 : undefined,
  })),
  "2": Array.from({ length: 30 }).map((_, index) => ({
    date: new Date(Date.now() - index * 24 * 60 * 60 * 1000),
    moistureLevel: 30 + Math.floor(Math.random() * 15) - 5,
    lightLevel: 50 + Math.floor(Math.random() * 20) - 10,
    temperatureLevel: 21 + Math.floor(Math.random() * 3) - 1,
    watered: index % 14 === 0,
    waterAmount: index % 14 === 0 ? 100 : undefined,
  })),
};
