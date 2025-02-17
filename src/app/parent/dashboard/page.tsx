import { Toaster } from "sonner";
import { redirect } from "next/navigation";
import KidsSection from "@/components/dashboard/KidsSection";
import ActivityTimeline from "@/components/dashboard/ActivityTimeline";
import ChoresSection from "@/components/dashboard/ChoresSection";
import { getParentSession, getParentWithFamily } from "@/data/parent";
import type { Kid } from "@/data/parent";

export default async function DashboardPage() {
  const session = await getParentSession();

  if (!session?.user) {
    redirect("/parent/signin");
  }

  const parent = await getParentWithFamily(session.user.id);

  if (!parent) {
    redirect("/parent/signin");
  }

  const { members: kids, activities, chores } = parent.family;

  return (
    <main className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6">
      <Toaster richColors position="top-center" />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <KidsSection initialKids={kids} />
            <ChoresSection
              initialChores={chores}
              kids={kids.map((kid: Kid) => ({
                id: kid.id,
                name: kid.name,
              }))}
            />
          </div>
          <div>
            <ActivityTimeline initialActivities={activities} />
          </div>
        </div>
      </div>
    </main>
  );
}
