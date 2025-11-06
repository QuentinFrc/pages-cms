"use client";

import { Github } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useActionState } from "react";
import { toast } from "sonner";
import { siteConfig } from "@/config";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { handleEmailSignIn, handleGithubSignIn } from "@/lib/actions/auth";

export function SignIn() {
  const [emailSignInState, emailSignInAction] = useActionState(
    handleEmailSignIn,
    { message: "" }
  );
  const emailInputRef = useRef<HTMLInputElement>(null);

  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "";

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
    if (emailSignInState?.message) {
      toast.success(emailSignInState.message, { duration: 10_000 });
      if (emailInputRef.current) emailInputRef.current.value = "";
    }
  }, [emailSignInState]);

  return (
    <div className="flex h-screen items-center justify-center p-4 md:p-6">
      <div className="w-full space-y-6 sm:max-w-[340px]">
        <h1 className="text-center font-semibold text-xl tracking-tight lg:text-2xl">
          Sign in to {siteConfig.name}
        </h1>
        <form action={handleGithubSignIn}>
          <SubmitButton className="w-full" type="submit">
            <Github className="mr-2 h-4 w-4" />
            Sign in with GitHub
          </SubmitButton>
        </form>
        <div className="relative text-center">
          <div className="absolute inset-0 flex items-center">
            <hr className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>
        <form action={emailSignInAction} className="space-y-2">
          <Input
            name="email"
            placeholder="Email"
            ref={emailInputRef}
            required
            type="email"
          />
          {emailSignInState?.error && (
            <div className="font-medium text-red-500 text-sm">
              {emailSignInState.error}
            </div>
          )}
          <SubmitButton className="w-full" type="submit">
            Sign in with email
          </SubmitButton>
        </form>
        <p className="text-muted-foreground text-sm">
          By clicking continue, you agree to our{" "}
          <a
            className="underline hover:decoration-muted-foreground/50"
            href={siteConfig.links.terms}
            rel="noopener"
            target="_blank"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            className="underline hover:decoration-muted-foreground/50"
            href={siteConfig.links.privacy}
            rel="noopener"
            target="_blank"
          >
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
