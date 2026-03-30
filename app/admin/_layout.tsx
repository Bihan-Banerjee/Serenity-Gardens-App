import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';

export default function AdminLayout() {
  const isAdmin = useAuthStore(s => s.isAdmin);
  
  if (!isAdmin) {
    return <Redirect href="/(tabs)" />;
  }

  return <Stack screenOptions={{ headerTitleAlign: 'center' }} />;
}