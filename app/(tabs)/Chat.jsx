import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, TouchableOpacity,
  Keyboard, TouchableWithoutFeedback
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function Chat() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! What would you like to achieve?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef(null);
  const userId = 'user123';

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const userMessage = { sender: 'user', text: inputText.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await fetch('http://192.168.1.81:8000/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.text, user_id: userId }),
      });
      const botReply = await response.text();
      setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: "❌ Couldn't contact server." }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.wrapper}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <View style={styles.titleBar}>
              <Text style={styles.title}><Ionicons
                      name={"chatbox-ellipses-outline"}
                      size={24}
                      style={{ marginBottom: 2 }}
                    /> Mentor Chat</Text>
            </View>

            <ScrollView
              style={styles.chat}
              contentContainerStyle={{ paddingBottom: 16 }}
              ref={scrollViewRef}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {messages.map((msg, i) => (
                <Text
                  key={i}
                  style={msg.sender === 'bot' ? styles.bot : styles.user}
                >
                  {msg.sender === 'bot' ? 'Mentor: ' : 'You: '}
                  {msg.text}
                </Text>
              ))}
            </ScrollView>

            <View style={styles.inputBar}>
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                placeholderTextColor="#aaa"
                value={inputText}
                onChangeText={setInputText}
              />
              <TouchableOpacity onPress={handleSend} disabled={loading}>
                <Ionicons name="arrow-forward" size={24} color="#FFA001" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0C0C0F',
  },
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  titleBar: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D38',
  },
  title: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
  },
  chat: {
    flex: 1,
    marginTop: 8,
  },
  bot: {
    backgroundColor: '#2A2A2F',
    borderRadius: 6,
    padding: 10,
    marginVertical: 4,
    color: '#FFFFFF',
  },
  user: {
    backgroundColor: '#3B3B47',
    borderRadius: 6,
    padding: 10,
    marginVertical: 4,
    alignSelf: 'flex-end',
    color: '#FFFFFF',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1E',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 14 : 8,
    marginTop: 8,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 8,
  },
});
