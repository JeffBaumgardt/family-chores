"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function redeemPoints(
  childId: string,
  points: number,
  rewardName: string
) {
  try {
    const child = await prisma.familyMember.findUnique({
      where: { id: childId },
      include: { family: true },
    });

    if (!child) {
      return { success: false, error: "Child not found" };
    }

    if (child.points === null || child.points < points) {
      return { success: false, error: "Not enough points available" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.activity.create({
        data: {
          type: "REDEMPTION",
          status: "PENDING",
          points,
          name: rewardName,
          childId,
          familyId: child.family.id,
        },
      });

      await tx.familyMember.update({
        where: { id: childId },
        data: {
          points: { decrement: points },
        },
      });
    });

    revalidatePath(`/kids/${childId}`);
    return { success: true };
  } catch (error) {
    console.error("Error redeeming points:", error);
    return { success: false, error: "Failed to redeem points" };
  }
}
