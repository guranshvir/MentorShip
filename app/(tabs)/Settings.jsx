import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const Settings = () => {
  return (
    <SafeAreaView style={styles.container}>
       <View style={styles.titleBar}>
            <Text style={styles.title}><Ionicons
        name={"settings-outline"}
        size={24}
        style={{ marginBottom: 2 }}
      /> Calendar</Text>
          </View>

      <ScrollView style={styles.section}>
        <View style={styles.item}>
          <Text style={styles.itemText}>🧑 Profile</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.itemText}>🔔 Notifications</Text>
          <Switch value={true} />
        </View>
        <View style={styles.item}>
          <Text style={styles.itemText}>🌙 Dark Mode</Text>
          <Switch />
        </View>
        <TouchableOpacity style={styles.item}>
          <Text style={[styles.itemText, { color: '#FF5555' }]}>🚪 Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0C0F',
    padding: 20,
  },
  titleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D38', 
    borderColor: '#FFA001',
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
  }, 
  section: {
    marginTop: 10,
  },
  item: {
    backgroundColor: '#1E1E24',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: {
    color: '#fff',
    fontSize: 16,
  },
});
