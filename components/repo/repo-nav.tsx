"use client";

import { FileStack, FileText, FolderOpen, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useConfig } from "@/contexts/config-context";
import { useUser } from "@/contexts/user-context";
import { cn } from "@/lib/utils";

const RepoNavItem = ({
  children,
  href,
  icon,
  active,
  onClick,
}: {
  children: React.ReactNode;
  href: string;
  icon: React.ReactNode;
  active: boolean;
  onClick?: () => void;
}) => (
  <Link
    className={cn(
      active ? "bg-accent" : "hover:bg-accent",
      "flex items-center rounded-lg px-3 py-2 font-medium outline-none focus:bg-accent"
    )}
    href={href}
    onClick={onClick}
    prefetch={true}
  >
    {icon}
    <span className="truncate">{children}</span>
  </Link>
);

const RepoNav = ({ onClick }: { onClick?: () => void }) => {
  const { config } = useConfig();
  const { user } = useUser();
  const pathname = usePathname();

  const items = useMemo(() => {
    if (!(config && config.object)) return [];
    const configObject: any = config.object;
    const contentItems =
      configObject.content?.map((item: any) => ({
        key: item.name,
        icon:
          item.type === "collection" ? (
            <FileStack className="mr-2 h-5 w-5" />
          ) : (
            <FileText className="mr-2 h-5 w-5" />
          ),
        href: `/${config.owner}/${config.repo}/${encodeURIComponent(config.branch)}/${item.type}/${encodeURIComponent(item.name)}`,
        label: item.label || item.name,
      })) || [];

    const mediaItems =
      configObject.media?.map((item: any) => ({
        key: item.name || "media",
        icon: <FolderOpen className="mr-2 h-5 w-5" />,
        href: `/${config.owner}/${config.repo}/${encodeURIComponent(config.branch)}/media/${item.name}`,
        label: item.label || item.name || "Media",
      })) || [];

    const settingsItem = configObject.settings?.hide
      ? null
      : {
          key: "settings",
          icon: <Settings className="mr-2 h-5 w-5" />,
          href: `/${config.owner}/${config.repo}/${encodeURIComponent(config.branch)}/settings`,
          label: "Settings",
        };

    const collaboratorsItem =
      configObject && Object.keys(configObject).length !== 0 && user?.githubId
        ? {
            key: "collaborators",
            icon: <Users className="mr-2 h-5 w-5" />,
            href: `/${config.owner}/${config.repo}/${encodeURIComponent(config.branch)}/collaborators`,
            label: "Collaborators",
          }
        : null;

    return [
      ...contentItems,
      ...mediaItems,
      settingsItem,
      collaboratorsItem,
    ].filter(Boolean);
  }, [config, user?.githubId]);

  if (!items.length) return null;

  return (
    <>
      {items.map((item) => (
        <RepoNavItem
          active={
            pathname === item.href || pathname.startsWith(`${item.href}/`)
          }
          href={item.href}
          icon={item.icon}
          key={item.key}
          onClick={onClick}
        >
          {item.label}
        </RepoNavItem>
      ))}
    </>
  );
};

export { RepoNav };
