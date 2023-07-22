import { DomainError } from './domain-error';

export class EntityAlreadyExistsDomainError extends DomainError {
  constructor(entityClass: { name: string }, data?: any) {
    super(
      'EntityAlreadyExistsDomainError',
      `Entity "${entityClass.name}" with provided data ${
        data ? `${JSON.stringify(data)} ` : ''
      }already exists.`
    );
  }
}
