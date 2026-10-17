import { useEffect, useState } from 'react';
import { adminOrdersAPI } from '../../lib/api';
import { Alert } from '../../lib/dialog';
import { Colors } from '../../lib/colors';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await adminOrdersAPI.getAllAdmin();
      setOrders(res.data);
    } catch {
      Alert.alert('Error', 'Could not load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const togglePaymentStatus = (orderId: string, paid: boolean) =>
    Alert.alert('Update Payment Status', `Mark this order as ${paid ? 'UNPAID' : 'PAID'}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          try {
            await adminOrdersAPI.updatePaymentStatus(orderId, !paid);
            fetchOrders();
          } catch {
            Alert.alert('Error', 'Failed to update payment status');
          }
        },
      },
    ]);

  const handleDelete = (orderId: string) =>
    Alert.alert('Delete Order', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminOrdersAPI.delete(orderId);
            fetchOrders();
          } catch {
            Alert.alert('Error', 'Failed to delete order');
          }
        },
      },
    ]);

  return (
    <div className="pad-x">
      <h2 className="page-h">Order Management</h2>
      {loading ? (
        <div className="spinner" />
      ) : orders.length === 0 ? (
        <p className="muted center pad">No orders found.</p>
      ) : (
        <div className="stack-gap">
          {orders.map((o) => (
            <div key={o._id} className="card">
              <div className="row-between">
                <b>Order #{o._id.slice(-6).toUpperCase()}</b>
                <span className="status-badge" style={{ background: (o.paid ? Colors.success : Colors.error) + '22', color: o.paid ? Colors.success : Colors.error }}>
                  {o.paid ? 'PAID' : 'PENDING'}
                </span>
              </div>
              <div className="cust">👤 {o.userId?.name || 'Unknown User'}</div>
              <div className="muted small">✉️ {o.userId?.email || 'No email'}</div>
              {o.razorpayPaymentId && <div className="muted small">💳 TXN: {o.razorpayPaymentId}</div>}
              <hr />
              <b className="small">Items ({o.items?.length}):</b>
              {o.items?.map((i: any, idx: number) => (
                <div key={idx} className="muted small">{i.quantity}x {i.name || i.id} - ₹{i.price}</div>
              ))}
              <hr />
              <div className="row-between">
                <span className="order-total">₹{o.totalAmount?.toFixed(2)}</span>
                <div className="row-gap">
                  <button className="pill-btn" style={{ background: o.paid ? Colors.textMuted : Colors.primary }} onClick={() => togglePaymentStatus(o._id, o.paid)}>
                    Mark {o.paid ? 'Unpaid' : 'Paid'}
                  </button>
                  <button className="pill-btn del" onClick={() => handleDelete(o._id)}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
