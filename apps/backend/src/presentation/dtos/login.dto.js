export class LoginDTO {
  constructor({ username, password }) {
    this.username = username ? username.trim() : undefined;
    this.password = password;
  }
}