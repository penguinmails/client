// Toast Notification Types
export interface ToastNotification extends Omit<Notification, "id"> {
  id: string | number;
  toastType: ToastType;
  duration: number; // in milliseconds
  position: ToastPosition;
  autoHide: boolean;
}

export enum ToastType {
  SUCCESS = "success",
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
  LOADING = "loading",
}

export enum ToastPosition {
  TOP_LEFT = "top-left",
  TOP_RIGHT = "top-right",
  TOP_CENTER = "top-center",
  BOTTOM_LEFT = "bottom-left",
  BOTTOM_RIGHT = "bottom-right",
  BOTTOM_CENTER = "bottom-center",
}

// In-App Notification Queue
export interface NotificationQueue {
  pending: Notification[];
  active: Notification | null;
  maxQueueSize: number;
}

export type ToastNotificationWithPosition = ToastNotification & {
  position: ToastPosition;
};
