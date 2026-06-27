import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("token");

    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("LOGOUT ERROR:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
