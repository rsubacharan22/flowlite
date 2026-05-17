import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock3,
  Loader2,
  SlidersHorizontal,
  ShieldCheck,
  TrendingUp,
  Users,
  XCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import api from '../api/http';
import EmptyState from '../components/EmptyState';
import Layout from '../components/Layout';
import MetricCard from '../components/MetricCard';
import RequestCard from '../components/RequestCard';
import { ROLES } from '../utils/auth';
import { useAuth } from '../hooks/useAuth';
import { staggerContainer } from '../utils/motion';
import { buildRequestMetrics, isOverdue } from '../utils/requests';
import { isEmployeeRequest } from '../utils/formatters';

const EMPLOYEE_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' }
];

const APPROVER_FILTERS = {
  type: [
    { label: 'All Types', value: 'all' },
    { label: 'HR Requests', value: 'hr' },
    { label: 'Assigned Tasks', value: 'tasks' }
  ],
  status: [
    { label: 'All Statuses', value: 'all' },
    { label: 'Not Completed', value: 'pending' },
    { label: 'Completed', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Overdue', value: 'overdue' }
  ],
  priority: [
    { label: 'All Priorities', value: 'all' },
    { label: 'High Priority', value: 'high' },
    { label: 'Medium Priority', value: 'medium' },
    { label: 'Low Priority', value: 'low' }
  ]
};

// ── Filter toolbar ─────────────────────────────────────────────────────────────
function FilterBar({ filter, onChange, filters }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <SlidersHorizontal className="h-3.5 w-3.5" />
        </span>
        Filter
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
        {filters.map((item) => (
          <button
            key={item.value}
            onClick={() => onChange(item.value)}
            className={[
              'whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition',
              filter === item.value
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
            ].join(' ')}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Employee: My Requests dashboard ──────────────────────────────────────────
function EmployeeDashboard({ requests, loading, filter, onFilterChange, search, user, actioningId, remarks, onApprove, onReject, onRemarkChange }) {
  const filteredRequests = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests.filter((r) => {
      const text = [r.title, r.description, r.status]
        .filter(Boolean).join(' ').toLowerCase();
      const matchSearch = !q || text.includes(q);
      const matchFilter = filter === 'all' || r.status === filter;
      return matchSearch && matchFilter;
    });
  }, [filter, requests, search]);

  // Status summary pills
  const counts = useMemo(() => ({
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length
  }), [requests]);

  return (
    <>
      {/* Status summary */}
      <div className="mb-5 flex flex-wrap gap-3">
        {[
          { key: 'pending', color: 'bg-amber-50 text-amber-700 border-amber-200' },
          { key: 'approved', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
          { key: 'rejected', color: 'bg-rose-50 text-rose-700 border-rose-200' }
        ].map(({ key, color }) => (
          <div key={key} className={`rounded-xl border px-4 py-2 ${color}`}>
            <p className="text-xs font-semibold capitalize">{key}</p>
            <p className="mt-0.5 text-2xl font-bold">{counts[key]}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3 shadow-card">
        <FilterBar filter={filter} onChange={onFilterChange} filters={EMPLOYEE_FILTERS} />
      </div>

      {/* Request feed */}
      <motion.div
        className="space-y-3"
        initial="hidden"
        animate="show"
        variants={staggerContainer}
      >
        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : filteredRequests.length ? (
          filteredRequests.map((request) => (
            <RequestCard
              busy={actioningId === request._id}
              key={request._id}
              onApprove={onApprove}
              onReject={onReject}
              onRemarkChange={onRemarkChange}
              remark={remarks[request._id] || ''}
              request={request}
              user={user}
            />
          ))
        ) : (
          <EmptyState
            title="No requests"
            message={filter !== 'all' ? 'No requests match this filter.' : 'Your submitted requests will appear here.'}
          />
        )}
      </motion.div>
    </>
  );
}

function ApproverDashboard({
  requests,
  loading,
  filters,
  onFilterChange,
  search,
  user,
  actioningId,
  remarks,
  onApprove,
  onReject,
  onRemarkChange
}) {
  const metrics = useMemo(() => buildRequestMetrics(requests), [requests]);

  const filteredRequests = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests.filter((r) => {
      const text = [r.title, r.description, r.createdBy?.name, r.priority, r.status]
        .filter(Boolean).join(' ').toLowerCase();
      const matchSearch = !q || text.includes(q);
      
      const matchType = 
        filters.type === 'all' ||
        (filters.type === 'hr' && isEmployeeRequest(r)) ||
        (filters.type === 'tasks' && !isEmployeeRequest(r));
        
      const matchStatus = 
        filters.status === 'all' ||
        r.status === filters.status ||
        (filters.status === 'overdue' && isOverdue(r));
        
      const matchPriority = 
        filters.priority === 'all' ||
        r.priority === filters.priority;

      return matchSearch && matchType && matchStatus && matchPriority;
    });
  }, [filters, requests, search]);

  return (
    <>
      {/* KPI cards */}
      <div className="mb-6">
        <motion.div
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
          initial="hidden" animate="show" variants={staggerContainer}
        >
          <MetricCard icon={Clock3} title="Pending" tone="amber" value={metrics.pending} />
          <MetricCard icon={CheckCircle2} title="Approved" tone="emerald" value={metrics.approved} />
          <MetricCard icon={XCircle} title="Rejected" tone="rose" value={metrics.rejected} />
          <MetricCard
            icon={TrendingUp}
            title="Approval Rate"
            tone="blue"
            value={`${metrics.approvalRate}%`}
            detail={`${metrics.total} total tasks`}
          />
        </motion.div>
      </div>

      {/* Streamlined Filter Bar */}
      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-card sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 sm:w-1/4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </span>
          Filters
        </div>
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={filters.type}
            onChange={(e) => onFilterChange('type', e.target.value)}
            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            {APPROVER_FILTERS.type.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            {APPROVER_FILTERS.status.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          <select
            value={filters.priority}
            onChange={(e) => onFilterChange('priority', e.target.value)}
            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            {APPROVER_FILTERS.priority.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Request feed */}
      <motion.div
        className="space-y-3"
        initial="hidden" animate="show" variants={staggerContainer}
      >
        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : filteredRequests.length ? (
          filteredRequests.map((request) => (
            <RequestCard
              busy={actioningId === request._id}
              key={request._id}
              onApprove={onApprove}
              onReject={onReject}
              onRemarkChange={onRemarkChange}
              remark={remarks[request._id] || ''}
              request={request}
              user={user}
            />
          ))
        ) : (
          <EmptyState
            title="No tasks found"
            message={filters.type !== 'all' || filters.status !== 'all' || filters.priority !== 'all' ? 'No tasks match these filters.' : 'Tasks assigned to employees will appear here once submitted.'}
          />
        )}
      </motion.div>
    </>
  );
}

// ── Admin: Governance overview (read-only) ─────────────────────────────────────
function AdminDashboard({ requests, overviewRequests, loading }) {
  const metrics = useMemo(() => buildRequestMetrics(overviewRequests), [overviewRequests]);

  // Quick stats for assigned approvers
  const approverStats = useMemo(() => {
    const map = {};
    overviewRequests.forEach((r) => {
      const name = r.assignedTo?.name;
      if (!name) return;
      if (!map[name]) map[name] = { name, total: 0, pending: 0, approved: 0 };
      map[name].total++;
      if (r.status === 'pending') map[name].pending++;
      if (r.status === 'approved') map[name].approved++;
    });
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [overviewRequests]);

  const recentActivity = useMemo(() => overviewRequests.slice(0, 6), [overviewRequests]);

  return (
    <>
      {/* Org-wide KPI strip */}
      <div className="mb-6">
        <motion.div
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
          initial="hidden" animate="show" variants={staggerContainer}
        >
          <MetricCard icon={ShieldCheck} title="Total" tone="blue" value={metrics.total} />
          <MetricCard icon={Clock3} title="Pending" tone="amber" value={metrics.pending} />
          <MetricCard icon={CheckCircle2} title="Approved" tone="emerald" value={metrics.approved} />
          <MetricCard icon={XCircle} title="Rejected" tone="rose" value={metrics.rejected} />
          <MetricCard icon={AlertCircle} title="Overdue" tone="violet" value={metrics.overdue} />
        </motion.div>
      </div>

      {loading ? (
        <div className="flex min-h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1fr_1.4fr]">
          {/* Approver workload */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-bold text-slate-900">Approver Workload</h2>
            </div>
            {approverStats.length ? (
              <div className="space-y-3">
                {approverStats.map((a) => (
                  <div key={a.name} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{a.name}</p>
                      <p className="text-xs text-slate-400">{a.total} total · {a.pending} pending</p>
                    </div>
                    <div className="text-right">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                        {a.total ? Math.round((a.approved / a.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No data yet.</p>
            )}
          </div>

          {/* Recent activity */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <h2 className="mb-4 text-sm font-bold text-slate-900">Recent Activity</h2>
            {recentActivity.length ? (
              <div className="divide-y divide-slate-50">
                {recentActivity.map((r) => (
                  <div key={r._id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{r.title}</p>
                      <p className="text-xs text-slate-400 truncate">
                        {r.createdBy?.name || '—'} → {r.assignedTo?.name || '—'}
                      </p>
                    </div>
                    <span className={[
                      'shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold',
                      r.status === 'approved' ? 'bg-emerald-100 text-emerald-700'
                      : r.status === 'rejected' ? 'bg-rose-100 text-rose-700'
                      : 'bg-amber-100 text-amber-700'
                    ].join(' ')}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No recent activity.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isEmployee, isAdmin, isApprover } = useAuth();

  const [requests, setRequests] = useState([]);
  const [overviewRequests, setOverviewRequests] = useState([]);
  const [remarks, setRemarks] = useState({});
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [approverFilters, setApproverFilters] = useState({ type: 'all', status: 'all', priority: 'all' });
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState('');

  const fetchRequests = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token || !user) {
      navigate('/', { replace: true });
      return;
    }

    try {
      setLoading(true);

      if (isAdmin) {
        // Admin sees org-wide overview only
        const allRes = await api.get('/api/requests/all');
        setOverviewRequests(allRes.data);
        setRequests([]);
      } else if (isEmployee) {
        const res = await api.get('/api/requests/my');
        setRequests(res.data);
      } else {
        // Approver sees their own task queue
        const res = await api.get('/api/requests/assigned');
        setRequests(res.data);
      }
    } catch {
      // silently handle — empty state shown
    } finally {
      setLoading(false);
    }
  }, [navigate, isEmployee, isAdmin, user]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Highlight request from notification
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const highlightId = searchParams.get('highlight');
    if (highlightId && !loading && requests.length > 0) {
      setTimeout(() => {
        const el = document.getElementById(`req-${highlightId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2');
          setTimeout(() => el.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2'), 3000);
        }
      }, 100);
    }
  }, [location.search, loading, requests]);

  const updateRemark = useCallback((id, value) =>
    setRemarks((cur) => ({ ...cur, [id]: value })), []);

  const reviewRequest = async (id, action) => {
    try {
      setActioningId(id);
      await api.put(`/api/requests/${action}/${id}`, { remark: remarks[id] || '' });
      setRemarks((cur) => {
        const next = { ...cur };
        delete next[id];
        return next;
      });
      await fetchRequests();
    } catch {
      // silently handle
    } finally {
      setActioningId('');
    }
  };

  const displayedEmployeeRequests = useMemo(() => {
    if (!isEmployee) return [];
    if (location.pathname === '/dashboard') {
      // My Tasks -> Only assigned tasks (not HR requests)
      return requests.filter(r => !isEmployeeRequest(r));
    }
    // My Requests -> Only HR requests
    return requests.filter(r => isEmployeeRequest(r));
  }, [requests, isEmployee, location.pathname]);

  const pageTitle = isEmployee
    ? (location.pathname === '/dashboard' ? 'My Tasks' : 'My Requests')
    : isAdmin
    ? 'Admin Dashboard'
    : 'Dashboard';

  const pageSubtitle = isEmployee
    ? (location.pathname === '/dashboard' ? 'Tasks assigned to you.' : 'Your submitted HR requests.')
    : isAdmin
    ? 'Organizational overview across all workflows.'
    : 'Your team\'s task and request activity.';

  return (
    <Layout
      onSearchChange={isEmployee || isApprover ? setSearch : undefined}
      searchPlaceholder={isEmployee ? 'Search requests' : 'Search tasks'}
      searchValue={search}
      title={pageTitle}
      subtitle={pageSubtitle}
    >
      <div className="mx-auto max-w-7xl">
        {isEmployee ? (
          <EmployeeDashboard
            requests={displayedEmployeeRequests}
            loading={loading}
            filter={filter}
            onFilterChange={setFilter}
            search={search}
            user={user}
            actioningId={actioningId}
            remarks={remarks}
            onApprove={(id) => reviewRequest(id, 'approve')}
            onReject={(id) => reviewRequest(id, 'reject')}
            onRemarkChange={updateRemark}
          />
        ) : isAdmin ? (
          <AdminDashboard
            requests={requests}
            overviewRequests={overviewRequests}
            loading={loading}
          />
        ) : isApprover ? (
          <ApproverDashboard
            requests={requests}
            loading={loading}
            filters={approverFilters}
            onFilterChange={(k, v) => setApproverFilters(cur => ({ ...cur, [k]: v }))}
            search={search}
            user={user}
            actioningId={actioningId}
            remarks={remarks}
            onApprove={(id) => reviewRequest(id, 'approve')}
            onReject={(id) => reviewRequest(id, 'reject')}
            onRemarkChange={updateRemark}
          />
        ) : null}
      </div>
    </Layout>
  );
}

export default Dashboard;
