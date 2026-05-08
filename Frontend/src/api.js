export const address = "192.168.1.3";

export const API = import.meta.env.VITE_BACKEND_API_URL;

export const myFetch = async (url, options = {}) => {
  // Define the headers you want attached to EVERY request
  const defaultHeaders = {
    'ngrok-skip-browser-warning': 'true',
    'Content-Type': 'application/json',
    ...options.headers // This ensures you don't overwrite headers passed in specific calls
  };

  // Call the native fetch with your new default headers
  return fetch(url, {
    ...options,
    headers: defaultHeaders,
  });
};