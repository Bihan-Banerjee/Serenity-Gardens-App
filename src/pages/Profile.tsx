import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { ordersAPI } from '../lib/api';
import { Alert } from '../lib/dialog';
import { formatDate } from '../lib/format';
import { Colors } from '../lib/colors';
import { pickPhoto, toAvatarDataUrl } from '../lib/photo';
import Icon from '../components/Icon';
import { Loader } from '../components/Loading';
import { readCache, writeCache } from '../lib/cache';

interface Order {
  _id: string;
  createdAt: string;
  items: { name: string; quantity: number; price: number }[];
  total?: number;
  totalAmount?: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod?: string;
  status: string;
}

const STATUS_CONFIG = {
  paid: { label: 'Paid', color: Colors.success },
  pending: { label: 'Pending', color: Colors.warning },
  failed: { label: 'Failed', color: Colors.error },
};

type StatusFilter = 'all' | 'paid' | 'pending';
type SortKey = 'newest' | 'oldest' | 'high' | 'low';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'Newest first' },
  { key: 'oldest', label: 'Oldest first' },
  { key: 'high', label: 'Amount: high to low' },
  { key: 'low', label: 'Amount: low to high' },
];

const orderTotal = (o: Order) => o.total || o.totalAmount || 0;

function OrderCard({ order }: { order: Order }) {
  const status = STATUS_CONFIG[order.paymentStatus] || STATUS_CONFIG.pending;
  return (
    <div className="card order-card">
      <div className="row-between">
        <div>
          <div className="order-id">#{order._id.slice(-6).toUpperCase()}</div>
          <div className="muted small">
            {formatDate(order.createdAt)}
            {order.paymentMethod ? ` · ${order.paymentMethod.toUpperCase()}` : ''}
          </div>
        </div>
        <span className="status-badge" style={{ background: status.color + '22', color: status.color }}>{status.label}</span>
      </div>
      <hr />
      {order.items.map((item, i) => (
        <div key={i} className="row-between order-line">
          <span>{item.quantity} x {item.name}</span>
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

export function Avatar({ name, src, size = 72 }: { name?: string; src?: string; size?: number }) {
  const initials = (name ?? '').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div className="avatar-circle" style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {src ? <img src={src} alt="" /> : initials}
    </div>
  );
}

function OrderHistory() {
  const email = useAuthStore((s) => s.user?.email) || '';
  const cached = readCache<Order[]>(`orders:${email}`);
  const [orders, setOrders] = useState<Order[]>(cached ?? []);
  const [loading, setLoading] = useState(!cached);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortKey>('newest');

  useEffect(() => {
    ordersAPI
      .getMyOrders()
      // Show only orders that were paid, or placed as cash on delivery. Abandoned online payments stay hidden.
      .then((res) => {
        const valid = res.data.filter((o: Order) => o.paymentStatus === 'paid' || o.paymentMethod === 'cod');
        setOrders(valid);
        writeCache(`orders:${email}`, valid);
      })
      .catch(() => { if (!cached) setOrders([]); })
      .finally(() => setLoading(false));
  }, [email]);

  const visible = useMemo(() => {
    const list = orders.filter((o) => filter === 'all' || (filter === 'paid' ? o.paymentStatus === 'paid' : o.paymentStatus !== 'paid'));
    const by: Record<SortKey, (a: Order, b: Order) => number> = {
      newest: (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
      oldest: (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt),
      high: (a, b) => orderTotal(b) - orderTotal(a),
      low: (a, b) => orderTotal(a) - orderTotal(b),
    };
    return [...list].sort(by[sort]);
  }, [orders, filter, sort]);

  const spent = orders.reduce((s, o) => s + orderTotal(o), 0);

  return (
    <>
      <div className="stats-row">
        {[
          { label: 'Orders', value: orders.length },
          { label: 'Spent', value: `₹${spent.toFixed(0)}` },
          { label: 'Paid', value: orders.filter((o) => o.paymentStatus === 'paid').length },
        ].map((stat) => (
          <div key={stat.label} className="card stat">
            <b>{stat.value}</b>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>

      <section>
        <h3 className="section-h">Order history</h3>
        <div className="toolbar">
          <div className="seg">
            {(['all', 'paid', 'pending'] as StatusFilter[]).map((f) => (
              <button key={f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>
                {f === 'all' ? 'All' : f === 'paid' ? 'Paid' : 'Pending'}
              </button>
            ))}
          </div>
          <label className="sort-select">
            <Icon name="sort" size={16} />
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Sort orders">
              {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </label>
        </div>

        {loading ? (
          <Loader label="Loading your orders" />
        ) : visible.length === 0 ? (
          <div className="empty">
            <Icon name="package" size={40} className="empty-icon" />
            <strong>{orders.length === 0 ? 'No orders yet' : 'No orders match this filter'}</strong>
            <span className="muted">{orders.length === 0 ? 'Browse the shop and place your first order.' : 'Try a different filter.'}</span>
          </div>
        ) : (
          visible.map((o, i) => (
            <div key={o._id} className="fade-up" style={{ animationDelay: `${Math.min(i, 6) * 50}ms` }}><OrderCard order={o} /></div>
          ))
        )}
      </section>
    </>
  );
}

function DetailsCard() {
  const user = useAuthStore((s) => s.user)!;
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const [phone, setPhone] = useState(user.phone || '');
  const [address, setAddress] = useState(user.address || '');
  const dirty = phone !== (user.phone || '') || address !== (user.address || '');

  const save = () => {
    if (phone && phone.length !== 10) return Alert.alert('Invalid phone', 'Enter a valid 10-digit phone number.');
    updateProfile({ phone, address: address.trim() });
    Alert.alert('Saved', 'Your details will be used at checkout.');
  };

  return (
    <div className="card form details">
      <label>Phone number</label>
      <input type="tel" inputMode="numeric" maxLength={10} placeholder="10-digit mobile number" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} />
      <label>Delivery address</label>
      <textarea rows={3} placeholder="House no., street, city, PIN" value={address} onChange={(e) => setAddress(e.target.value)} />
      <button className="btn btn-gradient" disabled={!dirty} onClick={save}>Save details</button>
    </div>
  );
}

function AuthedProfile() {
  const user = useAuthStore((s) => s.user)!;
  const logout = useAuthStore((s) => s.logout);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const navigate = useNavigate();

  const changePhoto = (source: 'camera' | 'gallery') => async () => {
    const file = await pickPhoto(source);
    if (!file) return;
    try {
      updateProfile({ avatar: await toAvatarDataUrl(file) });
    } catch {
      Alert.alert('Error', 'Could not use that image.');
    }
  };

  const photoOptions = () =>
    Alert.alert('Profile photo', 'Choose a source', [
      { text: 'Take photo', onPress: changePhoto('camera') },
      { text: 'Choose from gallery', onPress: changePhoto('gallery') },
      ...(user.avatar ? [{ text: 'Remove photo', style: 'destructive' as const, onPress: () => updateProfile({ avatar: '' }) }] : []),
      { text: 'Cancel', style: 'cancel' as const },
    ]);

  const handleLogout = () =>
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: logout },
    ]);

  return (
    <div className="screen-scroll">
      <div className="avatar-banner">
        <button className="avatar-btn" onClick={photoOptions} aria-label="Change profile photo">
          <Avatar name={user.name} src={user.avatar} />
          <span className="avatar-edit"><Icon name="camera" size={14} /></span>
        </button>
        <h2>{user.name}</h2>
        <p>{user.email}</p>
        {user.isAdmin && (
          <button className="admin-badge" onClick={() => navigate('/admin')}>
            Admin portal
          </button>
        )}
      </div>

      <OrderHistory />

      <section>
        <h3 className="section-h">Delivery details</h3>
        <DetailsCard />
      </section>

      <section style={{ marginTop: 20 }}>
        <button className="btn btn-outline danger" onClick={handleLogout}><Icon name="logout" size={18} /> Sign out</button>
      </section>
      <div style={{ height: 32 }} />
    </div>
  );
}

function GuestProfile() {
  const navigate = useNavigate();
  return (
    <div className="screen-scroll">
      <div className="guest-banner fade-up">
        <h2>Sign in</h2>
        <p>Keep your details for faster checkout and see your order history.</p>
      </div>
      <div className="stack-gap">
        <button className="btn btn-gradient" onClick={() => navigate('/login')}>Sign in</button>
        <button className="btn btn-outline" onClick={() => navigate('/register')}>Create account</button>
      </div>
      <div className="card guest-features">
        {[
          { icon: 'bag', text: 'Order from the farm shop' },
          { icon: 'package', text: 'Track your orders' },
          { icon: 'star', text: 'Leave reviews' },
          { icon: 'pin', text: 'Save your delivery address' },
        ].map((t) => (
          <div key={t.text} className="guest-feature"><Icon name={t.icon} size={18} /> {t.text}</div>
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
        <h1>My profile</h1>
      </header>
      {isAuthenticated ? <AuthedProfile /> : <GuestProfile />}
    </div>
  );
}
