
export enum UserRole {
  CITIZEN = 'CITIZEN',
  ADMIN = 'ADMIN',
  GUEST = 'GUEST'
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
  points: number;
  badges: string[];
  bio?: string;
  coverPhoto?: string;
  avatarFrame?: string;
  followedReportIds: string[];
}

export enum ReportStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  SOLVED = 'SOLVED'
}

export enum ReportCategory {
  INFRASTRUCTURE = 'Infrastructure',
  CLEANLINESS = 'Cleanliness',
  SAFETY = 'Safety',
  NOISE = 'Noise',
  OTHER = 'Other'
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: number;
  likes?: number;
}

export interface Report {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  category: ReportCategory;
  priority: 'Low' | 'Medium' | 'High';
  status: ReportStatus;
  location: { lat: number; lng: number; address?: string };
  timestamp: number;
  imageUrl?: string;
  aiAnalysis?: string;
  votes: number;
  comments: Comment[];
  followerIds: string[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'alert' | 'badge';
  timestamp: number;
  isRead: boolean;
  linkToReportId?: string;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'error' | 'achievement';
  message: string;
}

export type ViewState = 'LANDING' | 'MAP' | 'DASHBOARD' | 'PROFILE' | 'GALLERY' | 'LEADERBOARD';

export interface AvatarFrame {
  id: string;
  label: string;
  class: string;
}

// Global Avatar Frames definition used in Profile and App UI
export const AVATAR_FRAMES: AvatarFrame[] = [
  { id: 'none', label: 'None', class: 'border-white dark:border-slate-800' },
  { id: 'teal', label: 'Teal Glow', class: 'border-brand-teal ring-4 ring-brand-teal/30' },
  { id: 'gold', label: 'Gold Hero', class: 'border-amber-400 ring-4 ring-amber-400/30' },
  { id: 'neon', label: 'Neon Blue', class: 'border-blue-500 ring-4 ring-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)]' },
  { id: 'eco', label: 'Eco Green', class: 'border-emerald-500 ring-4 ring-emerald-500/30' },
];
