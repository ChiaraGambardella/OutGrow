import { apiFetch } from './api';
import { getToken } from './auth';

export type FeedMedia = {
  id: number;
  tipo: 'Immagine' | 'Video';
  url: string;
};

export type FeedPost = {
  id: number;
  descrizione: string | null;
  luogo: string | null;
  difficoltaAttesa: string | null;
  difficoltaPercepita: string | null;
  pubblicazione: string;
  titoloSfida: string;
  autore: {
    username: string;
    foto: string | null;
  };
  interazioni: {
    totaleLike: number;
    messoDaMe: boolean;
    totaleCommenti: number;
  };
  media: FeedMedia[];
};

type FeedResponse = {
  status: 'success';
  message: string;
  results: number;
  data: FeedPost[];
};

export async function getGlobalFeedApi() {
  const token = await getToken();

  const response = await apiFetch<FeedResponse>('/api/feed', {
    method: 'GET',
    token,
  });

  return response.data;
}