import Link from "next/link";
import { Toaster } from "sonner";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <Toaster richColors position="top-center" />
      <div className="max-w-md mx-auto">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-teal-600 mb-2">
              Family Chores
            </h1>
            <p className="text-lg text-gray-600">
              Manage your family&apos;s chores and rewards
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col gap-4">
              <Link
                href="/parent/signin"
                className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 text-center font-medium"
              >
                Parent Sign In
              </Link>
              <Link
                href="/parent/signup"
                className="w-full bg-white text-teal-600 py-3 px-4 rounded-lg border-2 border-teal-600 hover:bg-teal-50 text-center font-medium"
              >
                Create Family Account
              </Link>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <div>
              <Link
                href="/kids"
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 flex items-center justify-center gap-2 font-medium"
              >
                <span>Kid Login</span>
                <span className="text-xl">👋</span>
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-600">
            <p>
              Parents: Create an account to manage chores and rewards for your
              family.
            </p>
            <p className="mt-2">
              Kids: Use your special code from your parents to log in!
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
