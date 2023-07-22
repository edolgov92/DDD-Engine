import { UseCase } from '../../../application';
import { Either, parseObjectDates, WithLogger } from '../../../core';

export abstract class BaseController<R = any, S = any> extends WithLogger {
  constructor() {
    super();
  }

  abstract execute(request: R): Promise<S>;

  async executeUseCase<K = any, T = any, E = any>(
    useCase: UseCase<K | undefined, Either<E, T>>,
    input?: K
  ): Promise<Either<E, T>> {
    const result: Either<any, T> = await useCase.execute(input);
    if (result.isLeft()) {
      this.logger.error(
        `Use case execution failed: ${result.value}`,
        useCase.constructor.name || this.constructor.name
      );
    }
    return result;
  }

  async handle(request: R): Promise<S> {
    try {
      parseObjectDates(request);
    } catch (ex) {}
    const result: S = await this.execute(request);
    try {
      parseObjectDates(result);
    } catch (ex) {}
    return result;
  }
}
