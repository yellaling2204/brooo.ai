import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, Plus, Clock, Calendar } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { api } from '../../lib/api';

export default function TasksScreen() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'today' | 'upcoming' | 'completed'>('today');
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const fetchTasks = async () => {
    try {
      const data = await api.get('/tasks');
      setTasks(data || []);
    } catch {
      setTasks([
        { id: '1', title: 'Prepare for Google System Design', is_completed: false, priority: 'urgent', due_date: new Date().toISOString() },
        { id: '2', title: 'Submit application for Stripe', is_completed: false, priority: 'high', due_date: new Date().toISOString() },
        { id: '3', title: 'Renew Car Insurance', is_completed: false, priority: 'medium', due_date: new Date(Date.now() + 86400000 * 5).toISOString() },
        { id: '4', title: 'Pay Electricity Bill', is_completed: true, priority: 'low' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const toggleTask = async (id: string, currentStatus: boolean) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_completed: !currentStatus } : t))
    );

    try {
      await api.patch(`/tasks/${id}`, { isCompleted: !currentStatus });
    } catch {
      // Revert if error
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, is_completed: currentStatus } : t))
      );
    }
  };

  const handleCreateTask = async () => {
    if (!newTitle.trim()) return;
    try {
      const created = await api.post('/tasks', { title: newTitle.trim() });
      setTasks((prev) => [created, ...prev]);
      setNewTitle('');
      setModalVisible(false);
    } catch {
      setTasks((prev) => [
        { id: Date.now().toString(), title: newTitle.trim(), is_completed: false, priority: 'medium' },
        ...prev,
      ]);
      setNewTitle('');
      setModalVisible(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'completed') return t.is_completed;
    if (filter === 'today') return !t.is_completed;
    return !t.is_completed;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>TASKS & REMINDERS</Text>
          <Text style={styles.subtitle}>Execution engine powered by brooo</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Plus size={20} color="#0B0F19" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        {(['today', 'upcoming', 'completed'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, filter === tab && styles.tabActive]}
            onPress={() => setFilter(tab)}
          >
            <Text style={[styles.tabText, filter === tab && styles.tabTextActive]}>
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {loading ? (
          <ActivityIndicator color="#00F2FE" style={{ marginTop: 40 }} />
        ) : filteredTasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tasks here brooo! You are on top of everything.</Text>
          </View>
        ) : (
          filteredTasks.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.taskCard, t.is_completed && styles.taskCardCompleted]}
              onPress={() => toggleTask(t.id, t.is_completed)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, t.is_completed && styles.checkboxActive]}>
                {t.is_completed && <Check size={14} color="#0B0F19" strokeWidth={3} />}
              </View>

              <View style={styles.taskInfo}>
                <Text style={[styles.taskTitle, t.is_completed && styles.taskTitleCompleted]}>
                  {t.title}
                </Text>
                {t.due_date && (
                  <View style={styles.deadlineContainer}>
                    <Clock size={12} color="#64748B" />
                    <Text style={styles.deadlineText}>
                      {new Date(t.due_date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Manual Task Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Task</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="What do you want to accomplish?"
              placeholderTextColor="#64748B"
              value={newTitle}
              onChangeText={setNewTitle}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createBtn} onPress={handleCreateTask}>
                <Text style={styles.createBtnText}>Create Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: '#00F2FE',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#161F30',
  },
  tabActive: {
    backgroundColor: '#00F2FE',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  tabTextActive: {
    color: '#0B0F19',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161F30',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#243248',
  },
  taskCardCompleted: {
    opacity: 0.5,
    backgroundColor: '#101726',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  checkboxActive: {
    backgroundColor: '#00F2FE',
    borderColor: '#00F2FE',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  deadlineText: {
    fontSize: 12,
    color: '#64748B',
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 15,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#161F30',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#243248',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#0B0F19',
    borderRadius: 12,
    padding: 14,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelBtnText: {
    color: '#94A3B8',
    fontWeight: '600',
  },
  createBtn: {
    backgroundColor: '#00F2FE',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  createBtnText: {
    color: '#0B0F19',
    fontWeight: '700',
  },
});

