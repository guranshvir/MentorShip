import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Modal, TextInput, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import useGlobalStore from "../../constants/store";

const userId = 'user123';

const Goal = () => {
  const { goal } = useLocalSearchParams();
  const [tasks, setTasks] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { refreshVersion } = useGlobalStore();

  const [editingTask, setEditingTask] = useState(null);
  const [editFields, setEditFields] = useState({ title: '', description: '', estimated_time: '', date: '' });

  const fetchTasks = async () => {
    try {
      const encodedGoal = encodeURIComponent(goal);
      const response = await fetch(`http://192.168.1.81:8000/reminders/${userId}/${encodedGoal}`);
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error(err);
      setTasks([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [refreshVersion]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTasks();
  }, [refreshVersion]);

  const openEditModal = (task) => {
    setEditingTask(task);
    setEditFields({
      title: task.title,
      description: task.description,
      estimated_time: task.estimated_time,
      date: task.date,
    });
  };

  const submitEdit = async () => {
    try {
      const encodedGoal = encodeURIComponent(goal);
      await fetch(`http://192.168.1.81:8000/reminders/${userId}/${encodedGoal}/${editingTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFields),
      });
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  const toggleCompletion = async (task) => {
    try {
      const encodedGoal = encodeURIComponent(goal);
      await fetch(`http://192.168.1.81:8000/reminders/${userId}/${encodedGoal}/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed }),
      });
      fetchTasks();
    } catch (err) {
      console.error('Toggle completion failed', err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleBar}>
        <Text style={styles.title}>{goal}</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#FFA001" size="large" style={{ marginTop: 20 }} />
      ) : (
        <ScrollView
          style={{ marginTop: 10 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFA001" />
          }
        >
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                onPress={() => setExpandedId(expandedId === task.id ? null : task.id)}
              >
                <View style={styles.taskBox}>
                  <View style={styles.taskHeader}>
                    <TouchableOpacity onPress={() => toggleCompletion(task)}>
                      <Ionicons
                        name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
                        size={22}
                        color={task.completed ? '#00D1B2' : '#555'}
                        style={{ marginRight: 10 }}
                      />
                    </TouchableOpacity>
                    <Text style={styles.taskDate}>{task.date}</Text>
                    <Ionicons
                      name="create-outline"
                      size={20}
                      color="#FFA001"
                      onPress={() => openEditModal(task)}
                    />
                  </View>
                  {expandedId === task.id && (
                    <View style={{ marginTop: 6 }}>
                      <Text style={styles.taskTitle}>{task.title}</Text>
                      <Text style={styles.taskDesc}>{task.description}</Text>
                      <Text style={styles.taskTime}>🕒 {task.estimated_time}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noTasks}>No tasks found for this goal.</Text>
          )}
        </ScrollView>
      )}

      {/* Edit Modal */}
      <Modal visible={!!editingTask} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>✏️ Edit Task</Text>
            {['title', 'description', 'estimated_time', 'date'].map((field) => (
              <TextInput
                key={field}
                placeholder={field}
                placeholderTextColor="#888"
                value={editFields[field]}
                onChangeText={(val) => setEditFields({ ...editFields, [field]: val })}
                multiline={field === 'description'}
                numberOfLines={field === 'description' ? 4 : 1}
                style={[
                  styles.modalInput,
                  field === 'description' && { height: 100, textAlignVertical: 'top' },
                ]}
              />
            ))}
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setEditingTask(null)}>
                <Text style={styles.cancelBtn}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={submitEdit}>
                <Text style={styles.saveBtn}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Goal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0C0F',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  titleBar: {
    flexDirection: 'row',
    justifyContent: 'justify-start',
    alignItems: 'center',
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D38',
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
    
  },
  taskBox: {
    backgroundColor: '#1E1E24',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  taskDate: {
    fontSize: 16,
    color: '#FFA001',
    fontWeight: '500',
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    marginTop: 6,
  },
  taskDesc: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
  taskTime: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 6,
  },
  noTasks: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
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
  modalInput: {
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
