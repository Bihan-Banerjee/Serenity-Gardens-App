import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../lib/api';
import { Alert } from '../lib/dialog';
import { useAuthStore } from '../store/useAuthStore';

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/';
  const loginAction = useAuthStore((s) => s.login);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) return Alert.alert('Error', 'Please fill in all required fields.');
    if (phone && phone.length !== 10) return Alert.alert('Error', 'Enter a valid 10-digit phone number.');
    if (password !== confirmPassword) return Alert.alert('Error', 'Passwords do not match.');
    if (password.length < 6) return Alert.alert('Error', 'Password must be at least 6 characters.');

    try {
      setLoading(true);
      const res = await authAPI.register({ name: name.trim(), email: email.trim(), password, phone, address: address.trim() });
      // Phone and address are also kept on this device so checkout can pre-fill them.
      loginAction({ ...res.data.user, phone: res.data.user?.phone || phone, address: res.data.user?.address || address.trim() }, res.data.token);
      navigate(from, { replace: true });
    } catch (err: any) {
      Alert.alert('Registration failed', err.message || 'Could not create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth" onSubmit={handleRegister}>
      <h2>Create account</h2>
      <p className="muted">Save your details once and check out faster</p>

      <div className="card form">
        <label>Full name</label>
        <input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        <label>Email address</label>
        <input type="email" inputMode="email" autoCapitalize="none" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label>Phone number</label>
        <input type="tel" inputMode="numeric" maxLength={10} placeholder="10-digit mobile number" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} />
        <label>Delivery address</label>
        <textarea rows={3} placeholder="House no., street, city, PIN" value={address} onChange={(e) => setAddress(e.target.value)} />
        <label>Password</label>
        <input type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
        <label>Confirm password</label>
        <input type="password" placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        <button className="btn btn-gradient" type="submit" disabled={loading}>
          {loading ? <span className="spinner small" /> : 'Create account'}
        </button>
      </div>

      <div className="auth-foot">
        <span>Already have an account?</span> <Link to="/login" replace state={location.state}>Sign in</Link>
      </div>
    </form>
  );
}
