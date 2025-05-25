// src/components/CommandStatusModal.tsx
import React, { useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useWateringCommand } from "../hooks/useWateringCommand";

interface CommandStatusModalProps {
  visible: boolean;
  commandId: string | null;
  onClose: () => void;
  onCancel: () => void;
  onCompleted?: () => void;
}

export const CommandStatusModal = ({
  visible,
  commandId,
  onClose,
  onCancel,
  onCompleted,
}: CommandStatusModalProps) => {
  const { command, loading } = useWateringCommand(commandId);

  // Auto-close modal when command is completed
  useEffect(() => {
    if (command?.status === "completed") {
      setTimeout(() => {
        onClose();
        if (onCompleted) {
          onCompleted();
        }
      }, 2000); // Show success for 2 seconds
    }
  }, [command?.status, onClose, onCompleted]);

  const getStatusIcon = () => {
    if (loading) return <ActivityIndicator size="large" color="#14532d" />;

    switch (command?.status) {
      case "pending":
        return <Ionicons name="time-outline" size={48} color="#f59e0b" />;
      case "sent":
        return (
          <Ionicons name="paper-plane-outline" size={48} color="#3b82f6" />
        );
      case "acknowledged":
        return (
          <Ionicons name="checkmark-circle-outline" size={48} color="#10b981" />
        );
      case "completed":
        return <Ionicons name="checkmark-circle" size={48} color="#10b981" />;
      case "failed":
        return <Ionicons name="close-circle" size={48} color="#ef4444" />;
      case "timeout":
        return <Ionicons name="time" size={48} color="#ef4444" />;
      default:
        return (
          <Ionicons name="help-circle-outline" size={48} color="#6b7280" />
        );
    }
  };

  const getStatusText = () => {
    if (loading) return "Loading...";

    switch (command?.status) {
      case "pending":
        return "Command Queued";
      case "sent":
        return "Sent to Device";
      case "acknowledged":
        return "Device Received Command";
      case "completed":
        return "Watering Completed Successfully!";
      case "failed":
        return "Command Failed";
      case "timeout":
        return "Command Timed Out";
      default:
        return "Unknown Status";
    }
  };

  const getStatusDescription = () => {
    if (loading) return "Loading command status...";

    switch (command?.status) {
      case "pending":
        return "Your watering command is waiting to be processed.";
      case "sent":
        return "Command has been sent to your device. Waiting for acknowledgment.";
      case "acknowledged":
        return "Your device is processing the watering command.";
      case "completed":
        return `Successfully watered with ${command.waterAmount}ml!`;
      case "failed":
        return (
          command?.errorMessage ||
          "The watering command could not be completed."
        );
      case "timeout":
        return "The device did not respond in time. Please check your device connection.";
      default:
        return "Unable to determine command status.";
    }
  };

  const getProgressPercentage = () => {
    switch (command?.status) {
      case "pending":
        return 25;
      case "sent":
        return 50;
      case "acknowledged":
        return 75;
      case "completed":
        return 100;
      default:
        return 0;
    }
  };

  const showCancelButton = () => {
    return command?.status === "pending" || command?.status === "sent";
  };

  const handleCancelConfirm = () => {
    Alert.alert(
      "Cancel Watering",
      "Are you sure you want to cancel this watering command?",
      [
        { text: "No", style: "cancel" },
        { text: "Yes, Cancel", style: "destructive", onPress: onCancel },
      ],
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-6">
        <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold">Watering Status</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Status Icon and Text */}
          <View className="items-center mb-6">
            {getStatusIcon()}
            <Text className="text-xl font-bold mt-4 text-center">
              {getStatusText()}
            </Text>
            <Text className="text-gray-600 text-center mt-2">
              {getStatusDescription()}
            </Text>
          </View>

          {/* Progress Bar */}
          {command?.status !== "failed" && command?.status !== "timeout" && (
            <View className="mb-6">
              <View className="bg-gray-200 h-2 rounded-full">
                <View
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </View>
              <Text className="text-xs text-gray-500 text-center mt-1">
                {getProgressPercentage()}% Complete
              </Text>
            </View>
          )}

          {/* Command Details */}
          {command && (
            <View className="bg-gray-50 rounded-lg p-3 mb-4">
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-gray-600">Water Amount:</Text>
                <Text className="text-sm font-medium">
                  {command.waterAmount}ml
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-gray-600">Created:</Text>
                <Text className="text-sm font-medium">
                  {new Date(command.createdAt).toLocaleTimeString()}
                </Text>
              </View>
              {command.completedAt && (
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Completed:</Text>
                  <Text className="text-sm font-medium">
                    {new Date(command.completedAt).toLocaleTimeString()}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row space-x-3">
            {showCancelButton() && (
              <TouchableOpacity
                onPress={handleCancelConfirm}
                className="flex-1 bg-red-100 py-3 rounded-lg"
              >
                <Text className="text-red-700 font-medium text-center">
                  Cancel Command
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={onClose}
              className={`${showCancelButton() ? "flex-1" : "w-full"} bg-gray-100 py-3 rounded-lg`}
            >
              <Text className="text-gray-700 font-medium text-center">
                {command?.status === "completed" ? "Close" : "Minimize"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
