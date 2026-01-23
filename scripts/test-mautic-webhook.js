/**
 * Mock Webhook Test Utility
 * 
 * Run this to simulate Mautic webhooks and verify they're correctly processed.
 */

const EVENT_TYPES = {
  EMAIL_OPENED: "mautic.email_on_open",
  EMAIL_CLICKED: "mautic.page_on_hit",
  EMAIL_BOUNCED: "mautic.email_on_bounce",
  CONTACT_CREATED: "mautic.lead_post_save_new",
  FORM_SUBMITTED: "mautic.form_on_submit"
};

async function testWebhook(type = EVENT_TYPES.EMAIL_OPENED) {
  const payload = {
    "mautic.event_type": type,
    "mautic.event_payload": {
      "email": { "id": 123, "subject": "Test Email" },
      "contact": { "id": 456, "email": "test@example.com" },
      "campaign": { "id": 789, "name": "Test Campaign" },
      "page": type === EVENT_TYPES.EMAIL_CLICKED ? { "url": "https://example.com/click", "title": "Test Page" } : undefined,
      "bounce": type === EVENT_TYPES.EMAIL_BOUNCED ? { "type": "hard", "reason": "User does not exist" } : undefined,
      "form": type === EVENT_TYPES.FORM_SUBMITTED ? { "id": 1, "name": "Contact Form" } : undefined,
      "submission": type === EVENT_TYPES.FORM_SUBMITTED ? { "results": { "first_name": "Test", "last_name": "User" } } : undefined
    },
    "timestamp": new Date().toISOString()
  };

  const body = JSON.stringify(payload);
  
  console.log(`Sending mock webhook for event: ${type}...`);
  
  try {
    const response = await fetch("http://localhost:3000/api/webhooks/mautic", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body
    });

    const data = await response.json();
    console.log("Response:", response.status, data);
  } catch (err) {
    console.error("Test failed:", err.message);
    console.log("Note: Ensure the local server is running at http://localhost:3000");
  }
}

// To run this: node scripts/test-mautic-webhook.js <event_type>
const typeArg = process.argv[2];
const selectedType = EVENT_TYPES[typeArg] || EVENT_TYPES.EMAIL_OPENED;

testWebhook(selectedType);
