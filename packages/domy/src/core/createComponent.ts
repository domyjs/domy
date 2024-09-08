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
function parseHTMl(html: string): DocumentFragment {
  const fragment = new DocumentFragment();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  for (const child of doc.body.childNodes) {
    fragment.appendChild(child);
  }
  return fragment;
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
export function createComponent<T extends ComponentProps>(
  componentDefinition: ComponentDefinition<T, any, any, any>
): Component<T> {
  return (props: T) => {
    try {
      const fragment = parseHTMl(componentDefinition.html);

      const temp = document.createElement('div');
      temp.appendChild(fragment);

      createAdvancedApp(componentDefinition.app, props)
        .components(componentDefinition.components ?? {})
        .mount(temp);

      return (componentElement: HTMLElement) => componentElement.replaceWith(...temp.childNodes);
    } catch (err: any) {
      error(err);
      return (componentElement: HTMLElement) => componentElement.remove();
    }
  };
}
