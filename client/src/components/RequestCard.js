import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  MessageSquare,
  Send,
  UserRound,
  XCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

import Badge from './Badge';
import Button from './Button';
import { canReview } from '../utils/auth';
import { formatDate, getPriority, isOverdue } from '../utils/requests';
import { isEmployeeRequest, timeAgo } from '../utils/formatters';
import { fadeInUp } from '../utils/motion';

function HistoryTimeline({ history }) {
  if (!history?.length) return null;

  return (
    <div className="mt-5 border-t border-slate-100 pt-4">
      <p className="section-label mb-3">Activity</p>
      <div className="space-y-2">
        {history.map((item) => (
          <div
            key={item._id}
            className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2.5"
          >
            <span
              className={[
                'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                item.action === 'approved'
                  ? 'bg-emerald-100 text-emerald-700'
                  : item.action === 'rejected'
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-slate-200 text-slate-600'
              ].join(' ')}
            >
              {item.action === 'approved' ? '✓' : item.action === 'rejected' ? '✕' : '·'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold capitalize text-slate-700">
                {item.action} by {item.by?.name || 'Reviewer'}
              </p>
              {item.remark && (
                <p className="mt-0.5 text-xs text-slate-500 italic">"{item.remark}"</p>
              )}
            </div>
            {item.at && (
              <span className="shrink-0 text-[10px] text-slate-400">{timeAgo(item.at)}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Employee HR Request Card ──────────────────────────────────────────────────
function EmployeeRequestCard({ request }) {
  const submittedTo = request.assignedTo?.name || 'Manager';
  const submittedAt = timeAgo(request.createdAt);

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="show"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border border-slate-200 bg-white shadow-card transition-shadow hover:shadow-card-hover"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {/* Type + status */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge value={request.status} />
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                {request.title}
              </span>
            </div>

            {/* Description */}
            {request.description && (
              <p className="mt-3 text-sm leading-relaxed text-slate-600 line-clamp-2">
                {request.description}
              </p>
            )}

            {/* Meta */}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Send className="h-3.5 w-3.5" />
                Submitted to {submittedTo}
              </span>
              {request.deadline && (
                <span className="flex items-center gap-1.5">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {formatDate(request.deadline)}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5" />
                {submittedAt}
              </span>
            </div>
          </div>
        </div>
      </div>

      <HistoryTimeline history={request.history} />
      {request.history?.length > 0 && <div className="h-4" />}
    </motion.div>
  );
}

// ── Operational Task Card (Approver / Admin) ──────────────────────────────────
function OperationalCard({
  busy,
  onApprove,
  onReject,
  onRemarkChange,
  remark,
  request,
  user
}) {
  const mayReview = (canReview(user) || user?.role === 'employee') && request.status === 'pending';
  const isEmployee = user?.role === 'employee';
  const overdue = isOverdue(request);

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="show"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border border-slate-200 bg-white shadow-card transition-shadow hover:shadow-card-hover"
    >
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          {/* Left: info */}
          <div className="min-w-0 flex-1">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge value={request.status} />
              <Badge type="priority" value={getPriority(request.priority)} />
              {overdue && (
                <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                  <Clock3 className="h-3 w-3" />
                  Overdue
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="mt-3 text-[17px] font-bold tracking-tight text-slate-950">
              {request.title}
            </h3>

            {/* Description */}
            {request.description && (
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500 line-clamp-2">
                {request.description}
              </p>
            )}

            {/* Meta row */}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <UserRound className="h-3.5 w-3.5" />
                {request.createdBy?.name || 'Unknown'}
              </span>
              <span className="flex items-center gap-1.5">
                <Send className="h-3.5 w-3.5" />
                {request.assignedTo?.name || 'Unassigned'}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarClock className="h-3.5 w-3.5" />
                {formatDate(request.deadline) || 'No deadline'}
              </span>
            </div>
          </div>

          {/* Right: review controls (approver/admin on pending only) */}
          {mayReview && (
            <div className="w-full shrink-0 space-y-2.5 xl:w-72">
              <div className="relative">
                <MessageSquare className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <textarea
                  className="field min-h-[72px] resize-none pl-10 text-xs"
                  onChange={(e) => onRemarkChange(request._id, e.target.value)}
                  placeholder="Add a remark (optional)"
                  value={remark}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  disabled={busy}
                  icon={CheckCircle2}
                  onClick={() => onApprove(request._id)}
                >
                  {isEmployee ? 'Complete Task' : 'Approve'}
                </Button>
                <Button
                  danger
                  disabled={busy}
                  icon={XCircle}
                  onClick={() => onReject(request._id)}
                >
                  {isEmployee ? 'Cannot Complete' : 'Reject'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <HistoryTimeline history={request.history} />
      {request.history?.length > 0 && <div className="h-4 px-6" />}
    </motion.div>
  );
}

// ── Public export: auto-selects card mode ─────────────────────────────────────
function RequestCard(props) {
  const { request, user } = props;

  if (isEmployeeRequest(request) && user?.role === 'employee') {
    return <EmployeeRequestCard request={request} />;
  }

  return <OperationalCard {...props} />;
}

export default RequestCard;
