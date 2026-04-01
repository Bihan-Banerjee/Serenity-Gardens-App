import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';
import { useAuthStore } from '../../store/useAuthStore';
import { ordersAPI } from '../../lib/api';

interface Order {
  _id: string;
  createdAt: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  status: string;
}

const STATUS_CONFIG = {
  paid: { label: 'Paid', color: Colors.success, emoji: '✅' },
  pending: { label: 'Pending', color: Colors.warning, emoji: '⏳' },
  failed: { label: 'Failed', color: Colors.error, emoji: '❌' },
};

function OrderCard({ order }: { order: Order }) {
  const status =
    STATUS_CONFIG[order.paymentStatus] || STATUS_CONFIG.pending;
  const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>
            #{order._id.slice(-6).toUpperCase()}
          </Text>
          <Text style={styles.orderDate}>{date}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: status.color + '22' },
          ]}
        >
          <Text style={styles.statusEmoji}>{status.emoji}</Text>
          <Text style={[styles.statusText, { color: status.color }]}>
            {status.label}
          </Text>
        </View>
      </View>
      <View style={styles.orderDivider} />
      {order.items.map((item, i) => (
        <View key={i} style={styles.orderItem}>
          <Text style={styles.orderItemName}>
            {item.quantity}× {item.name}
          </Text>
          <Text style={styles.orderItemPrice}>
            ₹{((item.price || 0) * (item.quantity || 1)).toFixed(0)}
          </Text>
        </View>
      ))}
      <View style={styles.orderDivider} />
      <View style={styles.orderTotal}>
        <Text style={styles.orderTotalLabel}>Total</Text>
        <Text style={styles.orderTotalAmount}>₹{(order.total || (order as any).totalAmount || 0).toFixed(2)}</Text>
      </View>
    </View>
  );
}

function AuthedProfile() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI
      .getMyOrders()
      .then((res) => {
        const validOrders = res.data.filter(
          (o: any) => o.paymentStatus === 'paid' || o.paymentMethod === 'cod'
        );
        setOrders(validOrders);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const initials = user?.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const router = useRouter();
  return (
    <ScrollView
      style={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar Header */}
      <LinearGradient
        colors={[Colors.primaryDark, Colors.primary, Colors.primaryLight]}
        style={styles.avatarBanner}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.avatarName}>{user?.name}</Text>
        <Text style={styles.avatarEmail}>{user?.email}</Text>
        {user?.isAdmin && (
          <Pressable 
            style={styles.adminBadge} 
            onPress={() => router.push('/admin')} // Routes to your admin folder
          >
            <Text style={styles.adminBadgeText}>⚡ Go to Admin Portal</Text>
          </Pressable>
        )}
      </LinearGradient>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        {[
          { label: 'Total Orders', value: orders.length },
          {
            label: 'Spent',
            value: `₹${orders.reduce((s, o) => s + (o.total || (orders as any).totalAmount || 0), 0).toFixed(0)}`,
          },
          {
            label: 'Member Since',
            value: new Date().getFullYear().toString(),
          },
        ].map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Orders */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order History</Text>
        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 24 }} />
        ) : orders.length === 0 ? (
          <View style={styles.emptyOrders}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyText}>No orders yet</Text>
            <Text style={styles.emptySub}>
              Browse our shop and place your first order!
            </Text>
          </View>
        ) : (
          orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))
        )}
      </View>

      {/* Sign Out */}
      <View style={styles.section}>
        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>
      </View>
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

