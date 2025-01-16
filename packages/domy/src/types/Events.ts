import { App } from './App';
import { State } from './State';

export type DomyReadyEventDetails = {
  app: App;
  target: Element;
};

export type DomyMountedEventDetails = {
  appId: number;
  app: App;
  target: Element;
  state: State;
};

export type DomyUnMountEventDetails = {
  app: App;
  target: Element;
  state: State;
};
