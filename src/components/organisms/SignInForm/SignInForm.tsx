'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/libs/I18nNavigation';
import { apiClient } from '../../../lib/api/client';
import { ENDPOINTS } from '../../../lib/api/endpoints';

import { FormField } from '../../molecules/FormField';
import { PasswordField } from '../../molecules/PasswordField';
import { Button } from '../../atoms/Button';

export function SignInForm() {
  const t = useTranslations('SignIn');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const formSchema = z.object({
    email: z
      .string()
      .trim()
      .min(1, { message: t('email_required') })
      .email({ message: t('invalid_email') }),
    password: z.string().trim().min(1, { message: t('password_required') }),
  });

  type FormValues = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setServerError(null); // Clear previous errors

    try {

      // Make real API call to the backend
      const response: any = await apiClient.post(ENDPOINTS.auth.login, {
        email: data.email,
        password: data.password,
      });

      // Save token if returned
      const token = response?.accessToken || response?.token || response?.data?.token || response?.data?.accessToken;
      if (token) {
        localStorage.setItem('access_token', token);
      }

      // Fetch user details to verify Admin role from Better Auth session
      const sessionResponse: any = await apiClient.get(ENDPOINTS.auth.getSession);
      
      const userRole = sessionResponse?.user?.role || sessionResponse?.data?.user?.role;
      const userPermissions = sessionResponse?.user?.permissions || sessionResponse?.data?.user?.permissions || [];
      const isAdmin = userRole === 'admin' || userRole === 'ADMIN' || userPermissions.includes('admin') || userPermissions.includes('ADMIN');

      if (!isAdmin) {
        // If the user is not an Admin: Immediately sign them out
        localStorage.removeItem('access_token');
        setServerError('You do not have permission to access the Admin portal.');
        setIsLoading(false);
        return;
      }

      console.log('Authenticating:', data);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Sign-in error:', error);
      if (error.message === 'INVALID_CREDENTIALS' || error.status === 401 || error.response?.status === 401) {
        setServerError(t('invalid_credentials'));
      } else {
        setServerError(t('general_error'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex min-h-screen w-full items-center justify-center bg-[#0F1720] font-sans text-[#E8EDF2]">
      <div className="mx-4 w-full max-w-md rounded-[10px] border border-[#1D2A38] bg-[#172230] p-8 shadow-2xl">
        <div className="flex flex-col items-center justify-center pb-6">
          {/* Logo and Brand */}
          <div className="mb-8 flex scale-110 items-center gap-3">
            <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#4FD1C5] to-[#2E7D74] font-mono text-[13px] font-semibold text-[#06231F]">
              M
            </div>
            <div>
              <div className="font-sans text-[15px] leading-tight font-semibold tracking-[0.2px]">
                MIRALO
              </div>
              <div className="mt-0.5 font-mono text-[10px] leading-tight tracking-[0.6px] text-[#526376] uppercase">
                Backoffice
              </div>
            </div>
          </div>

          {/* Title & Subtitle */}
          <h1 className="mb-1.5 font-sans text-[20px] font-semibold">{t('title')}</h1>
          <p className="font-mono text-[12px] text-[#8CA0B3]">{t('subtitle')}</p>
        </div>

        {/* Global Server Error Alert */}
        {serverError && (
          <div className="mb-5 flex items-start gap-3 rounded-lg border border-[#E5646A]/20 bg-[#E5646A]/10 p-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mt-0.5 h-5 w-5 shrink-0 text-[#E5646A]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p className="text-[13px] leading-tight text-[#E5646A]">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            label={t('email_label')}
            name="email"
            type="email"
            placeholder={t('email_placeholder')}
            error={errors.email?.message}
            {...register('email')}
          />

          <PasswordField
            label={t('password_label')}
            name="password"
            placeholder={t('password_placeholder')}
            error={errors.password?.message}
            {...register('password')}
          />

          <Button type="submit" isLoading={isLoading}>
            {t('submit_button')}
          </Button>
        </form>
      </div>
    </div>
  );
}
