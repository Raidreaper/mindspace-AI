import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const LoadingScreen: React.FC = () => {
  return (
    <View className="flex-1 bg-gradient-to-b from-mindspace-50 to-mindspace-100 justify-center items-center">
      <View className="w-24 h-24 bg-mindspace-500 rounded-full items-center justify-center mb-6">
        <Ionicons name="bulb" size={48} color="white" />
      </View>
      <Text className="text-2xl font-bold text-mindspace-800 mb-4">
        MindSpace AI
      </Text>
      <ActivityIndicator size="large" color="#d946ef" />
    </View>
  );
};
