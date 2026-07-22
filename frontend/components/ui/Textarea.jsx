import { fieldClass } from './fieldStyles';

export default function Textarea({ className = '', ...props }) {
  return <textarea className={`${fieldClass} min-h-[100px] resize-y ${className}`} {...props} />;
}
