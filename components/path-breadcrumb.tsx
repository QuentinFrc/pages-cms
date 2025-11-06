"use client";

import { Home } from "lucide-react";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getRelativePath,
  joinPathSegments,
  normalizePath,
} from "@/lib/utils/file";

const PathBreadcrumb = ({
  path = "",
  rootPath,
  className,
  handleNavigate,
}: {
  path?: string;
  rootPath: string;
  className?: string;
  handleNavigate: (newPath: string) => void;
}) => {
  const normalizedPath = normalizePath(path);
  const normalizedRelativePath = getRelativePath(normalizedPath, rootPath);
  const pathArray = normalizedRelativePath
    ? normalizedRelativePath.split("/")
    : [];

  const breadcrumbDropdown: { name: string; path: string }[] = [];
  const breadcrumbPath: { name: string; path: string }[] = [];

  if (pathArray && pathArray.length > 0) {
    pathArray.forEach((segment, index) => {
      const entry = {
        name: segment,
        path: pathArray.slice(0, index + 1).join("/"),
      };

      if (pathArray.length > 2 && index < pathArray.length - 2) {
        breadcrumbDropdown.push(entry);
      } else {
        breadcrumbPath.push(entry);
      }
    });
  }

  return pathArray.length > 0 ? (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            className="cursor-pointer"
            onClick={() => handleNavigate(rootPath)}
          >
            <Home className="h-3.5 w-3.5" />
          </BreadcrumbLink>
        </BreadcrumbItem>
        {breadcrumbDropdown.length > 0 && (
          <>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1">
                  <BreadcrumbEllipsis className="h-4 w-4" />
                  <span className="sr-only">Toggle menu</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {breadcrumbDropdown.map((item) => (
                    <DropdownMenuItem
                      className="cursor-pointer"
                      key={item.path}
                      onClick={() =>
                        handleNavigate(joinPathSegments([rootPath, item.path]))
                      }
                    >
                      {item.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
          </>
        )}
        {breadcrumbPath.slice(0, breadcrumbPath.length - 1).map((item) => (
          <Fragment key={item.path}>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink
                className="cursor-pointer"
                onClick={() =>
                  handleNavigate(joinPathSegments([rootPath, item.path]))
                }
              >
                {item.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Fragment>
        ))}
        <BreadcrumbSeparator>/</BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage>
            {breadcrumbPath[breadcrumbPath.length - 1].name}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ) : null;
};

export { PathBreadcrumb };
