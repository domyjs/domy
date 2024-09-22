import { Data } from '../types/App';
import { ComponentDefinition, ComponentProps, Components } from '../types/Component';
import { getDomyAttributeInformations } from '../utils/domyAttrUtils';
import { isBindAttr } from '../utils/isSpecialAttribute';
import { kebabToCamelCase } from '../utils/kebabToCamelCase';
import { error, warn } from '../utils/logs';
import { createAdvancedApp } from './createApp';

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

      // We handle the attributes
      for (const attr of componentElement.attributes) {
        const attrName = kebabToCamelCase(attr.name.replace(/^:/, ''));

        // In case it's a prop
        if (propsName.has(attrName)) {
          requiredProps.delete(attrName);
          propsAttributes.push(attr);
          continue;
        }

        // Handle the case the attribute already on the root
        if (root.getAttribute(attr.name)) {
          warn(
            `The domy attribute "${attr.name}" has been skipped because it's already present in the component "${name}" root.`
          );
          continue;
        }

        // If it's not a prop we see the attribute on the root element
        const fixedName = attr.name.replace(/^@/, 'd-on:');
        componentAttributes.push(fixedName);
        root.setAttribute(fixedName, attr.value);
      }

      // Handle required props
      for (const requiredProp of requiredProps) {
        throw Error(`The prop "${requiredProp}" is required on the component "${name}".`);
      }

      // We ensure the props are reactive
      domy.effect(() => {
        for (const attr of propsAttributes) {
          if (isBindAttr(attr.name)) {
            const attrInfos = getDomyAttributeInformations(attr);
            const propName = kebabToCamelCase(attrInfos.attrName);
            data.props[propName] = attr.value === '' ? true : domy.evaluate(attr.value);
          } else {
            data.props[attr.name] = attr.value === '' ? true : attr.value;
          }
        }
      });

      // Remplace the component
      componentElement.replaceWith(root);

      // We render the childs first to ensure they keep the current state and not the component state
      for (const child of componentElement.childNodes) {
        domy.deepRender({
          element: child as Element,
          scopedNodeData: domy.scopedNodeData
        });
      }

      // Ensure we can add some domy attribute to the component and render them on the component root
      // Example: <Count d-if="showCount"></Count>
      domy.deepRender({
        element: root,
        scopedNodeData: domy.scopedNodeData,
        byPassAttributes: [...propsAttributes.map(attr => attr.name), ...rootAttributes],
        isComponentRendering: true
      });

      // We mount the new app on the component
      createAdvancedApp(
        componentDefinition.app,
        {
          props: data.props,
          childrens: Array.from(componentElement.childNodes) as Element[]
        },
        componentAttributes
      )
        .configure(domy.config)
        .components(componentDefinition.components ?? {})
        .mount(root);
    } catch (err: any) {
      componentElement.remove();

      if (!err?.message?.includes(name)) {
        warn(`The following error happened on "${name}" component.`);
      }

      error(err);
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
