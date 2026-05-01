/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface Window {
  __APP_BUILD__?: string;
  __REACT_MOUNTED__?: boolean;
}
