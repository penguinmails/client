"use client";

import { useState, useEffect } from "react";
import { getMessages } from "@features/inbox/actions";
import { type Message } from "@features/inbox/types";
import { getRelativeTime } from "@/shared/utils/date";
import { cn } from "@/shared/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useConversation } from "@features/inbox/ui/context/conversation-context";
import { developmentLogger } from "@/lib/logger";

export default function ConversationMessages() {
  const { currentConversation } = useConversation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const conversationId = currentConversation?.id;

  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await getMessages(conversationId.toString());
        const messageData = result.success ? result.data || [] : [];
        setMessages(messageData);
      } catch (error) {
        developmentLogger.error("Error fetching messages:", error);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId]);

  if (loading) {
    return (
      <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-muted/30 flex items-center justify-center">
        <p className="text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  if (!currentConversation) {
    return (
      <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-muted/30 flex items-center justify-center">
        <p className="text-muted-foreground">No conversation selected</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-muted/30">
      {messages.map((message: Message) => (
        <div
          key={message.id}
          className={cn(
            "flex",
            message.type === "outgoing" ? "justify-end" : "justify-start"
          )}
        >
          <div
            className={cn(
              "flex items-start space-x-3 max-w-2xl",
              message.type === "outgoing" && "flex-row-reverse space-x-reverse"
            )}
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {message.sender?.charAt(0).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium">{message.sender}</span>
                <Badge variant="secondary" className="text-xs">
                  {getRelativeTime(message.time)}
                </Badge>
              </div>

              <Card
                className={cn(
                  "p-4",
                  message.type === "outgoing"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card"
                )}
              >
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </div>
              </Card>
            </div>
          </div>
        </div>
      ))}
      
      {messages.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">No messages in this conversation</p>
        </div>
      )}
    </div>
  );
}
