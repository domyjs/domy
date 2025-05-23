!(function (e, t) {
  'object' == typeof exports && 'undefined' != typeof module
    ? (module.exports = t())
    : 'function' == typeof define && define.amd
      ? define(t)
      : ((e = 'undefined' != typeof globalThis ? globalThis : e || self).DOMY = t());
})(this, function () {
  'use strict';
  function e(e) {
    return e
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/\s+/g, '-')
      .toLowerCase();
  }
  function t(...e) {
    console.error('(Domy Error)', ...e);
  }
  function n(e) {
    return e.startsWith(':') || e.startsWith('d-bind:');
  }
  function o(e) {
    return e.startsWith('@') || e.startsWith('d-on:');
  }
  function i(e, t) {
    const [n] = t.split(/[.:]/gi);
    if (!n.startsWith('d-')) return !1;
    const o = n.slice(2);
    return o in e.directives || o in e.prefixes;
  }
  function r(e, t) {
    return !n(t) && !i(e, t) && !o(t);
  }
  function s(e, t) {
    try {
      return { hasError: !1, result: e() };
    } catch (e) {
      return t && t(e), { hasError: !0, err: e };
    }
  }
  function a(e, t) {
    const n = () => {
      t();
    };
    return (
      e.addEventListener('animationend', n, { once: !0 }),
      e.addEventListener('transition', n, { once: !0 }),
      () => {
        e.removeEventListener('animationend', n), e.removeEventListener('transition', n), n();
      }
    );
  }
  class l {
    constructor(e) {
      (this.element = e),
        (this.name = null),
        (this.key = null),
        (this.pluginsData = new Map()),
        (this.transition = null),
        (this.cleanupTransition = null),
        (this.cleanups = []),
        (this.onElChangeCbList = []),
        (this.parentBlock = null);
    }
    getDataForPluginId(e) {
      return this.pluginsData.get(e);
    }
    setDataForPluginId(e, t) {
      this.pluginsData.set(e, t);
    }
    get el() {
      return this.element instanceof l ? this.element.el : this.element;
    }
    callCbForElementChange(e) {
      for (const t of this.onElChangeCbList) t(e);
    }
    createNewElementBlock() {
      return new l(this.el);
    }
    attachListener(e, t, n) {
      let o = this.el;
      this.el.addEventListener(e, t, n),
        this.onElementChange(i => {
          o.removeEventListener(e, t, n), i.addEventListener(e, t, n), (o = i);
        });
    }
    onElementChange(e) {
      this.onElChangeCbList.push(e);
    }
    setEl(e) {
      (this.element = e), this.callCbForElementChange(this.el);
    }
    applyTransition(e, t) {
      if ((this.cleanupTransition && this.cleanupTransition(), !this.transition)) return t && t();
      const n = this.transition[e];
      this.el.classList.add(n),
        (this.cleanupTransition = a(this.el, () => {
          this.el.classList.remove(n), t && t(), (this.cleanupTransition = null);
        }));
    }
    replaceWith(e) {
      const t = this.el;
      this.setEl(e), t.replaceWith(this.el);
    }
    remove() {
      this.applyTransition('outTransition', () => this.el.remove());
    }
    isTemplate() {
      return 'template' === this.el.tagName.toLowerCase();
    }
    addCleanup(e) {
      this.cleanups.push(e), this.parentBlock && this.parentBlock.addCleanup(e);
    }
    isTextNode() {
      return this.el.nodeType === Node.TEXT_NODE;
    }
    unmount() {
      for (const e of this.cleanups) s(e, e => t(e));
      (this.cleanups.length = 0), this.element instanceof l && this.element.unmount();
    }
  }
  const c = { Mounted: 'domy:element:mounted' };
  function u(e) {
    return e.replace(/\[(\w+)\]/g, '.$1').split('.');
  }
  function d(e, t, n) {
    const o = u(t);
    let i = e;
    for (const e of o) if (((i = null == i ? void 0 : i[e]), void 0 === i)) return n;
    return i;
  }
  function f(e) {
    const t = e.contextAsGlobal ? e.code : e.code.replace(/^this\./g, ''),
      n = t.endsWith('()'),
      o = t.replace(/\(\)$/g, '');
    let i = d(e.context, o);
    if ((n && (i = i()), e.returnResult)) return i;
  }
  function p(e) {
    let t = e.returnResult ? `return (${e.code});` : e.code;
    t = e.contextAsGlobal ? `with(this){ ${t} }` : t;
    return Function(t).call(e.context);
  }
  const h = new Map(),
    m = new Set();
  let v = null;
  function g(e) {
    const t = [];
    return (v = e => t.push(e)), e(), (v = null), t;
  }
  function b(e, t = !0) {
    m.add(e);
    const n = () =>
      (function (e) {
        m.has(e) && m.delete(e);
      })(e);
    return v && t && v({ type: 'global_watcher', clean: n }), n;
  }
  const y = Symbol(),
    k = Symbol(),
    C = Symbol();
  class N {
    constructor(e) {
      (this.target = e),
        (this.name = ''),
        (this.proxy = null),
        (this.onSetListeners = new Set()),
        (this.onGetListeners = new Set());
    }
    getProxy() {
      return this.proxy || (this.proxy = this.createProxy(this.target)), this.proxy;
    }
    static isReactive(e) {
      return !!(null == e ? void 0 : e[y]);
    }
    static isSignal(e) {
      return (null == e ? void 0 : e[k]) && 'value' in e;
    }
    static shouldBeSkip(e) {
      return null == e ? void 0 : e[C];
    }
    clearListeners() {
      this.onGetListeners.clear(), this.onSetListeners.clear();
    }
    attachListener(e) {
      return (
        ('onGet' === e.type ? this.onGetListeners : this.onSetListeners).add(e.fn),
        () => this.removeListener(e)
      );
    }
    removeListener(e) {
      ('onGet' === e.type ? this.onGetListeners : this.onSetListeners).delete(e.fn);
    }
    canAttachProxy(e) {
      return (
        null !== e &&
        'object' == typeof e &&
        ['Array', 'Object'].includes(e.constructor.name) &&
        !N.isReactive(e) &&
        !N.shouldBeSkip(e)
      );
    }
    isCollection(e) {
      return e instanceof Set || e instanceof WeakMap || e instanceof WeakSet || e instanceof Map;
    }
    createCollectionHandler(e) {
      const t = this;
      return {
        get(n, o, i) {
          if ('symbol' == typeof o) return Reflect.get(n, o, i);
          const r = Reflect.get(n, o, i),
            s = [...e, o];
          return 'function' == typeof r
            ? function (...i) {
                let a, l;
                switch (o) {
                  case 'add':
                    n instanceof Set && ((a = new Set(n)), (l = new Set(n).add(i[0])));
                    break;
                  case 'set':
                    n instanceof Map && ((a = new Map(n)), (l = new Map(n).set(i[0], i[1])));
                    break;
                  case 'delete':
                    n instanceof Set
                      ? ((a = new Set(n)), (l = new Set(n)), l.delete(i[0]))
                      : n instanceof Map && ((a = new Map(n)), (l = new Map(n)), l.delete(i[0]));
                    break;
                  case 'clear':
                    (n instanceof Set || n instanceof Map) &&
                      ((a = n instanceof Set ? new Set(n) : new Map(n)),
                      (l = n instanceof Set ? new Set() : new Map()));
                }
                const c = ['add', 'set'].includes(o),
                  u = i[i.length - 1];
                c && !N.isReactive(u) && (i[i.length - 1] = t.createProxy(u, s));
                const d = r.apply(n, i);
                return (
                  ['add', 'set', 'delete', 'clear'].includes(o) && t.callOnSetListeners(e, a, l), d
                );
              }
            : (t.callOnGetListeners(s), r);
        }
      };
    }
    createHandler(e) {
      const t = this;
      return {
        get(n, o, i) {
          if ('symbol' == typeof o) return Reflect.get(n, o, i);
          let r = Reflect.get(n, o, i);
          const s = [...e, o];
          return (
            N.isReactive(r) || ((r = t.createProxy(r, s)), Reflect.set(n, o, r)),
            t.callOnGetListeners(s),
            r
          );
        },
        set(n, o, i, r) {
          if ('symbol' == typeof o) return Reflect.set(n, o, i, r);
          const s = Reflect.get(n, o, r),
            a = [...e, o],
            l = Reflect.set(n, o, i, r);
          return l && !(s === i) && t.callOnSetListeners(a, s, i), l;
        },
        deleteProperty(n, o) {
          if ('symbol' == typeof o) return Reflect.deleteProperty(n, o);
          const i = n[o],
            r = [...e, o],
            s = Reflect.deleteProperty(n, o);
          return s && t.callOnSetListeners(r, i, void 0), s;
        },
        has(n, o) {
          const i = Reflect.has(n, o),
            r = [...e, o];
          return t.callOnGetListeners(r), i;
        },
        ownKeys(n) {
          const o = Reflect.ownKeys(n);
          return t.callOnGetListeners([...e]), o;
        }
      };
    }
    createProxy(e, t = []) {
      if (!this.canAttachProxy(e)) return e;
      const n = this.isCollection(e);
      return (
        Object.defineProperty(e, y, { enumerable: !1, writable: !0, value: !0, configurable: !0 }),
        new Proxy(e, n ? this.createCollectionHandler(t) : this.createHandler(t))
      );
    }
    callOnGetListeners(e) {
      if (N.IS_GLOBAL_LOCK) return;
      const t = { path: this.name + e.join('.'), reactiveVariable: this };
      for (const e of [...this.onGetListeners]) e(t);
    }
    callOnSetListeners(e, t, n) {
      if (N.IS_GLOBAL_LOCK) return;
      const o = {
        path: this.name + e.join('.'),
        prevValue: t,
        newValue: n,
        reactiveVariable: this
      };
      for (const e of [...this.onSetListeners]) e(o);
    }
  }
  function w(e) {
    return N.isReactive(e);
  }
  function S(e) {
    return N.isSignal(e);
  }
  function E(e, t) {
    const n = { isMatching: !1, params: {} },
      o = e.split('.'),
      i = t.split('.'),
      r = 'length' === i[i.length - 1],
      s = {};
    for (let e = 0; e < o.length; ++e) {
      if (!t[e]) return n;
      const a = o[e].match(/\{\w+\}/);
      if ('*' === o[e] || a) {
        if (a) {
          const t = a[0];
          s[t.substring(1, t.length - 1)] = i[e];
        }
      } else if ((e !== i.length - 1 || !r || isNaN(Number(o[e]))) && i[e] !== o[e]) return n;
    }
    return { isMatching: !0, params: s };
  }
  function A(e) {
    if (!N.isReactive(e)) return e;
    const t = h.get(e);
    return t ? (t.clearListeners(), h.delete(e), e) : e;
  }
  function L(e) {
    if (N.isReactive(e)) return e;
    const t = new N(e),
      n = t.getProxy();
    function o(e) {
      return t => {
        for (const n of m)
          if (n.type === e)
            try {
              n.fn(t);
            } catch (e) {
              console.error(e);
            }
      };
    }
    return (
      h.set(n, t),
      t.attachListener({ type: 'onGet', fn: o('onGet') }),
      t.attachListener({ type: 'onSet', fn: o('onSet') }),
      v && v({ type: 'reactive_variable_creation', reactiveVariable: t, clean: () => A(t) }),
      n
    );
  }
  function T(e) {
    const t = { value: e };
    return (
      Object.defineProperty(t, k, { enumerable: !1, writable: !1, value: !0, configurable: !0 }),
      L(t)
    );
  }
  function x(e, t) {
    const n = [];
    function o(t, o) {
      const i = {
          type: e.type,
          fn: t => {
            if (!o) return e.fn(t);
            E(o, t.path).isMatching && e.fn(t);
          }
        },
        r = t.attachListener(i);
      n.push(r);
    }
    const i = b({ type: 'onGet', fn: ({ path: e, reactiveVariable: t }) => o(t, e) }, !1),
      r = t();
    if ((i(), Array.isArray(r) && !w(r))) {
      for (const e of r)
        if (w(e)) {
          const t = h.get(e);
          t && o(t);
        }
    } else if (w(r)) {
      const e = h.get(r);
      e && o(e);
    }
    const s = () => {
      for (const e of n) e();
    };
    return v && v({ type: 'watcher', clean: s }), s;
  }
  function R(e) {
    return (
      Object.defineProperty(e, C, { enumerable: !1, writable: !1, value: !0, configurable: !0 }), e
    );
  }
  N.IS_GLOBAL_LOCK = !1;
  let D = 0;
  function O(e, t = {}) {
    ++D;
    const n = new Set();
    function o() {
      for (const e of n) e();
      n.clear();
    }
    return (
      (function i() {
        o();
        const r = D,
          s = new Map();
        let a = !1;
        const l = b(
          {
            type: 'onGet',
            fn: ({ path: e, reactiveVariable: l }) => {
              if (r !== D) return;
              const c = {
                  type: 'onSet',
                  fn: n => {
                    if (a) return;
                    E(n.path, e).isMatching &&
                      ((a = !0), t.onDepChange && t.onDepChange(o), t.noSelfUpdate || i());
                  }
                },
                u = s.get(l) || new Set();
              if (u.has(e)) return;
              u.add(e), s.set(l, u);
              n.add(() => l.removeListener(c)), l.attachListener(c);
            }
          },
          !1
        );
        try {
          e(), --D;
        } finally {
          l();
        }
      })(),
      v && v({ type: 'effect', clean: o }),
      o
    );
  }
  const $ = Symbol();
  function M(e) {
    return !!(null == e ? void 0 : e[$]);
  }
  function I(e, t) {
    return {
      [$]: !0,
      get value() {
        return e();
      },
      set value(e) {
        if (!t)
          throw new Error(
            'You are trying to modify the "value" property of a computed, but this computed have no setter setuped.'
          );
        t(e);
      }
    };
  }
  var P = Object.freeze({
    __proto__: null,
    computed: I,
    globalWatch: b,
    isComputed: M,
    isReactive: w,
    isSignal: S,
    lockWatchers: function () {
      N.IS_GLOBAL_LOCK = !0;
    },
    matchPath: E,
    reactive: L,
    registerName: function (e, t) {
      for (const n of h.values()) if (n.getProxy() === t) return void (n.name = e + '.');
    },
    signal: T,
    skipReactive: R,
    trackDeps: g,
    unReactive: A,
    unlockWatchers: function () {
      N.IS_GLOBAL_LOCK = !1;
    },
    watch: x,
    watchEffect: O
  });
  function H(e) {
    return e.startsWith('d-') ? e.slice(2) : '';
  }
  function W(e) {
    const [t, ...n] = e.name.split('.');
    let o = '',
      i = t;
    return (
      i.includes(':') && ([o, i] = i.split(':')),
      { prefix: H(o), directive: H(i), modifiers: n, attrName: i.replace(/^@/, '') }
    );
  }
  function B(e, t) {
    return {
      enumerable: !0,
      configurable: !0,
      get: () => (S(e[t]) || M(e[t]) ? e[t].value : e[t]),
      set: n => (S(e[t]) || M(e[t]) ? (e[t].value = n) : (e[t] = n))
    };
  }
  const j = {
    callWithErrorHandling: s,
    toKebabCase: e,
    kebabToCamelCase: function (e) {
      return e
        .toLowerCase()
        .split('-')
        .map((e, t) => (0 === t ? e : e.charAt(0).toUpperCase() + e.slice(1)))
        .join('');
    },
    getElementVisibilityHandler: function (e) {
      const t = e.domy,
        n = t.block.el,
        o = new Comment('d-if position tracking, do not remove');
      n.before(o), n.remove();
      let i = t.block,
        r = !1;
      return {
        effect: function () {
          var s;
          const a = i.el.isConnected,
            l = e.shouldBeDisplay();
          if (a && !l) (i.transition = t.block.transition), i.remove(), i.unmount();
          else if (!a && l) {
            const e = n.cloneNode(!0);
            o.after(e),
              (i = t.deepRender({ element: e, scopedNodeData: t.scopedNodeData })),
              t.block.setEl(i),
              ((null === (s = t.block.transition) || void 0 === s ? void 0 : s.init) || r) &&
                t.block.applyTransition('enterTransition');
          }
          r = !0;
        },
        cleanup: () => {
          o.remove();
        }
      };
    },
    get: d,
    set: function (e, t, n) {
      const o = u(t);
      let i = e;
      for (let e = 0; e < o.length - 1; e++) {
        const t = o[e];
        (i[t] && 'object' == typeof i[t]) || (i[t] = /^\d+$/.test(o[e + 1]) ? [] : {}), (i = i[t]);
      }
      return (i[o[o.length - 1]] = n), e;
    },
    getPreviousConditionsElements: function (e, t) {
      const n = e.previousElementSibling;
      if (!n) return [];
      const o = [n];
      for (;;) {
        const e = o[o.length - 1].previousElementSibling;
        if (!e) break;
        let n = !1;
        for (const o of t) e.getAttribute(o) && (n = !0);
        if (!n) break;
        o.push(e);
      }
      return o;
    },
    executeActionAfterAnimation: a,
    getReactiveHandler: B,
    mergeToNegativeCondition: function (e) {
      return e.map(e => `!(${e})`).join(' && ');
    },
    fixeAttrName: function (e) {
      return e.replace(/^@/, 'd-on:').replace(/^:/, 'd-bind:');
    },
    getDomyAttributeInformations: W,
    isDomyAttr: i,
    isNormalAttr: r,
    isEventAttr: o,
    isBindAttr: n,
    warn: function (e) {
      console.warn('(Domy Warning)', e);
    },
    error: t
  };
  function G(e) {
    const t = {};
    for (const [n, o] of Object.entries(e.pluginHelper.PLUGINS.helpers))
      t['$' + n] = o({ ...e, ...P, utils: j });
    return t;
  }
  function _(e) {
    const t = { ...G(e) };
    for (const n in e.state.data) Object.defineProperty(t, n, B(e.state.data, n));
    for (const n of e.scopedNodeData) for (const e in n) Object.defineProperty(t, e, B(n, e));
    return t;
  }
  let U = !1,
    F = 0,
    V = 0;
  const q = [],
    K = Promise.resolve(),
    J = [],
    Q = new Map();
  function X() {
    for (U = !0; F < q.length; ++F) {
      s(q[F], e => t(e));
    }
    if (F < q.length) X();
    else {
      Q.clear(), (F = 0), (q.length = 0), (U = !1);
      for (const e of J) z(e.job, e.id);
      J.length = 0;
    }
  }
  function z(e, n) {
    var o;
    const i = null !== (o = Q.get(n)) && void 0 !== o ? o : 1;
    i > 100
      ? t(
          'A job as been skipped because it look like he is calling it self a bounch of times and exceed the max recursive amount (100).'
        )
      : (Q.set(n, i + 1), q.push(e), U || K.then(X));
  }
  function Y() {
    return ++V;
  }
  function Z(e, t = {}) {
    var n;
    let o = null;
    function i() {
      o = O(e, {
        onDepChange: e => {
          e(), z(i, t.effectId);
        },
        noSelfUpdate: !0
      });
    }
    return (
      (t.effectId = null !== (n = t.effectId) && void 0 !== n ? n : Y()),
      t.dontQueueOnFirstExecution ? i() : z(i, t.effectId),
      () => {
        o && (o(), (o = null));
      }
    );
  }
  const ee = { ...j, getHelpers: G, queuedWatchEffect: Z };
  let te = 0;
  class ne {
    constructor(e, t, n, o, i = [], r, s, a, l) {
      (this.appId = e),
        (this.deepRenderFn = t),
        (this.block = n),
        (this.state = o),
        (this.scopedNodeData = i),
        (this.config = r),
        (this.renderWithoutListeningToChange = s),
        (this.appState = a),
        (this.pluginHelper = l),
        (this.domyHelperId = ++te),
        (this.isUnmountCalled = !1),
        (this.cleanupFn = null),
        (this.clearEffectList = []),
        (this.prefix = ''),
        (this.directive = ''),
        (this.attrName = ''),
        (this.attr = { name: '', value: '' }),
        (this.modifiers = []);
    }
    getPluginHelper() {
      return {
        domyHelperId: this.domyHelperId,
        pluginHelper: this.pluginHelper,
        appState: this.appState,
        block: this.block,
        state: this.state,
        scopedNodeData: this.scopedNodeData,
        config: this.config,
        prefix: this.prefix,
        directive: this.directive,
        modifiers: this.modifiers,
        attrName: this.attrName,
        attr: this.attr,
        ...P,
        utils: ee,
        queueJob: z,
        getUniqueQueueId: Y,
        onElementMounted: this.onElementMounted.bind(this),
        onAppMounted: this.onAppMounted.bind(this),
        effect: this.effect.bind(this),
        cleanup: this.cleanup.bind(this),
        evaluate: this.evaluate.bind(this),
        deepRender: this.deepRenderFn,
        addScopeToNode: this.addScopeToNode.bind(this),
        removeScopeToNode: this.removeScopeToNode.bind(this),
        getContext: _
      };
    }
    copy() {
      return new ne(
        this.appId,
        this.deepRenderFn,
        this.block,
        this.state,
        [...this.scopedNodeData],
        this.config,
        this.renderWithoutListeningToChange,
        this.appState,
        this.pluginHelper
      );
    }
    setAttrInfos(e) {
      const t = W(e);
      (this.prefix = t.prefix),
        (this.directive = t.directive),
        (this.modifiers = t.modifiers),
        (this.attrName = t.attrName),
        (this.attr.name = e.name),
        (this.attr.value = e.value);
    }
    onElementMounted(e) {
      this.appState.isMounted ? e() : this.block.attachListener(c.Mounted, e, { once: !0 });
    }
    onAppMounted(e) {
      if (this.appState.isMounted) return e();
      const t = this.appState.addObserver({
        type: 'isMounted',
        callback: () => {
          this.appState.isMounted && (t(), e());
        }
      });
    }
    clearEffects() {
      for (const e of this.clearEffectList) e();
      this.clearEffectList.length = 0;
    }
    effect(e) {
      const n = () => {
        this.isUnmountCalled || ee.callWithErrorHandling(e, e => t(e));
      };
      if (this.renderWithoutListeningToChange) n();
      else {
        const e = ee.queuedWatchEffect(n, { dontQueueOnFirstExecution: !this.appState.isMounted });
        this.clearEffectList.push(e);
      }
    }
    cleanup(e) {
      this.cleanupFn = e;
    }
    evaluate(e, t) {
      const n = this.config.CSP ? f : p,
        o = _({
          domyHelperId: this.domyHelperId,
          el: this.block.el,
          state: this.state,
          scopedNodeData: t ? [...this.scopedNodeData, t] : this.scopedNodeData,
          config: this.config,
          pluginHelper: this.pluginHelper
        });
      return n({
        code: e,
        contextAsGlobal: !this.config.avoidDeprecatedWith,
        context: o,
        returnResult: !0
      });
    }
    addScopeToNode(e) {
      this.scopedNodeData.push(e);
    }
    removeScopeToNode(e) {
      const t = this.scopedNodeData.findIndex(t => t === e);
      -1 !== t && this.scopedNodeData.splice(t, 1);
    }
    getCleanupFn() {
      return this.callCleanup.bind(this);
    }
    callCleanup() {
      const e = Y();
      (this.isUnmountCalled = !0),
        z(() => {
          this.clearEffects(),
            'function' == typeof this.cleanupFn && this.cleanupFn(),
            (this.cleanupFn = null);
        }, e);
    }
  }
  function oe(t, n) {
    const o = [];
    n && o.push(n);
    for (const n in t) {
      const i = t[n],
        r = e(n);
      o.push(`${r}:${i}`);
    }
    return o.join('; ');
  }
  function ie(e, t) {
    const n = new Set((null != t ? t : '').split(/\s+/).filter(Boolean));
    if (Array.isArray(e)) for (const t of e) n.add(t);
    else for (const [t, o] of Object.entries(e)) o && n.add(t);
    return [...n].join(' ');
  }
  function re(e, t) {
    const n = {};
    for (const t of e.split(';').filter(Boolean)) {
      const [e, o] = t.split(':');
      n[e] = o;
    }
    for (const e in t) t[e] && n[e] && delete n[e];
    return Object.entries(n)
      .map(([e, t]) => `${e}:${t}`)
      .join(';');
  }
  function se(e, t) {
    const n = new Set((null != e ? e : '').split(/\s+/).filter(Boolean));
    if (Array.isArray(t)) for (const e of t) n.delete(e);
    else for (const [e, o] of Object.entries(t)) o && n.delete(e);
    return [...n].join(' ');
  }
  function ae(e) {
    const t = e.block.el,
      n = e.attrName,
      o = 'style' === n && t.getAttribute('style'),
      i = 'class' === n && t.getAttribute('class');
    if ('class' !== n && 'style' !== n && t.getAttribute(n))
      throw new Error(`Binding failed. The attribute "${n}" already exist on the element.`);
    let r = null;
    e.effect(() => {
      const s = e.evaluate(e.attr.value),
        a = 'object' == typeof s && null !== s;
      (r = s),
        a && 'style' === n
          ? (t.style = oe(s, o))
          : a && 'class' === n
            ? (t.className = ie(s, i))
            : t.setAttribute(n, s);
    }),
      e.cleanup(() => {
        const e = 'object' == typeof r && null !== r;
        e && 'style' === n
          ? (t.style = re(t.style.all, r))
          : e && 'class' === n
            ? (t.className = se(t.className, r))
            : t.removeAttribute(n);
      });
  }
  function le(e, t) {
    return n => t(e, n);
  }
  function ce(e) {
    const t = e.getUniqueQueueId(),
      n = e.attrName;
    let o = e.block.el,
      i = null;
    function r() {
      const r = (function (e) {
        var t;
        const n = null !== (t = e.options) && void 0 !== t ? t : {};
        let o = e.listener,
          i = e.el;
        const { el: r, eventName: s, modifiers: a } = e;
        a.includes('prevent') &&
          (o = le(o, (e, t) => {
            t.preventDefault(), e(t);
          })),
          a.includes('stop') &&
            (o = le(o, (e, t) => {
              t.stopPropagation(), e(t);
            })),
          a.includes('self') &&
            (o = le(o, (e, t) => {
              t.target === i && e(t);
            })),
          a.includes('passive') && (n.passive = !0),
          a.includes('capture') && (n.capture = !0),
          a.includes('once') && (n.once = !0);
        const l = /^\{(?<keys>.+?)\}$/gi,
          c = a.find(e => !!e.match(l));
        if (c) {
          const e = l
            .exec(c)
            .groups.keys.split(',')
            .map(e => e.toLocaleLowerCase());
          o = le(o, (t, n) => {
            'key' in n && e.find(e => e === n.key.toLowerCase()) && (n.preventDefault(), t(n));
          });
        }
        return (
          a.includes('away') &&
            ((i = document.body),
            (o = le(o, (e, t) => {
              r.isConnected && t.target !== r && !r.contains(t.target) && e(t);
            }))),
          { listenerTarget: i, eventName: s, listener: o, options: n }
        );
      })({
        el: o,
        eventName: n,
        listener: async n => {
          const o = { $event: n };
          e.queueJob(() => {
            const t = e.evaluate(e.attr.value, o);
            'function' == typeof t && t(n);
          }, t);
        },
        modifiers: e.modifiers
      });
      r.listenerTarget.addEventListener(r.eventName, r.listener, r.options),
        (i = () => r.listenerTarget.removeEventListener(r.eventName, r.listener, r.options));
    }
    r();
    const s = () => {
      i && i();
    };
    e.block.onElementChange(e => {
      s(), (o = e), r();
    }),
      e.cleanup(s);
  }
  function ue(e) {
    const t = e.pluginHelper.PLUGINS;
    if (e.prefix.length > 0) {
      const n = t.prefixes[e.prefix];
      return null == n ? void 0 : n(e);
    }
    if (e.utils.isBindAttr(e.attr.name)) return ae(e);
    if (e.utils.isEventAttr(e.attr.name)) return ce(e);
    if (e.utils.isDomyAttr(t, e.attr.name)) {
      const n = t.directives[e.directive];
      return null == n ? void 0 : n(e);
    }
  }
  function de(e) {
    var t;
    const n = null !== (t = e.block.el.textContent) && void 0 !== t ? t : '';
    e.effect(() => {
      e.block.el.textContent = n.replace(/\{\{\s*(?<org>.+?)\s*\}\}/g, function (t, n) {
        return e.evaluate(n);
      });
    });
  }
  function fe(e) {
    return t => e({ element: t, scopedNodeData: [] });
  }
  function pe() {
    const e = [];
    return {
      fn(t) {
        e.push(t);
      },
      clear() {
        e.length = 0;
      },
      getCallbacks: () => [...e]
    };
  }
  function he(e) {
    var t;
    return (null === (t = e.el) || void 0 === t ? void 0 : t.nodeType) === Node.TEXT_NODE
      ? e.el.parentNode
      : e.el;
  }
  function me(e) {
    var t;
    return null === (t = e.state.componentInfos) || void 0 === t ? void 0 : t.componentData.$attrs;
  }
  function ve(e) {
    var t;
    return null === (t = e.state.componentInfos) || void 0 === t ? void 0 : t.componentData.$props;
  }
  function ge(e) {
    var t;
    return null === (t = e.state.componentInfos) || void 0 === t ? void 0 : t.childrens;
  }
  function be(e) {
    return e.config;
  }
  function ye(e) {
    var t;
    return null === (t = e.state.componentInfos) || void 0 === t ? void 0 : t.names;
  }
  function ke(e) {
    var t, n, o, i;
    return (null === (t = e.el) || void 0 === t ? void 0 : t.nodeType) === Node.TEXT_NODE
      ? null === (o = null === (n = e.el) || void 0 === n ? void 0 : n.parentNode) || void 0 === o
        ? void 0
        : o.parentNode
      : null === (i = e.el) || void 0 === i
        ? void 0
        : i.parentNode;
  }
  function Ce(e) {
    return new Proxy(
      {},
      { get: (t, n, o) => ('symbol' == typeof n ? Reflect.get(t, n, o) : e.state.refs[n].el) }
    );
  }
  function Ne() {
    const e = Y();
    return t =>
      new Promise(n => {
        z(() => {
          'function' == typeof t && t(), n(!0);
        }, e);
      });
  }
  const we = (function () {
      const e = new Set();
      let n = null;
      return {
        getHook: o => (
          e.add(o),
          () => {
            if (n) return o(n);
            t('A helper hook as been call out of a domy app body.');
          }
        ),
        provideHookMandatories(e) {
          n = e;
        },
        clear() {
          e.clear();
        }
      };
    })(),
    Se = pe(),
    Ee = pe(),
    Ae = pe(),
    Le = pe(),
    Te = {
      onSetuped: Se.fn,
      onMounted: Ee.fn,
      onBeforeUnmount: Ae.fn,
      onUnmounted: Le.fn,
      useEl: we.getHook(he),
      useRoot: we.getHook(ke),
      useAttrs: we.getHook(me),
      useProps: we.getHook(ve),
      useChildrens: we.getHook(ge),
      useConfig: we.getHook(be),
      useNames: we.getHook(ye),
      useRefs: we.getHook(Ce),
      nextTick: Ne(),
      watch: (e, t) => {
        const n = Y();
        return x({ type: 'onSet', fn: t => z(() => e(t), n) }, t);
      },
      watchEffect: e => Z(e),
      globalWatch: e => {
        const t = Y();
        return b({ type: 'onSet', fn: n => z(() => e(n), t) });
      }
    };
  class xe {
    constructor() {
      (this.observers = []), (this.appState = { isSetuped: !1, isMounted: !1, isUnmounted: !1 });
    }
    get isMounted() {
      return this.appState.isMounted;
    }
    get isSetuped() {
      return this.appState.isSetuped;
    }
    get isUnmounted() {
      return this.appState.isUnmounted;
    }
    set isMounted(e) {
      (this.appState.isMounted = e), this.callObservers('isMounted');
    }
    set isSetuped(e) {
      (this.appState.isSetuped = e), this.callObservers('isSetuped');
    }
    set isUnmounted(e) {
      (this.appState.isUnmounted = e), this.callObservers('isUnmounted');
    }
    callObservers(e) {
      const t = this.observers.filter(t => t.type === e);
      for (const e of t) e.callback();
    }
    addObserver(e) {
      return this.observers.push(e), () => this.removeObserver(e);
    }
    removeObserver(e) {
      const t = this.observers.indexOf(e);
      1 !== t && this.observers.splice(t, 1);
    }
  }
  function Re(e) {
    let o = null;
    const i = new xe(),
      { components: a, config: u, target: d, app: f, componentInfos: p } = e,
      h = { data: {}, componentInfos: p, refs: {} };
    we.provideHookMandatories({ config: u, scopedNodeData: [], state: h, ...P, utils: j });
    let m = [];
    f && (m = g(() => (h.data = f()))), (i.isSetuped = !0);
    const v = Se.getCallbacks();
    Se.clear();
    for (const e of v) s(e);
    const b = (function (e, t, o, i, s, a) {
      return function u(d) {
        var f, p, h, m, v;
        const g = d.element instanceof l ? d.element : new l(d.element),
          b = g.el,
          y = [
            { element: b, scopedNodeData: null !== (f = d.scopedNodeData) && void 0 !== f ? f : [] }
          ];
        for (; y.length > 0; ) {
          let f = !1,
            k = null !== (p = d.skipChildRendering) && void 0 !== p && p,
            C = !1;
          const N = y.pop();
          if ('function' == typeof N) {
            N();
            continue;
          }
          const w = N.element,
            S = w === b ? g : new l(w);
          N.parentBlock && (S.parentBlock = N.parentBlock);
          const E = w.nextElementSibling;
          E
            ? E.dispatchEvent(new CustomEvent(c.Mounted))
            : y.push(() => S.el.dispatchEvent(new CustomEvent(c.Mounted)));
          let A = new ne(
            e,
            e => {
              const t = u(e);
              return (
                (e.element instanceof l ? e.element.el : e.element) === S.el &&
                  ((k = !0), (C = !0), (f = !0)),
                t
              );
            },
            S,
            o,
            N.scopedNodeData,
            i,
            null !== (h = d.renderWithoutListeningToChange) && void 0 !== h && h,
            t,
            a
          );
          if (w.nodeType === Node.TEXT_NODE) {
            /\{\{\s*(?<org>.+?)\s*\}\}/g.test(
              null !== (m = w.textContent) && void 0 !== m ? m : ''
            ) && (de(A.getPluginHelper()), S.addCleanup(A.getCleanupFn()));
            continue;
          }
          const L = w.localName in s,
            T = Array.from(null !== (v = w.attributes) && void 0 !== v ? v : []);
          for (const e of T) {
            if (!S.el.hasAttribute(e.name)) continue;
            if ((d.byPassAttributes && d.byPassAttributes.includes(e.name)) || r(a.PLUGINS, e.name))
              continue;
            if (L && (n(e.name) || r(a.PLUGINS, e.name))) continue;
            (A = A.copy()), A.setAttrInfos(e), w.removeAttribute(e.name);
            const t = ue(A.getPluginHelper());
            if (
              (S.addCleanup(A.getCleanupFn()),
              t &&
                (t.skipChildsRendering && (k = !0),
                t.skipComponentRendering && (C = !0),
                t.skipOtherAttributesRendering))
            )
              break;
            if (f) break;
          }
          if (C || !L) {
            if (!k)
              for (const e of w.childNodes)
                'SCRIPT' !== e.tagName &&
                  y.push({ parentBlock: S, element: e, scopedNodeData: A.scopedNodeData });
          } else
            (0, s[w.localName])({
              name: w.localName,
              componentElement: w,
              domy: A.getPluginHelper()
            }),
              S.addCleanup(A.getCleanupFn());
        }
        return g;
      };
    })(e.appId, i, h, u, a, e.pluginHelper);
    try {
      const t = b({ element: d, scopedNodeData: [], byPassAttributes: e.byPassAttributes });
      o = t.unmount.bind(t);
    } catch (e) {
      t(e);
    }
    i.isMounted = !0;
    const y = Ee.getCallbacks();
    Ee.clear();
    for (const e of y) s(e);
    const k = Y(),
      C = Ae.getCallbacks();
    Ae.clear();
    const N = Le.getCallbacks();
    return (
      Le.clear(),
      {
        render: fe(b),
        unmount() {
          for (const e of C) z(e, k);
          for (const e of m) e.clean();
          o && o(), (i.isUnmounted = !0);
          for (const e of N) z(e, k);
        }
      }
    );
  }
  function De(e) {
    const t = e.block.el,
      n = e.utils.getPreviousConditionsElements(t, ['d-if', 'd-else-if']);
    if (0 === n.length)
      throw new Error(`"${e.attrName}" should be preceded by "d-if" or "d-else-if" element.`);
    const o = e.utils.mergeToNegativeCondition(
        n.map(e => e.getAttribute('d-if') || e.getAttribute('d-else-if') || '')
      ),
      i = e.utils.getElementVisibilityHandler({
        shouldBeDisplay: () => e.evaluate(o) && e.evaluate(e.attr.value),
        domy: e
      });
    return (
      e.effect(i.effect),
      e.cleanup(i.cleanup),
      { skipChildsRendering: !0, skipOtherAttributesRendering: !0, skipComponentRendering: !0 }
    );
  }
  function Oe(e) {
    let t = 0,
      n = 0;
    const o = e.block.el,
      i = o.getAttribute('d-key'),
      r = new Comment('d-for start position tracking, do not remove'),
      s = new Comment('d-for end position tracking, do not remove');
    function a(e, t) {
      let n = r.nextSibling,
        o = 0;
      for (; n !== s && o < t; ) ++o, (n = n.nextSibling);
      n && n.before(e);
    }
    function l(t) {
      e.unReactive(t.reactiveIndex), t.render.remove(), t.render.unmount();
    }
    o.before(r),
      r.after(s),
      o.remove(),
      i ||
        e.utils.warn(
          `Elements inside the "${e.directive}" directive should be rendered with "key" directive.`
        );
    const c = /^(?<dest>\w+)(?:,\s*(?<index>\w+))?\s+(?<type>in|of)\s+(?<org>.+)$/i.exec(
      e.attr.value
    );
    if (!c) throw new Error(`Invalide "${e.attr.name}" attribute value: "${e.attr.value}".`);
    const u = 'in' === c.groups.type,
      d = [],
      f = new DocumentFragment();
    return (
      e.effect(() => {
        var r;
        const p = 0 === n,
          h = e.evaluate(c.groups.org),
          m = u ? Object.keys(h) : h;
        n = m.length;
        for (let n = 0; n < m.length; ++n) {
          const s = m[n];
          let l = { [c.groups.dest]: s };
          const u = null === (r = c.groups) || void 0 === r ? void 0 : r.index,
            h = u ? e.signal(n) : { value: n };
          if ((u && (l = { ...l, [u]: h }), i && !p)) {
            const o = e.evaluate(i, l),
              r = d.find(e => e.render.key === o);
            if (r) {
              const e = r.render.el;
              r.reactiveIndex.value !== n && (a(e, n), (r.reactiveIndex.value = n)), (r.loopId = t);
              continue;
            }
          }
          const v = o.cloneNode(!0);
          p ? f.appendChild(v) : a(v, n);
          const g = {
            render: e.deepRender({ element: v, scopedNodeData: [...e.scopedNodeData, l] }),
            reactiveIndex: h,
            loopId: t
          };
          d.push(g);
        }
        if ((p && s.before(f), !p)) for (const e of d) e.loopId !== t && l(e);
        t += 1;
      }),
      e.cleanup(() => {
        r.remove(), s.remove();
        for (const e of d) l(e);
      }),
      { skipChildsRendering: !0, skipComponentRendering: !0, skipOtherAttributesRendering: !0 }
    );
  }
  function $e(e) {
    e.effect(() => {
      e.block.el.innerHTML = e.evaluate(e.attr.value);
    });
  }
  function Me(e) {
    const t = e.utils.getElementVisibilityHandler({
      shouldBeDisplay: () => e.evaluate(e.attr.value),
      domy: e
    });
    return (
      e.effect(t.effect),
      e.cleanup(t.cleanup),
      { skipChildsRendering: !0, skipOtherAttributesRendering: !0, skipComponentRendering: !0 }
    );
  }
  function Ie() {
    return {
      skipChildsRendering: !0,
      skipOtherAttributesRendering: !0,
      skipComponentRendering: !0
    };
  }
  function Pe(e) {
    e.onElementMounted(() => {
      const t = e.block.el,
        n = e.modifiers.includes('lazy') ? 'change' : 'input',
        o = () =>
          (function (e) {
            var t, n;
            const o = e.block.el;
            let i = o.value;
            const r = e.evaluate(e.attr.value),
              s = Array.isArray(r);
            if ('SELECT' === o.tagName) {
              const e = o,
                r = e.multiple,
                s = e.selectedOptions;
              if (r) {
                i = [];
                for (const e of s) i.push(e.value);
              } else
                i =
                  null !== (n = null === (t = s[0]) || void 0 === t ? void 0 : t.value) &&
                  void 0 !== n
                    ? n
                    : '';
            } else if (('number' === o.type || e.modifiers.includes('number')) && i)
              (i = Number(i)), (i = isNaN(i) ? 0 : i);
            else if ('radio' === o.type) o.checked && (i = o.value);
            else if ('checkbox' === o.type) {
              const e = o.checked;
              i = s
                ? e && !r.includes(i)
                  ? [...r, i]
                  : !e && r.includes(i)
                    ? r.filter(e => e !== i)
                    : r
                : e;
            }
            const a = e.config,
              l = a.CSP,
              c = a.avoidDeprecatedWith;
            if (l) {
              const t = c ? e.attr.value.replace(/^this\./g, '') : e.attr.value,
                n = e.utils.get(e.state.data, t);
              e.isSignal(n) ? (n.value = i) : e.utils.set(e.state.data, t, i);
            } else e.evaluate(`(__val) => (${e.attr.value}) = __val`)(i);
          })(e);
      t.addEventListener(n, o),
        e.cleanup(() => {
          t.removeEventListener(n, o);
        }),
        e.effect(() => {
          const n = e.evaluate(e.attr.value),
            o = Array.isArray(n);
          if (o && 'SELECT' === t.tagName && t.multiple) {
            const e = t.querySelectorAll('option');
            for (const t of e) t.selected = n.includes(t.value);
          } else if (o && 'checkbox' === t.type) {
            const e = t;
            e.checked = n.includes(e.value);
          } else if ('checkbox' === t.type) {
            t.checked = n;
          } else if ('radio' === t.type) {
            const e = t;
            e.checked = e.value === n;
          } else t.value = n;
        });
    });
  }
  function He(e) {
    e.deepRender({
      element: e.block,
      scopedNodeData: e.scopedNodeData,
      renderWithoutListeningToChange: !0
    });
  }
  function We(e) {
    let t = e.modifiers.includes('dynamic') ? e.evaluate(e.attr.value) : e.attr.value;
    const n = () => {
      if (e.state.refs[t]) throw new Error(`A ref with the name "${t}" already exist.`);
      e.state.refs[t] = e.block;
    };
    e.modifiers.includes('dynamic') ? ((t = e.evaluate(e.attr.value)), n()) : n(),
      e.cleanup(() => {
        delete e.state.refs[t];
      });
  }
  function Be(e) {
    e.onElementMounted(() => {
      var t, n;
      let o = !1;
      const i = null === (t = e.block.transition) || void 0 === t ? void 0 : t.init,
        r = null !== (n = e.block.el.style.display) && void 0 !== n ? n : '';
      function s() {
        const t = e.block.el,
          n = e.evaluate(e.attr.value),
          s = 'none' !== t.style.display;
        n && !s
          ? ((t.style.display = r), (i || o) && e.block.applyTransition('enterTransition'))
          : s &&
            !n &&
            (i || o
              ? e.block.applyTransition('outTransition', () => {
                  t.style.display = 'none';
                })
              : (t.style.display = 'none')),
          (o = !0);
      }
      e.block.onElementChange(() => {
        s();
      }),
        e.effect(s);
    });
  }
  function je(e) {
    e.effect(() => {
      e.block.el.textContent = e.evaluate(e.attr.value);
    });
  }
  function Ge(e) {
    const t = e.modifiers.includes('dynamic'),
      n = () => {
        const n = t ? e.evaluate(e.attr.value) : e.attr.value;
        if (!n) return void (e.block.transition = null);
        const o = `${n}-enter`,
          i = `${n}-out`;
        e.block.transition = {
          enterTransition: o,
          outTransition: i,
          init: e.modifiers.includes('init')
        };
      };
    t ? e.effect(n) : n();
  }
  function _e(e) {
    const t = e.block.el,
      n = e.utils.getPreviousConditionsElements(t, ['d-if', 'd-else-if']);
    if (0 === n.length)
      throw new Error(`"${e.attrName}" should be preceded by "d-if" or "d-else-if" element.`);
    const o = e.utils.mergeToNegativeCondition(
        n.map(e => e.getAttribute('d-if') || e.getAttribute('d-else-if') || '')
      ),
      i = e.utils.getElementVisibilityHandler({ shouldBeDisplay: () => e.evaluate(o), domy: e });
    return (
      e.effect(i.effect),
      e.cleanup(i.cleanup),
      { skipChildsRendering: !0, skipOtherAttributesRendering: !0, skipComponentRendering: !0 }
    );
  }
  function Ue(e) {
    const t = e.evaluate(e.attr.value),
      n = e.reactive(t);
    e.addScopeToNode(n),
      e.cleanup(() => {
        e.unReactive(n);
      });
  }
  function Fe(e) {
    const t = e.evaluate(e.attr.value);
    'function' == typeof t && t();
  }
  function Ve(e) {
    if (!e.block.isTemplate())
      throw Error(`The directive "${e.directive}" should only be use on template element.`);
    function t() {
      const t = e.block.el,
        n = Array.from(t.content.childNodes),
        o = document.querySelector(e.attr.value);
      if (!o) throw Error(`Teleport canceled: can't find target "${e.attr.value}".`);
      const i = [];
      for (const t of n) {
        o.appendChild(t);
        const { unmount: n } = e.deepRender({ element: t, scopedNodeData: e.scopedNodeData });
        i.push(n);
      }
      e.cleanup(() => {
        for (const e of i) e();
      }),
        t.remove();
    }
    return e.modifiers.includes('defer') ? e.onAppMounted(t) : t(), { skipChildsRendering: !0 };
  }
  function qe(e) {
    e.onElementMounted(() => {
      const t = e.evaluate(e.attr.value);
      'function' == typeof t && t();
    });
  }
  function Ke(e) {
    e.cleanup(() => {
      const t = e.evaluate(e.attr.value);
      'function' == typeof t && t();
    });
  }
  function Je(e) {
    const t = e.modifiers.includes('render');
    let n = null,
      o = {};
    e.effect(() => {
      var i;
      const r = null !== (i = null == n ? void 0 : n.el) && void 0 !== i ? i : e.block.el,
        s = e.evaluate(e.attr.value);
      if ((n && n.unmount(), !t)) for (const e in o) r.removeAttribute(e);
      for (const e in s) {
        const t = s[e],
          n = 'string' != typeof t;
        r.setAttribute(e, n ? JSON.stringify(t) : t);
      }
      t &&
        (n = e.deepRender({
          element: r,
          scopedNodeData: e.scopedNodeData,
          skipChildRendering: e.appState.isMounted
        })),
        (o = { ...s });
    });
  }
  function Qe(e) {
    e.effect(() => {
      const t = e.evaluate(e.attr.value);
      e.block.key = t;
    });
  }
  function Xe(e) {
    if (!e.block.isTemplate())
      throw new Error(`The directive "${e.directive}" sould only be use on template element.`);
    const t = e.block.el,
      n = Array.from(t.content.childNodes),
      o = t.attributes,
      i = document.createElement('template');
    i.setAttribute('d-insert.render', '$createComponent()'),
      e.block.replaceWith(i),
      e.deepRender({
        element: e.block,
        scopedNodeData: [
          ...e.scopedNodeData,
          {
            $createComponent: function () {
              const t = e.evaluate(e.attr.value);
              if (!t) return null;
              const i = document.createElement(e.utils.kebabToCamelCase(t));
              for (const t of o) i.setAttribute(e.utils.fixeAttrName(t.name), t.value);
              for (const e of n) i.appendChild(e.cloneNode(!0));
              return i;
            }
          }
        ]
      });
  }
  function ze(e) {
    if (!e.block.isTemplate())
      throw new Error(`The directive "${e.directive}" sould only be use on template element.`);
    const t = e.modifiers.includes('render'),
      n = e.block.el,
      o = new Comment('d-insert position tracking, do not remove');
    n.before(o), n.remove();
    let i = null;
    return (
      e.cleanup(() => {
        o.remove();
      }),
      e.effect(() => {
        const n = e.evaluate(e.attr.value.trim());
        if (Array.isArray(n))
          throw new Error(`The directive "${e.directive}" only support one element as parameter.`);
        if ((i && ((i.transition = e.block.transition), i.remove(), i.unmount()), !n))
          return (i = null);
        o.after(n),
          t
            ? ((i = e.deepRender({ element: n, scopedNodeData: e.scopedNodeData })),
              e.block.setEl(i))
            : (e.block.setEl(n), (i = e.block.createNewElementBlock())),
          e.block.applyTransition('enterTransition');
      }),
      { skipChildsRendering: !0, skipComponentRendering: !0, skipOtherAttributesRendering: !0 }
    );
  }
  function Ye(e) {
    e.block.name = e.attr.value;
  }
  function Ze() {
    const e = {
        prefixes: { bind: ae, on: ce },
        directives: {
          key: Qe,
          attrs: Je,
          teleport: Ve,
          insert: ze,
          mounted: qe,
          unmount: Ke,
          setup: Fe,
          scope: Ue,
          if: Me,
          'else-if': De,
          else: _e,
          for: Oe,
          html: $e,
          text: je,
          model: Pe,
          ref: We,
          transition: Ge,
          ignore: Ie,
          once: He,
          show: Be,
          component: Xe,
          name: Ye
        },
        helpers: {
          el: he,
          refs: Ce,
          root: ke,
          nextTick: Ne,
          childrens: ge,
          props: ve,
          config: be,
          attrs: me,
          names: ye
        }
      },
      n = {
        prefix(t, n) {
          if (t in e.prefixes) throw new Error(`A prefix with the name "${t}" already exist.`);
          e.prefixes[t] = n;
        },
        directive(t, n) {
          if (t in e.directives) throw new Error(`A directive with the name "${t}" already exist.`);
          e.directives[t] = n;
        },
        helper(t, n) {
          if (t in e.helpers) throw new Error(`A special with the name "${t}" already exist.`);
          e.helpers[t] = n;
        }
      };
    return {
      PLUGINS: e,
      plugin: function (e) {
        s(
          () => e(n),
          e => t(e)
        );
      }
    };
  }
  let et = 0;
  function tt(t, n, o) {
    var i;
    ++et;
    const r = null !== (i = null == n ? void 0 : n.parentPluginHelper) && void 0 !== i ? i : Ze();
    let s = {},
      a = {};
    function l(e) {
      return (() => {
        const i = null != e ? e : document.body;
        return Re({
          appId: et,
          app: t,
          components: a,
          config: s,
          target: i,
          componentInfos: n,
          byPassAttributes: o,
          pluginHelper: r
        });
      })();
    }
    function c(e) {
      for (const t of e) r.plugin(t);
      return { components: u, mount: l };
    }
    function u(t) {
      const n = {};
      for (const o in t) {
        n[e(o)] = t[o];
      }
      return (a = n), { mount: l };
    }
    return {
      appId: et,
      mount: l,
      configure: function (e) {
        return (s = e), { plugins: c, components: u, mount: l };
      },
      components: u,
      plugins: c
    };
  }
  function nt(e) {
    for (const t of e) t();
  }
  const ot = {
    matchPath: E,
    signal: T,
    computed: I,
    skipReactive: R,
    helperToHookRegistrer: we,
    ...Te,
    createApp: function (e) {
      return tt(e);
    },
    createComponent: function (e) {
      var t;
      const n = null !== (t = e.props) && void 0 !== t ? t : [],
        o = new Set(n.map(e => e.replace(/^!/, '')));
      return ({ name: t, componentElement: i, domy: r }) => {
        const a = [];
        s(
          () => {
            const s = (function (e) {
              const t = document.createElement('div');
              return (t.innerHTML = e), t.childNodes;
            })(e.html.trim());
            if (1 !== s.length) throw new Error('The component can only have one element as root.');
            const l = s[0];
            if (l.getAttribute('d-for'))
              throw new Error(
                'The component can\'t have a "d-for" directive/attribute on the root element.'
              );
            const c = new Set(n.filter(e => e.startsWith('!')).map(e => e.slice(1)));
            r.block.replaceWith(l);
            const u = r.reactive({ $props: {}, $attrs: {} }),
              d = [],
              f = [];
            for (const e of i.attributes) {
              const t = e.name.replace(/^(:|d-bind:)/, ''),
                n = r.utils.kebabToCamelCase(t);
              if (o.has(n)) {
                c.delete(n), d.push(e);
                continue;
              }
              const { attrName: i } = r.utils.getDomyAttributeInformations(e),
                s = 'class' === i,
                a = 'style' === i;
              if (r.utils.isBindAttr(e.name)) {
                let t = null;
                r.effect(() => {
                  var n, o;
                  (t = r.evaluate(e.value)),
                    r.lockWatchers(),
                    (u.$attrs[i] = s
                      ? ie(t, null !== (n = u.$attrs[i]) && void 0 !== n ? n : '')
                      : a
                        ? oe(t, null !== (o = u.$attrs[i]) && void 0 !== o ? o : '')
                        : t),
                    r.unlockWatchers();
                }),
                  s &&
                    r.cleanup(() => {
                      u.$attrs[i] = se(u.$attrs.class, t);
                    }),
                  a &&
                    r.cleanup(() => {
                      u.$attrs[i] = re(u.$attrs.style, t);
                    });
              } else
                u.$attrs[i] = s
                  ? [u.$attrs[i], e.value].filter(Boolean).join(' ')
                  : a
                    ? [u.$attrs[i], e.value].filter(Boolean).join(';')
                    : e.value;
            }
            for (const e of c) throw Error(`The prop "${e}" is required on the component "${t}".`);
            for (const e of d) {
              const t = r.utils.getDomyAttributeInformations(e),
                n = r.utils.kebabToCamelCase(t.attrName);
              r.utils.isBindAttr(e.name)
                ? r.effect(() => {
                    const t = '' === e.value || r.evaluate(e.value);
                    u.$props[n] = t;
                  })
                : (u.$props[n] = '' === e.value || e.value);
            }
            const p = {},
              h = [];
            for (const e of i.children) {
              const t = r.deepRender({ element: e, scopedNodeData: r.scopedNodeData });
              a.push(t.unmount.bind(t)), h.push(t.el), t.name && (p[t.name] = t.el);
            }
            let m;
            const v = Y(),
              g = t => {
                const n = () => {
                  var n;
                  m && m();
                  const o = tt(
                    e.app,
                    {
                      componentData: u,
                      names: p,
                      childrens: h,
                      parentPluginHelper: r.pluginHelper
                    },
                    f
                  )
                    .configure(r.config)
                    .components(null !== (n = e.components) && void 0 !== n ? n : {})
                    .mount(t);
                  m = o.unmount;
                };
                r.appState.isMounted ? r.queueJob(n, v) : n();
              };
            g(l),
              r.block.onElementChange(e => {
                g(e);
              }),
              r.cleanup(() => {
                m && m(), nt(a), r.unReactive(u);
              });
          },
          e => {
            i.remove(), nt(a), r.utils.error(`Component "${t}":`, e);
          }
        );
      };
    }
  };
  return ot;
});
//# sourceMappingURL=index.js.map
