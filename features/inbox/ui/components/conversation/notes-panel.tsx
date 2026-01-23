"use client";
import { Button } from "@/components/ui/button/button";
import { Textarea } from "@/components/ui/textarea";
import { useConversation } from "@features/inbox/ui/context/conversation-context";
import { X } from "lucide-react";
import { useState } from "react";

function NotesPanel() {
  const { showNotes, setShowNotes, selectedConversation } = useConversation();
  const [notes, setNotes] = useState(selectedConversation?.notes || "");
  if (!showNotes || !selectedConversation) return null;
  function handleClose() {
    setShowNotes(false);
  }

  return (
    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border-b border-border">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-foreground">Internal Notes</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add internal notes about this conversation..."
        className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent resize-none bg-background dark:bg-card"
        rows={3}
      />
      <div className="flex justify-end mt-2">
        <Button
          className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          onClick={handleClose}
        >
          Save Notes
        </Button>
      </div>
    </div>
  );
}
export default NotesPanel;
