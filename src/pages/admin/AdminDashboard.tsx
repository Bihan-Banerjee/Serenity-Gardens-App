import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon';
import type { IconName } from '../../components/Icon';
import { useAuthStore } from '../../store/useAuthStore';

function AdminCard({ title, subtitle, icon, onPress }: { title: string; subtitle: string; icon: IconName; onPress: () => void }) {
  return (
    <button className="card admin-card" onClick={onPress}>
      <span className="admin-icon"><Icon name={icon} size={24} /></span>
      <span className="grow"><b>{title}</b><small>{subtitle}</small></span>
      <Icon name="chevron-right" size={20} className="arrow" />
    </button>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  return (
    <div className="pad-x">
      <div className="banner admin-banner">
        <h2>Admin portal</h2>
        <p>Welcome back, {user?.name}</p>
      </div>
      <div className="stack-gap">
        <AdminCard title="Manage items" subtitle="Add, edit or remove store products" icon="leaf" onPress={() => navigate('/admin/items')} />
        <AdminCard title="Manage orders" subtitle="View and update customer orders" icon="package" onPress={() => navigate('/admin/orders')} />
        <AdminCard title="View reviews" subtitle="Monitor customer feedback" icon="star" onPress={() => navigate('/reviews')} />
      </div>
    </div>
  );
}
