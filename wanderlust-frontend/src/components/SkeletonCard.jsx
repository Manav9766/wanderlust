export default function SkeletonCard() {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 12,
        overflow: "hidden",
        background: "#f2f2f2",
      }}
    >
      <div
        style={{
          height: 180,
          background: "#e0e0e0",
        }}
      />

      <div style={{ padding: 12 }}>
        <div
          style={{
            height: 16,
            width: "70%",
            background: "#e0e0e0",
            marginBottom: 8,
            borderRadius: 4,
          }}
        />
        <div
          style={{
            height: 14,
            width: "40%",
            background: "#e0e0e0",
            borderRadius: 4,
          }}
        />
      </div>
    </div>
  );
}
