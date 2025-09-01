export {};
declare global {
  interface WindowEventMap {
    "ap:search": CustomEvent<string>;
    "ap:open-notifications": CustomEvent<void>;
    "ap:open-messages": CustomEvent<void>;
  }
}
