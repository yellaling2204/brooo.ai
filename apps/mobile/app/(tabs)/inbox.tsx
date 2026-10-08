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
import {
  Plus,
  Image as ImageIcon,
  FileText,
  Send,
  Check,
  X,
  ShieldAlert,
  Sparkles,
  Calendar,
  Clock,
  Briefcase,
  AlertCircle,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { api } from '../../lib/api';

type ProcessingStep =
  | 'idle'
  | 'uploading'
  | 'reading'
  | 'understanding'
  | 'creating'
  | 'done';

const STEP_LABELS: Record<ProcessingStep, string> = {
  idle: '',
  uploading: '📤 Uploading screenshot...',
  reading: '🔎 brooo is reading it...',
  understanding: '🧠 Understanding context & entities...',
  creating: '⚡ Creating actions & memory...',
  done: '✅ Done brooo!',
};

export default function InboxScreen() {
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [inputText, setInputText] = useState('');
  
  // Multi-step processing animation states
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle');
  const [isProcessing, setIsProcessing] = useState(false);

  // Extracted result preview card
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [latestResult, setLatestResult] = useState<any>(null);

  const fetchActions = async () => {
    try {
      const data = await api.get('/actions');
      setActions(data || []);
    } catch {
      // Fallback local items if offline
      setActions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const runWithProcessingSteps = async (task: () => Promise<any>) => {
    setIsProcessing(true);
    setProcessingStep('uploading');

    try {
      // Step 1: Uploading
      await new Promise((r) => setTimeout(r, 450));
      setProcessingStep('reading');

      // Step 2: Reading
      await new Promise((r) => setTimeout(r, 550));
      setProcessingStep('understanding');

      // Run actual backend extraction task
      const result = await task();

      // Step 3: Creating actions
      setProcessingStep('creating');
      await new Promise((r) => setTimeout(r, 450));

      // Step 4: Done
      setProcessingStep('done');
      await new Promise((r) => setTimeout(r, 500));

      setIsProcessing(false);
      setProcessingStep('idle');
      setModalVisible(false);

      if (result) {
        setLatestResult(result);
        setResultModalVisible(true);
      }

      fetchActions();
    } catch (err: any) {
      setIsProcessing(false);
      setProcessingStep('idle');
      Alert.alert('Processing Error', err.message || 'Failed to process input');
    }
  };

  const handleSendText = async () => {
    if (!inputText.trim()) return;
    const textToSend = inputText;
    setInputText('');

    await runWithProcessingSteps(async () => {
      const formData = new FormData();
      formData.append('type', 'text');
      formData.append('content', textToSend);
      return await api.upload(formData);
    });
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];

      await runWithProcessingSteps(async () => {
        if (asset.base64) {
          // Direct base64 API call
          return await api.post('/inbox/send', {
            type: 'image',
            imageBase64: asset.base64,
            imageMimeType: asset.mimeType || 'image/jpeg',
          });
        } else {
          // Multi-part fallback
          const formData = new FormData();
          formData.append('type', 'image');
          formData.append('file', {
            uri: asset.uri,
            name: 'screenshot.jpg',
            type: asset.mimeType || 'image/jpeg',
          } as any);
          return await api.upload(formData);
        }
      });
    }
  };

  const handlePickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      await runWithProcessingSteps(async () => {
        const formData = new FormData();
        formData.append('type', 'pdf');
        formData.append('file', {
          uri: asset.uri,
          name: asset.name,
          type: 'application/pdf',
        } as any);
        return await api.upload(formData);
      });
    }
  };

  const handleConfirmAction = async (id: string) => {
    try {
      await api.post(`/actions/${id}/confirm`, {});
      fetchActions();
      setResultModalVisible(false);
      Alert.alert('Confirmed brooo! 🚀', 'Task and reminder have been created.');
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

  const primaryAction = latestResult?.actions?.[0];

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
            <Sparkles size={40} color="#64748B" style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>Inbox is all clear brooo!</Text>
            <Text style={styles.emptyText}>
              Tap <Text style={{ color: '#00F2FE', fontWeight: 'bold' }}>+ Send</Text> to drop a text note, screenshot, or PDF.
            </Text>
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

              {act.entities && (
                <View style={styles.entitiesRow}>
                  {act.entities.date && (
                    <View style={styles.badge}>
                      <Calendar size={12} color="#00F2FE" />
                      <Text style={styles.badgeText}>{act.entities.date}</Text>
                    </View>
                  )}
                  {act.entities.time && (
                    <View style={styles.badge}>
                      <Clock size={12} color="#00F2FE" />
                      <Text style={styles.badgeText}>{act.entities.time}</Text>
                    </View>
                  )}
                  {act.entities.company && (
                    <View style={styles.badge}>
                      <Briefcase size={12} color="#10B981" />
                      <Text style={[styles.badgeText, { color: '#10B981' }]}>
                        {act.entities.company}
                      </Text>
                    </View>
                  )}
                </View>
              )}

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

      {/* 1. Send to brooo Selection Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Send it to brooo ✦</Text>
                <Text style={styles.modalSubtitle}>Drop anything — I'll understand and organize it</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Paste text note, interview message, email, or thought..."
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
                disabled={isProcessing}
              >
                <ImageIcon size={22} color="#00F2FE" />
                <Text style={styles.uploadOptionText}>📸 Screenshot</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.uploadOptionBtn}
                onPress={handlePickDocument}
                disabled={isProcessing}
              >
                <FileText size={22} color="#00F2FE" />
                <Text style={styles.uploadOptionText}>📄 PDF Document</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalSubmitBtn}
              onPress={handleSendText}
              disabled={isProcessing || !inputText.trim()}
            >
              <Send size={18} color="#0B0F19" style={{ marginRight: 8 }} />
              <Text style={styles.modalSubmitText}>Analyze Text with brooo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 2. Polish Processing States Modal (Step 7) */}
      <Modal visible={isProcessing} transparent animationType="fade">
        <View style={styles.processingOverlay}>
          <View style={styles.processingCard}>
            <ActivityIndicator size="large" color="#00F2FE" style={{ marginBottom: 20 }} />
            <Text style={styles.processingTitle}>BROOO AT WORK</Text>
            <Text style={styles.processingStepText}>
              {STEP_LABELS[processingStep] || 'Processing...'}
            </Text>
            <View style={styles.progressDotsContainer}>
              {['uploading', 'reading', 'understanding', 'creating', 'done'].map((step, idx) => {
                const isActive = step === processingStep;
                return (
                  <View
                    key={idx}
                    style={[
                      styles.progressDot,
                      isActive && styles.progressDotActive,
                    ]}
                  />
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* 3. "🤖 BROOO FOUND SOMETHING" Result Card Modal (Step 6 & 8) */}
      <Modal visible={resultModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.resultModalContent]}>
            <View style={styles.resultHeader}>
              {latestResult?.isSuspicious ? (
                <View style={styles.scamBanner}>
                  <ShieldAlert size={24} color="#EF4444" />
                  <Text style={styles.scamBannerText}>🚨 BROOO DETECTED A SCAM RISK</Text>
                </View>
              ) : (
                <View style={styles.successBanner}>
                  <Sparkles size={24} color="#00F2FE" />
                  <Text style={styles.successBannerText}>🤖 BROOO FOUND SOMETHING</Text>
                </View>
              )}
              <TouchableOpacity onPress={() => setResultModalVisible(false)}>
                <X size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* Conversational Brooo Personality Message */}
            <View style={styles.broooBubble}>
              <Text style={styles.broooBubbleText}>
                {latestResult?.broooMessage || latestResult?.summary || 'Got it brooo! Actions created.'}
              </Text>
            </View>

            {/* Extracted Details Card */}
            {primaryAction && (
              <View style={styles.extractedCard}>
                <View style={styles.extractedCategoryRow}>
                  <Text style={styles.extractedCategory}>
                    {(latestResult?.category || 'ACTION').toUpperCase()}
                  </Text>
                  <Text
                    style={[
                      styles.extractedPriority,
                      primaryAction.priority === 'urgent' || primaryAction.priority === 'high'
                        ? { color: '#EF4444' }
                        : { color: '#F59E0B' },
                    ]}
                  >
                    PRIORITY: {primaryAction.priority.toUpperCase()}
                  </Text>
                </View>

                <Text style={styles.extractedTitle}>{primaryAction.title}</Text>

                {primaryAction.entities && (
                  <View style={styles.extractedMeta}>
                    {primaryAction.entities.date && (
                      <View style={styles.metaRow}>
                        <Calendar size={14} color="#00F2FE" />
                        <Text style={styles.metaText}>
                          {primaryAction.entities.date} {primaryAction.entities.time || ''}
                        </Text>
                      </View>
                    )}
                    {primaryAction.entities.company && (
                      <View style={styles.metaRow}>
                        <Briefcase size={14} color="#10B981" />
                        <Text style={styles.metaText}>{primaryAction.entities.company}</Text>
                      </View>
                    )}
                  </View>
                )}

                {primaryAction.entities?.requirements && (
                  <View style={styles.focusContainer}>
                    <Text style={styles.focusHeader}>Focus Areas:</Text>
                    {(Array.isArray(primaryAction.entities.requirements)
                      ? primaryAction.entities.requirements
                      : [primaryAction.entities.requirements]
                    ).map((req: string, idx: number) => (
                      <Text key={idx} style={styles.focusItem}>• {req}</Text>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.resultActions}>
              {primaryAction && (
                <TouchableOpacity
                  style={styles.createTaskBtn}
                  onPress={() => handleConfirmAction(primaryAction.id)}
                >
                  <Check size={18} color="#0B0F19" style={{ marginRight: 6 }} />
                  <Text style={styles.createTaskBtnText}>Create Task & Set Reminder</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.viewInboxBtn}
                onPress={() => setResultModalVisible(false)}
              >
                <Text style={styles.viewInboxBtnText}>Done brooo 👍</Text>
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
    marginBottom: 12,
  },
  entitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  badgeText: {
    color: '#00F2FE',
    fontSize: 12,
    fontWeight: '600',
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
    marginTop: 80,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#161F30',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  resultModalContent: {
    maxHeight: '90%',
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
  modalSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
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
    minHeight: 90,
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
    paddingVertical: 14,
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
  processingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  processingCard: {
    backgroundColor: '#161F30',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 242, 254, 0.3)',
  },
  processingTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  processingStepText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  progressDotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#334155',
  },
  progressDotActive: {
    backgroundColor: '#00F2FE',
    width: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  successBannerText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#00F2FE',
    letterSpacing: 0.5,
  },
  scamBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scamBannerText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#EF4444',
  },
  broooBubble: {
    backgroundColor: '#0B0F19',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  broooBubbleText: {
    color: '#F1F5F9',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  extractedCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  extractedCategoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  extractedCategory: {
    color: '#00F2FE',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  extractedPriority: {
    fontSize: 11,
    fontWeight: '800',
  },
  extractedTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
  },
  extractedMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  focusContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  focusHeader: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  focusItem: {
    color: '#E2E8F0',
    fontSize: 13,
    lineHeight: 18,
  },
  resultActions: {
    gap: 10,
  },
  createTaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00F2FE',
    paddingVertical: 14,
    borderRadius: 12,
  },
  createTaskBtnText: {
    color: '#0B0F19',
    fontSize: 15,
    fontWeight: '800',
  },
  viewInboxBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  viewInboxBtnText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
});
