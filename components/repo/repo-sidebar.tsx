"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { About } from "@/components/about";
import { RepoDropdown } from "@/components/repo/repo-dropdown";
import { RepoNav } from "@/components/repo/repo-nav";
import { buttonVariants } from "@/components/ui/button";
import { User } from "@/components/user";
import { useRepo } from "@/contexts/repo-context";
import { useUser } from "@/contexts/user-context";

const RepoSidebar = ({ onClick }: { onClick?: () => void }) => {
  const { user } = useUser();
  const repo = useRepo();

  const account = user?.accounts?.find(
    (account) => account.login === repo.owner
  );

  return (
    <>
      <header className="flex items-center border-b px-3 py-2">
        <Link
          className={buttonVariants({ variant: "ghost", size: "xs" })}
          href="/"
          prefetch={true}
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          All projects
        </Link>
      </header>
      <div className="px-3 pt-1">
        <RepoDropdown onClick={onClick} />
      </div>
      <nav className="flex flex-col gap-y-1 overflow-auto px-3">
        <RepoNav onClick={onClick} />
      </nav>
      <footer className="mt-auto flex items-center gap-x-2 border-t px-3 py-2">
        <User className="mr-auto" onClick={onClick} />
        <About onClick={onClick} />
      </footer>
    </>
  );
};

export { RepoSidebar };
