import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

export const CrisisScreen: React.FC = () => {
  const { user } = useAuth();
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingCount, setBreathingCount] = useState(0);
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [groundingCount, setGroundingCount] = useState(0);

  // Breathing exercise timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isBreathingActive) {
      interval = setInterval(() => {
        setBreathingCount((prev) => {
          const newCount = prev + 1;
          
          // 4-7-8 breathing pattern: 4 inhale, 7 hold, 8 exhale
          if (newCount <= 4) {
            setBreathingPhase('inhale');
          } else if (newCount <= 11) {
            setBreathingPhase('hold');
          } else if (newCount <= 19) {
            setBreathingPhase('exhale');
          } else {
            setBreathingCount(0);
            setBreathingPhase('inhale');
          }
          
          return newCount > 19 ? 0 : newCount;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isBreathingActive]);

  const startBreathing = () => {
    setIsBreathingActive(true);
    setBreathingCount(0);
    setBreathingPhase('inhale');
  };

  const stopBreathing = () => {
    setIsBreathingActive(false);
    setBreathingCount(0);
    setBreathingPhase('inhale');
  };

  const getBreathingText = () => {
    switch (breathingPhase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
      default:
        return 'Breathe In';
    }
  };

  const getBreathingColor = () => {
    switch (breathingPhase) {
      case 'inhale':
        return '#10b981';
      case 'hold':
        return '#f59e0b';
      case 'exhale':
        return '#3b82f6';
      default:
        return '#10b981';
    }
  };

  const handleEmergencyCall = () => {
    Alert.alert(
      'Emergency Contact',
      'If you\'re in immediate danger or experiencing a medical emergency, please call emergency services (911 in the US) or your local emergency number.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Emergency', style: 'destructive', onPress: () => {
          // In a real app, this would open the phone dialer
          Alert.alert('Emergency', 'Please manually dial your emergency number');
        }},
      ]
    );
  };

  const groundingExercises = [
    {
      title: '5-4-3-2-1 Grounding',
      description: 'Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.',
      icon: 'eye-outline',
      color: '#8b5cf6',
    },
    {
      title: 'Body Scan',
      description: 'Focus on each part of your body from head to toe, noticing sensations without judgment.',
      icon: 'body-outline',
      color: '#06b6d4',
    },
    {
      title: 'Mindful Walking',
      description: 'Take slow, deliberate steps, feeling each foot connect with the ground.',
      icon: 'footsteps-outline',
      color: '#10b981',
    },
    {
      title: 'Temperature Check',
      description: 'Hold an ice cube or warm drink, focusing on the temperature sensation.',
      icon: 'thermometer-outline',
      color: '#ef4444',
    },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Emergency Header */}
      <View className="bg-red-500 p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-white text-lg font-bold">Crisis Support</Text>
            <Text className="text-red-100 text-sm">
              You're not alone. Help is available.
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleEmergencyCall}
            className="bg-white rounded-lg px-4 py-2"
          >
            <Text className="text-red-500 font-semibold">Emergency</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="p-4">
        {/* Breathing Exercise */}
        <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <Text className="text-xl font-bold text-gray-800 mb-4">
            Breathing Exercise
          </Text>
          <Text className="text-gray-600 mb-6">
            Practice the 4-7-8 breathing technique to calm your nervous system
          </Text>

          {/* Breathing Circle */}
          <View className="items-center mb-6">
            <View 
              className="w-32 h-32 rounded-full items-center justify-center mb-4"
              style={{ 
                backgroundColor: `${getBreathingColor()}20`,
                borderWidth: 4,
                borderColor: getBreathingColor(),
              }}
            >
              <Text className="text-2xl font-bold" style={{ color: getBreathingColor() }}>
                {getBreathingText()}
              </Text>
            </View>
            
            <Text className="text-lg font-medium text-gray-700">
              {breathingPhase === 'inhale' && 'Take a deep breath in...'}
              {breathingPhase === 'hold' && 'Hold your breath...'}
              {breathingPhase === 'exhale' && 'Slowly release...'}
            </Text>
          </View>

          {/* Breathing Controls */}
          <View className="flex-row space-x-3">
            {!isBreathingActive ? (
              <TouchableOpacity
                onPress={startBreathing}
                className="flex-1 bg-mindspace-500 rounded-lg py-3"
              >
                <Text className="text-center text-white font-semibold">Start Breathing</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={stopBreathing}
                className="flex-1 bg-gray-500 rounded-lg py-3"
              >
                <Text className="text-center text-white font-semibold">Stop</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Grounding Techniques */}
        <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <Text className="text-xl font-bold text-gray-800 mb-4">
            Grounding Techniques
          </Text>
          <Text className="text-gray-600 mb-6">
            Use these techniques to bring yourself back to the present moment
          </Text>

          {groundingExercises.map((exercise, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setGroundingCount(prev => prev + 1)}
              className="flex-row items-center p-4 mb-3 rounded-lg border border-gray-200"
            >
              <View 
                className="w-10 h-10 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${exercise.color}20` }}
              >
                <Ionicons name={exercise.icon as any} size={20} color={exercise.color} />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-gray-800">{exercise.title}</Text>
                <Text className="text-sm text-gray-600">{exercise.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Coping Strategies */}
        <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <Text className="text-xl font-bold text-gray-800 mb-4">
            Coping Strategies
          </Text>
          
          <View className="space-y-3">
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text className="text-gray-700 ml-3">Remind yourself that this feeling will pass</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text className="text-gray-700 ml-3">Focus on your breathing and slow it down</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text className="text-gray-700 ml-3">Use your senses to ground yourself</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text className="text-gray-700 ml-3">Call a trusted friend or family member</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text className="text-gray-700 ml-3">Remember that you are safe right now</Text>
            </View>
          </View>
        </View>

        {/* Crisis Resources */}
        <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <Text className="text-xl font-bold text-gray-800 mb-4">
            Crisis Resources
          </Text>
          
          <View className="space-y-4">
            <TouchableOpacity className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <Text className="font-semibold text-blue-800">National Suicide Prevention Lifeline</Text>
              <Text className="text-blue-600">1-800-273-8255</Text>
              <Text className="text-sm text-blue-500 mt-1">Available 24/7</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="bg-green-50 p-4 rounded-lg border border-green-200">
              <Text className="font-semibold text-green-800">Crisis Text Line</Text>
              <Text className="text-green-600">Text HOME to 741741</Text>
              <Text className="text-sm text-green-500 mt-1">Free, confidential support</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <Text className="font-semibold text-purple-800">Emergency Services</Text>
              <Text className="text-purple-600">911 (US) or your local emergency number</Text>
              <Text className="text-sm text-purple-500 mt-1">For immediate medical emergencies</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Encouragement */}
        <View className="bg-gradient-to-r from-mindspace-500 to-mindspace-600 rounded-xl p-6 mb-6">
          <Text className="text-white text-center text-lg font-semibold mb-2">
            You're doing great! 🌟
          </Text>
          <Text className="text-mindspace-100 text-center">
            Taking care of your mental health is a sign of strength. 
            Remember that difficult moments are temporary, and you have the tools to get through them.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};
