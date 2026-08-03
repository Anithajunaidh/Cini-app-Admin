type PaginationProps = {
  page: number;
  totalPages: number;
  limit?: number;
  onPageChange: (newPage: number) => void;
}

export function Pagination({ page, totalPages, limit, onPageChange }: PaginationProps) {
  return (
    <div className="panel-foot">
      <span className="pager">
        Page {page} of {totalPages || 1}
        {limit !== undefined ? ` · limit ${limit}` : null}
      </span>
      <span className="pager">
        <button
          suppressHydrationWarning
          onClick={function () {
            onPageChange(page - 1);
          }}
          disabled={page <= 1}
          type="button"
        >
          ‹
        </button>
        <button
          suppressHydrationWarning
          onClick={function () {
            onPageChange(page + 1);
          }}
          disabled={page >= totalPages}
          type="button"
        >
          ›
        </button>
      </span>
    </div>
  );
}
