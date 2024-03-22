import { func } from '@utils/func';
import { Signal } from './Signal';
import { VirtualElement } from './VitualDom';
import { isBindAttr, isDomyAttr, isEventAttr } from '@utils/isSpecialAttribute';
import { binding } from './binding';
import { domies } from './domies';
import { events } from './events';
import { State } from '@typing/State';
import { AttrRendererProps } from '@typing/AttrRendererProps';

const $state: State = {
  $state: [],
  $store: {},
  $refs: {}
};

export function renderElement(
  virtualParent: VirtualElement | null,
  virtualElement: VirtualElement | string,
  injectState: Signal[] = []
) {
  if (typeof virtualElement === 'string') return; // TODO

  const stateCopy: State = {
    ...$state,
    $state: [...$state.$state, ...injectState]
  };

  const domiesAttributes = virtualElement.domiesAttributes;

  for (const attr of Object.keys(domiesAttributes)) {
    const props: AttrRendererProps = {
      $state: stateCopy,
      virtualParent,
      virtualElement,
      attr: { name: attr, value: domiesAttributes[attr] }
    };

    if (attr === 'd-data') {
      const obj = func({
        code: domiesAttributes[attr],
        $state: stateCopy,
        returnResult: true,
        virtualElement,
        virtualParent
      });

      // Fixe state scope
      for (const key of Object.keys(obj)) {
        $state.$state.push(new Signal(key, obj[key]));
      }

      virtualElement.$el.removeAttribute('d-data');
    } else if (isBindAttr(attr)) {
      binding(props);
    } else if (isEventAttr(attr)) {
      events(props);
    } else if (isDomyAttr(attr)) {
      domies(props);
    }
  }
}
