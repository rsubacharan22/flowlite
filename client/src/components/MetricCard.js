import Card from './Card';

const tones = {
  blue: {
    bar: 'from-blue-500 to-cyan-400',
    icon: 'bg-blue-50 text-blue-600'
  },
  emerald: {
    bar: 'from-emerald-500 to-teal-400',
    icon: 'bg-emerald-50 text-emerald-600'
  },
  amber: {
    bar: 'from-amber-500 to-orange-400',
    icon: 'bg-amber-50 text-amber-600'
  },
  rose: {
    bar: 'from-rose-500 to-pink-400',
    icon: 'bg-rose-50 text-rose-600'
  },
  violet: {
    bar: 'from-violet-500 to-indigo-400',
    icon: 'bg-violet-50 text-violet-600'
  },
  slate: {
    bar: 'from-slate-600 to-slate-400',
    icon: 'bg-slate-100 text-slate-700'
  }
};

function MetricCard({ detail, icon: Icon, title, tone = 'blue', value }) {
  const toneClass = tones[tone] || tones.blue;

  return (
    <Card className="relative overflow-hidden" hover>
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${toneClass.bar}`} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-normal text-slate-950">{value}</p>
          {detail && <p className="mt-2 text-sm text-slate-500">{detail}</p>}
        </div>
        {Icon && (
          <div className={`rounded-2xl p-3 ${toneClass.icon}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </Card>
  );
}

export default MetricCard;
