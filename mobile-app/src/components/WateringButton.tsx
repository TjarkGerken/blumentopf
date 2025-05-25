// src/components/WateringButton.tsx (DEPRECATED - USE WateringControl INSTEAD)
// This file is kept for backward compatibility but should not be used in new code
import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface WateringButtonProps {
  onPress: () => void;
  isWatering?: boolean;
}

export const WateringButton = ({
  onPress,
  isWatering,
}: WateringButtonProps) => {
  return (
    <TouchableOpacity
      className={`px-4 py-3 rounded-full flex-row items-center justify-center ${
        isWatering ? "bg-blue-200" : "bg-blue-500"
      }`}
      onPress={onPress}
      disabled={isWatering}
    >
      {isWatering ? (
        <>
          <ActivityIndicator size="small" color="#0369a1" />
          <Text className="text-blue-700 font-medium ml-2">Watering...</Text>
        </>
      ) : (
        <>
          <Ionicons name="water" size={20} color="white" />
          <Text className="text-white font-medium ml-2">Water Now</Text>
        </>
      )}
    </TouchableOpacity>
  );
};
