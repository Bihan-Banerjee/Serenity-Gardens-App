import { useEffect } from 'react';
import type { ReactElement } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useAuthStore } from './store/useAuthStore';
import { DialogHost } from './lib/dialog';
import TabLayout from './components/TabLayout';
import StackScreen from './components/StackScreen';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Gallery from './pages/Gallery';
import Menu from './pages/Menu';
import Profile from './pages/Profile';
import About from './pages/About';
import Reviews from './pages/Reviews';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminItems from './pages/admin/AdminItems';
import AdminOrders from './pages/admin/AdminOrders';

function AdminGuard({ children }: { children: ReactElement }) {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  return isAdmin ? children : <Navigate to="/" replace />;
}

export default function App() {
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const isLoading = useAuthStore((s) => s.isLoading);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: Style.Light }).catch(() => {});
      StatusBar.setBackgroundColor({ color: '#F2EDE4' }).catch(() => {});
      SplashScreen.hide().catch(() => {});
    }
  }, [checkAuth]);

  // Android hardware back button: go back in history, or exit from the root.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const sub = CapApp.addListener('backButton', () => {
      if (location.pathname === '/' || location.pathname === '') CapApp.exitApp();
      else navigate(-1);
    });
    return () => { sub.then((h) => h.remove()); };
  }, [location.pathname, navigate]);

  if (isLoading) return null;

  return (
    <>
      <Routes>
        <Route element={<TabLayout />}>
          <Route index element={<Home />} />
          <Route path="explore" element={<Explore />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="menu" element={<Menu />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="about" element={<StackScreen title="About Us"><About /></StackScreen>} />
        <Route path="reviews" element={<StackScreen title="Reviews"><Reviews /></StackScreen>} />
        <Route path="login" element={<StackScreen title="Sign In"><Login /></StackScreen>} />
        <Route path="register" element={<StackScreen title="Create Account"><Register /></StackScreen>} />
        <Route path="checkout" element={<StackScreen title="Checkout"><Checkout /></StackScreen>} />
        <Route path="admin" element={<AdminGuard><StackScreen title="Admin Portal"><AdminDashboard /></StackScreen></AdminGuard>} />
        <Route path="admin/items" element={<AdminGuard><StackScreen title="Manage Items"><AdminItems /></StackScreen></AdminGuard>} />
        <Route path="admin/orders" element={<AdminGuard><StackScreen title="Manage Orders"><AdminOrders /></StackScreen></AdminGuard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <DialogHost />
    </>
  );
}
