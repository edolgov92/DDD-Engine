import { BaseController } from '../classes';

export function getControllerHandler<R = any, S = any>(
  controller: BaseController
): (request: R) => Promise<S> {
  return controller.handle.bind(controller);
}
