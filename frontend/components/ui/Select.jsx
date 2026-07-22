import { fieldClass } from './fieldStyles';

export default function Select({ className = '', children, ...props }) {
  return (
    <select className={`${fieldClass} ${className}`} {...props}>
      {children}
    </select>
  );
}
