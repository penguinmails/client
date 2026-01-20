"use client";
import { Button } from "@/components/ui/button/button";
import { useConversation } from "@features/inbox/ui/context/conversation-context";
import { StickyNote } from "lucide-react";

function ShowNotesButton() {
  const { showNotes, setShowNotes } = useConversation();
  return (
    <Button
      variant={showNotes ? "secondary" : "ghost"}
      size="icon"
      onClick={() => setShowNotes(!showNotes)}
    >
      <StickyNote className="w-5 h-5" />
    </Button>
  );
}
export default ShowNotesButton;
