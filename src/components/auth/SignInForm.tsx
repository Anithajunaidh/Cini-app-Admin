'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export function SignInForm() {
  const t = useTranslations('SignIn');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const formSchema = z.object({
    email: z.string().min(1, { message: t('email_required') }).email({ message: t('invalid_email') }),
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
    } catch (err: any) {
      console.error('Sign-in error:', err);
      if (err.message === 'INVALID_CREDENTIALS') {
        setServerError(t('invalid_credentials'));
      } else {
        setServerError(t('general_error'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0F1720] text-[#E8EDF2] absolute inset-0 z-50 font-sans">
      <div className="w-full max-w-md bg-[#172230] border border-[#1D2A38] rounded-[10px] shadow-2xl p-8 mx-4">
        <div className="flex flex-col items-center justify-center pb-6">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3 mb-8 scale-110">
            <div className="w-[30px] h-[30px] rounded-lg bg-gradient-to-br from-[#4FD1C5] to-[#2E7D74] flex items-center justify-center font-mono font-semibold text-[13px] text-[#06231F] shrink-0">M</div>
            <div>
              <div className="font-sans font-semibold text-[15px] tracking-[0.2px] leading-tight">MIRALO</div>
              <div className="font-mono text-[10px] text-[#526376] uppercase tracking-[0.6px] leading-tight mt-0.5">Backoffice</div>
            </div>
          </div>

          {/* Title & Subtitle */}
          <h1 className="font-sans font-semibold text-[20px] mb-1.5">{t('title')}</h1>
          <p className="font-mono text-[12px] text-[#8CA0B3]">{t('subtitle')}</p>
        </div>

        {/* Global Server Error Alert */}
        {serverError && (
          <div className="mb-5 p-3 rounded-lg bg-[#E5646A]/10 border border-[#E5646A]/20 flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#E5646A] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p className="text-[13px] text-[#E5646A] leading-tight">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block font-mono text-[10.5px] text-[#8CA0B3] uppercase tracking-[0.5px]">
              {t('email_label')}
            </label>
            <input
              id="email"
              type="email"
              placeholder={t('email_placeholder')}
              className={`w-full bg-[#0F1720] border ${errors.email ? 'border-[#E5646A]' : 'border-[#263444]'} rounded-lg px-3.5 py-2.5 text-[13px] text-[#E8EDF2] placeholder:text-[#526376] focus:outline-none focus:ring-2 ${errors.email ? 'focus:ring-[#E5646A]' : 'focus:ring-[#4FD1C5]'} focus:border-transparent transition-all`}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-[#E5646A] text-[11px] mt-1 font-medium">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block font-mono text-[10.5px] text-[#8CA0B3] uppercase tracking-[0.5px]">
              {t('password_label')}
            </label>
            <input
              id="password"
              type="password"
              placeholder={t('password_placeholder')}
              className={`w-full bg-[#0F1720] border ${errors.password ? 'border-[#E5646A]' : 'border-[#263444]'} rounded-lg px-3.5 py-2.5 text-[13px] text-[#E8EDF2] placeholder:text-[#526376] focus:outline-none focus:ring-2 ${errors.password ? 'focus:ring-[#E5646A]' : 'focus:ring-[#4FD1C5]'} focus:border-transparent transition-all`}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-[#E5646A] text-[11px] mt-1 font-medium">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#4FD1C5] hover:bg-[#3fb8ae] text-[#06231F] font-semibold text-[13px] py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#06231F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : t('submit_button')}
          </button>
        </form>
      </div>
    </div>
  );
}
