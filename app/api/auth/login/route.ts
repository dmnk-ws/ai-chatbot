import { NextRequest, NextResponse } from "next/server";

import { setAuthCookie } from "@/lib/auth/cookie";
import { createSession } from "@/lib/auth/jwt";
import User from "@/lib/db/models/User";
import { dbConnect } from "@/lib/db/mongoose";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const user = await User.findByCredentials(email, password);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const { token, publicUser } = createSession(user);

    const res = NextResponse.json(publicUser, { status: 200 });
    setAuthCookie(res, token);

    return res;
  } catch {
    return NextResponse.json(
      { error: "Something went wrong, please try again" },
      { status: 500 },
    );
  }
}
