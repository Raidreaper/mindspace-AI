import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export const AuthScreen: React.FC = () => {
  const { signInWithGoogle, loading } = useAuth();

  return (
    <View className="flex-1 bg-gradient-to-b from-mindspace-50 to-mindspace-100 justify-center items-center px-8">
      {/* App Icon and Title */}
      <View className="items-center mb-12">
        <View className="w-24 h-24 bg-mindspace-500 rounded-full items-center justify-center mb-6">
          <Ionicons name="bulb" size={48} color="white" />
        </View>
        <Text className="text-4xl font-bold text-mindspace-800 mb-2">
          MindSpace AI
        </Text>
        <Text className="text-lg text-mindspace-600 text-center">
          Your AI-powered mental health companion
        </Text>
      </View>

      {/* Sign In Button */}
      <TouchableOpacity
        onPress={signInWithGoogle}
        disabled={loading}
        className={`w-full bg-white rounded-xl py-4 px-6 flex-row items-center justify-center shadow-lg ${
          loading ? 'opacity-50' : ''
        }`}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#d946ef" />
        ) : (
          <>
            <Ionicons name="logo-google" size={24} color="#4285F4" />
            <Text className="text-lg font-semibold text-gray-800 ml-3">
              Continue with Google
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Footer Text */}
      <Text className="text-sm text-mindspace-600 text-center mt-8 px-4">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </Text>
    </View>
  );
};
