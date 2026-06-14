export class UpdatePreferencesDto {
  constructor({ sfide, progressi, social }) {
    this.sfide = sfide;
    this.progressi = progressi;
    this.social = social;
  }

  /**
   * Mappa il body validato della richiesta nel DTO
   */
  static fromRequest(body) {
    return new UpdatePreferencesDto({
      sfide: body.sfide,
      progressi: body.progressi,
      social: body.social
    });
  }
}