export type Role = "DISPLAY" | "STAFF" | "LIBRARIAN" | "ADMIN";
export type MediaType = "PHOTO" | "VIDEO";
export type MediaStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface MediaItem {
  id: string;
  title: string;
  description: string | null;
  type: MediaType;
  url: string;
  thumbnailUrl: string | null;
  publicId: string;
  status: MediaStatus;
  eventName: string | null;
  eventDate: string | null;
  fileSize: number | null;
  duration: number | null;
  displayDuration: number | null; // For photos, how long to show in carousel (seconds)
  order: number; // Manual sorting order
  paused: boolean; // If true, video is hidden from display page
  userId: string;
  createdAt: string;
  updatedAt: string;
  uploadedBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
