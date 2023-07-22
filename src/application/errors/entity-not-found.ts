import { BaseError } from '../../core';

export class EntityNotFoundApplicationError extends BaseError {
  constructor(entityClass: { name: string }, params?: string) {
    super(
      'EntityNotFoundApplicationError',
      `Entity "${entityClass.name}" was not found${params ? ` by params ${JSON.stringify(params)} ` : ''}.`
    );
  }
}
