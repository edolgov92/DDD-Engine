import { MappingScheme } from '../interfaces';

export class MappingError extends Error {
  name: string;

  constructor(reason: string, data: any, scheme: MappingScheme) {
    super(`Failed to map data. Reason: '${reason}'\nData: ${JSON.stringify(data)}\nScheme: ${scheme}`);

    this.name = 'MappingError';
  }
}
