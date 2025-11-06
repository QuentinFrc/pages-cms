"use client";

import { Loader } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  handleSignInWithToken,
  handleSignOutAndSignIn,
} from "@/lib/actions/auth";

export function SignInFromInvite({
  token,
  githubUsername,
  email,
  redirectTo,
}: {
  token: string;
  githubUsername?: string;
  email?: string;
  redirectTo?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!githubUsername) {
      const timer = setTimeout(handleSignIn, 300);
      clearTimeout(timer);
    }
  }, []);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await handleSignInWithToken(token, redirectTo);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center p-4 md:p-6">
      <div className="w-full space-y-6 sm:max-w-[340px]">
        {githubUsername ? (
          <>
            <h1 className="text-center font-semibold text-xl tracking-tight lg:text-2xl">
              Sign out from your GitHub account?
            </h1>
            <p className="text-muted-foreground text-sm">
              You are already signed in with your GitHub account (@
              {githubUsername}).
              {redirectTo
                ? ` Do you want to sign out from your GitHub account and sign in as a collaborator with ${email} or try to access "${redirectTo}" with your GitHub account?`
                : ` Do you want to sign out from your GitHub account and sign in as a collaborator with ${email}?`}
            </p>
            <footer className="flex flex-col gap-y-2">
              <Button
                disabled={isLoading}
                onClick={() => {
                  setIsLoading(true);
                  handleSignOutAndSignIn(token, redirectTo);
                }}
                variant="default"
              >
                Sign in as collaborator
                {isLoading && <Loader className="ml-2 h-4 w-4 animate-spin" />}
              </Button>
              {redirectTo && (
                <Link
                  className={buttonVariants({ variant: "outline" })}
                  href={redirectTo}
                >
                  <span className="truncate">
                    Go to &quot;{redirectTo}&quot;
                  </span>
                </Link>
              )}
            </footer>
          </>
        ) : (
          <>
            <h1 className="text-center font-semibold text-xl tracking-tight lg:text-2xl">
              Sign in as a collaborator?
            </h1>
            <p className="text-muted-foreground text-sm">
              Please confirm that you want to sign in with {email}.
            </p>
            <footer className="flex flex-col gap-y-2">
              <Button
                disabled={isLoading}
                onClick={handleSignIn}
                variant="default"
              >
                Sign in
                {isLoading && <Loader className="ml-2 h-4 w-4 animate-spin" />}
              </Button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
