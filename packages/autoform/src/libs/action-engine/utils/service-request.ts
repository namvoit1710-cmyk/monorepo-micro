import { ServiceHandler } from "../../../hooks/use-builder-services";

export async function serviceRequest(
    service: ServiceHandler,
    method: string,
    url: string,
    body?: unknown,
    headers?: Record<string, string>
): Promise<unknown> {
    if (method === "GET") {
        return service.fetch(url);
    }
    const methodFn = service[method.toLowerCase() as keyof ServiceHandler];
    if (typeof methodFn === "function") {
        return methodFn(url, body  as Record<string, any>);
    }

    throw new Error(
        `[serviceRequest] Service does not support method: ${method}`
    );
}