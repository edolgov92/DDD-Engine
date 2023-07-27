import { MappingFunction } from '../types';
import { MappingParams } from './MappingParams';

export interface MappingScheme {
  [key: string]: 'ignore' | MappingFunction | MappingScheme | [MappingScheme] | MappingParams;
}
