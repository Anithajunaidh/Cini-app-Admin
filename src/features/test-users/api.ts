import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/query/query-keys";
import type { TestUser } from "./types";

export function useTestUsers() {
  return useQuery({
    queryKey: queryKeys.testUsers.list(),
    queryFn: async () => {
      const { data } = await apiClient.get<TestUser[]>(ENDPOINTS.testUsers.list);
      return data;
    },
  });
}
