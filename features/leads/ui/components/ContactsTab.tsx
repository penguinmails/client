"use client";
import { getClients, type Client } from "@/features/leads/actions/clients";
import {
  ArrowUpDown,
  Download,
  Edit,
  Eye,
  Send,
  Star,
  Tag,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  DropDownFilter,
  Filter,
  SearchInput,
} from "@/components/ui/custom/Filter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { productionLogger } from "@/lib/logger";
import LeadTableSkeleton from "./tables/LeadTableSkeleton";

// Map Client to a display-friendly contact type
interface DisplayContact {
  id: string;
  name: string;
  email: string;
  company?: string;
  points: number;
  tags: string[];
  lastActive: string | null;
  dateAdded: Date;
}

/**
 * Format a date to relative time (e.g., "2 days ago")
 */
function formatRelativeTime(dateString?: string | null): string {
  if (!dateString) return "Never";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  } catch {
    return "Never";
  }
}

/**
 * Format a date string to a readable format
 */
function formatDate(date?: Date | string): string {
  if (!date) return "—";
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function ContactsTab({ listId }: { listId?: string }) {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<DisplayContact[]>([]);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadContacts = async () => {
      const result = await getClients({ listId });
      if (isMounted) {
        if (result.success && result.data) {
          // Map Client to DisplayContact
          const contacts: DisplayContact[] = result.data.map((client: Client) => ({
            id: client.id,
            name: client.name,
            email: client.email,
            company: client.company,
            points: client.points || 0,
            tags: client.tags || [],
            lastActive: client.lastActive || null,
            dateAdded: new Date(client.createdAt),
          }));
          setFilteredContacts(contacts);
        }
      }
    };

    loadContacts().catch((error) => {
      if (isMounted) {
        productionLogger.error("Failed to load contacts:", error);
      }
    }).finally(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [listId]);

  const handleSort = (field: string) => {
    let newSortDirection: "asc" | "desc" = "asc";

    if (sortField === field) {
      newSortDirection = sortDirection === "asc" ? "desc" : "asc";
    }

    setSortField(field);
    setSortDirection(newSortDirection);

    const sortedContacts = [...filteredContacts].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (field === "name") {
        aValue = a.name?.toLowerCase() || "";
        bValue = b.name?.toLowerCase() || "";
      } else if (field === "points") {
        aValue = a.points || 0;
        bValue = b.points || 0;
      } else if (field === "dateAdded") {
        aValue = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
        bValue = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
      } else if (field === "lastActive") {
        aValue = a.lastActive ? new Date(a.lastActive).getTime() : 0;
        bValue = b.lastActive ? new Date(b.lastActive).getTime() : 0;
      } else {
        return 0;
      }

      if (aValue < bValue) {
        return newSortDirection === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return newSortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });

    setFilteredContacts(sortedContacts);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContacts(filteredContacts.map((c: DisplayContact) => String(c.id)));
    } else {
      setSelectedContacts([]);
    }
  };

  const handleSelectContact = (contactId: string, checked: boolean) => {
    const stringId = String(contactId);
    if (checked) {
      setSelectedContacts([...selectedContacts, stringId]);
    } else {
      setSelectedContacts(selectedContacts.filter((id) => id !== stringId));
    }
  };

  const isSelect = selectedContacts.length;

  const isAllSelected =
    selectedContacts.length === filteredContacts.length &&
    filteredContacts.length > 0;

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <Filter className="border-none shadow-none p-0">
          <SearchInput />
          <div className="flex items-center space-x-2">
            <DropDownFilter
              options={[
                { value: "all", label: "All" },
                { value: "with-points", label: "Has Points" },
                { value: "recently-active", label: "Recently Active" },
              ]}
              placeholder="Filter"
            />
            {isSelect > 0 && (
              <div className="flex items-center space-x-2">
                <div>
                  <span>{selectedContacts.length} selected</span>
                </div>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Bulk Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assign-tag">
                      <Tag className="w-4 h-4" />
                      <span>Assign Tag</span>
                    </SelectItem>
                    <SelectItem value="add-to-campaign">
                      <Send className="w-4 h-4" />
                      <span>Add to Campaign</span>
                    </SelectItem>
                    <SelectItem value="export-selected">
                      <Download className="w-4 h-4" />
                      <span>Export Selected</span>
                    </SelectItem>
                    <SelectItem value="delete" className="text-destructive ">
                      <Trash2 className="w-4 h-4 text-inherit" />
                      <span>Delete</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </Filter>
      </CardHeader>

      <CardContent className="border p-0 rounded-xl overflow-hidden">
        <div className="overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-100 dark:bg-muted">
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("name")}
                    className="h-auto p-0 font-semibold"
                  >
                    Contact
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>Company</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("points")}
                    className="h-auto p-0 font-semibold"
                  >
                    Points
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("lastActive")}
                    className="h-auto p-0 font-semibold"
                  >
                    Last Active
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("dateAdded")}
                    className="h-auto p-0 font-semibold"
                  >
                    Added
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <LeadTableSkeleton columns={8} />
              ) : filteredContacts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No contacts found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredContacts.map((contact) => (
                  <TableRow key={contact.id} className="group">
                    <TableCell>
                      <Checkbox
                        checked={selectedContacts.includes(String(contact.id))}
                        onCheckedChange={(checked) =>
                          handleSelectContact(contact.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    {/* Contact - Name & Email */}
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white">
                            {contact.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{contact.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {contact.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Company */}
                    <TableCell>
                      <span className="text-sm text-foreground">
                        {contact.company || "—"}
                      </span>
                    </TableCell>

                    {/* Points */}
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm font-medium">
                                {contact.points}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Mautic engagement score</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>

                    {/* Tags */}
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {contact.tags.length > 0 ? (
                          contact.tags.slice(0, 2).map((tag, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                        {contact.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{contact.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* Last Active */}
                    <TableCell className="text-sm text-muted-foreground">
                      {formatRelativeTime(contact.lastActive)}
                    </TableCell>

                    {/* Added Date */}
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(contact.dateAdded)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Link href={`/dashboard/leads/contacts/${contact.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="View Contact"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Edit Contact"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default ContactsTab;
