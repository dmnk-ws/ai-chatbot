import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

import { COOKIE_NAME, TOKEN_EXPIRES_IN } from "@/lib/auth/cookie";
import { IUser, PublicUser } from "@/lib/db/models/User";

const JWT_SECRET = process.env.JWT_SECRET!;

export function signToken(payload: PublicUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
}

export function verifyToken(token: string): PublicUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as PublicUser &
      jwt.JwtPayload;
    return {
      id: decoded.id,
      email: decoded.email,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<PublicUser | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function createSession(user: IUser): {
  token: string;
  publicUser: PublicUser;
} {
  const publicUser: PublicUser = {
    id: user.id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };
  return { token: signToken(publicUser), publicUser };
}
