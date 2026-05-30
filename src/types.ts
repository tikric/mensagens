export interface FacebookGroup {
  id: string;
  name: string;
  url: string;
  category: string;
  dailyLimit: number; // 1 to 5 messages per day
  postsCountToday: number;
  active: boolean;
  notes?: string;
}

export interface FacebookAccount {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  status: "logged_in" | "expired" | "not_logged";
  accessToken?: string;
  cookieString?: string;
  groupsCount: number;
}

export interface MessageTemplate {
  id: string;
  title: string;
  text: string;
  variations: string[]; // AI anti-spam variations
  tags: string[];
  createdAt: string;
}

export interface ScheduleCampaign {
  active: boolean;
  startHour: string; // "08:00"
  endHour: string; // "19:00"
  intervalMinutes: number; // 15, 30, 60, 120, etc.
  messagesPerGroupPerDay: number; // 1 - 5 as requested
  useAiVariations: boolean; // Swap between variations to keep posts distinct
  randomizeDelay: boolean; // Add +/- 5 min random offset to act human
}

export interface DispatchJob {
  id: string;
  groupId: string;
  groupName: string;
  groupUrl: string;
  messageText: string;
  scheduledTime: string; // "HH:MM" or datetime
  status: "pending" | "sending" | "success" | "failed";
  sentAt?: string;
  error?: string;
  isManual: boolean; // manual assist vs auto simulation
}

export interface DispatchLog {
  id: string;
  timestamp: string;
  type: "info" | "success" | "warning" | "error";
  groupName: string;
  messageSnippet: string;
  details: string;
}

export interface InstagramCreative {
  id: string;
  mediaUrl?: string;
  mediaType: "video" | "image";
  mediaName: string;
  generatedCaption: string;
  postedAt?: string;
  status: "idle" | "ready" | "posted";
}
