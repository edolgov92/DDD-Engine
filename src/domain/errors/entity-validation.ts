import { BaseError, ValidationErrors } from '../../core';

export class EntityValidationDomainError extends BaseError {
  errors?: ValidationErrors;

  constructor(entityClass: { name: string }, data: any, errors?: ValidationErrors) {
    super(
      'EntityValidationDomainError',
      `Invalid input data for entity "${entityClass.name}".\nInput data: ${JSON.stringify(data)}.${
        errors ? `\nErrors: ${JSON.stringify(errors)}` : ''
      }`
    );

    this.errors = errors;
  }
}
