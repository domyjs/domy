import { App } from './App';
import { State } from './State';

export type DomyReadyEventDetails = {
  app: App;
  target: Element;
};

export type DomyMountedEventDetails = {
  app: App;
  target: Element;
  state: State;
};
