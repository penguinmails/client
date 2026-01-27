"use client";
import { Filter } from "@/components/ui/custom/Filter";
import { DropDownFilter, SearchInput } from "@/components/ui/custom/Filter";
import { Button } from "@/components/ui/button/button";
import { productionLogger } from "@/lib/logger";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchLeadLists } from "@features/leads/actions/lists";
import { LeadListData } from "@/types/clients-leads";
import { ArrowUpDown } from "lucide-react";
import { useState, useEffect } from "react";
import ListTableRow from "./ListTableRow";
import { cn } from "@/lib/utils";
import LeadTableSkeleton from "./tables/LeadTableSkeleton";
const listTableColumn = [
  { id: "name", label: "Segment Name", canSort: true },
  { id: "contacts", label: "Contacts", canSort: true },
  { id: "description", label: "Description" },
  { id: "status", label: "Status" },
  { id: "dateAdded", label: "Created", canSort: true },
  { id: "dateModified", label: "Modified", canSort: true },
  { id: "actions", label: "Actions" },
];

function ListsTab() {
  const [filteredLists, setFilteredLists] = useState<LeadListData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortById, setSortById] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadLists = async () => {
      const result = await fetchLeadLists();
      if (isMounted) {
        if (Array.isArray(result)) {
          setFilteredLists(result as unknown as LeadListData[]);
        } else if (result && result.success && result.data) {
          setFilteredLists(result.data as unknown as LeadListData[]);
        } else {
          setFilteredLists([]);
        }
        setIsLoading(false);
      }
    };

    loadLists().catch((error: unknown) => {
      if (isMounted) {
        productionLogger.error("Failed to load leads lists:", error);
        setFilteredLists([]);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  function handleSortBy(columnId: string) {
    if (sortById === columnId) {
      setFilteredLists([...filteredLists].reverse());
      return;
    }
    const sortedLists = [...filteredLists].sort((a, b) => {
      const aValue = a[columnId as keyof typeof a];
      const bValue = b[columnId as keyof typeof b];
      if (aValue == null || bValue == null) return 0;
      if (aValue < bValue) return -1;
      if (aValue > bValue) return 1;
      return 0;
    });
    setFilteredLists(sortedLists);
    setSortById(columnId);
  }

  return (
    <div className="space-y-6">
      <Filter>
        <SearchInput />
        <div className="flex items-center space-x-4">
          <DropDownFilter
            options={[
              { value: "all", label: "All Lists" },
              { value: "used", label: "Being Used" },
              { value: "not-used", label: "Not Used Yet" },
            ]}
            placeholder="Filter by Status"
          />
          <DropDownFilter
            options={[
              { value: "all", label: "All Campaigns" },
              { value: "q1-saas", label: "Q1 SaaS Outreach" },
              { value: "enterprise", label: "Enterprise Outreach" },
              { value: "smb", label: "SMB Follow-up" },
            ]}
            placeholder="Filter by Campaign"
          />
        </div>
      </Filter>
      <div className="bg-card dark:bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {listTableColumn.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn({
                    "cursor-pointer": column.canSort,
                  })}
                >
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 h-auto p-0 hover:bg-transparent"
                    onClick={
                      column.canSort ? () => handleSortBy(column.id) : undefined
                    }
                  >
                    {column.label}
                    {column.canSort && <ArrowUpDown className="w-4 h-4 " />}
                  </Button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <LeadTableSkeleton columns={listTableColumn.length} />
            ) : filteredLists.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={listTableColumn.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No lists found.
                </TableCell>
              </TableRow>
            ) : (
              filteredLists.map((list) => (
                <ListTableRow key={list.id} list={list} />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
export default ListsTab;
