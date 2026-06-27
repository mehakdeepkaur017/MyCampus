import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("token");

    // Use 303 See Other to force the browser to use GET on the redirect URL
    return NextResponse.redirect(new URL("/", request.url), { status: 303 });
  } catch (error) {
    console.error("LOGOUT ERROR:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("token");

    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("LOGOUT ERROR:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
