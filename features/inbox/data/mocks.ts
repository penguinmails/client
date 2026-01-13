import { Conversation, Message } from "../types";

export const mockConversations: Conversation[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Interested in product',
    preview: 'Hi, I saw your product and I am interested...',
    time: new Date().toISOString(),
    status: 'unread',
    unreadCount: 1,
    lastMessage: 'incoming',
    tag: 'interested',
    campaign: 'Q1 Outreach',
    company: 'TechCorp',
    title: 'CTO',
    isPinned: false,
    isStarred: true,
    avatar: 'JD',
    notes: 'Very interested in enterprise solution',
    followUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    subject: 'Follow up needed',
    preview: 'Thanks for your email, I need some more information...',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'read',
    unreadCount: 0,
    lastMessage: 'incoming',
    tag: 'follow-up',
    campaign: 'Product Launch',
    company: 'StartupXYZ',
    title: 'Product Manager',
    isPinned: true,
    isStarred: false,
    avatar: 'JS',
    notes: 'Follow up about demo scheduling',
    followUpDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    subject: 'Hot lead opportunity',
    preview: 'This looks very promising, when can we schedule a call?',
    time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    status: 'unread',
    unreadCount: 2,
    lastMessage: 'incoming',
    tag: 'hot-lead',
    campaign: 'Q1 Outreach',
    company: 'InnovateCorp',
    title: 'VP Sales',
    isPinned: true,
    isStarred: true,
    avatar: 'MJ',
    notes: 'High priority - budget confirmed',
    followUpDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
  }
];

export const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      id: 'msg1',
      type: 'incoming',
      sender: 'John Doe',
      time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      content: 'Hi there! I saw your product and I am very interested in learning more about it. Could you provide some additional details?'
    },
    {
      id: 'msg2',
      type: 'outgoing',
      sender: 'You',
      time: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      content: 'Hello John! Thank you for your interest. I\'d be happy to schedule a demo to show you our features. When would be a good time for you?'
    },
    {
      id: 'msg3',
      type: 'incoming',
      sender: 'John Doe',
      time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      content: 'That sounds great! How about tomorrow at 2 PM EST? I\'m particularly interested in the integration capabilities.'
    }
  ],
  '2': [
    {
      id: 'msg4',
      type: 'incoming',
      sender: 'Jane Smith',
      time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      content: 'Thanks for reaching out! I need some more information about your pricing structure and implementation timeline.'
    }
  ],
  '3': [
    {
      id: 'msg5',
      type: 'incoming',
      sender: 'Mike Johnson',
      time: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      content: 'This looks very promising! We\'re ready to move forward. When can we schedule a call to discuss the contract details?'
    }
  ]
};

export const mockFilters = {
  senders: ['john@example.com', 'jane@example.com'],
  campaigns: ['Q1 Outreach', 'Product Launch']
};
