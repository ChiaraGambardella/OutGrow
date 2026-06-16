const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

type ApiOptions = RequestInit & {
  token?: string | null;
};

type ApiErrorResponse = {
  message?: string;
  errors?: Array<{
    field?: string;
    message?: string;
  }>;
};

export async function apiFetch<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL non configurata.');
  }

  const { token, headers, ...rest } = options;

  const baseUrl = API_BASE_URL.endsWith('/')
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;

const isFormData = rest.body instanceof FormData;

const response = await fetch(`${baseUrl}${path}`, {
  ...rest,
  headers: {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  },
});

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorData = data as ApiErrorResponse | null;
    const firstErrorMessage = errorData?.errors?.[0]?.message;

    throw new Error(
      firstErrorMessage ??
        errorData?.message ??
        'Errore di comunicazione con il server.'
    );
  }

  return data as T;
}