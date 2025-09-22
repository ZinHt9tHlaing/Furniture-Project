import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function PaginationBottom() {
  return (
    <Pagination className="mb-8">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            className="duration-200 active:scale-90"
          />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" className="duration-200 active:scale-90" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
