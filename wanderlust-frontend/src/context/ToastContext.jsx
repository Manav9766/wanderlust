import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((curr) => curr.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback((toast) => {
    const id = crypto?.randomUUID?.() || String(Date.now() + Math.random());
    setToasts((curr) => [
      ...curr,
      {
        id,
        type: toast.type || "info",
        message: toast.message || "",
        duration: toast.duration ?? 2500,
      },
    ]);
    return id;
  }, []);

  const api = useMemo(
    () => ({
      toasts,
      removeToast,
      toast: {
        success: (message, opts = {}) =>
          pushToast({ type: "success", message, ...opts }),
        error: (message, opts = {}) =>
          pushToast({ type: "error", message, ...opts }),
        info: (message, opts = {}) =>
          pushToast({ type: "info", message, ...opts }),
      },
    }),
    [toasts, removeToast, pushToast]
  );

  return <ToastContext.Provider value={api}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
