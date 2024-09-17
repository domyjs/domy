import { Data } from '../types/App';
import { ComponentDefinition, ComponentProps, Components } from '../types/Component';
import { kebabToCamelCase } from '../utils/kebabToCamelCase';
import { error, warn } from '../utils/logs';
import { createAdvancedApp } from './createApp';

/**
 * Parse an html string into a DocumentFragment
 * @param html
 * @returns
 *
 * @author yoannchb-pro
 */
function parseHTMl(html: string): HTMLElement {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return doc.body.childNodes[0] as HTMLElement;
}

/**
 * Allow the user to create component
 * Example:
 * createComponent({
 *  html: `
 *    <h1>{{ this.props.title }}</h1>
 *    <p>Count: {{ count }}</p>
 *    <button @click="++count">+</button>
 *    <button @click="--count">-</button>
 *  `,
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
  const propsName = new Set(componentDefinition.propsName);

  return {
    propsName,
    componentSetup: ({ componentElement, data, childrens, domy }) => {
      try {
        const attributesToSkip: string[] = [];
        const render = parseHTMl(componentDefinition.html);

        for (const attr of componentElement.attributes) {
          const attrName = kebabToCamelCase(attr.name.replace(/^:/, ''));

          if (propsName.has(attrName)) {
            attributesToSkip.push(attr.name);
            continue;
          }

          if (render.getAttribute(attr.name)) {
            warn(
              `The domy attribute "${attr.name}" has been skipped because it's already present in the component root.`
            );
            attributesToSkip.push(attr.name);
            continue;
          }

          render.setAttribute(attr.name.replace(/^@/, 'd-on:'), attr.value);
        }

        componentElement.replaceWith(render);

        // Ensure we can add some domy attribute to the component and render them on the component root
        // Example: <Count d-if="showCount"></Count>
        domy.deepRender({
          element: render,
          scopedNodeData: domy.scopedNodeData,
          byPassAttributes: attributesToSkip,
          skipChildRendering: true,
          isComponentRendering: true
        });

        createAdvancedApp(componentDefinition.app, { props: data.props, childrens })
          .components(componentDefinition.components ?? {})
          .mount(render);
      } catch (err: any) {
        error(err);
      }
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
