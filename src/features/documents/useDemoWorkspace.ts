import { useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function useDemoWorkspace() {
  const workspace = useQuery(api.projects.getWorkspace);
  const ensureDemo = useMutation(api.projects.ensureDemo);

  useEffect(() => {
    void ensureDemo();
  }, [ensureDemo]);

  return workspace;
}
