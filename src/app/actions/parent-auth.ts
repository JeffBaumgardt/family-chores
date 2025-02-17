"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { prisma } from "@/lib/db";
import { CookieOptions } from "@supabase/ssr";

interface SignupData {
  email: string;
  password: string;
  familyName: string;
  parentName: string;
}

export async function signupParent(data: SignupData) {
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

    // Create Supabase auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          role: "PARENT",
        },
      },
    });

    if (authError) {
      return {
        success: false,
        error: "Error creating account. Please try again.",
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: "Error creating account. Please try again.",
      };
    }

    // Create family and parent in database
    await prisma.family.create({
      data: {
        name: data.familyName,
        members: {
          create: {
            id: authData.user.id, // Use Supabase user ID
            name: data.parentName,
            role: "PARENT",
          },
        },
      },
    });

    return { success: true };
  } catch {
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

interface SigninData {
  email: string;
  password: string;
}

export async function signinParent(data: SigninData) {
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

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    return { success: true };
  } catch {
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
