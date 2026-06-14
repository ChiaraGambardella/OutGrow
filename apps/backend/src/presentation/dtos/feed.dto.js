export class FeedPostResponseDto {
  constructor(post, commenti = [], media = []) {
    this.id = post.id;
    this.descrizione = post.descrizione || null;
    this.luogo = post.luogo || null; // Nome pulito del luogo (senza coordinate)
    this.difficoltaAttesa = post.difficoltaAttesa || null;
    this.difficoltaPercepita = post.difficoltaPercepita || null;
    this.pubblicazione = post.pubblicazione;
    this.titoloSfida = post.titoloSfida;
    
    // Dati dell'autore del post
    this.autore = {
      username: post.autoreUsername,
      foto: post.autoreFoto || null
    };

    // Contatori e stati per i pulsanti interattivi del frontend
    this.interazioni = {
      totaleLike: parseInt(post.totaleLike, 10) || 0,
      messoDaMe: !!post.messoDaMe, // Converte in booleano puro (true/false)
      totaleCommenti: parseInt(post.totaleCommenti, 10) || 0
    };

    // Media associati al post
    this.media = media; 

    // Lista dei commenti strutturati ad albero (Principali -> Risposte)
    this.commenti = commenti;
  }

  /**
   * Trasforma una collezione grezza di post arricchiti in un array di DTO formattati
   */
  static formatCollection(postsWithData) {
    return postsWithData.map(item => 
      new FeedPostResponseDto(item.post, item.commenti, item.media)
    );
  }
}

export class LikeToggleResponseDto {
  /**
   * Formatta la risposta dopo un'operazione di toggle del like usando i booleani
   * @param {number} postId - ID del post coinvolto
   * @param {boolean} liked - true se il like è inserito, false se rimosso
   */
  static format(postId, liked) {
    return {
      postId: parseInt(postId, 10),
      liked: liked // Semplice, pulito, booleano puro standard 🚀
    };
  }
}