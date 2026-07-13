"use client";

import { createContext, useContext } from "react";
import type { SingleProject } from "@/lib/single-project";

type SingleProjectValue = {
  enabled: boolean;
  project: SingleProject | null;
};

const SingleProjectReactContext = createContext<SingleProjectValue>({
  enabled: false,
  project: null,
});

export const useSingleProject = () => useContext(SingleProjectReactContext);

export const SingleProjectProvider = ({
  enabled,
  project,
  children,
}: {
  enabled: boolean;
  project: SingleProject | null;
  children: React.ReactNode;
}) => {
  return (
    <SingleProjectReactContext.Provider value={{ enabled, project }}>
      {children}
    </SingleProjectReactContext.Provider>
  );
};
