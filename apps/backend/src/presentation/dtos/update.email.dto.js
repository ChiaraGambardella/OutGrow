export class UpdateEmailDto {
  /**
   * @param {Object} data 
   * @param {string} data.email 
   */
  constructor({ email }) {
    this.email = email ? email.trim().toLowerCase() : '';
  }

  /**
   * Crea un DTO a partire dal body della richiesta filtrando i campi superflui
   */
  static fromRequest(body) {
    return new UpdateEmailDto({
      email: body.email
    });
  }
}