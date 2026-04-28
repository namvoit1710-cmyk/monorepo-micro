// ============================================================================
// Service Request Helper
// ============================================================================
// Adapter for calling registered API services with non-GET methods.
// Services typically only expose .fetch() for GET — this wraps the
// underlying transport to support POST/PUT/PATCH/DELETE.
// ============================================================================

type ServiceLike = {
    fetch: (endpoint: string, params?: Record<string, any>) => Promise<any>;
};

/**
 * Make a request through a registered service.
 * Falls back to raw fetch if service doesn't support the method natively.
 */
export async function serviceRequest(
    service: ServiceLike,
    method: string,
    url: string,
    body?: unknown,
    headers?: Record<string, string>
): Promise<unknown> {
    // If service has a native request method, use it
    if ("request" in service && typeof (service as any).request === "function") {
        return (service as any).request({ method, url, data: body, headers });
    }

    // Fallback: use the service's fetch for GET, raw fetch for others
    if (method === "GET") {
        return service.fetch(url);
    }

    // Raw fetch fallback for POST/PUT/PATCH/DELETE
    const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...headers },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(
            (error as any)?.message ?? `Service request failed: ${res.status}`
        );
    }

    return res.json().catch(() => null);
}