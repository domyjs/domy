!(function (t, e) {
  'object' == typeof exports && 'undefined' != typeof module
    ? (module.exports = e())
    : 'function' == typeof define && define.amd
      ? define(e)
      : ((t = 'undefined' != typeof globalThis ? globalThis : t || self).DOMY = e());
})(this, function () {
  'use strict';
  function t(t, e, n, i) {
    return new (n || (n = Promise))(function (r, s) {
      function o(t) {
        try {
          l(i.next(t));
        } catch (t) {
          s(t);
        }
      }
      function a(t) {
        try {
          l(i.throw(t));
        } catch (t) {
          s(t);
        }
      }
      function l(t) {
        var e;
        t.done
          ? r(t.value)
          : ((e = t.value),
            e instanceof n
              ? e
              : new n(function (t) {
                  t(e);
                })).then(o, a);
      }
      l((i = i.apply(t, e || [])).next());
    });
  }
  function e(t) {
    return e => {
      var n;
      const i = null !== (n = t.$events[e]) && void 0 !== n ? n : [];
      for (const t of i) t.dispatchEvent(new CustomEvent(e));
    };
  }
  'function' == typeof SuppressedError && SuppressedError;
  class n {
    constructor(t, e) {
      (this.target = t),
        (this.notifyAll = e),
        (this.debounceTimer = null),
        (this.debounceDelay = 50);
    }
    getProxy() {
      return this.createProxy(this.target);
    }
    createProxy(t) {
      if (
        !Array.isArray(t) &&
        ('object' != typeof (e = t) || null === e || e.constructor !== Object)
      )
        return t;
      var e;
      const n = {
        set: (t, e, n, i) => {
          const r = Reflect.set(t, e, n, i);
          return this.scheduleNotify(), r;
        }
      };
      return new Proxy(t, n);
    }
    scheduleNotify() {
      null !== this.debounceTimer && clearTimeout(this.debounceTimer),
        (this.debounceTimer = setTimeout(() => {
          this.notifyAll();
        }, this.debounceDelay));
    }
  }
  class i {
    constructor(t, e, n = !0) {
      (this.name = t),
        (this.val = e),
        (this.needProxy = n),
        (this.callBackOncall = null),
        (this.dependencies = []),
        (this.val = this.getProxy());
    }
    getProxy() {
      if (this.needProxy) {
        return new n(this.val, () => this.notifyAll()).getProxy();
      }
      return this.val;
    }
    attach(t) {
      this.dependencies.some(e => e.$el === t.$el) || this.dependencies.push(t);
    }
    unattach(t) {
      const e = this.dependencies.findIndex(e => e.$el === t);
      return -1 !== e && (this.dependencies.splice(e, 1), !0);
    }
    setCallBackOnCall(t) {
      this.callBackOncall = t;
    }
    set(t) {
      return (
        console.log('setter called'),
        (this.val = 'function' == typeof t ? t(this.val) : t),
        (this.val = this.getProxy()),
        this.notifyAll(),
        !0
      );
    }
    notifyAll() {
      console.log('notify called');
      for (const t of this.dependencies) t.unactive || t.fn();
    }
    get value() {
      return 'function' == typeof this.callBackOncall && this.callBackOncall(), this.val;
    }
  }
  const r = {
    get(t, e, n) {
      try {
        const n = e;
        if (t[n] instanceof i) return t[n].value;
      } catch (t) {}
      return Reflect.get(t, e, n);
    },
    set(t, e, n, r) {
      try {
        const r = e;
        if (t[r] instanceof i) return t[r].set(n);
      } catch (t) {}
      return Reflect.set(t, e, n, r);
    }
  };
  function s(t, n) {
    const i = n.$state.reduce((t, e) => Object.assign(Object.assign({}, t), { [e.name]: e }), {}),
      s = Object.entries(n.$fn).reduce(
        (t, e) =>
          Object.assign(Object.assign({}, t), {
            [e[0]]: function (...t) {
              return e[1].call(a, ...t);
            }
          }),
        {}
      ),
      o = Object.assign(Object.assign(Object.assign(Object.assign({}, window), i), s), {
        $el: t,
        $refs: n.$refs,
        $dispatch: e(n)
      }),
      a = new Proxy(o, r);
    return a;
  }
  const o = function () {
    return t(this, void 0, void 0, function* () {});
  }.constructor;
  function a(t) {
    const e = t.isAsync ? o : Function,
      n = t.virtualElement.$el,
      i = t.returnResult ? `return ${t.code};` : t.code,
      r = [],
      a = t.$state.$state.filter(t => !r.includes(t.name) && (r.push(t.name), !0));
    if (t.notifier)
      for (const e of a) e.setCallBackOnCall(() => e.attach({ $el: n, fn: t.notifier }));
    const l = s(n, Object.assign(Object.assign({}, t.$state), { $state: a }));
    return e(i).call(l);
  }
  function l(t, e, n, i = []) {
    n.$el.textContent = n.content.replace(/\{\{\s*(?<org>.+?)\s*\}\}/gi, function (r, s) {
      return a({
        code: s,
        returnResult: !0,
        $state: Object.assign(Object.assign({}, t), { $state: [...i, ...t.$state] }),
        notifier: () => l(t, e, n, i),
        virtualElement: n,
        virtualParent: e
      });
    });
  }
  const c = [
      'd-cloak',
      'd-text',
      'd-html',
      'd-model',
      'd-show',
      'd-if',
      'd-for',
      'd-ref',
      'd-ignore'
    ],
    u = t => t.startsWith(':') || t.startsWith('d-bind:'),
    d = t => t.startsWith('@') || t.startsWith('d-on:'),
    f = t => c.includes(t),
    v = t => !u(t) && !f(t) && !d(t);
  function m(t) {
    const e = t.virtualElement.$el,
      n = t.attr.name,
      i = n.startsWith(':') ? n.slice(1) : n.slice(7),
      r = a({
        code: t.attr.value,
        returnResult: !0,
        $state: t.$state,
        virtualParent: t.virtualParent,
        virtualElement: t.virtualElement,
        notifier: t.notifier
      });
    if ('key' === i && !t.virtualElement.key) {
      if ('string' != typeof r && 'number' != typeof r)
        throw new Error(`Invalide key value: "${r}".`);
      t.virtualElement.key = t.attr.value;
    }
    if ((e.removeAttribute(n), 'style' === i && 'object' == typeof r))
      for (const t in r) e.style[t] = r[t];
    else e.setAttribute(i, r);
  }
  function h(t, e, n, i = [], r = []) {
    const s = [{ parent: e, element: n, byPassAttributes: r }];
    for (; s.length > 0; ) {
      const e = s.shift();
      if (
        ((e.element.isDisplay = !0),
        ('content' in e.element || 'string' != typeof e.element.domiesAttributes['d-ignore']) &&
          (O(t, e.parent, e.element, i, e.byPassAttributes),
          'childs' in e.element && 'string' != typeof e.element.domiesAttributes['d-for']))
      )
        for (const t of e.element.childs) s.push({ parent: e.element, element: t });
    }
  }
  class p {
    constructor(t) {
      this.root = this.init(t);
    }
    init(t) {
      const e = [];
      for (const n of t) e.push(this.getVirtual(n));
      return e;
    }
    getVirtual(t) {
      return t.nodeType === Node.TEXT_NODE ? this.getVirtualText(t) : this.getVirtualElement(t);
    }
    getVirtualText(t) {
      var e;
      return {
        $el: t,
        isDisplay: !0,
        visited: !1,
        content: null !== (e = t.textContent) && void 0 !== e ? e : ''
      };
    }
    getVirtualElement(t) {
      var e, n, i;
      const r =
          null !==
            (n = null === (e = t.tagName) || void 0 === e ? void 0 : e.toLocaleLowerCase()) &&
          void 0 !== n
            ? n
            : 'comment',
        s = 'template' === r,
        o = {
          $el: t,
          tag: r,
          isDisplay: !0,
          visited: !1,
          initialised: !1,
          events: {},
          domiesAttributes: {},
          normalAttributes: {},
          childs: []
        };
      for (const e of Array.from(null !== (i = t.attributes) && void 0 !== i ? i : []))
        v(e.name) ? (o.normalAttributes[e.name] = e.value) : (o.domiesAttributes[e.name] = e.value);
      const a = s ? t.content.childNodes : t.childNodes;
      for (const t of a) {
        if (
          o.domiesAttributes['d-for'] &&
          (t.nodeType === Node.TEXT_NODE || t.nodeType === Node.COMMENT_NODE)
        )
          continue;
        const e = this.getVirtual(t);
        o.childs.push(e),
          'content' in e ||
            !o.domiesAttributes['d-for'] ||
            e.domiesAttributes[':key'] ||
            console.warn('Elements inside a d-for parent should be rendered with :key attribute.');
      }
      return o;
    }
    static createCopyOfVirtual(t) {
      return 'content' in t
        ? Object.assign({}, t)
        : Object.assign(Object.assign({}, t), {
            events: Object.assign({}, t.events),
            childs: t.childs.map(t => p.createCopyOfVirtual(t))
          });
    }
    static createElementFromVirtual(t) {
      if ('content' in t) {
        const e = document.createTextNode(t.content);
        return (t.$el = e), e;
      }
      const e = document.createElement(t.tag);
      for (const n of Object.keys(t.normalAttributes)) e.setAttribute(n, t.normalAttributes[n]);
      for (const n of t.childs) e.appendChild(p.createElementFromVirtual(n));
      return (t.$el = e), e;
    }
    visitFrom(t, e) {
      const n = [{ parent: null, childs: [t] }];
      for (; n.length > 0; ) {
        const { parent: t, childs: i } = n[n.length - 1];
        if (0 === i.length) {
          n.pop();
          continue;
        }
        const r = i.shift(),
          s = 'content' in r;
        (!!s ||
          ('string' != typeof r.domiesAttributes['d-ignore'] &&
            'string' != typeof (null == t ? void 0 : t.domiesAttributes['d-for']) &&
            'comment' !== r.tag)) &&
          ((r.visited = !0), e(t, r), s || n.push({ parent: r, childs: [...r.childs] }));
      }
    }
    visit(t) {
      for (const e of this.root) this.visitFrom(e, t);
    }
  }
  function y(t, e, n) {
    const i = t.children[n];
    i !== e && t.insertBefore(e, i);
  }
  const $ = 'dMdodelEvents';
  function g(t) {
    const e = t.virtualElement.$el,
      n = t.attr.name;
    function r() {
      return a({
        code: t.attr.value,
        returnResult: !0,
        $state: t.$state,
        virtualParent: t.virtualParent,
        virtualElement: t.virtualElement,
        notifier: t.notifier
      });
    }
    switch ((e.removeAttribute(n), n)) {
      case 'd-text':
        e.textContent = r();
        break;
      case 'd-html':
        e.innerHTML = r();
        break;
      case 'd-show':
        e.style.display = r() ? '' : 'none';
        break;
      case 'd-ref':
        if (t.$state.$refs[t.attr.value])
          throw new Error(`A ref with the name "${t.attr.value}" already exist.`);
        t.$state.$refs[t.attr.value] = e;
        break;
      case 'd-if':
        !(function (t) {
          if (!t.virtualParent) return;
          const e = t.virtualElement.$el,
            n = t.$state,
            i = a({
              code: t.attr.value,
              returnResult: !0,
              $state: t.$state,
              virtualParent: t.virtualParent,
              virtualElement: t.virtualElement,
              notifier: t.notifier
            });
          if (t.virtualElement.isDisplay && !i) (t.virtualElement.isDisplay = !1), e.remove();
          else if (!t.virtualElement.isDisplay && i) {
            const e = p.createElementFromVirtual(t.virtualElement),
              i =
                ((r = t.virtualParent),
                (s = t.virtualElement),
                r.childs
                  .filter(t => 'string' == typeof t || t.isDisplay || t === s)
                  .findIndex(t => t === s));
            (t.virtualElement.isDisplay = !0),
              h(n, t.virtualParent, t.virtualElement, [], ['d-if']),
              (function (t, e, n) {
                const i = t.childNodes[n];
                i ? t.insertBefore(e, i) : t.appendChild(e);
              })(t.virtualParent.$el, e, i);
          }
          var r, s;
        })(t);
        break;
      case 'd-model':
        !(function (t) {
          const e = t.virtualElement.$el,
            n = t.$state,
            i = t.virtualElement.events[$],
            r = t.attr.value.replace(/^this\./, ''),
            s = n.$state.find(t => t.name === r);
          if (!s) throw new Error(`Invalide data name in d-model: "${r}".`);
          function o() {
            var t;
            const n = s.dependencies.find(t => t.$el === e);
            (n.unactive = !0),
              s.set(null !== (t = null == e ? void 0 : e.value) && void 0 !== t ? t : ''),
              (n.unactive = !1);
          }
          i && (e.removeEventListener('input', i), e.removeEventListener('change', i)),
            e.addEventListener('input', o),
            e.addEventListener('change', o),
            (t.virtualElement.events[$] = o),
            'value' in e && (e.value = s.val),
            null == s || s.attach({ $el: e, fn: t.notifier });
        })(t);
        break;
      case 'd-for':
        !(function (t) {
          var e, n;
          if (!t.virtualParent) return;
          const r = performance.now(),
            s = t.virtualElement.$el,
            o = t.$state,
            l = Array.from(null !== (e = s.children) && void 0 !== e ? e : []);
          t.virtualElement.initialised || ((s.innerHTML = ''), (t.virtualElement.initialised = !0));
          const c = /(?<dest>\w+)(?:,\s*(?<index>\w+))?\s*(?<type>in|of)\s*(?<org>.+)/gi.exec(
            t.attr.value
          );
          if (!c) throw new Error(`Invalide "${t.attr.name}" attribute value: "${t.attr.value}".`);
          const u = 'in' === c.groups.type,
            d = a({
              code: c.groups.org,
              returnResult: !0,
              $state: t.$state,
              virtualParent: t.virtualParent,
              virtualElement: t.virtualElement,
              notifier: t.notifier
            }),
            f = [];
          function v(e, n) {
            const r = t.virtualElement.childs;
            for (let u = 0; u < r.length; ++u) {
              const d = r[u],
                v = n * r.length + u,
                m = c.groups.index
                  ? [new i(c.groups.dest, e), new i(c.groups.index, n, !1)]
                  : [new i(c.groups.dest, e)];
              if ('key' in d && d.key) {
                const e = a({
                    code: d.key,
                    returnResult: !0,
                    $state: Object.assign(Object.assign({}, t.$state), {
                      $state: [...m, ...t.$state.$state]
                    }),
                    virtualElement: t.virtualElement,
                    virtualParent: t.virtualParent
                  }),
                  n = l.findIndex(t => t.getAttribute('key') === e.toString());
                if (-1 !== n) {
                  const t = l[n];
                  n !== v && y(s, t, v), f.push(t);
                  continue;
                }
              }
              const $ = p.createCopyOfVirtual(d),
                g = p.createElementFromVirtual($);
              h(o, t.virtualElement, $, m), 'key' in $ && (d.key = $.key);
              const b = s.childNodes[v];
              b
                ? b.isEqualNode(g)
                  ? f.push(b)
                  : (s.insertBefore(g, b), f.push(g))
                : (s.appendChild(g), f.push(g));
            }
          }
          let m = 0;
          if (u) for (const t in d) v(t, m), ++m;
          else for (const t of d) v(t, m), ++m;
          const $ = Array.from(null !== (n = s.children) && void 0 !== n ? n : []).filter(
            t => !f.includes(t)
          );
          for (const t of $) t.remove();
          console.log(performance.now() - r);
        })(t);
    }
  }
  function b(t) {
    const e = t.virtualElement.$el,
      n = t.$state,
      i = t.attr.name,
      r = i.startsWith('@') ? i.slice(1) : i.slice(5);
    e.removeAttribute(i), n.$events[r] || (n.$events[r] = []);
    -1 === n.$events[r].findIndex(t => t === e) && n.$events[r].push(e);
    const o = t.virtualElement.events[r];
    o && e.removeEventListener(r, o);
    const l = n => {
      const i = a({
        code: t.attr.value,
        returnResult: !0,
        $state: t.$state,
        virtualParent: t.virtualParent,
        virtualElement: t.virtualElement,
        notifier: t.notifier
      });
      'function' == typeof i && i.call(s(e, t.$state), n);
    };
    (t.virtualElement.events[r] = l), e.addEventListener(r, l);
  }
  function E(t, e, n, i = [], r = []) {
    if ('comment' === n.tag) return;
    const s = n.domiesAttributes;
    for (const o of Object.keys(s)) {
      if (r.includes(o)) continue;
      if ('d-if' !== o && !n.isDisplay) continue;
      const a = {
        $state: Object.assign(Object.assign({}, t), { $state: [...i, ...t.$state] }),
        virtualParent: e,
        virtualElement: n,
        attr: { name: o, value: s[o] },
        notifier: () => E(t, e, n, i)
      };
      u(o) ? m(a) : d(o) ? b(a) : f(o) && g(a);
    }
  }
  function O(t, e, n, i = [], r = []) {
    return 'content' in n ? l(t, e, n, i) : E(t, e, n, i, r);
  }
  function w(e, n, i) {
    return t(this, void 0, void 0, function* () {
      if (
        (new p([n]).visit(function (t, e) {
          try {
            O(i, t, e);
          } catch (t) {
            console.error(t);
          }
        }),
        e.$mounted)
      )
        try {
          yield e.$mounted.call(s(void 0, i));
        } catch (t) {
          console.error(t);
        }
    });
  }
  return function (e, n) {
    return t(this, void 0, void 0, function* () {
      const r = null != n ? n : document.body,
        o = { $state: [], $fn: {}, $events: {}, $refs: {} };
      for (const t in e.$state) o.$state.push(new i(t, e.$state[t]));
      for (const t in e.$fn) o.$fn[t] = e.$fn[t];
      for (const n in e.$watch) {
        const i = o.$state.find(t => t.name === n);
        i
          ? i.attach({
              $el: null,
              fn: () =>
                t(this, void 0, void 0, function* () {
                  const t = i.dependencies[0];
                  t.unactive = !0;
                  try {
                    yield e.$watch[n].call(s(void 0, o));
                  } catch (t) {
                    console.error(t);
                  }
                  t.unactive = !1;
                })
            })
          : console.error(`Invalide watcher name "${n}"`);
      }
      if (e.$setup)
        try {
          yield e.$setup.call(s(void 0, o));
        } catch (t) {
          console.error(t);
        }
      'complete' === document.readyState
        ? w(e, r, o)
        : document.addEventListener('DOMContentLoaded', () => w(e, r, o));
      const a = ['$state', '$fn', '$setup', '$mounted', '$watch'],
        l = Object.keys(e).filter(t => !a.includes(t));
      l.length > 0 && console.error(`Unknown properties "${l.join(', ')}"`);
    });
  };
});
//# sourceMappingURL=index.js.map
