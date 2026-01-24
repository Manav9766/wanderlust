export default function ConfirmDialog({
  open,
  title = "Confirm",
  message = "Are you sure?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 16,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#fff",
          borderRadius: 14,
          padding: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
          {title}
        </div>
        <div style={{ opacity: 0.85, lineHeight: 1.4 }}>{message}</div>

        <div
          style={{
            marginTop: 14,
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          <button type="button" onClick={onCancel} disabled={loading}>
            {cancelText}
          </button>

          <button type="button" onClick={onConfirm} disabled={loading}>
            {loading ? "Please wait..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
