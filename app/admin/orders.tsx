import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';
import { adminOrdersAPI } from '../../lib/api';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await adminOrdersAPI.getAllAdmin(); 
      setOrders(res.data);
    } catch (err) {
      Alert.alert('Error', 'Could not load orders.');
    } finally {
      setLoading(false);
    }
  };

  const togglePaymentStatus = async (orderId: string, currentPaidStatus: boolean) => {
    Alert.alert(
      'Update Payment Status', 
      `Mark this order as ${currentPaidStatus ? 'UNPAID' : 'PAID'}?`, 
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: async () => {
            try {
              // Calls PATCH /orders/:id with { paid: boolean }
              await adminOrdersAPI.updatePaymentStatus(orderId, !currentPaidStatus);
              fetchOrders();
            } catch (err) {
              Alert.alert('Error', 'Failed to update payment status');
            }
          }
        }
      ]
    );
  };

  const handleDelete = async (orderId: string) => {
    Alert.alert('Delete Order', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await adminOrdersAPI.delete(orderId);
            fetchOrders();
          } catch (err) { Alert.alert('Error', 'Failed to delete order'); }
        }
      }
    ])
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order Management</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} size="large" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16, gap: 16 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.orderId}>Order #{item._id.slice(-6).toUpperCase()}</Text>
                
                <View style={[styles.badge, { backgroundColor: item.paid ? Colors.success + '22' : Colors.error + '22' }]}>
                  <Text style={[styles.badgeText, { color: item.paid ? Colors.success : Colors.error }]}>
                    {item.paid ? 'PAID' : 'PENDING'}
                  </Text>
                </View>
              </View>

              <Text style={styles.customerName}>👤 {item.userId?.name || 'Unknown User'}</Text>
              <Text style={styles.customerDetails}>✉️ {item.userId?.email || 'No email'}</Text>
              
              {item.razorpayPaymentId && (
                <Text style={styles.customerDetails}>💳 TXN: {item.razorpayPaymentId}</Text>
              )}

              <View style={styles.divider} />
              
              <Text style={styles.itemsTitle}>Items ({item.items?.length}):</Text>
              {item.items?.map((i: any, idx: number) => (
                <Text key={idx} style={styles.itemRow}>
                  {i.quantity}x {i.name || i.id} - ₹{i.price}
                </Text>
              ))}

              <View style={styles.divider} />

              <View style={styles.footer}>
                <Text style={styles.total}>₹{item.totalAmount?.toFixed(2)}</Text>
                
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Pressable 
                    style={[styles.updateBtn, { backgroundColor: item.paid ? Colors.textMuted : Colors.primary }]} 
                    onPress={() => togglePaymentStatus(item._id, item.paid)}
                  >
                    <Text style={styles.updateBtnText}>
                      Mark {item.paid ? 'Unpaid' : 'Paid'}
                    </Text>
                  </Pressable>

                  <Pressable style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
                    <Text style={styles.deleteBtnText}>🗑️</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40, color: Colors.textMuted }}>No orders found.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 20, paddingBottom: 10 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.text },
  card: { backgroundColor: Colors.card, borderRadius: Theme.borderRadius.lg, padding: 16, borderWidth: 1, borderColor: Colors.cardBorder, ...Theme.shadow.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  orderId: { fontSize: 16, fontWeight: '800', color: Colors.text },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  customerName: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  customerDetails: { fontSize: 12, color: Colors.textSecondary, marginBottom: 2 },
  divider: { height: 1, backgroundColor: Colors.cardBorder, marginVertical: 12 },
  itemsTitle: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, marginBottom: 6 },
  itemRow: { fontSize: 13, color: Colors.text, marginBottom: 2 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  total: { fontSize: 18, fontWeight: '800', color: Colors.text },
  updateBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Theme.borderRadius.full },
  updateBtnText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  deleteBtn: { backgroundColor: '#fee2e2', paddingHorizontal: 12, paddingVertical: 8, borderRadius: Theme.borderRadius.full },
  deleteBtnText: { fontSize: 12 }
});