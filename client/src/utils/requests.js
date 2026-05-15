export const statusMeta = {
  pending: {
    label: 'Pending',
    className: 'border-amber-200 bg-amber-50 text-amber-700'
  },
  approved: {
    label: 'Approved',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700'
  },
  rejected: {
    label: 'Rejected',
    className: 'border-rose-200 bg-rose-50 text-rose-700'
  }
};

export const priorityMeta = {
  high: {
    label: 'High',
    className: 'border-rose-200 bg-rose-50 text-rose-700'
  },
  medium: {
    label: 'Medium',
    className: 'border-amber-200 bg-amber-50 text-amber-700'
  },
  low: {
    label: 'Low',
    className: 'border-sky-200 bg-sky-50 text-sky-700'
  }
};

export const getPriority = (priority) => (
  priorityMeta[priority] ? priority : 'medium'
);

export const isOverdue = (request) => (
  Boolean(
    request?.deadline &&
    new Date(request.deadline) < new Date() &&
    request.status === 'pending'
  )
);

export const formatDate = (date) => {
  if (!date) {
    return 'No deadline';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date));
};

export const buildRequestMetrics = (requests) => {
  const total = requests.length;
  const approved = requests.filter((request) => request.status === 'approved').length;
  const pending = requests.filter((request) => request.status === 'pending').length;
  const rejected = requests.filter((request) => request.status === 'rejected').length;
  const overdue = requests.filter(isOverdue).length;
  const reviewed = approved + rejected;
  const approvalRate = reviewed ? Math.round((approved / reviewed) * 100) : 0;

  return {
    total,
    approved,
    pending,
    rejected,
    overdue,
    approvalRate
  };
};

export const buildWorkerStats = (requests) => {
  const stats = {};

  requests.forEach((request) => {
    const worker = request.assignedTo?.name || 'Unassigned';

    if (!stats[worker]) {
      stats[worker] = {
        worker,
        approved: 0,
        pending: 0,
        rejected: 0,
        overdue: 0,
        highPriority: 0,
        total: 0
      };
    }

    stats[worker].total += 1;

    if (request.status === 'approved') {
      stats[worker].approved += 1;
    }

    if (request.status === 'pending') {
      stats[worker].pending += 1;
    }

    if (request.status === 'rejected') {
      stats[worker].rejected += 1;
    }

    if (isOverdue(request)) {
      stats[worker].overdue += 1;
    }

    if (getPriority(request.priority) === 'high') {
      stats[worker].highPriority += 1;
    }
  });

  return Object.values(stats).map((worker) => ({
    ...worker,
    approvalRate: worker.approved + worker.rejected
      ? Math.round((worker.approved / (worker.approved + worker.rejected)) * 100)
      : 0
  }));
};
