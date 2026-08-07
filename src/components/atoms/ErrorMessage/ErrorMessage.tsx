import React from 'react';

export interface ErrorMessageProps {
  message?: string;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, className = '' }) => {
  if (!message) return null;
  
  return (
    <p className={`mt-1 text-[11px] font-medium text-[#E5646A] ${className}`}>
      {message}
    </p>
  );
};
