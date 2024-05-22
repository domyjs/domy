import { App } from './App';
import { State } from './State';

export enum DomyEvents {
  Ready = 'domy:ready',
  Mounted = 'domy:mounted'
}

export type DomyReadyEventDetails = {
  app: App;
  target: Element;
};

export type DomyMountedEventDetails = {
  app: App;
  target: Element;
  state: State;
};
