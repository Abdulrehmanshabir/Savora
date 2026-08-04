"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CheckCircle2, Info, AlertTriangle, AlertCircle, Loader2 } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      offset="96px"
      gap={12}
      expand={true}
      closeButton={true}
      icons={{
        success: (
          <div className="h-7 w-7 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-sm">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        ),
        info: (
          <div className="h-7 w-7 rounded-full bg-primary/15 text-primary border border-primary/30 flex items-center justify-center shrink-0 shadow-sm">
            <Info className="h-4 w-4" />
          </div>
        ),
        warning: (
          <div className="h-7 w-7 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-sm">
            <AlertTriangle className="h-4 w-4" />
          </div>
        ),
        error: (
          <div className="h-7 w-7 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0 shadow-sm">
            <AlertCircle className="h-4 w-4" />
          </div>
        ),
        loading: (
          <div className="h-7 w-7 rounded-full bg-primary/15 text-primary border border-primary/30 flex items-center justify-center shrink-0 shadow-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            "!bg-card/95 !backdrop-blur-xl !border !border-border/80 !shadow-2xl !shadow-black/10 dark:!shadow-black/40 !rounded-2xl !p-4 !text-foreground !gap-3.5 !min-w-[320px] !max-w-[420px] transition-all duration-300 font-sans",
          title: "!font-semibold !text-sm !text-foreground !tracking-tight",
          description: "!text-xs !text-muted-foreground !mt-0.5 !leading-relaxed font-normal",
          actionButton:
            "!bg-primary hover:!bg-primary/90 !text-primary-foreground !font-semibold !px-3.5 !py-1.5 !rounded-xl !text-xs !transition-all !shadow-md hover:!shadow-lg",
          cancelButton:
            "!bg-muted hover:!bg-muted/80 !text-foreground !font-medium !px-3.5 !py-1.5 !rounded-xl !text-xs !transition-all",
          closeButton:
            "!bg-black hover:!bg-black/80 !text-white !border-0 !rounded-full !p-1.5 !transition-all [&>svg]:!stroke-[2.5]",
          success:
            "!border-emerald-500/30 !bg-gradient-to-r !from-emerald-500/10 !via-card !to-card",
          error:
            "!border-rose-500/30 !bg-gradient-to-r !from-rose-500/10 !via-card !to-card",
          warning:
            "!border-amber-500/30 !bg-gradient-to-r !from-amber-500/10 !via-card !to-card",
          info:
            "!border-primary/30 !bg-gradient-to-r !from-primary/10 !via-card !to-card",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
