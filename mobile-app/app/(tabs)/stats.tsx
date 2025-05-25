// app/(tabs)/stats.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { usePlants } from "../../src/context/PlantProvider";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";

export default function StatsScreen() {
  const { plants, plantHistory, loading, loadPlantHistory } = usePlants();
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<
    "moisture" | "light" | "temperature"
  >("moisture");
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Set initial selected plant
  useEffect(() => {
    if (plants.length > 0 && !selectedPlantId) {
      setSelectedPlantId(plants[0].id);
    }
  }, [plants, selectedPlantId]);

  // Load history when plant is selected
  useEffect(() => {
    if (selectedPlantId && !plantHistory[selectedPlantId]) {
      setLoadingHistory(true);
      loadPlantHistory(selectedPlantId).finally(() => {
        setLoadingHistory(false);
      });
    }
  }, [selectedPlantId, plantHistory, loadPlantHistory]);

  const selectedPlant = plants.find((p) => p.id === selectedPlantId);
  const history = selectedPlantId ? plantHistory[selectedPlantId] || [] : [];

  // Get the last 7 days of history
  const last7Days = history.slice(0, 7).reverse();

  const chartData = {
    labels: last7Days.map((h) => {
      const date = new Date(h.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }),
    datasets: [
      {
        data: last7Days.map((h) => {
          if (selectedMetric === "moisture") return h.moistureLevel;
          if (selectedMetric === "light") return h.lightLevel;
          return h.temperatureLevel;
        }),
        color: () =>
          selectedMetric === "moisture"
            ? "#0ea5e9"
            : selectedMetric === "light"
              ? "#f59e0b"
              : "#ef4444",
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: () =>
      selectedMetric === "moisture"
        ? "#0ea5e9"
        : selectedMetric === "light"
          ? "#f59e0b"
          : "#ef4444",
    labelColor: () => "#64748b",
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#fafafa",
    },
  };

  // Calculate averages
  const calculateAverage = (
    metric: "moistureLevel" | "lightLevel" | "temperatureLevel",
  ) => {
    if (!history.length) return 0;
    const sum = history.reduce((acc, curr) => acc + curr[metric], 0);
    return Math.round(sum / history.length);
  };

  const moistureAvg = calculateAverage("moistureLevel");
  const lightAvg = calculateAverage("lightLevel");
  const temperatureAvg = calculateAverage("temperatureLevel");

  // Count watering events
  const wateringCount = history.filter((h) => h.watered).length;

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#14532d" />
        <Text className="mt-4 text-gray-600">Loading statistics...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Plant selector */}
        {plants.length > 0 && (
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <Text className="text-gray-500 mb-2">Select plant</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {plants.map((plant) => (
                <TouchableOpacity
                  key={plant.id}
                  className={`mr-3 p-2 rounded-lg ${
                    selectedPlantId === plant.id
                      ? "bg-green-100 border border-green-300"
                      : "bg-gray-100"
                  }`}
                  onPress={() => setSelectedPlantId(plant.id)}
                >
                  <Text
                    className={
                      selectedPlantId === plant.id
                        ? "text-green-800"
                        : "text-gray-700"
                    }
                  >
                    {plant.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {selectedPlant ? (
          <>
            {/* Stats overview */}
            <View className="flex-row justify-between mb-4">
              <View className="bg-white rounded-lg p-3 shadow-sm flex-1 mr-2">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-gray-500 text-xs">Avg. Moisture</Text>
                  <Ionicons name="water" size={16} color="#0ea5e9" />
                </View>
                <Text className="text-2xl font-bold text-blue-500">
                  {moistureAvg}%
                </Text>
              </View>

              <View className="bg-white rounded-lg p-3 shadow-sm flex-1 mr-2">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-gray-500 text-xs">Avg. Light</Text>
                  <Ionicons name="sunny" size={16} color="#f59e0b" />
                </View>
                <Text className="text-2xl font-bold text-amber-500">
                  {lightAvg}%
                </Text>
              </View>

              <View className="bg-white rounded-lg p-3 shadow-sm flex-1">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-gray-500 text-xs">Waterings</Text>
                  <Ionicons name="water-outline" size={16} color="#0ea5e9" />
                </View>
                <Text className="text-2xl font-bold text-blue-500">
                  {wateringCount}
                </Text>
              </View>
            </View>

            {/* Chart */}
            <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold">7-Day History</Text>
                <View className="flex-row">
                  <TouchableOpacity
                    className={`px-3 py-1 rounded-full mr-2 ${
                      selectedMetric === "moisture"
                        ? "bg-blue-100"
                        : "bg-gray-100"
                    }`}
                    onPress={() => setSelectedMetric("moisture")}
                  >
                    <Text
                      className={
                        selectedMetric === "moisture"
                          ? "text-blue-800"
                          : "text-gray-600"
                      }
                    >
                      Moisture
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className={`px-3 py-1 rounded-full mr-2 ${
                      selectedMetric === "light"
                        ? "bg-amber-100"
                        : "bg-gray-100"
                    }`}
                    onPress={() => setSelectedMetric("light")}
                  >
                    <Text
                      className={
                        selectedMetric === "light"
                          ? "text-amber-800"
                          : "text-gray-600"
                      }
                    >
                      Light
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className={`px-3 py-1 rounded-full ${
                      selectedMetric === "temperature"
                        ? "bg-red-100"
                        : "bg-gray-100"
                    }`}
                    onPress={() => setSelectedMetric("temperature")}
                  >
                    <Text
                      className={
                        selectedMetric === "temperature"
                          ? "text-red-800"
                          : "text-gray-600"
                      }
                    >
                      Temp
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {loadingHistory ? (
                <View className="h-40 items-center justify-center">
                  <ActivityIndicator size="small" color="#14532d" />
                  <Text className="text-gray-400 mt-2">Loading history...</Text>
                </View>
              ) : history.length > 0 && last7Days.length > 0 ? (
                <LineChart
                  data={chartData}
                  width={Dimensions.get("window").width - 40}
                  height={220}
                  chartConfig={chartConfig as any}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
                  }}
                />
              ) : (
                <View className="h-40 items-center justify-center">
                  <Ionicons
                    name="bar-chart-outline"
                    size={32}
                    color="#d1d5db"
                  />
                  <Text className="text-gray-400 mt-2">
                    No history data available
                  </Text>
                </View>
              )}
            </View>

            {/* Watering history */}
            <View className="bg-white rounded-xl p-4 shadow-sm">
              <Text className="text-lg font-bold mb-3">Watering History</Text>
              {history.filter((h) => h.watered).length > 0 ? (
                history
                  .filter((h) => h.watered)
                  .slice(0, 5)
                  .map((entry, index) => (
                    <View
                      key={`${entry.date.toISOString()}-${index}`}
                      className={`flex-row items-center py-2 ${
                        index <
                        history.filter((h) => h.watered).slice(0, 5).length - 1
                          ? "border-b border-gray-100"
                          : ""
                      }`}
                    >
                      <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-3">
                        <Ionicons name="water" size={16} color="#0ea5e9" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-800">
                          Watered {entry.waterAmount || 0}ml
                        </Text>
                        <Text className="text-xs text-gray-500">
                          {new Date(entry.date).toLocaleDateString()} at{" "}
                          {new Date(entry.date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>
                      </View>
                    </View>
                  ))
              ) : (
                <View className="h-20 items-center justify-center">
                  <Text className="text-gray-400">
                    No watering records found
                  </Text>
                </View>
              )}
            </View>
          </>
        ) : (
          <View className="bg-white rounded-xl p-6 items-center justify-center border border-gray-200">
            <Ionicons name="analytics-outline" size={48} color="#d1d5db" />
            <Text className="text-gray-500 mt-2 text-center">
              Add plants to see statistics
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
