import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  CancelTokenSource,
} from "axios";
import axios from "axios";

interface SDKConfig {
  baseURL: string;
  timeout?: number;
  withCredentials?: boolean;
  retries?: number; // Default retry count for failed requests
  onSessionExpired?: () => void;
  onError?: (error: AxiosError) => void;
}

interface RequestConfig extends AxiosRequestConfig {
  retries?: number; // Override retry count per request
}

export class APISdk {
  public client: AxiosInstance;
  private config: SDKConfig;

  constructor(config: SDKConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 10000,
      headers: { "Content-Type": "application/json" },
      withCredentials: config.withCredentials ?? true,
    });

    this.setupInterceptors();
  }

  public async get<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: "GET", url });
  }

  public async post<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<T> {
    return this.request<T>({ ...config, method: "POST", url, data });
  }

  public async put<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<T> {
    return this.request<T>({ ...config, method: "PUT", url, data });
  }

  public async patch<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<T> {
    return this.request<T>({ ...config, method: "PATCH", url, data });
  }

  public async delete<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: "DELETE", url });
  }

  private async request<T>(config: RequestConfig): Promise<T> {
    const retries = config.retries ?? this.config.retries ?? 0;

    try {
      return await this.client.request<T, T>(config);
    } catch (error) {
      if (this.shouldRetry(error as AxiosError, retries)) {
        return this.retryRequest<T>(config, retries);
      }
      throw error;
    }
  }

  private shouldRetry(error: AxiosError, retries: number): boolean {
    if (retries <= 0) return false;

    const status = error.response?.status;
    if (status && status >= 400 && status < 500) return false;

    return !error.response || (status !== undefined && status >= 500);
  }

  private async retryRequest<T>(
    config: RequestConfig,
    retriesLeft: number,
  ): Promise<T> {
    const delay = Math.pow(2, (this.config.retries ?? 3) - retriesLeft) * 1000;
    await this.sleep(delay);

    return this.request<T>({ ...config, retries: retriesLeft - 1 });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public createCancelToken(): CancelTokenSource {
    return axios.CancelToken.source();
  }

  public isCancel(error: unknown): boolean {
    return axios.isCancel(error);
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (axiosConfig) => axiosConfig,
      (error: AxiosError) => Promise.reject(error),
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response.data,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          if (this.config.onSessionExpired) {
            this.config.onSessionExpired();
          }
          return Promise.reject(error);
        }

        if (this.config.onError) {
          this.config.onError(error);
        }

        return Promise.reject(error);
      },
    );
  }
}
