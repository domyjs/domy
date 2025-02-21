export type AppState = {
  isSetuped: boolean;
  isMounted: boolean;
  isUnmounted: boolean;
};

export type AppProps = {
  props?: Record<string, unknown>;
};

export type App = (props: AppProps) => Record<string, unknown>;
