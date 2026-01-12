import { X } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  className?: string;
}

export function ErrorMessage({ title = 'Error', message, className = '' }: ErrorMessageProps) {
  return (
    <div className={`text-center py-24 ${className}`}>
      <div className="w-20 h-20 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
        <X className="w-10 h-10 text-red-400" />
      </div>
      <h3 className="text-xl text-red-400 mb-2">{title}</h3>
      <p className="text-gray-500">{message}</p>
    </div>
  );
}
