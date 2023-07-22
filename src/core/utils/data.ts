import { parseObjectDates } from './date-time';

export function cloneJson<T = any>(data: T): T {
  const newData: T = JSON.parse(JSON.stringify(data));
  parseObjectDates(newData);
  return newData;
}

export function getEqualFieldsList<T = any, K = any>(
  object1: {},
  object2: {},
  fields: Array<keyof (T | K)>
): string[] {
  const equalFields: string[] = [];
  if (
    !object1 ||
    !object2 ||
    typeof object1 !== 'object' ||
    typeof object2 !== 'object' ||
    !fields ||
    !fields.length
  ) {
    return equalFields;
  }
  fields.forEach((field: keyof (T | K)) => {
    if (object1[field as keyof {}] === object2[field as keyof {}]) {
      equalFields.push(field as string);
    }
  });
  return equalFields;
}
