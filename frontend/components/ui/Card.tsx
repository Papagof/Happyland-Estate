import { forwardRef, ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(function Card({ className = '', children, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={`rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

export default Card;
