import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';
import { useAuthStore } from '../../store/useAuthStore';

function AdminCard({ title, subtitle, emoji, onPress }: { title: string; subtitle: string; emoji: string; onPress: () => void }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={styles.cardEmoji}>{emoji}</Text>
      <View style={styles.cardText}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.arrow}>→</Text>
    </Pressable>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        <LinearGradient
          colors={[Colors.primaryDark, Colors.primary]}
          style={styles.headerBanner}
        >
          <Text style={styles.headerEmoji}>🛡️</Text>
          <Text style={styles.headerTitle}>Admin Portal</Text>
          <Text style={styles.headerSub}>Welcome back, {user?.name}</Text>
        </LinearGradient>

        <View style={styles.grid}>
          <AdminCard
            title="Manage Items"
            subtitle="Add, edit, or remove store products"
            emoji="🌿"
            onPress={() => router.push('/admin/items')}
          />
          <AdminCard
            title="Manage Orders"
            subtitle="View and update customer orders"
            emoji="📦"
            onPress={() => router.push('/admin/orders')}
          />
          <AdminCard
            title="View Reviews"
            subtitle="Monitor customer feedback"
            emoji="⭐"
            onPress={() => router.push('/reviews')}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, paddingBottom: 40 },
  headerBanner: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 24,
    ...Theme.shadow.md,
  },
  headerEmoji: { fontSize: 48, marginBottom: 8 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: Colors.white },
  headerSub: { fontSize: 15, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  grid: { paddingHorizontal: 16, gap: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: Theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    ...Theme.shadow.sm,
  },
  cardEmoji: { fontSize: 32, marginRight: 16 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: Colors.textMuted },
  arrow: { fontSize: 24, color: Colors.primary, fontWeight: '600' },
});