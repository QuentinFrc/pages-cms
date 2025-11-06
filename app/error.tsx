"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Message } from "@/components/message";
import { buttonVariants } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Message
      className="absolute inset-0"
      description={error.message}
      title="Something's wrong"
    >
      <Link className={buttonVariants({ variant: "default" })} href="/">
        Go to home
      </Link>
    </Message>
  );
}
