type ApiErrorBody = {
  status?: string;
  message?: string;
};

export function getApiErrorMessage(body: unknown, fallback: string): string {
  if (typeof body === "object" && body !== null && "message" in body) {
    const message = (body as ApiErrorBody).message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message.trim();
    }
  }
  return fallback;
}

/** Safe fetch wrapper — never surfaces raw JSON bodies to the UI, only `message` strings. */
export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch {
    throw new Error("Unable to reach the server. Check your connection and try again.");
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error("The server returned an unreadable response.");
  }

  if (!response.ok) {
    throw new Error(getApiErrorMessage(body, "The request failed. Please try again."));
  }

  return body as T;
}
