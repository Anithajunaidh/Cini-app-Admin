import React, { forwardRef, InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full border bg-[#0F1720] ${error ? 'border-[#E5646A]' : 'border-[#263444]'} rounded-lg px-3.5 py-2.5 text-[13px] text-[#E8EDF2] placeholder:text-[#526376] focus:ring-2 focus:outline-none ${error ? 'focus:ring-[#E5646A]' : 'focus:ring-[#4FD1C5]'} transition-all focus:border-transparent ${className}`}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
