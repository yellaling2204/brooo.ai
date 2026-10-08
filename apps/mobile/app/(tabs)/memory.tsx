import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Briefcase, FileText, Calendar, Sliders } from 'lucide-react-native';
import { api } from '../../lib/api';

export default function MemoryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    career: 34,
    documents: 18,
    dates: 12,
    preferences: 9,
    total: 73,
  });
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await api.get('/memory/stats');
      if (data) setStats(data);
    } catch {
      // Using initial mock stats
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const results = await api.get(`/memory?q=${encodeURIComponent(searchQuery)}`);
      setMemories(results || []);
    } catch {
      setMemories([
        { id: '1', category: 'career', value: 'Prefers Remote or Hybrid roles in Bangalore' },
        { id: '2', category: 'career', value: 'Key skills extracted: React Native, Node.js, TypeScript, AWS' },
        { id: '3', category: 'dates', value: 'Car insurance renewal due: 15 November 2026' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>BROOO REMEMBERS</Text>
        <Text style={styles.subtitle}>Your long-term second brain and personal knowledge base</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={18} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search anything brooo remembers..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
        </View>

        {/* Categories Grid */}
        <Text style={styles.sectionTitle}>CATEGORIES</Text>
        <View style={styles.grid}>
          <View style={styles.gridCard}>
            <Briefcase size={24} color="#00F2FE" />
            <Text style={styles.gridTitle}>Career</Text>
            <Text style={styles.gridCount}>{stats.career} memories</Text>
          </View>

          <View style={styles.gridCard}>
            <FileText size={24} color="#38BDF8" />
            <Text style={styles.gridTitle}>Documents</Text>
            <Text style={styles.gridCount}>{stats.documents} memories</Text>
          </View>

          <View style={styles.gridCard}>
            <Calendar size={24} color="#F59E0B" />
            <Text style={styles.gridTitle}>Important Dates</Text>
            <Text style={styles.gridCount}>{stats.dates} memories</Text>
          </View>

          <View style={styles.gridCard}>
            <Sliders size={24} color="#A855F7" />
            <Text style={styles.gridTitle}>Preferences</Text>
            <Text style={styles.gridCount}>{stats.preferences} memories</Text>
          </View>
        </View>

        {/* Search Results */}
        {loading && <ActivityIndicator color="#00F2FE" style={{ marginTop: 20 }} />}

        {memories.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.sectionTitle}>SEMANTIC SEARCH RESULTS</Text>
            {memories.map((m) => (
              <View key={m.id} style={styles.memoryItem}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{m.category.toUpperCase()}</Text>
                </View>
                <Text style={styles.memoryValue}>{m.value}</Text>
              </View>
            ))}
          </View>
        )}
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
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161F30',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#243248',
    marginBottom: 24,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#161F30',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#243248',
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
  },
  gridCount: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  resultsContainer: {
    marginTop: 24,
    gap: 10,
  },
  memoryItem: {
    backgroundColor: '#161F30',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#243248',
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 242, 254, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  tagText: {
    color: '#00F2FE',
    fontSize: 10,
    fontWeight: '700',
  },
  memoryValue: {
    color: '#F1F5F9',
    fontSize: 14,
    lineHeight: 20,
  },
});

