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