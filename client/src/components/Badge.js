import { priorityMeta, statusMeta, getPriority } from '../utils/requests';

const roleMeta = {
  employee: { label: 'Employee', className: 'border-slate-200 bg-slate-100 text-slate-600' },
  approver: { label: 'Approver', className: 'border-blue-200 bg-blue-50 text-blue-700' },
  admin: { label: 'Admin', className: 'border-violet-200 bg-violet-50 text-violet-700' }
};

function Badge({ className = '', small = false, type = 'status', value, isTask = false }) {
  const normalizedValue = type === 'priority' ? getPriority(value) : value;
  const source = type === 'priority' ? priorityMeta : statusMeta;
  const meta = { ...(type === 'role'
      ? roleMeta[value] || roleMeta.employee
      : source[normalizedValue] || source.pending) };

  if (isTask && type === 'status') {
    if (value === 'approved') meta.label = 'Completed';
    if (value === 'pending') meta.label = 'Not Completed';
  }

  const sizeClass = small
    ? 'px-2 py-0.5 text-[10px]'
    : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={[
        'inline-flex items-center rounded-full border font-semibold capitalize',
        sizeClass,
        meta.className,
        className
      ].join(' ')}
    >
      {meta.label}
    </span>
  );
}

export default Badge;
