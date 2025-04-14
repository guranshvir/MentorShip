import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

const Index = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>👋 Welcome to Mentor</Text>
      <Text style={styles.subtitle}>
        Set goals, get daily guidance, and achieve more with a personal AI mentor.
      </Text>

      <Link href="/Home" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0C0F',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    color: '#FFA001',
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center', 
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#FFA001',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    elevation: 2,
  },
  buttonText: {
    color: '#0C0C0F',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
