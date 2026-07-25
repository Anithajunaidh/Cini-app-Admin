export interface AdminComment {
  id: string;
  text: string;
  hidden: boolean;
  reported: boolean;
  userId: string;
  titleId: string;
  titleName?: string;
  createdAt: string;
  reportedAt?: string;
}

export interface PaginatedCommentsResponse {
  data: AdminComment[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}
