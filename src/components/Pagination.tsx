interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getVisiblePages(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);

  if (currentPage <= 3) {
    pages.add(2);
    pages.add(3);
  }

  if (currentPage >= totalPages - 2) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
  }

  const sorted = [...pages].filter((page) => page > 0 && page <= totalPages).sort((left, right) => left - right);
  const result: Array<number | "ellipsis"> = [];

  for (const page of sorted) {
    const previous = result.at(-1);
    if (typeof previous === "number" && page - previous > 1) {
      result.push("ellipsis");
    }

    result.push(page);
  }

  return result;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="pagination" aria-label="Pagination">
      <button type="button" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>
        Previous
      </button>
      <ol>
        {getVisiblePages(currentPage, totalPages).map((item, index) => (
          <li key={`${item}-${index}`}>
            {item === "ellipsis" ? (
              <span className="pagination__ellipsis" aria-hidden="true">
                …
              </span>
            ) : (
              <button
                type="button"
                className={item === currentPage ? "is-active" : ""}
                aria-current={item === currentPage ? "page" : undefined}
                onClick={() => onPageChange(item)}
              >
                {item}
              </button>
            )}
          </li>
        ))}
      </ol>
      <button type="button" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
        Next
      </button>
    </nav>
  );
}
