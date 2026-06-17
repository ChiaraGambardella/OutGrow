import * as SecureStore from 'expo-secure-store';

import { apiFetch } from './api';

const TOKEN_KEY = 'outgrow_token';
function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

function normalizeBirthDate(birthDate: string) {
  const value = birthDate.trim();

  // Se arriva già corretta: 1992-01-01
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  // Se per errore arriva come ISO: 1992-01-01T00:00:00.000Z
  const onlyDate = value.split('T')[0];

  if (/^\d{4}-\d{2}-\d{2}$/.test(onlyDate)) {
    return onlyDate;
  }

  return value;
}


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

  name?: string;
  surname?: string;

  username: string;
  email?: string;

  initials?: string;

  foto?: string | null;
  copertina?: string | null;

  profilePictureUrl?: string | null;
  coverPictureUrl?: string | null;

  bio?: string | null;

  badges?: Array<{
  id?: number | string;

  nome?: string;
  name?: string;
  titolo?: string;
  title?: string;
  
  descrizione?: string;
  description?: string;

  icona?: string | null;
  icon?: string | null;
  immagine?: string | null;

  ottenimento?: string;
}>;

  posts?: Array<any>;

  progress?: {
    completedChallenges: number;
    earnedBadges: number;
  };
};

export async function registerUserApi(payload: RegisterPayload) {
  const normalizedPayload: RegisterPayload = {
    ...payload,
    name: payload.name.trim(),
    surname: payload.surname.trim(),
    email: normalizeEmail(payload.email),
    username: normalizeUsername(payload.username),
    birthDate: normalizeBirthDate(payload.birthDate),
  };

  const response = await apiFetch<BackendAuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(normalizedPayload),
  });

  await SecureStore.setItemAsync(TOKEN_KEY, response.data.token);

  return response.data.user;
}

export async function loginUserApi(payload: LoginPayload) {
  const normalizedPayload: LoginPayload = {
    username: normalizeUsername(payload.username),
    password: payload.password,
  };

  const response = await apiFetch<BackendAuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(normalizedPayload),
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
type ProfileMediaFile = {
  uri: string;
  name: string;
  type: string;
};

type UpdateProfileMediaPayload = {
  foto?: ProfileMediaFile;
  copertina?: ProfileMediaFile;
  sorgenteMediaFoto?: 'galleria' | 'fotocamera';
  sorgenteMediaCopertina?: 'galleria' | 'fotocamera';
};

type UpdateProfileMediaResponse = {
  status: 'success';
  message: string;
  data: {
    foto?: string | null;
    copertina?: string | null;
  };
};

export async function updateProfileMediaApi(payload: UpdateProfileMediaPayload) {
  const token = await getToken();

  if (!token) {
    throw new Error('Sessione non trovata. Effettua di nuovo il login.');
  }

  const formData = new FormData();

  if (payload.foto) {
    formData.append('foto', {
      uri: payload.foto.uri,
      name: payload.foto.name,
      type: payload.foto.type,
    } as unknown as Blob);
  }

  if (payload.copertina) {
    formData.append('copertina', {
      uri: payload.copertina.uri,
      name: payload.copertina.name,
      type: payload.copertina.type,
    } as unknown as Blob);
  }

  if (payload.sorgenteMediaFoto) {
    formData.append('sorgenteMediaFoto', payload.sorgenteMediaFoto);
  }

  if (payload.sorgenteMediaCopertina) {
    formData.append('sorgenteMediaCopertina', payload.sorgenteMediaCopertina);
  }

  formData.append(
    'consensi',
    JSON.stringify({
      Galleria:
        payload.sorgenteMediaFoto === 'galleria' ||
        payload.sorgenteMediaCopertina === 'galleria',
      Fotocamera:
        payload.sorgenteMediaFoto === 'fotocamera' ||
        payload.sorgenteMediaCopertina === 'fotocamera',
    })
  );

  const response = await apiFetch<UpdateProfileMediaResponse>(
    '/api/utente/profile-media',
    {
      method: 'PUT',
      token,
      body: formData,
    }
  );

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