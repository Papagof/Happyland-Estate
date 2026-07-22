import { fieldClass } from './fieldStyles';

export default function Input({ className = '', ...props }) {
  return <input className={`${fieldClass} ${className}`} {...props} />;
}
