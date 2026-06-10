
export enum IssueStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  REVIEW = 'Review',
  DONE = 'Done',
  BLOCKED = 'Blocked'
}

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  status: IssueStatus;
  assignee: string;
  priority: Priority;
  storyPoints: number;
  flagged: boolean;
  dueDate?: string;
}

export interface SprintStats {
  name: string;
  startDate: string;
  endDate: string;
  totalPoints: number;
  completedPoints: number;
  remainingDays: number;
  issues: JiraIssue[];
}

export interface EngineerInsight {
  summary: string;
  risks: string[];
  recommendations: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  sources?: { title: string; uri: string }[];
  isThinking?: boolean;
}

export const ImageSize = {
  '1K': '1K',
  '2K': '2K',
  '4K': '4K',
} as const;
export type ImageSize = keyof typeof ImageSize;

export const AspectRatio = {
  '1:1': '1:1',
  '3:4': '3:4',
  '4:3': '4:3',
  '9:16': '9:16',
  '16:9': '16:9',
} as const;
export type AspectRatio = keyof typeof AspectRatio;

export type RovoActionType = 
  | 'pit_reassign_issue' 
  | 'adjust_priority' 
  | 'create_escalation_ticket' 
  | 'update_race_log';
