
import { getTechnicalDirectorInsight, generateCodeTests } from './geminiService';
import { MOCK_SPRINT } from './constants';

export const getTelemetry = async () => {
  return {
    status: "Green Flag",
    telemetry: {
      sprintName: MOCK_SPRINT.name,
      completionRate: "24.5%",
      reliability: "88%"
    }
  };
};

export const diagnoseLogic = async (payload: { context: string }) => {
  const diagnosis = await getTechnicalDirectorInsight(payload.context);
  return { analysis: diagnosis };
};
