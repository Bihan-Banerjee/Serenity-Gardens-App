import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { tap } from '../lib/native';
import Icon from './Icon';
import type { IconName } from './Icon';

const TABS: { to: string; icon: IconName; label: string; end?: boolean; badge?: boolean }[] = [
  { to: '/', icon: 'home', label: 'Home', end: true },
  { to: '/explore', icon: 'compass', label: 'Explore' },
  { to: '/gallery', icon: 'image', label: 'Gallery' },
  { to: '/menu', icon: 'bag', label: 'Shop', badge: true },
  { to: '/profile', icon: 'user', label: 'Profile' },
];

export default function TabLayout() {
  const totalItems = useCartStore((s) => s.totalItems());
  const { pathname } = useLocation();
  return (
    <div className="tab-layout">
      <div className="tab-content" key={pathname}>
        <div className="route-fade"><Outlet /></div>
      </div>
      <nav className="tab-bar">
        {TABS.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end} className="tab-item" onClick={tap}>
            <span className="tab-icon-wrap">
              <Icon name={t.icon} size={23} />
              {t.badge && totalItems > 0 && (
                <span key={totalItems} className="tab-badge pop-in">{totalItems > 9 ? '9+' : totalItems}</span>
              )}
            </span>
            <span className="tab-label">{t.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
