import { BaseError } from '../../core';

export class EntityAlreadyExistsDomainError extends BaseError {
  constructor(entityClass: { name: string }, data?: any) {
    super(
      'EntityAlreadyExistsDomainError',
      `Entity "${entityClass.name}" with provided data ${
        data ? `${JSON.stringify(data)} ` : ''
      }already exists.`
    );
  }
}
