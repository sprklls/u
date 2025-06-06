export {};  // makes this an external module

declare global {
  interface Window {
    sharedData?: any;
  }
}