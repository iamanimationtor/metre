"use client";

/** Root-level error boundary — catches failures in the root layout itself. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fa" dir="rtl">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#f8fafc", color: "#0f172a" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "96px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 56 }} aria-hidden>🛠️</div>
          <h1 style={{ marginTop: 16, fontSize: 22, fontWeight: 800 }}>خطای سیستمی رخ داد</h1>
          <p style={{ marginTop: 12, lineHeight: 2, color: "#475569", fontSize: 14 }}>
            مشکلی در بارگذاری برنامه پیش آمد. معمولاً با تازه‌سازی صفحه حل می‌شود.
            {error?.digest ? ` (کد: ${error.digest})` : ""}
          </p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: 24,
              padding: "12px 28px",
              borderRadius: 12,
              border: "none",
              background: "#065f46",
              color: "#fff",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            تلاش دوباره
          </button>
        </div>
      </body>
    </html>
  );
}
