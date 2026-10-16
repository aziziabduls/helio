'use client';

import { Toaster as Sonner, toast } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      richColors
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-[#161b22] group-[.toaster]:text-white group-[.toaster]:border-white/[0.12] group-[.toaster]:shadow-2xl group-[.toaster]:rounded-xl font-sans',
          description: 'group-[.toast]:text-white/60 text-xs',
          actionButton:
            'group-[.toast]:bg-blue-600 group-[.toast]:text-white',
          cancelButton:
            'group-[.toast]:bg-white/[0.1] group-[.toast]:text-white',
          error:
            'group-[.toaster]:border-red-500/30 group-[.toaster]:bg-[#1e1316] group-[.toast]:text-red-200',
          success:
            'group-[.toaster]:border-emerald-500/30 group-[.toaster]:bg-[#122216] group-[.toast]:text-emerald-200',
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
