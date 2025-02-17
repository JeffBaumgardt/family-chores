import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { prisma } from "@/lib/db";
import { normalizeCode } from "@/lib/utils";

export async function getKidByCode(code: string) {
  const normalizedCode = normalizeCode(code);
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookie = cookieStore.get(name);
          return cookie?.value;
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  const kid = await prisma.familyMember.findFirst({
    where: {
      specialCode: normalizedCode,
      role: "CHILD",
    },
    select: {
      id: true,
      name: true,
      points: true,
      family: {
        select: {
          chores: {
            where: {
              completed: false,
            },
            select: {
              id: true,
              name: true,
              points: true,
              completed: true,
              optional: true,
              assignedToId: true,
            },
          },
        },
      },
    },
  });

  console.log("kid", kid);

  if (!kid) return null;

  // Split chores into assigned and optional
  const assignedChores = kid.family.chores.filter((chore) => !chore.optional);
  const optionalChores = kid.family.chores.filter((chore) => chore.optional);

  return {
    ...kid,
    assignedChores,
    optionalChores,
  };
}

export async function verifyKidCode(code: string) {
  const normalizedCode = normalizeCode(code);

  const kid = await prisma.familyMember.findFirst({
    where: {
      specialCode: normalizedCode,
      role: "CHILD",
    },
    select: {
      id: true,
      name: true,
    },
  });

  return kid !== null;
}
