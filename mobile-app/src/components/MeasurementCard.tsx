// src/components/MeasurementCard.tsx
import React from "react";
import { View, Text } from "react-native";

interface MeasurementCardProps {
  title: string;
  value: number | string;
  unit?: string;
  icon: React.ReactNode;
  color: string;
}

export const MeasurementCard = ({
  title,
  value,
  unit,
  icon,
  color,
}: MeasurementCardProps) => {
  return (
    <View className="bg-white rounded-lg shadow p-3 flex-1 m-1">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-gray-500 text-xs">{title}</Text>
        {icon}
      </View>
      <View className="flex-row items-baseline">
        <Text className="text-2xl font-bold" style={{ color }}>
          {value}
        </Text>
        {unit && <Text className="text-gray-500 ml-1">{unit}</Text>}
      </View>
    </View>
  );
};
