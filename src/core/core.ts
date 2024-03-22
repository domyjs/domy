import { func } from '@utils/func';
import { SPECIAL_ATTRIBUTES } from '../constants/specialAttributes';
import { Signal, StateObj } from './Signal';

type Props = {
  $el: Element;
  $state: Signal[];
  attr: Attr;
};

export const DOMY = {
  $refs: {} as Record<string, Element>,
  $store: {},
  createState(name: string, state: StateObj) {
    new Signal(name, state);
  },
  initStore(state: StateObj) {
    // TODO
  }
};

export function binding(props: Props) {
  const domyAttrName = props.attr.name;

  const attrName = domyAttrName.slice(1);
  const executedValue = func({
    code: props.attr.value,
    returnResult: true,
    $state: props.$state,
    $el: props.$el
  });

  // props.$el.removeAttribute(domyAttrName);
  props.$el.setAttribute(attrName, executedValue);
}

export function events(props: Props) {
  const domyAttrName = props.attr.name;

  const eventName = domyAttrName.slice(1);

  props.$el.removeAttribute(domyAttrName);
  props.$el.addEventListener(eventName, function (event) {
    const executedValue = func({
      code: props.attr.value,
      returnResult: true,
      $state: props.$state
    });
    if (typeof executedValue === 'function') executedValue(event);
  });
}

export function specialAttributes(props: Props) {
  const domyAttrName = props.attr.name as (typeof SPECIAL_ATTRIBUTES)[number];

  // props.$el.removeAttribute(domyAttrName);

  function getExecutedValue() {
    return func({
      code: props.attr.value,
      returnResult: true,
      $state: props.$state,
      $el: props.$el
    });
  }

  switch (domyAttrName) {
    case 'd-text':
      props.$el.textContent = getExecutedValue();
      break;
    case 'd-html':
      props.$el.innerHTML = getExecutedValue();
      break;
    case 'd-if':
      (props.$el as HTMLElement).style.display = getExecutedValue() ? 'block' : 'none';
      break;
    case 'd-show':
      (props.$el as HTMLElement).style.display = getExecutedValue() ? 'block' : 'none';
      break;
    case 'd-ref':
      DOMY.$refs[props.attr.value] = props.$el;
      break;
    case 'd-model':
      // TODO
      break;
    case 'd-for':
      // TODO
      break;
  }
}

const $state: Signal[] = [];

const isBind = (attr: string) => attr.startsWith(':');
const isEvent = (attr: string) => attr.startsWith('@');
const isSpecialAttribute = (attr: string) => SPECIAL_ATTRIBUTES.includes(attr as any);

export function renderElement($el: Element) {
  const attributes = $el.attributes;

  for (const attr of attributes) {
    const props = { $el, attr, $state };

    if (attr.name === 'd-data') {
      const obj = func({
        code: attr.value,
        $state: $state,
        returnResult: true
      });

      // Fixe state scope
      for (const key of Object.keys(obj)) {
        $state.push(new Signal(key, obj[key]));
      }

      $el.removeAttribute('d-data');
    } else if (isBind(attr.name)) {
      binding(props);
    } else if (isEvent(attr.name)) {
      events(props);
    } else if (isSpecialAttribute(attr.name)) {
      specialAttributes(props);
    }
  }
}
