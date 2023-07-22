import { ServerError } from '../errors';
import { ErrorResponse, Response } from '../interfaces';

export const ok = <T = any>(body: T): Response<T> => ({
  statusCode: 200,
  body,
});

export const noContent = (): Response => ({
  statusCode: 204,
});

export const badRequest = (error: Error, errorCode?: string): Response<ErrorResponse> => ({
  statusCode: 400,
  body: {
    error,
    errorCode,
  },
});

export const unauthorized = (error: Error): Response<ErrorResponse> => ({
  statusCode: 401,
  body: {
    error,
  },
});

export const forbidden = (error: Error, errorCode?: string): Response<ErrorResponse> => ({
  statusCode: 403,
  body: {
    error,
    errorCode,
  },
});

export const notFound = (error: Error, errorCode?: string): Response<ErrorResponse> => ({
  statusCode: 404,
  body: {
    error,
    errorCode,
  },
});

export const conflict = (error: Error, errorCode?: string): Response<ErrorResponse> => ({
  statusCode: 409,
  body: {
    error,
    errorCode,
  },
});

export const serverError = (error?: Error | unknown, errorCode?: string): Response<ErrorResponse> => {
  const stack = error instanceof Error ? error.stack : undefined;
  return {
    statusCode: 500,
    body: {
      error: new ServerError(stack),
      errorCode,
    },
  };
};
