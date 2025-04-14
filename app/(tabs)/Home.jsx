import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert, TextInput, Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import useGlobalStore from "../../constants/store";
import { Ionicons } from '@expo/vector-icons';

const userId = 'user123';

const Home = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState('');
  const [newGoalName, setNewGoalName] = useState('');
  const router = useRouter();
  const { refreshVersion, incrementRefresh } = useGlobalStore();

  const fetchGoals = async () => {
    try {
      const res = await fetch(`http://192.168.1.81:8000/reminders/${userId}`);
      const data = await res.json();
      setGoals(data);
    } catch (err) {
      console.error(err);
      setGoals([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchGoals();
  }, [refreshVersion]);

  const handleDelete = async (goal) => {
    Alert.alert(
      "Confirm Delete",
      `Delete goal '${goal}'?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const res = await fetch(
              `http://192.168.1.81:8000/reminders/${userId}/${encodeURIComponent(goal)}`,
              { method: 'DELETE' }
            );
            if (res.ok) fetchGoals();
            incrementRefresh();
          }
        }
      ]
    );
  };

  const handleDeleteAll = async () => {
    Alert.alert(
      "Delete All Goals",
      "Are you sure you want to delete all your goals?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            const res = await fetch(`http://192.168.1.81:8000/reminders/${userId}`, { method: 'DELETE' });
            if (res.ok) fetchGoals();
            incrementRefresh();
          }
        }
      ]
    );
  };

  const handleRename = async () => {
    if (!newGoalName.trim()) return;
    const res = await fetch(`http://192.168.1.81:8000/reminders/${userId}/rename`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ old_name: selectedGoal, new_name: newGoalName }),
    });
    if (res.ok) {
      setShowRenameModal(false);
      setNewGoalName('');
      fetchGoals();
      incrementRefresh();
    } else {
      Alert.alert("Rename failed", "Try a different name.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>🎯 Goals</Text>
        <TouchableOpacity onPress={handleDeleteAll}>
          <Ionicons name="trash-outline" size={22} color="#FF5555" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#FFA001" size="large" />
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFA001" />
          }
        >
          {goals.map((goal) => (
            <View key={goal} style={styles.goalBox}>
              <TouchableOpacity onPress={() => router.push(`/goal/${encodeURIComponent(goal)}`)}>
                <Text style={styles.goalText}>{goal}</Text>
              </TouchableOpacity>
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedGoal(goal);
                    setNewGoalName(goal);
                    setShowRenameModal(true);
                  }}
                >
                  <Ionicons name="create-outline" size={20} color="#FFA001" style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(goal)}>
                  <Ionicons name="trash-outline" size={20} color="#FF5555" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Rename Modal */}
      <Modal visible={showRenameModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>✏️ Rename Goal</Text>
            <TextInput
              style={styles.input}
              placeholder="New goal name"
              placeholderTextColor="#888"
              value={newGoalName}
              onChangeText={setNewGoalName}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowRenameModal(false)}>
                <Text style={styles.cancelBtn}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleRename}>
                <Text style={styles.saveBtn}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0C0F',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
  },
  goalBox: {
    backgroundColor: '#1E1E24',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalText: {
    fontSize: 18,
    color: '#FFA001',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#1E1E24',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    color: '#FFA001',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#2A2A2F',
    borderRadius: 6,
    padding: 10,
    color: '#fff',
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    color: '#FF5555',
    fontWeight: '500',
  },
  saveBtn: {
    color: '#00D1B2',
    fontWeight: '500',
  },
});
