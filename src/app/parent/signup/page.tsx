import ParentSignupForm from "@/components/ParentSignupForm";
import { Toaster } from "sonner";

export default function ParentSignupPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <Toaster richColors position="top-center" duration={5000} />
      <div className="max-w-md mx-auto">
        <ParentSignupForm />
      </div>
    </main>
  );
} 