import { NavLink, Outlet } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { tap } from '../lib/native';

const TABS = [
  { to: '/', icon: '🌿', label: 'Home', end: true, badge: false },
  { to: '/explore', icon: '🔍', label: 'Explore', end: false, badge: false },
  { to: '/gallery', icon: '🖼️', label: 'Gallery', end: false, badge: false },
  { to: '/menu', icon: '🛒', label: 'Shop', end: false, badge: true },
  { to: '/profile', icon: '👤', label: 'Profile', end: false, badge: false },
];

export default function TabLayout() {
  const totalItems = useCartStore((s) => s.totalItems());
  return (
    <div className="tab-layout">
      <div className="tab-content"><Outlet /></div>
      <nav className="tab-bar">
        {TABS.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end} className="tab-item" onClick={tap}>
            <span className="tab-icon-wrap">
              <span className="tab-icon">{t.icon}</span>
              {t.badge && totalItems > 0 && <span className="tab-badge">{totalItems > 9 ? '9+' : totalItems}</span>}
            </span>
            <span className="tab-label">{t.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
