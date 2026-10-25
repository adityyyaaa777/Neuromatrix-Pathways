
import api from "./client";

/**
 * Get a specific assessment by its slug.
 */
export const getAssessment = async (slug) => {
  const response = await api.get(
    `/assessments/${encodeURIComponent(slug)}/`
  );

  return response.data;
};

/**
 * Get the assessment assigned to the logged-in student.
 */
export const getMyAssessment = async () => {
  const response = await api.get(
    "/assessments/my-assessment/"
  );

  return response.data;
};

/**
 * Start a new assessment attempt.
 */
export const startAttempt = async (slug, sessionId) => {
  const response = await api.post(
    `/assessments/${encodeURIComponent(slug)}/attempts/`,
    {
      session_id: sessionId,
    }
  );

  return response.data;
};

/**
 * Save or update a student's answer to a question.
 */
export const saveResponse = async (
  attemptId,
  questionId,
  optionId
) => {
  const response = await api.post(
    `/assessments/attempts/${encodeURIComponent(attemptId)}/responses/`,
    {
      question: questionId,
      selected_option: optionId,
    }
  );

  return response.data;
};

/**
 * Submit a completed assessment and calculate its result.
 * Expected response includes result_id from Django.
 */
export const completeAttempt = async (attemptId) => {
  const response = await api.post(
    `/assessments/attempts/${encodeURIComponent(attemptId)}/complete/`
  );

  return response.data;
};

/**
 * Get assessment statistics for the admin dashboard.
 */
export const getAdminDashboardStats = async () => {
  const response = await api.get(
    "/assessments/admin/dashboard/stats/"
  );

  return response.data;
};

/**
 * Retrieve the saved report for the logged-in user.
 * Pass resultId to retrieve the report for a specific submission.
 * If omitted, the backend may return the latest completed report.
 */
export const getMyReport = async (resultId) => {
  const params = {};

  if (
    resultId !== undefined &&
    resultId !== null &&
    String(resultId).trim() !== ""
  ) {
    params.result_id = resultId;
  }

  const response = await api.get(
    "/assessments/my-report/",
    { params }
  );

  return response.data;
};
