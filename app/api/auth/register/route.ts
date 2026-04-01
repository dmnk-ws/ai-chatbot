import { NextRequest, NextResponse } from "next/server";

import { setAuthCookie } from "@/lib/auth/cookie";
import { createSession } from "@/lib/auth/jwt";
import User from "@/lib/db/models/User";
import { dbConnect } from "@/lib/db/mongoose";

export async function POST(req: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    await dbConnect();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 },
      );
    }

    const user = await User.create({
      email,
      password,
      firstName: firstName?.trim() || email.split("@")[0],
      lastName: lastName?.trim() || "",
    });

    const { token, publicUser } = createSession(user);

    const res = NextResponse.json(publicUser, { status: 201 });
    setAuthCookie(res, token);

    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Something went wrong, please try again" },
      { status: 500 },
    );
  }
}
