import { CheckCircle2 } from 'lucide-react';

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="toast" role="status" aria-live="polite">
      <span className="toast__icon">
        <CheckCircle2 size={16} strokeWidth={2.2} />
      </span>
      <span className="toast__text">{message}</span>
    </div>
  );
}
