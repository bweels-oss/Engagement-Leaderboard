export interface TeamMember {
  id: string;
  fullName: string;
  role: string;
  email: string;
}

export type TaskStatus = 'Pending' | 'Completed';

export interface Task {
  id: string;
  teamId: string;
  title: string;
  points: number;
  status: TaskStatus;
  completedDate?: string; // ISO Date
}

export interface Submission {
  id: string;
  teamId: string;
  formId: string; // 'ms-form-xyz' or 'google-form-abc'
  submittedAt: string;
  dataBlob: Record<string, any>;
}

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  tasksRequired: number; // Count of total tasks assigned
  points: number;
  rank: number;
  lastSubmissionDate?: string;
  
  // Computed client-side for UI convenience, usually populated by service
  percentComplete: number;
  completedTaskCount: number;
}

// Gauge specific types
export interface GaugeProps {
  percent: number;
  size?: number; // px
  showTicks?: boolean;
  animation?: 'none' | 'ease' | 'spring';
  label?: string;
}

// Integration types
export interface MicrosoftForm {
  id: string;
  title: string;
  url: string;
}