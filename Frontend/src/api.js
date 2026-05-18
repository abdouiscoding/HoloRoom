export const address = "192.168.1.3";

export const API = import.meta.env.VITE_BACKEND_API_URL;

export const logAction = async (action, details = "") => {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  if (!userId || !token) return;
  try {
    await myFetch(`${API}/api/logs/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        action,
        details,
        userId: parseInt(userId),
      }),
    });
  } catch (e) {
    // silent — logging shouldn't break user flow
    console.warn("log failed:", e);
  }
};

export const myFetch = async (url, options = {}) => {
  // Define the headers you want attached to EVERY request
  const defaultHeaders = {
    'ngrok-skip-browser-warning': 'true',
    ...options.headers // This ensures you don't overwrite headers passed in specific calls
  };

  // Call the native fetch with your new default headers
  return fetch(url, {
    ...options,
    headers: defaultHeaders,
  });
};