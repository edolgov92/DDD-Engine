import { BaseError } from '../../core';

export class EntityNotFoundDomainError extends BaseError {
  constructor(entityClass: { name: string }, params?: any) {
    super(
      'EntityNotFoundDomainError',
      `Entity "${entityClass.name}" was not found${params ? ` by params ${JSON.stringify(params)} ` : ''}.`
    );
  }
}
