export class RegisterDto {
  constructor({ name, surname, email, birthDate, username, password, confirmPassword, acceptTerms }) {
    this.name = name ? name.trim() : undefined;
    this.surname = surname ? surname.trim() : undefined;
    this.email = email ? email.trim().toLowerCase() : undefined;
    this.birthDate = birthDate;
    this.username = username ? username.trim() : undefined;
    this.password = password;
    this.confirmPassword = confirmPassword;
    this.acceptTerms = acceptTerms;
  }

  /**
   * Converte i dati validati dal formato Frontend/Zod (camelCase)
   * al formato puro dell'entità del Dominio (snake_case).
   */
  toEntityData() {
    return {
      nome: this.name,
      cognome: this.surname,
      email: this.email,
      password: this.password, // Sarà hashata dal Service
      username: this.username,
      data_di_nascita: this.birthDate,
      foto: null,       // Default in registrazione step 2
      copertina: null,   // Default in registrazione step 2
      admin: false       // Default di sicurezza
    };
  }
}