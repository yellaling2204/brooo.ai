import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

const INTERESTS = [
  { id: 'career', label: 'Career & Jobs', icon: '🎓', desc: 'Resumes, applications, interview preparation' },
  { id: 'productivity', label: 'Productivity', icon: '⚡', desc: 'Action extraction, deadlines, tasks' },
  { id: 'documents', label: 'Documents', icon: '📂', desc: 'Certificates, receipts, insurance policies' },
  { id: 'money', label: 'Money & Bills', icon: '💳', desc: 'Subscriptions, utilities, due dates' },
  { id: 'safety', label: 'Safety & Scam Shield', icon: '🛡️', desc: 'Phishing checks, fake job detection' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(['career', 'productivity']);
  const [saving, setSaving] = useState(false);

  const toggleInterest = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleContinue = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('profiles')
        .update({
          interests: selected,
          is_onboarded: true,
        })
        .eq('id', user.id);
    }
    setSaving(false);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.badge}>Step 2 of 2</Text>
          <Text style={styles.title}>What should brooo help you with?</Text>
          <Text style={styles.subtitle}>Choose what matters most right now. You can change this anytime.</Text>
        </View>

        <View style={styles.list}>
          {INTERESTS.map((item) => {
            const isChecked = selected.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.card, isChecked && styles.cardActive]}
                onPress={() => toggleInterest(item.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.cardIcon}>{item.icon}</Text>
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardTitle, isChecked && styles.cardTitleActive]}>
                    {item.label}
                  </Text>
                  <Text style={styles.cardDesc}>{item.desc}</Text>
                </View>
                <View style={[styles.checkbox, isChecked && styles.checkboxActive]}>
                  {isChecked && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          disabled={saving}
        >
          <Text style={styles.continueButtonText}>
            {saving ? 'Setting up brooo...' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  badge: {
    color: '#00F2FE',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#94A3B8',
    marginTop: 8,
    lineHeight: 22,
  },
  list: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161F30',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#243248',
  },
  cardActive: {
    borderColor: '#00F2FE',
    backgroundColor: '#13283E',
  },
  cardIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardTitleActive: {
    color: '#00F2FE',
  },
  cardDesc: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#00F2FE',
    borderColor: '#00F2FE',
  },
  checkmark: {
    color: '#0B0F19',
    fontSize: 14,
    fontWeight: '800',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  continueButton: {
    backgroundColor: '#00F2FE',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#0B0F19',
    fontSize: 16,
    fontWeight: '700',
  },
});

