// src/services/supabaseService.ts
import { supabase } from "~/initSupabase";
import { Plant, BlumentopfDevice, PlantHistory } from "../types/models";
import { Database } from "../types/database";

type PlantRow = Database["public"]["Tables"]["plants"]["Row"];
type DeviceRow = Database["public"]["Tables"]["blumentopf_devices"]["Row"];
type HistoryRow = Database["public"]["Tables"]["plant_history"]["Row"];

// Helper functions to transform database rows to app models
const transformPlantRow = (row: PlantRow): Plant => ({
  id: row.id,
  name: row.name,
  species: row.species,
  image: row.image || undefined,
  lastWatered: new Date(row.last_watered),
  nextWateringDate: new Date(row.next_watering_date),
  moistureLevel: row.moisture_level,
  lightLevel: row.light_level,
  temperatureLevel: row.temperature_level,
  healthStatus: row.health_status,
  wateringSchedule: {
    frequency: row.watering_frequency,
    amount: row.watering_amount,
  },
  notes: row.notes || undefined,
  addedDate: new Date(row.added_date),
});

const transformDeviceRow = (row: DeviceRow): BlumentopfDevice => ({
  id: row.id,
  name: row.name,
  connected: row.connected,
  batteryLevel: row.battery_level,
  lastSyncDate: new Date(row.last_sync_date),
  plantId: row.plant_id || undefined,
  firmwareVersion: row.firmware_version,
  macAddress: row.mac_address,
  waterReservoirLevel: row.water_reservoir_level,
  autoWatering: row.auto_watering,
  lightingSchedule: row.lighting_enabled
    ? {
        enabled: row.lighting_enabled,
        startTime: row.lighting_start_time || "08:00",
        endTime: row.lighting_end_time || "18:00",
        intensity: row.lighting_intensity || 50,
      }
    : undefined,
});

const transformHistoryRow = (row: HistoryRow): PlantHistory => ({
  date: new Date(row.date),
  moistureLevel: row.moisture_level,
  lightLevel: row.light_level,
  temperatureLevel: row.temperature_level,
  watered: row.watered,
  waterAmount: row.water_amount || undefined,
});

// Plant operations
export const plantService = {
  async getAll(): Promise<Plant[]> {
    const { data, error } = await supabase
      .from("plants")
      .select("*")
      .order("added_date", { ascending: false });

    if (error) {
      console.error("Error fetching plants:", error);
      throw error;
    }

    return data?.map(transformPlantRow) || [];
  },

  async getById(id: string): Promise<Plant | null> {
    const { data, error } = await supabase
      .from("plants")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching plant:", error);
      return null;
    }

    return data ? transformPlantRow(data) : null;
  },

  async create(plant: Omit<Plant, "id" | "addedDate">): Promise<Plant> {
    const { data, error } = await supabase
      .from("plants")
      .insert({
        name: plant.name,
        species: plant.species,
        image: plant.image || null,
        last_watered: plant.lastWatered.toISOString(),
        next_watering_date: plant.nextWateringDate.toISOString(),
        moisture_level: plant.moistureLevel,
        light_level: plant.lightLevel,
        temperature_level: plant.temperatureLevel,
        health_status: plant.healthStatus,
        watering_frequency: plant.wateringSchedule.frequency,
        watering_amount: plant.wateringSchedule.amount,
        notes: plant.notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating plant:", error);
      throw error;
    }

    return transformPlantRow(data);
  },

  async update(id: string, updates: Partial<Plant>): Promise<Plant> {
    const updateData: any = {};

    if (updates.name) updateData.name = updates.name;
    if (updates.species) updateData.species = updates.species;
    if (updates.image !== undefined) updateData.image = updates.image;
    if (updates.lastWatered)
      updateData.last_watered = updates.lastWatered.toISOString();
    if (updates.nextWateringDate)
      updateData.next_watering_date = updates.nextWateringDate.toISOString();
    if (updates.moistureLevel !== undefined)
      updateData.moisture_level = updates.moistureLevel;
    if (updates.lightLevel !== undefined)
      updateData.light_level = updates.lightLevel;
    if (updates.temperatureLevel !== undefined)
      updateData.temperature_level = updates.temperatureLevel;
    if (updates.healthStatus) updateData.health_status = updates.healthStatus;
    if (updates.wateringSchedule?.frequency)
      updateData.watering_frequency = updates.wateringSchedule.frequency;
    if (updates.wateringSchedule?.amount)
      updateData.watering_amount = updates.wateringSchedule.amount;
    if (updates.notes !== undefined) updateData.notes = updates.notes;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("plants")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating plant:", error);
      throw error;
    }

    return transformPlantRow(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("plants").delete().eq("id", id);

    if (error) {
      console.error("Error deleting plant:", error);
      throw error;
    }
  },

  async waterPlant(id: string, amount: number): Promise<Plant> {
    const now = new Date();
    const plant = await this.getById(id);

    if (!plant) {
      throw new Error("Plant not found");
    }

    // Calculate next watering date
    const nextWateringDate = new Date(now);
    nextWateringDate.setDate(
      nextWateringDate.getDate() + plant.wateringSchedule.frequency,
    );

    // Update plant with watering info
    const updatedPlant = await this.update(id, {
      lastWatered: now,
      nextWateringDate,
      moistureLevel: Math.min(100, plant.moistureLevel + 20),
      healthStatus:
        plant.healthStatus === "critical" ? "needs_attention" : "good",
    });

    // Add to history
    await plantHistoryService.create({
      plantId: id,
      date: now,
      moistureLevel: updatedPlant.moistureLevel,
      lightLevel: updatedPlant.lightLevel,
      temperatureLevel: updatedPlant.temperatureLevel,
      watered: true,
      waterAmount: amount,
    });

    return updatedPlant;
  },
};

