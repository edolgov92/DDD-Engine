import { MappingFunction } from '../types';
import { MappingScheme } from './MappingScheme';

export interface MappingParams {
  fieldName: string;
  mapping?: MappingFunction | MappingScheme | [MappingScheme];
}
