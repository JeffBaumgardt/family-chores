"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { prisma } from "@/lib/db";
import { CookieOptions } from "@supabase/ssr";
import type { ActivityStatus } from "@/data/parent";
import { normalizeCode } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export interface AddChildResponse {
  success: boolean;
  error?: string;
  child?: {
    id: string;
    name: string;
    specialCode: string;
    points: number;
  };
}

export async function addChild(
  name: string,
  code: string
): Promise<AddChildResponse> {
  try {
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
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Get the parent's family ID
    const parent = await prisma.familyMember.findUnique({
      where: { id: session.user.id },
      select: { familyId: true },
    });

    if (!parent) {
      return {
        success: false,
        error: "Parent not found",
      };
    }

    const normalizedCode = normalizeCode(code);

    // Check if code is already in use
    const existing = await prisma.familyMember.findUnique({
      where: { specialCode: normalizedCode },
    });

    if (existing) {
      return {
        success: false,
        error: "This code is already in use. Please try another one.",
      };
    }

    // Create the child record
    const child = await prisma.familyMember.create({
      data: {
        name,
        role: "CHILD",
        points: 0,
        specialCode: normalizedCode,
        familyId: parent.familyId,
      },
      select: {
        id: true,
        name: true,
        specialCode: true,
      },
    });

    revalidatePath("/parent/dashboard");

    return {
      success: true,
      child: {
        id: child.id,
        name: child.name,
        specialCode: child.specialCode || "",
        points: 0,
      },
    };
  } catch (error) {
    console.error("Error adding child:", error);
    return {
      success: false,
      error: "Failed to add child",
    };
  }
}

export async function removeChild(kidId: string) {
  try {
    // Delete all associated records in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete child's activities
      await tx.activity.deleteMany({
        where: { childId: kidId },
      });

      // Unassign chores assigned to this child
      await tx.chore.updateMany({
        where: { assignedToId: kidId },
        data: { assignedToId: null },
      });

      // Finally delete the child
      await tx.familyMember.delete({
        where: { id: kidId },
      });
    });

    revalidatePath("/parent/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error removing child:", error);
    return {
      success: false,
      error: "Failed to remove child",
    };
  }
}

export async function updateChild(
  kidId: string,
  data: { name?: string; points?: number }
): Promise<AddChildResponse> {
  try {
    const child = await prisma.familyMember.update({
      where: { id: kidId },
      data: {
        name: data.name,
        points: data.points !== undefined ? data.points : undefined,
      },
      select: {
        id: true,
        name: true,
        points: true,
        specialCode: true,
      },
    });

    revalidatePath("/parent/dashboard");
    return {
      success: true,
      child: {
        id: child.id,
        name: child.name,
        points: child.points ?? 0,
        specialCode: child.specialCode || "",
      },
    };
  } catch (error) {
    console.error("Error updating child:", error);
    return {
      success: false,
      error: "Failed to update child",
    };
  }
}

interface UpdateActivityResponse {
  success: boolean;
  error?: string;
}

