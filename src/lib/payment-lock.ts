/**
 * Client payment enforcement.
 * Set ENABLED to false after the invoice is settled to restore full ERP access.
 */
export const PAYMENT_LOCK = {
  ENABLED: true,
  title: "System suspended",
  message:
    "SafeQuest ERP access has been locked because the project invoice has not been paid. Please contact the developer to restore access.",
  developerNote: "All modules, login, and documents stay offline until payment is confirmed.",
  contactLabel: "Contact the developer",
  contactHint: "Reach out on WhatsApp or the number you used during development to settle and unlock.",
} as const;
