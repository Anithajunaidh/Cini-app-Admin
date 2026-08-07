import React, { forwardRef } from 'react';
import { Label } from '../../atoms/Label';
import { Input, InputProps } from '../../atoms/Input';
import { ErrorMessage } from '../../atoms/ErrorMessage';

export interface FormFieldProps extends Omit<InputProps, 'error'> {
  label: string;
  name: string;
  error?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, name, error, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={name}>{label}</Label>
        <Input 
          id={name} 
          name={name}
          ref={ref} 
          error={!!error} 
          {...props} 
        />
        <ErrorMessage message={error} />
      </div>
    );
  }
);
FormField.displayName = 'FormField';
