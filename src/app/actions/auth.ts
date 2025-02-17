"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { verifyKidCode } from "@/data/kid";
import { CookieOptions } from "@supabase/ssr";
import { normalizeCode } from "@/lib/utils";

export async function verifyCode(code: string) {
  try {
    const normalizedCode = normalizeCode(code);
    const isValid = await verifyKidCode(normalizedCode);

    if (!isValid) {
      return {
        success: false,
        error: "Whoops! That code didn't work. Try again! 🤔",
      };
    }

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
          async set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          async remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    // Create anonymous session for the child
    const { error } = await supabase.auth.signInAnonymously({
      options: {
        data: {
          special_code: normalizedCode,
          role: "CHILD",
        },
      },
    });

    if (error) {
      return {
        success: false,
        error: "Something went wrong checking your code",
      };
    }

    return { success: true, code: normalizedCode };
  } catch {
    return {
      success: false,
      error: "Something went wrong checking your code",
    };
  }
}
