'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export function SignInForm() {
  const t = useTranslations('SignIn');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const formSchema = z.object({
    email: z
      .string()
      .min(1, { message: t('email_required') })
      .email({ message: t('invalid_email') }),
    password: z.string().min(1, { message: t('password_required') }),
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
      // Simulate authentication process - replace with real API call later
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate an API validation error if email is "error@example.com"
          if (data.email === 'error@example.com') {
            reject(new Error('INVALID_CREDENTIALS'));
          } else {
            resolve(true);
          }
        }, 1200);
      });

      console.log('Authenticating:', data);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Sign-in error:', error);
      if (error.message === 'INVALID_CREDENTIALS') {
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
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block font-mono text-[10.5px] tracking-[0.5px] text-[#8CA0B3] uppercase"
            >
              {t('email_label')}
            </label>
            <input
              id="email"
              type="email"
              placeholder={t('email_placeholder')}
              className={`w-full border bg-[#0F1720] ${errors.email ? 'border-[#E5646A]' : 'border-[#263444]'} rounded-lg px-3.5 py-2.5 text-[13px] text-[#E8EDF2] placeholder:text-[#526376] focus:ring-2 focus:outline-none ${errors.email ? 'focus:ring-[#E5646A]' : 'focus:ring-[#4FD1C5]'} transition-all focus:border-transparent`}
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-[11px] font-medium text-[#E5646A]">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block font-mono text-[10.5px] tracking-[0.5px] text-[#8CA0B3] uppercase"
            >
              {t('password_label')}
            </label>
            <input
              id="password"
              type="password"
              placeholder={t('password_placeholder')}
              className={`w-full border bg-[#0F1720] ${errors.password ? 'border-[#E5646A]' : 'border-[#263444]'} rounded-lg px-3.5 py-2.5 text-[13px] text-[#E8EDF2] placeholder:text-[#526376] focus:ring-2 focus:outline-none ${errors.password ? 'focus:ring-[#E5646A]' : 'focus:ring-[#4FD1C5]'} transition-all focus:border-transparent`}
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 text-[11px] font-medium text-[#E5646A]">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 flex w-full items-center justify-center rounded-lg bg-[#4FD1C5] px-4 py-2.5 text-[13px] font-semibold text-[#06231F] transition-colors hover:bg-[#3fb8ae] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <svg
                  className="mr-2 -ml-1 h-4 w-4 animate-spin text-[#06231F]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              t('submit_button')
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
