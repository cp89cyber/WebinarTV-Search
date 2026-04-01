import { useQuery } from "@tanstack/react-query";

import { fetchWebinarDetail } from "../lib/api/client";

export function useWebinarDetail(id: string) {
  return useQuery({
    queryKey: ["webinar", id],
    queryFn: ({ signal }) => fetchWebinarDetail(id, signal),
    enabled: id.length > 0
  });
}
