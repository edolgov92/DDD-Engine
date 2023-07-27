export type ListResponse<T, PropertyName extends string> = {
  currentPage: number,
  totalPage: number,
} & { [P in PropertyName]: T[] }
