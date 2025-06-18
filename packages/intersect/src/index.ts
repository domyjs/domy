import type { DomyDirectiveHelper, DomyDirectiveReturn, DomyPlugin } from '@domyjs/core';
import type { Block } from '@domyjs/core';

/**
 * Handler for the IntersectionObserver
 *
 * @author yoannchb-pro
 */
class IntersectionHandler {
  private obs: IntersectionObserver;
  private elements = new Map<
    Element,
    { wasIntersecting: boolean; action: (isIntersecting: boolean) => void }
  >();

  constructor(options?: IntersectionObserverInit) {
    this.obs = new IntersectionObserver(this.callback.bind(this), options);
  }

  callback(...params: Parameters<IntersectionObserverCallback>) {
    const [entries] = params;
    for (const entry of entries) {
      const targetInfos = this.elements.get(entry.target);

      if (!targetInfos) continue;

      if (entry.isIntersecting && !targetInfos.wasIntersecting) {
        // intersecting
        targetInfos.wasIntersecting = true;
        targetInfos.action(true);
      } else if (targetInfos.wasIntersecting) {
        // unintersecting
        targetInfos.action(false);
        targetInfos.wasIntersecting = false;
      }
    }
  }

  observe(block: Block, action: (isIntersecting: boolean) => void) {
    let pastEl = block.el;
    block.onElementChange(newEl => {
      const pastInfos = this.elements.get(pastEl)!;
      this.elements.delete(pastEl);
      this.obs.unobserve(pastEl);

      this.elements.set(newEl, pastInfos);

      pastEl = newEl;
    });
    this.elements.set(pastEl, { wasIntersecting: false, action });
    this.obs.observe(pastEl);
  }

  unobserve(block: Block) {
    this.elements.delete(block.el);
    this.obs.unobserve(block.el);
  }

  disconnect() {
    this.obs.disconnect();
  }
}

/**
 * Plugin to launch an action when an element is visible by the user or not
 *
 * @author yoannchb-pro
 */
class IntersectPlugin {
  private globalIntersectionObserver;

  constructor(options?: IntersectionObserverInit) {
    this.globalIntersectionObserver = new IntersectionHandler(options);
  }

  intersectSettingsPlugin(domy: DomyDirectiveHelper): DomyDirectiveReturn {
    if (!domy.block.el.getAttribute('d-intersect') && !domy.block.el.getAttribute('d-unintersect'))
      throw new Error(
        `(Intersect) The "d-intersect" or "d-unintersect" directive as to be placed after "d-intersect-settings" directive (and not before).`
      );

    domy.block.setDataForPluginId('intersect-settings', domy.evaluate(domy.attr.value));
  }

  intersectPlugin(domy: DomyDirectiveHelper): DomyDirectiveReturn {
    const settings: IntersectionObserverInit =
      domy.block.getDataForPluginId('intersect-settings') ?? {};

    const isIntersectAttr = domy.attrName === 'd-intersect' || domy.prefix === 'intersect';
    const isPrefix = domy.prefix === 'intersect' || domy.prefix === 'unintersect';

    let uneffect: (() => void) | null = null;
    let cleanAttr: (() => void) | null = null;
    const action = (isIntersecting: boolean) => {
      const triggerIntersect = isIntersecting && isIntersectAttr;
      const triggerUnIntersect = !isIntersecting && !isIntersectAttr;

      if (isPrefix) {
        if ((isIntersectAttr && !isIntersecting) || (!isIntersectAttr && isIntersecting)) {
          cleanAttr?.();
          uneffect?.();
          return;
        }

        if (!triggerIntersect && !triggerUnIntersect) return;

        const isClass = domy.attrName === 'class';
        const isStyle = domy.attrName === 'style';

        uneffect =
          domy.effect(() => {
            const el = domy.block.el as HTMLElement;

            const executedValue = domy.evaluate(domy.attr.value);

            if (isClass) {
              const fixedClass = domy.utils.handleClass(executedValue, el.className);
              cleanAttr = () => (el.className = fixedClass.cleanedClass(el.className));
              el.className = fixedClass.class;
            } else if (isStyle) {
              const fixedStyle = domy.utils.handleStyle(executedValue, el.style.cssText);
              cleanAttr = () =>
                el.setAttribute(domy.attrName, fixedStyle.cleanedStyle(el.style.cssText));
              el.setAttribute(domy.attrName, fixedStyle.style);
            } else {
              cleanAttr = () => el.removeAttribute(domy.attrName);
              el.setAttribute(domy.attrName, executedValue);
            }
          }) ?? null;
      } else if (triggerIntersect || triggerUnIntersect) {
        domy.evaluate(domy.attr.value);
      }
    };

    if (settings) {
      const specialIntersectionObserver = new IntersectionHandler(settings);
      specialIntersectionObserver.observe(domy.block, action);
      domy.cleanup(() => specialIntersectionObserver.disconnect());
    } else {
      this.globalIntersectionObserver.observe(domy.block, action);
      domy.cleanup(() => this.globalIntersectionObserver.unobserve(domy.block));
    }
  }
}

const intersectPluginDefinition = (options?: IntersectionObserverInit) => {
  const plugin = new IntersectPlugin(options);
  const intersectPlugin = plugin.intersectPlugin.bind(plugin);
  const pluginSetter: DomyPlugin = domyPluginSetter => {
    domyPluginSetter.directive('intersect-settings', plugin.intersectSettingsPlugin.bind(plugin));
    domyPluginSetter.prefix('intersect', intersectPlugin);
    domyPluginSetter.prefix('unintersect', intersectPlugin);
    domyPluginSetter.directive('intersect', intersectPlugin);
    domyPluginSetter.directive('unintersect', intersectPlugin);
  };
  return pluginSetter;
};

export default intersectPluginDefinition;
