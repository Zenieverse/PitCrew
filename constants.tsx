
import { JiraIssue, IssueStatus, Priority, SprintStats } from './types';

export const MOCK_ISSUES: JiraIssue[] = [
  { id: '1', key: 'PIT-101', summary: 'Optimize database queries for aero-sensor API', status: IssueStatus.DONE, assignee: 'Lewis H.', priority: Priority.HIGH, storyPoints: 5, flagged: false },
  { id: '2', key: 'PIT-102', summary: 'Implement tire-wear predictive model', status: IssueStatus.IN_PROGRESS, assignee: 'Max V.', priority: Priority.CRITICAL, storyPoints: 8, flagged: true },
  { id: '3', key: 'PIT-103', summary: 'UI Refactor for Telemetry Dashboard', status: IssueStatus.REVIEW, assignee: 'Charles L.', priority: Priority.MEDIUM, storyPoints: 3, flagged: false },
  { id: '4', key: 'PIT-104', summary: 'Fix memory leak in engine management service', status: IssueStatus.TODO, assignee: 'Lando N.', priority: Priority.HIGH, storyPoints: 5, flagged: false },
  { id: '5', key: 'PIT-105', summary: 'Legacy data migration for historical lap times', status: IssueStatus.BLOCKED, assignee: 'George R.', priority: Priority.LOW, storyPoints: 2, flagged: true },
  { id: '6', key: 'PIT-106', summary: 'Security patch for pit-wall comms', status: IssueStatus.TODO, assignee: 'Lewis H.', priority: Priority.CRITICAL, storyPoints: 3, flagged: false },
];

export const MOCK_SPRINT: SprintStats = {
  name: "Silverstone GP Sprint",
  startDate: "2024-05-10",
  endDate: "2024-05-24",
  totalPoints: 26,
  completedPoints: 5,
  remainingDays: 4,
  issues: MOCK_ISSUES
};
