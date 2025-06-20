
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface SubscriptionPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const SubscriptionPagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: SubscriptionPaginationProps) => {
  if (totalPages <= 1) return null;

  const handlePageChange = (e: React.MouseEvent, page: number) => {
    e.preventDefault();
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };
  
  const pageNumbers = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    const start = Math.max(1, currentPage - 2);
    return start + i;
  }).filter(num => num <= totalPages);

  return (
    <Pagination className="mt-6">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            href="#"
            onClick={handlePrevious} 
            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
        {pageNumbers.map(number => (
             <PaginationItem key={number}>
               <PaginationLink 
                  href="#"
                  isActive={currentPage === number}
                  onClick={(e) => handlePageChange(e, number)}
               >
                 {number}
               </PaginationLink>
             </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext 
            href="#"
            onClick={handleNext} 
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
