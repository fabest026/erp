import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, ChevronUp } from "lucide-react";

interface DataTableColumn<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (row: T) => React.ReactNode;
  enableSorting?: boolean;
  sortingFn?: (a: T, b: T) => number;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  searchable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  loading?: boolean;
  emptyState?: React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  searchable = true,
  pagination = true,
  pageSize = 10,
  loading = false,
  emptyState,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });

  // Handle search
  const filteredData = searchTerm
    ? data.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : data;

  // Handle sorting
  const sortedData = sortConfig.key
    ? [...filteredData].sort((a, b) => {
        const column = columns.find((col) => col.accessorKey === sortConfig.key);
        
        if (column?.sortingFn) {
          return sortConfig.direction === "asc" 
            ? column.sortingFn(a, b) 
            : column.sortingFn(b, a);
        }
        
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue === bValue) return 0;
        
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        if (aValue === null || aValue === undefined) return sortConfig.direction === "asc" ? -1 : 1;
        if (bValue === null || bValue === undefined) return sortConfig.direction === "asc" ? 1 : -1;
        
        return sortConfig.direction === "asc"
          ? (aValue as any) > (bValue as any) ? 1 : -1
          : (bValue as any) > (aValue as any) ? 1 : -1;
      })
    : filteredData;

  // Handle pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = pagination
    ? sortedData.slice((page - 1) * pageSize, page * pageSize)
    : sortedData;

  const handleSort = (key: keyof T) => {
    setSortConfig((current) => {
      if (current.key === key) {
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Generate page links
  const pageLinks = [];
  const maxPageDisplay = 5;
  
  let startPage = Math.max(1, page - Math.floor(maxPageDisplay / 2));
  let endPage = Math.min(totalPages, startPage + maxPageDisplay - 1);
  
  if (endPage - startPage + 1 < maxPageDisplay) {
    startPage = Math.max(1, endPage - maxPageDisplay + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pageLinks.push(
      <PaginationItem key={i}>
        <PaginationLink
          onClick={() => handlePageChange(i)}
          isActive={page === i}
        >
          {i}
        </PaginationLink>
      </PaginationItem>
    );
  }

  // Show empty state if no data
  if (!loading && data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={String(column.accessorKey)}>
                  {column.enableSorting ? (
                    <div
                      className="flex items-center gap-1 cursor-pointer"
                      onClick={() => handleSort(column.accessorKey)}
                    >
                      {column.header}
                      {sortConfig.key === column.accessorKey && (
                        sortConfig.direction === "asc" ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading rows
              Array.from({ length: pageSize }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((column, columnIndex) => (
                    <TableCell key={columnIndex}>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column) => (
                    <TableCell key={String(column.accessorKey)}>
                      {column.cell
                        ? column.cell(row)
                        : row[column.accessorKey] as React.ReactNode}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && totalPages > 1 && (
        <Pagination className="justify-center">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page === 1}
              />
            </PaginationItem>
            
            {pageLinks}
            
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      
      {pagination && filteredData.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredData.length)} of {filteredData.length} entries
        </div>
      )}
    </div>
  );
}
