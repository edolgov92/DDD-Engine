import { ApplicationError } from './application-error';

export class EntityAlreadyExistsApplicationError extends ApplicationError {
  constructor(entityClass: { name: string }, data?: any) {
    super(
      'EntityAlreadyExistsApplicationError',
      `Entity "${entityClass.name}" with provided data ${
        data ? `${JSON.stringify(data)} ` : ''
      }already exists.`
    );
  }
}
