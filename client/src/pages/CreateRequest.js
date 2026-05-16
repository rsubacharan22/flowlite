import { CalendarClock, CheckCircle, FileText, Flag, Loader2, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../api/http';
import Button from '../components/Button';
import Layout from '../components/Layout';
import { ROLES } from '../utils/auth';
import { useAuth } from '../hooks/useAuth';
import { REQUEST_TYPES } from '../utils/formatters';

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'text-sky-600 border-sky-200 bg-sky-50' },
  { value: 'medium', label: 'Medium', color: 'text-amber-600 border-amber-200 bg-amber-50' },
  { value: 'high', label: 'High', color: 'text-rose-600 border-rose-200 bg-rose-50' }
];

// ── Shared field wrapper ────────────────────────────────────────────────────────
function FieldGroup({ label, icon: Icon, children, hint }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

// ── Status feedback banner ──────────────────────────────────────────────────────
function StatusBanner({ status }) {
  if (!status) return null;
  return (
    <AnimatePresence>
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
    </AnimatePresence>
  );
}

// ── SYSTEM 1: Employee HR Request Form ─────────────────────────────────────────
// Simple self-service: request type, reason, optional date.
// No manager picker — auto-assigned to first available approver by backend.
function EmployeeForm() {
  const [requestType, setRequestType] = useState('');
  const [reason, setReason] = useState('');
  const [requestDate, setRequestDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!requestType) {
      setStatus({ type: 'error', message: 'Please select a request type.' });
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/api/requests/create', {
        title: requestType,
        description: reason,
        priority: 'medium',
        deadline: requestDate || undefined
        // assignedTo is omitted — backend auto-assigns to first available approver
      });
      setRequestType('');
      setReason('');
      setRequestDate('');
      setStatus({ type: 'success', message: 'Your request has been submitted for review.' });
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.message || 'Something went wrong. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Request type */}
          <FieldGroup label="Request Type" icon={FileText}>
            <select
              className="field"
              value={requestType}
              onChange={(e) => setRequestType(e.target.value)}
              required
            >
              <option value="">Select type...</option>
              {REQUEST_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </FieldGroup>

          {/* Reason / description */}
          <FieldGroup label="Reason" icon={FileText} hint="Optional — briefly describe your request.">
            <textarea
              className="field min-h-[100px] resize-none"
              placeholder="Briefly describe your reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </FieldGroup>

          {/* Date (optional) */}
          <FieldGroup label="Date (optional)" icon={CalendarClock} hint="Leave blank if not applicable.">
            <input
              className="field"
              type="date"
              value={requestDate}
              onChange={(e) => setRequestDate(e.target.value)}
            />
          </FieldGroup>

          <StatusBanner status={status} />

          <Button className="w-full" disabled={submitting} type="submit">
            {submitting
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
              : 'Submit Request'
            }
          </Button>
        </form>
      </div>
    </div>
  );
}

// ── SYSTEM 2: Approver Operational Task Assignment Form ────────────────────────
// Full task creation: title, instructions, assign employee, priority, deadline.
function OperationalForm({ users }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('medium');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  // Only show employees (approvers assign downward)
  const employees = users.filter((u) => u.role === ROLES.EMPLOYEE);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!title.trim() || !assignedTo) {
      setStatus({ type: 'error', message: 'Task title and assignee are required.' });
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/api/requests/create', {
        title: title.trim(),
        description,
        assignedTo,
        priority,
        deadline: deadline || undefined
      });
      setTitle('');
      setDescription('');
      setAssignedTo('');
      setPriority('medium');
      setDeadline('');
      setStatus({ type: 'success', message: 'Task assigned successfully.' });
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.message || 'Something went wrong.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="border-b border-slate-100 px-6 py-4 sm:px-8">
          <h2 className="text-base font-semibold text-slate-950">Task details</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Fill in the task details and assign it to a team member.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
          {/* Task title — full width */}
          <div className="sm:col-span-2">
            <FieldGroup label="Task Title" icon={FileText}>
              <input
                className="field"
                placeholder="e.g. Review Q2 expense reports"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </FieldGroup>
          </div>

          {/* Instructions — full width */}
          <div className="sm:col-span-2">
            <FieldGroup label="Instructions">
              <textarea
                className="field min-h-[96px] resize-none"
                placeholder="Additional context or instructions for the assignee..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </FieldGroup>
          </div>

          {/* Assign to employee */}
          <FieldGroup label="Assign To" icon={UserCheck}>
            <select
              className="field"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              required
            >
              <option value="">Select team member...</option>
              {employees.map((u) => (
                <option key={u._id} value={u._id}>{u.name}</option>
              ))}
            </select>
          </FieldGroup>

          {/* Deadline */}
          <FieldGroup label="Deadline" icon={CalendarClock}>
            <input
              className="field"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </FieldGroup>

          {/* Priority — full width */}
          <div className="sm:col-span-2">
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Flag className="h-4 w-4 text-slate-400" />
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPriority(opt.value)}
                  className={[
                    'rounded-xl border px-3 py-2.5 text-sm font-semibold capitalize transition',
                    priority === opt.value
                      ? opt.color + ' shadow-sm'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          {status && (
            <div className="sm:col-span-2">
              <StatusBanner status={status} />
            </div>
          )}

          {/* Submit */}
          <div className="sm:col-span-2">
            <Button className="w-full" disabled={submitting} type="submit">
              {submitting
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Assigning task...</>
                : 'Assign Task'
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
function CreateRequest() {
  const navigate = useNavigate();
  const { user, isEmployee, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('token') || !user) {
      navigate('/', { replace: true });
      return;
    }

    // Admin has no task creation — redirect to analytics
    if (isAdmin) {
      navigate('/analytics', { replace: true });
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        // Employee doesn't need user list; only approver does
        if (!isEmployee) {
          const res = await api.get('/api/users');
          setUsers(res.data);
        }
      } catch {
        // silently fail — form will show empty dropdown
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [navigate, user, isEmployee, isAdmin]);

  const pageTitle = isEmployee ? 'Submit Request' : 'Assign Task';
  const pageSubtitle = isEmployee
    ? 'Submit a request to your manager for review.'
    : 'Assign an operational task to a team member.';

  return (
    <Layout title={pageTitle} subtitle={pageSubtitle}>
      <div className="mx-auto max-w-7xl">
        {loadingUsers && !isEmployee ? (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : isEmployee ? (
          <EmployeeForm />
        ) : (
          <OperationalForm users={users} />
        )}
      </div>
    </Layout>
  );
}

export default CreateRequest;
