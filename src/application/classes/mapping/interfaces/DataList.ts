export interface DataList<T> {
  nodes?: T[];
  totalCount?: number;
  pageInfo?: PageInfo;
}

export interface PageInfo {
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}
