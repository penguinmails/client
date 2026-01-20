// Mock data for inbox conversations
export interface Conversation {
  id: string;
  subject: string;
  from: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  emails: Array<{
    id: string;
    from: string;
    body: string;
    timestamp: Date;
    isRead: boolean;
  }>;
}

export const conversations: Conversation[] = [
  {
    id: '1',
    subject: 'Re: Partnership Opportunity',
    from: 'john.doe@company.com',
    lastMessage: 'Thank you for reaching out. I would love to discuss this opportunity further.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    unreadCount: 1,
    emails: [
      {
        id: 'email1',
        from: 'john.doe@company.com',
        body: 'Thank you for reaching out. I would love to discuss this opportunity further.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isRead: false
      }
    ]
  },
  {
    id: '2',
    subject: 'Follow-up Meeting Request',
    from: 'sarah.smith@tech.com',
    lastMessage: 'Hi, I saw your message and would be interested in scheduling a call.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    unreadCount: 0,
    emails: [
      {
        id: 'email2',
        from: 'sarah.smith@tech.com',
        body: 'Hi, I saw your message and would be interested in scheduling a call.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        isRead: true
      }
    ]
  }
];