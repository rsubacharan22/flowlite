import {
  CheckCircle,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Save,
  User
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../api/http';
import Badge from '../components/Badge';
import Layout from '../components/Layout';
import { updateStoredUser } from '../utils/api/auth';
import { useAuth } from '../hooks/useAuth';

function FieldGroup({ label, children, hint }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function StatusBanner({ status }) {
  if (!status) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={[
        'flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium',
        status.type === 'success'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-rose-200 bg-rose-50 text-rose-700'
      ].join(' ')}
    >
      {status.type === 'success' && <CheckCircle className="h-4 w-4 shrink-0" />}
      {status.message}
    </motion.div>
  );
}

function ProfileSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileStatus, setProfileStatus] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState(null);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('token') || !user) {
      navigate('/', { replace: true });
    }
  }, [navigate, user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileStatus(null);

    if (!name.trim()) {
      setProfileStatus({ type: 'error', message: 'Name is required.' });
      return;
    }

    try {
      setSavingProfile(true);
      const res = await api.put('/profile', { name, email });

      // Update localStorage so initials/name update without logout
      updateStoredUser({ name: res.data.name, email: res.data.email });

      setProfileStatus({ type: 'success', message: 'Profile updated successfully.' });
    } catch (err) {
      setProfileStatus({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update profile.'
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'All password fields are required.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'New password must be at least 6 characters.' });
      return;
    }

    try {
      setSavingPassword(true);
      await api.put('/profile/password', { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordStatus({ type: 'success', message: 'Password changed successfully.' });
    } catch (err) {
      setPasswordStatus({
        type: 'error',
        message: err.response?.data?.message || 'Failed to change password.'
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const initials = name
    ? name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
    : 'FL';

  return (
    <Layout title="Profile Settings" subtitle="Manage your account information and security.">
      <div className="mx-auto max-w-2xl space-y-5">

        {/* Avatar + identity card */}
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 text-xl font-bold text-white shadow-sm">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold text-slate-900 truncate">{user?.name || 'User'}</p>
            <p className="text-sm text-slate-400 truncate">{user?.email || ''}</p>
            <div className="mt-1.5">
              <Badge type="role" value={user?.role || 'employee'} small />
            </div>
          </div>
        </div>

        {/* Profile info form */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
          <div className="flex items-center gap-2.5 border-b border-slate-100 px-6 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
              <User className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Personal Information</h2>
              <p className="text-xs text-slate-400">Update your name and email address.</p>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4 p-6">
            <FieldGroup label="Full Name">
              <input
                className="field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </FieldGroup>

            <FieldGroup label="Email Address" hint="Changing your email will take effect on next login.">
              <input
                className="field"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </FieldGroup>

            <AnimatePresence>
              {profileStatus && <StatusBanner status={profileStatus} />}
            </AnimatePresence>

            <button
              type="submit"
              disabled={savingProfile}
              className="flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {savingProfile
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Save className="h-4 w-4" />
              }
              Save Changes
            </button>
          </form>
        </div>

        {/* Change password form */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
          <div className="flex items-center gap-2.5 border-b border-slate-100 px-6 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
              <KeyRound className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Change Password</h2>
              <p className="text-xs text-slate-400">Requires your current password to confirm.</p>
            </div>
          </div>

          <form onSubmit={handlePasswordSave} className="space-y-4 p-6">
            <FieldGroup label="Current Password">
              <div className="relative">
                <input
                  className="field pr-10"
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Your current password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FieldGroup>

            <FieldGroup label="New Password" hint="Must be at least 6 characters.">
              <div className="relative">
                <input
                  className="field pr-10"
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FieldGroup>

            <FieldGroup label="Confirm New Password">
              <input
                className="field"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                autoComplete="new-password"
              />
            </FieldGroup>

            <AnimatePresence>
              {passwordStatus && <StatusBanner status={passwordStatus} />}
            </AnimatePresence>

            <button
              type="submit"
              disabled={savingPassword}
              className="flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {savingPassword
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <KeyRound className="h-4 w-4" />
              }
              Change Password
            </button>
          </form>
        </div>

      </div>
    </Layout>
  );
}

export default ProfileSettings;
