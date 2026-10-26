import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import { AlertIcon, EyeIcon, EyeOffIcon } from '../components/Icons';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const DEMO = { email: 'demo@melody.app', password: 'demo1234' };

export default function Login() {
  const { login, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  function update(field) {
    return (event) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
      if (error) setError('');
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.email.trim() || !form.password) {
      setError('Please enter your email and password.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await login(form.email.trim(), form.password);
      toast.success('Welcome back to Melody!');
      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    } catch (loginError) {
      setError(getErrorMessage(loginError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      badge="Welcome back"
      title="Sign in to your library"
      subtitle="Pick up right where you left off."
      footer={
        <>
          New to Melody? <Link to="/register">Create an account</Link>
        </>
      }
    >
      <form className="form" onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="alert" role="alert">
            <AlertIcon size={16} />
            <span>{error}</span>
          </div>
        )}

        <label className="field">
          <span>Email address</span>
          <input
            type="email"
            className="input"
            placeholder="you@example.com"
            value={form.email}
            onChange={update('email')}
            autoComplete="email"
            autoFocus
          />
        </label>

        <label className="field">
          <span>Password</span>
          <div className="input-wrap">
            <input
              type={showPassword ? 'text' : 'password'}
              className="input"
              placeholder="Enter your password"
              value={form.password}
              onChange={update('password')}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="input-icon"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
            </button>
          </div>
        </label>

        <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
          {submitting ? (
            <>
              <span className="spinner spinner--sm" /> Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </button>

        <button
          type="button"
          className="btn btn--ghost btn--block"
          onClick={() => {
            setForm(DEMO);
            setError('');
          }}
          disabled={submitting}
        >
          Use demo account
        </button>

        <p className="form__hint">
          Demo: <strong>demo@melody.app</strong> / <strong>demo1234</strong>
        </p>
      </form>
    </AuthShell>
  );
}
