"use client";

import { createContext, useContext } from "react";
import type { ProjectContext } from "@/lib/single-project";

type SingleProjectValue = {
  project: ProjectContext | null;
  homeHref: string;
};

const SingleProjectReactContext = createContext<SingleProjectValue>({
  project: null,
  homeHref: "/",
});

export const useSingleProject = () => {
  const value = useContext(SingleProjectReactContext);
  return {
    ...value,
    enabled: value.project !== null,
  };
};

export const SingleProjectProvider = ({
  project,
  homeHref,
  children,
}: {
  project: ProjectContext | null;
  homeHref: string;
  children: React.ReactNode;
}) => {
  return (
    <SingleProjectReactContext.Provider value={{ project, homeHref }}>
      {children}
    </SingleProjectReactContext.Provider>
  );
};
