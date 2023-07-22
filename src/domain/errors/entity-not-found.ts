import { DomainError } from './domain-error';

export class EntityNotFoundDomainError extends DomainError {
  constructor(entityClass: { name: string }, params?: any) {
    super(
      'EntityNotFoundDomainError',
      `Entity "${entityClass.name}" was not found${params ? ` by params ${JSON.stringify(params)} ` : ''}.`
    );
  }
}
