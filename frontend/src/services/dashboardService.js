// Import the shared API helper used to send GET requests
import { apiGet } from "./api";

// Retrieve all student progress data for the researcher dashboard
export function getDashboardData() {
  return apiGet("/dashboard");
}

// Retrieve the general research analytics and statistics
export function getResearchAnalytics() {
  return apiGet("/dashboard/analytics");
}