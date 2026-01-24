import { useEffect } from "react";

export default function ToastHost({ toasts, removeToast }) {
  useEffect(() => {
    if (!toasts.length) return;

    const timers = toasts.map((t) =>
      setTimeout(() => removeToast(t.id), t.duration ?? 2500)
    );

    return () => timers.forEach(clearTimeout);
  }, [toasts, removeToast]);

  return (
    <div
      style={{
        position: "fixed",
        top: 14,
        right: 14,
        display: "grid",
        gap: 10,
        zIndex: 9999,
        width: 320,
        maxWidth: "calc(100vw - 28px)",
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          style={{
            padding: "12px 12px",
            borderRadius: 12,
            border: "1px solid #333",
            background: "rgba(0,0,0,0.85)",
            color: "white",
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "grid", gap: 4 }}>
            <div style={{ fontWeight: 700, fontSize: 13, opacity: 0.95 }}>
              {t.type === "success"
                ? "Success"
                : t.type === "error"
                ? "Error"
                : "Info"}
            </div>
            <div style={{ fontSize: 14, opacity: 0.95 }}>{t.message}</div>
          </div>

          <button
            onClick={() => removeToast(t.id)}
            style={{
              background: "transparent",
              border: "1px solid #444",
              color: "white",
              borderRadius: 10,
              padding: "6px 8px",
              cursor: "pointer",
              opacity: 0.9,
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
