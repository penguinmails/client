"use client";
import { getMockLeads, type MockLead as Lead } from "@/shared/mocks/providers";
import {
  ArrowUpDown,
  Download,
  Edit,
  Eye,
  Send,
  Tag,
  Trash2,
} from "lucide-react";
import { useState } from "react";
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

const getStatusColor = (status: string | undefined) => {
  const statusLower = (status || "new").toLowerCase();
  const colors: Record<string, string> = {
    replied: "bg-green-100 text-green-800 border-green-200",
    sent: "bg-blue-100 text-blue-800 border-blue-200",
    bounced: "bg-red-100 text-red-800 border-red-200",
    new: "bg-yellow-100 text-yellow-800 border-yellow-200",
    contacted: "bg-blue-100 text-blue-800 border-blue-200",
    qualified: "bg-green-100 text-green-800 border-green-200",
    converted: "bg-purple-100 text-purple-800 border-purple-200",
  };
  return colors[statusLower] || colors.new;
};

function ContactsTab() {
  const sampleLeads = getMockLeads();

  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [filteredContacts, setFilteredContacts] = useState([...sampleLeads]);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

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
      } else if (field === "lastContact") {
        aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
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
      setSelectedContacts(filteredContacts.map((c: Lead) => String(c.id)));
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
                { value: "bounced", label: "Bounced" },
                { value: "replied", label: "Replied" },
                { value: "sent", label: "Sent" },
                { value: "not-used", label: "Not Used" },
              ]}
              placeholder="Status"
            />
            <DropDownFilter
              options={[
                { value: "Q1 SaaS Outreach", label: "Q1 SaaS Outreach" },
                {
                  value: "Enterprise Prospects",
                  label: "Enterprise Prospects",
                },
                { value: "SMB Follow-up", label: "SMB Follow-up" },
              ]}
              placeholder="Campaigns"
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
                <TableHead>Status</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>List</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("lastContact")}
                    className="h-auto p-0 font-semibold"
                  >
                    Last Contact
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact.id} className="group">
                  <TableCell>
                    <Checkbox
                      checked={selectedContacts.includes(String(contact.id))}
                      onCheckedChange={(checked) =>
                        handleSelectContact(contact.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white">
                          {contact.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
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

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusColor(contact.status)}
                    >
                      {contact.status
                        .replace("-", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <Badge
                        key="default"
                        variant="secondary"
                        className="text-xs"
                      >
                        {contact.source}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {contact.company || "No company"}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {contact.createdAt
                      ? new Date(contact.createdAt).toLocaleDateString()
                      : "Not Used Yet"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="View Contact"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
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
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default ContactsTab;
