import { InfraError } from './infra-error';

export class EntityNotFoundRepositoryError extends InfraError {
  constructor(entityClass: { name: string }, params?: any) {
    super(
      'EntityNotFoundRepositoryError',
      `Entity "${entityClass.name}" was not found in repository${
        params ? ` by params ${JSON.stringify(params)}` : ''
      }.`
    );
  }
}
