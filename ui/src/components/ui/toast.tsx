import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = React.createContext<{
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
} | null>(null)

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success"
  duration?: number
}

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive border-destructive bg-destructive text-destructive-foreground",
        success: "border-green-500 bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export function useToast() {
  const context = React.useContext(ToastProvider)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export function ToastContainer({ toasts, removeToast }: { toasts: Toast[], removeToast: (id: string) => void }) {
  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

function Toast({ toast, onRemove }: { toast: Toast, onRemove: () => void }) {
  React.useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(onRemove, toast.duration || 5000)
      return () => clearTimeout(timer)
    }
  }, [toast.duration, onRemove])

  return (
    <div className={cn(toastVariants({ variant: toast.variant }))}>
      <div className="grid gap-1">
        {toast.title && <div className="text-sm font-semibold">{toast.title}</div>}
        {toast.description && (
          <div className="text-sm opacity-90">{toast.description}</div>
        )}
      </div>
      <button
        className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
        onClick={onRemove}
        aria-label="Close notification"
        title="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function ToastProviderComponent({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const value = React.useMemo(() => ({
    toasts,
    addToast,
    removeToast,
  }), [toasts, addToast, removeToast])

  return (
    <ToastProvider.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastProvider.Provider>
  )
}
