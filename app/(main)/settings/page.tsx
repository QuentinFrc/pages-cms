import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Installations } from "@/components/installations";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { getInitialsFromName } from "@/lib/utils/avatar";

export default async function Page() {
  const { user } = await getAuth();
  if (!user) throw new Error("User not found");

  const displayName = user.githubId
    ? user.githubName || user.githubUsername
    : user.email;

  return (
    <div className="mx-auto max-w-(--breakpoint-sm) space-y-6">
      <Link
        className={cn(
          buttonVariants({ variant: "outline", size: "xs" }),
          "inline-flex"
        )}
        href="/"
        prefetch={true}
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Go home
      </Link>
      <header className="mb-6 flex items-center">
        <h1 className="font-semibold text-lg tracking-tight md:text-2xl">
          Settings
        </h1>
      </header>
      <div className="relative flex flex-1 flex-col space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Profile</CardTitle>
            <CardDescription>
              Manage the information displayed to other users.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="w-full">
              <div className="grid w-full items-center gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right" htmlFor="name">
                    Name
                  </Label>
                  <div className="col-span-3">
                    <Input defaultValue={displayName} disabled name="name" />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right" htmlFor="picture">
                    Picture
                  </Label>
                  <div className="col-span-3">
                    <Avatar className="h-24 w-24 rounded-md">
                      <AvatarImage
                        alt={user?.githubId ? user.githubUsername : user.email}
                        src={
                          user?.githubId
                            ? `https://avatars.githubusercontent.com/u/${user.githubId}`
                            : `https://unavatar.io/${user?.email}?fallback=false`
                        }
                      />
                      <AvatarFallback className="rounded-md">
                        {getInitialsFromName(displayName)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button className="ml-auto" disabled size="sm">
              Save profile
            </Button>
          </CardFooter>
        </Card>

        {user.githubId && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">
                Installations
              </CardTitle>
              <CardDescription>
                Manage the accounts the Github application is installed on.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Installations />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
