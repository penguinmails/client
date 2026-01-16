export class AuthError extends Error {
  constructor(message: string, public code: string, public context?: Record<string, unknown>) {
    super(message);
    this.name = 'AuthError';
  }
}

export class SessionRecoveryError extends AuthError {
  constructor(attempts: number) {
    super('Session recovery failed', 'SESSION_RECOVERY_FAILED', { attempts });
  }
}

export class EnrichmentError extends AuthError {
  constructor(userId: string, source: string) {
    super(`Failed to load ${source}`, 'ENRICHMENT_FAILED', { userId });
  }
}
