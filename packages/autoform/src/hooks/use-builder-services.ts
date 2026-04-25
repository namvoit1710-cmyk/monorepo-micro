import { useMemo } from "react";
import { APISdk } from "@ldc/api-sdk";

    interface ServiceConfig {
  baseUrl: string;
  basePath?: string;
  headers?: Record<string, string>;
}

type ServiceFetcher = (endpoint: string, params?: Record<string, any>) => Promise<any>;
type ServiceMutator = (endpoint: string, data?: any, headers?: Record<string, string>) => Promise<any>;
type ServiceDeleter = (endpoint: string, headers?: Record<string, string>) => Promise<any>;

export interface ServiceHandler {
  fetch: ServiceFetcher;
  post: ServiceMutator;
  put: ServiceMutator;
  patch: ServiceMutator;
  delete: ServiceDeleter;
}

export type BuilderServices = Record<string, ServiceHandler>;

const createServiceHandler = (config: ServiceConfig): ServiceHandler => {
  const { baseUrl, basePath = "/api/v1", headers } = config;

  const api = new APISdk({
    baseURL: `${baseUrl}/${basePath}`.replace(/\/+/g, "/").replace(":/", "://"),
    headers,
  });

  return {
    fetch: async (endpoint, params) => {
      return api.get(`/${endpoint}`, {
        params,
        headers,
      });
    },
    post: async (endpoint: string, data?: any, headers?: Record<string, string>) => {
      return api.post(`/${endpoint}`, data, { headers });
    },
    put: async (endpoint: string, data?: any, headers?: Record<string, string>) => {
      return api.put(`/${endpoint}`, data, { headers });
    },
    patch: async (endpoint: string, data?: any, headers?: Record<string, string>) => {
      return api.patch(`/${endpoint}`, data, { headers });
    },
    delete: async (endpoint: string, headers?: Record<string, string>) => {
      return api.delete(`/${endpoint}`, { headers });
    },
  };
};

export const useBuilderServices = (
  configs: Record<string, ServiceConfig>
): BuilderServices => {
  return useMemo(() => {
    return Object.entries(configs).reduce((acc, [name, config]) => {
      acc[name] = createServiceHandler(config);
      return acc;
    }, {} as BuilderServices);
  }, [configs]);
};