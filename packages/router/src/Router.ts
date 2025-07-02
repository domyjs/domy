/* eslint @typescript-eslint/no-this-alias: "off" */
import DOMY, { Component } from '@domyjs/domy';
import { toKebabCase } from './toKebabCase';
import { matchRoute } from './matchRoute';
import { generateRoute } from './generateRoute';

const _DOMY = () => (window as any).DOMY as typeof DOMY;

type BeforeAfterParams = {
  from: FullRouteInfos;
  to: FullRouteInfos;
};

export type BeforeAfterFn = (routeInfos: BeforeAfterParams) => void | RouteInfos | false;

type RouteInfos = {
  name?: string;
  path?: string;
  params?: Params;
  queryParams?: QueryParams;
};

type Route = {
  name: string;
  route: string;
  component: Component;
  before?: BeforeAfterFn;
  after?: BeforeAfterFn;
} & Record<string, any>;

type Params = Record<string, string>;
type QueryParams = Record<string, string>;

type FullRouteInfos = {
  name?: string;
  route?: Route;
  params?: Params;
  queryParams?: QueryParams;
};

export type Settings = {
  hashMode: boolean;
  routes: Route[];
};

export class Router {
  private routes = new Map<string, Route>();
  private hashMode: boolean;

  private currentRoute: { path: string; params?: Params; queryParams?: QueryParams; route?: Route };

  constructor(settings: Settings) {
    for (const route of settings.routes) {
      const fixedName = toKebabCase(route.name);
      this.routes.set(fixedName, route);
    }
    this.hashMode = settings.hashMode;

    this.currentRoute = _DOMY().signal({ path: '' }).value;

    this.init();
  }

  private init() {
    window.addEventListener('popstate', () => this.handleRouteChange());
    if (this.hashMode) window.addEventListener('hashchange', () => this.handleRouteChange());

    this.handleRouteChange(); // Initial route setup
  }

  private wrapBeforeAfter(name: 'before' | 'after', fn: BeforeAfterFn) {
    for (const route of this.routes.values()) {
      if (!route[name]) route[name] = fn;
      else {
        const originalFn = route[name];
        route[name] = (...params) => {
          originalFn(...params);
          fn(...params);
        };
      }
    }
  }

  public beforeEach(fn: BeforeAfterFn) {
    this.wrapBeforeAfter('before', fn);
  }

  public afterEach(fn: BeforeAfterFn) {
    this.wrapBeforeAfter('after', fn);
  }

