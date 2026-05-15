import { FileSearch } from 'lucide-react';
import Card from './Card';

function EmptyState({ title = 'No requests found', message = 'Try another filter or create a new request.' }) {
  return (
    <Card className="flex min-h-64 flex-col items-center justify-center text-center" hover={false}>
      <div className="rounded-2xl bg-slate-100 p-4 text-slate-500">
        <FileSearch className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-slate-500">{message}</p>
    </Card>
  );
}

export default EmptyState;
