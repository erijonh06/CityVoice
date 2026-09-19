
import { Report, User, UserRole, ReportStatus } from '../types';

const DB_KEYS = {
  REPORTS: 'cityvoice_reports',
  USER: 'cityvoice_user', // Current session user
  REGISTERED_USERS: 'cityvoice_registered_users', // All accounts
  VERSION: 'cityvoice_db_version'
};

const INITIAL_REPORTS: Report[] = [
  {
    id: 'r1',
    userId: 'u2',
    userName: 'Jane Doe',
    title: 'Broken Swing',
    description: 'The left swing in Central Park is broken.',
    category: 'Infrastructure' as any,
    priority: 'Medium',
    status: ReportStatus.OPEN,
    location: { lat: 40.7138, lng: -74.0070 },
    timestamp: Date.now() - 86400000,
    aiAnalysis: 'Requires maintenance crew.',
    votes: 5,
    imageUrl: 'https://images.unsplash.com/photo-1612376100958-a25e22709214?w=500&auto=format&fit=crop&q=60',
    comments: [
        { id: 'c1', userId: 'u3', userName: 'Mike T', userAvatar: 'https://i.pravatar.cc/150?u=3', text: 'I noticed this too! Dangerous for kids.', timestamp: Date.now() - 40000000 }
    ],
    followerIds: []
  }
];

export const mockDb = {
  // Initialize or load data
  init: () => {
    const reports = localStorage.getItem(DB_KEYS.REPORTS);
    if (!reports) {
      localStorage.setItem(DB_KEYS.REPORTS, JSON.stringify(INITIAL_REPORTS));
    }
    const registered = localStorage.getItem(DB_KEYS.REGISTERED_USERS);
    if (!registered) {
      // Seed with some mock users for testing login
      localStorage.setItem(DB_KEYS.REGISTERED_USERS, JSON.stringify([
        { id: 'admin-1', name: 'admin', role: UserRole.ADMIN },
        { id: 'u2', name: 'Jane Doe', role: UserRole.CITIZEN, avatar: 'https://i.pravatar.cc/150?u=2', points: 150, badges: ['Active Resident'], followedReportIds: [] }
      ]));
    }
  },

  // Reports
  getReports: (): Report[] => {
    const data = localStorage.getItem(DB_KEYS.REPORTS);
    return data ? JSON.parse(data) : [];
  },

  saveReports: (reports: Report[]) => {
    localStorage.setItem(DB_KEYS.REPORTS, JSON.stringify(reports));
  },

  // Registered Users Registry
  getRegisteredUsers: (): User[] => {
    const data = localStorage.getItem(DB_KEYS.REGISTERED_USERS);
    return data ? JSON.parse(data) : [];
  },

  registerUser: (user: User) => {
    const users = mockDb.getRegisteredUsers();
    localStorage.setItem(DB_KEYS.REGISTERED_USERS, JSON.stringify([...users, user]));
  },

  // User persistence (for the current session/browser)
  getUser: (): User | null => {
    const data = localStorage.getItem(DB_KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  saveUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(DB_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(DB_KEYS.USER);
    }
  },

  // Reset Database
  reset: () => {
    localStorage.clear();
    window.location.reload();
  }
};
