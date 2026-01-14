export interface AlertNotification extends Omit<Notification, "id"> {
  id: string | number;
  alertType: AlertType;
  severity: AlertSeverity;
  acknowledged: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
}

export enum AlertType {
  SECURITY = "security",
  PERFORMANCE = "performance",
  SYSTEM = "system",
  BUSINESS = "business",
  MAINTENANCE = "maintenance",
}

export enum AlertSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export type AlertNotificationWithSeverity = AlertNotification & {
  severity: AlertSeverity;
};
