import { Conversation, Message } from "../types";

// Mock conversations matching reference design
export const mockConversations: Conversation[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    subject: 'Re: Partnership Opportunity',
    preview: "Thanks for reaching out! I'd love to schedule a call to discuss this further. Are you available next week?",
    time: '1/15/2024',
    status: 'unread',
    unreadCount: 1,
    lastMessage: 'incoming',
    tag: 'interested',
    campaign: 'Q1 SaaS Outreach',
    company: 'TechCorp',
    title: 'CEO',
    isPinned: false,
    isStarred: true,
    avatar: 'SJ',
    notes: '',
    followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike.chen@example.com',
    subject: 'Re: Product Demo Request',
    preview: "Not interested at this time, but please keep us in mind for the future.",
    time: '1/15/2024',
    status: 'read',
    unreadCount: 0,
    lastMessage: 'incoming',
    tag: 'not-interested',
    campaign: 'Enterprise Prospects',
    company: 'EnterpriseCo',
    title: 'CTO',
    isPinned: false,
    isStarred: false,
    avatar: 'MC',
    notes: '',
    followUpDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    name: 'Lisa Rodriguez',
    email: 'lisa.rodriguez@example.com',
    subject: 'Re: Solution for Enterprise Teams',
    preview: 'This looks interesting. Can you send me more information about pricing and implementation timeline?',
    time: '1/15/2024',
    status: 'unread',
    unreadCount: 1,
    lastMessage: 'incoming',
    tag: 'interested',
    campaign: 'Q1 SaaS Outreach',
    company: 'Solutions Inc',
    title: 'VP of Operations',
    isPinned: false,
    isStarred: false,
    avatar: 'LR',
    notes: '',
    followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david.kim@example.com',
    subject: 'Re: Consulting Services Inquiry',
    preview: "We're currently working with another vendor, but I'll reach out if anything changes.",
    time: '1/14/2024',
    status: 'read',
    unreadCount: 0,
    lastMessage: 'incoming',
    tag: 'maybe-later',
    campaign: 'SMB Follow-up',
    company: 'SmallBiz LLC',
    title: 'Founder',
    isPinned: false,
    isStarred: false,
    avatar: 'DK',
    notes: '',
    followUpDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
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
