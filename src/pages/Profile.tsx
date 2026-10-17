import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { ordersAPI } from '../lib/api';
import { Alert } from '../lib/dialog';
import { formatDate } from '../lib/format';
import { Colors } from '../lib/colors';

interface Order {
  _id: string;
  createdAt: string;
  items: { name: string; quantity: number; price: number }[];
  total?: number;
  totalAmount?: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  status: string;
}

const STATUS_CONFIG = {
  paid: { label: 'Paid', color: Colors.success, emoji: '✅' },
  pending: { label: 'Pending', color: Colors.warning, emoji: '⏳' },
  failed: { label: 'Failed', color: Colors.error, emoji: '❌' },
};

const orderTotal = (o: Order) => o.total || o.totalAmount || 0;

function OrderCard({ order }: { order: Order }) {
  const status = STATUS_CONFIG[order.paymentStatus] || STATUS_CONFIG.pending;
  return (
    <div className="card order-card">
      <div className="row-between">
        <div>
          <div className="order-id">#{order._id.slice(-6).toUpperCase()}</div>
          <div className="muted small">{formatDate(order.createdAt)}</div>
        </div>
        <span className="status-badge" style={{ background: status.color + '22', color: status.color }}>
          {status.emoji} {status.label}
        </span>
      </div>
      <hr />
      {order.items.map((item, i) => (
        <div key={i} className="row-between order-line">
          <span>{item.quantity}× {item.name}</span>
          <b>₹{((item.price || 0) * (item.quantity || 1)).toFixed(0)}</b>
        </div>
      ))}
      <hr />
      <div className="row-between">
        <span className="muted">Total</span>
        <span className="order-total">₹{orderTotal(order).toFixed(2)}</span>
      </div>
    </div>
  );
}

function AuthedProfile() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI
      .getMyOrders()
      .then((res) => setOrders(res.data.filter((o: any) => o.paymentStatus === 'paid' || o.paymentMethod === 'cod')))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () =>
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);

  const initials = (user?.name ?? '')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const spent = orders.reduce((s, o) => s + orderTotal(o), 0);

  return (
    <div className="screen-scroll">
      <div className="avatar-banner">
        <div className="avatar-circle">{initials}</div>
        <h2>{user?.name}</h2>
        <p>{user?.email}</p>
        {(user?.isAdmin || user?.email === 'bihanbanerjee04@gmail.com') && (
          <button className="admin-badge" onClick={() => navigate('/admin')}>⚡ Go to Admin Portal</button>
        )}
      </div>

      <div className="stats-row">
        {[
          { label: 'Total Orders', value: orders.length },
          { label: 'Spent', value: `₹${spent.toFixed(0)}` },
          { label: 'Member Since', value: new Date().getFullYear().toString() },
        ].map((stat) => (
          <div key={stat.label} className="card stat">
            <b>{stat.value}</b>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>

      <section className="pad-x">
        <h3 className="section-h">Order History</h3>
        {loading ? (
          <div className="spinner" />
        ) : orders.length === 0 ? (
          <div className="empty">
            <div className="empty-emoji">📦</div>
            <strong>No orders yet</strong>
            <span className="muted">Browse our shop and place your first order!</span>
          </div>
        ) : (
          orders.map((o) => <OrderCard key={o._id} order={o} />)
        )}
      </section>

      <section className="pad-x">
        <button className="btn btn-outline danger" onClick={handleLogout}>Sign Out</button>
      </section>
      <div style={{ height: 32 }} />
    </div>
  );
}

function GuestProfile() {
  const navigate = useNavigate();
  return (
    <div className="screen-scroll pad-x">
      <div className="guest-banner">
        <div className="big-emoji">🌿</div>
        <h2>Hello, Visitor!</h2>
        <p>Sign in to view your orders, manage your profile, and shop with ease.</p>
      </div>
      <div className="stack-gap">
        <button className="btn btn-gradient" onClick={() => navigate('/login')}>Sign In</button>
        <button className="btn btn-outline" onClick={() => navigate('/register')}>Create Account</button>
      </div>
      <div className="card guest-features">
        {['🛒 Add items to cart', '📦 Track your orders', '⭐ Leave reviews', '🔁 Repeat past orders'].map((t) => (
          <div key={t}>{t}</div>
        ))}
      </div>
    </div>
  );
}

export default function Profile() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return (
    <div className="screen">
      <header className="screen-header">
        <div className="eyebrow">Serenity Gardens</div>
        <h1>My Profile</h1>
      </header>
      {isAuthenticated ? <AuthedProfile /> : <GuestProfile />}
    </div>
  );
}
