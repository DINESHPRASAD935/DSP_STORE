import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  className?: string;
}

export function EmptyState({ icon: Icon, title, message, className = '' }: EmptyStateProps) {
  return (
    <div className={`text-center py-24 ${className}`}>
      <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-10 h-10 text-gray-600" />
      </div>
      <h3 className="text-xl text-gray-400 mb-2">{title}</h3>
      <p className="text-gray-500">{message}</p>
    </div>
  );
}
