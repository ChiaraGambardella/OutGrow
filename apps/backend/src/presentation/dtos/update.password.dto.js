export class UpdatePasswordDto {
  /**
   * @param {Object} data 
   * @param {string} data.oldPassword 
   * @param {string} data.newPassword 
   */
  constructor({ oldPassword, newPassword }) {
    this.oldPassword = oldPassword;
    this.newPassword = newPassword;
  }

  /**
   * Crea un DTO a partire dal body della richiesta filtrando i campi superflui
   */
  static fromRequest(body) {
    return new UpdatePasswordDto({
      oldPassword: body.oldPassword,
      newPassword: body.newPassword
    });
  }
}