// app/(tabs)/index.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { usePlants } from "../../src/context/PlantProvider";
import { router } from "expo-router";
import { PlantCard } from "../../src/components/PlantCard";
import { Ionicons } from "@expo/vector-icons";
import { DeviceCard } from "~/components/DeviceCard";
import { PlantDeviceAssociation } from "../../src/components/PlantDeviceAssociation";

export default function HomeScreen() {
  const {
    plants,
    devices,
    loading,
    error,
    refreshData,
    associateDeviceWithPlant,
    disassociateDevice,
  } = usePlants();
  const [showAssociationModal, setShowAssociationModal] = useState(false);

  const getUnhealthyPlants = () => {
    return plants.filter(
      (p) =>
        p.healthStatus === "needs_attention" || p.healthStatus === "critical",
    );
  };

  const unhealthyPlants = getUnhealthyPlants();

  // Handle refresh
  const handleRefresh = async () => {
    try {
      await refreshData();
    } catch (err) {
      Alert.alert("Error", "Failed to refresh data. Please try again.");
    }
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
        <Text className="mt-4 text-gray-600">Loading your plants...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center p-6">
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text className="text-red-600 font-bold text-lg mt-4">Oops!</Text>
        <Text className="text-gray-600 text-center mt-2">{error}</Text>
        <TouchableOpacity
          className="mt-4 bg-green-700 px-6 py-3 rounded-lg"
          onPress={handleRefresh}
        >
          <Text className="text-white font-medium">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Pull to refresh indicator */}
        <TouchableOpacity
          className="flex-row items-center justify-center mb-4 p-2"
          onPress={handleRefresh}
        >
          <Ionicons name="refresh" size={16} color="#6b7280" />
          <Text className="text-gray-500 ml-1 text-sm">Pull to refresh</Text>
        </TouchableOpacity>

        {/* Device Association Button */}
        <TouchableOpacity
          className="bg-green-700 rounded-xl p-4 mb-4 flex-row items-center justify-center"
          onPress={() => setShowAssociationModal(true)}
        >
          <Ionicons name="link" size={20} color="#fff" />
          <Text className="text-white font-medium ml-2">
            Manage Plant & Device Associations
          </Text>
        </TouchableOpacity>

        {/* Alert section for plants that need attention */}
        {unhealthyPlants.length > 0 && (
          <View className="bg-orange-50 rounded-xl p-4 mb-6 border border-orange-200">
            <Text className="text-orange-800 font-bold text-lg mb-2">
              Plants needing attention
            </Text>
            {unhealthyPlants.map((plant) => (
              <TouchableOpacity
                key={plant.id}
                className="flex-row items-center my-1"
                onPress={() => router.push(`/plant/${plant.id}`)}
              >
                <View className="w-2 h-2 rounded-full bg-orange-500 mr-2" />
                <Text className="text-orange-800 flex-1">
                  {plant.name} -{" "}
                  {plant.healthStatus === "critical"
                    ? "Critical condition!"
                    : "Needs attention"}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#9a3412" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Connected devices section */}
        <Text className="text-lg font-bold mb-3">Connected Devices</Text>
        {devices.length > 0 ? (
          devices.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))
        ) : (
          <View className="bg-white rounded-xl p-6 items-center justify-center border border-gray-200">
            <Ionicons name="wifi-outline" size={48} color="#d1d5db" />
            <Text className="text-gray-500 mt-2 text-center">
              No devices connected
            </Text>
            <TouchableOpacity
              className="mt-4 bg-green-700 px-4 py-2 rounded-lg"
              onPress={() => alert("This would open device pairing")}
            >
              <Text className="text-white font-medium">Connect a Device</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* My plants section */}
        <View className="flex-row justify-between items-center mt-6 mb-3">
          <Text className="text-lg font-bold">My Plants</Text>
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => alert("This would open Add Plant flow")}
          >
            <Ionicons name="add-circle" size={20} color="#14532d" />
            <Text className="text-green-800 ml-1">Add Plant</Text>
          </TouchableOpacity>
        </View>

        {plants.length > 0 ? (
          plants.map((plant) => <PlantCard key={plant.id} plant={plant} />)
        ) : (
          <View className="bg-white rounded-xl p-6 items-center justify-center border border-gray-200">
            <Ionicons name="leaf-outline" size={48} color="#d1d5db" />
            <Text className="text-gray-500 mt-2 text-center">
              No plants added yet
            </Text>
            <TouchableOpacity
              className="mt-4 bg-green-700 px-4 py-2 rounded-lg"
              onPress={() => alert("This would open Add Plant flow")}
            >
              <Text className="text-white font-medium">
                Add Your First Plant
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Plant Device Association Modal */}
      <PlantDeviceAssociation
        visible={showAssociationModal}
        onClose={() => setShowAssociationModal(false)}
        plants={plants}
        devices={devices}
        onAssociate={handleAssociation}
        onDisassociate={handleDisassociation}
      />
    </ScrollView>
  );
}
