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
  function s(e, t) {
    return !n(t) && !i(e, t) && !o(t);
  }
  function r(e, t) {
    try {
      return { hasError: !1, result: e() };
    } catch (e) {
      return (t && t(e), { hasError: !0, err: e });
    }
  }
  function a(e, t) {
    const n = window.getComputedStyle(e),
      o = 'none' !== n.animationName,
      i = '0s' !== n.transitionDuration;
    return (
      o || i
        ? (e.addEventListener('animationend', t, { once: !0 }),
          e.addEventListener('transitionend', t, { once: !0 }))
        : t(),
      () => {
        (e.removeEventListener('animationend', t), e.removeEventListener('transitionend', t), t());
      }
    );
  }
  class l {
    constructor(e) {
      ((this.element = e),
        (this.name = null),
        (this.key = null),
        (this.pluginsData = new Map()),
        (this.transition = null),
        (this.cleanupTransition = null),
        (this.cleanups = []),
        (this.onElChangeCbList = []),
        (this.parentBlock = null));
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
      (this.el.addEventListener(e, t, n),
        this.onElementChange(i => {
          (o.removeEventListener(e, t, n), i.addEventListener(e, t, n), (o = i));
        }));
    }
    onElementChange(e) {
      this.onElChangeCbList.push(e);
    }
    setEl(e) {
      ((this.element = e), this.callCbForElementChange(this.el));
    }
    applyTransition(e, t) {
      if ((this.cleanupTransition && this.cleanupTransition(), !this.transition)) return t && t();
      const n = this.transition[e];
      (this.el.classList.add(n),
        requestAnimationFrame(() => {
          const o = this.transition[`${e}To`];
          (this.el.classList.add(o),
            (this.cleanupTransition = a(this.el, () => {
              (this.el.classList.remove(n),
                this.el.classList.remove(o),
                t && t(),
                (this.cleanupTransition = null));
            })));
        }));
    }
    replaceWith(e) {
      const t = this.el;
      (this.setEl(e), t.replaceWith(this.el));
    }
    remove() {
      this.applyTransition('outTransition', () => this.el.remove());
    }
    isTemplate() {
      return 'template' === this.el.tagName.toLowerCase();
    }
    addCleanup(e) {
      (this.cleanups.push(e), this.parentBlock && this.parentBlock.addCleanup(e));
    }
    isTextNode() {
      return this.el.nodeType === Node.TEXT_NODE;
    }
    unmount() {
      for (const e of this.cleanups) r(e, e => t(e));
      ((this.cleanups.length = 0), this.element instanceof l && this.element.unmount());
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
    return ((v = e => t.push(e)), e(), (v = null), t);
  }
  function b(e, t = !0) {
    m.add(e);
    const n = () =>
      (function (e) {
        m.has(e) && m.delete(e);
      })(e);
    return (v && t && v({ type: 'global_watcher', clean: n }), n);
  }
  const y = Symbol(),
    k = Symbol(),
    C = Symbol();
  class N {
    constructor(e) {
      ((this.target = e),
        (this.name = ''),
        (this.proxy = null),
        (this.onSetListeners = new Set()),
        (this.onGetListeners = new Set()));
    }
    getProxy() {
      return (this.proxy || (this.proxy = this.createProxy(this.target)), this.proxy);
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
      (this.onGetListeners.clear(), this.onSetListeners.clear());
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
      return null !== e && 'object' == typeof e && !N.isReactive(e) && !N.shouldBeSkip(e);
    }
    isCollection(e) {
      return e instanceof Set || e instanceof WeakMap || e instanceof WeakSet || e instanceof Map;
    }
    createCollectionHandler(e) {
      const t = this;
      return {
        get(n, o, i) {
          if ('symbol' == typeof o) return Reflect.get(n, o, i);
          const s = Reflect.get(n, o, i),
            r = [...e, o];
          return 'function' == typeof s
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
                c && !N.isReactive(u) && (i[i.length - 1] = t.createProxy(u, r));
                const d = s.apply(n, i);
                return (
                  ['add', 'set', 'delete', 'clear'].includes(o) && t.callOnSetListeners(e, a, l),
                  d
                );
              }
            : (t.callOnGetListeners(r), s);
        }
      };
    }
    createHandler(e) {
      const t = this;
      return {
        get(n, o, i) {
          if ('symbol' == typeof o) return Reflect.get(n, o, i);
          let s = Reflect.get(n, o, i);
          const r = [...e, o];
          return (
            N.isReactive(s) || ((s = t.createProxy(s, r)), Reflect.set(n, o, s)),
            t.callOnGetListeners(r),
            s
          );
        },
        set(n, o, i, s) {
          if ('symbol' == typeof o) return Reflect.set(n, o, i, s);
          const r = Reflect.get(n, o, s),
            a = [...e, o],
            l = Reflect.set(n, o, i, s);
          return (l && !(r === i) && t.callOnSetListeners(a, r, i), l);
        },
        deleteProperty(n, o) {
          if ('symbol' == typeof o) return Reflect.deleteProperty(n, o);
          const i = n[o],
            s = [...e, o],
            r = Reflect.deleteProperty(n, o);
          return (r && t.callOnSetListeners(s, i, void 0), r);
        },
        has(n, o) {
          const i = Reflect.has(n, o),
            s = [...e, o];
          return (t.callOnGetListeners(s), i);
        },
        ownKeys(n) {
          const o = Reflect.ownKeys(n);
          return (t.callOnGetListeners([...e]), o);
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
  function S(e) {
    return N.isReactive(e);
  }
  function E(e) {
    return N.isSignal(e);
  }
  function w(e, t) {
    const n = { isMatching: !1, params: {} },
      o = e.split('.'),
      i = t.split('.'),
      s = 'length' === i[i.length - 1],
      r = {};
    for (let e = 0; e < o.length; ++e) {
      if (!t[e]) return n;
      const a = o[e].match(/\{\w+\}/);
      if ('*' === o[e] || a) {
        if (a) {
          const t = a[0];
          r[t.substring(1, t.length - 1)] = i[e];
        }
      } else if ((e !== i.length - 1 || !s || isNaN(Number(o[e]))) && i[e] !== o[e]) return n;
    }
    return { isMatching: !0, params: r };
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
            w(o, t.path).isMatching && e.fn(t);
          }
        },
        s = t.attachListener(i);
      n.push(s);
    }
    const i = b({ type: 'onGet', fn: ({ path: e, reactiveVariable: t }) => o(t, e) }, !1),
      s = t();
    if ((i(), Array.isArray(s) && !S(s))) {
      for (const e of s)
        if (S(e)) {
          const t = h.get(e);
          t && o(t);
        }
    } else if (S(s)) {
      const e = h.get(s);
      e && o(e);
    }
    const r = () => {
      for (const e of n) e();
    };
    return (v && v({ type: 'watcher', clean: r }), r);
  }
  function R(e) {
    return (
      Object.defineProperty(e, C, { enumerable: !1, writable: !1, value: !0, configurable: !0 }),
      e
    );
  }
  N.IS_GLOBAL_LOCK = !1;
  let D = 0;
  function $(e, t = {}) {
    ++D;
    const n = new Set();
    function o() {
      for (const e of n) e();
      n.clear();
    }
    return (
      (function i() {
        o();
        const s = D,
          r = new Map();
        let a = !1;
        const l = b(
          {
            type: 'onGet',
            fn: ({ path: e, reactiveVariable: l }) => {
              if (s !== D) return;
              const c = {
                  type: 'onSet',
                  fn: n => {
                    if (a) return;
                    w(n.path, e).isMatching &&
                      ((a = !0), t.onDepChange && t.onDepChange(o), t.noSelfUpdate || i());
                  }
                },
                u = r.get(l) || new Set();
              if (u.has(e)) return;
              (u.add(e), r.set(l, u));
              (n.add(() => l.removeListener(c)), l.attachListener(c));
            }
          },
          !1
        );
        try {
          (e(), --D);
        } finally {
          l();
        }
      })(),
      v && v({ type: 'effect', clean: o }),
      o
    );
  }
  const O = Symbol();
  function M(e) {
    return !!(null == e ? void 0 : e[O]);
  }
  function I(e, t) {
    return {
      [O]: !0,
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
    isReactive: S,
    isSignal: E,
    lockWatchers: function () {
      N.IS_GLOBAL_LOCK = !0;
    },
    matchPath: w,
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
    watchEffect: $
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
      get: () => (E(e[t]) || M(e[t]) ? e[t].value : e[t]),
      set: n => (E(e[t]) || M(e[t]) ? (e[t].value = n) : (e[t] = n))
    };
  }
  function G(e, t = '') {
    const n = new Set(t.split(/\s+/).filter(Boolean)),
      o = new Set();
    if ('string' == typeof e)
      e.split(/\s+/).forEach(e => {
        (n.add(e), o.add(e));
      });
    else if (Array.isArray(e))
      e.forEach(e => {
        (n.add(e), o.add(e));
      });
    else if (e && 'object' == typeof e)
      for (const [t, i] of Object.entries(e)) i && (n.add(t), o.add(t));
    return {
      class: [...n].join(' '),
      cleanedClass: function (e) {
        return e
          .split(/\s+/)
          .filter(e => e && !o.has(e))
          .join(' ');
      }
    };
  }
  function j(t, n = '') {
    const o = new Set(),
      i = {};
    for (const e of n
      .split(';')
      .map(e => e.trim())
      .filter(Boolean)) {
      const [t, n] = e.split(':').map(e => e.trim());
      t && n && (i[t] = n);
    }
    if ('string' == typeof t)
      for (const e of t
        .split(';')
        .map(e => e.trim())
        .filter(Boolean)) {
        const [t, n] = e.split(':').map(e => e.trim());
        t && n && ((i[t] = n), o.add(t));
      }
    else if (t && 'object' == typeof t)
      for (const n in t) {
        const s = e(n);
        ((i[s] = t[n]), o.add(s));
      }
    return {
      style: Object.entries(i)
        .map(([e, t]) => `${e}:${t}`)
        .join('; '),
      cleanedStyle: function (e) {
        const t = {};
        for (const n of e
          .split(';')
          .map(e => e.trim())
          .filter(Boolean)) {
          const [e, i] = n.split(':').map(e => e.trim());
          e && i && !o.has(e) && (t[e] = i);
        }
        return Object.entries(t)
          .map(([e, t]) => `${e}:${t}`)
          .join('; ');
      }
    };
  }
  const _ = {
    handleClass: G,
    handleStyle: j,
    callWithErrorHandling: r,
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
      (n.before(o), n.remove());
      let i = t.block,
        s = !1;
      return {
        effect: function () {
          var r;
          const a = !!i.el.parentNode,
            l = e.shouldBeDisplay();
          if (a && !l) ((i.transition = t.block.transition), i.remove(), i.unmount());
          else if (!a && l) {
            const e = n.cloneNode(!0);
            (o.after(e),
              (i = t.deepRender({ element: e, scopedNodeData: t.scopedNodeData })),
              t.block.setEl(i),
              ((null === (r = t.block.transition) || void 0 === r ? void 0 : r.init) || s) &&
                t.block.applyTransition('enterTransition'));
          }
          s = !0;
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
        ((i[t] && 'object' == typeof i[t]) || (i[t] = /^\d+$/.test(o[e + 1]) ? [] : {}),
          (i = i[t]));
      }
      return ((i[o[o.length - 1]] = n), e);
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
    isNormalAttr: s,
    isEventAttr: o,
    isBindAttr: n,
    warn: function (e) {
      console.warn('(Domy Warning)', e);
    },
    error: t
  };
  function U(e) {
    const t = {};
    for (const [n, o] of Object.entries(e.pluginHelper.PLUGINS.helpers))
      t['$' + n] = o({ ...e, ...P, utils: _ });
    return t;
  }
  function F(e) {
    const t = { ...U(e) };
    for (const n in e.state.data) Object.defineProperty(t, n, B(e.state.data, n));
    for (const n of e.scopedNodeData) for (const e in n) Object.defineProperty(t, e, B(n, e));
    return t;
  }
  let K = !1,
    q = 0,
    V = 0;
  const X = [],
    J = Promise.resolve(),
    Q = [],
    z = new Map();
  function Y() {
    for (K = !0; q < X.length; ++q) {
      r(X[q], e => t(e));
    }
    if (q < X.length) Y();
    else {
      (z.clear(), (q = 0), (X.length = 0), (K = !1));
      for (const e of Q) Z(e.job, e.id);
      Q.length = 0;
    }
  }
  function Z(e, n) {
    var o;
    const i = null !== (o = z.get(n)) && void 0 !== o ? o : 1;
    i > 100
      ? t(
          'A job as been skipped because it look like he is calling it self a bounch of times and exceed the max recursive amount (100).'
        )
      : (z.set(n, i + 1), X.push(e), K || J.then(Y));
  }
  function ee() {
    return ++V;
  }
  function te(e, t = {}) {
    var n;
    let o = null;
    function i() {
      o = $(e, {
        onDepChange: e => {
          (e(), Z(i, t.effectId));
        },
        noSelfUpdate: !0
      });
    }
    return (
      (t.effectId = null !== (n = t.effectId) && void 0 !== n ? n : ee()),
      t.dontQueueOnFirstExecution ? i() : Z(i, t.effectId),
      () => {
        o && (o(), (o = null));
      }
    );
  }
  const ne = { ..._, getHelpers: U, queuedWatchEffect: te };
  let oe = 0;
  class ie {
    constructor(e, t, n, o, i = [], s, r, a, l) {
      ((this.appId = e),
        (this.deepRenderFn = t),
        (this.block = n),
        (this.state = o),
        (this.scopedNodeData = i),
        (this.config = s),
        (this.renderWithoutListeningToChange = r),
        (this.appState = a),
        (this.pluginHelper = l),
        (this.domyHelperId = ++oe),
        (this.isUnmountCalled = !1),
        (this.cleanupFn = null),
        (this.clearEffectList = []),
        (this.prefix = ''),
        (this.directive = ''),
        (this.attrName = ''),
        (this.attr = { name: '', value: '' }),
        (this.modifiers = []));
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
        utils: ne,
        queueJob: Z,
        getUniqueQueueId: ee,
        onElementMounted: this.onElementMounted.bind(this),
        onAppMounted: this.onAppMounted.bind(this),
        effect: this.effect.bind(this),
        cleanup: this.cleanup.bind(this),
        evaluate: this.evaluate.bind(this),
        deepRender: this.deepRenderFn,
        addScopeToNode: this.addScopeToNode.bind(this),
        removeScopeToNode: this.removeScopeToNode.bind(this),
        getContext: F
      };
    }
    copy() {
      return new ie(
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
      ((this.prefix = t.prefix),
        (this.directive = t.directive),
        (this.modifiers = t.modifiers),
        (this.attrName = t.attrName),
        (this.attr.name = e.name),
        (this.attr.value = e.value));
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
        this.isUnmountCalled || ne.callWithErrorHandling(e, e => t(e));
      };
      if (!this.renderWithoutListeningToChange) {
        const e = ne.queuedWatchEffect(n, { dontQueueOnFirstExecution: !this.appState.isMounted });
        return (this.clearEffectList.push(e), e);
      }
      n();
    }
    cleanup(e) {
      this.cleanupFn = e;
    }
    evaluate(e, t) {
      const n = this.config.CSP ? f : p,
        o = F({
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
      const e = ee();
      ((this.isUnmountCalled = !0),
        Z(() => {
          (this.clearEffects(),
            'function' == typeof this.cleanupFn && this.cleanupFn(),
            (this.cleanupFn = null));
        }, e));
    }
  }
  function se(e) {
    const t = e.block.el,
      n = e.attrName,
      o = 'style' === n,
      i = 'class' === n;
    if (!i && !o && t.getAttribute(n))
      throw new Error(`Binding failed. The attribute "${n}" already exist on the element.`);
    let s = null;
    (e.effect(() => {
      s && s();
      const r = e.evaluate(e.attr.value);
      if (o) {
        const e = j(r, t.style.cssText);
        ((s = () => t.setAttribute('style', e.cleanedStyle(t.style.cssText))),
          t.setAttribute('style', e.style));
      } else if (i) {
        const e = G(r, t.className);
        ((s = () => (t.className = e.cleanedClass(t.className))), (t.className = e.class));
      } else t.setAttribute(n, r);
    }),
      e.cleanup(() => {
        s ? s() : t.removeAttribute(n);
      }));
  }
  function re(e, t) {
    return n => t(e, n);
  }
  function ae(e) {
    const t = e.getUniqueQueueId(),
      n = e.attrName;
    let o = e.block.el,
      i = null;
    function s() {
      const s = (function (e) {
        var t;
        const n = null !== (t = e.options) && void 0 !== t ? t : {};
        let o = e.listener,
          i = e.el;
        const { el: s, eventName: r, modifiers: a } = e;
        (a.includes('prevent') &&
          (o = re(o, (e, t) => {
            (t.preventDefault(), e(t));
          })),
          a.includes('stop') &&
            (o = re(o, (e, t) => {
              (t.stopPropagation(), e(t));
            })),
          a.includes('self') &&
            (o = re(o, (e, t) => {
              t.target === i && e(t);
            })),
          a.includes('passive') && (n.passive = !0),
          a.includes('capture') && (n.capture = !0),
          a.includes('once') && (n.once = !0));
        const l = /^\{(?<keys>.+?)\}$/gi,
          c = a.find(e => !!e.match(l));
        if (c) {
          const e = l
            .exec(c)
            .groups.keys.split(',')
            .map(e => e.toLocaleLowerCase());
          o = re(o, (t, n) => {
            'key' in n && e.find(e => e === n.key.toLowerCase()) && (n.preventDefault(), t(n));
          });
        }
        return (
          a.includes('away') &&
            ((i = document.body),
            (o = re(o, (e, t) => {
              t.target === s || s.contains(t.target) || e(t);
            }))),
          { listenerTarget: i, eventName: r, listener: o, options: n }
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
      (s.listenerTarget.addEventListener(s.eventName, s.listener, s.options),
        (i = () => s.listenerTarget.removeEventListener(s.eventName, s.listener, s.options)));
    }
    s();
    const r = () => {
      i && i();
    };
    (e.block.onElementChange(e => {
      (r(), (o = e), s());
    }),
      e.cleanup(r));
  }
  function le(e) {
    const t = e.pluginHelper.PLUGINS;
    if (e.prefix.length > 0) {
      const n = t.prefixes[e.prefix];
      return null == n ? void 0 : n(e);
    }
    if (e.utils.isBindAttr(e.attr.name)) return se(e);
    if (e.utils.isEventAttr(e.attr.name)) return ae(e);
    if (e.utils.isDomyAttr(t, e.attr.name)) {
      const n = t.directives[e.directive];
      return null == n ? void 0 : n(e);
    }
  }
  function ce(e) {
    var t;
    const n = null !== (t = e.block.el.textContent) && void 0 !== t ? t : '';
    e.effect(() => {
      e.block.el.textContent = n.replace(/\{\{\s*(?<org>.+?)\s*\}\}/g, function (t, n) {
        return e.evaluate(n);
      });
    });
  }
  function ue(e) {
    return t => e({ element: t, scopedNodeData: [] });
  }
  function de() {
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
  function fe(e) {
    var t;
    return null === (t = e.state.componentInfos) || void 0 === t ? void 0 : t.componentData.$attrs;
  }
  function pe(e) {
    var t;
    return null === (t = e.state.componentInfos) || void 0 === t ? void 0 : t.componentData.$props;
  }
  function he(e) {
    var t;
    return null === (t = e.state.componentInfos) || void 0 === t ? void 0 : t.childrens;
  }
  function me(e) {
    return e.config;
  }
  function ve(e) {
    var t;
    return null === (t = e.state.componentInfos) || void 0 === t ? void 0 : t.names;
  }
  function ge(e) {
    return e.state.refs;
  }
  function be() {
    const e = ee();
    return t =>
      new Promise(n => {
        Z(() => {
          ('function' == typeof t && t(), n(!0));
        }, e);
      });
  }
  const ye = (function () {
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
    ke = de(),
    Ce = de(),
    Ne = de(),
    Se = de(),
    Ee = {
      onSetuped: ke.fn,
      onMounted: Ce.fn,
      onBeforeUnmount: Ne.fn,
      onUnmounted: Se.fn,
      useAttrs: ye.getHook(fe),
      useProps: ye.getHook(pe),
      useChildrens: ye.getHook(he),
      useConfig: ye.getHook(me),
      useNames: ye.getHook(ve),
      useRefs: ye.getHook(ge),
      nextTick: be(),
      watch: (e, t) => {
        const n = ee();
        return x({ type: 'onSet', fn: t => Z(() => e(t), n) }, t);
      },
      watchEffect: e => te(e),
      globalWatch: e => {
        const t = ee();
        return b({ type: 'onSet', fn: n => Z(() => e(n), t) });
      }
    };
  class we {
    constructor() {
      ((this.observers = []), (this.appState = { isSetuped: !1, isMounted: !1, isUnmounted: !1 }));
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
      ((this.appState.isMounted = e), this.callObservers('isMounted'));
    }
    set isSetuped(e) {
      ((this.appState.isSetuped = e), this.callObservers('isSetuped'));
    }
    set isUnmounted(e) {
      ((this.appState.isUnmounted = e), this.callObservers('isUnmounted'));
    }
    callObservers(e) {
      const t = this.observers.filter(t => t.type === e);
      for (const e of t) e.callback();
    }
    addObserver(e) {
      return (this.observers.push(e), () => this.removeObserver(e));
    }
    removeObserver(e) {
      const t = this.observers.indexOf(e);
      1 !== t && this.observers.splice(t, 1);
    }
  }
  function Ae(e) {
    let o = null;
    const i = new we(),
      { components: a, config: u, target: d, app: f, componentInfos: p } = e,
      h = { data: {}, componentInfos: p, refs: L({}) };
    ye.provideHookMandatories({ config: u, scopedNodeData: [], state: h, ...P, utils: _ });
    let m = [];
    (f &&
      (m = g(() => {
        var e;
        return (h.data = null !== (e = f()) && void 0 !== e ? e : {});
      })),
      (i.isSetuped = !0));
    const v = ke.getCallbacks();
    ke.clear();
    for (const e of v) r(e);
    const b = (function (e, t, o, i, r, a) {
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
          const S = N.element,
            E = S === b ? g : new l(S);
          N.parentBlock && (E.parentBlock = N.parentBlock);
          const w = S.nextElementSibling;
          w
            ? w.dispatchEvent(new CustomEvent(c.Mounted))
            : y.push(() => E.el.dispatchEvent(new CustomEvent(c.Mounted)));
          let A = new ie(
            e,
            e => {
              const t = u(e);
              return (
                (e.element instanceof l ? e.element.el : e.element) === E.el &&
                  ((k = !0), (C = !0), (f = !0)),
                t
              );
            },
            E,
            o,
            N.scopedNodeData,
            i,
            null !== (h = d.renderWithoutListeningToChange) && void 0 !== h && h,
            t,
            a
          );
          if (S.nodeType === Node.TEXT_NODE) {
            /\{\{\s*(?<org>.+?)\s*\}\}/g.test(
              null !== (m = S.textContent) && void 0 !== m ? m : ''
            ) && (ce(A.getPluginHelper()), E.addCleanup(A.getCleanupFn()));
            continue;
          }
          const L = S.localName in r,
            T = Array.from(null !== (v = S.attributes) && void 0 !== v ? v : []);
          for (const e of T) {
            if (!E.el.hasAttribute(e.name)) continue;
            if ((d.byPassAttributes && d.byPassAttributes.includes(e.name)) || s(a.PLUGINS, e.name))
              continue;
            if (L && (n(e.name) || s(a.PLUGINS, e.name))) continue;
            ((A = A.copy()), A.setAttrInfos(e), S.removeAttribute(e.name));
            const t = le(A.getPluginHelper());
            if (
              (E.addCleanup(A.getCleanupFn()),
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
              for (const e of S.childNodes)
                'SCRIPT' !== e.tagName &&
                  y.push({ parentBlock: E, element: e, scopedNodeData: A.scopedNodeData });
          } else
            ((0, r[S.localName])({
              name: S.localName,
              componentElement: S,
              domy: A.getPluginHelper()
            }),
              E.addCleanup(A.getCleanupFn()));
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
    const y = Ce.getCallbacks();
    Ce.clear();
    for (const e of y) r(e);
    const k = ee(),
      C = Ne.getCallbacks();
    Ne.clear();
    const N = Se.getCallbacks();
    return (
      Se.clear(),
      {
        render: ue(b),
        unmount() {
          for (const e of C) Z(e, k);
          for (const e of m) e.clean();
          (o && o(), (i.isUnmounted = !0));
          for (const e of N) Z(e, k);
        }
      }
    );
  }
  function Le(e) {
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
  function Te(e, t, n, o) {
    const i = [];
    let s = n.nextSibling;
    for (; s && s !== o; )
      (s.nodeType === Node.ELEMENT_NODE && s !== e && i.push(s), (s = s.nextSibling));
    const r = i[t] || o;
    e.nextSibling !== r && r.before(e);
  }
  function xe(e) {
    let t = 0;
    const n = e.block.el,
      o = n.getAttribute('d-key'),
      i = new Comment('d-for start position tracking, do not remove'),
      s = new Comment('d-for end position tracking, do not remove');
    function r(t) {
      (e.unReactive(t.reactiveIndex), t.render.remove(), t.render.unmount());
    }
    (n.before(i),
      i.after(s),
      n.remove(),
      o ||
        e.utils.warn(
          `Elements inside the "${e.directive}" directive should be rendered with "key" directive.`
        ));
    const a = /^(?<dest>\w+)(?:,\s*(?<index>\w+))?\s+(?<type>in|of)\s+(?<org>.+)$/i.exec(
      e.attr.value
    );
    if (!a) throw new Error(`Invalide "${e.attr.name}" attribute value: "${e.attr.value}".`);
    const l = 'in' === a.groups.type,
      c = [],
      u = new Map();
    return (
      e.effect(() => {
        var d;
        t += 1;
        const f = e.evaluate(a.groups.org),
          p = l ? Object.keys(f) : f,
          h = [],
          m = [];
        let v = !0;
        for (let i = 0; i < p.length; ++i) {
          const s = p[i];
          let r = { [a.groups.dest]: s };
          const l = null === (d = a.groups) || void 0 === d ? void 0 : d.index,
            f = l ? e.signal(i) : { value: i };
          l && (r = { ...r, [l]: f });
          let g = null;
          if (o) {
            g = e.evaluate(o, r);
            const n = u.get(g);
            if (n) {
              v = !1;
              const e = n.render.el;
              (n.reactiveIndex.value !== i && (n.reactiveIndex.value = i),
                h.push({ element: e, index: i }),
                (n.loopId = t));
              continue;
            }
          }
          const b = n.cloneNode(!0);
          (h.push({ element: b, index: i }),
            m.push(() => {
              const n = {
                render: e.deepRender({ element: b, scopedNodeData: [...e.scopedNodeData, r] }),
                reactiveIndex: f,
                loopId: t
              };
              return (c.push(n), g && ((n.currentKey = g), u.set(g, n)), n);
            }));
        }
        for (let e = c.length - 1; e >= 0; --e) {
          const n = c[e];
          n.loopId !== t && (n.currentKey && u.delete(n.currentKey), c.splice(e, 1), r(n));
        }
        if (v) {
          const e = document.createDocumentFragment();
          for (const { element: t } of h) e.appendChild(t);
          i.after(e);
        } else for (const { element: e, index: t } of h) Te(e, t, i, s);
        for (const e of m) e();
      }),
      e.cleanup(() => {
        (i.remove(), s.remove());
        for (const e of c) r(e);
      }),
      { skipChildsRendering: !0, skipComponentRendering: !0, skipOtherAttributesRendering: !0 }
    );
  }
  function Re(e) {
    e.effect(() => {
      e.block.el.innerHTML = e.evaluate(e.attr.value);
    });
  }
  function De(e) {
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
  function $e() {
    return {
      skipChildsRendering: !0,
      skipOtherAttributesRendering: !0,
      skipComponentRendering: !0
    };
  }
  function Oe(e) {
    e.onElementMounted(() => {
      const t = e.block.el,
        n = e.modifiers.includes('lazy') ? 'change' : 'input',
        o = () =>
          (function (e) {
            var t, n;
            const o = e.block.el;
            let i = o.value;
            const s = e.evaluate(e.attr.value),
              r = Array.isArray(s);
            if ('SELECT' === o.tagName) {
              const e = o,
                s = e.multiple,
                r = e.selectedOptions;
              if (s) {
                i = [];
                for (const e of r) i.push(e.value);
              } else
                i =
                  null !== (n = null === (t = r[0]) || void 0 === t ? void 0 : t.value) &&
                  void 0 !== n
                    ? n
                    : '';
            } else if (('number' === o.type || e.modifiers.includes('number')) && i)
              ((i = Number(i)), (i = isNaN(i) ? 0 : i));
            else if ('radio' === o.type) o.checked && (i = o.value);
            else if ('checkbox' === o.type) {
              const e = o.checked;
              i = r
                ? e && !s.includes(i)
                  ? [...s, i]
                  : !e && s.includes(i)
                    ? s.filter(e => e !== i)
                    : s
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
      (t.addEventListener(n, o),
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
        }));
    });
  }
  function Me(e) {
    e.deepRender({
      element: e.block,
      scopedNodeData: e.scopedNodeData,
      renderWithoutListeningToChange: !0
    });
  }
  function Ie(e) {
    const t = e.modifiers.includes('dynamic');
    let n = e.attr.value,
      o = !0;
    function i() {
      o || delete e.state.refs[n];
    }
    function s() {
      if (e.state.refs[n]) throw new Error(`A ref with the name "${n}" already exist.`);
      r();
    }
    function r() {
      ((o = !1), (e.state.refs[n] = e.skipReactive(e.block.el)));
    }
    (t
      ? e.effect(() => {
          (i(), (n = e.evaluate(e.attr.value)), s());
        })
      : s(),
      e.block.onElementChange(r),
      e.cleanup(() => {
        i();
      }));
  }
  function Pe(e) {
    e.onElementMounted(() => {
      var t, n;
      let o = !1;
      const i = null === (t = e.block.transition) || void 0 === t ? void 0 : t.init,
        s = null !== (n = e.block.el.style.display) && void 0 !== n ? n : '';
      function r() {
        const t = e.block.el,
          n = e.evaluate(e.attr.value),
          r = 'none' !== t.style.display;
        (n && !r
          ? ((t.style.display = s), (i || o) && e.block.applyTransition('enterTransition'))
          : r &&
            !n &&
            (i || o
              ? e.block.applyTransition('outTransition', () => {
                  t.style.display = 'none';
                })
              : (t.style.display = 'none')),
          (o = !0));
      }
      (e.block.onElementChange(() => {
        r();
      }),
        e.effect(r));
    });
  }
  function He(e) {
    e.effect(() => {
      e.block.el.textContent = e.evaluate(e.attr.value);
    });
  }
  function We(e) {
    const t = e.modifiers.includes('dynamic'),
      n = () => {
        const n = t ? e.evaluate(e.attr.value) : e.attr.value;
        if (!n) return void (e.block.transition = null);
        const o = `${n}-enter`,
          i = `${o}-to`,
          s = `${n}-out`,
          r = `${s}-to`;
        e.block.transition = {
          enterTransition: o,
          enterTransitionTo: i,
          outTransition: s,
          outTransitionTo: r,
          init: e.modifiers.includes('init')
        };
      };
    t ? e.effect(n) : n();
  }
  function Be(e) {
    var t;
    return (null === (t = e.el) || void 0 === t ? void 0 : t.nodeType) === Node.TEXT_NODE
      ? e.el.parentNode
      : e.el;
  }
  function Ge(e) {
    var t, n, o, i;
    return (null === (t = e.el) || void 0 === t ? void 0 : t.nodeType) === Node.TEXT_NODE
      ? null === (o = null === (n = e.el) || void 0 === n ? void 0 : n.parentNode) || void 0 === o
        ? void 0
        : o.parentNode
      : null === (i = e.el) || void 0 === i
        ? void 0
        : i.parentNode;
  }
  function je(e) {
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
  function _e(e) {
    const t = e.evaluate(e.attr.value),
      n = e.reactive(t);
    (e.addScopeToNode(n),
      e.cleanup(() => {
        e.unReactive(n);
      }));
  }
  function Ue(e) {
    const t = e.evaluate(e.attr.value);
    'function' == typeof t && t();
  }
  function Fe(e) {
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
      (e.cleanup(() => {
        for (const e of i) e();
      }),
        t.remove());
    }
    return (e.modifiers.includes('defer') ? e.onAppMounted(t) : t(), { skipChildsRendering: !0 });
  }
  function Ke(e) {
    e.onElementMounted(() => {
      const t = e.evaluate(e.attr.value);
      'function' == typeof t && t();
    });
  }
  function qe(e) {
    e.cleanup(() => {
      const t = e.evaluate(e.attr.value);
      'function' == typeof t && t();
    });
  }
  function Ve(e) {
    const t = e.modifiers.includes('render');
    let n = null,
      o = {};
    e.effect(() => {
      var i;
      const s = null !== (i = null == n ? void 0 : n.el) && void 0 !== i ? i : e.block.el,
        r = e.evaluate(e.attr.value);
      if ((n && n.unmount(), !t)) for (const e in o) s.removeAttribute(e);
      for (const e in r) {
        const t = r[e],
          n = 'string' != typeof t;
        s.setAttribute(e, n ? JSON.stringify(t) : t);
      }
      (t &&
        (n = e.deepRender({
          element: s,
          scopedNodeData: e.scopedNodeData,
          skipChildRendering: e.appState.isMounted
        })),
        (o = { ...r }));
    });
  }
  function Xe(e) {
    e.effect(() => {
      const t = e.evaluate(e.attr.value);
      e.block.key = t;
    });
  }
  function Je(e) {
    if (!e.block.isTemplate())
      throw new Error(`The directive "${e.directive}" sould only be use on template element.`);
    const t = e.block.el,
      n = Array.from(t.content.childNodes),
      o = t.attributes,
      i = document.createElement('template');
    (i.setAttribute('d-insert.render', '$createComponent()'),
      e.block.replaceWith(i),
      e.deepRender({
        element: e.block,
        scopedNodeData: [
          ...e.scopedNodeData,
          {
            $createComponent: function () {
              const t = e.evaluate(e.attr.value);
              if (!t) return null;
              const i = document.createElement(e.utils.toKebabCase(t));
              for (const t of o) i.setAttribute(e.utils.fixeAttrName(t.name), t.value);
              for (const e of n) i.appendChild(e.cloneNode(!0));
              return i;
            }
          }
        ]
      }));
  }
  function Qe(e) {
    if (!e.block.isTemplate())
      throw new Error(`The directive "${e.directive}" sould only be use on template element.`);
    const t = e.modifiers.includes('render'),
      n = e.block.el,
      o = new Comment('d-insert position tracking, do not remove');
    (n.before(o), n.remove());
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
        (o.after(n),
          t
            ? ((i = e.deepRender({ element: n, scopedNodeData: e.scopedNodeData })),
              e.block.setEl(i))
            : (e.block.setEl(n), (i = e.block.createNewElementBlock())),
          e.block.applyTransition('enterTransition'));
      }),
      { skipChildsRendering: !0, skipComponentRendering: !0, skipOtherAttributesRendering: !0 }
    );
  }
  function ze(e) {
    e.block.name = e.attr.value;
  }
  function Ye() {
    const e = {
        prefixes: { bind: se, on: ae },
        directives: {
          key: Xe,
          attrs: Ve,
          teleport: Fe,
          insert: Qe,
          mounted: Ke,
          unmount: qe,
          setup: Ue,
          scope: _e,
          if: De,
          'else-if': Le,
          else: je,
          for: xe,
          html: Re,
          text: He,
          model: Oe,
          ref: Ie,
          transition: We,
          ignore: $e,
          once: Me,
          show: Pe,
          component: Je,
          name: ze
        },
        helpers: {
          el: Be,
          refs: ge,
          root: Ge,
          nextTick: be,
          childrens: he,
          props: pe,
          config: me,
          attrs: fe,
          names: ve
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
        r(
          () => e(n),
          e => t(e)
        );
      }
    };
  }
  let Ze = 0;
  function et(t, n, o) {
    var i;
    ++Ze;
    const s = null !== (i = null == n ? void 0 : n.parentPluginHelper) && void 0 !== i ? i : Ye();
    let r = {},
      a = {};
    function l(e) {
      return (() => {
        const i = null != e ? e : document.body;
        return Ae({
          appId: Ze,
          app: t,
          components: a,
          config: r,
          target: i,
          componentInfos: n,
          byPassAttributes: o,
          pluginHelper: s
        });
      })();
    }
    function c(e) {
      for (const t of e) s.plugin(t);
      return { components: u, mount: l };
    }
    function u(t) {
      const n = {};
      for (const o in t) {
        n[e(o)] = t[o];
      }
      return ((a = n), { mount: l });
    }
    return {
      appId: Ze,
      mount: l,
      configure: function (e) {
        return ((r = e), { plugins: c, components: u, mount: l });
      },
      components: u,
      plugins: c
    };
  }
  function tt(e) {
    for (const t of e) t();
  }
  const nt = {
    matchPath: w,
    signal: T,
    computed: I,
    skipReactive: R,
    helperToHookRegistrer: ye,
    ...Ee,
    createApp: function (e) {
      return et(e);
    },
    createComponent: function (e) {
      var t;
      const n = null !== (t = e.props) && void 0 !== t ? t : [],
        o = new Set(n.map(e => e.replace(/^!/, '')));
      return ({ name: t, componentElement: i, domy: s }) => {
        const a = [];
        r(
          () => {
            const r = (function (e) {
              const t = document.createElement('div');
              return ((t.innerHTML = e), t.childNodes);
            })(e.html.trim());
            if (1 !== r.length) throw new Error('The component can only have one element as root.');
            const l = r[0];
            if (l.getAttribute('d-for'))
              throw new Error(
                'The component can\'t have a "d-for" directive/attribute on the root element.'
              );
            const c = new Set(n.filter(e => e.startsWith('!')).map(e => e.slice(1))),
              u = s.reactive({ $props: {}, $attrs: {} }),
              d = [],
              f = [];
            for (const e of i.attributes) {
              const t = e.name.replace(/^(:|d-bind:)/, ''),
                n = s.utils.kebabToCamelCase(t);
              if (o.has(n)) {
                (c.delete(n), d.push(e));
                continue;
              }
              const { attrName: i } = s.utils.getDomyAttributeInformations(e),
                r = 'class' === i,
                a = 'style' === i;
              let l = null;
              if (s.utils.isBindAttr(e.name)) {
                let t = null;
                s.effect(() => {
                  var n, o;
                  if ((l && l(), (t = s.evaluate(e.value)), s.lockWatchers(), r)) {
                    const e = s.utils.handleClass(
                      t,
                      null !== (n = u.$attrs[i]) && void 0 !== n ? n : ''
                    );
                    ((l = () => (u.$attrs[i] = e.cleanedClass(u.$attrs[i]))),
                      (u.$attrs[i] = e.class));
                  } else if (a) {
                    const e = s.utils.handleStyle(
                      t,
                      null !== (o = u.$attrs[i]) && void 0 !== o ? o : ''
                    );
                    ((l = () => (u.$attrs[i] = e.cleanedStyle(u.$attrs[i]))),
                      (u.$attrs[i] = e.style));
                  } else u.$attrs[i] = t;
                  s.unlockWatchers();
                });
              } else
                u.$attrs[i] = r
                  ? [u.$attrs[i], e.value].filter(Boolean).join(' ')
                  : a
                    ? [u.$attrs[i], e.value].filter(Boolean).join(';')
                    : e.value;
            }
            for (const e of c) throw Error(`The prop "${e}" is required on the component "${t}".`);
            for (const e of d) {
              const t = s.utils.getDomyAttributeInformations(e),
                n = s.utils.kebabToCamelCase(t.attrName);
              s.utils.isBindAttr(e.name)
                ? s.effect(() => {
                    const t = '' === e.value || s.evaluate(e.value);
                    u.$props[n] = t;
                  })
                : (u.$props[n] = '' === e.value || e.value);
            }
            const p = s.reactive({}),
              h = s.reactive([]),
              m = [],
              v = () => {
                ((h.length = 0), h.push(...m.filter(Boolean)));
              },
              g = Array.from(i.childNodes).filter(e => {
                var t;
                return (
                  !(e.nodeType === Node.TEXT_NODE) ||
                  '' !== (null === (t = e.textContent) || void 0 === t ? void 0 : t.trim())
                );
              });
            for (let e = 0; e < g.length; ++e) {
              const t = g[e],
                n = s.deepRender({ element: t, scopedNodeData: s.scopedNodeData });
              (a.push(n.unmount.bind(n)), s.lockWatchers());
              let o = s.skipReactive(n.el);
              ((o = o.parentNode ? o : void 0),
                m.push(o),
                n.name && (p[n.name] = o),
                v(),
                n.onElementChange(t => {
                  const o = s.skipReactive(t);
                  ((m[e] = o), n.name && (p[n.name] = o), v());
                }),
                s.unlockWatchers());
            }
            let b;
            s.block.replaceWith(l);
            const y = ee(),
              k = t => {
                const n = () => {
                  var n;
                  b && b();
                  const o = et(
                    e.app,
                    {
                      componentData: u,
                      names: p,
                      childrens: h,
                      parentPluginHelper: s.pluginHelper
                    },
                    f
                  )
                    .configure(s.config)
                    .components(null !== (n = e.components) && void 0 !== n ? n : {})
                    .mount(t);
                  b = o.unmount;
                };
                s.appState.isMounted ? s.queueJob(n, y) : n();
              };
            (k(l),
              s.block.onElementChange(e => {
                k(e);
              }),
              s.cleanup(() => {
                (b && b(), tt(a), s.unReactive(u), s.unReactive(h), s.unReactive(p));
              }));
          },
          e => {
            (i.remove(), tt(a), s.utils.error(`Component "${t}":`, e));
          }
        );
      };
    }
  };
  return nt;
});
//# sourceMappingURL=index.js.map
