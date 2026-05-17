import {
  CheckCircle,
  Loader2,
  Plus,
  Trash2,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  X
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../api/http';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';

const ROLE_LABELS = {
  employee: 'Employee',
  approver: 'Approver',
  admin: 'Admin'
};

const ROLE_COLORS = {
  employee: 'bg-sky-50 text-sky-700 border-sky-200',
  approver: 'bg-violet-50 text-violet-700 border-violet-200',
  admin: 'bg-amber-50 text-amber-700 border-amber-200'
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(dateStr));
}

// ── Create User Modal ──────────────────────────────────────────────────────────
function CreateUserModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password) {
      setError('All fields are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/api/admin/users', { name, email, password, role });
      onCreated(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ type: 'spring', stiffness: 380, damping: 35 }}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
              <UserPlus className="h-4 w-4 text-blue-600" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Create User</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Full Name</label>
            <input
              className="field"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
            <input
              className="field"
              type="email"
              placeholder="jane@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Password</label>
            <input
              className="field"
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Role</label>
            <select className="field" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="employee">Employee</option>
              <option value="approver">Approver</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              Create User
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
function AdminUsers() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [actioningId, setActioningId] = useState('');
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/users');
      setUsers(res.data);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('token') || !user) {
      navigate('/', { replace: true });
      return;
    }
    if (!isAdmin) {
      navigate('/dashboard', { replace: true });
      return;
    }
    fetchUsers();
  }, [navigate, user, isAdmin, fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      setActioningId(userId);
      const res = await api.patch(`/api/admin/users/${userId}/role`, { role: newRole });
      setUsers((prev) => prev.map((u) => (u._id === userId ? res.data : u)));
      showToast('Role updated successfully.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update role.', 'error');
    } finally {
      setActioningId('');
    }
  };

  const handleToggleStatus = async (userId, currentlyActive) => {
    try {
      setActioningId(userId);
      const res = await api.patch(`/api/admin/users/${userId}/status`, { isActive: !currentlyActive });
      setUsers((prev) => prev.map((u) => (u._id === userId ? res.data : u)));
      showToast(`Account ${!currentlyActive ? 'activated' : 'deactivated'} successfully.`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status.', 'error');
    } finally {
      setActioningId('');
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Delete ${userName}? This cannot be undone.`)) return;
    try {
      setActioningId(userId);
      await api.delete(`/api/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      showToast('User deleted successfully.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete user.', 'error');
    } finally {
      setActioningId('');
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [u.name, u.email, u.role].join(' ').toLowerCase().includes(q);
  });

  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    employees: users.filter((u) => u.role === 'employee').length,
    approvers: users.filter((u) => u.role === 'approver').length
  };

  return (
    <>
      <Layout
        title="User Management"
        subtitle="Create, edit, and manage all platform accounts."
        onSearchChange={setSearch}
        searchPlaceholder="Search users..."
        searchValue={search}
      >
        <div className="mx-auto max-w-7xl">
          {/* Stats row */}
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Total Users', value: stats.total, color: 'text-slate-800' },
              { label: 'Active', value: stats.active, color: 'text-emerald-700' },
              { label: 'Employees', value: stats.employees, color: 'text-sky-700' },
              { label: 'Approvers', value: stats.approvers, color: 'text-violet-700' }
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
                <p className="text-xs font-semibold text-slate-400">{s.label}</p>
                <p className={`mt-1 text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Table card */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-bold text-slate-900">
                  All Users <span className="ml-1.5 text-slate-400 font-normal">({filteredUsers.length})</span>
                </h2>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Plus className="h-3.5 w-3.5" />
                Create User
              </button>
            </div>

            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center gap-2">
                <Users className="h-10 w-10 text-slate-200" />
                <p className="text-sm font-semibold text-slate-400">No users found</p>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/60">
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Name</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Email</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Role</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Status</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Created</th>
                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredUsers.map((u) => {
                        const isActioning = actioningId === u._id;
                        const isSelf = u._id === user?._id || u._id === user?.id;
                        return (
                          <tr key={u._id} className="group transition hover:bg-slate-50/60">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                                  {u.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900">{u.name}</p>
                                  {isSelf && <span className="text-[10px] text-slate-400">You</span>}
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-slate-500">{u.email}</td>
                            <td className="px-5 py-3.5">
                              {isSelf ? (
                                <span className={`inline-flex rounded-lg border px-2.5 py-0.5 text-xs font-semibold ${ROLE_COLORS[u.role]}`}>
                                  {ROLE_LABELS[u.role]}
                                </span>
                              ) : (
                                <select
                                  value={u.role}
                                  disabled={isActioning}
                                  onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                  className={`rounded-lg border px-2.5 py-0.5 text-xs font-semibold transition cursor-pointer disabled:cursor-not-allowed ${ROLE_COLORS[u.role]}`}
                                >
                                  <option value="employee">Employee</option>
                                  <option value="approver">Approver</option>
                                  <option value="admin">Admin</option>
                                </select>
                              )}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={[
                                'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                                u.isActive
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-slate-100 text-slate-500'
                              ].join(' ')}>
                                <span className={`h-1.5 w-1.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                {u.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-xs text-slate-400">{formatDate(u.createdAt)}</td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center justify-end gap-1.5">
                                {!isSelf && (
                                  <>
                                    <button
                                      onClick={() => handleToggleStatus(u._id, u.isActive)}
                                      disabled={isActioning}
                                      title={u.isActive ? 'Deactivate' : 'Activate'}
                                      className={[
                                        'flex h-7 w-7 items-center justify-center rounded-lg border transition disabled:opacity-40',
                                        u.isActive
                                          ? 'border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100'
                                          : 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                      ].join(' ')}
                                    >
                                      {isActioning
                                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        : u.isActive
                                        ? <UserMinus className="h-3.5 w-3.5" />
                                        : <UserCheck className="h-3.5 w-3.5" />
                                      }
                                    </button>
                                    <button
                                      onClick={() => handleDelete(u._id, u.name)}
                                      disabled={isActioning}
                                      title="Delete user"
                                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-500 transition hover:bg-rose-100 disabled:opacity-40"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </>
                                )}
                                {isSelf && (
                                  <span className="text-xs text-slate-300">—</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile card list */}
                <div className="divide-y divide-slate-100 md:hidden">
                  {filteredUsers.map((u) => {
                    const isActioning = actioningId === u._id;
                    const isSelf = u._id === user?._id || u._id === user?.id;
                    return (
                      <div key={u._id} className="px-4 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900">{u.name} {isSelf && <span className="text-xs text-slate-400">(you)</span>}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              <span className={`rounded-lg border px-2 py-0.5 text-xs font-semibold ${ROLE_COLORS[u.role]}`}>
                                {ROLE_LABELS[u.role]}
                              </span>
                              <span className={[
                                'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                                u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                              ].join(' ')}>
                                {u.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                          {!isSelf && (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleToggleStatus(u._id, u.isActive)}
                                disabled={isActioning}
                                className={[
                                  'flex h-8 w-8 items-center justify-center rounded-lg border transition disabled:opacity-40',
                                  u.isActive
                                    ? 'border-amber-200 bg-amber-50 text-amber-600'
                                    : 'border-emerald-200 bg-emerald-50 text-emerald-600'
                                ].join(' ')}
                              >
                                {isActioning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : u.isActive ? <UserMinus className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                              </button>
                              <button
                                onClick={() => handleDelete(u._id, u.name)}
                                disabled={isActioning}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-500 transition disabled:opacity-40"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </Layout>

      {/* Create user modal */}
      <AnimatePresence>
        {showModal && (
          <CreateUserModal
            onClose={() => setShowModal(false)}
            onCreated={(newUser) => {
              setUsers((prev) => [newUser, ...prev]);
              showToast('User created successfully.');
            }}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className={[
              'fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-xl',
              toast.type === 'success'
                ? 'border-emerald-200 bg-white text-emerald-700'
                : 'border-rose-200 bg-white text-rose-700'
            ].join(' ')}
          >
            {toast.type === 'success'
              ? <CheckCircle className="h-4 w-4 shrink-0" />
              : <X className="h-4 w-4 shrink-0" />
            }
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AdminUsers;
