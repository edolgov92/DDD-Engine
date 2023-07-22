# DDD-Engine

> Node.js (TypeScript) Framework for DDD (Domain-Driven Design)

- [Motivation](#motivation)
- [Domain](#motivation)

## Motivation

Facing the challenge of escalating complexity in software development, Domain-Driven Design (DDD) offers a proven solution. But, incorporating DDD principles within JavaScript and TypeScript, especially Node.js, can be daunting for developers.

DDD-Engine framework for Node.js and TypeScript is designed to:

- Simplify DDD implementation, reducing development time and errors.
- Promote Consistency across the codebase, easing navigation and team onboarding.
- Encourage Best Practices for producing maintainable, flexible, and resilient code.
- Boost Productivity by handling boilerplate code, allowing developers to focus on unique aspects of their domain.
- Provide Seamless Integration into existing workflows, bringing DDD benefits without overhauling infrastructures.

Goal is to bring the power of DDD to the Node.js and TypeScript communities, helping to create cleaner, more robust, and scalable systems.

## Domain-Driven Design

Domain-Driven Design (DDD) is a strategic approach to software development that emphasizes collaboration between domain experts and developers, promoting understanding and accuracy in modelling the business domain.

#### Key Principles:

- **Focus on Core Domain:** Prioritize understanding and implementing the unique business areas that set your system apart.
- **Model-Driven Design:** Align the software model with the business domain, allowing changes in each to reflect in the other.
- **Ubiquitous Language:** Use a shared language across all team members to describe the domain, reflected in the codebase to reduce complexity.
- **Bounded Contexts:** Divide the domain into distinct bounded contexts, each maintaining its own model and language consistency.

#### Layers of DDD:

- **Domain Layer:** Contains business logic and types, encapsulating the core rules and processes of the business.
- **Application Layer:** Coordinates high-level activities and use cases, delegating to the domain layer for domain-specific operations.
- **Infrastructure Layer:** Provides generic technical capabilities to support higher layers, such as database access, UI components, messaging, etc.

In DDD, these principles and layers work together to create software that accurately reflects the business domain, thereby producing more maintainable, scalable, and flexible systems.

## Possible Project structure

```
## App Shared // Library shared between backend and frontend
- constants // constants to share
- dto // shared dto models for REST and WebSocket communication
- enums // enums to share
- interfaces // interfaces to share
- utils // utils to share
...

--------------------------------------------

## Service Shared // library shared between different backend microservices
- events // domain events transmitted via queue
- shared-entities // common entities used across multiple microservices
- utils // any utils that are common to all backend services
...

--------------------------------------------

## Service // Backend service
- application
  - dto
    - mapping-schemes // schemes to map entities to dto models
    - models // dto models for this service, inputs to use-cases etc.
  - use-cases // application logic
  ...

- domain
  - entities // main domain entities related to this service and aggregates (groups of entities and value objects that can be treated as a single unit)
  - enums
    - entity-prefixes.ts
    ...
  - events // domain events used in this service
  - gateways // abstract interfaces for gateways to external API's
  - repositories // abstract interfaces for data repositories
  - value-objects // encapsulates characteristics of domain model, small objects, like money or a date range, defined by their value, not their identity

- infra
  - repositories // different implementation of data repositories
    - in-memory
    - postgres
    ...
  - gateways // different implementation of gateways to external API's
  - http
    - controllers // logic to handle HTTP requests, calls to use-cases
  - queue
    - controllers // logic to handle Queue events, calls to use-cases

- main
  - config
  - http
    - routes // HTTP routes (REST API), calls to controllers
  - queue
    - subscriptions // subscriptions to Queue events, calls to controllers
```

## Domain

#### Defining domain entities

```
// domain/enums/entity-prefixes.ts
export enum EntityPrefix {
  User = 'usr',
  UserSession = 'uss',
}
```

```
// domain/entities/user/user.ts

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
```

```
// domain/entities/user/user-session.ts

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
```

#### Create domain entity

```
const createUserResult: Either<EntityValidationDomainError, User> = User.create({
  name: 'Eugene'
});
if (createUserResult.isLeft()) {
  this.logger.debug(createUserResult.value); // value is instance of EntityValidationDomainError
  return left(createUserResult.value);
}
const user: User = createUserResult.value;
```

#### Create domain entity without validation

In some cases it can be required in initializing domain entities from repository data

```
const user: User = User.createWithoutValidation({ name: 'Eugene' });
```

#### Add nested domain entity

```
...
const user: User = createUserResult.value;
...
const userSession: UserSession = createUserSessionResult.value;

const addUserSessionResult: Either<EntityAlreadyExistsDomainError, void> = user.addUserSession(userSession);
if (addUserSessionResult.isLeft()) {
  return left(addUserSessionResult.value);
}
```

#### Update domain entity

```
...
const user: User = createUserResult.value;
const userUpdateResult: Either<EntityValidationDomainError, void> = user.update({ name: 'David' });
if (userUpdateResult.isLeft()) {
  return left(userUpdateResult.value);
}
```
