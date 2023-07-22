import { BaseError, ValidationErrors } from '../../core';

export class DtoValidationApplicationError extends BaseError {
  errors?: ValidationErrors;

  constructor(entityClass: { name: string }, data: any, errors?: ValidationErrors) {
    super(
      'DtoValidationApplicationError',
      `Invalid input data for dto "${entityClass.name}".\nInput data: ${JSON.stringify(data)}.${
        errors ? `\nErrors: ${JSON.stringify(errors)}` : ''
      }`
    );

    this.errors = errors;
  }
}
