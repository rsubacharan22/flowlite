function Input({
  className = '',
  icon: Icon,
  label,
  multiline = false,
  ...props
}) {
  const Control = multiline ? 'textarea' : 'input';

  return (
    <label className="block">
      {label && (
        <span className="mb-2 block text-sm font-semibold text-slate-700">
          {label}
        </span>
      )}
      <span className="relative block">
        {Icon && (
          <Icon className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
        )}
        <Control
          className={[
            'field',
            Icon ? 'pl-10' : '',
            multiline ? 'min-h-36 resize-y' : '',
            className
          ].join(' ')}
          {...props}
        />
      </span>
    </label>
  );
}

export default Input;
