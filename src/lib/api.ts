const BASE_URL = "http://localhost:5278/api";

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  // Get token from localStorage (only available on client side)
  let token = null;
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        token = user.token;
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
      }
    }
  }

  // Setup headers
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Attach token if available
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Construct full URL
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  // Execute request
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Agar token expire ho gaya ho ya invalid ho (401 Unauthorized)
  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"; // Clear cookie
      window.location.href = "/login"; // Redirect to login page
    }
  }

  return response;
}
