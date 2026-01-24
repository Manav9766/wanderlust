import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext"; // <-- adjust path if needed

export default function Signup() {
  const { signup } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);
      await signup({ username, email, password });
      toast.success("Account created");
      navigate("/");
    } catch (e2) {
      toast.error(e2?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 420, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>Signup</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />

        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />

        <button disabled={loading} type="submit">
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>

      <div style={{ marginTop: 12 }}>
        Already have an account? <Link to="/login">Login</Link>
      </div>
    </div>
  );
}
