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
export type ChallengeMedia = {
  uri: string;
  name: string;
  type: string;
};

export type CompleteChallengePayload = {
  sfidaId: string;
  description?: string;
  difficoltaAttesa?: string;
  difficoltaPercepita?: string;
  media?: ChallengeMedia[];
  latitude?: number | null;
  longitude?: number | null;
  locationName?: string | null;
  consensi?: {
    Fotocamera?: boolean;
    Galleria?: boolean;
    GNSS?: boolean;
  };
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

    if (payload.latitude !== undefined && payload.latitude !== null) {
    formData.append('latitude', payload.latitude.toString());
  }

  if (payload.longitude !== undefined && payload.longitude !== null) {
    formData.append('longitude', payload.longitude.toString());
  }

  if (payload.locationName) {
    formData.append('locationName', payload.locationName);
  }

  if (payload.consensi) {
    formData.append('consensi', JSON.stringify(payload.consensi));
  }

  if (payload.media) {
    for (const file of payload.media) {
     formData.append('media', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as unknown as Blob);
    }
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