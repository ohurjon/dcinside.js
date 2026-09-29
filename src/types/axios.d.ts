import "axios";

declare module "axios" {
  interface InternalAxiosRequestConfig {
    retry?: number;
    retryDelay?: number;
    __retryAttempt?: number;
  }

  interface AxiosRequestConfig {
    retry?: number;
    retryDelay?: number;
    __retryAttempt?: number;
  }
}
