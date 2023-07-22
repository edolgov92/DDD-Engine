import { IncomingMessage } from 'http';
import { Either } from '../../../../core';
import { ResponseType } from '../types';

export interface HttpServiceParametersInterface {
  baseUrl?: string;
  headers?: { [key: string]: string };
  params?: HttpParams;
  rateLimit?: {
    intervalSeconds: number;
    requests: number;
  };
  retries?: number;
  timeout?: number;
  urlParams?: HttpParams;
}

export interface HttpParams {
  [key: string]: string | number;
}

export interface HttpHeaders {
  [key: string]: string | number;
}

export interface HttpService {
  clone(params?: HttpServiceParametersInterface): HttpService;
  updateParams(params: HttpServiceParametersInterface): void;
  getData<T = any>(baseUrl: string, config?: HttpRequestConfig): Promise<Either<HttpError<T>, T>>;
  get<T = any>(url: string, config?: HttpRequestConfig): Promise<Either<HttpError<T>, HttpResponse<T>>>;
  getStream(
    url: string,
    config?: HttpRequestConfig
  ): Promise<Either<HttpError, HttpResponse<IncomingMessage>>>;
  delete<T = any>(url: string, config?: HttpRequestConfig): Promise<Either<HttpError<T>, HttpResponse<T>>>;
  head<T = any>(url: string, config?: HttpRequestConfig): Promise<Either<HttpError<T>, HttpResponse<T>>>;
  post<T = any>(
    url: string,
    data?: unknown,
    config?: HttpRequestConfig
  ): Promise<Either<HttpError<T>, HttpResponse<T>>>;
  put<T = any>(
    url: string,
    data?: unknown,
    config?: HttpRequestConfig
  ): Promise<Either<HttpError<T>, HttpResponse<T>>>;
  patch<T = any>(
    url: string,
    data?: unknown,
    config?: HttpRequestConfig
  ): Promise<Either<HttpError<T>, HttpResponse<T>>>;
  getUrlWithParams(url: string, params?: HttpParams): string;
}

export interface HttpRequestConfig {
  headers?: HttpHeaders;
  params?: HttpParams;
  responseType?: ResponseType;
  urlParams?: HttpParams;
}

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText?: string;
  headers: HttpHeaders;
}

export interface HttpError<T = any> {
  message: string;
  response: HttpResponse<T>;
}
