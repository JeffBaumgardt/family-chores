"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { verifyCode } from "@/app/actions/auth";

export default function KidLogin() {
  const router = useRouter();
  const [specialCode, setSpecialCode] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsVerifying(true);

    try {
      const result = await verifyCode(specialCode);
      console.log("result", result);

      if (result.success) {
        router.push(`/kids/${result.code}`);
      } else {
        setError(
          result.error || "Oops! Something went wrong. Please try again!"
        );
      }
    } catch (error) {
      console.log("error", error);
      setError("Oops! Something went wrong. Please try again!");
    } finally {
      setIsVerifying(false);
    }
  }

  function handleCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError("");
    setSpecialCode(e.target.value);
  }

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-teal-600 mb-2">
          Welcome to Family Chores!
        </h1>
        <p className="text-lg text-gray-600">
          Enter your special code to start earning points!
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        {error && (
          <div
            className="bg-orange-100 border-l-4 border-orange-500 p-4 mb-4 rounded-lg"
            role="alert"
          >
            <p className="text-2xl text-orange-700 font-bold text-center">
              {error}
            </p>
          </div>
        )}

        <div>
          <label
            htmlFor="specialCode"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            Your Special Code
          </label>
          <input
            id="specialCode"
            type="text"
            value={specialCode}
            onChange={handleCodeChange}
            className="kid-input"
            placeholder="Type your code here..."
            aria-label="Special code input"
            autoComplete="off"
            disabled={isVerifying}
          />
        </div>

        <button
          type="submit"
          className="kid-button w-full"
          disabled={isVerifying}
        >
          {isVerifying ? "Checking..." : "Let's Go!"}
        </button>
      </form>
    </div>
  );
}
