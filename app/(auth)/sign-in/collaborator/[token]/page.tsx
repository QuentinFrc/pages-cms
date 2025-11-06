import { redirect } from "next/navigation";
import { SignInFromInvite } from "@/components/sign-in-from-invite";
import { getTokenData } from "@/lib/actions/auth";
import { getAuth } from "@/lib/auth";

export default async function Page(
  props: {
    params: Promise<{ token: string }>;
    searchParams: Promise<{ redirect?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const { user } = await getAuth();

  if (!params.token) {
    throw new Error("Your sign in link is invalid (token is missing).");
  }

  if (user && !user.githubId) {
    redirect(searchParams.redirect || "/");
  }

  const { tokenHash, emailLoginToken } = await getTokenData(params.token);

  return (
    <SignInFromInvite
      email={emailLoginToken.email}
      githubUsername={user?.githubUsername}
      redirectTo={searchParams.redirect}
      token={params.token}
    />
  );
}
