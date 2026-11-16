"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";

const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address.").trim(),
  password: z.string().min(1, "Password is required."),
});

const RegisterSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters.").trim(),
    lastName: z.string().min(2, "Last name must be at least 2 characters.").trim(),
    email: z.string().email("Please enter a valid email address.").trim(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
      .regex(/[0-9]/, "Password must contain at least one number."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type ActionState = {
  errors?: Record<string, string[]>;
  message?: string;
} | undefined;

export async function loginAction(state: ActionState, formData: FormData): Promise<ActionState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validatedFields = LoginSchema.safeParse({ email, password });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: validatedFields.data.email },
    });

    if (!user || !user.isActive) {
      return {
        message: "Invalid email or password.",
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return {
        message: "Invalid email or password.",
      };
    }

    await createSession(user.firstName + " " + user.lastName, user.id, user.email, user.role);
  } catch (error) {
    console.error("Login error:", error);
    return {
      message: "An unexpected error occurred. Please try again.",
    };
  }

  redirect("/dashboard");
}

export async function registerAction(state: ActionState, formData: FormData): Promise<ActionState> {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  const validatedFields = RegisterSchema.safeParse({
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedFields.data.email },
    });

    if (existingUser) {
      return {
        errors: {
          email: ["An account with this email already exists."],
        },
      };
    }

    const passwordHash = await bcrypt.hash(validatedFields.data.password, 10);

    const newUser = await prisma.user.create({
      data: {
        firstName: validatedFields.data.firstName,
        lastName: validatedFields.data.lastName,
        email: validatedFields.data.email,
        passwordHash,
        role: "AGENT",
      },
    });

    await createSession(newUser.firstName + " " + newUser.lastName, newUser.id, newUser.email, newUser.role);
  } catch (error) {
    console.error("Registration error:", error);
    return {
      message: "Failed to create account. Please try again.",
    };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/");
}
