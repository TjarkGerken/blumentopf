// app/plant/[id].tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { usePlants } from "../../src/context/PlantProvider";
import { Ionicons } from "@expo/vector-icons";
import { PlantDeviceAssociation } from "../../src/components/PlantDeviceAssociation";
import { WateringControl } from "../../src/components/WateringControl";

export default function PlantDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    getPlantById,
    getDeviceForPlant,
    refreshData,
    loading,
    error,
    associateDeviceWithPlant,
    disassociateDevice,
    plants,
    devices,
  } = usePlants();
  const [showAssociationModal, setShowAssociationModal] = useState(false);

  const plant = getPlantById(id);
  const device = plant ? getDeviceForPlant(plant.id) : undefined;

  // Redirect if plant not found and not loading
  useEffect(() => {
    if (!loading && !plant) {
      Alert.alert(
        "Plant Not Found",
        "The plant you're looking for doesn't exist.",
        [
          {
            text: "Go Back",
            onPress: () => router.back(),
          },
        ],
      );
    }
  }, [plant, loading, router]);

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

  const handleWateringCompleted = () => {
    // Refresh plant data after watering is completed
    refreshData();
  };

  // Handle device association
  const handleAssociation = async (plantId: string, deviceId: string) => {
    await associateDeviceWithPlant(deviceId, plantId);
  };

  // Handle device disassociation
  const handleDisassociation = async (deviceId: string) => {
    await disassociateDevice(deviceId);
  };

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#14532d" />
        <Text className="mt-4 text-gray-600">Loading plant details...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center p-6">
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text className="text-red-600 font-bold text-lg mt-4">Error</Text>
        <Text className="text-gray-600 text-center mt-2">{error}</Text>
        <TouchableOpacity
          className="mt-4 bg-green-700 px-6 py-3 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Plant not found
  if (!plant) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center p-6">
        <Ionicons name="leaf-outline" size={48} color="#d1d5db" />
        <Text className="text-gray-500 font-bold text-lg mt-4">
          Plant Not Found
        </Text>
        <Text className="text-gray-400 text-center mt-2">
          The plant you're looking for doesn't exist.
        </Text>
        <TouchableOpacity
          className="mt-4 bg-green-700 px-6 py-3 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
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
              source={{ uri: plant.image }}
              className="w-full h-full"
              defaultSource={require("../../assets/icon.png")}
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
        <WateringControl
          plant={plant}
          device={device}
          onWateringCompleted={handleWateringCompleted}
        />
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
                width: `${Math.min(100, (plant.temperatureLevel / 40) * 100)}%`,
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
            onPress={() => router.push(`/device/${device.id}`)}
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
              onPress={() => setShowAssociationModal(true)}
            >
              <Text className="text-white font-medium">Connect a Device</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Always show manage association button */}
        <TouchableOpacity
          className="mt-3 bg-blue-100 px-4 py-2 rounded-lg flex-row items-center justify-center"
          onPress={() => setShowAssociationModal(true)}
        >
          <Ionicons name="settings" size={16} color="#1d4ed8" />
          <Text className="text-blue-800 font-medium ml-2">
            Manage Device Association
          </Text>
        </TouchableOpacity>
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

      {/* Plant Device Association Modal */}
      <PlantDeviceAssociation
        visible={showAssociationModal}
        onClose={() => setShowAssociationModal(false)}
        plants={plants}
        devices={devices}
        selectedPlant={plant}
        onAssociate={handleAssociation}
        onDisassociate={handleDisassociation}
      />
    </ScrollView>
  );
}
