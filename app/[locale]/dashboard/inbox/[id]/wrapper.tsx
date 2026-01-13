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
        const conversation = result.data;
        // Transform mock conversation to match expected interface
        const transformedConversation = {
          ...conversation,
          id: parseInt(conversation.id.toString(), 10),
          name: conversation.name || conversation.subject || 'Unknown',
          email: conversation.email,
          company: conversation.company || 'Unknown Company',
          title: conversation.title || 'Email Conversation',
          preview: conversation.preview || conversation.subject || 'No preview available',
          time: conversation.time || new Date().toISOString(),
          status: (conversation.status as 'read' | 'unread' | 'archived' | 'muted' | 'important') || 'read',
          campaign: conversation.campaign || 'General Campaign',
          tag: (conversation.tag as 'interested' | 'not-interested' | 'maybe-later' | 'hot-lead' | 'follow-up' | 'replied') || 'follow-up',
          isPinned: conversation.isPinned || false,
          isStarred: conversation.isStarred || false,
          avatar: conversation.avatar || 'UN',
          lastMessage: (conversation.lastMessage as 'outgoing' | 'incoming') || 'incoming',
          notes: conversation.notes || '',
          followUpDate: conversation.followUpDate || new Date().toISOString(),
          messages: conversation.messages?.map(msg => ({
            ...msg,
            id: parseInt(msg.id.toString(), 10),
            type: msg.type === 'system' ? 'incoming' : msg.type
          })).filter(msg => msg.type === 'outgoing' || msg.type === 'incoming')
        };
        setCurrentConversation(transformedConversation);
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
