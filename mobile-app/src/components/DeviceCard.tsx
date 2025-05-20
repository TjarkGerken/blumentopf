// src/components/DeviceCard.tsx
import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { BlumentopfDevice } from "../types/models";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface DeviceCardProps {
  device: BlumentopfDevice;
  onPress?: () => void;
}

export const DeviceCard = ({ device, onPress }: DeviceCardProps) => {
  const batteryIcon =
    device.batteryLevel > 80
      ? "battery-full"
      : device.batteryLevel > 20
        ? "battery-half"
        : "battery-dead";

  return (
    <TouchableOpacity
      className="bg-white rounded-xl shadow-md mb-4 overflow-hidden border border-gray-100"
      onPress={onPress || (() => router.push(`/device/${device.id}`))}
    >
      <View className="p-4">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <View
              className={`w-2.5 h-2.5 rounded-full mr-2 ${device.connected ? "bg-green-500" : "bg-red-500"}`}
            />
            <Text className="text-lg font-medium">{device.name}</Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons
              name={batteryIcon}
              size={20}
              color={device.batteryLevel > 20 ? "#10b981" : "#ef4444"}
            />
            <Text className="text-sm text-gray-600 ml-1">
              {device.batteryLevel}%
            </Text>
          </View>
        </View>

        <View className="mt-3 flex-row justify-between">
          <View>
            <Text className="text-gray-500 text-xs mb-1">Water level</Text>
            <View className="flex-row items-center">
              <Ionicons name="water" size={16} color="#0ea5e9" />
              <Text className="text-sm ml-1">
                {device.waterReservoirLevel}%
              </Text>
            </View>
          </View>

          <View>
            <Text className="text-gray-500 text-xs mb-1">Auto watering</Text>
            <View className="flex-row items-center">
              <Ionicons
                name={device.autoWatering ? "flash" : "flash-off"}
                size={16}
                color={device.autoWatering ? "#f59e0b" : "#9ca3af"}
              />
              <Text className="text-sm ml-1">
                {device.autoWatering ? "On" : "Off"}
              </Text>
            </View>
          </View>

          <View>
            <Text className="text-gray-500 text-xs mb-1">Last sync</Text>
            <Text className="text-sm">
              {new Date(device.lastSyncDate).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
