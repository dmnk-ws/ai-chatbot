export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

const FALLBACK_ERROR = "Something went wrong, please try again";

async function parseResponse(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    throw new Error(FALLBACK_ERROR);
  }
}

export async function getMeApi(): Promise<User | null> {
  try {
    const res = await fetch("/api/auth/me");
    if (!res.ok) return null;
    return (await parseResponse(res)) as User;
  } catch {
    return null;
  }
}

export async function loginApi(email: string, password: string): Promise<User> {
  let res: Response;
  try {
    res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new Error(FALLBACK_ERROR);
  }
  const data = (await parseResponse(res)) as { error?: string } & User;
  if (!res.ok) throw new Error(data.error ?? FALLBACK_ERROR);
  return data;
}

export async function registerApi(
  email: string,
  password: string,
  firstName?: string,
  lastName?: string,
): Promise<User> {
  let res: Response;
  try {
    res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, firstName, lastName }),
    });
  } catch {
    throw new Error(FALLBACK_ERROR);
  }
  const data = (await parseResponse(res)) as { error?: string } & User;
  if (!res.ok) throw new Error(data.error ?? FALLBACK_ERROR);
  return data;
}

export async function logoutApi(): Promise<void> {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    // best-effort — clear local state regardless
  }
}
