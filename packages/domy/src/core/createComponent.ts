import { ComponentDefinition, ComponentInfos, Components } from '../types/Component';
import { callWithErrorHandling } from '../utils/callWithErrorHandling';
import { createAdvancedApp } from './createApp';
import { getUniqueQueueId } from './scheduler';

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
 * This function get the component without the directives which has already been rendered
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
 *  app(){
 *     const count = signal(0);
 *     return { count };
 *  }
 * })
 * @param componentDefinition
 * @returns
 *
 * @author yoannchb-pro
 */
export function createComponent(
  componentDefinition: ComponentDefinition
): Components[keyof Components] {
  const props = componentDefinition.props ?? [];
  const propsName = new Set(props.map(prop => prop.replace(/^!/, '')));

  return ({ name, componentElement, domy }) => {
    const unmountChilds: (() => void)[] = [];

    callWithErrorHandling(
      () => {
        const tree = parseHTMl(componentDefinition.html.trim());

        if (tree.length !== 1) {
          throw new Error(`The component "${name}" need to have one element as root.`);
        }

        const requiredProps = new Set(
          props.filter(e => e.startsWith('!')).map(prop => prop.slice(1))
        );

        const root = tree[0] as HTMLElement;

        // Replace the component by the root
        domy.block.replaceWith(root);

        const data = domy.reactive({
          $props: {} as ComponentInfos['componentData']['$props'],
          $attrs: {} as ComponentInfos['componentData']['$attrs']
        });

        const propsAttributes: Attr[] = [];
        const attrsAttributes: Attr[] = [];
        const componentAttributes: string[] = [];

        // We handle the attributes
        for (const attr of componentElement.attributes) {
          const attrNameWithoutBinding = attr.name.replace(/^(:|d-bind:)/, '');
          const propName = domy.utils.kebabToCamelCase(attrNameWithoutBinding);

          // In case it's a prop
          if (propsName.has(propName)) {
            requiredProps.delete(propName);
            propsAttributes.push(attr);
            continue;
          }

          // Handling attrs
          attrsAttributes.push(attr);
        }

        // Error handling for required props
        for (const requiredProp of requiredProps) {
          throw Error(`The prop "${requiredProp}" is required on the component "${name}".`);
        }

        // reactive props
        for (const attr of propsAttributes) {
          const attrInfos = domy.utils.getDomyAttributeInformations(attr);
          const propName = domy.utils.kebabToCamelCase(attrInfos.attrName);
          if (domy.utils.isBindAttr(attr.name)) {
            domy.effect(() => {
              const executedValue = attr.value === '' ? true : domy.evaluate(attr.value);
              data.$props[propName] = executedValue;
            });
          } else {
            data.$props[propName] = attr.value === '' ? true : attr.value;
          }
        }

        // reactive attributes
        for (const attr of attrsAttributes) {
          const { attrName } = domy.utils.getDomyAttributeInformations(attr);
          if (domy.utils.isBindAttr(attr.name)) {
            domy.effect(() => {
              const executedValue = domy.evaluate(attr.value);
              data.$attrs[attrName] = executedValue;
            });
          } else {
            data.$attrs[attrName] = attr.value;
          }
        }

        //  We render the childs first to ensure they keep the current state and not the component state
        const names: { [name: string]: Element } = {};
        const childrens: Element[] = [];
        for (const child of componentElement.children) {
          const childBlock = domy.deepRender({
            element: child as Element,
            scopedNodeData: domy.scopedNodeData
          });
          unmountChilds.push(childBlock.unmount.bind(childBlock));
          childrens.push(childBlock.el);
          if (childBlock.name) names[childBlock.name] = childBlock.el;
        }

        let unmountComponent: (() => void) | undefined;
        const queueId = getUniqueQueueId();

        const mountComponent = (target: HTMLElement) => {
          const makeComponent = () => {
            if (unmountComponent) unmountComponent();
            const render = createAdvancedApp(
              componentDefinition.app,
              {
                componentData: data,
                names,
                childrens,
                parentPluginHelper: domy.pluginHelper
              },
              componentAttributes
            )
              .configure(domy.config)
              .components(componentDefinition.components ?? {})
              .mount(target);

            unmountComponent = render.unmount;
          };

          if (domy.appState.isMounted) domy.queueJob(makeComponent, queueId);
          else makeComponent();
        };

        // We mount the new app on the component
        mountComponent(root as HTMLElement);

        domy.block.onElementChange(newEl => {
          mountComponent(newEl as HTMLElement);
        });

        domy.cleanup(() => {
          if (unmountComponent) unmountComponent();
          cleanup(unmountChilds);
          domy.unReactive(data);
        });
      },
      err => {
        // In cas we had an error creating the component we remove it and unmount his childs
        componentElement.remove();
        cleanup(unmountChilds);

        domy.utils.error(`Component "${name}":`, err);
      }
    );
  };
}
