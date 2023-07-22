import { Rules } from 'validatorjs';
import { Either, getEqualFieldsList, left, right } from '../../../src/core';
import {
  BaseDomainEntity,
  EntityAlreadyExistsDomainError,
  EntityValidationDomainError,
} from '../../../src/domain';

enum EntityPrefix {
  User = 'usr',
  UserSession = 'uss',
}

export interface UserProps {
  id?: string;
  name: string;
  userSessions?: UserSession[];
}

export class User extends BaseDomainEntity {
  readonly name: string;

  static readonly createValidationRules: Rules = {
    id: ['string', 'between:3,30'],
    name: ['required', 'string', 'between:3,30'],
    userSessions: ['array'],
  };

  static readonly updateValidationRules: Rules = {
    name: ['string', 'between:3,30'],
    userSessions: ['array'],
  };

  private userSessionEntities: UserSession[];

  protected constructor(props: UserProps) {
    super(EntityPrefix.User, props.id);

    this.name = props.name;
    this.userSessionEntities = props.userSessions || [];
  }

  get userSessions(): UserSession[] {
    return this.userSessionEntities;
  }

  private set userSessions(value: UserSession[]) {
    this.userSessionEntities = value;
  }

  static create(props: UserProps): Either<EntityValidationDomainError, User> {
    return this.defaultCreate(props, () => new User(props));
  }

  static createWithoutValidation(props: UserProps): User {
    return new User(props);
  }

  update(props: Omit<Partial<UserProps>, 'id'>): Either<EntityValidationDomainError, void> {
    return this.defaultUpdate(User, props);
  }

  addUserSession(entity: UserSession): Either<EntityAlreadyExistsDomainError, void> {
    const existingEntity: UserSession | undefined = this.userSessionEntities.find(
      (item: UserSession) => item.id === entity.id
    );
    if (existingEntity) {
      return left(
        new EntityAlreadyExistsDomainError(
          UserSession,
          getEqualFieldsList<UserSession>(entity, existingEntity, ['id'])
        )
      );
    }
    this.userSessions.push(entity);
    return right(undefined);
  }
}

export interface UserSessionProps {
  id?: string;
  startDateTime: Date;
  expired?: boolean;
}

export class UserSession extends BaseDomainEntity {
  readonly startDateTime: Date;
  readonly expired?: boolean;

  static readonly createValidationRules: Rules = {
    id: ['string', 'between:3,30'],
    startDateTime: ['required', 'date'],
    expired: ['boolean'],
  };

  static readonly updateValidationRules: Rules = {
    expired: ['boolean'],
  };

  private constructor(props: UserSessionProps) {
    super(EntityPrefix.UserSession, props.id);

    this.startDateTime = props.startDateTime;
    this.expired = props.expired;
  }

  static create(props: UserSessionProps): Either<EntityValidationDomainError, UserSession> {
    return this.defaultCreate(props, () => new UserSession(props));
  }

  static createWithoutValidation(props: UserSessionProps): UserSession {
    return new UserSession(props);
  }

  update(
    props: Omit<Partial<UserSessionProps>, 'id' | 'startDateTime'>
  ): Either<EntityValidationDomainError, void> {
    return this.defaultUpdate(UserSession, props);
  }
}

describe('BaseDomainEntity', () => {
  test('should create domain entity', () => {
    const name: string = 'Eugene';
    const createUserResult: Either<EntityValidationDomainError, User> = User.create({
      name,
    });
    expect(createUserResult.isRight()).toBeTruthy();
    const user: User = createUserResult.value as User;
    expect(user.id).toBeDefined();
    expect(user.name).toBe(name);
  });

  test('should return validation errors during creation in case domain entity props has invalid values', () => {
    const name: string = '';
    const createUserResult: Either<EntityValidationDomainError, User> = User.create({
      name,
    });
    expect(createUserResult.isLeft()).toBeTruthy();
    expect(createUserResult.value).toBeInstanceOf(EntityValidationDomainError);
    const error: EntityValidationDomainError = createUserResult.value as EntityValidationDomainError;
    expect(error.name).toBe(EntityValidationDomainError.name);
    expect(error.message).toBeDefined();
    expect(error.errors).toBeDefined();
    expect(error.errors!.name).toBeDefined();
  });

  test('should create domain entity without validation', () => {
    const name: string = 'Eugene';
    const user: User = User.createWithoutValidation({ name });
    expect(user.id).toBeDefined();
    expect(user.name).toBe(name);
  });

  test('should add nested domain entity', () => {
    const name: string = 'Eugene';
    const user: User = User.createWithoutValidation({ name });
    const userSession: UserSession = UserSession.createWithoutValidation({ startDateTime: new Date() });
    const addUserSessionResult: Either<EntityAlreadyExistsDomainError, void> =
      user.addUserSession(userSession);
    expect(addUserSessionResult.isRight()).toBeTruthy();
    expect(user.userSessions).toBeDefined();
    expect(Array.isArray(user.userSessions)).toBeTruthy();
    expect(user.userSessions.length).toBe(1);
    expect(user.userSessions[0]).toBe(userSession);
  });

  test('should update domain entity', () => {
    const name: string = 'Eugene';
    const user: User = User.createWithoutValidation({ name });
    expect(user.id).toBeDefined();
    expect(user.name).toBe(name);
    const newName: string = 'Eugene2';
    const userUpdateResult: Either<EntityValidationDomainError, void> = user.update({ name: newName });
    expect(userUpdateResult.isRight()).toBeTruthy();
    expect(user.name).toBe(newName);
  });

  test('should return validation errors during update in case update data has invalid values', () => {
    const name: string = 'Eugene';
    const user: User = User.createWithoutValidation({ name });
    expect(user.name).toBe(name);
    const newName: string = 'E';
    const updateUserResult: Either<EntityValidationDomainError, void> = user.update({ name: newName });
    expect(updateUserResult.isLeft()).toBeTruthy();
    expect(updateUserResult.value).toBeInstanceOf(EntityValidationDomainError);
    const error: EntityValidationDomainError = updateUserResult.value as EntityValidationDomainError;
    expect(error.name).toBe(EntityValidationDomainError.name);
    expect(error.message).toBeDefined();
    expect(error.errors).toBeDefined();
    expect(error.errors!.name).toBeDefined();
  });
});
