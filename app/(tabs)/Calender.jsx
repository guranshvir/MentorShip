import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  RefreshControl,
  View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import useGlobalStore from '../../constants/store';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const userId = 'user123';

const CalendarScreen = () => {
  const [taskData, setTaskData] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { refreshVersion } = useGlobalStore();

  const fetchTasks = async () => {
    try {
      setRefreshing(true);
      const res = await fetch(`http://192.168.1.81:8000/reminders/${userId}/by-date`);
      const data = await res.json();
      setTaskData(data);
    } catch (err) {
      console.error(err);
      setTaskData({});
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [refreshVersion]);

  const markedDates = Object.keys(taskData).reduce((acc, date) => {
    acc[date] = { marked: true, dotColor: '#FFA001' };
    return acc;
  }, {});

  const openModal = (dateStr) => {
    setSelectedDate(dateStr);
    setModalVisible(true);
  };

  return (
    <>
    <SafeAreaView style={styles.container}>
    <View style={styles.titleBar}>
      <Text style={styles.title}><Ionicons
              name={"calendar-outline"}
              size={24}
              style={{ marginBottom: 2 }}
            /> Calendar</Text>
    </View>
      <ScrollView
       
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchTasks}
            tintColor="#FFA001"
          />
        }
      >
        

        <Calendar
          markedDates={markedDates}
          onDayPress={(day) => openModal(day.dateString)}
          theme={{
            calendarBackground: '#0C0C0F',
            dayTextColor: '#fff',
            monthTextColor: '#FFA001',
            arrowColor: '#FFA001',
          }}
        />
      </ScrollView>
      </SafeAreaView>
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Tasks on {selectedDate}</Text>
            <ScrollView
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={fetchTasks}
                  tintColor="#FFA001"
                />
              }
            >
              {taskData[selectedDate]?.length > 0 ? (
                taskData[selectedDate].map((task, index) => (
                  <View key={index} style={styles.taskCard}>
                    <Text style={styles.taskGoal}>{task.goal}</Text>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskDesc}>{task.description}</Text>
                    <Text style={styles.taskTime}>🕒 {task.estimated_time}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noTasks}>No tasks found.</Text>
              )}
            </ScrollView>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeBtn}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default CalendarScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0C0F',
    paddingTop: 20,  // ensure space at top if SafeAreaView fallback fails
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBox: {
    backgroundColor: '#1E1E24',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    color: '#FFA001',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  taskCard: {
    backgroundColor: '#2D2D38',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  taskGoal: { color: '#FFA001', fontWeight: '600', marginBottom: 4 },
  taskTitle: { color: '#fff', fontWeight: '500' },
  taskDesc: { color: '#ccc', fontSize: 13, marginTop: 2 },
  taskTime: { color: '#aaa', fontSize: 12, marginTop: 2 },
  closeBtn: {
    color: '#FF5555',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: 'bold',
  },
  noTasks: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
});
