'use client';

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className, ...props },
  ref
) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-[13px] font-semibold text-gray-700">{label}</span>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full rounded-2xl border bg-white px-4 py-3 text-[15px] text-ink outline-none transition-colors',
          'placeholder:text-gray-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100',
          error ? 'border-red-400' : 'border-gray-200',
          className
        )}
        {...props}
      />
      {error && <span className="mt-1 block text-xs font-medium text-red-500">{error}</span>}
      {!error && hint && <span className="mt-1 block text-xs text-gray-400">{hint}</span>}
    </label>
  );
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, className, ...props },
  ref
) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-[13px] font-semibold text-gray-700">{label}</span>
      )}
      <textarea
        ref={ref}
        rows={3}
        className={cn(
          'w-full resize-none rounded-2xl border bg-white px-4 py-3 text-[15px] text-ink outline-none transition-colors',
          'placeholder:text-gray-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100',
          error ? 'border-red-400' : 'border-gray-200',
          className
        )}
        {...props}
      />
      {error && <span className="mt-1 block text-xs font-medium text-red-500">{error}</span>}
    </label>
  );
});
