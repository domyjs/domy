import { Data } from '../types/App';
import { ComponentDefinition, ComponentProps, Components } from '../types/Component';
import { getDomyAttributeInformations } from '../utils/domyAttrUtils';
import { isBindAttr, isEventAttr } from '../utils/isSpecialAttribute';
import { error, warn } from '../utils/logs';
import { createAdvancedApp } from './createApp';

function cleanup(unmountFns: (() => void)[]) {
  for (const unmountFn of unmountFns) {
    unmountFn();
  }
}

/**
 * Parse a html string
 * @param html
 * @returns
 *
 * @author yoannchb-pro
 */
function parseHTMl(html: string) {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.childNodes;
}

/**
 * Allow the user to create component
 * Example:
 * createComponent({
 *  props: ['title'],
 *  html: `
 *  <div>
 *    <h1>{{ $props.title }}</h1>
 *    <p>Count: {{ count }}</p>
 *    <button @click="++count">+</button>
 *    <button @click="--count">-</button>
 *  </div>
 * `,
 *  app: {
 *    data() {
 *      return { count: 0 }
 *    }
 *  }
 * })
 * @param componentDefinition
 * @returns
 *
 * @author yoannchb-pro
 */
export function createComponent<
  P extends ComponentProps['props'],
  D extends Data,
  M extends string,
  A extends any[]
>(componentDefinition: ComponentDefinition<D, M, A, P>): Components[keyof Components] {
  const props = componentDefinition.props ?? [];
  const propsName = new Set(props.map(prop => prop.replace(/^!/, '')));

  return ({ name, componentElement, domy }) => {
    const unmountFns: (() => void)[] = [];

    try {
      const tree = parseHTMl(componentDefinition.html.trim());

      if (tree.length !== 1) {
        throw new Error(`The component "${name}" need to have one element as root.`);
      }

      const requiredProps = new Set(
        props.filter(e => e.startsWith('!')).map(prop => prop.slice(1))
      );

      const data = domy.reactive({ props: {} as ComponentProps['props'] });
      const root = tree[0] as HTMLElement;

      const propsAttributes: Attr[] = [];
      const componentAttributes: string[] = [];
      const rootAttributes = Array.from(root.attributes).map(attr => attr.name);
      const childrens = Array.from(componentElement.children) as Element[];

      // We handle the attributes
      for (const attr of componentElement.attributes) {
        const attrNameWithoutBinding = attr.name.replace(/^:/, '');
        const propName = domy.utils.kebabToCamelCase(attrNameWithoutBinding);

        // In case it's a prop
        if (propsName.has(propName)) {
          requiredProps.delete(propName);
          propsAttributes.push(attr);
          continue;
        }

        // Attaching events
        if (isEventAttr(attr.name)) {
          const fixedName = attr.name.replace(/^@/, 'd-on:');
          componentAttributes.push(fixedName);
          root.setAttribute(fixedName, attr.value);
          continue;
        }

        if (root.hasAttribute(attr.name)) {
          warn(
            `The attribute "${attr.name}" has been skiped because he is already present on the component "${name}"`
          );
          continue;
        }

        componentAttributes.push(attr.name);
        root.setAttribute(attr.name, attr.value);
      }

      // Error handling for required props
      for (const requiredProp of requiredProps) {
        throw Error(`The prop "${requiredProp}" is required on the component "${name}".`);
      }

      // We ensure the props are reactive
      domy.effect(() => {
        for (const attr of propsAttributes) {
          const attrInfos = getDomyAttributeInformations(attr);
          const propName = domy.utils.kebabToCamelCase(attrInfos.attrName);
          if (isBindAttr(attr.name)) {
            data.props[propName] = attr.value === '' ? true : domy.evaluate(attr.value);
          } else {
            data.props[propName] = attr.value === '' ? true : attr.value;
          }
        }
      });

      // Remplace the component
      componentElement.replaceWith(root);

      // // We render the childs first to ensure they keep the current state and not the component state
      for (const child of componentElement.childNodes) {
        const { unmount } = domy.deepRender({
          element: child as Element,
          scopedNodeData: domy.scopedNodeData
        });
        unmountFns.push(unmount);
      }

      let unmountComponent: (() => void) | undefined;
      const mountComponent = (target: HTMLElement) => {
        domy.queueJob(() => {
          if (unmountComponent) unmountComponent();
          createAdvancedApp(
            componentDefinition.app,
            {
              props: data.props,
              childrens
            },
            componentAttributes
          )
            .configure(domy.config)
            .components(componentDefinition.components ?? {})
            .mount(target)
            .then(render => {
              unmountComponent = render?.unmount;
            });
        });
      };

      // Ensure we can add some domy attribute to the component and render them on the component root
      // Example: <Count d-if="showCount"></Count>
      const { unmount, getRenderedElement } = domy.deepRender({
        element: root,
        scopedNodeData: domy.scopedNodeData,
        byPassAttributes: [...propsAttributes.map(attr => attr.name), ...rootAttributes],
        skipChildRendering: true,
        onRenderedElementChange: newRoot => mountComponent(newRoot as HTMLElement)
      });
      unmountFns.push(unmount);

      // We mount the new app on the component
      mountComponent(getRenderedElement() as HTMLElement);

      domy.cleanup(() => {
        if (unmountComponent) unmountComponent();
        cleanup(unmountFns);
        domy.unReactive(data);
      });

      return getRenderedElement;
    } catch (err: any) {
      componentElement.remove();
      cleanup(unmountFns);

      error(`Component "${name}":`, err);
    }
  };
}

// createComponent({
//   html: '',
//   app: {
//     data: {
//       g: 4
//     },
//     methods: {
//       gg() {
//         this.r(5);
//       },
//       r(t: string) {}
//     }
//   }
// });
