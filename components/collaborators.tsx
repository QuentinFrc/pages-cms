"use client";

import { Ban, Loader, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, useActionState } from "react";
import { toast } from "sonner";
import { Message } from "@/components/message";
import { SubmitButton } from "@/components/submit-button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  handleAddCollaborator,
  handleRemoveCollaborator,
} from "@/lib/actions/collaborator";

export function Collaborators({
  owner,
  repo,
  branch,
}: {
  owner: string;
  repo: string;
  branch?: string;
}) {
  // TODO: add support for branches and accounts collaborators
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [addCollaboratorState, addCollaboratorAction] = useActionState(
    handleAddCollaborator,
    { message: "", data: [] }
  );
  const [email, setEmail] = useState<string>("");
  const [removing, setRemoving] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // TODO: remove this, we can probably let error.tsx catch that
  const [error, setError] = useState<string | undefined | null>(null);

  const isEmailInList = useMemo(
    () => collaborators.some((collaborator) => collaborator.email === email),
    [email, collaborators]
  );

  const addNewCollaborator = useCallback((newCollaborator: any) => {
    setCollaborators((prevCollaborators) => [
      ...prevCollaborators,
      ...newCollaborator,
    ]);
  }, []);

  useEffect(() => {
    async function fetchCollaborators() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/collaborators/${owner}/${repo}`);

        if (!response.ok)
          throw new Error(
            `Failed to fetch collection: ${response.status} ${response.statusText}`
          );

        const data: any = await response.json();

        if (data.status !== "success") throw new Error(data.message);

        setCollaborators(data.data);

        if (data.data.errors && data.data.errors.length > 0) {
          data.data.errors.forEach((error: any) => toast.error(error));
        }
      } catch (error: any) {
        console.error(error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCollaborators();
  }, [owner, repo, branch]);

  const handleConfirmRemove = async (collaboratorId: number) => {
    setRemoving([...removing, collaboratorId]);

    try {
      const removed = await handleRemoveCollaborator(
        collaboratorId,
        owner,
        repo
      );

      if (removed.error) {
        toast.error(removed.error);
      } else {
        setCollaborators(
          collaborators.filter(
            (collaborator) => collaborator.id !== collaboratorId
          )
        );
        toast.success(removed.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setRemoving(removing.filter((id) => id !== collaboratorId));
    }
  };

  useEffect(() => {
    if (addCollaboratorState?.message) {
      if (addCollaboratorState.data && addCollaboratorState.data.length > 0) {
        addNewCollaborator(addCollaboratorState.data);
      }

      toast.success(addCollaboratorState.message, { duration: 10_000 });
      setEmail("");
    }
  }, [addCollaboratorState, addNewCollaborator]);

  const loadingSkeleton = useMemo(
    () => (
      <ul>
        <li className="flex items-center gap-x-2 border border-b-0 px-3 py-2 text-sm first:rounded-t-md last:rounded-b-md last:border-b">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-5 w-24 rounded text-left" />
          <Button className="ml-auto" disabled size="xs" variant="outline">
            <Trash2 className="h-4 w-4" />
          </Button>
        </li>
      </ul>
    ),
    []
  );

  if (error) {
    return (
      <Message
        className="absolute inset-0"
        description={"We could not fetch the list of collaborators."}
        title="Something's wrong"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* <pre>{JSON.stringify(collaborators, null, 2)}</pre> */}
      {isLoading ? (
        loadingSkeleton
      ) : collaborators.length > 0 ? (
        <ul>
          {collaborators.map((collaborator: any) => (
            <li
              className="flex items-center gap-x-2 border border-b-0 px-3 py-2 text-sm first:rounded-t-md last:rounded-b-md last:border-b"
              key={collaborator.id}
            >
              <Avatar className="h-6 w-6">
                <AvatarImage
                  alt={`${collaborator.email}'s avatar`}
                  src={`https://unavatar.io/${collaborator.email}?fallback=false`}
                />
                <AvatarFallback className="font-medium text-muted-foreground text-xs uppercase">
                  {collaborator.email.split("@")[0].substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="truncate text-left font-medium">
                {collaborator.email}
              </div>
              <AlertDialog>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertDialogTrigger asChild>
                      <Button
                        className="ml-auto"
                        disabled={removing.includes(collaborator.id)}
                        size="xs"
                        variant="ghost"
                      >
                        {removing.includes(collaborator.id) ? (
                          <Loader className="ml-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Remove collaborator</TooltipContent>
                </Tooltip>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove access to &quot;{owner}/{repo}&quot; for
                      &quot;{collaborator.email}&quot;.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleConfirmRemove(collaborator.id)}
                    >
                      Remove collaborator
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex h-[50px] items-center justify-center rounded-md bg-accent px-3 py-2 text-muted-foreground text-sm">
          <Ban className="mr-2 h-4 w-4" />
          No collaborators
        </div>
      )}
      <form action={addCollaboratorAction} className="flex gap-x-2">
        <div className="w-full">
          <input name="owner" type="hidden" value={owner} />
          <input name="repo" type="hidden" value={repo} />
          <Input
            name="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            type="email"
            value={email}
          />
          {addCollaboratorState?.error && (
            <div className="mt-2 font-medium text-red-500 text-sm">
              {addCollaboratorState.error}
            </div>
          )}
        </div>
        <SubmitButton disabled={isEmailInList} type="submit">
          Invite by email
        </SubmitButton>
      </form>
    </div>
  );
}
