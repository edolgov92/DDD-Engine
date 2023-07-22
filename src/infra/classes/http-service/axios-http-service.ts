import retry from 'async-retry';
import Axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, Method } from 'axios';
import { IncomingMessage } from 'http';
import { Either, left, parseObjectDates, right } from '../../../core';
import {
  HttpError,
  HttpParams,
  HttpRequestConfig,
  HttpResponse,
  HttpService,
  HttpServiceParametersInterface,
} from './interfaces';

const RateLimiter: (ms: number) => () => Promise<void> = require('promise-ratelimit');

export class AxiosHttpService implements HttpService {
  private client: AxiosInstance = Axios.create();
  private rateLimiter?: () => Promise<void>;

  constructor(protected params?: HttpServiceParametersInterface) {
    this.params = params || {};

    if (this.params.rateLimit) {
      this.initRateLimiter();
    }
    if (this.params.timeout === undefined) {
      this.params.timeout = 20000;
    }
    if (this.params.retries === undefined) {
      this.params.retries = 2;
    }
  }

  clone(params?: HttpServiceParametersInterface): HttpService {
    params = params || {};
    return new AxiosHttpService({ ...this.params, ...params });
  }

  updateParams(params: HttpServiceParametersInterface): void {
    Object.assign(this.params!, params);
    if (params.rateLimit) {
      this.initRateLimiter();
    }
  }

  async getData<T = any>(url: string, config?: HttpRequestConfig): Promise<Either<HttpError<T>, T>> {
    const responseOrError: Either<HttpError<T>, HttpResponse<T>> = await this.request(
      this.prepareConfig(url, 'GET', undefined, config)
    );
    if (responseOrError.isRight()) {
      return right(responseOrError.value.data);
    } else {
      return left(responseOrError.value);
    }
  }

  get<T>(url: string, config?: HttpRequestConfig): Promise<Either<HttpError<T>, HttpResponse<T>>> {
    return this.request(this.prepareConfig(url, 'GET', undefined, config));
  }

  getStream(
    url: string,
    config?: HttpRequestConfig
  ): Promise<Either<HttpError, HttpResponse<IncomingMessage>>> {
    config = config || {};
    config.responseType = 'stream';
    return this.request(this.prepareConfig(url, 'GET', undefined, config));
  }

  delete<T>(url: string, config?: HttpRequestConfig): Promise<Either<HttpError<T>, HttpResponse<T>>> {
    return this.request(this.prepareConfig(url, 'DELETE', undefined, config));
  }

  head<T>(url: string, config?: HttpRequestConfig): Promise<Either<HttpError<T>, HttpResponse<T>>> {
    return this.request(this.prepareConfig(url, 'HEAD', undefined, config));
  }

  post<T>(
    url: string,
    data?: unknown,
    config?: HttpRequestConfig
  ): Promise<Either<HttpError<T>, HttpResponse<T>>> {
    return this.request(this.prepareConfig(url, 'POST', data, config));
  }

  put<T>(
    url: string,
    data?: unknown,
    config?: HttpRequestConfig
  ): Promise<Either<HttpError<T>, HttpResponse<T>>> {
    return this.request(this.prepareConfig(url, 'PUT', data, config));
  }

  patch<T>(
    url: string,
    data?: unknown,
    config?: HttpRequestConfig
  ): Promise<Either<HttpError<T>, HttpResponse<T>>> {
    return this.request(this.prepareConfig(url, 'PATCH', data, config));
  }

  getUrlWithParams(url: string, urlParams?: HttpParams): string {
    if (url && (urlParams || this.params!.urlParams)) {
      const params: HttpParams = {
        ...(this.params!.urlParams || {}),
        ...(urlParams || {}),
      };
      let res: string = url;
      for (const key of Object.keys(params)) {
        const regExp: RegExp = new RegExp(`{{${key}}}`, 'g');
        res = res.replace(regExp, params[key].toString());
      }
      return res;
    } else {
      return url;
    }
  }

  protected prepareUrl(url: string, urlParams?: HttpParams): string {
    const value: string = url.startsWith('http') ? url : `${this.params!.baseUrl}/${url}`;
    return this.getUrlWithParams(value, urlParams);
  }

  private async request<T>(config: AxiosRequestConfig): Promise<Either<HttpError<T>, HttpResponse<T>>> {
    if (this.rateLimiter && config.responseType !== 'stream') {
      await this.rateLimiter();
    }
    const response: Either<HttpError<T>, HttpResponse<T>> = await this.requestLimited(config);
    return response;
  }

  private async requestLimited<T>(
    config: AxiosRequestConfig
  ): Promise<Either<HttpError<T>, HttpResponse<T>>> {
    try {
      const response: HttpResponse<T> = await (retry(
        async () => {
          return this.getRequestPromise(config);
        },
        {
          retries: this.params!.retries,
        }
      ) as Promise<HttpResponse<T>>);
      return right(response);
    } catch (ex: any) {
      return left(ex);
    }
  }

  private getRequestPromise<T>(config: AxiosRequestConfig): Promise<HttpResponse<T>> {
    return this.client
      .request(config)
      .then((axiosResponse: AxiosResponse<T>) => {
        try {
          parseObjectDates(axiosResponse.data);
        } catch (ex) {}
        return {
          data: axiosResponse.data,
          status: axiosResponse.status,
          statusText: axiosResponse.statusText,
          headers: axiosResponse.headers ? { ...axiosResponse.headers } : undefined,
        } as HttpResponse<T>;
      })
      .catch((error: AxiosError) => {
        throw {
          message: error.message,
          response: {
            data: error.response?.data,
            status: error.response?.status,
            statusText: error.response?.statusText,
            headers: error.response?.headers ? { ...error.response.headers } : undefined,
          },
        } as HttpError<T>;
      });
  }

  private prepareConfig(
    url: string,
    method: Method,
    data?: unknown,
    config?: HttpRequestConfig
  ): AxiosRequestConfig {
    let newConfig: AxiosRequestConfig = config ? ({ ...config } as any) : {};
    newConfig = newConfig || {};
    newConfig.url = this.prepareUrl(url, config ? config.urlParams : undefined);
    newConfig.method = method;
    if (data) {
      newConfig.data = data;
    }
    if (this.params) {
      if (this.params.headers) {
        newConfig.headers = newConfig.headers || {};
        const keys: string[] = Object.keys(this.params.headers);
        keys.forEach((key: string) => {
          if (!newConfig.headers || !newConfig.headers[key]) {
            newConfig.headers = newConfig.headers || {};
            newConfig.headers[key] = this.params!.headers![key];
          }
        });
      }
      if (this.params.params) {
        newConfig.params = newConfig.params || {};
        const keys: string[] = Object.keys(this.params.params);
        keys.forEach((key: string) => {
          if (!newConfig.params[key]) {
            newConfig.params[key] = this.params!.params![key];
          }
        });
      }
      if (this.params.timeout! > 0 && (!config || config.responseType !== 'stream')) {
        newConfig.timeout = this.params.timeout;
      }
    }
    return newConfig;
  }

  private initRateLimiter(): void {
    if (this.params && this.params.rateLimit) {
      this.rateLimiter = RateLimiter(
        Math.floor((this.params!.rateLimit!.intervalSeconds * 1000 + 200) / this.params!.rateLimit!.requests)
      );
    }
  }
}
