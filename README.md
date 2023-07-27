# DDD-Engine

> Node.js (TypeScript) Framework and guides for DDD (Domain-Driven Design) and Clean Architecture

- [Motivation](#motivation)
- [Possible Project Structure](#possible-project-structure)
- [Domain](#domain)
- [Repositories](#repositories)
- [Gateways](#gateways)
- [Use Cases](#use-cases)

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

```ts
// domain/enums/entity-prefixes.ts
export enum EntityPrefix {
  User = 'usr',
  UserSession = 'uss',
}
```

```ts
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

```ts
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

```ts
const createUserResult: Either<EntityValidationDomainError, User> = User.create({
  name: 'Eugene',
});
if (createUserResult.isLeft()) {
  this.logger.debug(createUserResult.value); // value is instance of EntityValidationDomainError
  return left(createUserResult.value);
}
const user: User = createUserResult.value;
```

#### Create domain entity without validation

In some cases it can be required in initializing domain entities from repository data

```ts
const user: User = User.createWithoutValidation({ name: 'Eugene' });
```

#### Add nested domain entity

```ts
...
const user: User = createUserResult.value;
...
const userSession: UserSession = createUserSessionResult.value;

const addUserSessionResult: Either<EntityAlreadyExistsDomainError, void> =
  user.addUserSession(userSession);
if (addUserSessionResult.isLeft()) {
  return left(addUserSessionResult.value);
}
```

#### Update domain entity

```ts
...
const user: User = createUserResult.value;
const userUpdateResult: Either<EntityValidationDomainError, void> =
  user.update({ name: 'David' });
if (userUpdateResult.isLeft()) {
  return left(userUpdateResult.value);
}
```

## Repositories

Repositories centralize common data access functionalities. They provide methods to retrieve domain entities and encapsulate the specifics of dealing with data sources, creating a bridge between the domain model and the persistent data storage.

The Domain layer is responsible for defining repository interfaces, ensuring a level of abstraction that keeps it technologically agnostic. The Application layer interacts with these interfaces, oblivious to the specifics of their implementations, as it orchestrates the core business logic.

The task of implementing these interfaces falls on the Infrastructure layer, utilizing a range of technologies as per requirements. It could employ InMemory, Postgres, MongoDB with Redis caching, or even a Time-series database, catering to specific scenarios, like time-sensitive financial data processing.

This design fosters a flexible and resilient architecture, enabling seamless technology interchangeability. It further optimizes the matching of specific use-cases to the most appropriate technologies, enhancing the system's overall adaptability and efficiency.

#### Defining repository interface

```ts
// domain/repositories/interfaces/user-repository.ts

import { Uset } from '../../entities';

export interface UserRepository {
  getById(id: string): Promise<Either<EntityNotFoundRepositoryError, User>>;
  getList(): Promise<User[]>;
  save(entity: User): Promise<void>;
  saveList(entities: User[]): Promise<void>;
  deleteById(id: string): Promise<Either<EntityNotFoundRepositoryError, void>>;
  ...
}
```

#### Implementing repository interface

```ts
// infra/repositories/in-memory/user-in-memory-repository.ts

import { BaseRepository } from 'ddd-engine';
import { User, UserRepository } from '../../../../domain';

export class UserInMemoryRepository extends BaseRepository implements UserRepository {
  private entities: User[] = [];

  async getById(id: string): Promise<Either<EntityNotFoundRepositoryError, User>> {
    const entity: User | undefined = this.entities.find((item: User) => item.id === id);
    if (!entity) {
      return left(new EntityNotFoundRepositoryError(User));
    }
    return right(entity);
  }

  ...

  async save(entity: User): Promise<void> {
    const existingEntity: User | undefined = this.entities.find(
      (item: User) => item === entity || item.id === entity.id
    );
    if (existingEntity) {
      if (entity !== existingEntity) {
        Object.assign(existingEntity, entity);
      }
    } else {
      this.entities.push(entity);
    }
  }

  ...
}
```

## Gateways

While Repositories deal primarily with internal data access and storage mechanisms, Gateways are designed to handle interactions with external data providers. In the context of a microservices architecture, Gateways not only interact with third-party APIs, but they also enable seamless communication with APIs of other services within the application ecosystem.

Gateways interfaces, similar to Repositories, are primarily defined in the Domain layer. The Application layer communicates with these Gateway interfaces, remaining indifferent to their detailed implementation. The Infrastructure layer shoulders the responsibility of implementing these Gateways, which can differ based on the specifics of the external service. The implementation may correspond to a cloud-based data source, WebSocket, REST API, even Fake / In-Memory implementation, amongst other possibilities.

#### Defining gateway interface

```ts
// domain/gateways/interfaces/user-wallet-gateway.ts

import { GatewayAvailabilityAndDataErrors } from 'ddd-engine';
import { Subject } from 'rxjs';
import { UsetWalletDto } from 'your-shared-lib';

export interface UserWalletGateway {
  getByUserId(userId: string): Promise<Either<GatewayAvailabilityAndDataErrors, UserWalletDto>>;
  subscribeToUserBalanceChanges(userId): Promise<Either<GatewayAvailabilityAndDataErrors, Subject<number>>>; // WebSocket communication
  ...
}
```

#### Implementing gateway interface

```ts
// infra/gateways/external/user-wallet-external-gateway.ts

import { BaseGateway } from 'ddd-engine';
import { Subject } from 'rxjs';
import { UsetWalletDto } from 'your-shared-lib';
import { UserWalletGateway } from '../../../../domain';

export class UserWalletExternalGateway extends BaseGateway implements UserWalletGateway {
  constructor(private apiUrl: string) {
    super();
  }

  async getByUserId(userId: string): Promise<Either<GatewayAvailabilityAndDataErrors, UserWalletDto>> {
    // Do API call
  }

  async subscribeToUserBalanceChanges(
    userId
  ): Promise<Either<GatewayAvailabilityAndDataErrors, Subject<number>>> {
    // Subscribe to WebSocket
  }
}
```

## Use Cases

Use Cases embody specific business operations. These are defined in the Application layer and encapsulate the logic needed to orchestrate domain objects (Entities and Value Objects) and infrastructure components (Repositories and Gateways) to fulfill the business requirements. Use Cases ensure the application's business rules and policies are consistently applied, fostering an architecture where the business logic is distinctly separate from the infrastructure and interface concerns.

## Implementing Use Case

```ts
// application/use-cases/user/get-user-by-id.ts

import { inject, injectable } from 'tsyringe';
import Validator, { Rules } from 'validatorjs';
import { UserDto } from 'your-shared-lib';
import { User, UserRepositoryToken } from '../../../domain';
import {
  BaseUseCase,
  DtoValidationApplicationError,
  Either,
  EntityNotFoundRepositoryError,
  left,
  Mapper,
  MappingError,
  right,
  UseCase,
} from '../../../src';
import { UserDtoMappingScheme } from '../../dto';

import type { UserRepository } from '../../../domain';

export type GetUserByIdInputDto = {
  id: string;
};

export type GetUserByIdOutputDto = Either<
  DtoValidationApplicationError | EntityNotFoundRepositoryError | MappingError,
  UserDto[]
>;

const VALIDATION_RULES: Rules = {
  id: ['string', 'between:3,30'],
};

@injectable()
export class GetUserById extends BaseUseCase implements UseCase<GetUserByIdInputDto, GetUserByIdOutputDto> {
  constructor(@inject(UserRepositoryToken) private readonly userRepository: UserRepository) {
    super();
  }

  async execute(input: GetUserByIdInputDto): Promise<GetUserByIdOutputDto> {
    // Validate input data
    const validator: Validator.Validator<GetUserByIdInputDto> = new Validator(input, VALIDATION_RULES);
    if (validator.fails()) {
      return left(new DtoValidationApplicationError(GetUserById, input, validator.errors.errors));
    }

    // Call repository method to get data
    const getUserResult: Either<EntityNotFoundRepositoryError, User[]> = await this.userRepository.getById(
      input.id
    );
    if (getUserResult.isLeft()) {
      return left(getUserResult.value);
    }
    const user: User = getUserResult.value;

    // We don't return domain entity, we are mapping to DTO model
    const userMappingResult: Either<MappingError, UserDto> = Mapper.map(user, UserDtoMappingScheme);
    if (userMappingResult.isLeft()) {
      return left(userMappingResult.value);
    }
    const userDto: UserDto = userMappingResult.value;

    return right(userDto);
  }
}
```

## Controllers

In the context of Domain-Driven Design (DDD) and Clean Architecture, Controllers take on a multifaceted role as part of Infrastructure level. They act as the first point of contact for a variety of incoming requests, whether they originate from client interactions, inter-service communications in a microservices architecture, or system-generated events such as timers or schedulers.

Controllers parse incoming data, delegate the requests to the appropriate Use Cases, and ensure a well-coordinated response. They decouple the input handling mechanism from the core business logic, acting as orchestrators that guide the interactions between the system's external interfaces and its core business operations. This pivotal role aids in maintaining the system's scalability and adaptability while ensuring the consistent application of the system's business rules and policies.

## Implementing Controller

```ts
import {
  badRequest,
  BaseHttpController,
  DtoValidationApplicationError,
  EntityNotFoundRepositoryError,
  ErrorResponse,
  MappingError,
  notFound,
  ok,
  Request as HttpRequest,
  Response as HttpResponse,
  serverError,
  UserDto,
} from 'ddd-engine';
import { autoInjectable, injectable } from 'tsyringe';
import { GetUserById, GetUserByIdOutputDto } from '../../../../application';

export namespace GetUserByIdController {
  export type Request = HttpRequest<void, { userId: string }>;
  export type Response = HttpResponse<UserDto | ErrorResponse>;
}

@injectable()
@autoInjectable()
export class GetUserByIdController extends BaseHttpController {
  constructor(private readonly getUserById: GetUserById) {
    super();
  }

  // For REST API it is httpRequest, but can be other data type depending on controller purpose
  async execute(httpRequest: GetUserByIdController.Request): Promise<GetUserByIdController.Response> {
    const result: GetUserByIdOutputDto = await this.executeUseCase(this.getUserById, {
      id: httpRequest.params!.userId,
    });

    if (result.isLeft()) {
      const error: Error = result.value;

      switch (error.constructor) {
        case DtoValidationApplicationError:
          return badRequest(error);
        case EntityNotFoundRepositoryError:
          return notFound(error);
        case MappingError:
        default:
          return serverError(error);
      }
    }

    return ok(result.value);
  }
}
```
