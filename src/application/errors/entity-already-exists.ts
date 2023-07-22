import { BaseError } from '../../core';

export class EntityAlreadyExistsApplicationError extends BaseError {
  constructor(entityClass: { name: string }, data?: any) {
    super(
      'EntityAlreadyExistsApplicationError',
      `Entity "${entityClass.name}" with provided data ${
        data ? `${JSON.stringify(data)} ` : ''
      }already exists.`
    );
  }
}
