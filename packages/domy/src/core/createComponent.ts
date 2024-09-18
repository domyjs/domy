import { Data } from '../types/App';
import { ComponentDefinition, ComponentProps, Components } from '../types/Component';
import { getDomyAttributeInformations } from '../utils/domyAttrUtils';
import { isBindAttr } from '../utils/isSpecialAttribute';
import { kebabToCamelCase } from '../utils/kebabToCamelCase';
import { warn } from '../utils/logs';
import { createAdvancedApp } from './createApp';

/**
 * Parse an html string into a DocumentFragment
 * @param html
 * @returns
 *
 * @author yoannchb-pro
 */
function parseHTMl(html: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return doc.body.childNodes;
}

/**
 * Allow the user to create component
 * Example:
 * createComponent({
 *  html: `
 *  <div>
 *    <h1>{{ this.props.title }}</h1>
 *    <p>Count: {{ count }}</p>
 *    <button @click="++count">+</button>
 *    <button @click="--count">-</button>
 *  </div>
 * `,
 *  app: {
 *    data: {
 *      count: 0
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

  return ({ componentElement, domy }) => {
    const tree = parseHTMl(componentDefinition.html.trim());

    if (tree.length !== 1) throw new Error('A component need to have one element as root.');

    const requiredProps = new Set(props.filter(e => e.startsWith('!')));
    const data = domy.reactive({ props: {} as ComponentProps['props'] });
    const root = tree[0] as HTMLElement;
    const propsAttributes: Attr[] = [];
    const componentAttributes: string[] = [];

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
          `The domy attribute "${attr.name}" has been skipped because it's already present in the component root.`
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
      throw Error(`The prop "${requiredProp}" is required on the component.`);
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
      byPassAttributes: propsAttributes.map(attr => attr.name),
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
      .components(componentDefinition.components ?? {})
      .mount(root);
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
