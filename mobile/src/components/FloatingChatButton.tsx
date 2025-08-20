import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface TaskSuggestion {
  title: string;
  description: string;
}

export const FloatingChatButton: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isVisible, setIsVisible] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hi! I'm your AI assistant. I can help you with tasks, mood tracking, and more. What would you like to do?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const geminiApiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';
  const geminiApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  useEffect(() => {
    if (isVisible) {
      scrollToBottom();
    }
  }, [isVisible, messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const addMessage = (text: string, isUser: boolean) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const callGeminiAPI = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch(`${geminiApiUrl}?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a helpful AI assistant for a mental health app called MindSpace. The user can ask you to:
1. Suggest tasks - respond with "SUGGEST_TASK:" followed by a JSON object with "title" and "description"
2. Mark tasks complete - respond with "COMPLETE_TASK:" followed by the task title
3. Delete tasks - respond with "DELETE_TASK:" followed by the task title
4. General conversation - respond normally

User message: ${userMessage}

Current context: The user is using a mental health app and may need help with productivity, mood, or general support.`
            }]
          }]
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !user?.id) return;

    const userMessage = inputText.trim();
    addMessage(userMessage, true);
    setInputText('');
    setIsLoading(true);

    try {
      const aiResponse = await callGeminiAPI(userMessage);
      
      // Check for special commands
      if (aiResponse.startsWith('SUGGEST_TASK:')) {
        try {
          const taskData: TaskSuggestion = JSON.parse(aiResponse.replace('SUGGEST_TASK:', '').trim());
          addMessage(`I suggest this task: "${taskData.title}" - ${taskData.description}\n\nWould you like me to create it for you?`, false);
          
          // Show approval buttons
          addMessage('', false); // This will be replaced with buttons
        } catch (error) {
          addMessage("I suggested a task but couldn't parse it properly. Let me try again.", false);
        }
      } else if (aiResponse.startsWith('COMPLETE_TASK:')) {
        const taskTitle = aiResponse.replace('COMPLETE_TASK:', '').trim();
        await markTaskComplete(taskTitle);
        addMessage(`I've marked "${taskTitle}" as complete!`, false);
      } else if (aiResponse.startsWith('DELETE_TASK:')) {
        const taskTitle = aiResponse.replace('DELETE_TASK:', '').trim();
        await deleteTask(taskTitle);
        addMessage(`I've deleted the task "${taskTitle}"!`, false);
      } else {
        addMessage(aiResponse, false);
      }
    } catch (error) {
      addMessage("I'm sorry, something went wrong. Please try again.", false);
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async (title: string, description: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          title,
          description,
          completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['tasks', user.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats', user.id] });

      addMessage(`Great! I've created the task "${title}" for you.`, false);
    } catch (error) {
      console.error('Error creating task:', error);
      addMessage("Sorry, I couldn't create that task. Please try again.", false);
    }
  };

  const markTaskComplete = async (taskTitle: string) => {
    if (!user?.id) return;

    try {
      const { data: tasks, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('title', taskTitle)
        .eq('completed', false);

      if (fetchError) throw fetchError;

      if (tasks && tasks.length > 0) {
        const { error: updateError } = await supabase
          .from('tasks')
          .update({ completed: true, updated_at: new Date().toISOString() })
          .eq('id', tasks[0].id);

        if (updateError) throw updateError;

        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ['tasks', user.id] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats', user.id] });
      }
    } catch (error) {
      console.error('Error marking task complete:', error);
    }
  };

  const deleteTask = async (taskTitle: string) => {
    if (!user?.id) return;

    try {
      const { data: tasks, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('title', taskTitle);

      if (fetchError) throw fetchError;

      if (tasks && tasks.length > 0) {
        const { error: deleteError } = await supabase
          .from('tasks')
          .delete()
          .eq('id', tasks[0].id);

        if (deleteError) throw deleteError;

        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ['tasks', user.id] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats', user.id] });
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleTaskApproval = (title: string, description: string) => {
    Alert.alert(
      'Create Task',
      `Would you like me to create this task?\n\n"${title}"\n${description}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Create Task', onPress: () => createTask(title, description) },
      ]
    );
  };

  return (
    <>
      {/* Floating Button */}
      <TouchableOpacity
        onPress={() => setIsVisible(true)}
        className="absolute bottom-24 right-4 w-16 h-16 bg-mindspace-500 rounded-full items-center justify-center shadow-lg z-50"
        style={{ elevation: 8 }}
      >
        <Ionicons name="chatbubble-ellipses" size={24} color="white" />
      </TouchableOpacity>

      {/* Chat Modal */}
      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsVisible(false)}
      >
        <View className="flex-1 bg-white">
          {/* Header */}
          <View className="bg-mindspace-500 p-4 flex-row items-center justify-between">
            <Text className="text-white text-lg font-bold">AI Assistant</Text>
            <TouchableOpacity onPress={() => setIsVisible(false)}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 p-4"
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message) => (
              <View
                key={message.id}
                className={`mb-4 ${message.isUser ? 'items-end' : 'items-start'}`}
              >
                <View
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.isUser
                      ? 'bg-mindspace-500'
                      : 'bg-gray-100'
                  }`}
                >
                  <Text
                    className={`${
                      message.isUser ? 'text-white' : 'text-gray-800'
                    }`}
                  >
                    {message.text}
                  </Text>
                </View>
                
                {/* Task approval buttons for AI suggestions */}
                {!message.isUser && message.text.includes('Would you like me to create it for you?') && (
                  <View className="mt-2 flex-row space-x-2">
                    <TouchableOpacity
                      onPress={() => {
                        // Extract task info from the previous message
                        const prevMessage = messages[messages.length - 2];
                        if (prevMessage && prevMessage.text.includes('I suggest this task:')) {
                          const taskMatch = prevMessage.text.match(/"([^"]+)" - (.+)/);
                          if (taskMatch) {
                            handleTaskApproval(taskMatch[1], taskMatch[2]);
                          }
                        }
                      }}
                      className="bg-green-500 px-4 py-2 rounded-lg"
                    >
                      <Text className="text-white font-medium">Yes, create it!</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => addMessage("No thanks, I'll pass on that one.", true)}
                      className="bg-gray-500 px-4 py-2 rounded-lg"
                    >
                      <Text className="text-white font-medium">No thanks</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
            
            {isLoading && (
              <View className="items-start mb-4">
                <View className="bg-gray-100 p-3 rounded-2xl">
                  <View className="flex-row items-center">
                    <ActivityIndicator size="small" color="#d946ef" />
                    <Text className="text-gray-600 ml-2">AI is thinking...</Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input */}
          <View className="p-4 border-t border-gray-200">
            <View className="flex-row items-center space-x-2">
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask me anything..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-3"
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                onPress={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className={`w-12 h-12 rounded-full items-center justify-center ${
                  !inputText.trim() || isLoading ? 'bg-gray-300' : 'bg-mindspace-500'
                }`}
              >
                <Ionicons
                  name="send"
                  size={20}
                  color={!inputText.trim() || isLoading ? '#9ca3af' : 'white'}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};
