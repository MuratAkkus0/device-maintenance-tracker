// Thrown by services/controllers for well-understood, safe-to-show client
// errors (404 not found, 409 conflict, ...). errorHandler only forwards the
// message to the response when `expose` is true; anything else becomes a
// generic 500 so internal details never leak.
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.expose = true;
  }
}

export const notFound = (message) => new HttpError(404, message);
export const conflict = (message) => new HttpError(409, message);
export const badRequest = (message) => new HttpError(400, message);
export const unauthorized = (message) => new HttpError(401, message);
export const forbidden = (message) => new HttpError(403, message);
