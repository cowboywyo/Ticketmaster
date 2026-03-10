import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
}

export function Badge({ children, className, color }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        className
      )}
      style={color ? { backgroundColor: color + '20', color } : undefined}
    >
      {children}
    </span>
  );
}
