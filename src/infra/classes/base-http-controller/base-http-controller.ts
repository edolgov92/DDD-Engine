import { serverError } from '../../constants';
import { Request, Response } from '../../interfaces';
import { BaseController } from '../base-controller';

export abstract class BaseHttpController extends BaseController<Request, Response> {
  constructor() {
    super();
  }

  abstract execute(request: Request): Promise<Response>;

  async handle(request: Request): Promise<Response> {
    try {
      return super.handle(request);
    } catch (error) {
      return serverError(error);
    }
  }
}
