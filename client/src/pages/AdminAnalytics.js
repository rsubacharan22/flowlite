import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock3,
  Gauge,
  Loader2,
  XCircle
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import api from '../api/http';
import Badge from '../components/Badge';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import Layout from '../components/Layout';
import MetricCard from '../components/MetricCard';
import { canAccessAnalytics, ROLES } from '../utils/auth';
import { useAuth } from '../hooks/useAuth';
import {
  buildRequestMetrics,
  buildWorkerStats,
  formatDate,
  getPriority
} from '../utils/requests';
import { isEmployeeRequest } from '../utils/formatters';

const CHART_COLORS = {
  approved: '#10b981',
  pending: '#f59e0b',
  rejected: '#f43f5e',
  low: '#0ea5e9',
  medium: '#f59e0b',
  high: '#f43f5e',
  workload: '#2563eb',
  rate: '#7c3aed'
};

// ── Custom chart tooltip ──────────────────────────────────────────────────────
function ChartTooltip({ active, label, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-card">
      {label && <p className="mb-1 font-semibold text-slate-800">{label}</p>}
      {payload.map((item) => (
        <p key={item.dataKey || item.name} className="text-slate-500">
          {item.name}:{' '}
          <span className="font-semibold text-slate-900">{item.value}</span>
        </p>
      ))}
    </div>
  );
}

// ── Donut legend row ──────────────────────────────────────────────────────────
function DonutLegendRow({ label, value, total, color }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-sm text-slate-600">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-slate-900">{value}</span>
        <span className="text-xs text-slate-400">{pct}%</span>
      </div>
    </div>
  );
}

