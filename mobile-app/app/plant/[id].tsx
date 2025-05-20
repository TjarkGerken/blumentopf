// app/plant/[id].tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { usePlants } from "../../src/context/PlantProvider";
import { Ionicons } from "@expo/vector-icons";

export default function PlantDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPlantById, getDeviceForPlant, waterPlant } = usePlants();
  const [isWatering, setIsWatering] = useState(false);

  const plant = getPlantById(id);
  const device = plant ? getDeviceForPlant(plant.id) : undefined;

  // Calculate days since last watered and days until next watering
  const daysSinceWatered = plant
    ? Math.floor(
        (new Date().getTime() - new Date(plant.lastWatered).getTime()) /
          (1000 * 3600 * 24),
      )
    : 0;

  const daysUntilNextWatering = plant
    ? Math.floor(
        (new Date(plant.nextWateringDate).getTime() - new Date().getTime()) /
          (1000 * 3600 * 24),
      )
    : 0;

  const handleWatering = () => {
    if (!plant) return;

    setIsWatering(true);

    // Simulate watering action with delay
    setTimeout(() => {
      waterPlant(plant.id, plant.wateringSchedule.amount);
      setIsWatering(false);
    }, 2000);
  };

  if (!plant) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Plant not found</Text>
      </View>
    );
  }

  // Health status colors
  const healthColors = {
    excellent: "#4ade80", // green-400
    good: "#a3e635", // lime-400
    needs_attention: "#fb923c", // orange-400
    critical: "#f87171", // red-400
  };

  const healthColor = healthColors[plant.healthStatus];
  const healthText = {
    excellent: "Excellent",
    good: "Good",
    needs_attention: "Needs Attention",
    critical: "Critical",
  }[plant.healthStatus];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Plant header */}
      <View className="bg-white">
        <View className="aspect-square w-full bg-gray-200">
          {plant.image ? (
            <Image
              source={{ uri: "https://picsum.photos/800/800" }}
              className="w-full h-full"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Ionicons name="leaf" size={80} color="#9ca3af" />
            </View>
          )}
        </View>

        <View className="p-4">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-2xl font-bold">{plant.name}</Text>
              <Text className="text-gray-500">{plant.species}</Text>
            </View>

            <View className="flex-row items-center">
              <View
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: healthColor }}
              />
              <Text style={{ color: healthColor }}>{healthText}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick actions */}
      <View className="bg-white mt-2 p-4">
        <TouchableOpacity
          className={`px-4 py-3 rounded-full flex-row items-center justify-center ${
            isWatering ? "bg-blue-200" : "bg-blue-500"
          }`}
          onPress={handleWatering}
          disabled={isWatering}
        >
          {isWatering ? (
            <>
              <ActivityIndicator size="small" color="#0369a1" />
              <Text className="text-blue-700 font-medium ml-2">
                Watering...
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="water" size={20} color="white" />
              <Text className="text-white font-medium ml-2">
                Water Now ({plant.wateringSchedule.amount}ml)
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Measurements */}
      <View className="bg-white mt-2 p-4">
        <Text className="text-lg font-bold mb-3">Current Measurements</Text>

        <View className="flex-row mb-4">
          {/* Moisture */}
          <View className="flex-1 bg-gray-50 rounded-xl p-3 mr-2">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-gray-500 text-xs">Moisture</Text>
              <Ionicons name="water" size={16} color="#0ea5e9" />
            </View>
            <Text className="text-2xl font-bold text-blue-500">
              {plant.moistureLevel}%
            </Text>
            <View className="mt-1 bg-gray-200 h-1.5 rounded-full">
              <View
                className="h-full rounded-full bg-blue-500"
                style={{ width: `${plant.moistureLevel}%` }}
              />
            </View>
          </View>

          {/* Light */}
          <View className="flex-1 bg-gray-50 rounded-xl p-3">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-gray-500 text-xs">Light</Text>
              <Ionicons name="sunny" size={16} color="#f59e0b" />
            </View>
            <Text className="text-2xl font-bold text-amber-500">
              {plant.lightLevel}%
            </Text>
            <View className="mt-1 bg-gray-200 h-1.5 rounded-full">
              <View
                className="h-full rounded-full bg-amber-500"
                style={{ width: `${plant.lightLevel}%` }}
              />
            </View>
          </View>
        </View>

        {/* Temperature */}
        <View className="bg-gray-50 rounded-xl p-3">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-gray-500 text-xs">Temperature</Text>
            <Ionicons name="thermometer" size={16} color="#ef4444" />
          </View>
          <Text className="text-2xl font-bold text-red-500">
            {plant.temperatureLevel}°C
          </Text>
          <View className="mt-1 bg-gray-200 h-1.5 rounded-full">
            <View
              className="h-full rounded-full bg-red-500"
              style={{
                width: `${Math.min(100, plant.temperatureLevel * 2.5)}%`,
              }}
            />
          </View>
        </View>
      </View>

      {/* Watering schedule */}
      <View className="bg-white mt-2 p-4">
        <Text className="text-lg font-bold mb-3">Watering Schedule</Text>

        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
              <Ionicons name="calendar" size={20} color="#0ea5e9" />
            </View>
            <View>
              <Text className="text-gray-800">
                Every {plant.wateringSchedule.frequency} days
              </Text>
              <Text className="text-xs text-gray-500">
                {plant.wateringSchedule.amount}ml per watering
              </Text>
            </View>
          </View>

          <TouchableOpacity
            className="px-3 py-2 bg-gray-100 rounded-lg"
            onPress={() => alert("Edit watering schedule")}
          >
            <Text className="text-gray-700">Edit</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-3">
              <Ionicons name="time" size={20} color="#10b981" />
            </View>
            <View>
              <Text className="text-gray-800">
                {daysUntilNextWatering <= 0
                  ? "Water now!"
                  : `Next watering in ${daysUntilNextWatering} days`}
              </Text>
              <Text className="text-xs text-gray-500">
                Last watered{" "}
                {daysSinceWatered === 0
                  ? "today"
                  : `${daysSinceWatered} days ago`}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Connected device */}
      <View className="bg-white mt-2 p-4 mb-4">
        <Text className="text-lg font-bold mb-3">Connected Device</Text>

        {device ? (
          <TouchableOpacity
            className="flex-row items-center justify-between"
            onPress={() => alert(`Go to device: ${device.id}`)}
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
                <Ionicons name="hardware-chip" size={20} color="#14532d" />
              </View>
              <View>
                <Text className="text-gray-800">{device.name}</Text>
                <View className="flex-row items-center">
                  <View
                    className={`w-1.5 h-1.5 rounded-full mr-1 ${device.connected ? "bg-green-500" : "bg-red-500"}`}
                  />
                  <Text className="text-xs text-gray-500">
                    {device.connected ? "Connected" : "Disconnected"}
                  </Text>
                </View>
              </View>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        ) : (
          <View className="items-center justify-center py-4">
            <Ionicons name="wifi-outline" size={24} color="#d1d5db" />
            <Text className="text-gray-400 mt-2">No device connected</Text>
            <TouchableOpacity
              className="mt-3 bg-green-700 px-4 py-2 rounded-lg"
              onPress={() => alert("This would open device pairing")}
            >
              <Text className="text-white font-medium">Connect a Device</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Plant notes */}
      <View className="bg-white mt-2 p-4 mb-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-bold">Notes</Text>
          <TouchableOpacity onPress={() => alert("Edit notes")}>
            <Ionicons name="create-outline" size={20} color="#14532d" />
          </TouchableOpacity>
        </View>

        {plant.notes ? (
          <Text className="text-gray-700">{plant.notes}</Text>
        ) : (
          <Text className="text-gray-400 italic">No notes added yet</Text>
        )}
      </View>
    </ScrollView>
  );
}
