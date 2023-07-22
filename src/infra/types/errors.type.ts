import { DataNotFoundGatewayError, GatewayNotAvailableError } from '../errors';

export type GatewayAvailabilityAndDataErrors = GatewayNotAvailableError | DataNotFoundGatewayError;