export async function updateActivity(
  activityId: string,
  status: ActivityStatus
): Promise<UpdateActivityResponse> {
  try {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        child: true,
        chore: true,
      },
    });

    if (!activity) {
      return {
        success: false,
        error: "Activity not found",
      };
    }

    // Start a transaction to update both activity status and points
    await prisma.$transaction(async (tx) => {
      // Update activity status
      await tx.activity.update({
        where: { id: activityId },
        data: { status },
      });

      // Handle points based on activity type and status
      if (activity.type === "CHORE") {
        if (!activity.chore) {
          throw new Error("Chore not found");
        }
        const points = activity.chore.points;

        if (status === "APPROVED" && activity.status !== "APPROVED") {
          // Add points when approving
          await tx.familyMember.update({
            where: { id: activity.childId },
            data: {
              points: {
                increment: points,
              },
            },
          });
        } else if (status === "REJECTED" && activity.status === "APPROVED") {
          // Remove points when rejecting previously approved chore
          await tx.familyMember.update({
            where: { id: activity.childId },
            data: {
              points: {
                decrement: points,
              },
            },
          });
        }
      } else if (activity.type === "REDEMPTION") {
        const points = activity.points;

        if (status === "APPROVED" && activity.status !== "APPROVED") {
          // Deduct points when approving redemption
          await tx.familyMember.update({
            where: { id: activity.childId },
            data: {
              points: {
                decrement: points,
              },
            },
          });
        } else if (status === "REJECTED" && activity.status === "APPROVED") {
          // Refund points when rejecting previously approved redemption
          await tx.familyMember.update({
            where: { id: activity.childId },
            data: {
              points: {
                increment: points,
              },
            },
          });
        }
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating activity:", error);
    return {
      success: false,
      error: "Failed to update activity",
    };
  }
}

interface ChoreResponse {
  success: boolean;
  error?: string;
  chore?: {
    id: string;
    name: string;
    points: number;
    optional: boolean;
    assignedToId?: string;
    assignedToName?: string;
  };
}

export async function createChore(data: {
  name: string;
  points: number;
  optional: boolean;
  assignedToId?: string;
}): Promise<ChoreResponse> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Get the parent's family ID
    const parent = await prisma.familyMember.findUnique({
      where: { id: session.user.id },
      select: { familyId: true },
    });

    if (!parent) {
      return {
        success: false,
        error: "Parent not found",
      };
    }

    const chore = await prisma.chore.create({
      data: {
        name: data.name,
        points: data.points,
        optional: data.optional,
        assignedToId: data.assignedToId || null,
        familyId: parent.familyId,
      },
      include: {
        assignedTo: true,
      },
    });

    return {
      success: true,
      chore: {
        id: chore.id,
        name: chore.name,
        points: chore.points,
        optional: chore.optional,
        assignedToId: chore.assignedToId ?? undefined,
        assignedToName: chore.assignedTo?.name,
      },
    };
  } catch (error) {
    console.error("Error creating chore:", error);
    return {
      success: false,
      error: "Failed to create chore",
    };
  }
}

export async function updateChore(
  choreId: string,
  data: Partial<{
    name: string;
    points: number;
    optional: boolean;
    assignedToId?: string;
  }>
): Promise<ChoreResponse> {
  try {
    const chore = await prisma.chore.update({
      where: { id: choreId },
      data: {
        name: data.name,
        points: data.points,
        optional: data.optional,
        assignedToId: data.assignedToId,
      },
      include: {
        assignedTo: true,
      },
    });

    return {
      success: true,
      chore: {
        id: chore.id,
        name: chore.name,
        points: chore.points,
        optional: chore.optional,
        assignedToId: chore.assignedToId ?? undefined,
        assignedToName: chore.assignedTo?.name,
      },
    };
  } catch (error) {
    console.error("Error updating chore:", error);
    return {
      success: false,
      error: "Failed to update chore",
    };
  }
}

export async function deleteChore(
  choreId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.chore.delete({
      where: { id: choreId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting chore:", error);
    return {
      success: false,
      error: "Failed to delete chore",
    };
  }
}

export async function redeemReward(data: {
  childId: string;
  points: number;
  familyId: string;
}) {
  try {
    if (!data || !data.childId || !data.familyId) {
      console.error("Invalid redemption data:", data);
      return {
        success: false,
        error: "Missing required redemption data",
      };
    }

    console.log("Starting redemption with data:", data);

    await prisma.$transaction(async (tx) => {
      try {
        // Create activity for the redemption
        const activity = await tx.activity.create({
          data: {
            type: "REDEMPTION",
            status: "PENDING",
            childId: data.childId,
            familyId: data.familyId,
            points: data.points,
          },
        });
        console.log("Created activity:", activity);

        // Deduct points from child
        const updatedChild = await tx.familyMember.update({
          where: { id: data.childId },
          data: {
            points: {
              decrement: data.points,
            },
          },
        });
        console.log("Updated child points:", updatedChild);
      } catch (txError) {
        console.error("Transaction error:", txError);
        throw txError;
      }
    });

    revalidatePath("/parent/dashboard");
    revalidatePath(`/kids/${data.childId}`);

    return { success: true };
  } catch (error) {
    console.error("Error in redeemReward:", error);
    return {
      success: false,
      error: "Failed to redeem reward",
    };
  }
}
