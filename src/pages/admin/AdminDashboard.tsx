import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

function AdminCard({ title, subtitle, emoji, onPress }: { title: string; subtitle: string; emoji: string; onPress: () => void }) {
  return (
    <button className="card admin-card" onClick={onPress}>
      <span className="admin-emoji">{emoji}</span>
      <span className="grow"><b>{title}</b><small>{subtitle}</small></span>
      <span className="arrow">→</span>
    </button>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  return (
    <div className="pad-x">
      <div className="banner admin-banner">
        <div className="big-emoji">🛡️</div>
        <h2>Admin Portal</h2>
        <p>Welcome back, {user?.name}</p>
      </div>
      <div className="stack-gap">
        <AdminCard title="Manage Items" subtitle="Add, edit, or remove store products" emoji="🌿" onPress={() => navigate('/admin/items')} />
        <AdminCard title="Manage Orders" subtitle="View and update customer orders" emoji="📦" onPress={() => navigate('/admin/orders')} />
        <AdminCard title="View Reviews" subtitle="Monitor customer feedback" emoji="⭐" onPress={() => navigate('/reviews')} />
      </div>
    </div>
  );
}
