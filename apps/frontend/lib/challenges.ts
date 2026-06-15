import { apiFetch } from './api';
import { getToken } from './auth';

export type WeeklyChallenge = {
  id: number;
  titolo: string;
  descrizione: string;
  immagineSfida?: string | null;
  badge?: {
    id: number;
    immagine?: string | null;
  };
  completata: boolean | null;
};

type WeeklyChallengeResponse = {
  status: 'success';
  data: WeeklyChallenge;
};

export async function getWeeklyChallengeApi() {
  const token = await getToken();

  const response = await apiFetch<WeeklyChallengeResponse>(
    '/api/sfide/settimanale',
    {
      method: 'GET',
      token,
    }
  );

  return response.data;
}
export type CompleteChallengePayload = {
  sfidaId: string;
  description?: string;
  difficoltaAttesa?: string;
  difficoltaPercepita?: string;
};

export async function completeChallengeApi(payload: CompleteChallengePayload) {
  const token = await getToken();

  const formData = new FormData();

  formData.append('description', payload.description || '');

  if (payload.difficoltaAttesa) {
    formData.append('difficoltaAttesa', payload.difficoltaAttesa);
  }

  if (payload.difficoltaPercepita) {
    formData.append('difficoltaPercepita', payload.difficoltaPercepita);
  }

  const response = await apiFetch<{
    status: 'success';
    message: string;
    data: unknown;
  }>(`/api/sfide-completate/${payload.sfidaId}`, {
    method: 'POST',
    token,
    body: formData,
    headers: {},
  });

  return response;
}