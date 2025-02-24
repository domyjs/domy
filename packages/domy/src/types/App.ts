export type AppState = {
  isSetuped: boolean;
  isMounted: boolean;
  isUnmounted: boolean;
};

export type App = () => Record<string, unknown>;
