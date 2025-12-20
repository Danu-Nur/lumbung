"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-2 group-[.toaster]:border-black group-[.toaster]:shadow-neo group-[.toaster]:rounded-none dark:group-[.toaster]:border-white",
          description: "group-[.toast]:text-muted-foreground font-medium",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground border-2 border-black rounded-none shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground border-2 border-black rounded-none",
          success: "group-[.toaster]:bg-neo-green group-[.toaster]:text-black",
          error: "group-[.toaster]:bg-neo-orange group-[.toaster]:text-white",
          info: "group-[.toaster]:bg-neo-blue group-[.toaster]:text-white",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
