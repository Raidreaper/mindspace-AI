import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { DashboardScreen } from '../screens/DashboardScreen';
import { TasksScreen } from '../screens/TasksScreen';
import { MoodScreen } from '../screens/MoodScreen';
import { CrisisScreen } from '../screens/CrisisScreen';
import { FloatingChatButton } from '../components/FloatingChatButton';

const Tab = createBottomTabNavigator();

export const AppNavigator: React.FC = () => {
  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Dashboard') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Tasks') {
              iconName = focused ? 'list' : 'list-outline';
            } else if (route.name === 'Mood') {
              iconName = focused ? 'heart' : 'heart-outline';
            } else if (route.name === 'Crisis') {
              iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
            } else {
              iconName = 'help-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#d946ef',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb',
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          headerStyle: {
            backgroundColor: '#d946ef',
          },
          headerTintColor: 'white',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{ title: 'MindSpace' }}
        />
        <Tab.Screen 
          name="Tasks" 
          component={TasksScreen}
          options={{ title: 'Tasks & Goals' }}
        />
        <Tab.Screen 
          name="Mood" 
          component={MoodScreen}
          options={{ title: 'Mood Tracker' }}
        />
        <Tab.Screen 
          name="Crisis" 
          component={CrisisScreen}
          options={{ title: 'Crisis Support' }}
        />
      </Tab.Navigator>
      
      {/* Floating Chat Button */}
      <FloatingChatButton />
    </>
  );
};
