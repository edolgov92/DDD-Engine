import { ApplicationError } from './application-error';

export class EntityNotFoundApplicationError extends ApplicationError {
  constructor(entityClass: { name: string }, params?: string) {
    super(
      'EntityNotFoundApplicationError',
      `Entity "${entityClass.name}" was not found${params ? ` by params ${JSON.stringify(params)} ` : ''}.`
    );
  }
}
