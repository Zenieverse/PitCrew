
import { getTechnicalDirectorInsight, generateCodeTests } from './geminiService';
import { MOCK_SPRINT } from './constants';

export const getTelemetry = async (payload: { sprintId: string }) => {
  console.log(`[Race Control] Fetching telemetry for sprint: ${payload.sprintId}`);
  // In a real app, fetch from Jira API here.
  return {
    status: "Green Flag",
    telemetry: {
      sprintName: MOCK_SPRINT.name,
      completionRate: "24.5%",
      reliability: "88%"
    }
  };
};

export const reassignIssue = async (payload: { issueKey: string; driverId: string }) => {
  return {
    success: true,
    message: `Pit stop successful. ${payload.issueKey} is now handled by Driver ${payload.driverId}.`
  };
};

export const diagnoseLogic = async (payload: { context: string }) => {
  console.log(`[Tech HQ] Diagnosing failure...`);
  const diagnosis = await getTechnicalDirectorInsight(payload.context);
  return {
    status: "Diagnosis Complete",
    analysis: diagnosis
  };
};

export const generateTests = async (payload: { code: string }) => {
  console.log(`[Tech HQ] Generating test circuit...`);
  const tests = await generateCodeTests(payload.code);
  return {
    status: "Circuit Generated",
    testBlueprint: tests
  };
};
