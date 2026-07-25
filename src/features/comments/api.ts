import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/query-keys';
import type { PaginatedCommentsResponse } from './types';

export function useAdminComments(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.comments.list(filters),
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedCommentsResponse>(
        ENDPOINTS.comments.list,
        { params: filters },
      );
      return data;
    },
  });
}

export function useSetCommentHidden() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      hidden,
    }: {
      commentId: string;
      hidden: boolean;
    }) => {
      const { data } = await apiClient.patch(
        ENDPOINTS.comments.hide(commentId),
        { hidden },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.all });
    },
  });
}
