// src/services/wateringService.ts
import { supabase } from "../initSupabase";

export interface WateringCommand {
  id: string;
  deviceId: string;
  plantId: string;
  commandType: "water_now" | "stop_watering" | "schedule_watering";
  waterAmount: number;
  status:
    | "pending"
    | "sent"
    | "acknowledged"
    | "completed"
    | "failed"
    | "timeout";
  requestedBy: string;
  scheduledFor?: Date;
  sentAt?: Date;
  acknowledgedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeviceStatus {
  id: string;
  deviceId: string;
  onlineStatus: boolean;
  lastSeen: Date;
  currentActivity?: string;
  waterReservoirMl?: number;
  pumpStatus: string;
  sensorReadings?: {
    moisture?: number;
    temperature?: number;
    light?: number;
  };
  firmwareVersion?: string;
  wifiSignalStrength?: number;
  batteryPercentage?: number;
  errorCodes?: string[];
  updatedAt: Date;
}

// Helper function to transform database row to WateringCommand
const transformWateringCommand = (row: any): WateringCommand => ({
  id: row.id,
  deviceId: row.device_id,
  plantId: row.plant_id,
  commandType: row.command_type,
  waterAmount: row.water_amount,
  status: row.status,
  requestedBy: row.requested_by,
  scheduledFor: row.scheduled_for ? new Date(row.scheduled_for) : undefined,
  sentAt: row.sent_at ? new Date(row.sent_at) : undefined,
  acknowledgedAt: row.acknowledged_at
    ? new Date(row.acknowledged_at)
    : undefined,
  completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
  errorMessage: row.error_message,
  retryCount: row.retry_count,
  maxRetries: row.max_retries,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

// Helper function to transform database row to DeviceStatus
const transformDeviceStatus = (row: any): DeviceStatus => ({
  id: row.id,
  deviceId: row.device_id,
  onlineStatus: row.online_status,
  lastSeen: new Date(row.last_seen),
  currentActivity: row.current_activity,
  waterReservoirMl: row.water_reservoir_ml,
  pumpStatus: row.pump_status,
  sensorReadings: row.sensor_readings,
  firmwareVersion: row.firmware_version,
  wifiSignalStrength: row.wifi_signal_strength,
  batteryPercentage: row.battery_percentage,
  errorCodes: row.error_codes,
  updatedAt: new Date(row.updated_at),
});

export const wateringService = {
  /**
   * Send a watering command to a device
   */
  async sendWateringCommand(
    deviceId: string,
    waterAmount: number,
    commandType:
      | "water_now"
      | "stop_watering"
      | "schedule_watering" = "water_now",
    scheduledFor?: Date,
  ): Promise<{ command: WateringCommand; deviceOnline: boolean }> {
    const { data, error } = await supabase.rpc("send_watering_command", {
      p_device_id: deviceId,
      p_water_amount: waterAmount,
      p_command_type: commandType,
      p_scheduled_for: scheduledFor?.toISOString(),
    });

    if (error) {
      console.error("Error sending watering command:", error);
      throw error;
    }

    if (!data.success) {
      throw new Error(data.error);
    }

    const command = await this.getCommand(data.command_id);
    return {
      command,
      deviceOnline: data.device_online,
    };
  },

  /**
   * Get a specific watering command by ID
   */
  async getCommand(commandId: string): Promise<WateringCommand> {
    const { data, error } = await supabase
      .from("watering_commands")
      .select("*")
      .eq("id", commandId)
      .single();

    if (error) {
      console.error("Error fetching watering command:", error);
      throw error;
    }

    return transformWateringCommand(data);
  },

  /**
   * Get all commands for a specific device
   */
  async getDeviceCommands(
    deviceId: string,
    limit: number = 10,
  ): Promise<WateringCommand[]> {
    const { data, error } = await supabase
      .from("watering_commands")
      .select("*")
      .eq("device_id", deviceId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching device commands:", error);
      throw error;
    }

    return data.map(transformWateringCommand);
  },

  /**
   * Get all commands for a specific plant
   */
  async getPlantCommands(
    plantId: string,
    limit: number = 10,
  ): Promise<WateringCommand[]> {
    const { data, error } = await supabase
      .from("watering_commands")
      .select("*")
      .eq("plant_id", plantId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching plant commands:", error);
      throw error;
    }

    return data.map(transformWateringCommand);
  },

  /**
   * Get device status
   */
  async getDeviceStatus(deviceId: string): Promise<DeviceStatus | null> {
    const { data, error } = await supabase
      .from("device_status")
      .select("*")
      .eq("device_id", deviceId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return null;
      }
      console.error("Error fetching device status:", error);
      throw error;
    }

    return transformDeviceStatus(data);
  },

  /**
   * Get status for all devices
   */
  async getAllDeviceStatus(): Promise<DeviceStatus[]> {
    const { data, error } = await supabase
      .from("device_status")
      .select("*")
      .order("last_seen", { ascending: false });

    if (error) {
      console.error("Error fetching all device status:", error);
      throw error;
    }

    return data.map(transformDeviceStatus);
  },

  /**
   * Cancel a pending watering command
   */
  async cancelCommand(commandId: string): Promise<void> {
    const { error } = await supabase
      .from("watering_commands")
      .update({
        status: "failed",
        error_message: "Cancelled by user",
        updated_at: new Date().toISOString(),
      })
      .eq("id", commandId)
      .in("status", ["pending", "sent"]);

    if (error) {
      console.error("Error cancelling command:", error);
      throw error;
    }
  },

  /**
   * Subscribe to command status changes
   */
  subscribeToCommand(
    commandId: string,
    callback: (command: WateringCommand) => void,
  ): () => void {
    const subscription = supabase
      .channel(`watering_command:${commandId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "watering_commands",
          filter: `id=eq.${commandId}`,
        },
        (payload) => {
          callback(transformWateringCommand(payload.new));
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  },

  /**
   * Subscribe to device status changes
   */
  subscribeToDeviceStatus(
    deviceId: string,
    callback: (status: DeviceStatus) => void,
  ): () => void {
    const subscription = supabase
      .channel(`device_status:${deviceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "device_status",
          filter: `device_id=eq.${deviceId}`,
        },
        (payload) => {
          if (payload.new) {
            callback(transformDeviceStatus(payload.new));
          }
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  },
};
