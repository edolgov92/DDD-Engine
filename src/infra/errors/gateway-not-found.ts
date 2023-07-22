import { InfraError } from './infra-error';

export class GatewayNotFoundInfraError extends InfraError {
  constructor(gatewayName: string, ref: string) {
    super('GatewayNotFoundError', `Gateway "${gatewayName}" not found for ref "${ref}".`);
  }
}
