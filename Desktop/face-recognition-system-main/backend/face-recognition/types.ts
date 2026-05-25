export interface Member {
  id: string;
  name: string;
  profileImage: string;
  faceImages: string[];
  dateAdded: Date;
}

export interface Detection {
  id: string;
  name: string;
  type: "Known" | "Unknown";
  image: string;
  timestamp: Date;
}

export interface Notification {
  id: string;
  type: "known" | "unknown";
  message: string;
  timestamp: Date;
}

export interface Stats {
  totalMembers: number;
  knownToday: number;
  unknownToday: number;
}

export interface CreateMemberRequest {
  id: string;
  name: string;
  profileImage: string;
  faceImages: string[];
}

export interface AddDetectionRequest {
  id: string;
  name: string;
  type: "Known" | "Unknown";
  image: string;
}

export interface MembersResponse {
  members: Member[];
}

export interface DetectionsResponse {
  detections: Detection[];
}

export interface NotificationsResponse {
  notifications: Notification[];
}

export interface SuccessResponse {
  success: boolean;
  message: string;
}