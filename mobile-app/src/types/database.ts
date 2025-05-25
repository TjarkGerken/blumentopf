// src/types/database.ts
export interface Database {
  public: {
    Tables: {
      plants: {
        Row: {
          id: string;
          name: string;
          species: string;
          image: string | null;
          last_watered: string;
          next_watering_date: string;
          moisture_level: number;
          light_level: number;
          temperature_level: number;
          health_status: "excellent" | "good" | "needs_attention" | "critical";
          watering_frequency: number;
          watering_amount: number;
          notes: string | null;
          added_date: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          species: string;
          image?: string | null;
          last_watered: string;
          next_watering_date: string;
          moisture_level: number;
          light_level: number;
          temperature_level: number;
          health_status: "excellent" | "good" | "needs_attention" | "critical";
          watering_frequency: number;
          watering_amount: number;
          notes?: string | null;
          added_date?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          species?: string;
          image?: string | null;
          last_watered?: string;
          next_watering_date?: string;
          moisture_level?: number;
          light_level?: number;
          temperature_level?: number;
          health_status?: "excellent" | "good" | "needs_attention" | "critical";
          watering_frequency?: number;
          watering_amount?: number;
          notes?: string | null;
          added_date?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      blumentopf_devices: {
        Row: {
          id: string;
          name: string;
          connected: boolean;
          battery_level: number;
          last_sync_date: string;
          plant_id: string | null;
          firmware_version: string;
          mac_address: string;
          water_reservoir_level: number;
          auto_watering: boolean;
          lighting_enabled: boolean | null;
          lighting_start_time: string | null;
          lighting_end_time: string | null;
          lighting_intensity: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          connected?: boolean;
          battery_level: number;
          last_sync_date: string;
          plant_id?: string | null;
          firmware_version: string;
          mac_address: string;
          water_reservoir_level: number;
          auto_watering?: boolean;
          lighting_enabled?: boolean | null;
          lighting_start_time?: string | null;
          lighting_end_time?: string | null;
          lighting_intensity?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          connected?: boolean;
          battery_level?: number;
          last_sync_date?: string;
          plant_id?: string | null;
          firmware_version?: string;
          mac_address?: string;
          water_reservoir_level?: number;
          auto_watering?: boolean;
          lighting_enabled?: boolean | null;
          lighting_start_time?: string | null;
          lighting_end_time?: string | null;
          lighting_intensity?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      plant_history: {
        Row: {
          id: string;
          plant_id: string;
          date: string;
          moisture_level: number;
          light_level: number;
          temperature_level: number;
          watered: boolean;
          water_amount: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          plant_id: string;
          date?: string;
          moisture_level: number;
          light_level: number;
          temperature_level: number;
          watered?: boolean;
          water_amount?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          plant_id?: string;
          date?: string;
          moisture_level?: number;
          light_level?: number;
          temperature_level?: number;
          watered?: boolean;
          water_amount?: number | null;
          created_at?: string | null;
        };
      };
    };
  };
}
