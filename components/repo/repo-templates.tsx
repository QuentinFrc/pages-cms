"use client";

import { ArrowUpRight, ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { toast } from "sonner";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/contexts/user-context";
import { handleCopyTemplate } from "@/lib/actions/template";
import templates from "@/lib/utils/templates";

export function RepoTemplates({ defaultAccount }: { defaultAccount?: any }) {
  const { user } = useUser();
  const router = useRouter();
  const dialogCloseRef = useRef<any>(null);

  const [copyTemplateState, copyTemplateAction] = useFormState(
    handleCopyTemplate,
    {
      message: "",
      data: {
        template: "",
        owner: "",
        repo: "",
        branch: "",
      },
    }
  );
  const [selectedAccount, setSelectedAccount] = useState(
    defaultAccount || user?.accounts?.[0]
  );
  const [name, setName] = useState(templates[0].suggested);
  const [isValidName, setIsValidName] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const validateName = useCallback((name: string) => {
    if (!name || name.length > 100) return false;
    const validNameRegex =
      /^(?!\.|\.\.|.*\/|.*\/\.|.*\.\.|.*\/\.)(?!@)(?!.*[~^:?*[\]{}()<>#%&!\\$'"|;,])[^\x20\x7f]*[^\x20\x7f.]$/;
    return validNameRegex.test(name);
  }, []);

  useEffect(() => {
    setIsValidName(validateName(name));
  }, [name, validateName]);

  useEffect(() => {
    const waitForRepoReadyPromise = new Promise(async (resolve, reject) => {
      try {
        if (!(copyTemplateState.data?.owner && copyTemplateState.data?.repo))
          return;

        let attempt = 0;
        while (attempt < 10) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const response = await fetch(
            `/api/${copyTemplateState.data.owner}/${copyTemplateState.data.repo}/main/entries/.pages.yml`
          );
          if (response.ok) {
            const data: any = await response.json();
            if (data.status === "success") resolve(response);
          }
          attempt++;
        }

        throw new Error("Repository is not ready after 10 seconds");
      } catch (error) {
        reject(error);
      }
    });

    if (copyTemplateState?.message) {
      toast.success(copyTemplateState.message, { duration: 10_000 });
      if (dialogCloseRef.current) dialogCloseRef.current.click();
      toast.promise(waitForRepoReadyPromise, {
        loading: "Waiting for the repository to be ready",
        success: (response: any) => {
          if (!(copyTemplateState.data?.owner && copyTemplateState.data?.repo))
            return;
          router.push(
            `/${copyTemplateState.data.owner}/${copyTemplateState.data.repo}`
          );
          return "Repository is ready, redirecting you.";
        },
        error: (error: any) => error.message,
      });
    }
  }, [copyTemplateState, router]);

  useEffect(() => {
    if (defaultAccount) setSelectedAccount(defaultAccount);
  }, [defaultAccount]);

  return (
    <div className="flex flex-col gap-y-4">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
        {templates
          .filter((item) => item.featured === true)
          .map((template: any) => (
            <Dialog key={template.repository}>
              <DialogTrigger asChild>
                <button className="overflow-hidden rounded-md border ring-offset-background transition-colors hover:cursor-pointer hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <img
                    alt={`Preview for ${template.name}`}
                    className="aspect-video"
                    src={template.thumbnail}
                  />
                  <div className="flex items-center gap-x-2 border-t border-t-accent px-3 py-2 text-sm">
                    <div
                      className="h-4 w-4 shrink-0"
                      dangerouslySetInnerHTML={{ __html: template.icon }}
                    />
                    <div className="truncate font-medium">{template.name}</div>
                  </div>
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form action={copyTemplateAction} className="grid gap-4">
                  <DialogHeader>
                    <DialogTitle>Copy template</DialogTitle>
                    <DialogDescription>
                      This will create a copy of the template repository below
                      under the selected account.
                    </DialogDescription>
                  </DialogHeader>
                  <a
                    className="relative flex items-center overflow-hidden rounded-lg border outline-none transition-all hover:bg-accent focus:bg-accent"
                    href={`https://github.com/${template.repository}`}
                    target="_blank"
                  >
                    <img
                      alt={`Preview for ${template.name}`}
                      className="aspect-video h-20"
                      src={template.thumbnail}
                    />
                    <div className="flex h-full flex-1 flex-col justify-center gap-y-1 truncate border-l border-l-accent px-3 py-2 text-left">
                      <div className="truncate font-medium tracking-tight">
                        {template.name}
                      </div>
                      <div className="truncate text-muted-foreground text-xs">
                        {template.repository}
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <ArrowUpRight className="h-3 w-3 opacity-50" />
                    </div>
                  </a>
                  <div className="grid gap-4">
                    <input
                      name="owner"
                      readOnly
                      type="hidden"
                      value={selectedAccount.login}
                    />
                    <input
                      name="template"
                      readOnly
                      type="hidden"
                      value={template.repository}
                    />
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right" htmlFor="name">
                        Account
                      </Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="col-span-3 px-3" variant="outline">
                            <img
                              alt={`${selectedAccount.login}'s avatar`}
                              className="mr-2 h-6 w-6 rounded"
                              src={`https://github.com/${selectedAccount.login}.png`}
                            />
                            <div>{selectedAccount.login}</div>
                            <ChevronsUpDown className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="start"
                          className="min-w-full"
                        >
                          {user?.accounts?.map((account: any) => (
                            <DropdownMenuItem
                              key={account.login}
                              onSelect={() => setSelectedAccount(account)}
                            >
                              <img
                                alt={`${account.login}'s avatar`}
                                className="mr-2 h-6 w-6 rounded"
                                src={`https://github.com/${account.login}.png`}
                              />
                              {account.login}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label
                        className="inline-flex h-10 items-center justify-end"
                        htmlFor="name"
                      >
                        Name
                      </Label>
                      <div className="col-span-3">
                        <Input
                          defaultValue={template.suggested}
                          name="name"
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                        {copyTemplateState?.error && (
                          <div className="mt-2 font-medium text-red-500 text-sm">
                            {copyTemplateState.error}
                          </div>
                        )}
                        {!isValidName && (
                          <div className="mt-2 font-medium text-red-500 text-sm">
                            Invalid name
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose ref={dialogCloseRef} />
                    <SubmitButton disabled={!isValidName} type="submit">
                      Create copy
                    </SubmitButton>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          ))}
      </div>
    </div>
  );
}
