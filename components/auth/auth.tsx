"use client";

import { useRouter } from "next/navigation";
import { SyntheticEvent, useState } from "react";

import { AuthType } from "@/components/auth/types";
import Input from "@/components/elements/Input";
import { useAuth } from "@/contexts/AuthContext";

interface AuthProps {
  mode: AuthType;
}

function Footer({ mode }: Readonly<AuthProps>) {
  const start =
    mode === AuthType.SIGN_IN
      ? "Do not have an account? "
      : "Already have an account? ";
  const href = mode === AuthType.SIGN_IN ? "/register" : "/login";
  const label = mode === AuthType.SIGN_IN ? "Sign up" : "Sign in";
  const end = mode === AuthType.SIGN_IN ? " for free." : " instead.";

  return (
    <p className="mt-4 text-center text-gray-600 text-sm">
      {start}
      <a className="font-semibold text-gray-800 hover:underline" href={href}>
        {label}
      </a>
      {end}
    </p>
  );
}

export default function Auth({ mode }: Readonly<AuthProps>) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, register } = useAuth();
  const router = useRouter();

  const header = mode === AuthType.SIGN_IN ? "Sign In" : "Sign Up";
  const subheader =
    mode === AuthType.SIGN_IN
      ? "Use your email and password to sign in"
      : "Create an account with your email and password";

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      if (mode === AuthType.SIGN_IN) {
        await login(email, password);
        router.push("/");
      } else {
        await register(email, password, firstName, lastName);
        router.push("/login");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong, please try again",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-12 w-120 pt-12 justify-start mr-auto ml-auto min-h-screen md:pt-0 md:justify-center">
      <div className="flex w-full max-w-md flex-col gap-12 overflow-hidden rounded-2xl">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h1 className="font-semibold text-xl">{header}</h1>
          <h2 className="text-gray-500 text-sm">{subheader}</h2>
        </div>
        <form
          className="flex flex-col gap-4 px-4 sm:px-16"
          onSubmit={handleSubmit}
        >
          {mode === AuthType.SIGN_UP && (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-zinc-600" htmlFor="firstName">
                  First Name
                </label>
                <Input
                  type="text"
                  autoComplete="given-name"
                  id="firstName"
                  placeholder="Jane"
                  name="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-zinc-600" htmlFor="lastName">
                  Last Name
                </label>
                <Input
                  type="text"
                  autoComplete="family-name"
                  id="lastName"
                  placeholder="Smith"
                  name="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </>
          )}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-zinc-600" htmlFor="email">
              Email Address
            </label>
            <Input
              type="email"
              autoComplete="email"
              id="email"
              placeholder="user@acme.com"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-zinc-600" htmlFor="password">
              Password
            </label>
            <Input
              type="password"
              id="password"
              placeholder="********"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            className={`py-2 px-4 bg-black text-white text-sm font-medium rounded-md cursor-pointer hover:opacity-80 ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
            aria-disabled={isLoading}
            type="submit"
            disabled={isLoading}
          >
            {isLoading
              ? mode === AuthType.SIGN_IN
                ? "Signing in..."
                : "Creating account..."
              : header}
          </button>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <Footer mode={mode} />
        </form>
      </div>
    </div>
  );
}
