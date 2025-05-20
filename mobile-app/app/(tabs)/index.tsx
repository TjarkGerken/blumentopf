// app/(tabs)/index.tsx
import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { usePlants } from "../../src/context/PlantProvider";
import { router } from "expo-router";
import { PlantCard } from "../../src/components/PlantCard";
import { Ionicons } from "@expo/vector-icons";
import { DeviceCard } from "~/components/DeviceCard";

export default function HomeScreen() {
  const { plants, devices } = usePlants();

  const getUnhealthyPlants = () => {
    return plants.filter(
      (p) =>
        p.healthStatus === "needs_attention" || p.healthStatus === "critical",
    );
  };

  const unhealthyPlants = getUnhealthyPlants();

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
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
                <Text className="text-orange-800">
                  {plant.name} needs water
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color="#9a3412"
                  className="ml-auto"
                />
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
    </ScrollView>
  );
}
