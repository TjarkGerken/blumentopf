// src/components/PlantDeviceAssociation.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Plant, BlumentopfDevice } from "../types/models";

interface PlantDeviceAssociationProps {
  visible: boolean;
  onClose: () => void;
  plants: Plant[];
  devices: BlumentopfDevice[];
  selectedPlant?: Plant;
  selectedDevice?: BlumentopfDevice;
  onAssociate: (plantId: string, deviceId: string) => Promise<void>;
  onDisassociate: (deviceId: string) => Promise<void>;
}

export const PlantDeviceAssociation = ({
  visible,
  onClose,
  plants,
  devices,
  selectedPlant,
  selectedDevice,
  onAssociate,
  onDisassociate,
}: PlantDeviceAssociationProps) => {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"plant-to-device" | "device-to-plant">(
    "plant-to-device",
  );

  const handleAssociation = async (plantId: string, deviceId: string) => {
    try {
      setLoading(true);
      await onAssociate(plantId, deviceId);
      Alert.alert(
        "Success",
        "Plant and device have been associated successfully!",
      );
      onClose();
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to associate plant and device. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDisassociation = async (deviceId: string) => {
    try {
      setLoading(true);
      await onDisassociate(deviceId);
      Alert.alert("Success", "Device has been disassociated successfully!");
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to disassociate device. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDisassociation = (device: BlumentopfDevice) => {
    const associatedPlant = plants.find((p) => p.id === device.plantId);
    Alert.alert(
      "Confirm Disassociation",
      `Are you sure you want to remove the association between "${device.name}" and "${associatedPlant?.name || "Unknown Plant"}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => handleDisassociation(device.id),
        },
      ],
    );
  };

  const availableDevices = devices.filter((device) => !device.plantId);
  const availablePlants = plants.filter(
    (plant) => !devices.some((device) => device.plantId === plant.id),
  );
  const associatedDevices = devices.filter((device) => device.plantId);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-lg font-bold">
              Plant & Device Association
            </Text>
            <View style={{ width: 24 }} />
          </View>
        </View>

        {/* Mode Selector */}
        <View className="bg-white mx-4 my-3 rounded-xl p-3">
          <Text className="text-gray-600 mb-2">Mode</Text>
          <View className="flex-row">
            <TouchableOpacity
              className={`flex-1 py-2 px-3 rounded-lg mr-2 ${
                mode === "plant-to-device" ? "bg-green-100" : "bg-gray-100"
              }`}
              onPress={() => setMode("plant-to-device")}
            >
              <Text
                className={`text-center font-medium ${
                  mode === "plant-to-device"
                    ? "text-green-800"
                    : "text-gray-600"
                }`}
              >
                Associate
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-2 px-3 rounded-lg ${
                mode === "device-to-plant" ? "bg-red-100" : "bg-gray-100"
              }`}
              onPress={() => setMode("device-to-plant")}
            >
              <Text
                className={`text-center font-medium ${
                  mode === "device-to-plant" ? "text-red-800" : "text-gray-600"
                }`}
              >
                Manage
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 px-4">
          {mode === "plant-to-device" ? (
            <>
              {/* Associate Plants with Devices */}
              <Text className="text-lg font-bold mb-3">
                Associate Plant with Device
              </Text>

              {availablePlants.length === 0 && availableDevices.length === 0 ? (
                <View className="bg-white rounded-xl p-6 items-center">
                  <Ionicons name="checkmark-circle" size={48} color="#10b981" />
                  <Text className="text-gray-600 mt-2 text-center">
                    All plants and devices are already associated!
                  </Text>
                </View>
              ) : availablePlants.length === 0 ? (
                <View className="bg-white rounded-xl p-6 items-center">
                  <Ionicons name="leaf-outline" size={48} color="#d1d5db" />
                  <Text className="text-gray-600 mt-2 text-center">
                    No unassociated plants available
                  </Text>
                </View>
              ) : availableDevices.length === 0 ? (
                <View className="bg-white rounded-xl p-6 items-center">
                  <Ionicons
                    name="hardware-chip-outline"
                    size={48}
                    color="#d1d5db"
                  />
                  <Text className="text-gray-600 mt-2 text-center">
                    No unassociated devices available
                  </Text>
                </View>
              ) : (
                <>
                  <Text className="text-gray-600 mb-2">Available Plants</Text>
                  {availablePlants.map((plant) => (
                    <View
                      key={plant.id}
                      className="bg-white rounded-xl p-4 mb-3"
                    >
                      <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center">
                          <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mr-3">
                            <Ionicons name="leaf" size={24} color="#14532d" />
                          </View>
                          <View>
                            <Text className="font-medium">{plant.name}</Text>
                            <Text className="text-gray-500 text-sm">
                              {plant.species}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <Text className="text-gray-600 text-sm mb-2">
                        Available Devices
                      </Text>
                      {availableDevices.map((device) => (
                        <TouchableOpacity
                          key={device.id}
                          className="flex-row items-center justify-between py-2 px-3 bg-gray-50 rounded-lg mb-2"
                          onPress={() => handleAssociation(plant.id, device.id)}
                          disabled={loading}
                        >
                          <View className="flex-row items-center">
                            <View className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center mr-3">
                              <Ionicons
                                name="hardware-chip"
                                size={16}
                                color="#6b7280"
                              />
                            </View>
                            <View>
                              <Text className="font-medium">{device.name}</Text>
                              <View className="flex-row items-center">
                                <View
                                  className={`w-2 h-2 rounded-full mr-1 ${
                                    device.connected
                                      ? "bg-green-500"
                                      : "bg-red-500"
                                  }`}
                                />
                                <Text className="text-xs text-gray-500">
                                  {device.connected
                                    ? "Connected"
                                    : "Disconnected"}
                                </Text>
                              </View>
                            </View>
                          </View>
                          {loading ? (
                            <ActivityIndicator size="small" color="#14532d" />
                          ) : (
                            <Ionicons
                              name="add-circle"
                              size={20}
                              color="#14532d"
                            />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  ))}
                </>
              )}
            </>
          ) : (
            <>
              {/* Manage Associations */}
              <Text className="text-lg font-bold mb-3">
                Current Associations
              </Text>

              {associatedDevices.length === 0 ? (
                <View className="bg-white rounded-xl p-6 items-center">
                  <Ionicons name="link-outline" size={48} color="#d1d5db" />
                  <Text className="text-gray-600 mt-2 text-center">
                    No associations found
                  </Text>
                </View>
              ) : (
                associatedDevices.map((device) => {
                  const associatedPlant = plants.find(
                    (p) => p.id === device.plantId,
                  );
                  return (
                    <View
                      key={device.id}
                      className="bg-white rounded-xl p-4 mb-3"
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <View className="flex-row items-center mb-2">
                            <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                              <Ionicons
                                name="hardware-chip"
                                size={20}
                                color="#6b7280"
                              />
                            </View>
                            <View>
                              <Text className="font-medium">{device.name}</Text>
                              <View className="flex-row items-center">
                                <View
                                  className={`w-2 h-2 rounded-full mr-1 ${
                                    device.connected
                                      ? "bg-green-500"
                                      : "bg-red-500"
                                  }`}
                                />
                                <Text className="text-xs text-gray-500">
                                  {device.connected
                                    ? "Connected"
                                    : "Disconnected"}
                                </Text>
                              </View>
                            </View>
                          </View>

                          <View className="flex-row items-center pl-13">
                            <Ionicons
                              name="arrow-down"
                              size={16}
                              color="#9ca3af"
                            />
                            <Text className="text-gray-500 ml-2">
                              Associated with
                            </Text>
                          </View>

                          <View className="flex-row items-center mt-2">
                            <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                              <Ionicons name="leaf" size={20} color="#14532d" />
                            </View>
                            <View>
                              <Text className="font-medium">
                                {associatedPlant?.name || "Unknown Plant"}
                              </Text>
                              <Text className="text-gray-500 text-sm">
                                {associatedPlant?.species || "Unknown Species"}
                              </Text>
                            </View>
                          </View>
                        </View>

                        <TouchableOpacity
                          className="bg-red-100 p-2 rounded-lg"
                          onPress={() => confirmDisassociation(device)}
                          disabled={loading}
                        >
                          {loading ? (
                            <ActivityIndicator size="small" color="#ef4444" />
                          ) : (
                            <Ionicons name="unlink" size={20} color="#ef4444" />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};
