import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { prisma } from "@/lib/db";
import { CookieOptions } from "@supabase/ssr";

async function getSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
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
}

export async function getParentSession() {
  "use server";
  const supabase = await getSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export type ActivityStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ActivityType = "CHORE" | "REDEMPTION";

export interface Activity {
  id: string;
  kidId: string;
  kidName: string;
  type: ActivityType;
  status: ActivityStatus;
  points: number;
  timestamp: Date;
  choreId?: string;
  choreName?: string;
  actionText: string;
  itemName: string;
}

export interface Chore {
  id: string;
  name: string;
  points: number;
  optional: boolean;
  assignedToId?: string;
  assignedToName?: string;
}

export interface Kid {
  id: string;
  name: string;
  points: number;
  specialCode: string;
}

export async function getParentWithFamily(authId: string) {
  "use server";

  type ParentWithFamily = {
    id: string;
    name: string;
    role: "PARENT";
    points: number | null;
    specialCode: string | null;
    familyId: string;
    family: {
      id: string;
      name: string;
      members: {
        id: string;
        name: string;
        points: number | null;
        specialCode: string | null;
      }[];
      activities: {
        id: string;
        childId: string;
        type: string;
        status: string;
        timestamp: Date;
        points: number;
        child: { name: string };
        chore: { points: number; name: string } | null;
        choreId: string | null;
      }[];
      chores: {
        id: string;
        name: string;
        points: number;
        optional: boolean;
        assignedToId: string | null;
        assignedTo: { name: string } | null;
      }[];
    };
  };

  const parent = (await prisma.familyMember.findUnique({
    where: { id: authId },
    include: {
      family: {
        include: {
          members: {
            where: { role: "CHILD" },
            orderBy: { name: "desc" },
          },
          activities: {
            orderBy: { timestamp: "desc" },
            take: 20,
            include: {
              child: true,
              chore: true,
            },
            where: {
              OR: [{ type: "CHORE" }, { type: "REDEMPTION" }],
            },
          },
          chores: {
            where: {
              completed: false,
            },
            orderBy: { name: "asc" },
            include: {
              assignedTo: true,
            },
          },
        },
      },
    },
  })) as ParentWithFamily | null;

  if (!parent?.family) {
    return null;
  }

  return {
    ...parent,
    family: {
      ...parent.family,
      members: parent.family.members.map(
        (kid): Kid => ({
          id: kid.id,
          name: kid.name,
          points: kid.points ?? 0,
          specialCode: kid.specialCode ?? "",
        })
      ),
      activities: parent.family.activities.map((activity) => ({
        id: activity.id,
        kidId: activity.childId,
        kidName: activity.child.name,
        type: activity.type as ActivityType,
        status: activity.status as ActivityStatus,
        points: activity.points,
        timestamp: activity.timestamp,
        choreId: activity.choreId ?? undefined,
        choreName: activity.chore?.name,
        actionText:
          activity.type === "CHORE"
            ? `${activity.status.toLowerCase()} chore`
            : `redeemed reward`,
        itemName:
          activity.type === "CHORE"
            ? activity.chore?.name ?? "Unknown Chore"
            : "",
      })),
      chores: parent.family.chores.map((chore) => ({
        id: chore.id,
        name: chore.name,
        points: chore.points,
        optional: chore.optional,
        assignedToId: chore.assignedToId ?? undefined,
        assignedToName: chore.assignedTo?.name,
      })),
    },
  };
}
