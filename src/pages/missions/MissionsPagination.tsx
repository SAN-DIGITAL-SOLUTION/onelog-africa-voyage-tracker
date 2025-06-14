
import React from "react";

type MissionsPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

function getPages(current: number, total: number) {
  // Affiche toutes les pages si <=7, sinon fenêtre autour de la page courante
  if (total <= 7) return [...Array(total)].map((_, i) => i + 1);
  const res = [];
  if (current <= 4) {
    for (let i = 1; i <= 5; i++) res.push(i);
    res.push("...", total);
  } else if (current >= total - 3) {
    res.push(1, "...");
    for (let i = total - 4; i <= total; i++) res.push(i);
  } else {
    res.push(1, "...");
    for (let i = current - 1; i <= current + 1; i++) res.push(i);
    res.push("...", total);
  }
  return res;
}

export default function MissionsPagination({
  currentPage,
  totalPages,
  onPageChange,
}: MissionsPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPages(currentPage, totalPages);

  return (
    <nav
      className="w-full flex justify-center my-6"
      aria-label="Pagination"
    >
      <ul className="flex flex-wrap items-center gap-1 sm:gap-2">
        <li>
          <button
            className={`sm:min-w-[36px] h-9 px-2 sm:px-3 rounded-lg text-base sm:text-sm disabled:opacity-50 disabled:pointer-events-none
              bg-white border border-gray-200 hover:bg-gray-200
              flex items-center justify-center transition-colors`}
            aria-label="Page précédente"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            &lt;
          </button>
        </li>
        {pages.map((p, idx) =>
          typeof p === "number" ? (
            <li key={p}>
              <button
                className={`
                  sm:min-w-[36px] h-9 px-2 sm:px-3 rounded-lg text-base sm:text-sm
                  ${currentPage === p
                    ? "bg-[#346fb3] text-white font-bold"
                    : "bg-white border border-gray-200 hover:bg-gray-200"}
                  flex items-center justify-center transition-colors
                `}
                aria-current={currentPage === p ? "page" : undefined}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            </li>
          ) : (
            <li key={`ellipsis-${idx}`}>
              <span className="mx-1 text-gray-400 select-none font-mono">…</span>
            </li>
          )
        )}
        <li>
          <button
            className={`sm:min-w-[36px] h-9 px-2 sm:px-3 rounded-lg text-base sm:text-sm disabled:opacity-50 disabled:pointer-events-none
              bg-white border border-gray-200 hover:bg-gray-200
              flex items-center justify-center transition-colors`}
            aria-label="Page suivante"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            &gt;
          </button>
        </li>
      </ul>
    </nav>
  );
}

