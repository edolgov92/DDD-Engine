import * as shortUUID from 'short-uuid';

export function getEntityId(prefix: string, id: string): string {
  return `${prefix}_${id}`;
}

export function generateEntityId(prefix: string): string {
  return getEntityId(prefix, shortUUID.generate());
}
