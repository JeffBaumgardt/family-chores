import { notFound } from "next/navigation";
import { Toaster } from "sonner";
import ChildHeader from "@/components/ChildHeader";
import ChoreList from "@/components/ChoreList";
import PointsRedemption from "@/components/PointsRedemption";
import { getKidByCode } from "@/data/kid";

interface PageProps {
  params: Promise<{
    code: string;
  }>;
}

export default async function ChildPortal({ params }: PageProps) {
  const { code } = await params;

  const kid = await getKidByCode(code);
  console.log("kid", kid);

  if (!kid) {
    notFound();
  }

  return (
    <main className="min-h-screen p-4 sm:p-6">
      <Toaster richColors position="top-center" />
      <div className="max-w-2xl mx-auto">
        <ChildHeader name={kid.name} points={kid.points ?? 0} />

        <ChoreList
          childId={kid.id}
          title="Your Chores"
          chores={kid.assignedChores}
          buttonText="Done!"
          emoji="✅"
        />

        <ChoreList
          childId={kid.id}
          title="Extra Chores"
          chores={kid.optionalChores}
          buttonText="I'll do it!"
          emoji="🙋"
        />

        <PointsRedemption childId={kid.id} currentPoints={kid.points ?? 0} />
      </div>
    </main>
  );
}
