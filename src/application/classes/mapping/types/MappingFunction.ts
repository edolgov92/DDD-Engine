import { Either } from '../../../../core';
import { MappingError } from '../errors';

export type MappingFunction<T = any, D = any, S = any> = (
  data: MappingFunctionData<T, S>
) => Either<MappingError, D>;
export type MappingFunctionData<T = any, S = any> = { value?: T; self: S };
