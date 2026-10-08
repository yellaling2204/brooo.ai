import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles, ArrowRight, Clock, AlertTriangle } from 'lucide-react-native';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';

export default function HomeScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('Friend');
  const [urgentActions, setUrgentActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();
        if (profile?.name) setUserName(profile.name);
      }

      const actions = await api.get('/actions?status=pending&limit=3');
      setUrgentActions(actions || []);
    } catch {
      // Fallback local items if offline
      setUrgentActions([
        {
          id: 'demo-1',
          title: 'Google Interview scheduled',
          priority: 'urgent',
          deadline: new Date(Date.now() + 86400000).toISOString(),
          type: 'appointment',
        },
        {
          id: 'demo-2',
          title: 'Renew Car Insurance',
          priority: 'high',
          deadline: new Date(Date.now() + 86400000 * 4).toISOString(),
          type: 'renewal',
        },
        {
          id: 'demo-3',
          title: 'Frontend Role Application closes',
          priority: 'medium',
          deadline: new Date(Date.now() + 86400000 * 2).toISOString(),
          type: 'application',
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      default:
        return '#10B981';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00F2FE" />}
      >
        {/* Header Greeting */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Good morning, {userName} 👋</Text>
          <Text style={styles.subGreeting}>I'm brooo. What's up?</Text>
        </View>

        {/* Ask brooo Omni Bar */}
        <TouchableOpacity
          style={styles.omniBar}
          activeOpacity={0.8}
          onPress={() => router.push('/chat')}
        >
          <Sparkles size={20} color="#00F2FE" style={styles.omniIcon} />
          <Text style={styles.omniText}>Ask brooo anything... 🎤</Text>
        </TouchableOpacity>

        {/* TODAY Radar Card */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TODAY</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/inbox')}>
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.radarCard}>
          {loading ? (
            <ActivityIndicator color="#00F2FE" style={{ padding: 20 }} />
          ) : urgentActions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>All clear brooo! 🎉 No urgent deadlines today.</Text>
            </View>
          ) : (
            <View style={styles.actionsList}>
              {urgentActions.map((act) => (
                <View key={act.id} style={styles.actionItem}>
                  <View
                    style={[
                      styles.priorityDot,
                      { backgroundColor: getPriorityColor(act.priority) },
                    ]}
                  />
                  <View style={styles.actionContent}>
                    <Text style={styles.actionTitle}>{act.title}</Text>
                    {act.deadline && (
                      <View style={styles.deadlineContainer}>
                        <Clock size={12} color="#94A3B8" />
                        <Text style={styles.deadlineText}>
                          {new Date(act.deadline).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>
                    )}
                  </View>
                  <ArrowRight size={16} color="#64748B" />
                </View>
              ))}

              <View style={styles.radarFooter}>
                <Text style={styles.radarFooterText}>
                  {urgentActions.length} things need your attention
                </Text>
                <TouchableOpacity
                  style={styles.radarButton}
                  onPress={() => router.push('/(tabs)/inbox')}
                >
                  <Text style={styles.radarButtonText}>Review Inbox</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Quick Send Banner */}
        <View style={styles.quickSendBanner}>
          <View style={styles.quickSendTextContainer}>
            <Text style={styles.quickSendTitle}>Got a screenshot or PDF?</Text>
            <Text style={styles.quickSendSubtitle}>Send it to brooo and consider it handled.</Text>
          </View>
          <TouchableOpacity
            style={styles.quickSendBtn}
            onPress={() => router.push('/(tabs)/inbox')}
          >
            <Text style={styles.quickSendBtnText}>+ Send</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subGreeting: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '500',
  },
  omniBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161F30',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 242, 254, 0.25)',
    marginBottom: 28,
  },
  omniIcon: {
    marginRight: 12,
  },
  omniText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00F2FE',
  },
  radarCard: {
    backgroundColor: '#131B2E',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#243248',
    padding: 18,
    marginBottom: 24,
  },
  actionsList: {
    gap: 14,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 14,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  deadlineText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  radarFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  radarFooterText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  radarButton: {
    backgroundColor: 'rgba(0, 242, 254, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  radarButtonText: {
    color: '#00F2FE',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  quickSendBanner: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#334155',
  },
  quickSendTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  quickSendTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  quickSendSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  quickSendBtn: {
    backgroundColor: '#00F2FE',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  quickSendBtnText: {
    color: '#0B0F19',
    fontWeight: '700',
    fontSize: 14,
  },
});

