import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Image as ImageIcon, FileText, Send, Check, X, ShieldAlert } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { api } from '../../lib/api';

export default function InboxScreen() {
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [inputText, setInputText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchActions = async () => {
    try {
      const data = await api.get('/actions');
      setActions(data || []);
    } catch {
      // Fallback demo data
      setActions([
        {
          id: 'demo-1',
          type: 'application',
          title: 'Google - Senior Frontend Engineer',
          summary: '91% skill match. Application closes Friday at 5 PM.',
          priority: 'high',
          confidence: 0.94,
          status: 'pending',
          entities: { matchScore: '91%' },
        },
        {
          id: 'demo-2',
          type: 'renewal',
          title: 'Car Insurance Renewal',
          summary: 'Expires on 15 Nov 2026. Renewal required to avoid penalty.',
          priority: 'high',
          confidence: 0.98,
          status: 'pending',
        },
        {
          id: 'demo-3',
          type: 'appointment',
          title: 'Interview with Stripe',
          summary: 'Tomorrow at 11:00 AM via Google Meet.',
          priority: 'urgent',
          confidence: 0.99,
          status: 'pending',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const handleSendText = async () => {
    if (!inputText.trim()) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('type', 'text');
      formData.append('content', inputText);

      await api.upload(formData);
      setInputText('');
      setModalVisible(false);
      fetchActions();
      Alert.alert('Done brooo!', 'I analyzed your note and created your actions.');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSubmitting(true);
      try {
        const asset = result.assets[0];
        const formData = new FormData();
        formData.append('type', 'image');
        formData.append('file', {
          uri: asset.uri,
          name: 'screenshot.jpg',
          type: 'image/jpeg',
        } as any);

        await api.upload(formData);
        setModalVisible(false);
        fetchActions();
        Alert.alert('Done brooo!', 'Screenshot analyzed and actions created.');
      } catch (err: any) {
        Alert.alert('Upload Error', err.message);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handlePickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
    });

    if (!result.canceled && result.assets[0]) {
      setSubmitting(true);
      try {
        const asset = result.assets[0];
        const formData = new FormData();
        formData.append('type', 'pdf');
        formData.append('file', {
          uri: asset.uri,
          name: asset.name,
          type: 'application/pdf',
        } as any);

        await api.upload(formData);
        setModalVisible(false);
        fetchActions();
        Alert.alert('Done brooo!', 'Document extracted and stored in memory.');
      } catch (err: any) {
        Alert.alert('PDF Error', err.message);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleConfirmAction = async (id: string) => {
    try {
      await api.post(`/actions/${id}/confirm`, {});
      fetchActions();
      Alert.alert('Confirmed', 'Action converted to active task and reminder.');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleDismissAction = async (id: string) => {
    try {
      await api.patch(`/actions/${id}`, { status: 'dismissed' });
      fetchActions();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>AI ACTION INBOX</Text>
          <Text style={styles.subtitle}>Raw intelligence turned into clear actions</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Plus size={20} color="#0B0F19" />
          <Text style={styles.addButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {loading ? (
          <ActivityIndicator color="#00F2FE" style={{ marginTop: 40 }} />
        ) : actions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Your inbox is empty brooo. Tap + Send to drop anything here!</Text>
          </View>
        ) : (
          actions.map((act) => (
            <View key={act.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.typeTag}>
                  <Text style={styles.typeText}>{act.type.toUpperCase()}</Text>
                </View>
                {act.confidence && (
                  <Text style={styles.confidenceText}>
                    {Math.round(act.confidence * 100)}% confidence
                  </Text>
                )}
              </View>

              <Text style={styles.cardTitle}>{act.title}</Text>
              {act.summary && <Text style={styles.cardSummary}>{act.summary}</Text>}

              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={styles.dismissBtn}
                  onPress={() => handleDismissAction(act.id)}
                >
                  <X size={16} color="#94A3B8" />
                  <Text style={styles.dismissBtnText}>Dismiss</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={() => handleConfirmAction(act.id)}
                >
                  <Check size={16} color="#0B0F19" />
                  <Text style={styles.confirmBtnText}>Confirm Action</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Send to brooo Ingestion Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Send it to brooo ✦</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Paste email, interview note, message, or quick thought..."
              placeholderTextColor="#64748B"
              value={inputText}
              onChangeText={setInputText}
              multiline
              numberOfLines={4}
            />

            <View style={styles.uploadOptions}>
              <TouchableOpacity
                style={styles.uploadOptionBtn}
                onPress={handlePickImage}
                disabled={submitting}
              >
                <ImageIcon size={20} color="#00F2FE" />
                <Text style={styles.uploadOptionText}>Screenshot</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.uploadOptionBtn}
                onPress={handlePickDocument}
                disabled={submitting}
              >
                <FileText size={20} color="#00F2FE" />
                <Text style={styles.uploadOptionText}>PDF File</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalSubmitBtn}
              onPress={handleSendText}
              disabled={submitting || !inputText.trim()}
            >
              {submitting ? (
                <ActivityIndicator color="#0B0F19" />
              ) : (
                <>
                  <Send size={18} color="#0B0F19" style={{ marginRight: 8 }} />
                  <Text style={styles.modalSubmitText}>Analyze with brooo</Text>
                </>
              )}
            </TouchableOpacity>
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
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00F2FE',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  addButtonText: {
    color: '#0B0F19',
    fontWeight: '700',
    fontSize: 14,
  },
  list: {
    padding: 20,
    gap: 16,
  },
  card: {
    backgroundColor: '#161F30',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#243248',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeTag: {
    backgroundColor: 'rgba(0, 242, 254, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    color: '#00F2FE',
    fontSize: 11,
    fontWeight: '700',
  },
  confidenceText: {
    color: '#64748B',
    fontSize: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  cardSummary: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  dismissBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  dismissBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00F2FE',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  confirmBtnText: {
    color: '#0B0F19',
    fontSize: 13,
    fontWeight: '700',
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
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#161F30',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalInput: {
    backgroundColor: '#0B0F19',
    borderRadius: 14,
    padding: 14,
    color: '#FFFFFF',
    fontSize: 15,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#334155',
    minHeight: 100,
  },
  uploadOptions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  uploadOptionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  uploadOptionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00F2FE',
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 20,
  },
  modalSubmitText: {
    color: '#0B0F19',
    fontSize: 16,
    fontWeight: '700',
  },
});

