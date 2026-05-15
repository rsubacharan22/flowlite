// Employee-facing HR request types
// These map to the `title` field on the backend Request model.
export const REQUEST_TYPES = [
  { value: 'Leave Request', label: 'Leave Request' },
  { value: 'Medical Leave', label: 'Medical Leave' },
  { value: 'Work From Home', label: 'Work From Home' },
  { value: 'Reimbursement', label: 'Reimbursement' },
  { value: 'Shift Change', label: 'Shift Change' },
  { value: 'Other', label: 'Other' }
];

const REQUEST_TYPE_VALUES = new Set(REQUEST_TYPES.map((t) => t.value));

/**
 * Returns true if this request was created by an employee
 * using the simplified HR request form.
 */
export const isEmployeeRequest = (request) => {
  const creatorRole = request?.createdBy?.role;
  return creatorRole === 'employee';
};

/**
 * Returns the display label for a request type or a task title.
 */
export const getRequestTypeLabel = (title) => {
  if (!title) return 'Request';
  return REQUEST_TYPE_VALUES.has(title) ? title : title;
};

/**
 * Formats a relative time string (e.g. "2 days ago").
 */
export const timeAgo = (date) => {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric'
  }).format(new Date(date));
};

/**
 * Formats a date for display (e.g. "May 15, 2026").
 */
export const formatDate = (date) => {
  if (!date) return null;
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date));
};
