/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BBM_POS_INGEST_URL?: string
  readonly VITE_BBM_POS_INGEST_SECRET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
