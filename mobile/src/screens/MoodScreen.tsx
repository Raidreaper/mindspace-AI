import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

interface MoodEntry {
  id: string;
  score: number;
  notes: string | null;
  created_at: string;
}

export const MoodScreen: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAddMood, setShowAddMood] = useState(false);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [moodNotes, setMoodNotes] = useState('');

  // Fetch mood entries
  const { data: moods, isLoading } = useQuery({
    queryKey: ['moods', user?.id],
    queryFn: async (): Promise<MoodEntry[]> => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('moods')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Add mood mutation
  const addMoodMutation = useMutation({
    mutationFn: async (moodData: { score: number; notes?: string }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('moods')
        .insert({
          user_id: user.id,
          score: moodData.score,
          notes: moodData.notes || null,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moods', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats', user?.id] });
      setShowAddMood(false);
      setSelectedScore(null);
      setMoodNotes('');
    },
  });

  // Delete mood mutation
  const deleteMoodMutation = useMutation({
    mutationFn: async (moodId: string) => {
      const { error } = await supabase
        .from('moods')
        .delete()
        .eq('id', moodId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moods', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats', user?.id] });
    },
  });

  const handleAddMood = () => {
    if (selectedScore === null) {
      Alert.alert('Error', 'Please select a mood score');
      return;
    }

    addMoodMutation.mutate({
      score: selectedScore,
      notes: moodNotes.trim() || undefined,
    });
  };

  const handleDeleteMood = (mood: MoodEntry) => {
    Alert.alert(
      'Delete Mood Entry',
      `Are you sure you want to delete this mood entry?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMoodMutation.mutate(mood.id) },
      ]
    );
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

  const getMoodLabel = (score: number) => {
    switch (score) {
      case 1: return 'Very Bad';
      case 2: return 'Bad';
      case 3: return 'Okay';
      case 4: return 'Good';
      case 5: return 'Great';
      default: return 'Unknown';
    }
  };

  const getMoodColor = (score: number) => {
    switch (score) {
      case 1: return '#ef4444';
      case 2: return '#f97316';
      case 3: return '#eab308';
      case 4: return '#22c55e';
      case 5: return '#10b981';
      default: return '#6b7280';
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
    <View className="flex-1 bg-gray-50">
      {/* Add Mood Button */}
      <View className="p-4 bg-white border-b border-gray-200">
        <TouchableOpacity
          onPress={() => setShowAddMood(true)}
          className="bg-mindspace-500 rounded-xl py-3 px-6 flex-row items-center justify-center"
        >
          <Ionicons name="add" size={20} color="white" />
          <Text className="text-white font-semibold ml-2">Log Mood</Text>
        </TouchableOpacity>
      </View>

      {/* Add Mood Modal */}
      {showAddMood && (
        <View className="absolute inset-0 bg-black bg-opacity-50 justify-center items-center z-10">
          <View className="bg-white rounded-xl p-6 mx-4 w-full max-w-sm">
            <Text className="text-xl font-bold text-gray-800 mb-4">How are you feeling?</Text>
            
            {/* Mood Score Selector */}
            <View className="flex-row justify-between mb-6">
              {[1, 2, 3, 4, 5].map((score) => (
                <TouchableOpacity
                  key={score}
                  onPress={() => setSelectedScore(score)}
                  className={`w-12 h-12 rounded-full items-center justify-center ${
                    selectedScore === score ? 'bg-mindspace-100 border-2 border-mindspace-500' : 'bg-gray-100'
                  }`}
                >
                  <Text className="text-xl">{getMoodEmoji(score)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedScore && (
              <Text className="text-center text-gray-600 mb-4">
                {getMoodLabel(selectedScore)} - {getMoodEmoji(selectedScore)}
              </Text>
            )}
            
            <TextInput
              placeholder="Add notes (optional)"
              value={moodNotes}
              onChangeText={setMoodNotes}
              className="border border-gray-300 rounded-lg px-4 py-3 mb-6"
              multiline
              numberOfLines={3}
            />
            
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => setShowAddMood(false)}
                className="flex-1 bg-gray-300 rounded-lg py-3"
              >
                <Text className="text-center font-medium">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleAddMood}
                disabled={addMoodMutation.isPending || selectedScore === null}
                className="flex-1 bg-mindspace-500 rounded-lg py-3"
              >
                {addMoodMutation.isPending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-center text-white font-medium">Save Mood</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Mood History */}
      <ScrollView className="flex-1 p-4">
        {moods && moods.length > 0 ? (
          moods.map((mood) => (
            <View key={mood.id} className="bg-white rounded-xl p-4 mb-4 shadow-sm">
              <View className="flex-row items-start justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 rounded-full items-center justify-center mr-4" style={{ backgroundColor: `${getMoodColor(mood.score)}20` }}>
                    <Text className="text-2xl">{getMoodEmoji(mood.score)}</Text>
                  </View>
                  
                  <View className="flex-1">
                    <Text className="text-lg font-medium text-gray-800">
                      {getMoodLabel(mood.score)}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Score: {mood.score}/5
                    </Text>
                    {mood.notes && (
                      <Text className="text-sm text-gray-600 mt-1">
                        {mood.notes}
                      </Text>
                    )}
                    <Text className="text-xs text-gray-400 mt-2">
                      {format(new Date(mood.created_at), 'MMM dd, yyyy - HH:mm')}
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity
                  onPress={() => handleDeleteMood(mood)}
                  className="w-8 h-8 bg-red-100 rounded-full items-center justify-center"
                >
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View className="bg-white rounded-xl p-8 items-center">
            <Ionicons name="heart-outline" size={48} color="#9ca3af" />
            <Text className="text-lg font-medium text-gray-500 mt-4">No mood entries yet</Text>
            <Text className="text-gray-400 text-center mt-2">
              Start tracking your mood to see patterns over time
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};
