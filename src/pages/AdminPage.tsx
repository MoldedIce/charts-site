import { useState } from "react";
import { IdeasTab } from "./admin/IdeasTab";

const SESSION_KEY = "da_admin_pw";

export function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!sessionStorage.getItem(SESSION_KEY)
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      sessionStorage.setItem(SESSION_KEY, password);
      setIsAuthenticated(true);
    } else {
      setError(true);
      setPassword("");
    }
  }

  function handleLogout() {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
  }

  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#eef2f7",
          fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        }}
      >
        <form
          onSubmit={handleLogin}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            width: 280,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 600, color: "#101828", marginBottom: 8 }}>
            Backstage
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            placeholder="Password"
            autoFocus
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: `1px solid ${error ? "#dc2626" : "#d0d5dd"}`,
              fontSize: 15,
              outline: "none",
              fontFamily: "inherit",
            }}
          />
          {error && (
            <div style={{ fontSize: 13, color: "#dc2626" }}>Incorrect password</div>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "none",
              background: "#101828",
              color: "#fff",
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? "default" : "pointer",
              fontFamily: "inherit",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Checking..." : "Enter"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#eef2f7",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          background: "#222222",
          padding: "0 24px",
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 600, color: "#8DD6BE" }}>
          Backstage
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: "transparent",
            border: "none",
            color: "#667085",
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Log out
        </button>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 16px" }}>
        <IdeasTab />
      </div>
    </div>
  );
}
