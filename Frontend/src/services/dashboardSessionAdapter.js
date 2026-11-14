import { API, myFetch } from "../api";

// Structural pattern — Adapter: normalize the authenticated backend session for the dashboard.
export const readDashboardSession = async () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const response = await myFetch(`${API}/api/auth/session`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 401 || response.status === 403) return null;
  if (!response.ok) {
    throw new Error(`Dashboard session verification failed (${response.status})`);
  }

  const session = await response.json();
  return typeof session.userRole === "string"
    ? { role: session.userRole }
    : null;
};
