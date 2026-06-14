export class UtenteProfiloDto {
  constructor(utente, badges) {
    this.id = utente.id;
    this.nome = utente.nome;
    this.cognome = utente.cognome;
    this.username = utente.username;
    this.foto = utente.foto;
    this.copertina = utente.copertina;
    
    // Mappiamo i badge mantenendo la struttura pulita restituita dalla repository
    this.badges = badges.map(b => ({
      id: b.id,
      titolo: b.titolo,
      immagine: b.immagine,
      ottenimento: b.ottenimento
    }));

    // Come da accordi, la logica dell'albero dei post verrà integrata successivamente
    this.posts = []; 
  }

  /**
   * Metodo statico di utilità per creare il DTO partendo dalle entità/dati grezzi
   */
  static toPresentation(utente, badges) {
    return new UtenteProfiloDto(utente, badges);
  }
}