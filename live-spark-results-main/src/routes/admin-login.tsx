import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useAdminAuth } from "@/lib/admin-auth-context";

export const Route = createFileRoute("/admin-login")({ component: AdminLogin });

function AdminLogin() {
  const router = useRouter();
  const { isAdmin, loading, login } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && isAdmin) {
      router.navigate({ to: "/admin-dashboard" });
    }
  }, [isAdmin, loading, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const success = await login(email, password);
    if (success) {
      router.navigate({ to: "/admin-dashboard" });
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-md glass rounded-3xl border border-border p-8">
        <h1 className="text-3xl font-bold gold-text">Admin Login</h1>
        <p className="mt-2 text-muted-foreground">Use the hidden admin credentials to manage results, games, and live publishing.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground">Email</label>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              autoComplete="username"
              required
              className="mt-2 w-full rounded-md bg-input border border-border px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">Password</label>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete="current-password"
              required
              className="mt-2 w-full rounded-md bg-input border border-border px-3 py-2"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button className="w-full rounded-md bg-primary text-primary-foreground py-2 font-semibold gold-glow">
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
