import { LucideIcon } from 'lucide-react';

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  change?: string;
  changeType?: 'up' | 'down';
}

export default function StatsCard({ label, value, icon: Icon, color, change, changeType }: Props) {
  return (
    <div className="bidhaa-card p-5 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
        <p className="font-display font-bold text-2xl text-gray-900">{value}</p>
        {change && (
          <p className={`text-xs font-medium mt-0.5 ${changeType === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
            {changeType === 'up' ? '↑' : '↓'} {change}
          </p>
        )}
      </div>
    </div>
  );
}
