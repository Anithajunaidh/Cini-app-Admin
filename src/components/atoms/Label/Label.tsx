import React, { LabelHTMLAttributes } from 'react';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export const Label: React.FC<LabelProps> = ({ children, className = '', ...props }) => {
  return (
    <label
      className={`block font-mono text-[10.5px] tracking-[0.5px] text-[#8CA0B3] uppercase ${className}`}
      {...props}
    >
      {children}
    </label>
  );
};
