import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export const TasksScreen: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  // Fetch tasks
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async (): Promise<Task[]> => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Add task mutation
  const addTaskMutation = useMutation({
    mutationFn: async (taskData: { title: string; description?: string }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          title: taskData.title,
          description: taskData.description || null,
          completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats', user?.id] });
      setShowAddTask(false);
      setNewTaskTitle('');
      setNewTaskDescription('');
    },
  });

  // Toggle task completion mutation
  const toggleTaskMutation = useMutation({
    mutationFn: async (task: Task) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          completed: !task.completed,
          updated_at: new Date().toISOString(),
        })
        .eq('id', task.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats', user?.id] });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats', user?.id] });
    },
  });

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    addTaskMutation.mutate({
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim() || undefined,
    });
  };

  const handleToggleTask = (task: Task) => {
    toggleTaskMutation.mutate(task);
  };

  const handleDeleteTask = (task: Task) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteTaskMutation.mutate(task.id) },
      ]
    );
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
      {/* Add Task Button */}
      <View className="p-4 bg-white border-b border-gray-200">
        <TouchableOpacity
          onPress={() => setShowAddTask(true)}
          className="bg-mindspace-500 rounded-xl py-3 px-6 flex-row items-center justify-center"
        >
          <Ionicons name="add" size={20} color="white" />
          <Text className="text-white font-semibold ml-2">Add New Task</Text>
        </TouchableOpacity>
      </View>

      {/* Add Task Modal */}
      {showAddTask && (
        <View className="absolute inset-0 bg-black bg-opacity-50 justify-center items-center z-10">
          <View className="bg-white rounded-xl p-6 mx-4 w-full max-w-sm">
            <Text className="text-xl font-bold text-gray-800 mb-4">Add New Task</Text>
            
            <TextInput
              placeholder="Task title"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
              autoFocus
            />
            
            <TextInput
              placeholder="Description (optional)"
              value={newTaskDescription}
              onChangeText={setNewTaskDescription}
              className="border border-gray-300 rounded-lg px-4 py-3 mb-6"
              multiline
              numberOfLines={3}
            />
            
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => setShowAddTask(false)}
                className="flex-1 bg-gray-300 rounded-lg py-3"
              >
                <Text className="text-center font-medium">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleAddTask}
                disabled={addTaskMutation.isPending}
                className="flex-1 bg-mindspace-500 rounded-lg py-3"
              >
                {addTaskMutation.isPending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-center text-white font-medium">Add Task</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Tasks List */}
      <ScrollView className="flex-1 p-4">
        {tasks && tasks.length > 0 ? (
          tasks.map((task) => (
            <View key={task.id} className="bg-white rounded-xl p-4 mb-4 shadow-sm">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 mr-3">
                  <Text className={`text-lg font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                    {task.title}
                  </Text>
                  {task.description && (
                    <Text className={`text-sm mt-1 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                      {task.description}
                    </Text>
                  )}
                  <Text className="text-xs text-gray-400 mt-2">
                    Created: {format(new Date(task.created_at), 'MMM dd, yyyy')}
                  </Text>
                </View>
                
                <View className="flex-row items-center space-x-2">
                  <TouchableOpacity
                    onPress={() => handleToggleTask(task)}
                    className={`w-8 h-8 rounded-full items-center justify-center ${
                      task.completed ? 'bg-green-100' : 'bg-gray-100'
                    }`}
                  >
                    <Ionicons
                      name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
                      size={20}
                      color={task.completed ? '#10b981' : '#6b7280'}
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => handleDeleteTask(task)}
                    className="w-8 h-8 bg-red-100 rounded-full items-center justify-center"
                  >
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className="bg-white rounded-xl p-8 items-center">
            <Ionicons name="list-outline" size={48} color="#9ca3af" />
            <Text className="text-lg font-medium text-gray-500 mt-4">No tasks yet</Text>
            <Text className="text-gray-400 text-center mt-2">
              Create your first task to get started with your goals
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};
