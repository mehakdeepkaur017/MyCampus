import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-fallback-key-change-me";
const encodedKey = new TextEncoder().encode(JWT_SECRET);

export interface SessionPayload {
  userId: string;
  role: "STUDENT" | "ADMIN";
  [key: string]: any;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function verifyToken(token: string | undefined = ""): Promise<SessionPayload | null> {
  try {
    if (!token) return null;
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as SessionPayload;
  } catch (error) {
    return null;
  }
}
