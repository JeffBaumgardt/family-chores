"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { signupParent } from "@/app/actions/parent-auth";

export default function ParentSignupForm() {
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
      familyName: formData.get("familyName") as string,
      parentName: formData.get("parentName") as string,
    };

    try {
      const result = await signupParent(data);
      if (result.success) {
        toast.success(
          "Account created! Please check your email to confirm your account before signing in.",
          {
            duration: 5000,
          }
        );
        setTimeout(() => {
          router.push("/parent/signin");
        }, 1000);
      } else {
        setError(result.error || "Something went wrong. Please try again.");
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
        <h1 className="text-3xl font-bold text-teal-600 mb-2">
          Create Your Family Account
        </h1>
        <p className="text-lg text-gray-600">
          Get started managing your family&apos;s chores
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
              htmlFor="parentName"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Your Name
            </label>
            <input
              id="parentName"
              name="parentName"
              type="text"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 
                       focus:border-transparent transition-colors bg-white text-gray-900 shadow-sm
                       placeholder:text-gray-400"
              placeholder="Enter your name"
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="familyName"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Your Family Name
            </label>
            <input
              id="familyName"
              name="familyName"
              type="text"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 
                       focus:border-transparent transition-colors bg-white text-gray-900 shadow-sm
                       placeholder:text-gray-400"
              placeholder="Enter your family name"
              disabled={isLoading}
            />
          </div>

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
              minLength={8}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 
                       focus:border-transparent transition-colors bg-white text-gray-900 shadow-sm
                       placeholder:text-gray-400"
              placeholder="Create a secure password"
              disabled={isLoading}
            />
            <p className="mt-1 text-sm text-gray-500">
              Must be at least 8 characters
            </p>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                   font-semibold shadow-sm"
          disabled={isLoading}
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </button>

        <div className="text-center mt-6">
          <Link
            href="/parent/signin"
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
