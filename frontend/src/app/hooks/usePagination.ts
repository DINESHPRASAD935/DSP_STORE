import { useState, useCallback } from 'react';

interface UsePaginationProps {
  totalCount: number;
  pageSize: number;
  initialPage?: number;
}

export function usePagination({ totalCount, pageSize, initialPage = 1 }: UsePaginationProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = pageSize > 0 ? Math.ceil(totalCount / pageSize) : 0;

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [totalPages]);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, totalPages, goToPage]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  const reset = useCallback(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  return {
    currentPage,
    totalPages,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    reset,
    setCurrentPage,
  };
}
