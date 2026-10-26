import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import { AlertIcon, CheckIcon, EyeIcon, EyeOffIcon } from '../components/Icons';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const EMPTY = { name: '', email: '', password: '', confirm: '' };

export default function Register() {
  const { register, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
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

  const passwordLongEnough = form.password.length >= 6;
  const passwordsMatch = form.confirm.length > 0 && form.password === form.confirm;

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Please fill in every field.');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!passwordLongEnough) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      toast.success('Account created. Welcome to Melody!');
      navigate('/', { replace: true });
    } catch (registerError) {
      setError(getErrorMessage(registerError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      badge="Get started"
      title="Create your account"
      subtitle="Your personal music library is one step away."
      footer={
        <>
          Already have an account? <Link to="/login">Sign in</Link>
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
          <span>Full name</span>
          <input
            type="text"
            className="input"
            placeholder="e.g. Pankaj Sharma"
            value={form.name}
            onChange={update('name')}
            autoComplete="name"
            maxLength={60}
            autoFocus
          />
        </label>

        <label className="field">
          <span>Email address</span>
          <input
            type="email"
            className="input"
            placeholder="you@example.com"
            value={form.email}
            onChange={update('email')}
            autoComplete="email"
          />
        </label>

        <div className="grid-2">
          <label className="field">
            <span>Password</span>
            <div className="input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={update('password')}
                autoComplete="new-password"
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

          <label className="field">
            <span>Confirm password</span>
            <input
              type={showPassword ? 'text' : 'password'}
              className="input"
              placeholder="Repeat password"
              value={form.confirm}
              onChange={update('confirm')}
              autoComplete="new-password"
            />
          </label>
        </div>

        <div className="password-rules">
          <span className={passwordLongEnough ? 'is-ok' : ''}>
            <CheckIcon size={14} /> At least 6 characters
          </span>
          <span className={passwordsMatch ? 'is-ok' : ''}>
            <CheckIcon size={14} /> Passwords match
          </span>
        </div>

        <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
          {submitting ? (
            <>
              <span className="spinner spinner--sm" /> Creating account...
            </>
          ) : (
            'Create account'
          )}
        </button>
      </form>
    </AuthShell>
  );
}
