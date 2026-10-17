import { useEffect, useMemo, useState } from 'react';
import { adminOrdersAPI } from '../../lib/api';
import { Alert } from '../../lib/dialog';
import { formatDate } from '../../lib/format';
import { readCache, writeCache } from '../../lib/cache';
import Icon from '../../components/Icon';
import { Loader } from '../../components/Loading';
import { Colors } from '../../lib/colors';

type StatusFilter = 'all' | 'paid' | 'pending';
type SortKey = 'newest' | 'oldest' | 'high' | 'low';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'Newest first' },
  { key: 'oldest', label: 'Oldest first' },
  { key: 'high', label: 'Amount: high to low' },
  { key: 'low', label: 'Amount: low to high' },
];

const time = (o: any) => (o.createdAt ? +new Date(o.createdAt) : 0);

export default function AdminOrders() {
  const cached = readCache<any[]>('admin-orders');
  const [orders, setOrders] = useState<any[]>(cached ?? []);
  const [loading, setLoading] = useState(!cached);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortKey>('newest');
  const [query, setQuery] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await adminOrdersAPI.getAllAdmin();
      setOrders(res.data);
      writeCache('admin-orders', res.data);
    } catch {
      if (!cached) Alert.alert('Error', 'Could not load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = orders.filter((o) => {
      if (filter === 'paid' && !o.paid) return false;
      if (filter === 'pending' && o.paid) return false;
      if (!q) return true;
      return [o._id.slice(-6), o.userId?.name, o.userId?.email, o.razorpayPaymentId]
        .some((v) => String(v ?? '').toLowerCase().includes(q));
    });
    const by: Record<SortKey, (a: any, b: any) => number> = {
      newest: (a, b) => time(b) - time(a),
      oldest: (a, b) => time(a) - time(b),
      high: (a, b) => (b.totalAmount || 0) - (a.totalAmount || 0),
      low: (a, b) => (a.totalAmount || 0) - (b.totalAmount || 0),
    };
    return [...list].sort(by[sort]);
  }, [orders, filter, sort, query]);

  const togglePaymentStatus = (orderId: string, paid: boolean) =>
    Alert.alert('Update payment status', `Mark this order as ${paid ? 'unpaid' : 'paid'}?`, [
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
    Alert.alert('Delete order', 'Are you sure?', [
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

  const count = (f: StatusFilter) => orders.filter((o) => (f === 'all' ? true : f === 'paid' ? o.paid : !o.paid)).length;

  return (
    <div className="pad-x">
      <h2 className="page-h">Order management</h2>

      <div className="toolbar">
        <label className="sort-select search">
          <Icon name="filter" size={16} />
          <input
            type="search"
            placeholder="Search name, email, order or txn id"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="seg">
          {(['all', 'paid', 'pending'] as StatusFilter[]).map((f) => (
            <button key={f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f === 'paid' ? 'Paid' : 'Pending'} ({count(f)})
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
        <Loader label="Loading orders" />
      ) : visible.length === 0 ? (
        <p className="muted center pad">{orders.length === 0 ? 'No orders found.' : 'No orders match your filters.'}</p>
      ) : (
        <div className="stack-gap">
          {visible.map((o, i) => (
            <div key={o._id} className="card fade-up" style={{ animationDelay: `${Math.min(i, 6) * 40}ms` }}>
              <div className="row-between">
                <div>
                  <b>Order #{o._id.slice(-6).toUpperCase()}</b>
                  {o.createdAt && <div className="muted small">{formatDate(o.createdAt)}</div>}
                </div>
                <span className="status-badge" style={{ background: (o.paid ? Colors.success : Colors.error) + '22', color: o.paid ? Colors.success : Colors.error }}>
                  {o.paid ? 'PAID' : 'PENDING'}
                </span>
              </div>
              <div className="cust">{o.userId?.name || 'Unknown user'}</div>
              <div className="muted small">{o.userId?.email || 'No email'}</div>
              {o.razorpayPaymentId && <div className="muted small">Txn: {o.razorpayPaymentId}</div>}
              <hr />
              <b className="small">Items ({o.items?.length}):</b>
              {o.items?.map((it: any, idx: number) => (
                <div key={idx} className="muted small">{it.quantity}x {it.name || it.id} - ₹{it.price}</div>
              ))}
              <hr />
              <div className="row-between">
                <span className="order-total">₹{o.totalAmount?.toFixed(2)}</span>
                <div className="row-gap">
                  <button className="pill-btn" style={{ background: o.paid ? Colors.textMuted : Colors.primary }} onClick={() => togglePaymentStatus(o._id, o.paid)}>
                    Mark {o.paid ? 'Unpaid' : 'Paid'}
                  </button>
                  <button className="pill-btn del" onClick={() => handleDelete(o._id)} aria-label="Delete order"><Icon name="trash" size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
