import React, { forwardRef } from 'react';
import { FormField, FormFieldProps } from '../FormField';

export interface PasswordFieldProps extends Omit<FormFieldProps, 'type'> {}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  (props, ref) => {
    return (
      <FormField 
        type="password"
        ref={ref} 
        {...props} 
      />
    );
  }
);
PasswordField.displayName = 'PasswordField';
