export abstract class BaseError {
  readonly name: string;
  readonly message: string;
  readonly stack?: string;

  constructor(name: string, message: string, stack?: string) {
    this.name = name;
    this.message = message;
    if (stack) {
      this.stack = stack;
    }
  }
}
