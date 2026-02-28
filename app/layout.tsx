export const metadata = {
  title: "InfraSight – Clarity for Your Infrastructure",
  description:
    "Modern observability and log monitoring platform for real-time system health visibility.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
          backgroundColor: "#0f172a",
          color: "#f1f5f9",
        }}
      >
        <header
          style={{
            padding: "20px 40px",
            borderBottom: "1px solid #1e293b",
            backgroundColor: "#111827",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ margin: 0, color: "#3b82f6" }}>
              InfraSight
            </h2>
            <small style={{ color: "#94a3b8" }}>
              Real Time Observability & Log Analytics
            </small>
          </div>

          <div
            style={{
              backgroundColor: "#1e293b",
              padding: "6px 14px",
              borderRadius: "6px",
              fontSize: "12px",
            }}
          >
            Production Environment
          </div>
        </header>

        <main style={{ padding: "40px" }}>{children}</main>

        <footer
          style={{
            padding: "16px 40px",
            borderTop: "1px solid #1e293b",
            fontSize: "13px",
            color: "#94a3b8",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>© 2026 InfraSight</span>
          <span>
            Developed by Basavarajisng | visit <a href="basavarajsing.vercel.app" style={{ color: "#3b82f6" }}>My Portfolio</a>
          </span>
        </footer>
      </body>
    </html>
  );
}