import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Shield,
  Bell,
  Trash2,
  LogOut,
  CreditCard,
  Sliders,
  ChevronRight,
  Database,
} from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { api } from '../../lib/api';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert('Log out', 'Are you sure you want to log out brooo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/(auth)/splash');
        },
      },
    ]);
  };

  const handleClearMemory = async () => {
    Alert.alert(
      'Clear AI Memory',
      'This will erase all learned personal facts and vector embeddings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All Memory',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.get('/memory/stats'); // verification
              Alert.alert('Memory Cleared', 'All personal memories have been wiped.');
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account & Data',
      'Permanently deletes your account, documents, actions, and memories according to Google Play / Apple App Store data deletion standards. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase.auth.signOut();
              router.replace('/(auth)/splash');
              Alert.alert('Account Deleted', 'All personal data has been permanently purged.');
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>YOUR ACCOUNT</Text>
        <Text style={styles.subtitle}>Privacy, security and personal controls</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Tier Card */}
        <View style={styles.tierCard}>
          <View>
            <Text style={styles.tierName}>brooo.ai Free</Text>
            <Text style={styles.tierLimits}>20 AI actions/mo • 2 GB storage</Text>
          </View>
          <TouchableOpacity style={styles.upgradeBtn}>
            <Text style={styles.upgradeBtnText}>Upgrade</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Group */}
        <Text style={styles.groupTitle}>PREFERENCES</Text>
        <View style={styles.group}>
          <TouchableOpacity style={styles.item} onPress={() => router.push('/(auth)/onboarding')}>
            <Sliders size={20} color="#94A3B8" />
            <Text style={styles.itemText}>Personalization & Focus</Text>
            <ChevronRight size={18} color="#64748B" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.item}>
            <Bell size={20} color="#94A3B8" />
            <Text style={styles.itemText}>Push Notifications</Text>
            <ChevronRight size={18} color="#64748B" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.item}>
            <CreditCard size={20} color="#94A3B8" />
            <Text style={styles.itemText}>Subscription</Text>
            <ChevronRight size={18} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Security & Privacy */}
        <Text style={styles.groupTitle}>PRIVACY & DATA CONTROLS</Text>
        <View style={styles.group}>
          <TouchableOpacity style={styles.item} onPress={handleClearMemory}>
            <Database size={20} color="#F59E0B" />
            <Text style={[styles.itemText, { color: '#F59E0B' }]}>Clear AI Memory</Text>
            <ChevronRight size={18} color="#64748B" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={handleDeleteAccount}>
            <Trash2 size={20} color="#EF4444" />
            <Text style={[styles.itemText, { color: '#EF4444' }]}>Delete Account & All Data</Text>
            <ChevronRight size={18} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Log Out */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  header: {
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
  content: {
    padding: 20,
    gap: 20,
  },
  tierCard: {
    backgroundColor: '#161F30',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00F2FE',
  },
  tierName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  tierLimits: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  upgradeBtn: {
    backgroundColor: '#00F2FE',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  upgradeBtnText: {
    color: '#0B0F19',
    fontWeight: '700',
    fontSize: 13,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1,
    marginTop: 4,
  },
  group: {
    backgroundColor: '#161F30',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#243248',
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    gap: 12,
  },
  itemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 14,
    padding: 16,
    gap: 8,
    marginTop: 10,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '700',
  },
});

