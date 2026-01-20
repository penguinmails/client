import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "./empty-state";
import { AlertTriangle } from "lucide-react";

interface UnifiedDataListProps<T> {
  /**
   * Array of data items to display
   */
  data: T[];

  /**
   * Custom rendering function for each list item
   */
  renderItem: (item: T, index: number) => React.ReactNode;

  /**
   * Function to extract unique keys for each item
   */
  keyExtractor: (item: T, index: number) => string;

  /**
   * Optional title for the list
   */
  title?: string;

  /**
   * Enable search functionality
   */
  searchable?: boolean;

  /**
   * Keys to search through when searchable is enabled
   */
  searchKeys?: string[];

  /**
   * Enable pagination
   */
  paginated?: boolean;

  /**
   * Number of items per page
   */
  itemsPerPage?: number;

  /**
   * Loading state
   */
  loading?: boolean;

  /**
   * Message to show when list is empty
   */
  emptyMessage?: string;

  /**
   * Custom search function
   */
  onSearch?: (term: string) => void;

  /**
   * Click handler for list items
   */
  onItemClick?: (item: T, index: number) => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export function UnifiedDataList<T>({
  data,
  renderItem,
  keyExtractor,
  title,
  searchable = false,
  searchKeys = [],
  paginated = false,
  itemsPerPage = 10,
  loading = false,
  emptyMessage = "No items found.",
  onSearch,
  onItemClick,
  className,
}: UnifiedDataListProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm || !searchable) return data;

    return data.filter((item, _index) => {
      if (onSearch) {
        onSearch(searchTerm);
        return true; // Let the parent handle filtering
      }

      // Simple string matching on search keys
      return searchKeys.some((key) => {
        const value = (item as Record<string, unknown>)[key];
        return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm, searchable, searchKeys, onSearch]);

  // Paginate filtered data
  const paginatedData = useMemo(() => {
    if (!paginated) return filteredData;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, paginated, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleItemClick = (item: T, index: number) => {
    if (onItemClick) {
      onItemClick(item, index);
    }
  };

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        {title && (
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
        )}
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          {searchable && (
            <div className="w-64">
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full"
              />
            </div>
          )}
        </div>
      )}

      {/* Search Bar (when no title but searchable) */}
      {searchable && !title && (
        <div className="w-64">
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full"
          />
        </div>
      )}

      {/* Content */}
      {filteredData.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No items found"
          description={emptyMessage}
        />
      ) : (
        <>
          {/* List Items */}
          <div className="space-y-2">
            {paginatedData.map((item, index) => (
              <div
                key={keyExtractor(item, index)}
                onClick={() => handleItemClick(item, index)}
                className={cn(
                  "cursor-pointer transition-colors",
                  onItemClick && "hover:bg-accent rounded-lg"
                )}
              >
                {renderItem(item, index)}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {paginated && totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredData.length)} of{" "}
                {filteredData.length} results
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}