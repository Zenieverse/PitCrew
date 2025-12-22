
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
