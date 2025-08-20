import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { startOfDay, endOfDay, format, isToday } from 'date-fns';

interface DashboardStats {
  tasksCreated: number;
  tasksCompleted: number;
  currentStreak: number;
  lastMoodScore?: number;
}

export const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  // Fetch dashboard stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user?.id) throw new Error('User not authenticated');

      const today = new Date();
      const startOfToday = startOfDay(today);
      const endOfToday = endOfDay(today);

      // Get tasks created and completed today
      const { data: tasksToday } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startOfToday.toISOString())
        .lte('created_at', endOfToday.toISOString());

      const tasksCreated = tasksToday?.length || 0;
      const tasksCompleted = tasksToday?.filter(task => task.completed).length || 0;

      // Get current streak - fetch moods and tasks separately
      const { data: moods } = await supabase
        .from('moods')
        .select('created_at')
        .eq('user_id', user.id);

      const { data: completedTasks } = await supabase
        .from('tasks')
        .select('updated_at')
        .eq('user_id', user.id)
        .eq('completed', true);

      const allActivities = [
        ...(moods || []).map(mood => ({ created_at: mood.created_at })),
        ...(completedTasks || []).map(task => ({ created_at: task.updated_at }))
      ];

      // Calculate streak logic
      let currentStreak = 0;
      if (allActivities && allActivities.length > 0) {
        // Sort activities by date and calculate consecutive days
        const sortedDates = allActivities
          .map(activity => new Date(activity.created_at))
          .sort((a, b) => b.getTime() - a.getTime());

        let currentDate = new Date();
        for (let i = 0; i < 30; i++) { // Check last 30 days
          const dateToCheck = new Date(currentDate);
          dateToCheck.setDate(dateToCheck.getDate() - i);
          
          const hasActivity = sortedDates.some(activityDate => 
            format(activityDate, 'yyyy-MM-dd') === format(dateToCheck, 'yyyy-MM-dd')
          );

          if (hasActivity) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      // Get last mood score
      const { data: lastMood } = await supabase
        .from('moods')
        .select('score')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return {
        tasksCreated,
        tasksCompleted,
        currentStreak,
        lastMoodScore: lastMood?.score,
      };
    },
    enabled: !!user?.id,
  });

  const handleMoodSelect = async (score: number) => {
    if (!user?.id) return;

    setSelectedMood(score);
    
    try {
      const { error } = await supabase
        .from('moods')
        .insert({
          user_id: user.id,
          score,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      // Invalidate queries to refresh stats
      // This would typically be done with queryClient.invalidateQueries
    } catch (error) {
      console.error('Error logging mood:', error);
    }
  };

  const getMoodEmoji = (score: number) => {
    switch (score) {
      case 1: return '😢';
      case 2: return '😕';
      case 3: return '😐';
      case 4: return '🙂';
      case 5: return '😊';
      default: return '😐';
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#d946ef" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Welcome Header */}
        <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            Welcome back! 👋
          </Text>
          <Text className="text-gray-600">
            How are you feeling today?
          </Text>
        </View>

        {/* Quick Mood Log */}
        <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Quick Mood Check
          </Text>
          <View className="flex-row justify-between">
            {[1, 2, 3, 4, 5].map((score) => (
              <TouchableOpacity
                key={score}
                onPress={() => handleMoodSelect(score)}
                className={`w-12 h-12 rounded-full items-center justify-center ${
                  selectedMood === score ? 'bg-mindspace-100 border-2 border-mindspace-500' : 'bg-gray-100'
                }`}
              >
                <Text className="text-xl">{getMoodEmoji(score)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats Grid */}
        <View className="flex-row space-x-4 mb-6">
          {/* Tasks Today */}
          <View className="flex-1 bg-white rounded-xl p-4 shadow-sm">
            <View className="items-center">
              <Ionicons name="list" size={24} color="#d946ef" />
              <Text className="text-2xl font-bold text-gray-800 mt-2">
                {stats?.tasksCreated || 0}
              </Text>
              <Text className="text-sm text-gray-600 text-center">
                Tasks Today
              </Text>
              <Text className="text-xs text-mindspace-600 mt-1">
                {stats?.tasksCompleted || 0} completed
              </Text>
            </View>
          </View>

          {/* Day Streak */}
          <View className="flex-1 bg-white rounded-xl p-4 shadow-sm">
            <View className="items-center">
              <Ionicons name="flame" size={24} color="#f59e0b" />
              <Text className="text-2xl font-bold text-gray-800 mt-2">
                {stats?.currentStreak || 0}
              </Text>
              <Text className="text-sm text-gray-600 text-center">
                Day Streak
              </Text>
              <Text className="text-xs text-mindspace-600 mt-1">
                Keep it up! 🔥
              </Text>
            </View>
          </View>
        </View>

        {/* Last Mood */}
        {stats?.lastMoodScore && (
          <View className="bg-white rounded-xl p-6 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Your Last Mood
            </Text>
            <View className="flex-row items-center">
              <Text className="text-4xl mr-4">
                {getMoodEmoji(stats.lastMoodScore)}
              </Text>
              <View>
                <Text className="text-lg font-medium text-gray-800">
                  Score: {stats.lastMoodScore}/5
                </Text>
                <Text className="text-sm text-gray-600">
                  {stats.lastMoodScore >= 4 ? 'Great mood!' : 
                   stats.lastMoodScore >= 3 ? 'Okay mood' : 'Could be better'}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};
