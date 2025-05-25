// app/device/[id].tsx
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Switch,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { usePlants } from "../../src/context/PlantProvider";
import { Ionicons } from "@expo/vector-icons";
import { PlantDeviceAssociation } from "../../src/components/PlantDeviceAssociation";

export default function DeviceDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    getDeviceById,
    getPlantById,
    updateDeviceSettings,
    associateDeviceWithPlant,
    disassociateDevice,
    plants,
    devices,
  } = usePlants();
  const [showAssociationModal, setShowAssociationModal] = useState(false);

  const device = getDeviceById(id);
  const plant = device?.plantId ? getPlantById(device.plantId) : undefined;

  const [autoWatering, setAutoWatering] = useState(
    device?.autoWatering || false,
  );
  const [lightingEnabled, setLightingEnabled] = useState(
    device?.lightingSchedule?.enabled || false,
  );

  if (!device) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Device not found</Text>
      </View>
    );
  }

  const handleAutoWateringChange = (value: boolean) => {
    setAutoWatering(value);

    // Update device settings in context
    updateDeviceSettings({
      ...device,
      autoWatering: value,
    });
  };

  const handleLightingEnabledChange = (value: boolean) => {
    setLightingEnabled(value);

    // Update device settings in context
    updateDeviceSettings({
      ...device,
      lightingSchedule: {
        ...device.lightingSchedule,
        enabled: value,
      } as any,
    });
  };

  // Handle device association
  const handleAssociation = async (plantId: string, deviceId: string) => {
    await associateDeviceWithPlant(deviceId, plantId);
  };

  // Handle device disassociation
  const handleDisassociation = async (deviceId: string) => {
    await disassociateDevice(deviceId);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Device info */}
      <View className="bg-white p-4">
        <View className="items-center mb-4">
          <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center mb-2">
            <Ionicons name="flower" size={40} color="#14532d" />
          </View>
          <Text className="text-xl font-bold">{device.name}</Text>
          <View className="flex-row items-center mt-1">
            <View
              className={`w-2 h-2 rounded-full mr-2 ${device.connected ? "bg-green-500" : "bg-red-500"}`}
            />
            <Text className="text-gray-500">
              {device.connected ? "Connected" : "Disconnected"}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between mb-2">
          <View className="flex-1 bg-gray-50 rounded-lg p-3 mr-2 items-center">
            <Ionicons
              name="battery-half"
              size={24}
              color={device.batteryLevel > 20 ? "#10b981" : "#ef4444"}
            />
            <Text className="text-lg font-bold mt-1">
              {device.batteryLevel}%
            </Text>
            <Text className="text-xs text-gray-500">Battery</Text>
          </View>

          <View className="flex-1 bg-gray-50 rounded-lg p-3 items-center">
            <Ionicons name="water" size={24} color="#0ea5e9" />
            <Text className="text-lg font-bold mt-1">
              {device.waterReservoirLevel}%
            </Text>
            <Text className="text-xs text-gray-500">Water Level</Text>
          </View>
        </View>

        <View className="flex-row items-center mt-3">
          <View className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center mr-3">
            <Ionicons name="sync" size={18} color="#6b7280" />
          </View>
          <View className="flex-1">
            <Text className="text-gray-500 text-xs">Last Synced</Text>
            <Text className="text-gray-700">
              {new Date(device.lastSyncDate).toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </View>
      </View>

      {/* Device settings */}
      <View className="bg-white mt-2 p-4">
        <Text className="text-lg font-bold mb-3">Device Settings</Text>

        <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
              <Ionicons name="water" size={20} color="#0ea5e9" />
            </View>
            <View>
              <Text className="text-gray-800">Auto Watering</Text>
              <Text className="text-xs text-gray-500">
                Water when soil gets dry
              </Text>
            </View>
          </View>

          <Switch
            value={autoWatering}
            onValueChange={handleAutoWateringChange}
            trackColor={{ false: "#d1d5db", true: "#14532d" }}
            thumbColor={"#fff"}
          />
        </View>

        <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-amber-100 items-center justify-center mr-3">
              <Ionicons name="sunny" size={20} color="#f59e0b" />
            </View>
            <View>
              <Text className="text-gray-800">Smart Lighting</Text>
              <Text className="text-xs text-gray-500">
                {device.lightingSchedule
                  ? `${device.lightingSchedule.startTime} - ${device.lightingSchedule.endTime}`
                  : "Not configured"}
              </Text>
            </View>
          </View>

          <Switch
            value={lightingEnabled}
            onValueChange={handleLightingEnabledChange}
            trackColor={{ false: "#d1d5db", true: "#14532d" }}
            thumbColor={"#fff"}
          />
        </View>

        <TouchableOpacity
          className="flex-row items-center justify-between py-3 border-b border-gray-100"
          onPress={() =>
            Alert.alert(
              "Configure Lighting",
              "This would open the lighting schedule settings",
            )
          }
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-amber-100 items-center justify-center mr-3">
              <Ionicons name="time" size={20} color="#f59e0b" />
            </View>
            <View>
              <Text className="text-gray-800">Lighting Schedule</Text>
              <Text className="text-xs text-gray-500">
                Configure on/off times
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center justify-between py-3 border-b border-gray-100"
          onPress={() =>
            Alert.alert(
              "Configure Thresholds",
              "This would open moisture threshold settings",
            )
          }
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
              <Ionicons name="options" size={20} color="#0ea5e9" />
            </View>
            <View>
              <Text className="text-gray-800">Watering Thresholds</Text>
              <Text className="text-xs text-gray-500">
                Set moisture levels for auto-watering
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* Associated plant */}
      <View className="bg-white mt-2 p-4">
        <Text className="text-lg font-bold mb-3">Associated Plant</Text>

        {plant ? (
          <TouchableOpacity
            className="flex-row items-center justify-between"
            onPress={() => alert(`Go to plant: ${plant.id}`)}
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden mr-3">
                {plant.image ? (
                  <Image
                    source={{ uri: plant.image }}
                    className="w-full h-full"
                  />
                ) : (
                  <View className="w-full h-full items-center justify-center">
                    <Ionicons name="leaf" size={24} color="#9ca3af" />
                  </View>
                )}
              </View>
              <View>
                <Text className="text-gray-800 font-medium">{plant.name}</Text>
                <Text className="text-xs text-gray-500">{plant.species}</Text>
              </View>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        ) : (
          <View className="items-center justify-center py-4">
            <Ionicons name="leaf-outline" size={24} color="#d1d5db" />
            <Text className="text-gray-400 mt-2">No plant associated</Text>
            <TouchableOpacity
              className="mt-3 bg-green-700 px-4 py-2 rounded-lg"
              onPress={() => setShowAssociationModal(true)}
            >
              <Text className="text-white font-medium">Associate Plant</Text>
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
            Manage Plant Association
          </Text>
        </TouchableOpacity>
      </View>

      {/* Device maintenance */}
      <View className="bg-white mt-2 p-4 mb-4">
        <Text className="text-lg font-bold mb-3">Device Maintenance</Text>

        <TouchableOpacity
          className="flex-row items-center justify-between py-3 border-b border-gray-100"
          onPress={() =>
            Alert.alert("Firmware Update", "Checking for firmware updates...")
          }
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
              <Ionicons name="cloud-download" size={20} color="#6366f1" />
            </View>
            <View>
              <Text className="text-gray-800">Check for Updates</Text>
              <Text className="text-xs text-gray-500">
                Current version: {device.firmwareVersion}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center justify-between py-3 border-b border-gray-100"
          onPress={() =>
            Alert.alert(
              "Reset Device",
              "This will reset all device settings to factory defaults.",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Reset", style: "destructive", onPress: () => {} },
              ],
            )
          }
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-3">
              <Ionicons name="refresh" size={20} color="#ef4444" />
            </View>
            <View>
              <Text className="text-gray-800">Factory Reset</Text>
              <Text className="text-xs text-gray-500">
                Reset device to default settings
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center justify-between py-3"
          onPress={() =>
            Alert.alert("Edit Device", "This would open device name edit")
          }
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
              <Ionicons name="create" size={20} color="#14532d" />
            </View>
            <View>
              <Text className="text-gray-800">Edit Device Name</Text>
              <Text className="text-xs text-gray-500">
                Change how this device appears
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* Device info */}
      <View className="bg-white mt-2 p-4 mb-6">
        <Text className="text-lg font-bold mb-3">Device Information</Text>

        <View className="py-2 border-b border-gray-100">
          <Text className="text-xs text-gray-500">MAC Address</Text>
          <Text className="text-gray-800">{device.macAddress}</Text>
        </View>

        <View className="py-2 border-b border-gray-100">
          <Text className="text-xs text-gray-500">Firmware Version</Text>
          <Text className="text-gray-800">{device.firmwareVersion}</Text>
        </View>

        <View className="py-2">
          <Text className="text-xs text-gray-500">Device ID</Text>
          <Text className="text-gray-800">{device.id}</Text>
        </View>
      </View>

      {/* Plant Device Association Modal */}
      <PlantDeviceAssociation
        visible={showAssociationModal}
        onClose={() => setShowAssociationModal(false)}
        plants={plants}
        devices={devices}
        selectedDevice={device}
        onAssociate={handleAssociation}
        onDisassociate={handleDisassociation}
      />
    </ScrollView>
  );
}
