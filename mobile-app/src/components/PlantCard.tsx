// src/components/PlantCard.tsx
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Plant } from "../types/models";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
interface PlantCardProps {
  plant: Plant;
  onPress?: () => void;
}

export const PlantCard = ({ plant, onPress }: PlantCardProps) => {
  // Calculate days since last watered
  const daysSinceWatered = Math.floor(
    (new Date().getTime() - new Date(plant.lastWatered).getTime()) /
      (1000 * 3600 * 24),
  );

  const daysUntilNextWatering = Math.floor(
    (new Date(plant.nextWateringDate).getTime() - new Date().getTime()) /
      (1000 * 3600 * 24),
  );

  // Health status colors
  const healthColors = {
    excellent: "#4ade80", // green-400
    good: "#a3e635", // lime-400
    needs_attention: "#fb923c", // orange-400
    critical: "#f87171", // red-400
  };

  const healthColor = healthColors[plant.healthStatus];

  return (
    <TouchableOpacity
      className="bg-white rounded-xl shadow-md mb-4 overflow-hidden"
      onPress={onPress || (() => router.push(`/plant/${plant.id}`))}
    >
      <View className="flex-row">
        {plant.image ? (
          <Image
            source={{ uri: "https://picsum.photos/400/400" }}
            style={{
              height: 96,
              width: 96,
              borderTopLeftRadius: 12,
              borderBottomLeftRadius: 12,
            }}
          />
        ) : (
          <View className="h-24 w-24 bg-gray-200 rounded-l-xl items-center justify-center">
            <Ionicons name="leaf-outline" size={32} color="#9ca3af" />
          </View>
        )}

        <View className="p-3 flex-1">
          <View className="flex-row justify-between items-start">
            <Text className="text-lg font-bold">{plant.name}</Text>
            <View
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: healthColor }}
            />
          </View>

          <Text className="text-gray-600 text-sm">{plant.species}</Text>

          <View className="flex-row justify-between mt-2">
            <View className="flex-row items-center">
              <Ionicons name="water-outline" size={16} color="#0ea5e9" />
              <Text className="text-gray-700 text-xs ml-1">
                {daysSinceWatered === 0 ? "Today" : `${daysSinceWatered}d ago`}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={16} color="#64748b" />
              <Text className="text-gray-700 text-xs ml-1">
                {daysUntilNextWatering <= 0
                  ? "Water now!"
                  : `Water in ${daysUntilNextWatering}d`}
              </Text>
            </View>
          </View>

          <View className="mt-2 bg-gray-100 h-1.5 rounded-full">
            <View
              className="h-full rounded-full"
              style={{
                width: `${plant.moistureLevel}%`,
                backgroundColor:
                  plant.moistureLevel > 50 ? "#0ea5e9" : "#f97316",
              }}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
