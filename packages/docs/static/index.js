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
      for (const e of this.cleanups) r(e, e => t(e));
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
                  ['add', 'set', 'delete', 'clear'].includes(o) && t.callOnSetListeners(e, a, l), d
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
          return l && !(r === i) && t.callOnSetListeners(a, r, i), l;
        },
        deleteProperty(n, o) {
          if ('symbol' == typeof o) return Reflect.deleteProperty(n, o);
          const i = n[o],
            s = [...e, o],
            r = Reflect.deleteProperty(n, o);
          return r && t.callOnSetListeners(s, i, void 0), r;
        },
        has(n, o) {
          const i = Reflect.has(n, o),
            s = [...e, o];
          return t.callOnGetListeners(s), i;
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
            E(o, t.path).isMatching && e.fn(t);
          }
        },
        s = t.attachListener(i);
      n.push(s);
    }
    const i = b({ type: 'onGet', fn: ({ path: e, reactiveVariable: t }) => o(t, e) }, !1),
      s = t();
    if ((i(), Array.isArray(s) && !w(s))) {
      for (const e of s)
        if (w(e)) {
          const t = h.get(e);
          t && o(t);
        }
    } else if (w(s)) {
      const e = h.get(s);
      e && o(e);
    }
    const r = () => {
      for (const e of n) e();
    };
    return v && v({ type: 'watcher', clean: r }), r;
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
                    E(n.path, e).isMatching &&
                      ((a = !0), t.onDepChange && t.onDepChange(o), t.noSelfUpdate || i());
                  }
                },
                u = r.get(l) || new Set();
              if (u.has(e)) return;
              u.add(e), r.set(l, u);
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
  function H(t, n) {
    const o = [];
    n && o.push(n);
    for (const n in t) {
      const i = t[n],
        s = e(n);
      o.push(`${s}:${i}`);
    }
    return o.join('; ');
  }
  function W(e, t) {
    const n = new Set((null != t ? t : '').split(/\s+/).filter(Boolean));
    if (Array.isArray(e)) for (const t of e) n.add(t);
    else for (const [t, o] of Object.entries(e)) o && n.add(t);
    return [...n].join(' ');
  }
  function B(e, t) {
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
  function j(e, t) {
    const n = new Set((null != e ? e : '').split(/\s+/).filter(Boolean));
    if (Array.isArray(t)) for (const e of t) n.delete(e);
    else for (const [e, o] of Object.entries(t)) o && n.delete(e);
    return [...n].join(' ');
  }
  function G(e) {
    const t = e.block.el,
      n = e.attrName,
      o = 'style' === n && t.getAttribute('style'),
      i = 'class' === n && t.getAttribute('class');
    if ('class' !== n && 'style' !== n && t.getAttribute(n))
      throw new Error(`Binding failed. The attribute "${n}" already exist on the element.`);
    let s = null;
    e.effect(() => {
      const r = e.evaluate(e.attr.value),
        a = 'object' == typeof r && null !== r;
      (s = r),
        a && 'style' === n
          ? (t.style = H(r, o))
          : a && 'class' === n
            ? (t.className = W(r, i))
            : t.setAttribute(n, r);
    }),
      e.cleanup(() => {
        const e = 'object' == typeof s && null !== s;
        e && 'style' === n
          ? (t.style = B(t.style.all, s))
          : e && 'class' === n
            ? (t.className = j(t.className, s))
            : t.removeAttribute(n);
      });
  }
  function _(e) {
    return e.startsWith('d-') ? e.slice(2) : '';
  }
  function U(e) {
    const [t, ...n] = e.name.split('.');
    let o = '',
      i = t;
    return (
      i.includes(':') && ([o, i] = i.split(':')),
      { prefix: _(o), directive: _(i), modifiers: n, attrName: i.replace(/^@/, '') }
    );
  }
  function F(e, t) {
    return {
      enumerable: !0,
      configurable: !0,
      get: () => (S(e[t]) || M(e[t]) ? e[t].value : e[t]),
      set: n => (S(e[t]) || M(e[t]) ? (e[t].value = n) : (e[t] = n))
    };
  }
  const V = {
    handleClass: W,
    handleStyle: H,
    handleRemoveClass: j,
    handleRemoveStyle: B,
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
      n.before(o), n.remove();
      let i = t.block,
        s = !1;
      return {
        effect: function () {
          var r;
          const a = i.el.isConnected,
            l = e.shouldBeDisplay();
          if (a && !l) (i.transition = t.block.transition), i.remove(), i.unmount();
          else if (!a && l) {
            const e = n.cloneNode(!0);
            o.after(e),
              (i = t.deepRender({ element: e, scopedNodeData: t.scopedNodeData })),
              t.block.setEl(i),
              ((null === (r = t.block.transition) || void 0 === r ? void 0 : r.init) || s) &&
                t.block.applyTransition('enterTransition');
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
    getReactiveHandler: F,
    mergeToNegativeCondition: function (e) {
      return e.map(e => `!(${e})`).join(' && ');
    },
    fixeAttrName: function (e) {
      return e.replace(/^@/, 'd-on:').replace(/^:/, 'd-bind:');
    },
    getDomyAttributeInformations: U,
    isDomyAttr: i,
    isNormalAttr: s,
    isEventAttr: o,
    isBindAttr: n,
    warn: function (e) {
      console.warn('(Domy Warning)', e);
    },
    error: t
  };
  function q(e) {
    const t = {};
    for (const [n, o] of Object.entries(e.pluginHelper.PLUGINS.helpers))
      t['$' + n] = o({ ...e, ...P, utils: V });
    return t;
  }
  function K(e) {
    const t = { ...q(e) };
    for (const n in e.state.data) Object.defineProperty(t, n, F(e.state.data, n));
    for (const n of e.scopedNodeData) for (const e in n) Object.defineProperty(t, e, F(n, e));
    return t;
  }
  let J = !1,
    Q = 0,
    X = 0;
  const z = [],
    Y = Promise.resolve(),
    Z = [],
    ee = new Map();
  function te() {
    for (J = !0; Q < z.length; ++Q) {
      r(z[Q], e => t(e));
    }
    if (Q < z.length) te();
    else {
      ee.clear(), (Q = 0), (z.length = 0), (J = !1);
      for (const e of Z) ne(e.job, e.id);
      Z.length = 0;
    }
  }
  function ne(e, n) {
    var o;
    const i = null !== (o = ee.get(n)) && void 0 !== o ? o : 1;
    i > 100
      ? t(
          'A job as been skipped because it look like he is calling it self a bounch of times and exceed the max recursive amount (100).'
        )
      : (ee.set(n, i + 1), z.push(e), J || Y.then(te));
  }
  function oe() {
    return ++X;
  }
  function ie(e, t = {}) {
    var n;
    let o = null;
    function i() {
      o = O(e, {
        onDepChange: e => {
          e(), ne(i, t.effectId);
        },
        noSelfUpdate: !0
      });
    }
    return (
      (t.effectId = null !== (n = t.effectId) && void 0 !== n ? n : oe()),
      t.dontQueueOnFirstExecution ? i() : ne(i, t.effectId),
      () => {
        o && (o(), (o = null));
      }
    );
  }
  const se = { ...V, getHelpers: q, queuedWatchEffect: ie };
  let re = 0;
  class ae {
    constructor(e, t, n, o, i = [], s, r, a, l) {
      (this.appId = e),
        (this.deepRenderFn = t),
        (this.block = n),
        (this.state = o),
        (this.scopedNodeData = i),
        (this.config = s),
        (this.renderWithoutListeningToChange = r),
        (this.appState = a),
        (this.pluginHelper = l),
        (this.domyHelperId = ++re),
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
        utils: se,
        queueJob: ne,
        getUniqueQueueId: oe,
        onElementMounted: this.onElementMounted.bind(this),
        onAppMounted: this.onAppMounted.bind(this),
        effect: this.effect.bind(this),
        cleanup: this.cleanup.bind(this),
        evaluate: this.evaluate.bind(this),
        deepRender: this.deepRenderFn,
        addScopeToNode: this.addScopeToNode.bind(this),
        removeScopeToNode: this.removeScopeToNode.bind(this),
        getContext: K
      };
    }
    copy() {
      return new ae(
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
      const t = U(e);
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
        this.isUnmountCalled || se.callWithErrorHandling(e, e => t(e));
      };
      if (this.renderWithoutListeningToChange) n();
      else {
        const e = se.queuedWatchEffect(n, { dontQueueOnFirstExecution: !this.appState.isMounted });
        this.clearEffectList.push(e);
      }
    }
    cleanup(e) {
      this.cleanupFn = e;
    }
    evaluate(e, t) {
      const n = this.config.CSP ? f : p,
        o = K({
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
      const e = oe();
      (this.isUnmountCalled = !0),
        ne(() => {
          this.clearEffects(),
            'function' == typeof this.cleanupFn && this.cleanupFn(),
            (this.cleanupFn = null);
        }, e);
    }
  }
  function le(e, t) {
    return n => t(e, n);
  }
  function ce(e) {
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
              s.isConnected && t.target !== s && !s.contains(t.target) && e(t);
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
      s.listenerTarget.addEventListener(s.eventName, s.listener, s.options),
        (i = () => s.listenerTarget.removeEventListener(s.eventName, s.listener, s.options));
    }
    s();
    const r = () => {
      i && i();
    };
    e.block.onElementChange(e => {
      r(), (o = e), s();
    }),
      e.cleanup(r);
  }
  function ue(e) {
    const t = e.pluginHelper.PLUGINS;
    if (e.prefix.length > 0) {
      const n = t.prefixes[e.prefix];
      return null == n ? void 0 : n(e);
    }
    if (e.utils.isBindAttr(e.attr.name)) return G(e);
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
    return null === (t = e.state.componentInfos) || void 0 === t ? void 0 : t.componentData.$attrs;
  }
  function me(e) {
    var t;
    return null === (t = e.state.componentInfos) || void 0 === t ? void 0 : t.componentData.$props;
  }
  function ve(e) {
    var t;
    return null === (t = e.state.componentInfos) || void 0 === t ? void 0 : t.childrens;
  }
  function ge(e) {
    return e.config;
  }
  function be(e) {
    var t;
    return null === (t = e.state.componentInfos) || void 0 === t ? void 0 : t.names;
  }
  function ye(e) {
    return new Proxy(
      {},
      { get: (t, n, o) => ('symbol' == typeof n ? Reflect.get(t, n, o) : e.state.refs[n].el) }
    );
  }
  function ke() {
    const e = oe();
    return t =>
      new Promise(n => {
        ne(() => {
          'function' == typeof t && t(), n(!0);
        }, e);
      });
  }
  const Ce = (function () {
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
    Ne = pe(),
    we = pe(),
    Se = pe(),
    Ee = pe(),
    Ae = {
      onSetuped: Ne.fn,
      onMounted: we.fn,
      onBeforeUnmount: Se.fn,
      onUnmounted: Ee.fn,
      useAttrs: Ce.getHook(he),
      useProps: Ce.getHook(me),
      useChildrens: Ce.getHook(ve),
      useConfig: Ce.getHook(ge),
      useNames: Ce.getHook(be),
      useRefs: Ce.getHook(ye),
      nextTick: ke(),
      watch: (e, t) => {
        const n = oe();
        return x({ type: 'onSet', fn: t => ne(() => e(t), n) }, t);
      },
      watchEffect: e => ie(e),
      globalWatch: e => {
        const t = oe();
        return b({ type: 'onSet', fn: n => ne(() => e(n), t) });
      }
    };
  class Le {
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
  function Te(e) {
    let o = null;
    const i = new Le(),
      { components: a, config: u, target: d, app: f, componentInfos: p } = e,
      h = { data: {}, componentInfos: p, refs: {} };
    Ce.provideHookMandatories({ config: u, scopedNodeData: [], state: h, ...P, utils: V });
    let m = [];
    f && (m = g(() => (h.data = f()))), (i.isSetuped = !0);
    const v = Ne.getCallbacks();
    Ne.clear();
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
          const w = N.element,
            S = w === b ? g : new l(w);
          N.parentBlock && (S.parentBlock = N.parentBlock);
          const E = w.nextElementSibling;
          E
            ? E.dispatchEvent(new CustomEvent(c.Mounted))
            : y.push(() => S.el.dispatchEvent(new CustomEvent(c.Mounted)));
          let A = new ae(
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
          const L = w.localName in r,
            T = Array.from(null !== (v = w.attributes) && void 0 !== v ? v : []);
          for (const e of T) {
            if (!S.el.hasAttribute(e.name)) continue;
            if ((d.byPassAttributes && d.byPassAttributes.includes(e.name)) || s(a.PLUGINS, e.name))
              continue;
            if (L && (n(e.name) || s(a.PLUGINS, e.name))) continue;
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
            (0, r[w.localName])({
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
    const y = we.getCallbacks();
    we.clear();
    for (const e of y) r(e);
    const k = oe(),
      C = Se.getCallbacks();
    Se.clear();
    const N = Ee.getCallbacks();
    return (
      Ee.clear(),
      {
        render: fe(b),
        unmount() {
          for (const e of C) ne(e, k);
          for (const e of m) e.clean();
          o && o(), (i.isUnmounted = !0);
          for (const e of N) ne(e, k);
        }
      }
    );
  }
  function xe(e) {
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
  function Re(e) {
    let t = 0,
      n = 0;
    const o = e.block.el,
      i = o.getAttribute('d-key'),
      s = new Comment('d-for start position tracking, do not remove'),
      r = new Comment('d-for end position tracking, do not remove');
    function a(e, t) {
      let n = s.nextSibling,
        o = 0;
      for (; n !== r && o < t; ) ++o, (n = n.nextSibling);
      n && n.before(e);
    }
    function l(t) {
      e.unReactive(t.reactiveIndex), t.render.remove(), t.render.unmount();
    }
    o.before(s),
      s.after(r),
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
        var s;
        const p = 0 === n,
          h = e.evaluate(c.groups.org),
          m = u ? Object.keys(h) : h;
        n = m.length;
        for (let n = 0; n < m.length; ++n) {
          const r = m[n];
          let l = { [c.groups.dest]: r };
          const u = null === (s = c.groups) || void 0 === s ? void 0 : s.index,
            h = u ? e.signal(n) : { value: n };
          if ((u && (l = { ...l, [u]: h }), i && !p)) {
            const o = e.evaluate(i, l),
              s = d.find(e => e.render.key === o);
            if (s) {
              const e = s.render.el;
              s.reactiveIndex.value !== n && (a(e, n), (s.reactiveIndex.value = n)), (s.loopId = t);
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
        if ((p && r.before(f), !p)) for (const e of d) e.loopId !== t && l(e);
        t += 1;
      }),
      e.cleanup(() => {
        s.remove(), r.remove();
        for (const e of d) l(e);
      }),
      { skipChildsRendering: !0, skipComponentRendering: !0, skipOtherAttributesRendering: !0 }
    );
  }
  function De(e) {
    e.effect(() => {
      e.block.el.innerHTML = e.evaluate(e.attr.value);
    });
  }
  function Oe(e) {
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
  function Me(e) {
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
              (i = Number(i)), (i = isNaN(i) ? 0 : i);
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
  function Ie(e) {
    e.deepRender({
      element: e.block,
      scopedNodeData: e.scopedNodeData,
      renderWithoutListeningToChange: !0
    });
  }
  function Pe(e) {
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
  function He(e) {
    e.onElementMounted(() => {
      var t, n;
      let o = !1;
      const i = null === (t = e.block.transition) || void 0 === t ? void 0 : t.init,
        s = null !== (n = e.block.el.style.display) && void 0 !== n ? n : '';
      function r() {
        const t = e.block.el,
          n = e.evaluate(e.attr.value),
          r = 'none' !== t.style.display;
        n && !r
          ? ((t.style.display = s), (i || o) && e.block.applyTransition('enterTransition'))
          : r &&
            !n &&
            (i || o
              ? e.block.applyTransition('outTransition', () => {
                  t.style.display = 'none';
                })
              : (t.style.display = 'none')),
          (o = !0);
      }
      e.block.onElementChange(() => {
        r();
      }),
        e.effect(r);
    });
  }
  function We(e) {
    e.effect(() => {
      e.block.el.textContent = e.evaluate(e.attr.value);
    });
  }
  function Be(e) {
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
  function je(e) {
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
      const s = null !== (i = null == n ? void 0 : n.el) && void 0 !== i ? i : e.block.el,
        r = e.evaluate(e.attr.value);
      if ((n && n.unmount(), !t)) for (const e in o) s.removeAttribute(e);
      for (const e in r) {
        const t = r[e],
          n = 'string' != typeof t;
        s.setAttribute(e, n ? JSON.stringify(t) : t);
      }
      t &&
        (n = e.deepRender({
          element: s,
          scopedNodeData: e.scopedNodeData,
          skipChildRendering: e.appState.isMounted
        })),
        (o = { ...r });
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
        prefixes: { bind: G, on: ce },
        directives: {
          key: Qe,
          attrs: Je,
          teleport: Ve,
          insert: ze,
          mounted: qe,
          unmount: Ke,
          setup: Fe,
          scope: Ue,
          if: Oe,
          'else-if': xe,
          else: _e,
          for: Re,
          html: De,
          text: We,
          model: Me,
          ref: Pe,
          transition: Be,
          ignore: $e,
          once: Ie,
          show: He,
          component: Xe,
          name: Ye
        },
        helpers: {
          el: je,
          refs: ye,
          root: Ge,
          nextTick: ke,
          childrens: ve,
          props: me,
          config: ge,
          attrs: he,
          names: be
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
  let et = 0;
  function tt(t, n, o) {
    var i;
    ++et;
    const s = null !== (i = null == n ? void 0 : n.parentPluginHelper) && void 0 !== i ? i : Ze();
    let r = {},
      a = {};
    function l(e) {
      return (() => {
        const i = null != e ? e : document.body;
        return Te({
          appId: et,
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
      return (a = n), { mount: l };
    }
    return {
      appId: et,
      mount: l,
      configure: function (e) {
        return (r = e), { plugins: c, components: u, mount: l };
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
    helperToHookRegistrer: Ce,
    ...Ae,
    createApp: function (e) {
      return tt(e);
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
              return (t.innerHTML = e), t.childNodes;
            })(e.html.trim());
            if (1 !== r.length) throw new Error('The component can only have one element as root.');
            const l = r[0];
            if (l.getAttribute('d-for'))
              throw new Error(
                'The component can\'t have a "d-for" directive/attribute on the root element.'
              );
            const c = new Set(n.filter(e => e.startsWith('!')).map(e => e.slice(1)));
            s.block.replaceWith(l);
            const u = s.reactive({ $props: {}, $attrs: {} }),
              d = [],
              f = [];
            for (const e of i.attributes) {
              const t = e.name.replace(/^(:|d-bind:)/, ''),
                n = s.utils.kebabToCamelCase(t);
              if (o.has(n)) {
                c.delete(n), d.push(e);
                continue;
              }
              const { attrName: i } = s.utils.getDomyAttributeInformations(e),
                r = 'class' === i,
                a = 'style' === i;
              if (s.utils.isBindAttr(e.name)) {
                let t = null;
                s.effect(() => {
                  var n, o;
                  (t = s.evaluate(e.value)),
                    s.lockWatchers(),
                    (u.$attrs[i] = r
                      ? s.utils.handleClass(t, null !== (n = u.$attrs[i]) && void 0 !== n ? n : '')
                      : a
                        ? s.utils.handleStyle(
                            t,
                            null !== (o = u.$attrs[i]) && void 0 !== o ? o : ''
                          )
                        : t),
                    s.unlockWatchers();
                }),
                  r &&
                    s.cleanup(() => {
                      u.$attrs[i] = s.utils.handleRemoveClass(u.$attrs.class, t);
                    }),
                  a &&
                    s.cleanup(() => {
                      u.$attrs[i] = s.utils.handleRemoveStyle(u.$attrs.style, t);
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
            const p = {},
              h = [];
            for (const e of i.children) {
              const t = s.deepRender({ element: e, scopedNodeData: s.scopedNodeData });
              a.push(t.unmount.bind(t)), h.push(t.el), t.name && (p[t.name] = t.el);
            }
            let m;
            const v = oe(),
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
                      parentPluginHelper: s.pluginHelper
                    },
                    f
                  )
                    .configure(s.config)
                    .components(null !== (n = e.components) && void 0 !== n ? n : {})
                    .mount(t);
                  m = o.unmount;
                };
                s.appState.isMounted ? s.queueJob(n, v) : n();
              };
            g(l),
              s.block.onElementChange(e => {
                g(e);
              }),
              s.cleanup(() => {
                m && m(), nt(a), s.unReactive(u);
              });
          },
          e => {
            i.remove(), nt(a), s.utils.error(`Component "${t}":`, e);
          }
        );
      };
    }
  };
  return ot;
});
//# sourceMappingURL=index.js.map
