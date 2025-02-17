import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-teal-600 mb-4">
          Oops! 😕
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          We couldn&apos;t find your special code. Want to try again?
        </p>
        <Link 
          href="/kids" 
          className="kid-button inline-block"
        >
          Go Back
        </Link>
      </div>
    </main>
  );
} 