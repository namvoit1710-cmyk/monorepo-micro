import { env } from "@/env";
import { useEffect, useState } from "react";

interface MdState {
    content: string | null;
    loading: boolean;
    error: string | null;
}

const cache = new Map<string, string>();

export function useMdLoader(file: string): MdState {
    const [state, setState] = useState<MdState>({
        content: cache.get(file) ?? null,
        loading: !cache.has(file),
        error: null,
    });

    console.log("vite", env.PUBLIC_DOCS_URL)

    useEffect(() => {
        if (cache.has(file)) {
            setState({ content: cache.get(file)!, loading: false, error: null });
            return;
        }

        let cancelled = false;
        setState((s) => ({ ...s, loading: true, error: null }));

        fetch(`${env.PUBLIC_DOCS_URL}/docs/${file}`)
            .then((res) => {
                if (!res.ok) throw new Error(`Failed to load ${file}: ${res.status}`);
                return res.text();
            })
            .then((text) => {
                if (cancelled) return;
                cache.set(file, text);
                setState({ content: text, loading: false, error: null });
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                setState({
                    content: null,
                    loading: false,
                    error: err instanceof Error ? err.message : String(err),
                });
            });

        return () => {
            cancelled = true;
        };
    }, [file]);

    return state;
}