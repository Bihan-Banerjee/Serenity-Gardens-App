import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../lib/api';
import { Alert } from '../lib/dialog';
import { useAuthStore } from '../store/useAuthStore';

export default function Register() {
  const navigate = useNavigate();
  const loginAction = useAuthStore((s) => s.login);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return Alert.alert('Error', 'Please fill in all fields.');
    if (password !== confirmPassword) return Alert.alert('Error', 'Passwords do not match.');
    if (password.length < 6) return Alert.alert('Error', 'Password must be at least 6 characters.');

    try {
      setLoading(true);
      const res = await authAPI.register({ name, email, password });
      loginAction(res.data.user, res.data.token);
      navigate('/', { replace: true });
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message || 'Could not create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth" onSubmit={handleRegister}>
      <div className="big-emoji">✨</div>
      <h2>Create Account</h2>
      <p className="muted">Join Serenity Gardens today</p>

      <div className="card form">
        <label>Full Name</label>
        <input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        <label>Email Address</label>
        <input
          type="email"
          inputMode="email"
          autoCapitalize="none"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label>Password</label>
        <input type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
        <label>Confirm Password</label>
        <input type="password" placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        <button className="btn btn-gradient" type="submit" disabled={loading}>
          {loading ? <span className="spinner small" /> : 'Create Account'}
        </button>
      </div>

      <div className="auth-foot">
        <span>Already have an account?</span> <Link to="/login" replace>Sign in</Link>
      </div>
    </form>
  );
}
