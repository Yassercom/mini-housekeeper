/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_LOCAL_IP: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
