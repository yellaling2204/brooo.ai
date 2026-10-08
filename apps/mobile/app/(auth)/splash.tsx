import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SplashScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerContent}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>AI Life OS</Text>
        </View>
        <Text style={styles.title}>brooo.ai <Text style={styles.accent}>✦</Text></Text>
        <Text style={styles.tagline}>Your personal AI assistant for real life.</Text>
        <Text style={styles.subtext}>Send anything. Jobs, emails, bills, screenshots, and deadlines.</Text>
      </View>

      <View style={styles.bottomContent}>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.8}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
    justifyContent: 'space-between',
    padding: 24,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: 'rgba(0, 242, 254, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 20,
  },
  badgeText: {
    color: '#00F2FE',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  accent: {
    color: '#00F2FE',
  },
  tagline: {
    fontSize: 18,
    color: '#94A3B8',
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  subtext: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 280,
  },
  bottomContent: {
    paddingBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#00F2FE',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#00F2FE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#0B0F19',
    fontSize: 18,
    fontWeight: '700',
  },
});

