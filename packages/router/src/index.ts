import type { DomyPluginDefinition } from '@domyjs/core/src/types/Domy';
import DOMY from '@domyjs/core';

declare global {
  interface Window {
    DOMY: typeof DOMY;
  }
}

type BeforeAfterParams = {
  route: Route;
  navigate: Router['navigate'];
  params?: Params;
  queryParams?: QueryParams;
};

type Route = {
  name: string;
  route: string;
  component: Component;
  before?: (params: BeforeAfterParams) => void;
  after?: (params: BeforeAfterParams) => void;
} & Record<string, any>;

type Params = Record<string, string>;
type QueryParams = Record<string, string>;

type Settings = {
  hashMode: boolean;
  DOMY: typeof DOMY;
  routes: Route[];
};

type Component = ReturnType<(typeof DOMY)['createComponent']>;

const NOT_FOUND_ROUTE = ':not-found:';

class Router {
  private routes: Route[];
  private hashMode: boolean;
  private notFoundRoute?: Route;

  private currentRoute: { path: string; params?: Params; queryParams?: QueryParams; route?: Route };
  constructor(settings: Settings) {
    // The name as to be kebab case to ensure localName when mounting the component match the route name
    for (const route of settings.routes) {
      route.name = route.name.toLowerCase().replace(/\s/g, '-');
    }

    this.notFoundRoute = settings.routes.find(({ route }) => route === NOT_FOUND_ROUTE);
    this.routes = settings.routes.filter(r => r.route !== NOT_FOUND_ROUTE);
    this.hashMode = settings.hashMode;

    this.currentRoute = window.DOMY.signal({ path: '' }).value;

    this.init();
  }

  private init() {
    window.addEventListener('popstate', () => this.handleRouteChange());

    if (this.hashMode) {
      window.addEventListener('hashchange', () => this.handleRouteChange());
    }

    this.handleRouteChange(); // Initial route setup
  }

  private handleRouteChange() {
    const path = this.getPath();
    const queryParams = this.getQueryParams();
    const { matchedRoute, params } = this.matchRoute(path) || {};

    this.push(path, matchedRoute ?? this.notFoundRoute, params, queryParams);
  }

  private getPath() {
    if (this.hashMode) {
      return window.location.hash.replace(/^#/, '').split('?')[0] || '/';
    } else {
      return window.location.pathname.split('?')[0] || '/';
    }
  }

  private getQueryParams(): QueryParams {
    const queryString = this.hashMode
      ? window.location.hash.split('?')[1]
      : window.location.search.slice(1);
    return Object.fromEntries(new URLSearchParams(queryString));
  }

  private matchRoute(path: string): { matchedRoute: Route; params: Record<string, string> } | null {
    for (const route of this.routes) {
      const paramNames: string[] = [];
      const regexPath = route.route.replace(/:([^/]+)/g, (_, paramName) => {
        paramNames.push(paramName);
        return '([^/]+)';
      });
      const regex = new RegExp(`^${regexPath}$`);
      const match = path.match(regex);

      if (match) {
        const params = paramNames.reduce(
          (acc, paramName, i) => {
            acc[paramName] = match[i + 1];
            return acc;
          },
          {} as Record<string, string>
        );
        return { matchedRoute: route, params };
      }
    }

    return null;
  }

  private push(
    path: string,
    route?: Route,
    params?: Record<string, string>,
    queryParams?: QueryParams
  ) {
    const sharedBeforeAfterParams = {
      params,
      queryParams,
      navigate: this.navigate.bind(this)
    };

    // Before we enter the new route
    route?.before?.({
      route,
      ...sharedBeforeAfterParams
    });

    const oldRoute = this.currentRoute.route;

    this.currentRoute.path = path;
    this.currentRoute.route = route;
    this.currentRoute.params = params ?? {};
    this.currentRoute.queryParams = queryParams;

    // After we leave the route
    oldRoute?.after?.({
      route: oldRoute,
      ...sharedBeforeAfterParams
    });
  }

  public getFullRoute(path: string, queryParams?: Record<string, string>) {
    const queryString = queryParams ? '?' + new URLSearchParams(queryParams).toString() : '';
    return path + queryString;
  }

  public navigate(params: { path: string; queryParams?: Record<string, string> }) {
    let { matchedRoute } = this.matchRoute(params.path) ?? {};
    matchedRoute = matchedRoute ?? this.notFoundRoute;

    if (!matchedRoute) {
      console.error(`(Domy Router) Route not found for: "${params.path}".`);
      return;
    }

    const fullRoute = this.getFullRoute(params.path, params.queryParams);

    if (this.hashMode) {
      window.location.hash = fullRoute;
    } else {
      window.history.pushState({}, '', fullRoute);
      this.handleRouteChange();
    }
  }

  public goBack() {
    window.history.back();
  }

  public goForward() {
    window.history.forward();
  }

  public getHelper() {
    const ctx = this;
    return {
      get path() {
        return ctx.currentRoute.path;
      },
      get fullPath() {
        return ctx.getFullRoute(ctx.currentRoute.path, ctx.currentRoute.queryParams);
      },
      get queryParams() {
        return ctx.currentRoute.queryParams;
      },
      get params() {
        return ctx.currentRoute.params;
      },
      navigate: this.push.bind(this),
      goBack: this.goBack.bind(this),
      goForward: this.goForward.bind(this)
    };
  }

  public createRouterLink(): Component {
    return window.DOMY.createComponent({
      props: ['!to', 'activeClass', 'queryParams'],
      html: `
        <a :href="getRoute()" @click.prevent="navigate" d-attrs="$attrs" :class="$router.path === $props.to ? [$props.activeClass] : []">
          <template d-for="children,index of $childrens" d-key="index" d-insert.render="children"></template>
        </a>
      `,
      app: () => {
        const props = window.DOMY.useProps()!;

        return {
          hashMode: this.hashMode,
          navigate: () => {
            this.navigate({ path: props.to, queryParams: props.queryParams });
          },
          getRoute: () => {
            return (this.hashMode ? '#' : '') + this.getFullRoute(props.to, props.queryParams);
          }
        };
      }
    });
  }

  public createRouterView(): Component {
    const components: Record<string, Component> = this.routes.reduce(
      (acc, route) => ({
        [route.name]: route.component,
        ...acc
      }),
      {}
    );
    if (this.notFoundRoute) components[this.notFoundRoute.name] = this.notFoundRoute.component;

    return window.DOMY.createComponent({
      props: ['d-transition'],
      html: `<template d-insert.render="getComponent()"></template>`,
      components,
      app: () => {
        const getComponent = () => {
          // In case we don't match any routes
          if (!this.currentRoute.route) {
            return null;
          }

          return document.createElement(this.currentRoute.route.name);
        };

        return { getComponent };
      }
    });
  }
}

/**
 * Router plugin
 * @param options
 * @returns
 *
 * @author yoannchb-pro
 */
function createRouter(options: Settings): {
  RouterView: Component;
  RouterLink: Component;
  router(domyPluginSetter: DomyPluginDefinition): void;
} {
  const router = new Router(options);

  return {
    RouterView: router.createRouterView(),
    RouterLink: router.createRouterLink(),

    router(domyPluginSetter: DomyPluginDefinition): void {
      domyPluginSetter.helper('router', () => router.getHelper());
    }
  };
}

export default createRouter;
