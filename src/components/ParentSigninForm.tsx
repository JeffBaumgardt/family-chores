"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signinParent } from "@/app/actions/parent-auth";

export default function ParentSigninForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    try {
      const result = await signinParent(data);
      if (result.success) {
        router.push("/parent/dashboard");
      } else {
        setError(result.error || "Invalid email or password");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-teal-600 mb-2">Welcome Back!</h1>
        <p className="text-lg text-gray-600">
          Sign in to manage your family chores
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-lg">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 
                       focus:border-transparent transition-colors bg-white text-gray-900 shadow-sm
                       placeholder:text-gray-400"
              placeholder="you@example.com"
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 
                       focus:border-transparent transition-colors bg-white text-gray-900 shadow-sm
                       placeholder:text-gray-400"
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                   font-semibold shadow-sm"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>

        <div className="text-center mt-6">
          <Link
            href="/parent/signup"
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            Need an account? Sign up
          </Link>
        </div>
      </form>
    </div>
  );
} 