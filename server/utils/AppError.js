// A simple error type that carries an HTTP status code, e.g. throw new AppError('Not allowed', 403).
export default class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}
