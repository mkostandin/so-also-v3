import React from "react"
import { useToast } from "@/components/ui/toast"

export function useToastHook() {
  const { addToast } = useToast()

  const toast = React.useCallback(
    ({ title, description, variant = "default", duration }: {
      title?: string
      description?: string
      variant?: "default" | "destructive" | "success"
      duration?: number
    }) => {
      addToast({ title, description, variant, duration })
    },
    [addToast]
  )

  return {
    toast,
    success: (props: Omit<Parameters<typeof toast>[0], 'variant'>) =>
      toast({ ...props, variant: "success" }),
    error: (props: Omit<Parameters<typeof toast>[0], 'variant'>) =>
      toast({ ...props, variant: "destructive" }),
  }
}

// Re-export for convenience
export { useToast } from "@/components/ui/toast"
