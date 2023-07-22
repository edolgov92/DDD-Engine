export function getEnumValues<T>(enumType: any): T[] {
  return Object.keys(enumType).map((key: string) => enumType[key]);
}