function GuestProfile() {
  const router = useRouter();
  return (
    <View style={styles.guestContainer}>
      <LinearGradient
        colors={[Colors.background, Colors.backgroundDark]}
        style={styles.guestBanner}
      >
        <Text style={styles.guestEmoji}>🌿</Text>
        <Text style={styles.guestTitle}>Hello, Visitor!</Text>
        <Text style={styles.guestSubtitle}>
          Sign in to view your orders, manage your profile, and shop with ease.
        </Text>
      </LinearGradient>

      <View style={styles.guestActions}>
        <Pressable
          style={styles.signInBtn}
          onPress={() => router.push('/login')}
        >
          <LinearGradient
            colors={[Colors.primaryLight, Colors.primary]}
            style={styles.signInGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.signInText}>Sign In</Text>
          </LinearGradient>
        </Pressable>
        <Pressable
          style={styles.registerBtn}
          onPress={() => router.push('/register')}
        >
          <Text style={styles.registerText}>Create Account</Text>
        </Pressable>
      </View>

      {/* Guest features */}
      <View style={styles.featureList}>
        {[
          '🛒 Add items to cart',
          '📦 Track your orders',
          '⭐ Leave reviews',
          '🔁 Repeat past orders',
        ].map((item) => (
          <View key={item} style={styles.featureRow}>
            <Text style={styles.featureItem}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>Serenity Gardens</Text>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>
      {isAuthenticated ? <AuthedProfile /> : <GuestProfile />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },

  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  headerLabel: {
    fontSize: 11,
    color: Colors.secondary,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.4,
  },

  // Authenticated
  avatarBanner: {
    margin: 16,
    borderRadius: Theme.borderRadius.xl,
    padding: 28,
    alignItems: 'center',
    ...Theme.shadow.md,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 26, fontWeight: '800', color: Colors.white },
  avatarName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 4,
  },
  avatarEmail: { fontSize: 14, color: 'rgba(255,255,255,0.72)', marginBottom: 8 },
  adminBadge: {
    backgroundColor: Colors.accent,
    borderRadius: Theme.borderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  adminBadgeText: { color: Colors.white, fontWeight: '800', fontSize: 12 },

  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 10,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Theme.borderRadius.lg,
    padding: 14,
    alignItems: 'center',
    ...Theme.shadow.sm,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  statValue: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  statLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },

  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 14,
  },

  orderCard: {
    backgroundColor: Colors.card,
    borderRadius: Theme.borderRadius.lg,
    padding: 16,
    marginBottom: 12,
    ...Theme.shadow.sm,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderId: { fontSize: 14, fontWeight: '800', color: Colors.text },
  orderDate: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: Theme.borderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusEmoji: { fontSize: 11 },
  statusText: { fontSize: 12, fontWeight: '700' },
  orderDivider: {
    height: 1,
    backgroundColor: Colors.cardBorder,
    marginVertical: 10,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  orderItemName: { fontSize: 13, color: Colors.textSecondary },
  orderItemPrice: { fontSize: 13, color: Colors.text, fontWeight: '600' },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotalLabel: { fontSize: 14, color: Colors.textSecondary },
  orderTotalAmount: { fontSize: 18, fontWeight: '800', color: Colors.primary },

  emptyOrders: { alignItems: 'center', paddingVertical: 32 },
  emptyEmoji: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 17, fontWeight: '700', color: Colors.text },
  emptySub: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },

  logoutBtn: {
    borderWidth: 1.5,
    borderColor: Colors.error,
    borderRadius: Theme.borderRadius.full,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: { color: Colors.error, fontWeight: '700', fontSize: 15 },

  // Guest
  guestContainer: { flex: 1, padding: 16 },
  guestBanner: {
    borderRadius: Theme.borderRadius.xl,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
    ...Theme.shadow.sm,
  },
  guestEmoji: { fontSize: 52, marginBottom: 12 },
  guestTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },
  guestActions: { gap: 10, marginBottom: 24 },
  signInBtn: { borderRadius: Theme.borderRadius.full, overflow: 'hidden' },
  signInGradient: { paddingVertical: 15, alignItems: 'center' },
  signInText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  registerBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: Theme.borderRadius.full,
    paddingVertical: 14,
    alignItems: 'center',
  },
  registerText: { color: Colors.primary, fontWeight: '700', fontSize: 16 },
  featureList: {
    backgroundColor: Colors.card,
    borderRadius: Theme.borderRadius.lg,
    padding: 16,
    gap: 12,
    ...Theme.shadow.sm,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  featureRow: { flexDirection: 'row', alignItems: 'center' },
  featureItem: { fontSize: 15, color: Colors.textSecondary },
});
