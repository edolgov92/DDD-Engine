export class DomainError extends Error {
  name: string;

  constructor(name: string, message: string, stack?: string) {
    super(message);
    this.name = name;
    this.stack = stack;
  }
}
