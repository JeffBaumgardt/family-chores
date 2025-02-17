import ParentSigninForm from "@/components/ParentSigninForm";
import { Toaster } from "sonner";

export default function ParentSigninPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <Toaster richColors position="top-center" />
      <div className="max-w-md mx-auto">
        <ParentSigninForm />
      </div>
    </main>
  );
} 