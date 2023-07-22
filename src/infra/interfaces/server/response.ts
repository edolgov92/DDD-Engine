export type Response<T = any> = {
  statusCode: number;
  body?: T;
};

export type ErrorResponse = {
  error?: Error;
  errorCode?: string;
}
