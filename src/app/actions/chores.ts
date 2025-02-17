"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { CookieOptions } from "@supabase/ssr";

interface ChoreActivity {
  id: string;
  kidId: string;
  kidName: string;
  choreId: string;
  choreName: string;
  points: number;
  status: "completed" | "denied" | "pending";
  timestamp: Date;
}

export async function completeChore(choreId: string, childId: string) {
  try {
    const chore = await prisma.chore.findUnique({
      where: { id: choreId },
      select: {
        points: true,
        name: true,
        familyId: true,
      },
    });

    if (!chore) {
      return { success: false, error: "Chore not found" };
    }

    await prisma.$transaction(async (tx) => {
      // Create activity record
      await tx.activity.create({
        data: {
          type: "CHORE",
          status: "PENDING",
          points: chore.points,
          name: chore.name,
          childId,
          choreId,
          familyId: chore.familyId,
        },
      });

      // Mark chore as completed
      await tx.chore.update({
        where: { id: choreId },
        data: { completed: true },
      });
    });

    revalidatePath(`/kids/${childId}`);
    return { success: true };
  } catch (error) {
    console.error("Error completing chore:", error);
    return { success: false, error: "Failed to complete chore" };
  }
}

export async function getChoreActivities(): Promise<ChoreActivity[]> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookie = await cookieStore.get(name);
          return cookie?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          await cookieStore.set({ name, value, ...options });
        },
        async remove(name: string, options: CookieOptions) {
          await cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    throw new Error("Not authenticated");
  }

  // Get the parent's family ID
  const parent = await prisma.familyMember.findUnique({
    where: { id: session.user.id },
    select: { familyId: true },
  });

  if (!parent) {
    throw new Error("Parent not found");
  }

  // Get all completed chores for the family's children
  const activities = await prisma.chore.findMany({
    where: {
      assignedTo: {
        familyId: parent.familyId,
        role: "CHILD",
      },
      completed: true,
    },
    select: {
      id: true,
      name: true,
      points: true,
      completed: true,
      denied: true,
      assignedTo: {
        select: {
          id: true,
          name: true,
        },
      },
      updatedAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return activities.map((activity) => ({
    id: activity.id,
    kidId: activity.assignedTo!.id,
    kidName: activity.assignedTo!.name,
    choreId: activity.id,
    choreName: activity.name,
    points: activity.points,
    status: activity.denied
      ? "denied"
      : activity.completed
      ? "completed"
      : "pending",
    timestamp: activity.updatedAt,
  }));
}

export async function denyChore(choreId: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookie = await cookieStore.get(name);
          return cookie?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          await cookieStore.set({ name, value, ...options });
        },
        async remove(name: string, options: CookieOptions) {
          await cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    throw new Error("Not authenticated");
  }

  // Get the chore and verify parent's access
  const chore = await prisma.chore.findUnique({
    where: { id: choreId },
    include: {
      assignedTo: {
        include: {
          family: {
            include: {
              members: {
                where: {
                  id: session.user.id,
                  role: "PARENT",
                },
              },
            },
          },
        },
      },
    },
  });

  if (!chore || chore.assignedTo?.family.members.length === 0) {
    throw new Error("Unauthorized or chore not found");
  }

  // Update chore and deduct points
  await prisma.$transaction([
    prisma.chore.update({
      where: { id: choreId },
      data: {
        completed: false,
        denied: true,
      },
    }),
    prisma.familyMember.update({
      where: { id: chore.assignedTo!.id },
      data: {
        points: {
          decrement: chore.points,
        },
      },
    }),
  ]);

  return { success: true };
}

export async function reenableChore(choreId: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookie = await cookieStore.get(name);
          return cookie?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          await cookieStore.set({ name, value, ...options });
        },
        async remove(name: string, options: CookieOptions) {
          await cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    throw new Error("Not authenticated");
  }

  // Get the chore and verify parent's access
  const chore = await prisma.chore.findUnique({
    where: { id: choreId },
    include: {
      assignedTo: {
        include: {
          family: {
            include: {
              members: {
                where: {
                  id: session.user.id,
                  role: "PARENT",
                },
              },
            },
          },
        },
      },
    },
  });

  if (!chore || chore.assignedTo?.family.members.length === 0) {
    throw new Error("Unauthorized or chore not found");
  }

  // Reset chore status
  await prisma.chore.update({
    where: { id: choreId },
    data: {
      completed: false,
      denied: false,
    },
  });

  return { success: true };
}
