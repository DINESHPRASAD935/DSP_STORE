import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'md', message, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className={`text-center py-24 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} text-cyan-400 animate-spin mx-auto mb-4`} />
      {message && <p className="text-gray-400">{message}</p>}
    </div>
  );
}
