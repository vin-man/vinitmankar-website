/* dc-runtime.js — a small standalone runtime for pages exported from the
   Design canvas. It renders the page template once, then patches only the
   bound parts ({{ holes }}, sc-if, sc-for, events, refs) when state changes,
   so canvases, videos and running animations are never torn down. */
(function () {
  'use strict';

  class DCLogic {
    constructor(props) { this.props = props; this.state = {}; }
    setState(patch) {
      const next = typeof patch === 'function' ? patch(this.state, this.props) : patch;
      this.state = Object.assign({}, this.state, next);
      if (this.__schedule) this.__schedule();
    }
    forceUpdate() { if (this.__schedule) this.__schedule(); }
  }
  window.DCLogic = DCLogic;

  const HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
  const ONLY_HOLE = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/;
  const EVENTS = { onclick: 'click', onmouseenter: 'mouseenter', onmouseleave: 'mouseleave', onfocus: 'focus', onblur: 'blur', onkeydown: 'keydown', onkeyup: 'keyup', oninput: 'input', onchange: 'change', onpointerenter: 'pointerenter', onpointerleave: 'pointerleave', onsubmit: 'submit', onscroll: 'scroll' };

  function lookup(expr, scope) {
    expr = expr.trim();
    if (expr === 'true') return true;
    if (expr === 'false') return false;
    if (expr === 'null') return null;
    if (/^-?\d+(\.\d+)?$/.test(expr)) return Number(expr);
    if (/^(['"]).*\1$/.test(expr)) return expr.slice(1, -1);
    let v = scope;
    for (const part of expr.split('.')) {
      if (v == null) return undefined;
      v = v[part];
    }
    return v;
  }
  const interpolate = (tpl, scope) => tpl.replace(HOLE, (_, e) => { const v = lookup(e, scope); return v == null ? '' : String(v); });

  // Compile a DOM subtree into a list of binding updaters.
  function compile(root, comp) {
    const binds = [];
    const walk = node => {
      if (node.nodeType === 3) {
        if (HOLE.test(node.nodeValue)) {
          HOLE.lastIndex = 0;
          const tpl = node.nodeValue;
          binds.push(scope => { const t = interpolate(tpl, scope); if (node.nodeValue !== t) node.nodeValue = t; });
        }
        HOLE.lastIndex = 0;
        return;
      }
      if (node.nodeType === 11) { [...node.childNodes].forEach(walk); return; }
      if (node.nodeType !== 1) return;
      const tag = node.localName;
      if (tag === 'sc-if') return binds.push(makeIf(node, comp));
      if (tag === 'sc-for') return binds.push(makeFor(node, comp));
      for (const attr of [...node.attributes]) {
        const name = attr.name, val = attr.value;
        HOLE.lastIndex = 0;
        if (!HOLE.test(val)) continue;
        HOLE.lastIndex = 0;
        if (name === 'ref') {
          node.removeAttribute(name);
          const expr = val.match(ONLY_HOLE)[1];
          let last = null;
          binds.push(scope => { const fn = lookup(expr, scope); if (typeof fn === 'function' && fn !== last) { last = fn; fn(node); } });
          node.__dcRefs = node.__dcRefs || [];
          node.__dcRefs.push(() => last);
          continue;
        }
        if (EVENTS[name.toLowerCase()]) {
          node.removeAttribute(name);
          const expr = val.match(ONLY_HOLE)[1];
          let current = null;
          node.addEventListener(EVENTS[name.toLowerCase()], e => { if (typeof current === 'function') current(e); });
          binds.push(scope => { current = lookup(expr, scope); });
          continue;
        }
        if (name.startsWith('hint-')) { node.removeAttribute(name); continue; }
        const only = val.match(ONLY_HOLE);
        node.removeAttribute(name);
        const target = name.startsWith('data-dc-attr-') ? ({ viewbox: 'viewBox' })[name.slice(13)] || name.slice(13) : name;
        binds.push(scope => {
          if (only) {
            const v = lookup(only[1], scope);
            if (v === false || v == null) { if (node.hasAttribute(target)) node.removeAttribute(target); return; }
            const s = v === true ? '' : String(v);
            if (node.getAttribute(target) !== s) node.setAttribute(target, s);
          } else {
            const s = interpolate(val, scope);
            if (node.getAttribute(target) !== s) node.setAttribute(target, s);
          }
        });
      }
      for (const child of [...node.childNodes]) walk(child);
    };
    walk(root);
    return scope => binds.forEach(b => b(scope));
  }

  function releaseRefs(nodes) {
    nodes.forEach(n => {
      if (n.nodeType !== 1) return;
      [n, ...n.querySelectorAll('*')].forEach(el => (el.__dcRefs || []).forEach(get => { const fn = get(); if (typeof fn === 'function') fn(null); }));
    });
  }

  function makeIf(node, comp) {
    const expr = node.getAttribute('value').match(ONLY_HOLE)[1];
    const anchor = document.createComment('sc-if');
    const tpl = document.createDocumentFragment();
    while (node.firstChild) tpl.appendChild(node.firstChild);
    node.replaceWith(anchor);
    let mounted = null, update = null;
    return scope => {
      const on = !!lookup(expr, scope);
      if (on && !mounted) {
        const frag = tpl.cloneNode(true);
        mounted = [...frag.childNodes];
        update = compile(frag, comp);
        anchor.parentNode.insertBefore(frag, anchor.nextSibling);
      } else if (!on && mounted) {
        releaseRefs(mounted);
        mounted.forEach(n => n.remove());
        mounted = null; update = null;
      }
      if (update) update(scope);
    };
  }

  function makeFor(node, comp) {
    const expr = node.getAttribute('list').match(ONLY_HOLE)[1];
    const as = node.getAttribute('as') || 'item';
    const anchor = document.createComment('sc-for');
    const tpl = document.createDocumentFragment();
    while (node.firstChild) tpl.appendChild(node.firstChild);
    // sc-for inside SVG: keep children in the SVG namespace.
    node.replaceWith(anchor);
    let rows = [];
    return scope => {
      const list = lookup(expr, scope) || [];
      while (rows.length > list.length) { const r = rows.pop(); releaseRefs(r.nodes); r.nodes.forEach(n => n.remove()); }
      let after = rows.length ? rows[rows.length - 1].nodes[rows[rows.length - 1].nodes.length - 1] : anchor;
      while (rows.length < list.length) {
        const frag = tpl.cloneNode(true);
        const nodes = [...frag.childNodes];
        const update = compile(frag, comp);
        after.parentNode.insertBefore(frag, after.nextSibling);
        after = nodes[nodes.length - 1] || after;
        rows.push({ nodes, update });
      }
      rows.forEach((r, i) => r.update(Object.assign(Object.create(scope), { [as]: list[i], index: i })));
    };
  }

  function boot() {
    const tplEl = document.getElementById('dc-template');
    const propsEl = document.getElementById('dc-props');
    const host = document.getElementById('dc-root');
    if (!tplEl || !host || typeof window.Component !== 'function') return;
    const defs = propsEl ? JSON.parse(propsEl.textContent) : {};
    const props = {};
    Object.keys(defs).forEach(k => { if (k[0] !== '$' && defs[k] && 'default' in defs[k]) props[k] = defs[k].default; });
    const comp = new window.Component(props);
    comp.props = props;
    comp.state = comp.state || {};
    const frag = tplEl.content.cloneNode(true);
    let update;
    let queued = false;
    const render = () => {
      queued = false;
      const vals = comp.renderVals() || {};
      update(vals);
    };
    comp.__schedule = () => { if (!queued) { queued = true; Promise.resolve().then(render); } };
    update = compile(frag, comp);
    host.appendChild(frag);
    render();
    if (typeof comp.componentDidMount === 'function') comp.componentDidMount();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
