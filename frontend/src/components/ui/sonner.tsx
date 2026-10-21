'use client';

import { Toaster as Sonner, toast } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#0b0e14',
          color: '#ffffff',
          borderColor: 'rgba(255, 255, 255, 0.12)',
        },
        classNames: {
          toast:
            'group toast !bg-[#0b0e14] !text-white border-white/[0.12] shadow-2xl rounded-xl font-sans',
          title: '!text-white font-medium',
          description: '!text-white/70 text-xs',
          actionButton:
            '!bg-white !text-black font-semibold',
          cancelButton:
            '!bg-white/10 !text-white',
          error:
            '!bg-[#0b0e14] !text-white border-white/[0.12]',
          success:
            '!bg-[#0b0e14] !text-white border-white/[0.12]',
          warning:
            '!bg-[#0b0e14] !text-white border-white/[0.12]',
          info:
            '!bg-[#0b0e14] !text-white border-white/[0.12]',
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
