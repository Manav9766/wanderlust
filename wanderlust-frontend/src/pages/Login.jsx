import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext"; // <-- adjust path if your ToastContext is elsewhere

export default function Login() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);
      await login({ username, password });
      toast.success("Logged in successfully");
      navigate("/");
    } catch (e2) {
      toast.error(e2?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 420, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>Login</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        <button disabled={loading} type="submit">
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div style={{ marginTop: 12 }}>
        No account? <Link to="/signup">Signup</Link>
      </div>
    </div>
  );
}
