"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { ApiError, loginAdmin } from "@/lib/api";
import { setAdminToken } from "@/lib/auth";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin12345");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await loginAdmin({ username, password });
      setAdminToken(response.access_token);

      const nextPath = searchParams.get("next") || "/admin";
      router.replace(nextPath);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("تعذر تسجيل الدخول، يرجى المحاولة مجددًا.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-stone bg-white p-6 shadow-soft">
      <h1 className="text-2xl font-semibold text-ink">دخول الإدارة</h1>

      <div>
        <label htmlFor="username" className="mb-1 block text-sm text-muted">
          اسم المستخدم
        </label>
        <input
          id="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="w-full rounded-xl border border-stone px-3 py-2 outline-none focus:border-accent"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm text-muted">
          كلمة المرور
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-stone px-3 py-2 outline-none focus:border-accent"
          required
        />
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-accent px-4 py-2 text-sm text-white disabled:opacity-60"
      >
        {isLoading ? "جارٍ الدخول..." : "تسجيل الدخول"}
      </button>
    </form>
  );
}
