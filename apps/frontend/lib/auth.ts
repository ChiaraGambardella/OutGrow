import * as SecureStore from 'expo-secure-store';

import { apiFetch } from './api';

const TOKEN_KEY = 'outgrow_token';

export type RegisterPayload = {
  name: string;
  surname: string;
  birthDate: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export type AuthUser = {
  id: number | string;
  nome: string;
  cognome: string;
  email: string;
  username: string;
  foto?: string | null;
  copertina?: string | null;
};

type BackendAuthResponse = {
  status: 'success';
  message: string;
  data: {
    user: AuthUser;
    token: string;
  };
};

export type MyProfile = {
  id: number | string;
  nome?: string;
  cognome?: string;
  username: string;
  foto?: string | null;
  copertina?: string | null;
  badges?: Array<{
    id: number | string;
    titolo?: string;
    title?: string;
    immagine?: string | null;
    icon?: string;
  }>;
  posts?: Array<{
    id: number | string;
    titoloSfida?: string;
    title?: string;
    descrizione?: string;
    description?: string;
    luogo?: string | null;
    location?: string | null;
    difficoltaAttesa?: string | null;
    expectedDifficulty?: string | null;
    difficoltaPercepita?: string | null;
    perceivedDifficulty?: string | null;
  }>;
};

export async function registerUserApi(payload: RegisterPayload) {
  const response = await apiFetch<BackendAuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  await SecureStore.setItemAsync(TOKEN_KEY, response.data.token);

  return response.data.user;
}

export async function loginUserApi(payload: LoginPayload) {
  const response = await apiFetch<BackendAuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  await SecureStore.setItemAsync(TOKEN_KEY, response.data.token);

  return response.data.user;
}

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function isAuthenticated() {
  const token = await getToken();
  return Boolean(token);
}

export async function logoutUser() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
type BackendMessageResponse<T = unknown> = {
  status: 'success';
  message: string;
  data?: T;
};

export async function updateEmailApi(email: string) {
  const token = await getToken();

  if (!token) {
    throw new Error('Sessione non trovata. Effettua di nuovo il login.');
  }

  const response = await apiFetch<BackendMessageResponse>('/api/auth/update-email', {
    method: 'PUT',
    token,
    body: JSON.stringify({ email }),
  });

  return response;
}

export async function updatePasswordApi(payload: {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const token = await getToken();

  if (!token) {
    throw new Error('Sessione non trovata. Effettua di nuovo il login.');
  }

  const response = await apiFetch<BackendMessageResponse>(
    '/api/auth/update-password',
    {
      method: 'PUT',
      token,
      body: JSON.stringify(payload),
    }
  );

  return response;
}

type BackendProfileResponse = {
  status: 'success';
  message: string;
  data: MyProfile;
};

export async function getMyProfile() {
  const token = await getToken();

  if (!token) {
    throw new Error('Sessione non trovata. Effettua di nuovo il login.');
  }

  const response = await apiFetch<BackendProfileResponse>('/api/utente/me', {
    method: 'GET',
    token,
  });

  return response.data;
}

export function getFirstValidationMessage(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'issues' in error &&
    Array.isArray((error as { issues?: unknown[] }).issues)
  ) {
    const firstIssue = (error as { issues: Array<{ message?: string }> })
      .issues[0];

    if (firstIssue?.message) {
      return firstIssue.message;
    }
  }

  return 'Controlla i dati inseriti.';
}

type ForgotPasswordResponse = {
  status: 'success';
  message: string;
};

export async function forgotPasswordApi(email: string) {
  const response = await apiFetch<ForgotPasswordResponse>(
    '/api/auth/forgot-password',
    {
      method: 'POST',
      body: JSON.stringify({ email }),
    }
  );

  return response;
}
export type NotificationPreferences = {
  sfide: boolean;
  progressi: boolean;
  social: boolean;
};

type PreferencesResponse = {
  status: 'success';
  message: string;
  data: NotificationPreferences;
};

export async function getPreferencesApi() {
  const token = await getToken();

  if (!token) {
    throw new Error('Sessione non trovata. Effettua di nuovo il login.');
  }

  const response = await apiFetch<PreferencesResponse>('/api/preferences', {
    method: 'GET',
    token,
  });

  return response.data;
}

export async function updatePreferencesApi(preferences: NotificationPreferences) {
  const token = await getToken();

  if (!token) {
    throw new Error('Sessione non trovata. Effettua di nuovo il login.');
  }

  const response = await apiFetch<PreferencesResponse>('/api/preferences', {
    method: 'PUT',
    token,
    body: JSON.stringify(preferences),
  });

  return response.data;
}