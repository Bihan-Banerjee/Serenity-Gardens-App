import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../lib/api';
import { Alert } from '../lib/dialog';
import { useAuthStore } from '../store/useAuthStore';

export default function Login() {
  const navigate = useNavigate();
  const loginAction = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password.');
      return;
    }
    try {
      setLoading(true);
      const res = await authAPI.login({ email, password });
      loginAction(res.data.user, res.data.token);
      navigate('/', { replace: true });
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth" onSubmit={handleLogin}>
      <div className="big-emoji">🌿</div>
      <h2>Welcome Back</h2>
      <p className="muted">Sign in to continue to Serenity Gardens</p>

      <div className="card form">
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
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn btn-gradient" type="submit" disabled={loading}>
          {loading ? <span className="spinner small" /> : 'Sign In'}
        </button>
      </div>

      <div className="auth-foot">
        <span>Don't have an account?</span> <Link to="/register" replace>Create one</Link>
      </div>
    </form>
  );
}
