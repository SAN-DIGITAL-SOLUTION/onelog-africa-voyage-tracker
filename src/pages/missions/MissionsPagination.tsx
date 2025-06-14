
import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";

type MissionsPaginationProps = {
  page: number;
  setPage: (p: number) => void;
  pageCount: number;
};

export default function MissionsPagination({
  page,
  setPage,
  pageCount,
}: MissionsPaginationProps) {
  if (pageCount <= 1) return null;
  return (
    <Pagination className="mt-6">
      <PaginationContent>
        <PaginationItem>
          {page === 1 ? (
            <span
              className="opacity-50 select-none pointer-events-none gap-1 pl-2.5 inline-flex items-center"
              aria-disabled="true"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </span>
          ) : (
            <PaginationPrevious onClick={() => setPage(page - 1)} />
          )}
        </PaginationItem>
        {[...Array(pageCount)].map((_, i) => (
          <PaginationItem key={i + 1}>
            <PaginationLink isActive={i + 1 === page} onClick={() => setPage(i + 1)}>
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          {page === pageCount ? (
            <span
              className="opacity-50 select-none pointer-events-none gap-1 pr-2.5 inline-flex items-center"
              aria-disabled="true"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </span>
          ) : (
            <PaginationNext onClick={() => setPage(page + 1)} />
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
