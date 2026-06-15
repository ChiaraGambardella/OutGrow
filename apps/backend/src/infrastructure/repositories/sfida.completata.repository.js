import pool from '../database/db.js';
import SfidaCompletata from '../../domain/sfida.completata.entity.js';

function getIsoWeekData(date = new Date()) {
  const currentDate = new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ));

  const dayNumber = currentDate.getUTCDay() || 7;
  currentDate.setUTCDate(currentDate.getUTCDate() + 4 - dayNumber);

  const isoYear = currentDate.getUTCFullYear();
  const yearStart = new Date(Date.UTC(isoYear, 0, 1));
  const isoWeek = Math.ceil((((currentDate - yearStart) / 86400000) + 1) / 7);

  return {
    isoYear,
    isoWeek,
  };
}

export class SfidaCompletataRepository {
  async create(post) {
    if (!post.haPosizioneValida()) {
      throw new Error(
        'Errore di validazione: la posizione deve essere totalmente presente (coordinate + luogo) o del tutto assente.'
      );
    }

    const { isoYear, isoWeek } = getIsoWeekData(new Date());

    const query = `
      INSERT INTO sfida_completata (
        utente,
        sfida,
        descrizione,
        latitudine,
        longitudine,
        luogo,
        difficolta_attesa,
        difficolta_percepita,
        anno_settimana,
        numero_settimana
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, pubblicazione, anno_settimana, numero_settimana;
    `;

    const values = [
      post.utente,
      post.sfida,
      post.descrizione,
      post.latitudine,
      post.longitudine,
      post.luogo,
      post.difficolta_attesa,
      post.difficolta_percepita,
      isoYear,
      isoWeek,
    ];

    try {
      const result = await pool.query(query, values);

      post.id = result.rows[0].id;
      post.pubblicazione = new Date(result.rows[0].pubblicazione);
      post.anno_settimana = result.rows[0].anno_settimana;
      post.numero_settimana = result.rows[0].numero_settimana;

      return post;
    } catch (error) {
      if (error.code === '23505') {
        throw new Error(
          'Hai già completato questa sfida durante questa settimana.'
        );
      }

      throw new Error(`Errore durante il salvataggio del post: ${error.message}`);
    }
  }

  async findById(id) {
    const query = `
      SELECT
        id,
        utente,
        sfida,
        descrizione,
        latitudine,
        longitudine,
        luogo,
        difficolta_attesa,
        difficolta_percepita,
        pubblicazione,
        anno_settimana,
        numero_settimana
      FROM sfida_completata
      WHERE id = $1;
    `;

    try {
      const result = await pool.query(query, [id]);
      if (result.rows.length === 0) return null;

      return new SfidaCompletata(result.rows[0]);
    } catch (error) {
      throw new Error(`Errore nel recupero del post tramite ID: ${error.message}`);
    }
  }

  async getGlobalFeed(utenteLoggatoId, limit = 10, offset = 0) {
    const query = `
      SELECT
        sc.id,
        sc.descrizione,
        sc.luogo,
        sc.difficolta_attesa AS "difficoltaAttesa",
        sc.difficolta_percepita AS "difficoltaPercepita",
        sc.pubblicazione,
        u.username AS "autoreUsername",
        u.foto AS "autoreFoto",
        s.titolo AS "titoloSfida",
        COUNT(DISTINCT lsc.utente) AS "totaleLike",
        COUNT(DISTINCT c.id) AS "totaleCommenti",
        EXISTS (
          SELECT 1
          FROM like_sfida_completata
          WHERE sfida_completata = sc.id AND utente = $1
        ) AS "messoDaMe"
      FROM sfida_completata sc
      JOIN utente u ON sc.utente = u.id
      JOIN sfida s ON sc.sfida = s.id
      LEFT JOIN like_sfida_completata lsc ON lsc.sfida_completata = sc.id
      LEFT JOIN commento c ON c.sfida_completata = sc.id
      GROUP BY sc.id, u.id, s.id
      ORDER BY sc.pubblicazione DESC
      LIMIT $2 OFFSET $3;
    `;

    try {
      const result = await pool.query(query, [utenteLoggatoId, limit, offset]);
      return result.rows;
    } catch (error) {
      throw new Error(
        `Errore nel caricamento del feed globale con interazioni: ${error.message}`
      );
    }
  }

  async hasUserCompletedChallengeInWeek(utenteId, sfidaId, isoYear, isoWeek) {
    const query = `
      SELECT 1
      FROM sfida_completata
      WHERE utente = $1
        AND sfida = $2
        AND anno_settimana = $3
        AND numero_settimana = $4
      LIMIT 1;
    `;

    try {
      const result = await pool.query(query, [
        utenteId,
        sfidaId,
        isoYear,
        isoWeek,
      ]);

      return result.rows.length > 0;
    } catch (error) {
      throw new Error(
        `Errore nella verifica del completamento della sfida: ${error.message}`
      );
    }
  }
}