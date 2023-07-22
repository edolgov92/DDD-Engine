import Validator, { Rules } from 'validatorjs';
import { Either, left, right } from '../../../core';
import { EntityValidationDomainError } from '../../errors';
import { generateEntityId } from '../../utils';

interface Constructable<T> {
  new (...args: any[]): T;
  createValidationRules: Rules;
  updateValidationRules: Rules;
}

export class BaseDomainEntity {
  static createValidationRules: Rules;
  static updateValidationRules: Rules;

  readonly id: string;

  constructor(prefix: string, id?: string) {
    this.id = id || generateEntityId(prefix);
  }

  static defaultCreate<T extends BaseDomainEntity>(
    entityClass: Constructable<T>,
    props: any,
    customValidationFunc?: (props: any) => Either<EntityValidationDomainError, void>
  ): Either<EntityValidationDomainError, InstanceType<typeof entityClass>> {
    const validationResult: Either<EntityValidationDomainError, void> = BaseDomainEntity.validate(
      entityClass,
      props,
      entityClass.createValidationRules,
      customValidationFunc
    );
    if (validationResult.isLeft()) {
      return left(validationResult.value);
    }
    return right(new entityClass(props));
  }

  static defaultCreateWithoutValidation<T extends BaseDomainEntity>(
    entityClass: Constructable<T>,
    props: any
  ): InstanceType<typeof entityClass> {
    return new entityClass(props) as InstanceType<typeof entityClass>;
  }

  protected defaultUpdate<T extends BaseDomainEntity>(
    entityClass: Constructable<T>,
    data: Partial<T>,
    customValidationFunc?: (data: Partial<T>) => Either<EntityValidationDomainError, void>
  ): Either<EntityValidationDomainError, void> {
    const validationResult: Either<EntityValidationDomainError, void> = BaseDomainEntity.validate(
      entityClass,
      data,
      entityClass.updateValidationRules,
      customValidationFunc
    );
    if (validationResult.isLeft()) {
      return left(validationResult.value);
    }
    Object.assign(this, data);
    return right(undefined);
  }

  private static validate<T = any>(
    entityClass: Constructable<T>,
    data: any,
    rules: Rules,
    customValidationFunc?: (props: any) => Either<EntityValidationDomainError, void>
  ): Either<EntityValidationDomainError, void> {
    const validator: Validator.Validator<any> = new Validator(data, rules);
    if (validator.fails()) {
      return left(new EntityValidationDomainError(entityClass, data, validator.errors.errors));
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