// ── Worker performance card ───────────────────────────────────────────────────
function WorkerCard({ worker }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-950">{worker.worker}</p>
          <p className="mt-0.5 text-xs text-slate-400">{worker.total} total requests</p>
        </div>
        <div className="rounded-lg bg-slate-100 px-2.5 py-1 text-sm font-bold text-slate-700">
          {worker.approvalRate}%
        </div>
      </div>

      {/* Mini progress bars */}
      <div className="mt-4 space-y-2">
        {[
          { label: 'Approved', value: worker.approved, color: 'bg-emerald-500' },
          { label: 'Pending', value: worker.pending, color: 'bg-amber-500' },
          { label: 'Rejected', value: worker.rejected, color: 'bg-rose-500' }
        ].map(({ label, value, color }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="w-14 shrink-0 text-xs text-slate-500">{label}</span>
            <div className="flex-1 overflow-hidden rounded-full bg-slate-100" style={{ height: 5 }}>
              <div
                className={`h-full rounded-full ${color}`}
                style={{ width: `${worker.total ? (value / worker.total) * 100 : 0}%` }}
              />
            </div>
            <span className="w-6 shrink-0 text-right text-xs font-semibold text-slate-700">
              {value}
            </span>
          </div>
        ))}
      </div>

      {worker.overdue > 0 && (
        <p className="mt-3 text-xs font-medium text-rose-600">{worker.overdue} overdue</p>
      )}
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
function AdminAnalytics() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('all'); // all, hr, tasks

  useEffect(() => {
    const fetchRequests = async () => {
      if (!localStorage.getItem('token') || !user) {
        navigate('/', { replace: true });
        return;
      }
      if (!canAccessAnalytics(user)) {
        navigate('/dashboard', { replace: true });
        return;
      }

      try {
        setLoading(true);
        const res = await api.get('/api/requests/all');
        setRequests(res.data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [navigate, user]);

  const visibleRequestsForMetrics = useMemo(() => {
    if (viewMode === 'hr') return requests.filter(r => isEmployeeRequest(r));
    if (viewMode === 'tasks') return requests.filter(r => !isEmployeeRequest(r));
    return requests;
  }, [requests, viewMode]);

  const metrics = useMemo(() => buildRequestMetrics(visibleRequestsForMetrics), [visibleRequestsForMetrics]);
  const workerStats = useMemo(() => buildWorkerStats(visibleRequestsForMetrics), [visibleRequestsForMetrics]);

  const statusData = useMemo(() => ([
    { name: 'Approved', value: metrics.approved, key: 'approved' },
    { name: 'Pending', value: metrics.pending, key: 'pending' },
    { name: 'Rejected', value: metrics.rejected, key: 'rejected' }
  ]), [metrics]);

  const priorityData = useMemo(() => (
    ['low', 'medium', 'high'].map((p) => ({
      name: p,
      value: visibleRequestsForMetrics.filter((r) => getPriority(r.priority) === p).length
    }))
  ), [visibleRequestsForMetrics]);

  const normalizedSearch = search.trim().toLowerCase();

  const visibleWorkerStats = useMemo(() => {
    if (!normalizedSearch) return workerStats;
    return workerStats.filter((w) => w.worker.toLowerCase().includes(normalizedSearch));
  }, [normalizedSearch, workerStats]);

  const recentRequests = useMemo(() => {
    const matching = normalizedSearch
      ? visibleRequestsForMetrics.filter((r) =>
          [r.title, r.createdBy?.name, r.assignedTo?.name, r.status, r.priority]
            .filter(Boolean).join(' ').toLowerCase().includes(normalizedSearch)
        )
      : visibleRequestsForMetrics;
    return matching.slice(0, 8);
  }, [normalizedSearch, visibleRequestsForMetrics]);

  const pageTitle = user?.role === ROLES.ADMIN ? 'Analytics' : 'Team Analytics';
  const pageSubtitle = user?.role === ROLES.ADMIN
    ? 'Full workforce activity across all request queues.'
    : 'Performance metrics for tasks in your queue.';

  return (
    <Layout
      onSearchChange={setSearch}
      searchPlaceholder="Search workers or requests"
      searchValue={search}
      title={pageTitle}
      subtitle={pageSubtitle}
    >
      <div className="mx-auto max-w-7xl">
        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : requests.length ? (
          <>
            <div className="mb-5 flex gap-2">
              <button
                onClick={() => setViewMode('all')}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${viewMode === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                All Data
              </button>
              <button
                onClick={() => setViewMode('hr')}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${viewMode === 'hr' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                HR Requests
              </button>
              <button
                onClick={() => setViewMode('tasks')}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${viewMode === 'tasks' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                Assigned Tasks
              </button>
            </div>

            {/* ── KPI row ── */}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
              <MetricCard icon={Activity} title="Total" tone="blue" value={metrics.total} />
              <MetricCard icon={CheckCircle2} title="Approved" tone="emerald" value={metrics.approved} />
              <MetricCard icon={Clock3} title="Pending" tone="amber" value={metrics.pending} />
              <MetricCard icon={XCircle} title="Rejected" tone="rose" value={metrics.rejected} />
              <MetricCard icon={AlertCircle} title="Overdue" tone="violet" value={metrics.overdue} />
              <MetricCard icon={Gauge} title="Approval Rate" tone="slate" value={`${metrics.approvalRate}%`} />
            </div>

            {/* ── Charts row 1 ── */}
            <div className="mt-5 grid gap-5 xl:grid-cols-2">
              {/* Status donut */}
              <Card hover={false}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-950">Status Distribution</h2>
                    <p className="mt-0.5 text-sm text-slate-400">Approved · Pending · Rejected</p>
                  </div>
                  <BarChart3 className="h-4 w-4 text-slate-300" />
                </div>
                <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-6">
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          animationDuration={800}
                          data={statusData}
                          dataKey="value"
                          innerRadius="55%"
                          outerRadius="80%"
                          paddingAngle={3}
                          nameKey="name"
                        >
                          {statusData.map((entry) => (
                            <Cell fill={CHART_COLORS[entry.key]} key={entry.key} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3 pr-2">
                    {statusData.map((entry) => (
                      <DonutLegendRow
                        key={entry.key}
                        label={entry.name}
                        value={entry.value}
                        total={metrics.total}
                        color={CHART_COLORS[entry.key]}
                      />
                    ))}
                  </div>
                </div>
              </Card>

              {/* Workload bar */}
              <Card hover={false}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-950">Workload by Approver</h2>
                    <p className="mt-0.5 text-sm text-slate-400">Assigned request volume</p>
                  </div>
                </div>
                <div className="mt-4 h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={workerStats} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                      <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        axisLine={false}
                        dataKey="worker"
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        axisLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        tickLine={false}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar
                        animationDuration={800}
                        dataKey="total"
                        fill={CHART_COLORS.workload}
                        name="Total"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* ── Charts row 2 ── */}
            <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
              {/* Approval rates bar */}
              <Card hover={false}>
                <h2 className="text-base font-bold text-slate-950">Approval Rates by Approver</h2>
                <div className="mt-4 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={workerStats} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                      <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        axisLine={false}
                        dataKey="worker"
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        tickLine={false}
                      />
                      <YAxis
                        axisLine={false}
                        domain={[0, 100]}
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        tickFormatter={(v) => `${v}%`}
                        tickLine={false}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar
                        animationDuration={800}
                        dataKey="approvalRate"
                        fill={CHART_COLORS.rate}
                        name="Approval Rate"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Priority mix */}
              <Card hover={false}>
                <h2 className="text-base font-bold text-slate-950">Priority Breakdown</h2>
                <div className="mt-4 space-y-3">
                  {priorityData.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                    >
                      <Badge type="priority" value={item.name} />
                      <div className="flex items-center gap-3">
                        <div className="w-24 overflow-hidden rounded-full bg-slate-200" style={{ height: 5 }}>
                          <div
                            className={`h-full rounded-full ${
                              item.name === 'high'
                                ? 'bg-rose-500'
                                : item.name === 'medium'
                                ? 'bg-amber-500'
                                : 'bg-sky-500'
                            }`}
                            style={{ width: `${metrics.total ? (item.value / metrics.total) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="w-6 text-right text-sm font-bold text-slate-900">
                          {item.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* ── Worker performance grid ── */}
            {visibleWorkerStats.length > 0 && (
              <div className="mt-5">
                <h2 className="mb-3 text-base font-bold text-slate-950">Approver Performance</h2>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {visibleWorkerStats.map((worker) => (
                    <WorkerCard key={worker.worker} worker={worker} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Recent requests table ── */}
            <Card className="mt-5" hover={false}>
              <h2 className="text-base font-bold text-slate-950">Recent Requests</h2>
              <div className="mt-4 divide-y divide-slate-100">
                {recentRequests.map((request) => (
                  <div
                    className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                    key={request._id}
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{request.title}</p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {request.createdBy?.name || 'Unknown'} → {request.assignedTo?.name || 'Unassigned'}
                        {request.deadline && ` · ${formatDate(request.deadline)}`}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge value={request.status} />
                      <Badge type="priority" value={getPriority(request.priority)} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        ) : (
          <EmptyState
            title="No analytics data yet"
            message="Analytics will populate once requests are created and reviewed."
          />
        )}
      </div>
    </Layout>
  );
}

export default AdminAnalytics;
