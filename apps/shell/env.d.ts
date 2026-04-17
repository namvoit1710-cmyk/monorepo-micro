/// <reference types="@rsbuild/core/types" />

interface ImportMetaEnv {
    readonly PUBLIC_DOCS_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}