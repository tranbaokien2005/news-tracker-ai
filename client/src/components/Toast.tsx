import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Toast as ToastType } from '@/lib/types';

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const typeStyles = {
  success: 'border-[hsl(var(--color-success))]',
  error: 'border-[hsl(var(--color-error))]',
  info: 'border-[hsl(var(--color-info))]',
  warning: 'border-[hsl(var(--color-warning))]',
};

const iconStyles = {
  success: 'text-[hsl(var(--color-success))]',
  error: 'text-[hsl(var(--color-error))]',
  info: 'text-[hsl(var(--color-info))]',
  warning: 'text-[hsl(var(--color-warning))]',
};

export default function Toast({ toast, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const Icon = icons[toast.type];
  const duration = toast.duration || 3000;

  useEffect(() => {
    // Trigger enter animation
    setIsVisible(true);

    // Auto dismiss
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 150); // Wait for exit animation
  };

  return (
    <div
      className={`
        toast border-l-4 ${typeStyles[toast.type]}
        transform transition-all duration-150 ease-in-out
        ${isVisible && !isExiting 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
        }
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${iconStyles[toast.type]}`} />
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-[hsl(var(--color-text))] mb-1">
            {toast.title}
          </div>
          <div className="text-sm text-[hsl(var(--color-muted))]">
            {toast.message}
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="text-[hsl(var(--color-muted))] hover:text-[hsl(var(--color-text))] 
                   transition-colors duration-150 p-1 -m-1 rounded focus:outline-none 
                   focus:ring-2 focus:ring-[hsl(var(--color-accent))] focus:ring-offset-2 
                   focus:ring-offset-[hsl(var(--color-card))]"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Toast Container Component
interface ToastContainerProps {
  toasts: ToastType[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div 
      className="fixed bottom-4 right-4 z-50 space-y-3 max-w-sm w-full"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}