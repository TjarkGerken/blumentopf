// src/components/WateringControl.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Plant, BlumentopfDevice } from "../types/models";
import { wateringService } from "../services/wateringService";
import { useDeviceStatus } from "../hooks/useDeviceStatus";
import { CommandStatusModal } from "./CommandStatusModal";

interface WateringControlProps {
  plant: Plant;
  device?: BlumentopfDevice;
  onWateringStarted?: () => void;
  onWateringCompleted?: () => void;
}

export const WateringControl = ({
  plant,
  device,
  onWateringStarted,
  onWateringCompleted,
}: WateringControlProps) => {
  const [isWatering, setIsWatering] = useState(false);
  const [currentCommandId, setCurrentCommandId] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const { status: deviceStatus, isOnline } = useDeviceStatus(
    device?.id || null,
  );

  const handleWatering = async () => {
    if (!device || !plant) return;

    // Confirm watering action
    Alert.alert(
      "Confirm Watering",
      `Water ${plant.name} with ${plant.wateringSchedule.amount}ml?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Water Now",
          onPress: async () => {
            await executeWatering();
          },
        },
      ],
    );
  };

  const executeWatering = async () => {
    if (!device || !plant) return;

    setIsWatering(true);

    try {
      const result = await wateringService.sendWateringCommand(
        device.id,
        plant.wateringSchedule.amount,
      );

      setCurrentCommandId(result.command.id);
      setShowStatusModal(true);

      if (onWateringStarted) {
        onWateringStarted();
      }

      // Show appropriate message based on device status
      const message = result.deviceOnline
        ? `Watering command sent to ${device.name}!`
        : `Watering command queued for ${device.name} (device offline)`;

      Alert.alert("Command Sent", message);
    } catch (error) {
      console.error("Error sending watering command:", error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to send watering command",
      );
    } finally {
      setIsWatering(false);
    }
  };

  const handleCancel = async () => {
    if (!currentCommandId) return;

    try {
      await wateringService.cancelCommand(currentCommandId);
      Alert.alert("Success", "Watering command cancelled");
      setCurrentCommandId(null);
      setShowStatusModal(false);
    } catch (error) {
      Alert.alert("Error", "Failed to cancel command");
    }
  };

  const getButtonText = () => {
    if (isWatering) return "Sending Command...";
    if (!device) return "No Device Connected";
    if (!isOnline) return "Device Offline - Queue Command";
    if (deviceStatus?.currentActivity === "watering")
      return "Currently Watering";
    return `Water with ${plant.wateringSchedule.amount}ml`;
  };

  const getButtonColor = () => {
    if (!device) return "bg-gray-400";
    if (isWatering) return "bg-blue-300";
    if (!isOnline) return "bg-orange-500";
    if (deviceStatus?.currentActivity === "watering") return "bg-green-300";
    return "bg-blue-500";
  };

  const isDisabled = isWatering || !device;

  return (
    <View>
      <TouchableOpacity
        onPress={handleWatering}
        disabled={isDisabled}
        className={`p-4 rounded-lg flex-row items-center justify-center ${getButtonColor()}`}
      >
        {isWatering ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Ionicons name="water" size={20} color="white" />
        )}
        <Text className="text-white font-medium ml-2">{getButtonText()}</Text>
      </TouchableOpacity>

      {/* Device Status Indicator */}
      {device && (
        <View className="flex-row items-center justify-center mt-2">
          <View
            className={`w-2 h-2 rounded-full mr-2 ${
              isOnline ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <Text className="text-xs text-gray-500">
            {isOnline ? "Device Online" : "Device Offline"}
            {deviceStatus?.currentActivity &&
              ` - ${deviceStatus.currentActivity}`}
          </Text>
        </View>
      )}

      {/* Water Reservoir Status */}
      {deviceStatus?.waterReservoirMl !== undefined && (
        <View className="flex-row items-center justify-center mt-1">
          <Ionicons name="water-outline" size={12} color="#6b7280" />
          <Text className="text-xs text-gray-500 ml-1">
            Reservoir: {deviceStatus.waterReservoirMl}ml
          </Text>
        </View>
      )}

      {/* Command Status Modal */}
      <CommandStatusModal
        visible={showStatusModal}
        commandId={currentCommandId}
        onClose={() => setShowStatusModal(false)}
        onCancel={handleCancel}
        onCompleted={onWateringCompleted}
      />
    </View>
  );
};
