import { useQuery } from "@tanstack/react-query";

import { fetchMeta } from "../lib/api/client";

export function useMeta() {
  return useQuery({
    queryKey: ["meta"],
    queryFn: ({ signal }) => fetchMeta(signal)
  });
}
