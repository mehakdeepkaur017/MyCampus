import { cookies } from "next/headers";
import { verifyToken, SessionPayload } from "./auth";

export async function getCurrentSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  
  if (!token) {
    return null;
  }

  try {
    const payload = await verifyToken(token);
    return payload;
  } catch (error) {
    return null;
  }
}
