import { Data } from '../types/App';
import { Component, ComponentDefinition, ComponentProps } from '../types/Component';
import { error } from '../utils/logs';
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
>(componentDefinition: ComponentDefinition<D, M, A, P>): Component<P> {
  return async (componentElement: HTMLElement, data: { props: P }, childrens: Element[]) => {
    try {
      const render = parseHTMl(componentDefinition.html);

      componentElement.replaceWith(render);

      await createAdvancedApp(componentDefinition.app, { props: data.props, childrens })
        .components(componentDefinition.components ?? {})
        .mount(render);
    } catch (err: any) {
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
