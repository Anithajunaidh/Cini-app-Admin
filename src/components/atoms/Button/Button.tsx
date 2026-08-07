import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { LoadingSpinner } from '../LoadingSpinner';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, isLoading, disabled, className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={`mt-4 flex w-full items-center justify-center rounded-lg bg-[#4FD1C5] px-4 py-2.5 text-[13px] font-semibold text-[#06231F] transition-colors hover:bg-[#3fb8ae] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <LoadingSpinner className="mr-2 -ml-1 h-4 w-4 text-[#06231F]" />
            Processing...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';
