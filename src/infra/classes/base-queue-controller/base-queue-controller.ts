import { DomainEvent } from '../../../domain';
import { BaseController } from '../base-controller';

export abstract class BaseQueueController extends BaseController<DomainEvent, void> {
  constructor() {
    super();
  }

  abstract execute(request: DomainEvent): Promise<void>;

  async handle(request: DomainEvent): Promise<void> {
    try {
      return super.handle(request);
    } catch (error) {
      this.logger.error(
        `Failed to handle domainEvent "${request.name}" with data: ${JSON.stringify(request.data)}`
      );
    }
  }
}
