"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, toast as sonnerToast } from "sonner"

/** 
 * LUMBUNG CUSTOM TOAST ENGINE
 * Built on top of Sonner, but fully custom JSX for maximum Neo-Brutalist control.
 */

interface LumbungToastProps {
  id: string | number;
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'info' | 'warning' | 'default';
  action?: {
    label: string;
    onClick: () => void;
  };
}

/** The actual Neo-Brutalist Toast Component */
function LumbungToastComponent({ id, title, description, type = 'default', action }: LumbungToastProps) {
  const getColors = () => {
    switch (type) {
      case 'success': return "bg-[#00FFA3] text-black border-black";
      case 'error': return "bg-[#FF5C00] text-white border-black";
      case 'info': return "bg-[#334EFF] text-white border-black";
      case 'warning': return "bg-[#FFDE00] text-black border-black";
      default: return "bg-white text-black border-black dark:bg-gray-800 dark:text-white dark:border-white";
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return "✓";
      case 'error': return "!";
      case 'info': return "i";
      case 'warning': return "⚠";
      default: return "i";
    }
  };

  return (
    <div className={`
      flex items-center justify-between gap-4 p-4
      w-[380px] max-w-[calc(100vw-2rem)]
      border-2 sm:border-3 ${getColors()}
      shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]
      rounded-sm relative group/toast
    `}>
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 border-2 border-current flex items-center justify-center font-black text-xl rounded-sm bg-black/10 dark:bg-white/10 shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-lg uppercase tracking-wider select-none leading-none truncate">
            {title}
          </p>
          {description && (
            <p className="mt-1.5 text-sm font-bold opacity-90 leading-snug line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {action && (
          <button
            className="bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] rounded-sm px-3 py-1.5 font-bold text-xs uppercase transition-all"
            onClick={() => {
              action.onClick();
              sonnerToast.dismiss(id);
            }}
          >
            {action.label}
          </button>
        )}
        <button
          className="w-8 h-8 flex items-center justify-center font-bold hover:scale-125 transition-transform text-current"
          onClick={() => sonnerToast.dismiss(id)}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

/** 
 * Exported toast function to use throughout the app 
 */
export const toast = {
  custom: (props: Omit<LumbungToastProps, 'id'>) => {
    return sonnerToast.custom((id) => (
      <LumbungToastComponent id={id} {...props} />
    ));
  },
  success: (title: string, options?: { description?: string, action?: LumbungToastProps['action'] }) => {
    return sonnerToast.custom((id) => (
      <LumbungToastComponent id={id} title={title} description={options?.description} type="success" action={options?.action} />
    ));
  },
  error: (title: string, options?: { description?: string, action?: LumbungToastProps['action'] }) => {
    return sonnerToast.custom((id) => (
      <LumbungToastComponent id={id} title={title} description={options?.description} type="error" action={options?.action} />
    ));
  },
  info: (title: string, options?: { description?: string, action?: LumbungToastProps['action'] }) => {
    return sonnerToast.custom((id) => (
      <LumbungToastComponent id={id} title={title} description={options?.description} type="info" action={options?.action} />
    ));
  },
  warning: (title: string, options?: { description?: string, action?: LumbungToastProps['action'] }) => {
    return sonnerToast.custom((id) => (
      <LumbungToastComponent id={id} title={title} description={options?.description} type="warning" action={options?.action} />
    ));
  },
  dismiss: (id?: string | number) => sonnerToast.dismiss(id),
};

/** 
 * TOASTER PROVIDER 
 * This must be included in the Root Layout.
 */
export const Toaster = ({ ...props }: React.ComponentProps<typeof Sonner>) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as any}
      className="toaster group"
      position="top-right"
      offset={20}
      duration={4000}
      {...props}
    />
  )
}

// Default export as requested for Headless example pattern
export default function HeadlessDemo() {
  return (
    <button
      className="relative flex h-10 flex-shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-4 text-sm font-medium shadow-sm transition-all hover:bg-[#FAFAFA] dark:bg-[#161615] dark:hover:bg-[#1A1A19] dark:text-white border-2 border-black"
      onClick={() => {
        toast.custom({
          title: 'Neo-Brutalist Custom Toast',
          description: 'You have full control of styles and jsx, while still having the animations.',
          type: 'info',
          action: {
            label: 'Dismiss All',
            onClick: () => toast.dismiss(),
          },
        });
      }}
    >
      Render Neo-Brutalist Toast
    </button>
  );
}
