import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PAGINATION } from '../../constants/strings';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className = '' }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (currentPage <= 3) {
      for (let i = 1; i <= maxVisible; i++) {
        pages.push(i);
      }
    } else if (currentPage >= totalPages - 2) {
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      for (let i = currentPage - 2; i <= currentPage + 2; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-300 hover:bg-gray-700/50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="hidden sm:inline">{PAGINATION.PREVIOUS}</span>
      </button>

      <div className="flex items-center gap-2">
        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-lg transition-all ${
              currentPage === page
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-gray-800/50 border border-gray-700/50 text-gray-300 hover:bg-gray-700/50'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-300 hover:bg-gray-700/50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
      >
        <span className="hidden sm:inline">{PAGINATION.NEXT}</span>
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
