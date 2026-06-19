import { apiFetch } from './api';
import { getToken } from './auth';

export type FeedMedia = {
  id: number;
  tipo: 'Immagine' | 'Video';
  url: string;
};

export type CommentoAutore = {
  id: number;
  username: string;
  foto: string | null;
};

export type RispostaCommento = {
  id: number;
  testo: string;
  commentoPadreId: number;
  autore: CommentoAutore;
  totaleLike: number;
  messoDaMe: boolean;
};

export type CommentoPost = {
  id: number;
  testo: string;
  autore: CommentoAutore;
  totaleLike: number;
  messoDaMe: boolean;
  totaleRisposte: number;
  risposte: RispostaCommento[];
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
  commenti: CommentoPost[];
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
type ToggleLikeResponse = {
  status: 'success';
  message: string;
  data: {
    postId: number;
    liked: boolean;
  };
};

export async function togglePostLikeApi(postId: number) {
  const token = await getToken();

  const response = await apiFetch<ToggleLikeResponse>(
    `/api/feed/${postId}/like`,
    {
      method: 'POST',
      token,
    }
  );

  return response.data;
}

type AddCommentResponse = {
  status: 'success';
  message: string;
  data: {
    id: number;
    testo: string;
    utenteId: number;
    sfidaCompletataId: number;
    pubblicazione: string;
  };
};

export async function addCommentToPostApi(postId: number, text: string) {
  const token = await getToken();

  // Chiamata all'endpoint definito in commento.routes.js
  const response = await apiFetch<AddCommentResponse>(
    `/api/comments/posts/${postId}`,
    {
      method: 'POST',
      token,
      body: JSON.stringify({ text }),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
}

type AddReplyResponse = {
  status: 'success';
  message: string;
  data: {
    id: number;
    testo: string;
    utenteId: number;
    commentoPadreId: number;
    pubblicazione: string;
  };
};

/**
 * Invia una risposta (commento di secondo livello) agganciata a un commento padre
 */
export async function addReplyToCommentApi(commentoPadreId: number, text: string) {
  const token = await getToken();

  const response = await apiFetch<AddReplyResponse>(
    `/api/comments/${commentoPadreId}/replies`,
    {
      method: 'POST',
      token,
      body: JSON.stringify({ text }),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
}