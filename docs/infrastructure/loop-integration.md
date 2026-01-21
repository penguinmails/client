# Loop Email Integration

## Overview
This project uses [Loop](https://loops.so) for transactional email delivery. The integration handles verification emails, password resets, welcome emails, and notifications.

## Configuration
Required environment variables:
- `LOOP_API_KEY`: Your Loop API key.
- `LOOP_VERIFICATION_TRANSACTIONAL_ID`: Transactional ID for verification emails.
- `LOOP_RESET_TRANSACTIONAL_ID`: Transactional ID for password reset emails.
- `LOOP_WELCOME_TRANSACTIONAL_ID`: Transactional ID for welcome emails.
- `LOOP_NOTIFICATION_TRANSACTIONAL_ID`: Transactional ID for general notifications.

## Service Implementation
The service is implemented in `lib/services/loop.ts` and provides the following main methods:

- `sendVerificationEmail(email: string, verificationToken: string, userName?: string)`
- `sendPasswordResetEmail(email: string, resetToken: string, userName?: string)`
- `sendWelcomeEmail(email: string, userName: string, companyName?: string)`
- `sendNotificationEmail(email: string, message: string, subject?: string, userName?: string)`

## Email Flow
1. **Trigger**: Events like registration or password reset request trigger the email.
2. **Loop Integration**: The backend uses the Loop SDK to send the request.
3. **Template**: Loop uses the specified Transactional ID to select the template and injects provided variables.
4. **Tracking**: Delivery is tracked via Loop's dashboard.

## Usage Example
```typescript
import { getLoopService } from "@/lib/services/loop";

const loop = getLoopService();
await loop.sendVerificationEmail("user@example.com", "token123", "John Doe");
```

## Security & Architecture
- **Token Management**: Verification tokens are generated securely and have a 24-hour expiration.
- **Error Handling**: The service includes error handling for failed send attempts.
- **Types**: Typed interfaces are provided for email data and API responses.