// Device operations
export const deviceService = {
  async getAll(): Promise<BlumentopfDevice[]> {
    const { data, error } = await supabase
      .from("blumentopf_devices")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching devices:", error);
      throw error;
    }

    return data?.map(transformDeviceRow) || [];
  },

  async getById(id: string): Promise<BlumentopfDevice | null> {
    const { data, error } = await supabase
      .from("blumentopf_devices")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching device:", error);
      return null;
    }

    return data ? transformDeviceRow(data) : null;
  },

  async getByPlantId(plantId: string): Promise<BlumentopfDevice | null> {
    const { data, error } = await supabase
      .from("blumentopf_devices")
      .select("*")
      .eq("plant_id", plantId)
      .single();

    if (error || !data) {
      return null;
    }

    return transformDeviceRow(data);
  },

  async update(
    id: string,
    updates: Partial<BlumentopfDevice>,
  ): Promise<BlumentopfDevice> {
    const updateData: any = {};

    if (updates.name) updateData.name = updates.name;
    if (updates.connected !== undefined)
      updateData.connected = updates.connected;
    if (updates.batteryLevel !== undefined)
      updateData.battery_level = updates.batteryLevel;
    if (updates.lastSyncDate)
      updateData.last_sync_date = updates.lastSyncDate.toISOString();
    if (updates.plantId !== undefined) updateData.plant_id = updates.plantId;
    if (updates.firmwareVersion)
      updateData.firmware_version = updates.firmwareVersion;
    if (updates.macAddress) updateData.mac_address = updates.macAddress;
    if (updates.waterReservoirLevel !== undefined)
      updateData.water_reservoir_level = updates.waterReservoirLevel;
    if (updates.autoWatering !== undefined)
      updateData.auto_watering = updates.autoWatering;

    if (updates.lightingSchedule) {
      updateData.lighting_enabled = updates.lightingSchedule.enabled;
      updateData.lighting_start_time = updates.lightingSchedule.startTime;
      updateData.lighting_end_time = updates.lightingSchedule.endTime;
      updateData.lighting_intensity = updates.lightingSchedule.intensity;
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("blumentopf_devices")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating device:", error);
      throw error;
    }

    return transformDeviceRow(data);
  },
};

// Plant history operations
export const plantHistoryService = {
  async getByPlantId(
    plantId: string,
    limit: number = 30,
  ): Promise<PlantHistory[]> {
    const { data, error } = await supabase
      .from("plant_history")
      .select("*")
      .eq("plant_id", plantId)
      .order("date", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching plant history:", error);
      throw error;
    }

    return data?.map(transformHistoryRow) || [];
  },

  async create(
    history: Omit<PlantHistory, "id"> & { plantId: string },
  ): Promise<PlantHistory> {
    const { data, error } = await supabase
      .from("plant_history")
      .insert({
        plant_id: history.plantId,
        date: history.date.toISOString(),
        moisture_level: history.moistureLevel,
        light_level: history.lightLevel,
        temperature_level: history.temperatureLevel,
        watered: history.watered,
        water_amount: history.waterAmount || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating plant history:", error);
      throw error;
    }

    return transformHistoryRow(data);
  },

  async getWateringHistory(
    plantId: string,
    limit: number = 10,
  ): Promise<PlantHistory[]> {
    const { data, error } = await supabase
      .from("plant_history")
      .select("*")
      .eq("plant_id", plantId)
      .eq("watered", true)
      .order("date", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching watering history:", error);
      throw error;
    }

    return data?.map(transformHistoryRow) || [];
  },
};
