"use client";

import { useEffect } from "react";
import { useConversation } from "@features/inbox/ui/context/conversation-context";
import { getConversationById } from "@features/inbox/actions";
import { notFound } from "next/navigation";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import ConversationHeader from "@features/inbox/ui/components/conversation/conversation-header";
import ConversationMessages from "@features/inbox/ui/components/conversation/conversation-messages";
import ConversationReplay from "@features/inbox/ui/components/conversation/conversation-replay";
import NotesPanel from "@features/inbox/ui/components/conversation/notes-panel";

function ClientConversationWrapper({ params }: { params: Promise<{ id: string }> }) {
  const { setCurrentConversation } = useConversation();

  useEffect(() => {
    const loadConversation = async () => {
      const { id } = await params;
      if (!id) {
        return notFound();
      }
      
      const result = await getConversationById(id);
      if (result.success && result.data) {
        setCurrentConversation(result.data);
      }
    };
    loadConversation();
  }, [params, setCurrentConversation]);
  
  return (
    <Card className="shadow-none border-0 rounded-none gap-0 p-0">
      <CardHeader className="p-0">
        <ConversationHeader />
        <NotesPanel />
      </CardHeader>
      <CardContent className="p-0">
        <ConversationMessages />
      </CardContent>
      <CardFooter className="p-0">
        <ConversationReplay />
      </CardFooter>
    </Card>
  );
}

export default ClientConversationWrapper;
