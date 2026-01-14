
export type ID = string | number;

export type Timestamp = string; // ISO date string

export type Status = "active" | "inactive" | "pending" | "error";

export type DisplayStatus =
  | "Running"
  | "Paused"
  | "Draft"
  | "Completed"
  | "Archived";

export interface BaseEntity {
  id: ID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
