export interface KumoApiConfig {
  apiBaseUrl: string;
  username: string;
  password: string;
  senderEmail: string;
}

export interface EmailRecipient {
  email: string;
  name?: string;
  substitutions?: Record<string, string>;
}

export interface EmailPayload {
  envelope_sender: string;
  content: string | {
    text_body: string;
    subject: string;
    from: {
      email: string;
      name?: string;
    };
  };
  recipients: EmailRecipient[];
}

export interface EmailResult {
  success: boolean;
  status: 'sent' | 'failed' | 'pending';
  recipient: string;
  statusCode?: number;
  messageId?: string;
  error?: string;
  message: string;
  deliveryStatus?: {
    checked: boolean;
    status: string;
    note?: string;
  };
}

export interface BulkEmailResults {
  total: number;
  successful: number;
  failed: number;
  results: EmailResult[];
}
