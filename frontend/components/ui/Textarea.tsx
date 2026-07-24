import { TextareaHTMLAttributes } from 'react';
import { fieldClass } from './fieldStyles';

export default function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${fieldClass} min-h-[100px] resize-y ${className}`} {...props} />;
}
