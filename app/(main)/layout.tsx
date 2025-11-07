import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Providers } from "@/components/providers";
import { getAuth } from "@/lib/auth";
import { getAccounts } from "@/lib/utils/accounts";
import { MainRootLayout } from "./main-root-layout";

type LayoutProps = Readonly<{
  children: ReactNode;
  sidebar: ReactNode;
}>;

export default async function Layout({ children, sidebar }: LayoutProps) {
  const { session, user } = await getAuth();
  if (!session) return redirect("/sign-in");

  const accounts = await getAccounts(user);
  const userWithAccounts = { ...user, accounts };

  return (
    <Providers user={userWithAccounts}>
      <MainRootLayout sidebar={sidebar}>{children}</MainRootLayout>
    </Providers>
  );
}