  private handleRouteChange() {
    const path = this.getPath();
    const queryParams = this.getQueryParams();
    const { matchedRoute, params } = this.matchRoute(path) || {};
    this.push(path, matchedRoute, params, queryParams);
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

  private matchRoute(path: string): { matchedRoute: Route; params: Params } | null {
    for (const route of this.routes.values()) {
      const result = matchRoute(route.route, path);
      if (result.isMatching) return { matchedRoute: route, params: result.params };
    }
    return null;
  }

  private isEqual(from: FullRouteInfos, to: FullRouteInfos): boolean {
    const isSameName = from.name === to.name;
    const isSamePath = from.route?.route === to.route?.route;

    const isSameParams = JSON.stringify(from.params ?? {}) === JSON.stringify(to.params ?? {});
    const isSameQuery =
      JSON.stringify(from.queryParams ?? {}) === JSON.stringify(to.queryParams ?? {});

    return isSameName && isSamePath && isSameParams && isSameQuery;
  }

  private push(
    path: string,
    route?: Route,
    params?: Record<string, string>,
    queryParams?: QueryParams
  ) {
    const oldRoute = this.currentRoute.route;

    const from: FullRouteInfos = {
      name: oldRoute?.name,
      route: oldRoute,
      params: this.currentRoute.params,
      queryParams: this.currentRoute.queryParams
    };

    const to: FullRouteInfos = {
      name: route?.name,
      route,
      params,
      queryParams
    };

    if (this.isEqual(from, to)) return;

    const newDest = route?.before?.({ from, to });
    if (newDest === false) return this.replace(this.currentRoute);
    if (newDest) return this.replace(newDest);

    this.currentRoute.path = path;
    this.currentRoute.route = route;
    this.currentRoute.params = params ?? {};
    this.currentRoute.queryParams = queryParams ?? {};

    oldRoute?.after?.({ from, to });
  }

  public replace(routeInfos: RouteInfos) {
    const path = routeInfos.name
      ? this.routes.get(toKebabCase(routeInfos.name))?.route
      : routeInfos.path;

    if (!path) throw new Error(`(Router) Router not found: ${routeInfos.name ?? path}`);

    const { matchedRoute } = this.matchRoute(path) ?? {};

    if (!matchedRoute) throw new Error(`(Router) Route not found for: "${routeInfos.path}".`);

    const fullRoute = generateRoute(path, routeInfos.params, routeInfos.queryParams);

    if (this.hashMode) {
      window.location.replace('#' + fullRoute);
    } else {
      window.history.replaceState({}, '', fullRoute);
      this.push(path, matchedRoute, routeInfos.params, routeInfos.queryParams);
    }
  }

  public navigate(routeInfos: RouteInfos) {
    const path = routeInfos.name
      ? this.routes.get(toKebabCase(routeInfos.name))?.route
      : routeInfos.path;

    if (!path) throw new Error(`(Router) Router not found: ${routeInfos.name ?? path}`);

    const { matchedRoute } = this.matchRoute(path) ?? {};

    if (!matchedRoute) throw new Error(`(Router) Route not found for: "${routeInfos.path}".`);

    const fullRoute = generateRoute(path, routeInfos.params, routeInfos.queryParams);

    if (this.hashMode) {
      window.location.hash = fullRoute;
    } else {
      window.history.pushState({}, '', fullRoute);
      this.push(path, matchedRoute, routeInfos.params, routeInfos.queryParams);
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
        return generateRoute(
          ctx.currentRoute.path,
          ctx.currentRoute.params,
          ctx.currentRoute.queryParams
        );
      },
      get queryParams() {
        return ctx.currentRoute.queryParams;
      },
      get params() {
        return ctx.currentRoute.params;
      },
      navigate: this.navigate.bind(this),
      goBack: this.goBack.bind(this),
      goForward: this.goForward.bind(this)
    };
  }

  public createRouterLink(): Component {
    return _DOMY().createComponent({
      props: ['!to', 'activeClass', 'params', 'queryParams'],
      html: `
          <a :href="getRoute()" @click.prevent="navigate" d-attrs="$attrs" :class="className">
            <template d-for="children,index of $childrens" d-key="index" d-insert="children"></template>
          </a>
        `,
      app: () => {
        const props = _DOMY().useProps()!;

        const className = _DOMY().computed(() => {
          const isActive = props.to.startsWith('/')
            ? props.to === this.currentRoute.path
            : props.to === this.currentRoute.route?.name;
          return isActive ? props.activeClass : '';
        });

        return {
          hashMode: this.hashMode,
          className,
          navigate: () => {
            this.navigate({ path: props.to, params: props.params, queryParams: props.queryParams });
          },
          getRoute: () => {
            return (
              (this.hashMode ? '#' : '') + generateRoute(props.to, props.params, props.queryParams)
            );
          }
        };
      }
    });
  }

  public createRouterView(): Component {
    const components: Record<string, Component> = Array.from(this.routes.entries()).reduce(
      (acc, [name, route]) => ({
        [name]: route.component,
        ...acc
      }),
      {}
    );

    return _DOMY().createComponent({
      props: ['transition'],
      html: `<template d-transition.dynamic="$props.transition" d-component="componentName"></template>`,
      components,
      app: () => {
        const componentName = _DOMY().computed(() => {
          return this.currentRoute.route?.name ?? null;
        });
        return { componentName };
      }
    });
  }
}
