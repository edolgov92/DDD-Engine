import Validator, { Rules } from 'validatorjs';
import { Either, left, right } from '../../../core';
import { EntityValidationDomainError } from '../../errors';
import { generateEntityId } from '../../utils';

export abstract class BaseDomainEntity {
  static createValidationRules: Rules;
  static updateValidationRules: Rules;

  readonly id: string;

  constructor(prefix: string, id?: string) {
    this.id = id || generateEntityId(prefix);
  }

  static defaultCreate<E extends BaseDomainEntity, T = any>(
    props: T,
    factory: () => E,
    customValidationFunc?: (props: T) => Either<EntityValidationDomainError, void>
  ): Either<EntityValidationDomainError, E> {
    const validationResult: Either<EntityValidationDomainError, void> = BaseDomainEntity.validate(
      props,
      this.createValidationRules,
      customValidationFunc
    );
    if (validationResult.isLeft()) {
      return left(validationResult.value);
    }
    return right(factory());
  }

  protected defaultUpdate<E extends typeof BaseDomainEntity, T = any>(
    entityClass: Partial<E>,
    data: T,
    customValidationFunc?: (data: T) => Either<EntityValidationDomainError, void>
  ): Either<EntityValidationDomainError, void> {
    const validationResult: Either<EntityValidationDomainError, void> = BaseDomainEntity.validate(
      data,
      entityClass.updateValidationRules!,
      customValidationFunc
    );
    if (validationResult.isLeft()) {
      return left(validationResult.value);
    }
    Object.assign(this, data);
    return right(undefined);
  }

  private static validate<T = any>(
    data: T,
    rules: Rules,
    customValidationFunc?: (data: T) => Either<EntityValidationDomainError, void>
  ): Either<EntityValidationDomainError, void> {
    if (!rules) {
      return left(new EntityValidationDomainError(this, data, { data: ['Validation rules not provided'] }));
    }
    const validator: Validator.Validator<T> = new Validator(data, rules);
    if (validator.fails()) {
      return left(new EntityValidationDomainError(this, data, validator.errors.errors));
    }
    if (customValidationFunc) {
      const validateResult: Either<EntityValidationDomainError, void> = customValidationFunc(data);
      if (validateResult.isLeft()) {
        return left(validateResult.value);
      }
    }
    return right(undefined);
  }
}
