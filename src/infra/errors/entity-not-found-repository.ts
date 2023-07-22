import { BaseError } from '../../core';

export class EntityNotFoundRepositoryError extends BaseError {
  constructor(entityClass: { name: string }, params?: any) {
    super(
      'EntityNotFoundRepositoryError',
      `Entity "${entityClass.name}" was not found in repository${
        params ? ` by params ${JSON.stringify(params)}` : ''
      }.`
    );
  }
}
