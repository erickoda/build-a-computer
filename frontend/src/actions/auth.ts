"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set({
    name: "access_token",
    value: token,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
  });
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");

  redirect("/sign-in");
}
