window.NP_VERSION='c3b368f620';
/* ---- 00-core.js ---- */
'use strict';
/* ===== Super One core: helpers, storage, dialogs, files, sound ===== */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function h(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  if (attrs) for (const k in attrs) {
    const v = attrs[k]; if (v == null || v === false) continue;
    if (k === 'class') e.className = v; else if (k === 'html') e.innerHTML = v; else if (k === 'text') e.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat(9)) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c));
  return e;
}
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pad2 = n => String(n).padStart(2, '0');
const ymd = d => d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
const fromYmd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const fmtDay = (d, o = { weekday: 'short', month: 'short', day: 'numeric' }) => d.toLocaleDateString(undefined, o);
const fmtTime = d => d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
const fmtDur = s => { s = Math.max(0, Math.round(s || 0)); const m = Math.floor(s / 60); return m + ':' + pad2(s % 60); };
const fmtSize = b => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(0) + ' KB' : b < 1073741824 ? (b / 1048576).toFixed(1) + ' MB' : (b / 1073741824).toFixed(2) + ' GB';
const fmtAgo = t => { const s = (Date.now() - t) / 1000; if (s < 60) return 'just now'; if (s < 3600) return Math.floor(s / 60) + ' min ago'; if (s < 86400) return Math.floor(s / 3600) + ' h ago'; const d = Math.floor(s / 86400); return d === 1 ? 'yesterday' : d + ' days ago'; };
const debounce = (f, ms) => { let t; const g = (...a) => { clearTimeout(t); t = setTimeout(() => f(...a), ms); }; g.flush = (...a) => { clearTimeout(t); f(...a); }; return g; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const isTouch = () => matchMedia('(pointer:coarse)').matches;
const SVG = {
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="5.5" y="4" width="4.5" height="16" rx="1.2"/><rect x="14" y="4" width="4.5" height="16" rx="1.2"/></svg>',
  next: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 5.5v13a1 1 0 0 0 1.5.86L15 13.7V18a1 1 0 0 0 2 0V6a1 1 0 0 0-2 0v4.3L5.5 4.64A1 1 0 0 0 4 5.5z"/></svg>',
  prev: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 5.5v13a1 1 0 0 1-1.5.86L9 13.7V18a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v4.3l9.5-5.66A1 1 0 0 1 20 5.5z"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7.5 7.5 12 3l4.5 4.5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/></svg>',
  more: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
};

/* ---------- IndexedDB storage (everything stays on this device) ---------- */
const DB = (() => {
  const NAME = 'nova-pocket', VER = 3;
  const STORES = ['kv', 'notes', 'events', 'reminders', 'decks', 'cards', 'media', 'songs', 'memos', 'places', 'vault', 'files', 'comics'];
  let dbp = null;
  function open() {
    return dbp || (dbp = new Promise((res, rej) => {
      const r = indexedDB.open(NAME, VER);
      r.onupgradeneeded = () => { const d = r.result; for (const s of STORES) if (!d.objectStoreNames.contains(s)) d.createObjectStore(s, s === 'kv' ? undefined : { keyPath: 'id' }); };
      r.onsuccess = () => { const d = r.result; d.onversionchange = () => d.close(); res(d); };
      r.onerror = () => { dbp = null; rej(r.error); };
    }));
  }
  async function tx(store, mode, fn) {
    const d = await open();
    return new Promise((res, rej) => {
      const t = d.transaction(store, mode), s = t.objectStore(store); let out;
      const r = fn(s); if (r) r.onsuccess = () => { out = r.result; };
      t.oncomplete = () => res(out); t.onerror = t.onabort = () => rej(t.error || new Error('storage'));
    });
  }
  const changed = new Set();
  const note = s => changed.forEach(f => { try { f(s); } catch (e) { } });
  return {
    STORES, open,
    all: s => tx(s, 'readonly', o => o.getAll()).then(a => a || []),
    get: (s, id) => tx(s, 'readonly', o => o.get(id)),
    put: (s, v) => tx(s, 'readwrite', o => o.put(v)).then(() => (note(s), v)),
    del: (s, id) => tx(s, 'readwrite', o => o.delete(id)).then(() => note(s)),
    clear: s => tx(s, 'readwrite', o => o.clear()).then(() => note(s)),
    count: s => tx(s, 'readonly', o => o.count()),
    kget: (k, d) => tx('kv', 'readonly', o => o.get(k)).then(v => v === undefined ? d : v),
    kset: (k, v) => tx('kv', 'readwrite', o => o.put(v, k)).then(() => note('kv')),
    kdel: k => tx('kv', 'readwrite', o => o.delete(k)),
    async kentries() {
      const d = await open();
      return new Promise((res, rej) => {
        const out = [], t = d.transaction('kv'), c = t.objectStore('kv').openCursor();
        c.onsuccess = () => { const cur = c.result; if (cur) { out.push([cur.key, cur.value]); cur.continue(); } };
        t.oncomplete = () => res(out); t.onerror = () => rej(t.error);
      });
    },
    onChange(f) { changed.add(f); return () => changed.delete(f); },
  };
})();
/* fast settings mirror (theme etc. need to be known before the first paint) */
const Prefs = {
  get(k, d) { try { const v = localStorage.getItem('np.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('np.' + k, JSON.stringify(v)); } catch (e) { } },
};

/* ---------- dialogs ---------- */
const UI = {
  toast(msg, ms = 2300) {
    let host = $('#toasts'); if (!host) { host = h('div', { id: 'toasts', 'aria-live': 'polite' }); document.body.append(host); }
    const t = h('div', { class: 'toast' }, msg); host.append(t); setTimeout(() => t.remove(), ms);
  },
  sheet({ title, body, actions = [], onClose }) {
    const prevFocus = document.activeElement;
    const close = () => { scrim.remove(); document.removeEventListener('keydown', key); onClose && onClose(); try { prevFocus && prevFocus.focus && prevFocus.focus(); } catch (e) { } };
    const key = e => { if (e.key === 'Escape') close(); };
    const content = typeof body === 'function' ? body(() => close()) : body;
    const foot = actions.length ? h('footer', null, actions.map(a => h('button', { class: 'btn ' + (a.cls || ''), onclick: () => a.onClick ? a.onClick(close) : close() }, a.label))) : null;
    const sheet = h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': title || 'Panel' },
      h('header', null, h('h3', null, title || ''), h('button', { class: 'ib', 'aria-label': 'Close', html: SVG.close, onclick: close })),
      h('div', { class: 'body' }, content), foot);
    const scrim = h('div', { class: 'scrim', onclick: e => { if (e.target === scrim) close(); } }, sheet);
    document.body.append(scrim); document.addEventListener('keydown', key);
    setTimeout(() => { const f = sheet.querySelector('input:not([type=checkbox]):not([type=range]),textarea'); if (f && !isTouch()) f.focus(); }, 60);
    return { el: sheet, close };
  },
  ask(msg, { ok = 'OK', cancel = 'Cancel', danger = false } = {}) {
    return new Promise(res => {
      const done = v => { scrim.remove(); res(v); };
      const box = h('div', { class: 'dialog', role: 'alertdialog' }, h('p', null, msg),
        h('div', { class: 'row nw' }, h('button', { class: 'btn', onclick: () => done(false) }, cancel), h('button', { class: 'btn ' + (danger ? 'bad' : 'pri'), onclick: () => done(true) }, ok)));
      const scrim = h('div', { class: 'scrim', style: { alignItems: 'center' }, onclick: e => { if (e.target === scrim) done(false); } }, box);
      document.body.append(scrim); setTimeout(() => box.querySelector('.btn:last-child').focus(), 30);
    });
  },
  prompt(title, { value = '', placeholder = '', ok = 'Save', type = 'text' } = {}) {
    return new Promise(res => {
      let val = null;
      const inp = h('input', { type, value, placeholder, onkeydown: e => { if (e.key === 'Enter') { val = inp.value; s.close(); } } });
      const s = UI.sheet({ title, body: h('div', null, inp), onClose: () => res(val), actions: [{ label: 'Cancel' }, { label: ok, cls: 'pri', onClick: c => { val = inp.value; c(); } }] });
      setTimeout(() => { inp.focus(); inp.select(); }, 80);
    });
  },
  menu(title, items) {
    const s = UI.sheet({ title, body: h('div', { class: 'list' }, items.filter(Boolean).map(it => h('button', { class: 'li', onclick: () => { s.close(); it.run(); } },
      h('span', { class: 'ic' }, it.icon || '•'), h('span', { class: 't' }, h('b', { style: it.danger ? { color: 'var(--bad)' } : null }, it.label), it.sub ? h('small', null, it.sub) : null)))) });
  },
  empty(icon, title, text) { return h('div', { class: 'empty' }, h('div', { class: 'big' }, icon), h('b', null, title), text ? h('div', null, text) : null); },
  seg(options, value, onPick) {
    const el = h('div', { class: 'seg', role: 'group' });
    const draw = v => { el.innerHTML = ''; for (const [val, label] of options) el.append(h('button', { 'aria-pressed': String(val === v), onclick: () => { draw(val); onPick(val); } }, label)); };
    draw(value); return el;
  },
  tabs(options, value, onPick) {
    const el = h('div', { class: 'tabs', role: 'tablist' });
    const draw = v => { el.innerHTML = ''; for (const [val, label] of options) el.append(h('button', { 'aria-pressed': String(val === v), role: 'tab', onclick: () => { draw(val); onPick(val); } }, label)); };
    draw(value); return el;
  },
  swatches(colors, value, onPick) {
    const el = h('div', { class: 'swatches' });
    const draw = v => { el.innerHTML = ''; for (const c of colors) el.append(h('button', { class: 'swatch', style: { background: c }, 'aria-label': 'Color', 'aria-pressed': String(c === v), onclick: () => { draw(c); onPick(c); } })); };
    draw(value); return el;
  },
};

/* ---------- files in and out ---------- */
function pickFiles(accept, { multiple = true, capture } = {}) {
  return new Promise(res => {
    const i = h('input', { type: 'file', accept, style: { position: 'fixed', left: '-999px' } });
    if (multiple) i.multiple = true; if (capture) i.setAttribute('capture', capture);
    i.onchange = () => { res([...i.files]); i.remove(); };
    i.addEventListener('cancel', () => { res([]); i.remove(); });
    document.body.append(i); i.click();
  });
}
async function saveFile(blob, name) {
  const file = new File([blob], name, { type: blob.type || 'application/octet-stream' });
  if (isTouch() && navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file] }); return 'shared'; } catch (e) { if (e.name === 'AbortError') return 'cancel'; }
  }
  const a = h('a', { href: URL.createObjectURL(blob), download: name, style: { display: 'none' } });
  document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 8000);
  return 'downloaded';
}
async function shareText(text, title) {
  if (navigator.share) { try { await navigator.share({ title, text }); return; } catch (e) { if (e.name === 'AbortError') return; } }
  try { await navigator.clipboard.writeText(text); UI.toast('Copied'); } catch (e) { UI.toast('Could not share'); }
}
async function copyText(t, what = 'Copied') {
  try { await navigator.clipboard.writeText(t); UI.toast(what); return true; }
  catch (e) {
    const ta = h('textarea', { style: { position: 'fixed', left: '-999px' } }); ta.value = t; document.body.append(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (e2) { } ta.remove(); UI.toast(ok ? what : 'Copy failed'); return ok;
  }
}
const URLS = { // object URLs for stored blobs, freed when an app closes
  live: new Set(),
  of(blob) { const u = URL.createObjectURL(blob); this.live.add(u); return u; },
  freeAll() { for (const u of this.live) URL.revokeObjectURL(u); this.live.clear(); },
};
function imageThumb(blobOrCanvas, size = 320, type = 'image/jpeg') {
  return new Promise(res => {
    const draw = src => {
      const w = src.naturalWidth || src.videoWidth || src.width, ht = src.naturalHeight || src.videoHeight || src.height;
      if (!w || !ht) return res(null);
      const k = Math.min(1, size / Math.max(w, ht)), c = h('canvas'); c.width = Math.round(w * k); c.height = Math.round(ht * k);
      c.getContext('2d').drawImage(src, 0, 0, c.width, c.height); res({ url: c.toDataURL(type, 0.8), w, h: ht });
    };
    if (blobOrCanvas instanceof HTMLCanvasElement) return draw(blobOrCanvas);
    const img = new Image(), u = URL.createObjectURL(blobOrCanvas);
    img.onload = () => { draw(img); URL.revokeObjectURL(u); }; img.onerror = () => { URL.revokeObjectURL(u); res(null); }; img.src = u;
  });
}
function videoThumb(blob, size = 320) {
  return new Promise(res => {
    const v = h('video', { muted: true, playsinline: true, preload: 'metadata' }), u = URL.createObjectURL(blob); v.muted = true;
    let done = false; const fin = r => { if (done) return; done = true; URL.revokeObjectURL(u); res(r); };
    v.onloadeddata = () => { try { v.currentTime = Math.min(0.5, (v.duration || 1) / 3); } catch (e) { fin(null); } };
    v.onseeked = () => { const k = Math.min(1, size / Math.max(v.videoWidth, v.videoHeight)), c = h('canvas'); c.width = Math.max(1, Math.round(v.videoWidth * k)); c.height = Math.max(1, Math.round(v.videoHeight * k)); try { c.getContext('2d').drawImage(v, 0, 0, c.width, c.height); fin({ url: c.toDataURL('image/jpeg', 0.75), w: v.videoWidth, h: v.videoHeight, dur: v.duration }); } catch (e) { fin(null); } };
    v.onerror = () => fin(null); setTimeout(() => fin(null), 8000); v.src = u;
  });
}

/* ---------- sound + voice ---------- */
const Sfx = {
  _c: null,
  ctx() { if (!this._c) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; this._c = new C(); } if (this._c.state === 'suspended') this._c.resume(); return this._c; },
  tone(freq, dur = 0.15, { type = 'sine', vol = 0.2, when = 0, slide } = {}) {
    const c = this.ctx(); if (!c) return; const t = c.currentTime + when, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
  },
  good() { this.tone(660, 0.12, { type: 'triangle' }); this.tone(990, 0.18, { type: 'triangle', when: 0.09 }); },
  bad() { this.tone(220, 0.25, { type: 'sawtooth', vol: 0.08, slide: 150 }); },
  tap() { this.tone(520, 0.05, { type: 'triangle', vol: 0.08 }); },
  chime() { [784, 988, 1175, 1568].forEach((f, i) => this.tone(f, 0.5, { type: 'sine', vol: 0.18, when: i * 0.14 })); },
  win() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.25, { type: 'triangle', vol: 0.15, when: i * 0.1 })); },
  on() { return Prefs.get('sound', true); },
};
['good', 'bad', 'tap', 'win'].forEach(k => { const f = Sfx[k]; Sfx[k] = function () { if (Sfx.on()) f.call(Sfx); }; });
const Speak = {
  ok: 'speechSynthesis' in window,
  say(text, { rate = 1, lang } = {}) {
    if (!this.ok) return false; speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.rate = rate;
    const vs = speechSynthesis.getVoices(); const v = vs.find(v => /en(-|_)US/i.test(v.lang) && v.localService) || vs.find(v => /^en/i.test(v.lang));
    if (lang) u.lang = lang; else if (v) { u.voice = v; u.lang = v.lang; }
    speechSynthesis.speak(u); return true;
  },
  stop() { if (this.ok) speechSynthesis.cancel(); },
};
function seeded(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
function hashStr(str) { let x = 2166136261; for (let i = 0; i < str.length; i++) { x ^= str.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
function addCSS(t) { document.head.append(h('style', null, t)); }
/* calendar file (.ics) so iPhone Calendar can alert you even when Super One is closed */
const ICS = {
  stamp(d, allDay) { return allDay ? d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()) : d.getUTCFullYear() + pad2(d.getUTCMonth() + 1) + pad2(d.getUTCDate()) + 'T' + pad2(d.getUTCHours()) + pad2(d.getUTCMinutes()) + '00Z'; },
  esc(s) { return String(s || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/[,;]/g, m => '\\' + m); },
  make(items) {
    const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Super One//EN', 'CALSCALE:GREGORIAN'];
    for (const it of items) {
      L.push('BEGIN:VEVENT', 'UID:' + (it.id || uid()) + '@nova-pocket', 'DTSTAMP:' + this.stamp(new Date()), 'SUMMARY:' + this.esc(it.title));
      if (it.allDay) { const e = new Date(it.start); e.setDate(e.getDate() + 1); L.push('DTSTART;VALUE=DATE:' + this.stamp(it.start, true), 'DTEND;VALUE=DATE:' + this.stamp(e, true)); }
      else L.push('DTSTART:' + this.stamp(it.start), 'DTEND:' + this.stamp(it.end || new Date(+it.start + 30 * 60e3)));
      if (it.rrule) L.push('RRULE:' + it.rrule);
      if (it.notes) L.push('DESCRIPTION:' + this.esc(it.notes));
      if (it.alarmMin != null) L.push('BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + this.esc(it.title), 'TRIGGER:-PT' + it.alarmMin + 'M', 'END:VALARM');
      L.push('END:VEVENT');
    }
    L.push('END:VCALENDAR'); return new Blob([L.join('\r\n')], { type: 'text/calendar' });
  },
};
/* press-and-hold (iPhone has no right-click) */
function onLongPress(el, fn, ms = 550) {
  let t = null, fired = false, x0 = 0, y0 = 0;
  el.addEventListener('pointerdown', e => { fired = false; x0 = e.clientX; y0 = e.clientY; clearTimeout(t); t = setTimeout(() => { fired = true; try { navigator.vibrate && navigator.vibrate(15); } catch (er) { } fn(); }, ms); });
  el.addEventListener('pointermove', e => { if (Math.hypot(e.clientX - x0, e.clientY - y0) > 10) clearTimeout(t); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(k => el.addEventListener(k, () => clearTimeout(t)));
  el.addEventListener('click', e => { if (fired) { e.stopImmediatePropagation(); e.preventDefault(); fired = false; } }, true);
  el.addEventListener('contextmenu', e => { e.preventDefault(); if (!fired) { clearTimeout(t); fn(); } });
  el.style.webkitTouchCallout = 'none';
  return el;
}

/* ---- 01-shell.js ---- */
/* ===== Shell: home screen, app switching, settings, backup, offline saving ===== */
const Apps = {
  list: [], byId: {},
  reg(a) { this.list.push(a); this.byId[a.id] = a; },
  GROUPS: [['day', 'Everyday'], ['make', 'Create'], ['learn', 'Learn'], ['play', 'Play & social'], ['tools', 'Tools']],
};

const Shell = {
  cur: null, cleanup: null, backFn: null, scrollMemo: {},
  init() {
    const app = $('#app');
    this.top = h('header', { class: 'top' });
    this.view = h('main', { id: 'view' });
    app.append(this.top, this.view);
    document.body.append(h('div', { id: 'mini', hidden: true }));
    addEventListener('hashchange', () => this.route());
    addEventListener('scroll', () => this.top.classList.toggle('scrolled', scrollY > 4), { passive: true });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('.scrim') && this.cur) this.back(); });
    this.route();
    setInterval(() => { if (!this.cur) this.paintHello(); }, 30000);
  },
  go(id, param) { location.hash = '#/' + (id || '') + (param ? '/' + encodeURIComponent(param) : ''); },
  back() { if (this.backFn) { const f = this.backFn; if (f() !== false) return; } this.go(''); },
  route() {
    const m = location.hash.match(/^#\/([\w-]*)(?:\/(.*))?$/); const id = m && m[1], param = m && m[2] ? decodeURIComponent(m[2]) : null;
    if (this.cleanup) { try { this.cleanup(); } catch (e) { console.error(e); } this.cleanup = null; }
    URLS.freeAll(); Speak.stop();
    if (this.cur) this.scrollMemo[this.cur.id] = scrollY; else this.scrollMemo.home = scrollY;
    this.backFn = null; this.view.classList.remove('full'); this.view.innerHTML = ''; this.top.innerHTML = '';
    const a = id && Apps.byId[id];
    document.body.classList.toggle('on-home', !a); this.view.classList.remove('enter'); void this.view.offsetWidth; this.view.classList.add('enter');
    if (!a) { this.cur = null; document.title = 'Super One'; this.renderHome(); requestAnimationFrame(() => scrollTo(0, this.scrollMemo.home || 0)); return; }
    this.cur = a; document.title = a.name + ' · Super One';
    try { const o = Prefs.get('appOpens', {}); o[a.id] = { n: ((o[a.id] || {}).n || 0) + 1, last: Date.now() }; Prefs.set('appOpens', o); } catch (e) { }
    const title = h('h1', null, a.name), acts = h('div', { class: 'acts' });
    this.top.append(h('button', { class: 'back', 'aria-label': 'Back', onclick: () => this.back(), html: SVG.back + '<span>Back</span>' }), title, acts);
    const ctx = {
      param,
      setTitle: t => { title.textContent = t; },
      setActions: (...n) => { acts.innerHTML = ''; acts.append(...n.flat().filter(Boolean)); },
      setBack: f => { this.backFn = f; },
      full: on => this.view.classList.toggle('full', !!on),
    };
    scrollTo(0, 0);
    try { const c = a.mount(this.view, ctx); if (typeof c === 'function') this.cleanup = c; else if (c && c.then) c.then(f => { if (typeof f === 'function' && this.cur === a) this.cleanup = f; }).catch(e => this.crash(e)); }
    catch (e) { this.crash(e); }
  },
  crash(e) { console.error(e); this.view.append(UI.empty('🛠️', 'Something went wrong here', String(e && e.message || e))); },

  /* ---------- home screen: see 02-home.js ---------- */

  /* ---------- settings ---------- */
  async settings() {
    const body = h('div', { class: 'stack' });
    const theme = Prefs.get('theme', 'system'), size = Prefs.get('size', 'normal');
    const nameIn = h('input', { type: 'text', value: Prefs.get('name', ''), placeholder: 'Your first name (optional)', onchange: () => { Prefs.set('name', nameIn.value.trim().slice(0, 30)); this.paintHello(); } });
    body.append(
      h('div', { class: 'sec', style: { marginTop: '4px' } }, 'Look'),
      h('label', { class: 'f' }, h('span', null, 'Name on the home screen'), nameIn),
      h('label', { class: 'f' }, h('span', null, 'Theme'), UI.seg([['system', 'Auto'], ['light', 'Light'], ['dark', 'Dark']], theme, v => { Prefs.set('theme', v); applyLook(); })),
      h('label', { class: 'f' }, h('span', null, 'Text size'), UI.seg([['normal', 'Normal'], ['big', 'Bigger']], size, v => { Prefs.set('size', v); applyLook(); })),
      h('label', { class: 'f' }, h('span', null, 'Sounds'), UI.seg([[true, 'On'], [false, 'Off']], Prefs.get('sound', true), v => Prefs.set('sound', v))),
      h('div', { class: 'sec' }, 'Works offline'), await Offline.panel(),
      h('div', { class: 'sec' }, 'Your stuff'), await Backup.panel(),
      h('div', { class: 'sec' }, 'About'),
      h('div', { class: 'card small' },
        h('p', null, h('b', null, 'Super One'), ' · version ', h('span', { class: 'kbd' }, window.NP_VERSION || 'dev')),
        h('p', { class: 'muted' }, 'Made for you. Nothing you save is sent anywhere. Weather is the only part that uses the internet, and only when you tap refresh.'),
        h('p', { class: 'muted' }, 'Dictionary: WordNet 3.1 © Princeton University. Map shapes: Natural Earth (public domain) via world-atlas. Country facts: mledoze/countries (ODbL). Weather data: Open-Meteo.com (CC BY 4.0).')),
      h('button', { class: 'btn bad wide mt', onclick: () => Backup.eraseAll() }, 'Erase everything on this device'));
    UI.sheet({ title: 'Settings', body });
  },
};
function applyLook() {
  const t = Prefs.get('theme', 'system'), r = document.documentElement;
  if (t === 'system') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', t);
  r.setAttribute('data-size', Prefs.get('size', 'normal'));
  const dark = t === 'dark' || (t === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  const m = $('meta[name=theme-color]'); if (m) m.content = dark ? '#0C0D12' : '#F3F4F9';
}
applyLook();
matchMedia('(prefers-color-scheme: dark)').addEventListener && matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyLook);

/* ---------- offline saving (service worker) ---------- */
const Offline = {
  state: { core: false, data: false, done: 0, total: 0, err: '' }, pills: new Set(),
  standalone() { return matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || navigator.standalone === true; },
  supported() { return 'serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1'); },
  async init() {
    addEventListener('online', () => this.paint()); addEventListener('offline', () => this.paint());
    if (!this.supported()) { this.paint(); return; }
    navigator.serviceWorker.addEventListener('message', e => {
      const m = e.data || {};
      if (m.type === 'core-done') this.state.core = true;
      if (m.type === 'data-progress') { this.state.done = m.done; this.state.total = m.total; }
      if (m.type === 'data-done') { this.state.data = true; this.state.done = this.state.total; }
      if (m.type === 'failed') this.state.err = m.error || 'failed';
      this.paint();
    });
    let had = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (had) this.updateReady(); had = true; this.kick(); });
    try { await navigator.serviceWorker.register('sw.js'); } catch (e) { this.state.err = String(e); }
    await this.check(); this.kick();
    try { if (navigator.storage && navigator.storage.persist && !(await navigator.storage.persisted())) await navigator.storage.persist(); } catch (e) { }
  },
  async check() {
    try { this.state.core = !!(await caches.match('__core_complete')); this.state.data = !!(await caches.match('__data_complete')); } catch (e) { }
    this.paint();
  },
  async kick() {
    if (this.state.data) return;
    const reg = await navigator.serviceWorker.ready.catch(() => null);
    const sw = (reg && reg.active) || navigator.serviceWorker.controller; if (sw) sw.postMessage({ type: 'cacheData' });
  },
  updateReady() {
    if ($('#updbar')) return;
    document.body.append(h('div', { class: 'alertbar', id: 'updbar', style: { borderLeftColor: 'var(--accent)' } }, h('span', { style: { fontSize: '24px' } }, '✨'), h('span', { style: { flex: 1 } }, h('b', null, 'New version saved.'), ' Restart to use it.'), h('button', { class: 'btn pri sm', onclick: () => location.reload() }, 'Restart')));
  },
  label() {
    const s = this.state;
    if (!this.supported()) return ['', 'Online page'];
    if (s.core && s.data) return ['good', navigator.onLine ? 'Works offline' : 'Offline · all good'];
    if (s.core) return ['warn', s.total ? 'Saving ' + Math.round(100 * s.done / s.total) + '%' : 'Saving…'];
    return [navigator.onLine ? 'warn' : 'bad', navigator.onLine ? 'Saving…' : 'Not saved yet'];
  },
  pill() { const p = h('span', { class: 'pill', title: 'Offline status' }); this.pills.add(p); this.paintPill(p); return p; },
  paintPill(p) { const [c, t] = this.label(); p.className = 'pill ' + c; p.innerHTML = '<span class="dot"></span>' + esc(t); },
  paint() { for (const p of this.pills) { if (!p.isConnected) { this.pills.delete(p); continue; } this.paintPill(p); } const pn = $('#offpanel'); if (pn) this.fillPanel(pn); },
  async panel() { const el = h('div', { class: 'card small', id: 'offpanel' }); this.fillPanel(el); return el; },
  fillPanel(el) {
    const s = this.state; el.innerHTML = '';
    if (!this.supported()) { el.append(h('p', null, 'Open Super One from its web address (https) to let it save itself for offline use.')); return; }
    el.append(h('p', null, (s.core ? '✅' : '⏳') + ' The app itself ' + (s.core ? 'is saved on this device.' : 'is being saved…')),
      h('p', null, (s.data ? '✅' : '⏳') + ' Dictionary + world map ' + (s.data ? 'saved.' : s.total ? 'saving: ' + s.done + ' of ' + s.total + ' files.' : 'waiting to save.')));
    if (!s.data) el.append(h('div', { class: 'prog mb' }, h('i', { style: { width: (s.total ? 100 * s.done / s.total : 4) + '%' } })), h('button', { class: 'btn sm', onclick: () => this.kick() }, 'Try saving again'));
    if (s.err) el.append(h('p', { class: 'muted tiny' }, 'Last problem: ' + s.err));
    el.append(h('p', { class: 'muted', style: { margin: '8px 0 0' } }, this.standalone() ? 'You opened me from the Home Screen. 👍' : 'On iPhone: Share button → “Add to Home Screen”. On a computer: the install icon in the address bar.'));
  },
};

/* ---------- backup: one .zip with everything (store-only zip, no library) ---------- */
const Zip = {
  crcT: null,
  crc(u8) { let t = this.crcT; if (!t) { t = this.crcT = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } } let c = 0xFFFFFFFF; for (let i = 0; i < u8.length; i++) c = t[(c ^ u8[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; },
  async make(files) {
    const parts = [], cd = []; let off = 0; const enc = new TextEncoder(), now = new Date();
    const time = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1), date = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
    for (const f of files) {
      const name = enc.encode(f.name); const data = f.data instanceof Blob ? new Uint8Array(await f.data.arrayBuffer()) : (typeof f.data === 'string' ? enc.encode(f.data) : f.data);
      const crc = this.crc(data), size = data.length;
      const lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, 0, true); lh.setUint16(10, time, true); lh.setUint16(12, date, true);
      lh.setUint32(14, crc, true); lh.setUint32(18, size, true); lh.setUint32(22, size, true); lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
      parts.push(lh.buffer, name, data);
      const c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(10, 0, true); c.setUint16(12, time, true); c.setUint16(14, date, true);
      c.setUint32(16, crc, true); c.setUint32(20, size, true); c.setUint32(24, size, true); c.setUint16(28, name.length, true); c.setUint32(42, off, true);
      cd.push(c.buffer, name); off += 30 + name.length + size;
    }
    const cdSize = cd.reduce((a, b) => a + (b.byteLength || b.length), 0);
    const e = new DataView(new ArrayBuffer(22)); e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, cdSize, true); e.setUint32(16, off, true);
    return new Blob([...parts, ...cd, e.buffer], { type: 'application/zip' });
  },
  async read(blob) {
    const tailLen = Math.min(blob.size, 65557), tail = new DataView(await blob.slice(blob.size - tailLen).arrayBuffer());
    let eo = -1; for (let i = tailLen - 22; i >= 0; i--) if (tail.getUint32(i, true) === 0x06054b50) { eo = i; break; }
    if (eo < 0) throw new Error('This is not a Super One backup file.');
    const count = tail.getUint16(eo + 10, true), cdSize = tail.getUint32(eo + 12, true), cdOff = tail.getUint32(eo + 16, true);
    const cd = new DataView(await blob.slice(cdOff, cdOff + cdSize).arrayBuffer()), dec = new TextDecoder(), out = [];
    let p = 0;
    for (let i = 0; i < count; i++) {
      const size = cd.getUint32(p + 24, true), nl = cd.getUint16(p + 28, true), xl = cd.getUint16(p + 30, true), cl = cd.getUint16(p + 32, true), lo = cd.getUint32(p + 42, true), method = cd.getUint16(p + 10, true);
      const name = dec.decode(new Uint8Array(cd.buffer, cd.byteOffset + p + 46, nl));
      const lh = new DataView(await blob.slice(lo, lo + 30).arrayBuffer()); const start = lo + 30 + lh.getUint16(26, true) + lh.getUint16(28, true);
      const csize = cd.getUint32(p + 20, true);
      if (method === 0) out.push({ name, blob: blob.slice(start, start + size) });
      else if (method === 8 && typeof DecompressionStream !== 'undefined') { const ds = blob.slice(start, start + csize).stream().pipeThrough(new DecompressionStream('deflate-raw')); out.push({ name, blob: await new Response(ds).blob() }); }
      else throw new Error('This zip uses a kind of packing I can’t open.');
      p += 46 + nl + xl + cl;
    }
    return out;
  },
};
const Backup = {
  async make(withFiles) {
    const files = [], data = { app: 'nova-pocket', format: 1, made: new Date().toISOString(), kv: await DB.kentries(), stores: {} };
    let n = 0;
    for (const s of DB.STORES) {
      if (s === 'kv') continue;
      const rows = await DB.all(s); data.stores[s] = [];
      for (const r of rows) {
        const o = {}; let skip = false;
        for (const k in r) {
          if (r[k] instanceof Blob) { if (!withFiles) { skip = true; break; } const nm = 'files/' + (n++) + '-' + s; files.push({ name: nm, data: r[k] }); o[k] = { $blob: nm, type: r[k].type }; }
          else if (Array.isArray(r[k]) && r[k].some(x => x instanceof Blob)) { if (!withFiles) { skip = true; break; } o[k] = r[k].map(x => { if (!(x instanceof Blob)) return x; const nm = 'files/' + (n++) + '-' + s; files.push({ name: nm, data: x }); return { $blob: nm, type: x.type }; }); }
          else o[k] = r[k];
        }
        if (!skip) data.stores[s].push(o);
      }
    }
    files.unshift({ name: 'nova-pocket-backup.json', data: JSON.stringify(data) });
    return Zip.make(files);
  },
  async restore(file) {
    const entries = await Zip.read(file), byName = Object.fromEntries(entries.map(e => [e.name, e.blob]));
    const main = byName['nova-pocket-backup.json']; if (!main) throw new Error('This is not a Super One backup file.');
    const data = JSON.parse(await main.text()); if (data.app !== 'nova-pocket') throw new Error('This is not a Super One backup file.');
    let count = 0;
    for (const [k, v] of data.kv || []) await DB.kset(k, v);
    for (const s in data.stores) {
      if (!DB.STORES.includes(s)) continue;
      for (const o of data.stores[s]) {
        for (const k in o) if (o[k] && typeof o[k] === 'object' && o[k].$blob) { const b = byName[o[k].$blob]; o[k] = b ? new Blob([b], { type: o[k].type || '' }) : null; }
        for (const k in o) if (Array.isArray(o[k])) o[k] = o[k].map(x => x && typeof x === 'object' && x.$blob ? (byName[x.$blob] ? new Blob([byName[x.$blob]], { type: x.type || '' }) : null) : x);
        await DB.put(s, o); count++;
      }
    }
    return count;
  },
  async panel() {
    const el = h('div', { class: 'card small' });
    const last = await DB.kget('lastBackup', 0); let est = '';
    try { const e = await navigator.storage.estimate(); est = fmtSize(e.usage || 0) + ' used'; } catch (e) { }
    let persisted = false; try { persisted = await navigator.storage.persisted(); } catch (e) { }
    el.append(
      h('p', null, '💾 ', last ? 'Last backup: ' + fmtAgo(last) + '.' : 'You have not made a backup yet.', est ? ' ' + est + '.' : ''),
      h('p', { class: 'muted' }, persisted ? '🔒 This device has promised to keep your stuff.' : 'A backup file keeps your notes, cards, photos and more safe if this device ever clears its storage.'),
      h('div', { class: 'row' },
        h('button', { class: 'btn pri sm', onclick: () => this.run(true) }, 'Back up everything'),
        h('button', { class: 'btn sm', onclick: () => this.run(false) }, 'Text only (small)'),
        h('button', { class: 'btn sm', onclick: () => this.pickRestore() }, 'Restore…')));
    return el;
  },
  async run(withFiles) {
    UI.toast('Making your backup…');
    try {
      const z = await this.make(withFiles);
      const r = await saveFile(z, 'super-one-backup-' + ymd(new Date()) + '.zip');
      if (r !== 'cancel') { await DB.kset('lastBackup', Date.now()); UI.toast(r === 'shared' ? 'Backup ready. Pick “Save to Files”.' : 'Backup saved (' + fmtSize(z.size) + ')'); }
    } catch (e) { console.error(e); UI.toast('Backup failed: ' + e.message, 4000); }
  },
  async pickRestore() {
    const [f] = await pickFiles('.zip,application/zip', { multiple: false }); if (!f) return;
    if (!(await UI.ask('Add everything from this backup? Items that are already here stay; items with the same name get the backup copy.', { ok: 'Restore' }))) return;
    try { const n = await this.restore(f); UI.toast('Restored ' + n + ' items'); setTimeout(() => location.reload(), 900); }
    catch (e) { UI.toast(e.message, 4000); }
  },
  async nudge(v) {
    const last = await DB.kget('lastBackup', 0); if (last && Date.now() - last < 30 * 86400e3) return;
    const n = (await DB.count('notes')) + (await DB.count('cards')) + (await DB.count('media')) + (await DB.count('vault'));
    if (n < 5) return;
    v.append(h('button', { class: 'home-banner glass', onclick: () => Shell.settings() }, h('span', { style: { fontSize: '24px' } }, '💾'), h('span', { style: { flex: 1 } }, h('b', null, 'Time for a backup. '), last ? 'Your last one was ' + fmtAgo(last) + '.' : 'Save a copy of your stuff in Files.')));
  },
  async eraseAll() {
    if (!(await UI.ask('Erase ALL notes, passwords, photos, music, cards and settings on this device?', { ok: 'Erase', danger: true }))) return;
    if (!(await UI.ask('Are you really sure? This can’t be undone unless you have a backup file.', { ok: 'Yes, erase all', danger: true }))) return;
    for (const s of DB.STORES) await DB.clear(s);
    try { localStorage.clear(); } catch (e) { }
    location.hash = '#/'; location.reload();
  },
};

/* ---- 02-home.js ---- */
/* ===== Home screen: wallpaper, big clock, widgets, favorites dock, app icons ===== */
addCSS(`
#wall{position:fixed;inset:0;z-index:-1;background:var(--bg);background-size:cover;background-position:center;opacity:0;transition:opacity .25s}
body.on-home #wall{opacity:1}
body.on-home{background:transparent}
body.on-home .top{background:transparent;-webkit-backdrop-filter:none;backdrop-filter:none;border-color:transparent;color:#fff}
body.on-home .top.scrolled{background:rgba(10,8,30,.35);-webkit-backdrop-filter:blur(18px) saturate(1.4);backdrop-filter:blur(18px) saturate(1.4)}
body.on-home .top .ib{color:#fff}
body.on-home .top .pill{background:rgba(255,255,255,.18);color:#fff}
body.on-home .top .pill.good .dot{color:#5CF29A}
.brand{display:flex;align-items:center;gap:8px;flex:1;min-width:0;white-space:nowrap;overflow:hidden;font-family:var(--round);font-weight:900;font-size:19px;letter-spacing:.02em;font-style:italic}
.brand i{display:grid;place-items:center;width:30px;height:30px;border-radius:9px;background:linear-gradient(135deg,#FF3D7F,#7C3AED 50%,#1E40FF);font-style:normal;font-size:12px;font-weight:900;box-shadow:0 2px 8px rgba(0,0,0,.25)}
main#view.enter{animation:appIn .3s cubic-bezier(.2,.8,.2,1)}
@keyframes appIn{from{opacity:0;transform:translateY(10px) scale(.995)}}
.hero{color:#fff;text-align:center;padding:6px 0 4px;text-shadow:0 2px 14px rgba(0,0,0,.25)}
.hero .clk{font-size:clamp(64px,22vw,96px);font-weight:200;letter-spacing:-.03em;line-height:1;font-variant-numeric:tabular-nums;font-family:var(--round)}
.hero .dt{font-size:18px;font-weight:600;opacity:.95;margin-top:4px}
.hero .gr{font-size:15px;opacity:.85;margin-top:2px}
.glass{background:rgba(255,255,255,.14);-webkit-backdrop-filter:blur(22px) saturate(1.5);backdrop-filter:blur(22px) saturate(1.5);border:1px solid rgba(255,255,255,.22);border-radius:22px;color:#fff;box-shadow:0 8px 30px rgba(0,0,0,.12)}
:root[data-theme="dark"] .glass{background:rgba(20,18,40,.32)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .glass{background:rgba(20,18,40,.32)}}
.widgets{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:18px}
@media (min-width:700px){.widgets{grid-template-columns:repeat(4,minmax(0,1fr))}}
.wd{display:flex;flex-direction:column;align-items:flex-start;text-align:left;padding:14px;min-height:150px;min-width:0;border:1px solid rgba(255,255,255,.22);font:inherit;color:#fff}
.wd:active{transform:scale(.98)}
.wd.wide{grid-column:span 2;min-height:0}
.wd.hmw{position:relative;padding-right:76px}
.wd.hmw::after{content:"🏠";position:absolute;right:16px;top:50%;transform:translateY(-50%);font-size:44px;filter:drop-shadow(0 2px 6px rgba(0,0,0,.25))}
.wd .k{font-size:12px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;opacity:.8;display:flex;align-items:center;gap:6px}
.wd .big{font-size:40px;font-weight:300;line-height:1.05;margin-top:6px;font-family:var(--round)}
.wd .t1{font-size:16px;font-weight:700;margin-top:6px;line-height:1.25;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;word-break:break-word}
.wd .t2{font-size:13px;opacity:.85;margin-top:auto;padding-top:6px;line-height:1.3;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.wd ul{list-style:none;padding:0;margin:8px 0 0;font-size:14px;width:100%}
.wd li{display:flex;gap:8px;align-items:center;padding:3px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wd li::before{content:"";width:12px;height:12px;border-radius:50%;border:2px solid rgba(255,255,255,.8);flex:0 0 auto}
.wd .verse{font-size:15px;font-style:italic;line-height:1.4;margin-top:6px;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}
.hsearch{position:relative;margin-top:14px}
.hsearch input{background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.25);color:#fff;border-radius:16px;padding-left:42px;-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px)}
.hsearch input::placeholder{color:rgba(255,255,255,.75)}
.hsearch svg{position:absolute;left:14px;top:50%;transform:translateY(-50%);width:18px;height:18px;color:rgba(255,255,255,.85)}
.dock{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;padding:12px 10px 10px;margin-top:14px}
.home-sec{color:#fff;font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin:24px 6px 10px;opacity:.85;text-shadow:0 1px 6px rgba(0,0,0,.3)}
.appgrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px 8px;padding:16px 8px}
@media (min-width:600px){.appgrid{grid-template-columns:repeat(6,minmax(0,1fr))}}
@media (min-width:860px){.appgrid{grid-template-columns:repeat(8,minmax(0,1fr))}}
.app{display:flex;flex-direction:column;align-items:center;gap:6px;border:0;background:none;padding:0;min-width:0;color:#fff}
.app .ico{position:relative;width:60px;height:60px;border-radius:16px;display:grid;place-items:center;box-shadow:0 4px 12px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.35)}
.app .ico::after{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(180deg,rgba(255,255,255,.22),rgba(255,255,255,0) 50%);pointer-events:none}
.app .ico svg{width:31px;height:31px;color:#fff;filter:drop-shadow(0 1px 1px rgba(0,0,0,.15))}
.app:active .ico{transform:scale(.9)}
.app > span:last-child{font-size:12px;font-weight:600;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 4px rgba(0,0,0,.45)}
@media (max-width:360px){.app .ico{width:52px;height:52px;border-radius:14px}.app .ico svg{width:26px;height:26px}}
/* for you */
.fyrow{display:flex;gap:10px;overflow-x:auto;scrollbar-width:none;padding:2px 2px 6px;margin:0 -2px}
.fyrow::-webkit-scrollbar{display:none}
.fyc{flex:0 0 auto;width:196px;min-height:112px;display:flex;flex-direction:column;align-items:flex-start;gap:4px;text-align:left;padding:14px;border:1px solid rgba(255,255,255,.22);font:inherit;color:#fff}
.fyc:active{transform:scale(.97)}
.fyc .e{font-size:28px;line-height:1}
.fyc b{font-size:15px;line-height:1.25}
.fyc small{font-size:12.5px;opacity:.85;line-height:1.3}
.home-note{color:rgba(255,255,255,.85);text-align:center;font-size:12px;margin:22px 0 0;text-shadow:0 1px 4px rgba(0,0,0,.4)}
.home-banner{display:flex;gap:10px;align-items:center;padding:12px 14px;margin-top:12px;font-size:14px;text-align:left;width:100%;font:inherit;color:#fff}
.li .ic svg{width:22px;height:22px;color:#fff}
.wallpick{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.wallpick button{aspect-ratio:9/14;border-radius:14px;border:3px solid transparent;background-size:cover!important;background-position:center!important;color:#fff;font-weight:700;font-size:12px;display:flex;align-items:flex-end;justify-content:center;padding:6px;text-shadow:0 1px 3px rgba(0,0,0,.6)}
.wallpick button[aria-pressed="true"]{border-color:var(--accent);box-shadow:0 0 0 2px var(--bg) inset}
`);
const ICON_PATHS = {
  calendar: '<rect x="3" y="4.5" width="18" height="16" rx="3"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4M7.5 13.5h.01M12 13.5h.01M16.5 13.5h.01M7.5 17h.01M12 17h.01"/>',
  notes: '<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M9 8h6M9 12h6M9 16h4"/>',
  reminders: '<path d="M4 6l1.5 1.5L8 5M4 12l1.5 1.5L8 11M4 18l1.5 1.5L8 17M11.5 6.5h8.5M11.5 12.5h8.5M11.5 18.5h8.5"/>',
  passwords: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3M12 14.5v2.5"/>',
  fit: '<circle cx="12" cy="4.2" r="2.1"/><path d="M12 7.5v6.5M5 9.5l7 1.2 7-1.2M8.5 21.5l3.5-7.5 3.5 7.5"/>',
  map: '<path d="M3 6.5l6-2.5 6 2.5 6-2.5v13.5l-6 2.5-6-2.5-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>',
  weather: '<path d="M7 19h10a4 4 0 0 0 .5-7.97A5.5 5.5 0 0 0 7 11.5 3.75 3.75 0 0 0 7 19z"/><path d="M15.5 5.5a3.5 3.5 0 0 1 4.5 4M17.5 2.5v.01M21.5 6.5v.01"/>',
  media: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="9.5" r="1.8"/><path d="M21 15.5l-5-5-9.5 9.5"/>',
  music: '<path d="M9 18V5.5l11-2V16"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
  memos: '<rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/>',
  studio: '<path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-.9 2-1.9 0-1-.9-1.6-.9-2.6 0-1.1 1-1.9 2.3-1.9H18a3 3 0 0 0 3-3C21 6.8 17 3 12 3z"/><circle cx="7.5" cy="11" r="1.1"/><circle cx="10" cy="7" r="1.1"/><circle cx="15" cy="7.5" r="1.1"/>',
  cfop: '<path d="M12 2.5l8.5 4.75v9.5L12 21.5l-8.5-4.75v-9.5z"/><path d="M3.5 7.25L12 12l8.5-4.75M12 12v9.5M7.75 4.9l8.5 4.7M16.25 4.9l-8.5 4.7"/>',
  cards: '<rect x="3" y="7" width="14" height="13" rx="2.5"/><path d="M7 7V5.5A2.5 2.5 0 0 1 9.5 3h9A2.5 2.5 0 0 1 21 5.5v9a2.5 2.5 0 0 1-2.5 2.5H17"/>',
  learn: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5M22 9v6"/>',
  dict: '<path d="M12 6.5c-2-1.5-5-2-8.5-2v13c3.5 0 6.5.5 8.5 2 2-1.5 5-2 8.5-2v-13c-3.5 0-6.5.5-8.5 2zM12 6.5v13"/>',
  chess: '<path d="M6.5 20.5h11M8 17.5h8M9 17.5l.8-8h4.4l.8 8M7.5 9.5h9M7.5 9.5V4h2v2h1.75V4h1.5v2h1.75V4h2v5.5"/>',
  games: '<path d="M7 8h10a5 5 0 0 1 4.6 7l-.6 1.4a2.6 2.6 0 0 1-4.3.7L15 15.5H9l-1.7 1.6a2.6 2.6 0 0 1-4.3-.7L2.4 15A5 5 0 0 1 7 8z"/><path d="M7.5 10.5v3M6 12h3M15.5 11h.01M17.5 13h.01"/>',
  files: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 10h18"/>',
  videos: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9.2v5.6l4.8-2.8z"/>',
  social: '<path d="M4 5h11a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-4 3v-3H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/><path d="M17 9h3a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1v2.5L16 18h-3.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.5 2"/>',
  calc: '<rect x="5" y="2.5" width="14" height="19" rx="3"/><path d="M8.5 6.5h7v3h-7zM8.5 13.5h.01M12 13.5h.01M15.5 13.5h.01M8.5 17h.01M12 17h.01M15.5 17h.01"/>',
  measure: '<path d="M3.5 16.5L16.5 3.5l4 4-13 13z"/><path d="M7 13l1.5 1.5M9.5 10.5l2 2M12 8l1.5 1.5M14.5 5.5l2 2"/>',
  translate: '<path d="M3 5h9M7.5 3v2M5 5c1 3.5 3.5 6 6 7.5M10 5c-.8 3.6-3.4 6.6-6.5 8"/><path d="M12.5 21l4-9.5 4 9.5M14 17.5h5"/>',
  news: '<path d="M4 4.5h13v14a2 2 0 0 0 2 2H6a2 2 0 0 1-2-2z"/><path d="M17 8.5h3v10a2 2 0 0 1-2 2M7.5 8h6M7.5 11.5h6M7.5 15h4"/>',
  bible: '<path d="M5 4.5a2 2 0 0 1 2-2h12v16H7a2 2 0 0 0-2 2z"/><path d="M5 20.5a2 2 0 0 0 2 1h12v-3M12 6v8M9.25 8.75h5.5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>',
};
const appIcon = a => { const p = ICON_PATHS[a.id]; return p ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>' : '<span style="font-size:30px">' + a.icon + '</span>'; };
const WALLS = {
  aurora: ['Aurora', 'radial-gradient(120% 70% at 0% 0%,#7C3AED 0%,transparent 60%),radial-gradient(90% 60% at 100% 15%,#EC4899 0%,transparent 55%),radial-gradient(120% 80% at 50% 100%,#0EA5E9 0%,transparent 60%),#1E1B4B'],
  sunset: ['Sunset', 'radial-gradient(90% 50% at 50% 0%,#FFD29D 0%,transparent 60%),linear-gradient(175deg,#FF7E5F 0%,#E8508A 45%,#5B2A86 80%,#24124A 100%)'],
  ocean: ['Ocean', 'radial-gradient(100% 60% at 80% 0%,#38BDF8 0%,transparent 55%),linear-gradient(170deg,#0E7490 0%,#1E3A8A 60%,#0B1437 100%)'],
  forest: ['Forest', 'radial-gradient(90% 60% at 10% 0%,#A3E635 0%,transparent 50%),linear-gradient(170deg,#15803D 0%,#065F46 55%,#052E2B 100%)'],
  galaxy: ['Galaxy', 'radial-gradient(2px 2px at 20% 30%,#fff,transparent),radial-gradient(2px 2px at 70% 20%,#fff,transparent),radial-gradient(1.5px 1.5px at 40% 70%,#fff,transparent),radial-gradient(1.5px 1.5px at 85% 60%,#fff,transparent),radial-gradient(80% 50% at 70% 30%,#7C3AED 0%,transparent 60%),radial-gradient(70% 50% at 20% 80%,#DB2777 0%,transparent 60%),#0B0820'],
  candy: ['Candy', 'linear-gradient(155deg,#F472B6 0%,#A78BFA 50%,#60A5FA 100%)'],
  lava: ['Lava', 'radial-gradient(90% 60% at 20% 0%,#FB923C 0%,transparent 60%),linear-gradient(170deg,#B91C1C 0%,#7F1D1D 55%,#1C0A0A 100%)'],
  midnight: ['Midnight', 'radial-gradient(100% 60% at 85% 0%,#3B82F6 0%,transparent 50%),linear-gradient(180deg,#111733 0%,#05060D 100%)'],
};
const Home = {
  wallUrl: null,
  async applyWall() {
    let el = $('#wall'); if (!el) { el = h('div', { id: 'wall', 'aria-hidden': 'true' }); document.body.prepend(el); }
    const w = Prefs.get('wall', 'aurora');
    if (w === 'photo') { const b = await DB.kget('wallPhoto', null); if (b) { if (this.wallUrl) URL.revokeObjectURL(this.wallUrl); this.wallUrl = URL.createObjectURL(b); el.style.background = 'linear-gradient(180deg,rgba(0,0,0,.35),rgba(0,0,0,.15) 40%,rgba(0,0,0,.45)),url("' + this.wallUrl + '") center/cover'; return; } }
    el.style.background = (WALLS[w] || WALLS.aurora)[1];
  },
  favs() { return Prefs.get('favs', ['calendar', 'notes', 'music', 'games']).filter(id => Apps.byId[id]).slice(0, 4); },
  widgetsOn() { const w = Prefs.get('widgets', { weather: true, next: true, todo: true, verse: true, news: true }); if (w.home === undefined) w.home = true; return w; },
};
Shell.tile = function (a, cls = 'app') {
  const ico = h('span', { class: 'ico', style: { background: a.color }, html: appIcon(a) });
  if (a.badge) Promise.resolve(a.badge()).then(n => { if (n > 0) ico.append(h('span', { class: 'badge' }, n > 99 ? '99+' : String(n))); }).catch(() => { });
  return h('button', { class: cls, onclick: () => this.go(a.id), 'aria-label': a.name }, ico, h('span', null, a.name));
};
Shell.paintHello = function () {
  const el = $('#hello'); if (!el) return; const d = new Date(), hr = d.getHours(), name = Prefs.get('name', '');
  el.querySelector('.clk').textContent = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M$/i, '');
  el.querySelector('.dt').textContent = fmtDay(d, { weekday: 'long', month: 'long', day: 'numeric' });
  el.querySelector('.gr').textContent = (hr < 5 ? 'Good night' : hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening') + (name ? ', ' + name : '') + ' ✨';
};
Shell.renderHome = function () {
  Home.applyWall();
  this.top.append(h('div', { class: 'brand' }, h('i', null, 'S1'), 'Super One'), Offline.pill(),
    h('button', { class: 'ib', 'aria-label': 'Edit home screen', html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + ICON_PATHS.edit + '</svg>', onclick: () => editHome() }),
    h('button', { class: 'ib', 'aria-label': 'Settings', html: SVG.gear, onclick: () => this.settings() }));
  const v = this.view;
  v.append(h('div', { class: 'hero', id: 'hello' }, h('div', { class: 'clk' }), h('div', { class: 'dt' }), h('div', { class: 'gr' })));
  this.paintHello();
  const q = h('input', { type: 'search', placeholder: 'Search apps, notes, words, Bible…', 'aria-label': 'Search', autocomplete: 'off' });
  const results = h('div', { class: 'mt' }), widgets = h('div', { class: 'widgets' }), rest = h('div');
  const fy = h('div');
  v.append(widgets, fy, h('div', { class: 'hsearch' }, h('span', { html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">' + ICON_PATHS.search + '</svg>' }), q), results, rest);
  this.fillWidgets(widgets); this.fillForYou(fy);
  if (!Offline.standalone() && /iPhone|iPad|iPod/.test(navigator.userAgent) && !Prefs.get('hideInstall'))
    rest.append(h('div', { class: 'home-banner glass' }, h('span', { style: { fontSize: '26px' } }, '📲'), h('span', { style: { flex: 1 } }, h('b', null, 'Put me on your Home Screen. '), 'Tap Share, then “Add to Home Screen”.'),
      h('button', { class: 'ib', style: { color: '#fff' }, 'aria-label': 'Hide', html: SVG.close, onclick: e => { Prefs.set('hideInstall', true); e.currentTarget.parentNode.remove(); } })));
  Backup.nudge(rest);
  const favs = Home.favs(); if (favs.length) rest.append(h('div', { class: 'dock glass', role: 'toolbar', 'aria-label': 'Favorites' }, favs.map(id => this.tile(Apps.byId[id]))));
  for (const [g, label] of Apps.GROUPS) {
    const apps = Apps.list.filter(a => a.group === g); if (!apps.length) continue;
    rest.append(h('div', { class: 'home-sec' }, label), h('div', { class: 'appgrid glass' }, apps.map(a => this.tile(a))));
  }
  rest.append(h('p', { class: 'home-note' }, Apps.list.length + ' apps · everything you make stays on this device'));
  const doSearch = debounce(async () => {
    const s = q.value.trim().toLowerCase(); results.innerHTML = ''; widgets.hidden = rest.hidden = fy.hidden = !!s; if (!s) return;
    const list = h('div', { class: 'list' }), row = (ic, bg, b, sm, go) => h('button', { class: 'li', onclick: go }, h('span', { class: 'ic', style: bg ? { background: bg } : null, html: ic }), h('span', { class: 't' }, h('b', null, b), h('small', null, sm)), h('span', { class: 'chev' }, '›'));
    for (const a of Apps.list) if ((a.name + ' ' + (a.keys || '')).toLowerCase().includes(s)) list.append(row(appIcon(a), a.color, a.name, a.blurb || '', () => this.go(a.id)));
    if (/^(take me |go |get )?(my )?(home|house)/.test(s) && typeof GoHome !== 'undefined') list.prepend(row('🏠', 'linear-gradient(135deg,#56CCF2,#2F80ED)', 'Take me home', GoHome.isSet() ? 'Directions to your house' : 'Set your home first', () => GoHome.go()));
    if (/^[a-z][a-z '\-]*$/i.test(s)) list.append(row('📖', null, 'Look up “' + s + '”', 'Dictionary', () => this.go('dict', s)));
    if (s.length > 2 && Apps.byId.bible) list.append(row('✝️', null, 'Search the Bible for “' + s + '”', 'Bible', () => this.go('bible', 'search:' + s)));
    if (s.length > 1 && Apps.byId.translate) list.append(row('🌐', null, 'Translate “' + s + '”', 'Translate', () => this.go('translate', s)));
    const notes = (await DB.all('notes')).filter(n => ((n.title || '') + ' ' + (n.body || '')).toLowerCase().includes(s)).slice(0, 6);
    for (const n of notes) list.append(row('📝', null, n.title || 'Untitled note', (n.body || '').slice(0, 80), () => this.go('notes', n.id)));
    const files = (await DB.all('files').catch(() => [])).filter(f => (f.name || '').toLowerCase().includes(s)).slice(0, 6);
    for (const f of files) list.append(row('📄', null, f.name, 'Files', () => this.go('files', f.id)));
    results.append(list.childNodes.length ? list : UI.empty('🔎', 'Nothing found', 'Try another word.'));
  }, 140);
  q.addEventListener('input', doSearch);
};
Shell.fillWidgets = async function (el) {
  const on = Home.widgetsOn();
  const card = (cls, k, go, ...kids) => h('button', { class: 'wd glass ' + cls, onclick: () => this.go(go) }, h('span', { class: 'k' }, k), ...kids);
  const [ev, due, wx, verse, news] = await Promise.all([
    on.next && typeof Cal !== 'undefined' ? Cal.next().catch(() => null) : null,
    on.todo && typeof Rem !== 'undefined' ? DB.all('reminders').catch(() => []) : [],
    on.weather && typeof Weather !== 'undefined' ? Weather.peek().catch(() => null) : null,
    on.verse && typeof Bible !== 'undefined' ? Bible.votd().catch(() => null) : null,
    on.news && typeof News !== 'undefined' ? News.peek().catch(() => null) : null,
  ]);
  if (on.home && typeof GoHome !== 'undefined') { const set = GoHome.isSet(), m = set ? (GoHome.MODES.find(x => x[0] === GoHome.get().mode) || GoHome.MODES[0]) : null;
    el.append(onLongPress(h('button', { class: 'wd glass wide hmw', onclick: () => GoHome.go() }, h('span', { class: 'k' }, '🏠 Home'), h('div', { class: 't1' }, set ? 'Take me home' : 'Set your home'), h('div', { class: 't2' }, set ? m[1] + ' · one tap for directions · hold to change' : 'Then one tap gives you directions home')), () => GoHome.setup())); }
  if (on.weather) el.append(wx ? card('', '⛅ Weather', 'weather', h('div', { class: 'big' }, wx.icon + ' ' + wx.temp), h('div', { class: 't2' }, '📍 ' + wx.place)) : card('', '⛅ Weather', 'weather', h('div', { class: 'big' }, '☀️'), h('div', { class: 't1' }, 'Pick your place'), h('div', { class: 't2' }, 'Saved for offline')));
  if (on.next) { const d = new Date(); el.append(card('', '📅 ' + fmtDay(d, { weekday: 'short' }), 'calendar', h('div', { class: 'big' }, d.getDate()), h('div', { class: 't1' }, ev ? ev.title : 'Free day'), h('div', { class: 't2' }, ev ? ev.when : 'Nothing planned'))); }
  if (on.todo) { const end = new Date(); end.setHours(23, 59, 59); const open = (due || []).filter(r => !r.done).sort((a, b) => (a.due || '9').localeCompare(b.due || '9')); const nDue = open.filter(r => r.due && Rem.dueDate(r) <= end).length;
    el.append(card('', '☑️ To do', 'reminders', h('div', { class: 't1' }, open.length ? (nDue ? nDue + ' due today' : open.length + ' to do') : 'All done 🎉'), open.length ? h('ul', null, open.slice(0, 3).map(r => h('li', null, r.text))) : h('div', { class: 't2' }, 'Add one in Reminders'))); }
  if (on.verse) el.append(card('', '✝️ Verse of the day', 'bible', verse ? h('div', { class: 'verse' }, '“' + verse.text + '”') : h('div', { class: 't1' }, 'Open the Bible'), h('div', { class: 't2' }, verse ? verse.ref : 'Saved for offline')));
  if (on.news) el.append(card('wide', '📰 Top story', 'news', h('div', { class: 't1' }, news ? news.title : 'Get today’s news'), h('div', { class: 't2' }, news ? news.src + ' · ' + fmtAgo(news.at) : 'Updates when you have Wi-Fi')));
  if (Player.cur) el.append(h('button', { class: 'wd glass wide', onclick: () => this.go('music') }, h('span', { class: 'k' }, '🎵 Now playing'), h('div', { class: 't1' }, Player.cur.title), h('div', { class: 't2' }, Player.audio.paused ? 'Paused' : 'Playing')));
};
Shell.fillForYou = async function (el) {
  const T = [], add = (score, e, b, sm, go) => T.push({ score: score + (hashStr(ymd(new Date()) + b) % 7), e, b, sm, go }), today = ymd(new Date());
  const opens = Prefs.get('appOpens', {});
  try {
    const cards = await DB.all('cards'); const due = cards.filter(c => Cards.due(c) && c.seen).length;
    if (due) add(90, '📚', 'Review ' + due + ' flashcard' + (due > 1 ? 's' : ''), 'They’re ready — keep your streak!', () => this.go('cards')); else if (!cards.length) add(32, '🗂️', 'Make your first flashcards', 'Learn anything, a few cards a day', () => this.go('cards'));
    if (typeof CUBE_CASES !== 'undefined') { const done = Prefs.get('cubeDone', {}); for (const k of ['pll', 'oll', 'f2l']) { const c = CUBE_CASES[k].find(x => !done[x.id]); if (c) { const left = CUBE_CASES[k].filter(x => !done[x.id]).length; add(k === 'pll' ? 72 : k === 'oll' ? 70 : 66, '🧊', 'Learn ' + (k === 'oll' ? 'OLL ' + c.n : k === 'pll' ? c.n + ' perm' : c.name) + ' today', left + ' ' + k.toUpperCase() + ' cases left to learn', () => { Prefs.set('cubeTab', 'all'); Prefs.set('cube119', k); this.go('cfop'); }); break; } } }
    const sud = Prefs.get('sudoku', null); if (!sud || sud.won) add(58, '🔢', 'Daily Sudoku', 'A fresh puzzle to warm up your brain', () => this.go('games', 'sudoku')); else add(62, '🔢', 'Finish your Sudoku', 'You’re ' + Math.round(100 * sud.cur.filter(Boolean).length / 81) + '% done', () => this.go('games', 'sudoku'));
    const wod = Prefs.get('wod', null); if (wod && wod.d === today) add(60, '✨', 'Word: ' + wod.word, wod.def.slice(0, 60), () => this.go('dict', wod.word)); else if (typeof Dict !== 'undefined') Dict.wordOfDay().then(w => w && Prefs.set('wod', { d: today, word: w.word, def: w.senses[0][1] })).catch(() => { });
    const best = Prefs.get('gameBest', {}); const bg = [['snake', '🐍 Snake'], ['meteor', '☄️ Meteor Dash'], ['hopper', '🦘 Sky Hopper'], ['bricks', '🧱 Brick Smash'], ['words', '🔤 Word Scramble']].filter(([k]) => best[k]); if (bg.length) { const [k, n] = bg[hashStr(today) % bg.length]; add(52, '🏆', 'Beat your best in ' + n.slice(2).trim(), 'Your record: ' + best[k], () => this.go('games', k)); }
    if (!Prefs.get('wxPlaces', []).length) add(55, '⛅', 'Set up Weather', 'Pick your town for forecasts', () => this.go('weather'));
    const last = await DB.kget('lastBackup', 0), n = (await DB.count('notes')) + (await DB.count('cards')) + (await DB.count('media')); if (n > 5 && Date.now() - last > 14 * 86400e3) add(64, '💾', 'Back up your stuff', last ? 'Last backup ' + fmtAgo(last) : 'Never backed up yet', () => this.settings());
    const bl = Prefs.get('bibleLast', null); if (bl && Apps.byId.bible) add(46, '✝️', 'Keep reading the Bible', 'Pick up where you stopped', () => this.go('bible'));
    const comics = (await DB.all('comics').catch(() => [])).filter(c => c.opened && c.kind === 'images' && c.last < c.pages.length - 1).sort((a, b) => b.opened - a.opened)[0]; if (comics) add(54, '💥', 'Keep reading ' + comics.title, 'Page ' + (comics.last + 1) + ' of ' + comics.pages.length, () => this.go('comics'));
    const fresh = Apps.list.filter(a => !opens[a.id]); if (fresh.length) { const a = fresh[hashStr(today) % fresh.length]; add(44, a.icon, 'Try ' + a.name, a.blurb || 'You haven’t opened it yet', () => this.go(a.id)); }
    if (!Prefs.get('links', []).length && Apps.byId.links) add(50, '🔗', 'Add your music & video links', 'Spotify, YouTube, Netflix, your games…', () => this.go('links'));
    if (typeof Fit !== 'undefined') { const fs = await Fit.st(); if (fs.setup) { const { w, today } = await Fit.next(fs); if (!today) add(68, '🤸', 'Today: ' + w.n, '~' + Fit.minutes(w, fs) + ' min of calisthenics — tap to start', () => this.go('fit', w.id)); } else add(40, '🤸', 'Try Calisthenics', 'Find your level in 30 seconds', () => this.go('fit')); }
    const lv = Prefs.get('learnBest', {}); if (!Object.keys(lv).some(k => k.startsWith('times'))) add(36, '✖️', 'Master a times table', 'Get 10 out of 10 for a star', () => this.go('learn'));
  } catch (e) { console.warn(e); }
  T.sort((a, b) => b.score - a.score);
  if (T.length) el.append(h('div', { class: 'home-sec', style: { marginTop: '18px' } }, '✨ For you'), h('div', { class: 'fyrow' }, T.slice(0, 6).map(t => h('button', { class: 'fyc glass', onclick: t.go }, h('span', { class: 'e' }, t.e), h('b', null, t.b), h('small', null, t.sm)))));
  const recent = Object.entries(opens).filter(([id]) => Apps.byId[id]).sort((a, b) => b[1].last - a[1].last).slice(0, 4);
  if (recent.length >= 2) el.append(h('div', { class: 'home-sec' }, '🕘 Jump back in'), h('div', { class: 'dock glass', style: { marginTop: 0 } }, recent.map(([id]) => this.tile(Apps.byId[id]))));
};
function editHome() {
  let wall = Prefs.get('wall', 'aurora'), favs = Home.favs(), on = Home.widgetsOn();
  const wp = h('div', { class: 'wallpick' });
  const drawWalls = () => { wp.innerHTML = ''; for (const k in WALLS) wp.append(h('button', { style: { background: WALLS[k][1] }, 'aria-pressed': String(wall === k), onclick: () => { wall = k; Prefs.set('wall', k); Home.applyWall(); drawWalls(); } }, WALLS[k][0]));
    wp.append(h('button', { style: { background: 'var(--surface2)', color: 'var(--ink)', textShadow: 'none' }, 'aria-pressed': String(wall === 'photo'), onclick: async () => { const [f] = await pickFiles('image/*', { multiple: false }); if (!f) return; await DB.kset('wallPhoto', f); wall = 'photo'; Prefs.set('wall', 'photo'); Home.applyWall(); drawWalls(); } }, '🖼️ My photo')); };
  drawWalls();
  const favBox = h('div', { class: 'chips' });
  const drawFavs = () => { favBox.innerHTML = ''; for (const a of Apps.list) favBox.append(h('button', { class: 'chip', 'aria-pressed': String(favs.includes(a.id)), onclick: () => { if (favs.includes(a.id)) favs = favs.filter(x => x !== a.id); else if (favs.length < 4) favs.push(a.id); else UI.toast('Pick up to 4 — tap one to remove it first'); Prefs.set('favs', favs); drawFavs(); } }, a.icon + ' ' + a.name)); };
  drawFavs();
  const W = [['home', '🏠 Take me home'], ['weather', '⛅ Weather'], ['next', '📅 Next up'], ['todo', '☑️ To do'], ['verse', '✝️ Verse of the day'], ['news', '📰 Top story']];
  const wBox = h('div', { class: 'chips' }, W.map(([k, l]) => { const b = h('button', { class: 'chip', 'aria-pressed': String(!!on[k]) }, l); b.onclick = () => { on[k] = !on[k]; Prefs.set('widgets', on); b.setAttribute('aria-pressed', String(!!on[k])); }; return b; }));
  UI.sheet({ title: 'Edit home screen', onClose: () => { if (!Shell.cur) Shell.route(); }, body: h('div', null, h('div', { class: 'sec', style: { marginTop: 0 } }, 'Wallpaper'), wp, h('div', { class: 'sec' }, 'Favorites dock (up to 4)'), favBox, h('div', { class: 'sec' }, 'Widgets'), wBox) });
}
document.addEventListener('home-changed', () => { if (!Shell.cur) Shell.route(); });

/* ---- 10-calendar.js ---- */
/* ===== Calendar ===== */
addCSS(`
.cal-head{display:flex;align-items:center;gap:6px;margin:4px 0 10px}
.cal-head h2{flex:1;font-size:24px;font-weight:800}
.cal-wd{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));text-align:center;font-size:12px;font-weight:700;color:var(--muted);margin-bottom:4px}
.cal-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;touch-action:pan-y}
.cal-d{position:relative;aspect-ratio:1/1.05;border:0;background:var(--surface);border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:6px 0 0;font-weight:650;font-size:16px;min-width:0}
.cal-d.out{background:transparent;color:var(--muted);opacity:.55}
.cal-d.today .n{background:#FF3B30;color:#fff}
.cal-d .n{width:30px;height:30px;border-radius:15px;display:grid;place-items:center}
.cal-d.sel{box-shadow:inset 0 0 0 2px var(--accent)}
.cal-d .dots{display:flex;gap:3px;margin-top:3px;height:6px}
.cal-d .dots i{width:6px;height:6px;border-radius:3px;display:block}
.ev{display:flex;gap:12px;align-items:stretch;padding:12px 14px;border-top:1px solid var(--line);background:none;border-left:0;border-right:0;border-bottom:0;width:100%;text-align:left}
.ev:first-child{border-top:0}
.ev .bar{width:5px;border-radius:3px;flex:0 0 auto}
.ev .tm{width:64px;flex:0 0 auto;font-size:14px;color:var(--muted);font-weight:600}
.ev b{display:block}
.ev small{color:var(--muted)}
`);
const CAL_COLORS = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#0A84FF', '#AF52DE', '#FF2D92', '#8E8E93'];
const Cal = {
  occurs(ev, ds) {
    if (ds < ev.date) return false; if (ds === ev.date) return true;
    const a = fromYmd(ev.date), b = fromYmd(ds);
    switch (ev.repeat) {
      case 'daily': return true;
      case 'weekly': return a.getDay() === b.getDay();
      case 'monthly': return a.getDate() === b.getDate();
      case 'yearly': return a.getDate() === b.getDate() && a.getMonth() === b.getMonth();
      default: return false;
    }
  },
  sortDay: (a, b) => (a.allDay ? '' : a.time || '').localeCompare(b.allDay ? '' : b.time || ''),
  timeLabel(ev) { if (ev.allDay || !ev.time) return 'All day'; const [h1, m1] = ev.time.split(':').map(Number); const d = new Date(); d.setHours(h1, m1, 0, 0); return fmtTime(d); },
  async next() {
    const evs = await DB.all('events'); const now = new Date();
    for (let i = 0; i < 8; i++) {
      const d = new Date(now); d.setDate(now.getDate() + i); const ds = ymd(d);
      const list = evs.filter(e => this.occurs(e, ds)).sort(this.sortDay).filter(e => i > 0 || e.allDay || !e.time || e.time >= pad2(now.getHours()) + ':' + pad2(now.getMinutes()));
      if (list.length) return { title: list[0].title, when: (i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : fmtDay(d, { weekday: 'long' })) + ' · ' + this.timeLabel(list[0]) };
    }
    return null;
  },
  toIcs(ev) {
    const start = fromYmd(ev.date); if (!ev.allDay && ev.time) { const [a, b] = ev.time.split(':').map(Number); start.setHours(a, b); }
    let end = null; if (!ev.allDay && ev.end) { end = fromYmd(ev.date); const [a, b] = ev.end.split(':').map(Number); end.setHours(a, b); if (end <= start) end = null; }
    const rr = { daily: 'FREQ=DAILY', weekly: 'FREQ=WEEKLY', monthly: 'FREQ=MONTHLY', yearly: 'FREQ=YEARLY' }[ev.repeat];
    return ICS.make([{ id: ev.id, title: ev.title, start, end, allDay: ev.allDay || !ev.time, notes: ev.notes, rrule: rr, alarmMin: ev.allDay || !ev.time ? null : 10 }]);
  },
};
Apps.reg({
  id: 'calendar', name: 'Calendar', icon: '📅', color: 'linear-gradient(135deg,#FF6B6B,#E0303A)', group: 'day', keys: 'events dates schedule birthday', blurb: 'Your days and events',
  async badge() { const evs = await DB.all('events'); const t = ymd(new Date()); return evs.filter(e => Cal.occurs(e, t)).length; },
  mount(v, ctx) {
    let events = [], reminders = [], sel = ymd(new Date()), month = new Date(); month.setDate(1);
    const head = h('div', { class: 'cal-head' }), wd = h('div', { class: 'cal-wd' }), grid = h('div', { class: 'cal-grid' }), dayBox = h('div');
    for (const d of ['S', 'M', 'T', 'W', 'T', 'F', 'S']) wd.append(h('div', null, d));
    v.append(head, wd, grid, dayBox, h('button', { class: 'fab', 'aria-label': 'Add event', html: SVG.plus, onclick: () => edit({ date: sel }) }));
    ctx.setActions(h('button', { class: 'btn ghost sm', onclick: () => { const t = new Date(); sel = ymd(t); month = new Date(t.getFullYear(), t.getMonth(), 1); draw(); } }, 'Today'));
    const shift = n => { month = new Date(month.getFullYear(), month.getMonth() + n, 1); draw(); };
    let sx = null; grid.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    grid.addEventListener('touchend', e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 60) shift(dx < 0 ? 1 : -1); sx = null; });
    async function load() { events = await DB.all('events'); reminders = await DB.all('reminders'); draw(); }
    function draw() {
      head.innerHTML = '';
      head.append(h('h2', null, month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })),
        h('button', { class: 'ib solid', 'aria-label': 'Previous month', onclick: () => shift(-1) }, '‹'), h('button', { class: 'ib solid', 'aria-label': 'Next month', onclick: () => shift(1) }, '›'));
      grid.innerHTML = ''; const start = new Date(month); start.setDate(1 - month.getDay()); const today = ymd(new Date());
      for (let i = 0; i < 42; i++) {
        const d = new Date(start); d.setDate(start.getDate() + i); const ds = ymd(d);
        const evs = events.filter(e => Cal.occurs(e, ds)), rem = reminders.filter(r => !r.done && r.due && r.due.slice(0, 10) === ds);
        const dots = h('span', { class: 'dots' }, evs.slice(0, 3).map(e => h('i', { style: { background: e.color || CAL_COLORS[4] } })), rem.length && evs.length < 3 ? h('i', { style: { background: 'var(--muted)' } }) : null);
        grid.append(h('button', { class: 'cal-d' + (d.getMonth() !== month.getMonth() ? ' out' : '') + (ds === today ? ' today' : '') + (ds === sel ? ' sel' : ''), 'aria-label': fmtDay(d, { weekday: 'long', month: 'long', day: 'numeric' }) + (evs.length ? ', ' + evs.length + ' events' : ''), onclick: () => { sel = ds; if (d.getMonth() !== month.getMonth()) month = new Date(d.getFullYear(), d.getMonth(), 1); draw(); } }, h('span', { class: 'n' }, d.getDate()), dots));
      }
      drawDay();
    }
    function drawDay() {
      dayBox.innerHTML = ''; const d = fromYmd(sel);
      dayBox.append(h('div', { class: 'sec' }, fmtDay(d, { weekday: 'long', month: 'long', day: 'numeric' })));
      const evs = events.filter(e => Cal.occurs(e, sel)).sort(Cal.sortDay), rem = reminders.filter(r => !r.done && r.due && r.due.slice(0, 10) === sel);
      if (!evs.length && !rem.length) { dayBox.append(h('div', { class: 'card muted center' }, 'Nothing planned. Tap + to add an event.')); return; }
      const list = h('div', { class: 'list' });
      for (const e of evs) list.append(h('button', { class: 'ev', onclick: () => edit(e) }, h('span', { class: 'bar', style: { background: e.color || CAL_COLORS[4] } }), h('span', { class: 'tm' }, Cal.timeLabel(e)), h('span', { style: { flex: 1, minWidth: 0 } }, h('b', null, e.title), e.notes || e.repeat !== 'none' ? h('small', null, [e.repeat && e.repeat !== 'none' ? '🔁 ' + e.repeat + ' ' : '', e.notes || '']) : null)));
      for (const r of rem) list.append(h('button', { class: 'ev', onclick: () => Shell.go('reminders') }, h('span', { class: 'bar', style: { background: 'var(--muted)' } }), h('span', { class: 'tm' }, r.due.length > 10 ? fmtTime(new Date(r.due)) : 'Today'), h('span', { style: { flex: 1 } }, h('b', null, '☑️ ' + r.text), h('small', null, 'Reminder'))));
      dayBox.append(list);
    }
    function edit(ev) {
      const isNew = !ev.id; const e = Object.assign({ title: '', date: sel, allDay: false, time: '09:00', end: '10:00', color: CAL_COLORS[4], repeat: 'none', notes: '' }, ev);
      const title = h('input', { type: 'text', value: e.title, placeholder: 'What’s happening?', maxlength: 120 });
      const date = h('input', { type: 'date', value: e.date });
      const all = h('input', { type: 'checkbox' }); all.checked = !!e.allDay;
      const time = h('input', { type: 'time', value: e.time || '09:00' }), end = h('input', { type: 'time', value: e.end || '' });
      const times = h('div', { class: 'grid2' }, h('label', { class: 'f' }, h('span', null, 'Starts'), time), h('label', { class: 'f' }, h('span', null, 'Ends'), end));
      const rep = h('select', null, [['none', 'Does not repeat'], ['daily', 'Every day'], ['weekly', 'Every week'], ['monthly', 'Every month'], ['yearly', 'Every year (birthdays!)']].map(([v, l]) => h('option', { value: v, selected: e.repeat === v }, l)));
      const notes = h('textarea', { placeholder: 'Notes (optional)', style: { minHeight: '80px' } }); notes.value = e.notes || '';
      let color = e.color;
      const syncAll = () => { times.hidden = all.checked; }; all.onchange = syncAll; syncAll();
      const body = h('div', null, h('label', { class: 'f' }, h('span', null, 'Title'), title), h('label', { class: 'f' }, h('span', null, 'Date'), date),
        h('label', { class: 'f row nw' }, all, h('span', { style: { margin: 0, color: 'var(--ink)', fontSize: '16px' } }, 'All day')), times,
        h('label', { class: 'f' }, h('span', null, 'Repeat'), rep), h('div', { class: 'f' }, h('span', { class: 'small muted', style: { display: 'block', fontWeight: 600, marginBottom: '6px' } }, 'Color'), UI.swatches(CAL_COLORS, color, c => color = c)),
        h('label', { class: 'f' }, h('span', null, 'Notes'), notes),
        isNew ? null : h('div', { class: 'row' }, h('button', { class: 'btn sm', onclick: async () => { await saveFile(Cal.toIcs(e), (e.title || 'event').replace(/[^\w\- ]+/g, '').slice(0, 40) + '.ics'); } }, '📲 Add to phone calendar'),
          h('button', { class: 'btn sm bad', onclick: async () => { if (await UI.ask('Delete “' + e.title + '”?', { ok: 'Delete', danger: true })) { await DB.del('events', e.id); s.close(); load(); } } }, 'Delete')));
      const s = UI.sheet({ title: isNew ? 'New event' : 'Edit event', body, actions: [{ label: 'Cancel' }, { label: 'Save', cls: 'pri', onClick: async c => {
        if (!title.value.trim()) { title.focus(); UI.toast('Give it a title'); return; }
        if (!date.value) { UI.toast('Pick a date'); return; }
        Object.assign(e, { id: e.id || uid(), title: title.value.trim(), date: date.value, allDay: all.checked, time: time.value, end: end.value, color, repeat: rep.value, notes: notes.value.trim(), updated: Date.now() });
        await DB.put('events', e); sel = e.date; const d = fromYmd(e.date); month = new Date(d.getFullYear(), d.getMonth(), 1); c(); load(); UI.toast(isNew ? 'Event added' : 'Saved');
      } }] });
    }
    load();
  },
});

/* ---- 11-notes.js ---- */
/* ===== Notes ===== */
addCSS(`
.notes-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
@media (min-width:700px){.notes-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
.nt{border:1px solid var(--line);background:var(--surface);border-radius:16px;padding:12px;text-align:left;min-height:110px;display:flex;flex-direction:column;gap:4px;min-width:0;box-shadow:var(--shadow)}
.nt b{font-size:16px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.nt p{margin:0;font-size:14px;color:var(--muted);display:-webkit-box;-webkit-line-clamp:5;-webkit-box-orient:vertical;overflow:hidden;white-space:pre-wrap;word-break:break-word}
.nt small{margin-top:auto;font-size:12px;color:var(--muted)}
.note-ed input.ttl{font-size:24px;font-weight:800;border:0;background:transparent;padding:6px 0;min-height:0;font-family:var(--round)}
.note-ed textarea{border:0;background:transparent;padding:4px 0;font-size:17px;min-height:60vh;resize:none;line-height:1.55}
.note-ed input.ttl:focus,.note-ed textarea:focus{border:0}
`);
const NOTE_TINTS = { none: '', yellow: '#FFF6C7', green: '#DDF6E3', blue: '#DCEBFF', pink: '#FFE0EC', purple: '#ECE3FF' };
const NOTE_TINTS_DARK = { none: '', yellow: '#3A3416', green: '#16301F', blue: '#16263F', pink: '#3B1726', purple: '#2A1F45' };
const noteTint = c => { if (!c || c === 'none') return ''; const dark = document.documentElement.getAttribute('data-theme') === 'dark' || (!document.documentElement.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches); return (dark ? NOTE_TINTS_DARK : NOTE_TINTS)[c]; };
Apps.reg({
  id: 'notes', name: 'Notes', icon: '📝', color: 'linear-gradient(135deg,#FFD84D,#F5A623)', group: 'day', keys: 'write text list journal', blurb: 'Write anything down',
  mount(v, ctx) {
    let notes = [], q = '';
    const listView = async () => {
      ctx.setTitle('Notes'); ctx.setBack(null); ctx.setActions(); v.innerHTML = '';
      notes = (await DB.all('notes')).sort((a, b) => (b.updated || 0) - (a.updated || 0));
      const search = h('input', { type: 'search', placeholder: 'Search notes', value: q, 'aria-label': 'Search notes' });
      const box = h('div');
      v.append(h('div', { class: 'search mb' }, search), box, h('button', { class: 'fab', 'aria-label': 'New note', html: SVG.plus, onclick: () => editView(null) }));
      const draw = () => {
        box.innerHTML = ''; const s = q.toLowerCase();
        const shown = notes.filter(n => !s || ((n.title || '') + '\n' + (n.body || '')).toLowerCase().includes(s));
        if (!notes.length) { box.append(UI.empty('📝', 'No notes yet', 'Tap + to write your first note.')); return; }
        if (!shown.length) { box.append(UI.empty('🔎', 'No matching notes')); return; }
        const pinned = shown.filter(n => n.pinned), rest = shown.filter(n => !n.pinned);
        for (const [label, arr] of [['📌 Pinned', pinned], [pinned.length ? 'Notes' : '', rest]]) {
          if (!arr.length) continue; if (label) box.append(h('div', { class: 'sec' }, label));
          box.append(h('div', { class: 'notes-grid' }, arr.map(n => h('button', { class: 'nt', style: { background: noteTint(n.color) || null }, onclick: () => editView(n) },
            h('b', null, n.title || firstLine(n.body) || 'Untitled'), h('p', null, (n.title ? n.body : restLines(n.body)) || ''), h('small', null, fmtAgo(n.updated || n.created))))));
        }
      };
      search.addEventListener('input', () => { q = search.value; draw(); });
      draw();
    };
    const firstLine = b => (b || '').split('\n')[0].slice(0, 60), restLines = b => (b || '').split('\n').slice(1).join('\n');
    const editView = n => {
      const note = n ? { ...n } : { id: uid(), title: '', body: '', color: 'none', pinned: false, created: Date.now(), updated: Date.now() };
      v.innerHTML = ''; ctx.setTitle(n ? '' : 'New note');
      const title = h('input', { class: 'ttl', type: 'text', placeholder: 'Title', value: note.title, 'aria-label': 'Title' });
      const body = h('textarea', { placeholder: 'Start writing…', 'aria-label': 'Note' }); body.value = note.body;
      const info = h('div', { class: 'tiny muted' });
      const wrap = h('div', { class: 'note-ed', style: { background: noteTint(note.color) || null, borderRadius: '16px', padding: noteTint(note.color) ? '4px 14px' : '0' } }, title, body);
      v.append(wrap, info);
      let dirty = false;
      const paintInfo = () => { const w = (note.body.trim().match(/\S+/g) || []).length; info.textContent = w + ' words · ' + (dirty ? 'saving…' : 'saved ' + fmtAgo(note.updated)); };
      const save = debounce(async () => { note.title = title.value; note.body = body.value; note.updated = Date.now(); if (note.title.trim() || note.body.trim()) await DB.put('notes', note); dirty = false; paintInfo(); }, 400);
      const onInput = () => { dirty = true; paintInfo(); save(); };
      title.addEventListener('input', onInput); body.addEventListener('input', onInput);
      const pinBtn = h('button', { class: 'ib', 'aria-label': 'Pin', title: 'Pin to top' }, note.pinned ? '📌' : '📍');
      pinBtn.onclick = async () => { note.pinned = !note.pinned; pinBtn.textContent = note.pinned ? '📌' : '📍'; UI.toast(note.pinned ? 'Pinned to top' : 'Unpinned'); save.flush(); };
      ctx.setActions(pinBtn, h('button', { class: 'ib', 'aria-label': 'More', html: SVG.more, onclick: () => UI.menu('Note', [
        { icon: '🎨', label: 'Color', run: () => { const s = UI.sheet({ title: 'Note color', body: h('div', { class: 'chips' }, Object.keys(NOTE_TINTS).map(c => h('button', { class: 'chip', style: { background: noteTint(c) || null }, 'aria-pressed': String(note.color === c), onclick: () => { note.color = c; wrap.style.background = noteTint(c) || ''; wrap.style.padding = noteTint(c) ? '4px 14px' : '0'; save.flush(); s.close(); } }, c === 'none' ? 'Plain' : c[0].toUpperCase() + c.slice(1)))) }); } },
        { icon: '📤', label: 'Share or copy', run: () => shareText((title.value ? title.value + '\n\n' : '') + body.value, title.value || 'Note') },
        { icon: '☑️', label: 'Add a checklist line', sub: 'Adds “☐ ” — tap ☐ later to tick it', run: () => { body.value += (body.value && !body.value.endsWith('\n') ? '\n' : '') + '☐ '; onInput(); body.focus(); } },
        { icon: '🗑️', label: 'Delete note', danger: true, run: async () => { if (await UI.ask('Delete this note?', { ok: 'Delete', danger: true })) { save.flush(); await DB.del('notes', note.id); dirty = false; note.title = note.body = ''; listView(); } } },
      ]) }));
      // tap a ☐ / ☑ at the start of a line to tick it
      body.addEventListener('click', () => {
        const pos = body.selectionStart, val = body.value, ls = val.lastIndexOf('\n', pos - 1) + 1;
        if (pos - ls <= 1 && (val[ls] === '☐' || val[ls] === '☑')) { body.value = val.slice(0, ls) + (val[ls] === '☐' ? '☑' : '☐') + val.slice(ls + 1); body.setSelectionRange(pos, pos); onInput(); }
      });
      ctx.setBack(() => { if (dirty) save.flush(); listView(); return true; });
      paintInfo(); if (!n) setTimeout(() => body.focus(), 50);
    };
    if (ctx.param) DB.get('notes', ctx.param).then(n => n ? editView(n) : listView()); else listView();
  },
});

/* ---- 12-reminders.js ---- */
/* ===== Reminders ===== */
addCSS(`
.rm{display:flex;align-items:flex-start;gap:12px;padding:12px 14px;border-top:1px solid var(--line)}
.rm:first-child{border-top:0}
.rm .ck{width:28px;height:28px;border-radius:14px;border:2px solid var(--muted);background:none;flex:0 0 auto;margin-top:1px;display:grid;place-items:center;color:#fff;font-size:16px;padding:0}
.rm.done .ck{background:var(--good);border-color:var(--good)}
.rm.done .tx b{text-decoration:line-through;color:var(--muted)}
.rm .tx{flex:1;min-width:0;border:0;background:none;text-align:left;padding:0}
.rm .tx b{display:block;font-weight:600;word-break:break-word}
.rm .tx small{display:block;font-size:13px;color:var(--muted)}
.rm .tx small.late{color:var(--bad);font-weight:650}
.quick{display:flex;gap:8px;margin-bottom:6px}
`);
const Rem = {
  dueDate(r) { if (!r.due) return null; return r.due.length > 10 ? new Date(r.due) : fromYmd(r.due); },
  async dueCount() { const end = new Date(); end.setHours(23, 59, 59); return (await DB.all('reminders')).filter(r => !r.done && r.due && this.dueDate(r) <= end).length; },
  label(r) {
    const d = this.dueDate(r); if (!d) return ''; const today = ymd(new Date()), ds = r.due.slice(0, 10);
    const t = new Date(); t.setDate(t.getDate() + 1); const tm = ymd(t);
    const day = ds === today ? 'Today' : ds === tm ? 'Tomorrow' : fmtDay(d);
    return day + (r.due.length > 10 ? ' · ' + fmtTime(d) : '') + (r.repeat && r.repeat !== 'none' ? ' · 🔁 ' + r.repeat : '');
  },
  late(r) { const d = this.dueDate(r); if (!d || r.done) return false; if (r.due.length > 10) return d < new Date(); return r.due < ymd(new Date()); },
  advance(r) {
    const d = this.dueDate(r) || new Date();
    if (r.repeat === 'daily') d.setDate(d.getDate() + 1); else if (r.repeat === 'weekly') d.setDate(d.getDate() + 7); else if (r.repeat === 'monthly') d.setMonth(d.getMonth() + 1);
    r.due = r.due && r.due.length > 10 ? ymd(d) + 'T' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()) : ymd(d); r.alerted = '';
  },
  async toggle(r) {
    if (!r.done && r.repeat && r.repeat !== 'none' && r.due) { this.advance(r); UI.toast('Done! Next one: ' + this.label(r)); }
    else { r.done = !r.done; r.doneAt = r.done ? Date.now() : 0; }
    await DB.put('reminders', r); if (r.done) Sfx.good();
  },
  /* alerts while the app is open */
  async tick() {
    const now = new Date(), list = await DB.all('reminders');
    for (const r of list) {
      if (r.done || !r.due || r.due.length <= 10 || r.alerted === r.due) continue;
      if (new Date(r.due) <= now && now - new Date(r.due) < 6 * 3600e3) { r.alerted = r.due; await DB.put('reminders', r); this.alert(r); }
    }
  },
  alert(r) {
    if (Prefs.get('sound', true)) Sfx.chime(); try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) { }
    if (document.hidden && 'Notification' in window && Notification.permission === 'granted') navigator.serviceWorker && navigator.serviceWorker.ready.then(g => g.showNotification('⏰ ' + r.text, { body: 'Reminder from Super One', tag: r.id })).catch(() => { });
    const bar = h('div', { class: 'alertbar', role: 'alert' }, h('span', { style: { fontSize: '28px' } }, '⏰'),
      h('span', { style: { flex: 1, minWidth: 0 } }, h('b', { style: { display: 'block' } }, r.text), h('small', { class: 'muted' }, 'Reminder · ' + fmtTime(new Date(r.due)))),
      h('button', { class: 'btn sm', onclick: async () => { const d = new Date(Date.now() + 10 * 60e3); r.due = ymd(d) + 'T' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()); r.alerted = ''; await DB.put('reminders', r); bar.remove(); UI.toast('I’ll remind you in 10 minutes'); } }, '10 min'),
      h('button', { class: 'btn good sm', onclick: async () => { await Rem.toggle(r); bar.remove(); } }, 'Done'));
    document.body.append(bar);
  },
};
setTimeout(() => { Rem.tick(); setInterval(() => Rem.tick(), 15000); }, 2500);
document.addEventListener('visibilitychange', () => { if (!document.hidden) Rem.tick(); });

Apps.reg({
  id: 'reminders', name: 'Reminders', icon: '⏰', color: 'linear-gradient(135deg,#FFA94D,#F76707)', group: 'day', keys: 'todo to-do tasks alarm', blurb: 'To-dos with alerts',
  badge: () => Rem.dueCount(),
  mount(v, ctx) {
    let list = [], showDone = false;
    const quick = h('input', { type: 'text', placeholder: 'Add a reminder…', 'aria-label': 'New reminder', enterkeyhint: 'done' });
    const addQuick = async () => { const t = quick.value.trim(); if (!t) return; await DB.put('reminders', { id: uid(), text: t, due: '', repeat: 'none', done: false, created: Date.now() }); quick.value = ''; load(); };
    quick.addEventListener('keydown', e => { if (e.key === 'Enter') addQuick(); });
    const box = h('div');
    v.append(h('div', { class: 'quick' }, quick, h('button', { class: 'btn pri', onclick: addQuick, 'aria-label': 'Add' }, 'Add')),
      h('p', { class: 'tiny muted', style: { margin: '0 4px 4px' } }, 'Tip: tap a reminder to give it a time. I ring while Super One is open. For alerts when it’s closed, use “Add to phone calendar”.'),
      box, h('button', { class: 'fab', 'aria-label': 'New reminder with time', html: SVG.plus, onclick: () => edit({}) }));
    if ('Notification' in window && Notification.permission === 'default') ctx.setActions(h('button', { class: 'btn ghost sm', onclick: async e => { try { await Notification.requestPermission(); } catch (x) { } e.target.remove(); } }, '🔔 Allow alerts'));
    async function load() { list = await DB.all('reminders'); draw(); }
    function row(r) {
      const late = Rem.late(r);
      return h('div', { class: 'rm' + (r.done ? ' done' : '') },
        h('button', { class: 'ck', 'aria-label': r.done ? 'Mark not done' : 'Mark done', onclick: async () => { await Rem.toggle(r); load(); } }, r.done ? '✓' : ''),
        h('button', { class: 'tx', onclick: () => edit(r) }, h('b', null, r.text), r.due ? h('small', { class: late ? 'late' : '' }, (late ? 'Late · ' : '') + Rem.label(r)) : null, r.notes ? h('small', null, r.notes) : null));
    }
    function draw() {
      box.innerHTML = ''; const end = new Date(); end.setHours(23, 59, 59); const todayS = ymd(new Date());
      const open = list.filter(r => !r.done).sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999') || a.created - b.created);
      const groups = [['Late', open.filter(r => Rem.late(r))], ['Today', open.filter(r => !Rem.late(r) && r.due && r.due.slice(0, 10) === todayS)],
        ['Coming up', open.filter(r => r.due && r.due.slice(0, 10) > todayS)], ['Anytime', open.filter(r => !r.due)]];
      if (!list.length) { box.append(UI.empty('⏰', 'No reminders', 'Type one above, or tap + to set a time.')); return; }
      if (!open.length) box.append(h('div', { class: 'card center' }, '🎉 All done!'));
      for (const [label, arr] of groups) if (arr.length) box.append(h('div', { class: 'sec' }, label + ' · ' + arr.length), h('div', { class: 'list' }, arr.map(row)));
      const done = list.filter(r => r.done).sort((a, b) => b.doneAt - a.doneAt);
      if (done.length) {
        box.append(h('div', { class: 'row', style: { margin: '18px 4px 8px' } }, h('button', { class: 'btn ghost sm', onclick: () => { showDone = !showDone; draw(); } }, (showDone ? 'Hide' : 'Show') + ' done (' + done.length + ')'), h('span', { class: 'sp' }),
          showDone ? h('button', { class: 'btn ghost sm', onclick: async () => { if (await UI.ask('Clear all ' + done.length + ' done reminders?', { ok: 'Clear', danger: true })) { for (const r of done) await DB.del('reminders', r.id); load(); } } }, 'Clear done') : null));
        if (showDone) box.append(h('div', { class: 'list' }, done.map(row)));
      }
    }
    function edit(r0) {
      const isNew = !r0.id; const r = Object.assign({ text: '', due: '', repeat: 'none', notes: '', done: false }, r0);
      const text = h('input', { type: 'text', value: r.text, placeholder: 'What should I remind you about?' });
      const hasDate = h('input', { type: 'checkbox' }); hasDate.checked = !!r.due;
      const hasTime = h('input', { type: 'checkbox' }); hasTime.checked = !r.due || r.due.length > 10;
      const now = new Date(Date.now() + 3600e3);
      const date = h('input', { type: 'date', value: r.due ? r.due.slice(0, 10) : ymd(now) });
      const time = h('input', { type: 'time', value: r.due && r.due.length > 10 ? r.due.slice(11, 16) : pad2(now.getHours()) + ':00' });
      const rep = h('select', null, [['none', 'Once'], ['daily', 'Every day'], ['weekly', 'Every week'], ['monthly', 'Every month']].map(([a, b]) => h('option', { value: a, selected: r.repeat === a }, b)));
      const notes = h('input', { type: 'text', value: r.notes || '', placeholder: 'Extra details (optional)' });
      const when = h('div', null, h('label', { class: 'f' }, h('span', null, 'Day'), date), h('label', { class: 'f row nw' }, hasTime, h('span', { style: { margin: 0, color: 'var(--ink)', fontSize: '16px' } }, 'At a time')), h('label', { class: 'f', id: 'rtime' }, h('span', null, 'Time'), time), h('label', { class: 'f' }, h('span', null, 'Repeat'), rep));
      const sync = () => { when.hidden = !hasDate.checked; time.parentNode.hidden = !hasTime.checked; }; hasDate.onchange = sync; hasTime.onchange = sync;
      const build = () => { r.text = text.value.trim(); r.notes = notes.value.trim(); r.repeat = hasDate.checked ? rep.value : 'none'; r.due = hasDate.checked ? date.value + (hasTime.checked ? 'T' + time.value : '') : ''; };
      const body = h('div', null, h('label', { class: 'f' }, h('span', null, 'Reminder'), text), h('label', { class: 'f row nw' }, hasDate, h('span', { style: { margin: 0, color: 'var(--ink)', fontSize: '16px' } }, 'On a day')), when, h('label', { class: 'f' }, h('span', null, 'Notes'), notes),
        h('div', { class: 'row' }, h('button', { class: 'btn sm', onclick: async () => { build(); if (!r.due) { UI.toast('Pick a day first'); return; } const d = Rem.dueDate(r); const rr = { daily: 'FREQ=DAILY', weekly: 'FREQ=WEEKLY', monthly: 'FREQ=MONTHLY' }[r.repeat]; await saveFile(ICS.make([{ id: r.id, title: r.text, start: d, allDay: r.due.length <= 10, alarmMin: 0, rrule: rr, notes: r.notes }]), 'reminder.ics'); } }, '📲 Add to phone calendar'),
          isNew ? null : h('button', { class: 'btn sm bad', onclick: async () => { await DB.del('reminders', r.id); s.close(); load(); } }, 'Delete')));
      sync();
      const s = UI.sheet({ title: isNew ? 'New reminder' : 'Reminder', body, actions: [{ label: 'Cancel' }, { label: 'Save', cls: 'pri', onClick: async c => {
        build(); if (!r.text) { UI.toast('Type what to remember'); return; }
        r.id = r.id || uid(); r.created = r.created || Date.now(); if (r.due !== r0.due) r.alerted = ''; await DB.put('reminders', r); c(); load();
      } }] });
    }
    load();
    const off = DB.onChange(s => { if (s === 'reminders') load(); });
    return off;
  },
});

/* ---- 13-passwords.js ---- */
/* ===== Passwords: an encrypted vault (AES-256-GCM, key from your master password with PBKDF2) ===== */
addCSS(`
.lock{max-width:420px;margin:24px auto;text-align:center}
.lock .big{font-size:64px;line-height:1;margin-bottom:8px}
.lock h2{font-size:24px;margin-bottom:6px}
.pwrow{display:flex;gap:8px;align-items:center}
.pwrow input{font-family:var(--mono)}
.meter{height:6px;border-radius:3px;background:var(--surface2);overflow:hidden;margin:6px 0 2px}
.meter i{display:block;height:100%;border-radius:3px;transition:width .2s}
.field-show{display:flex;align-items:center;gap:8px;padding:12px 14px;border-top:1px solid var(--line)}
.field-show:first-child{border-top:0}
.field-show .k{font-size:13px;color:var(--muted);font-weight:600}
.field-show .val{font-size:17px;word-break:break-all}
.field-show .val.mono{font-family:var(--mono)}
.avatar{width:38px;height:38px;border-radius:10px;display:grid;place-items:center;font-weight:800;color:#fff;font-size:18px;flex:0 0 auto}
`);
const Vault = {
  ITER: 310000,
  b64: u8 => { let s = ''; for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]); return btoa(s); },
  unb64: s => Uint8Array.from(atob(s), c => c.charCodeAt(0)),
  async key(pass, salt, iter) {
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  },
  async seal(key, obj) { const iv = crypto.getRandomValues(new Uint8Array(12)); const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(obj))); return { iv: this.b64(iv), ct: this.b64(new Uint8Array(ct)) }; },
  async open(key, box) { const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: this.unb64(box.iv) }, key, this.unb64(box.ct)); return JSON.parse(new TextDecoder().decode(pt)); },
  gen({ len = 16, upper = true, lower = true, nums = true, syms = true, easy = false } = {}) {
    let U = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', L = 'abcdefghijklmnopqrstuvwxyz', N = '0123456789', S = '!@#$%^&*-_=+?';
    if (easy) { U = U.replace(/[IO]/g, ''); L = L.replace(/[lo]/g, ''); N = N.replace(/[01]/g, ''); }
    const sets = [upper && U, lower && L, nums && N, syms && S].filter(Boolean); if (!sets.length) sets.push(L);
    const all = sets.join(''), rnd = n => { const lim = 256 - (256 % n); let x; do { x = crypto.getRandomValues(new Uint8Array(1))[0]; } while (x >= lim); return x % n; };
    for (; ;) { let p = ''; for (let i = 0; i < len; i++) p += all[rnd(all.length)]; if (sets.every(s => [...p].some(c => s.includes(c))) || len < sets.length) return p; }
  },
  strength(p) {
    if (!p) return [0, '', 'var(--line)']; let pool = 0; if (/[a-z]/.test(p)) pool += 26; if (/[A-Z]/.test(p)) pool += 26; if (/\d/.test(p)) pool += 10; if (/[^\w]/.test(p)) pool += 15;
    let bits = p.length * Math.log2(Math.max(pool, 2)); if (/^(.)\1+$/.test(p) || /^(password|123456|qwerty)/i.test(p)) bits = 8;
    return bits < 40 ? [bits, 'Weak', 'var(--bad)'] : bits < 60 ? [bits, 'Okay', 'var(--warn)'] : bits < 80 ? [bits, 'Strong', 'var(--good)'] : [bits, 'Very strong', 'var(--good)'];
  },
};
Apps.reg({
  id: 'passwords', name: 'Passwords', icon: '🔐', color: 'linear-gradient(135deg,#5C6BFF,#2B2FB8)', group: 'tools', keys: 'vault login keys secure', blurb: 'Locked password keeper',
  mount(v, ctx) {
    let rec = null, key = null, items = null, q = '', hiddenAt = 0, idle = null, fails = 0, waitUntil = 0;
    const lock = () => { key = null; items = null; clearTimeout(idle); render(); };
    const poke = () => { clearTimeout(idle); if (key) idle = setTimeout(() => { lock(); UI.toast('Locked after 5 minutes'); }, 5 * 60e3); };
    const vis = () => { if (document.hidden) hiddenAt = Date.now(); else if (key && Date.now() - hiddenAt > 60e3) lock(); };
    document.addEventListener('visibilitychange', vis); v.addEventListener('pointerdown', poke);
    if (!(window.crypto && crypto.subtle)) { v.append(UI.empty('⚠️', 'Encryption is not available here', 'Open Super One from its https address to use Passwords.')); return; }
    const save = async () => { rec.box = await Vault.seal(key, items); rec.updated = Date.now(); await DB.put('vault', rec); };
    const pwInput = (ph, auto = 'current-password') => h('input', { type: 'password', placeholder: ph, autocomplete: auto, autocapitalize: 'off', spellcheck: 'false' });
    async function render() {
      v.innerHTML = ''; ctx.setActions(); ctx.setBack(null); ctx.setTitle('Passwords');
      rec = await DB.get('vault', 'main');
      if (!rec) return setup();
      if (!key) return unlock();
      list();
    }
    function setup() {
      const p1 = pwInput('Make a master password', 'new-password'), p2 = pwInput('Type it again', 'new-password'), hint = h('input', { type: 'text', placeholder: 'Hint to help you remember (optional)' });
      const meter = h('i'), lab = h('small', { class: 'muted' });
      p1.addEventListener('input', () => { const [b, t, c] = Vault.strength(p1.value); meter.style.width = Math.min(100, b) + '%'; meter.style.background = c; lab.textContent = t; });
      const go = h('button', { class: 'btn pri wide mt', onclick: async () => {
        if (p1.value.length < 6) return UI.toast('Use at least 6 characters');
        if (p1.value !== p2.value) return UI.toast('The two passwords don’t match');
        if (hint.value && hint.value.includes(p1.value)) return UI.toast('Don’t put the password in the hint!');
        go.disabled = true; go.textContent = 'Locking…';
        const salt = crypto.getRandomValues(new Uint8Array(16)); key = await Vault.key(p1.value, salt, Vault.ITER); items = [];
        rec = { id: 'main', salt: Vault.b64(salt), iter: Vault.ITER, hint: hint.value.trim(), created: Date.now() }; await save(); UI.toast('Your vault is ready'); poke(); render();
      } }, 'Create my vault');
      v.append(h('div', { class: 'lock card' }, h('div', { class: 'big' }, '🔐'), h('h2', null, 'Make your vault'),
        h('p', { class: 'muted' }, 'Pick one master password. It locks all your other passwords with strong encryption, on this device only.'),
        h('div', { class: 'stack', style: { textAlign: 'left' } }, p1, h('div', null, h('div', { class: 'meter' }, meter), lab), p2, hint),
        h('div', { class: 'note-banner mt', style: { textAlign: 'left' } }, '⚠️ If you forget the master password, nobody can open the vault — not even me. Write it down somewhere safe.'), go));
    }
    function unlock() {
      const p = pwInput('Master password');
      const msg = h('p', { class: 'small', style: { color: 'var(--bad)', minHeight: '1.4em', margin: '8px 0 0' } });
      const go = h('button', { class: 'btn pri wide mt', onclick: async () => {
        if (Date.now() < waitUntil) return msg.textContent = 'Too many tries. Wait ' + Math.ceil((waitUntil - Date.now()) / 1000) + ' seconds.';
        go.disabled = true; go.textContent = 'Unlocking…';
        try { const k = await Vault.key(p.value, Vault.unb64(rec.salt), rec.iter); items = await Vault.open(k, rec.box); key = k; fails = 0; poke(); render(); }
        catch (e) { fails++; if (fails >= 5) { waitUntil = Date.now() + 30e3; fails = 0; } msg.textContent = 'That’s not it. Try again.'; p.value = ''; p.focus(); Sfx.bad(); go.disabled = false; go.textContent = 'Unlock'; }
      } }, 'Unlock');
      p.addEventListener('keydown', e => { if (e.key === 'Enter') go.click(); });
      v.append(h('div', { class: 'lock card' }, h('div', { class: 'big' }, '🔒'), h('h2', null, 'Vault locked'), h('p', { class: 'muted' }, 'Type your master password.'), p, msg, go,
        rec.hint ? h('details', { class: 'mt small' }, h('summary', { class: 'muted' }, 'Show my hint'), h('p', { class: 'mt' }, rec.hint)) : null));
      setTimeout(() => p.focus(), 80);
    }
    const avatar = it => { const c = 'hsl(' + (hashStr((it.name || '?').toLowerCase()) % 360) + ' 60% 48%)'; return h('span', { class: 'avatar', style: { background: c } }, (it.name || '?').trim()[0]?.toUpperCase() || '?'); };
    function list() {
      ctx.setActions(h('button', { class: 'btn ghost sm', onclick: lock }, '🔒 Lock'), h('button', { class: 'ib', 'aria-label': 'Vault options', html: SVG.more, onclick: options }));
      const search = h('input', { type: 'search', placeholder: 'Search ' + items.length + ' saved', value: q });
      const box = h('div');
      v.append(h('div', { class: 'search mb' }, search), box, h('button', { class: 'fab', 'aria-label': 'Add password', html: SVG.plus, onclick: () => edit(null) }));
      const draw = () => {
        box.innerHTML = ''; const s = q.toLowerCase();
        const shown = items.filter(i => !s || (i.name + ' ' + i.user + ' ' + (i.url || '')).toLowerCase().includes(s)).sort((a, b) => a.name.localeCompare(b.name));
        if (!items.length) return box.append(UI.empty('🗝️', 'Nothing saved yet', 'Tap + to add your first login.'), h('button', { class: 'btn wide', onclick: generator }, '🎲 Make a strong password'));
        box.append(h('div', { class: 'list' }, shown.map(it => h('button', { class: 'li', onclick: () => show(it) }, avatar(it), h('span', { class: 't' }, h('b', null, it.name), h('small', null, it.user || '—')), h('span', { class: 'chev' }, '›')))));
        box.append(h('button', { class: 'btn wide mt', onclick: generator }, '🎲 Make a strong password'));
      };
      search.addEventListener('input', () => { q = search.value; draw(); }); draw();
    }
    function show(it) {
      v.innerHTML = ''; ctx.setTitle(it.name); ctx.setBack(() => { render(); return true; });
      ctx.setActions(h('button', { class: 'btn ghost sm', onclick: () => edit(it) }, 'Edit'));
      let reveal = false; const pw = h('span', { class: 'val mono' }, '••••••••••');
      const eye = h('button', { class: 'btn sm', onclick: () => { reveal = !reveal; pw.textContent = reveal ? it.pass : '••••••••••'; eye.textContent = reveal ? 'Hide' : 'Show'; } }, 'Show');
      const f = (k, val, extra) => h('div', { class: 'field-show' }, h('div', { style: { flex: 1, minWidth: 0 } }, h('div', { class: 'k' }, k), typeof val === 'string' ? h('div', { class: 'val' }, val) : val), extra);
      v.append(h('div', { class: 'row mb', style: { gap: '12px' } }, avatar(it), h('h2', { style: { fontSize: '22px' } }, it.name)),
        h('div', { class: 'list' },
          f('Username or email', it.user || '—', it.user ? h('button', { class: 'btn sm', onclick: () => copyText(it.user, 'Username copied') }, 'Copy') : null),
          f('Password', pw, h('div', { class: 'row nw' }, eye, h('button', { class: 'btn sm pri', onclick: () => copyText(it.pass, 'Password copied') }, 'Copy'))),
          it.url ? f('Website', h('a', { class: 'val', href: /^https?:/.test(it.url) ? it.url : 'https://' + it.url, target: '_blank', rel: 'noopener' }, it.url)) : null,
          it.notes ? f('Notes', it.notes) : null),
        h('p', { class: 'tiny muted mt' }, 'Changed ' + fmtAgo(it.updated || it.created) + '. Strength: ' + Vault.strength(it.pass)[1] + '.'));
    }
    function edit(it0) {
      const it = Object.assign({ name: '', user: '', pass: '', url: '', notes: '' }, it0 || {});
      const name = h('input', { type: 'text', value: it.name, placeholder: 'Website or app (e.g. Roblox)', autocapitalize: 'words' });
      const user = h('input', { type: 'text', value: it.user, placeholder: 'Username or email', autocapitalize: 'off', autocomplete: 'off', spellcheck: 'false' });
      const pass = h('input', { type: 'text', value: it.pass, placeholder: 'Password', autocapitalize: 'off', autocomplete: 'off', spellcheck: 'false', style: { fontFamily: 'var(--mono)' } });
      const url = h('input', { type: 'url', value: it.url, placeholder: 'Web address (optional)', autocapitalize: 'off' });
      const notes = h('input', { type: 'text', value: it.notes, placeholder: 'Notes (optional)' });
      const meter = h('i'), lab = h('small', { class: 'muted' });
      const paint = () => { const [b, t, c] = Vault.strength(pass.value); meter.style.width = Math.min(100, b) + '%'; meter.style.background = c; lab.textContent = t; };
      pass.addEventListener('input', paint); paint();
      const body = h('div', null, h('label', { class: 'f' }, h('span', null, 'Name'), name), h('label', { class: 'f' }, h('span', null, 'Username'), user),
        h('label', { class: 'f' }, h('span', null, 'Password'), h('div', { class: 'pwrow' }, pass, h('button', { class: 'btn', title: 'Make a strong one', onclick: () => { pass.value = Vault.gen(); paint(); } }, '🎲')), h('div', { class: 'meter' }, meter), lab),
        h('label', { class: 'f' }, h('span', null, 'Website'), url), h('label', { class: 'f' }, h('span', null, 'Notes'), notes),
        it0 ? h('button', { class: 'btn bad sm', onclick: async () => { if (!(await UI.ask('Delete the login for ' + it.name + '?', { ok: 'Delete', danger: true }))) return; items = items.filter(x => x.id !== it.id); await save(); s.close(); render(); } }, 'Delete this login') : null);
      const s = UI.sheet({ title: it0 ? 'Edit login' : 'New login', body, actions: [{ label: 'Cancel' }, { label: 'Save', cls: 'pri', onClick: async c => {
        if (!name.value.trim()) return UI.toast('Give it a name');
        if (!pass.value) return UI.toast('Type or make a password');
        Object.assign(it, { id: it.id || uid(), name: name.value.trim(), user: user.value.trim(), pass: pass.value, url: url.value.trim(), notes: notes.value.trim(), updated: Date.now(), created: it.created || Date.now() });
        items = items.filter(x => x.id !== it.id).concat([it]); await save(); c(); UI.toast('Saved and locked away'); show(it);
      } }] });
    }
    function generator() {
      const opt = { len: 16, upper: true, lower: true, nums: true, syms: true, easy: false };
      const out = h('div', { class: 'val', style: { fontFamily: 'var(--mono)', fontSize: '22px', wordBreak: 'break-all', textAlign: 'center', padding: '14px', background: 'var(--surface2)', borderRadius: '12px', minHeight: '64px' } });
      const len = h('input', { type: 'range', min: 8, max: 40, value: 16 }), lenL = h('b');
      const roll = () => { opt.len = +len.value; lenL.textContent = len.value; out.textContent = Vault.gen(opt); };
      len.addEventListener('input', roll);
      const tog = (k, label) => { const c = h('input', { type: 'checkbox' }); c.checked = opt[k]; c.onchange = () => { opt[k] = c.checked; roll(); }; return h('label', { class: 'row nw', style: { margin: '6px 0' } }, c, label); };
      roll();
      UI.sheet({ title: 'Strong password maker', body: h('div', null, out, h('div', { class: 'row mt' }, h('span', null, 'Length: '), lenL), len, tog('upper', 'ABC capitals'), tog('lower', 'abc small letters'), tog('nums', '123 numbers'), tog('syms', '!@# symbols'), tog('easy', 'Skip look-alike letters (l, 1, O, 0)')),
        actions: [{ label: '🎲 New one', onClick: () => roll() }, { label: 'Copy', cls: 'pri', onClick: c => { copyText(out.textContent, 'Password copied'); c(); } }] });
    }
    function options() {
      UI.menu('Vault', [
        { icon: '🔑', label: 'Change master password', run: changeMaster },
        { icon: '💾', label: 'Back up', sub: 'Backups keep the vault locked with your master password', run: () => Shell.settings() },
        { icon: '🗑️', label: 'Delete the whole vault', danger: true, run: async () => { if (await UI.ask('Delete ALL saved passwords?', { ok: 'Delete', danger: true }) && await UI.ask('Really? This can’t be undone.', { ok: 'Yes, delete', danger: true })) { await DB.del('vault', 'main'); lock(); } } },
      ]);
    }
    function changeMaster() {
      const old = pwInput('Current master password'), p1 = pwInput('New master password', 'new-password'), p2 = pwInput('New one again', 'new-password');
      UI.sheet({ title: 'Change master password', body: h('div', { class: 'stack' }, old, p1, p2), actions: [{ label: 'Cancel' }, { label: 'Change', cls: 'pri', onClick: async c => {
        try { await Vault.open(await Vault.key(old.value, Vault.unb64(rec.salt), rec.iter), rec.box); } catch (e) { return UI.toast('Current password is wrong'); }
        if (p1.value.length < 6) return UI.toast('Use at least 6 characters'); if (p1.value !== p2.value) return UI.toast('New passwords don’t match');
        const salt = crypto.getRandomValues(new Uint8Array(16)); key = await Vault.key(p1.value, salt, Vault.ITER); rec.salt = Vault.b64(salt); rec.iter = Vault.ITER; await save(); c(); UI.toast('Master password changed');
      } }] });
    }
    render();
    return () => { key = null; items = null; clearTimeout(idle); document.removeEventListener('visibilitychange', vis); };
  },
});

/* ---- 14-clock.js ---- */
/* ===== Clock: world clock, alarms, stopwatch, timer ===== */
addCSS(`
.anaclock{display:block;width:min(260px,70vw);height:min(260px,70vw);margin:6px auto 4px}
.bigtime{text-align:center;font-size:44px;font-weight:300;font-variant-numeric:tabular-nums;font-family:var(--round);line-height:1.1}
.bigtime small{display:block;font-size:15px;color:var(--muted);font-weight:500}
.wc{display:flex;align-items:center;gap:12px;padding:12px 14px;border-top:1px solid var(--line)}
.wc:first-child{border-top:0}
.wc b{display:block;font-size:17px}
.wc small{color:var(--muted);font-size:13px}
.wc .tm{margin-left:auto;font-size:30px;font-weight:300;font-variant-numeric:tabular-nums;font-family:var(--round)}
.sw{text-align:center;font-size:64px;font-weight:200;font-variant-numeric:tabular-nums;font-family:var(--round);padding:24px 0 14px;letter-spacing:-.02em}
.roundbtns{display:flex;justify-content:space-between;max-width:360px;margin:0 auto 14px}
.roundbtns button{width:84px;height:84px;border-radius:42px;border:0;font-size:17px;font-weight:650;background:var(--surface2);color:var(--ink)}
.roundbtns button.go{background:#1F7A3D;color:#7CF0A6}.roundbtns button.stop{background:#7A1F1F;color:#FF9C9C}
.lap{display:flex;justify-content:space-between;padding:10px 14px;border-top:1px solid var(--line);font-variant-numeric:tabular-nums}
.lap.best{color:var(--good)}.lap.worst{color:var(--bad)}
.ring{position:relative;width:min(280px,72vw);height:min(280px,72vw);margin:8px auto}
.ring svg{width:100%;height:100%;transform:rotate(-90deg)}
.ring .tt{position:absolute;inset:0;display:grid;place-items:center;font-size:52px;font-weight:200;font-variant-numeric:tabular-nums;font-family:var(--round)}
.alarm{display:flex;align-items:center;gap:12px;padding:12px 14px;border-top:1px solid var(--line)}
.alarm:first-child{border-top:0}
.alarm .tm{font-size:38px;font-weight:300;font-family:var(--round);font-variant-numeric:tabular-nums}
.alarm.off .tm,.alarm.off small{opacity:.45}
.switch{position:relative;width:52px;height:32px;border-radius:16px;background:var(--surface2);border:0;flex:0 0 auto;transition:background .2s}
.switch::after{content:"";position:absolute;top:3px;left:3px;width:26px;height:26px;border-radius:13px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.3);transition:transform .2s}
.switch[aria-checked="true"]{background:#34C759}.switch[aria-checked="true"]::after{transform:translateX(20px)}
.ringing{position:fixed;inset:0;z-index:80;background:linear-gradient(160deg,#FF6B6B,#7C3AED);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center;padding:24px}
.ringing .tm{font-size:84px;font-weight:200;font-family:var(--round)}
.ringing .btn{min-width:220px;min-height:58px;font-size:20px;border:0}
`);
const ZONES = [['Honolulu', 'Pacific/Honolulu'], ['Anchorage', 'America/Anchorage'], ['Los Angeles', 'America/Los_Angeles'], ['Vancouver', 'America/Vancouver'], ['Denver', 'America/Denver'], ['Chicago', 'America/Chicago'], ['Mexico City', 'America/Mexico_City'], ['Toronto', 'America/Toronto'], ['New York', 'America/New_York'], ['Bogotá', 'America/Bogota'], ['Lima', 'America/Lima'], ['Santiago', 'America/Santiago'], ['Buenos Aires', 'America/Argentina/Buenos_Aires'], ['São Paulo', 'America/Sao_Paulo'], ['Reykjavík', 'Atlantic/Reykjavik'], ['London', 'Europe/London'], ['Dublin', 'Europe/Dublin'], ['Lisbon', 'Europe/Lisbon'], ['Paris', 'Europe/Paris'], ['Madrid', 'Europe/Madrid'], ['Berlin', 'Europe/Berlin'], ['Rome', 'Europe/Rome'], ['Amsterdam', 'Europe/Amsterdam'], ['Stockholm', 'Europe/Stockholm'], ['Athens', 'Europe/Athens'], ['Istanbul', 'Europe/Istanbul'], ['Moscow', 'Europe/Moscow'], ['Cairo', 'Africa/Cairo'], ['Lagos', 'Africa/Lagos'], ['Nairobi', 'Africa/Nairobi'], ['Johannesburg', 'Africa/Johannesburg'], ['Dubai', 'Asia/Dubai'], ['Tehran', 'Asia/Tehran'], ['Karachi', 'Asia/Karachi'], ['Delhi', 'Asia/Kolkata'], ['Dhaka', 'Asia/Dhaka'], ['Bangkok', 'Asia/Bangkok'], ['Jakarta', 'Asia/Jakarta'], ['Singapore', 'Asia/Singapore'], ['Kuala Lumpur', 'Asia/Kuala_Lumpur'], ['Hong Kong', 'Asia/Hong_Kong'], ['Beijing', 'Asia/Shanghai'], ['Taipei', 'Asia/Taipei'], ['Manila', 'Asia/Manila'], ['Seoul', 'Asia/Seoul'], ['Tokyo', 'Asia/Tokyo'], ['Perth', 'Australia/Perth'], ['Adelaide', 'Australia/Adelaide'], ['Brisbane', 'Australia/Brisbane'], ['Sydney', 'Australia/Sydney'], ['Melbourne', 'Australia/Melbourne'], ['Auckland', 'Pacific/Auckland'], ['Fiji', 'Pacific/Fiji']];
const Alarms = {
  ringing: null, stopSnd: null,
  list() { return Prefs.get('alarms', []); },
  save(a) { Prefs.set('alarms', a); },
  tick() {
    if (this.ringing) return; const now = new Date(), hm = pad2(now.getHours()) + ':' + pad2(now.getMinutes()), key = ymd(now) + ' ' + hm, list = this.list();
    for (const a of list) { if (!a.on || a.time !== hm || a.last === key) continue; if (a.days && a.days.length && !a.days.includes(now.getDay())) continue; a.last = key; if (!a.days || !a.days.length) a.on = false; this.save(list); this.ring(a.label || 'Alarm', a.time, a); return; }
    const t = Prefs.get('timerEnd', 0); if (t && Date.now() >= t) { Prefs.set('timerEnd', 0); this.ring('Timer done', '⏱️'); }
  },
  sound() { const c = Sfx.ctx(); if (!c) return () => { }; let on = true; const loop = () => { if (!on) return; [880, 1175, 880, 1175].forEach((f, i) => Sfx.tone(f, 0.18, { type: 'square', vol: 0.12, when: i * 0.22 })); setTimeout(loop, 1400); }; loop(); const stop = setTimeout(() => on = false, 90e3); return () => { on = false; clearTimeout(stop); }; },
  ring(label, time, a) {
    this.stopSnd = this.sound(); try { navigator.vibrate && navigator.vibrate([400, 200, 400, 200, 400]); } catch (e) { }
    const done = () => { this.stopSnd && this.stopSnd(); el.remove(); this.ringing = null; };
    const el = h('div', { class: 'ringing', role: 'alertdialog' }, h('div', { style: { fontSize: '54px' } }, '⏰'), h('div', { class: 'tm' }, time.includes(':') ? time : '⏱️'), h('div', { style: { fontSize: '24px', fontWeight: 700 } }, label),
      a ? h('button', { class: 'btn', style: { background: 'rgba(255,255,255,.25)', color: '#fff' }, onclick: () => { done(); const d = new Date(Date.now() + 9 * 60e3); const list = this.list(); list.push({ id: uid(), time: pad2(d.getHours()) + ':' + pad2(d.getMinutes()), label: (label || 'Alarm') + ' (snooze)', days: [], on: true, snooze: true }); this.save(list); UI.toast('Snoozing 9 minutes'); } }, '😴 Snooze 9 min') : null,
      h('button', { class: 'btn', style: { background: '#fff', color: '#7C3AED' }, onclick: done }, 'Stop'));
    this.ringing = el; document.body.append(el);
    if (document.hidden && 'Notification' in window && Notification.permission === 'granted') navigator.serviceWorker && navigator.serviceWorker.ready.then(g => g.showNotification('⏰ ' + label, { tag: 'alarm' })).catch(() => { });
  },
};
setInterval(() => Alarms.tick(), 5000); document.addEventListener('visibilitychange', () => { if (!document.hidden) Alarms.tick(); });
Apps.reg({
  id: 'clock', name: 'Clock', icon: '⏰', color: 'linear-gradient(135deg,#3A3A4A,#111118)', group: 'day', keys: 'time alarm stopwatch timer world clock', blurb: 'World clock, alarms, stopwatch, timer',
  mount(v, ctx) {
    let tab = Prefs.get('clockTab', 'world'), stopTab = null;
    const body = h('div');
    v.append(UI.tabs([['world', '🌍 World'], ['alarm', '⏰ Alarms'], ['sw', '⏱️ Stopwatch'], ['timer', '⏳ Timer']], tab, t => { tab = t; Prefs.set('clockTab', t); show(); }), body);
    function show() { if (stopTab) stopTab(); body.innerHTML = ''; ctx.setActions(); stopTab = ({ world, alarm, sw, timer })[tab](body) || null; }
    function world(el) {
      const cv = h('canvas', { class: 'anaclock', width: 520, height: 520, 'aria-hidden': 'true' }), big = h('div', { class: 'bigtime' }), list = h('div', { class: 'mt' });
      el.append(cv, big, list);
      ctx.setActions(h('button', { class: 'btn ghost sm', onclick: add }, '＋ City'));
      const g = cv.getContext('2d');
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const offset = (zone, d) => { const p = new Intl.DateTimeFormat('en-US', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' }).formatToParts(d).reduce((o, x) => (o[x.type] = x.value, o), {}); return (Date.UTC(+p.year, p.month - 1, +p.day, +p.hour % 24, +p.minute) - Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes())) / 3600e3; };
      function paint() {
        const d = new Date(), W = 520, c = W / 2, dark = getComputedStyle(document.body).backgroundColor.match(/\d+/g).slice(0, 3).reduce((a, b) => a + +b, 0) < 300;
        g.clearRect(0, 0, W, W); g.fillStyle = dark ? '#1A1C24' : '#fff'; g.beginPath(); g.arc(c, c, 240, 0, 6.283); g.fill(); g.lineWidth = 6; g.strokeStyle = dark ? '#333845' : '#E3E5EE'; g.stroke();
        for (let i = 0; i < 60; i++) { const a = i / 60 * 6.283, r1 = i % 5 ? 222 : 206; g.strokeStyle = i % 5 ? (dark ? '#555' : '#BBB') : (dark ? '#EEE' : '#222'); g.lineWidth = i % 5 ? 3 : 7; g.beginPath(); g.moveTo(c + Math.sin(a) * r1, c - Math.cos(a) * r1); g.lineTo(c + Math.sin(a) * 230, c - Math.cos(a) * 230); g.stroke(); }
        g.fillStyle = dark ? '#EEE' : '#222'; g.font = '600 38px ' + getComputedStyle(document.body).fontFamily; g.textAlign = 'center'; g.textBaseline = 'middle'; for (let n = 1; n <= 12; n++) { const a = n / 12 * 6.283; g.fillText(n, c + Math.sin(a) * 172, c - Math.cos(a) * 172); }
        const hand = (ang, len, w, col) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(c - Math.sin(ang) * 24, c + Math.cos(ang) * 24); g.lineTo(c + Math.sin(ang) * len, c - Math.cos(ang) * len); g.stroke(); };
        const s = d.getSeconds() + d.getMilliseconds() / 1000, m = d.getMinutes() + s / 60, hr = d.getHours() % 12 + m / 60;
        hand(hr / 12 * 6.283, 120, 14, dark ? '#fff' : '#111'); hand(m / 60 * 6.283, 180, 9, dark ? '#fff' : '#111'); hand(s / 60 * 6.283, 200, 3.5, '#FF9500');
        g.fillStyle = '#FF9500'; g.beginPath(); g.arc(c, c, 10, 0, 6.283); g.fill();
        big.innerHTML = esc(d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', second: '2-digit' })) + '<small>' + esc(tz.replace(/_/g, ' ')) + '</small>';
      }
      function drawList() {
        const cities = Prefs.get('cities', ['London', 'Tokyo', 'New York']), d = new Date(); list.innerHTML = '';
        if (!cities.length) return;
        list.append(h('div', { class: 'list' }, cities.map(name => { const z = (ZONES.find(x => x[0] === name) || [name, 'UTC'])[1], off = offset(z, d), t = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', timeZone: z });
          const dayDiff = new Date(d.toLocaleString('en-US', { timeZone: z })).getDate() - d.getDate();
          return h('div', { class: 'wc' }, h('div', null, h('b', null, name), h('small', null, (dayDiff > 0 || dayDiff < -20 ? 'Tomorrow, ' : dayDiff < 0 || dayDiff > 20 ? 'Yesterday, ' : 'Today, ') + (off === 0 ? 'same time' : (off > 0 ? '+' : '') + off + ' h'))), h('span', { class: 'tm' }, t),
            h('button', { class: 'ib', 'aria-label': 'Remove ' + name, html: SVG.close, onclick: () => { Prefs.set('cities', cities.filter(c => c !== name)); drawList(); } })); })));
      }
      function add() {
        const q = h('input', { type: 'search', placeholder: 'Search cities' }), res = h('div', { class: 'list mt' });
        const fill = () => { res.innerHTML = ''; const s = q.value.toLowerCase(); ZONES.filter(z => z[0].toLowerCase().includes(s)).forEach(z => res.append(h('button', { class: 'li', onclick: () => { const c = Prefs.get('cities', ['London', 'Tokyo', 'New York']); if (!c.includes(z[0])) c.push(z[0]); Prefs.set('cities', c); sh.close(); drawList(); } }, h('span', { class: 't' }, h('b', null, z[0]), h('small', null, new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', timeZone: z[1] })))))); };
        q.addEventListener('input', fill); const sh = UI.sheet({ title: 'Add a city', body: h('div', null, q, res) }); fill();
      }
      paint(); drawList(); const t1 = setInterval(paint, 250), t2 = setInterval(drawList, 30000);
      return () => { clearInterval(t1); clearInterval(t2); };
    }
    function alarm(el) {
      ctx.setActions(h('button', { class: 'btn ghost sm', onclick: () => edit(null) }, '＋ Alarm'));
      const box = h('div'); el.append(h('div', { class: 'info-banner' }, '⏰ Alarms ring while Super One is open (screen on). For a wake-up alarm with the screen off, also set one in the iPhone Clock app.'), box);
      const DN = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      const draw = () => {
        const list = Alarms.list().sort((a, b) => a.time.localeCompare(b.time)); box.innerHTML = '';
        if (!list.length) { box.append(UI.empty('⏰', 'No alarms', 'Tap “＋ Alarm” to add one.')); return; }
        box.append(h('div', { class: 'list' }, list.map(a => { const [hh, mm] = a.time.split(':').map(Number), d = new Date(); d.setHours(hh, mm);
          const sw = h('button', { class: 'switch', role: 'switch', 'aria-checked': String(!!a.on), 'aria-label': 'Alarm on', onclick: () => { const L = Alarms.list(); const x = L.find(y => y.id === a.id); x.on = !x.on; x.last = ''; Alarms.save(L); draw(); } });
          return h('div', { class: 'alarm' + (a.on ? '' : ' off') }, h('button', { style: { flex: 1, border: 0, background: 'none', textAlign: 'left', padding: 0, color: 'inherit' }, onclick: () => edit(a) }, h('div', { class: 'tm' }, fmtTime(d)), h('small', { class: 'muted' }, (a.label || 'Alarm') + ' · ' + (a.days && a.days.length ? (a.days.length === 7 ? 'Every day' : a.days.map(i => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]).join(' ')) : 'Once'))), sw); })));
      };
      function edit(a0) {
        const a = Object.assign({ time: '07:00', label: '', days: [], on: true }, a0 || {});
        const time = h('input', { type: 'time', value: a.time, style: { fontSize: '28px', textAlign: 'center' } }), label = h('input', { type: 'text', value: a.label, placeholder: 'Label (e.g. School)' });
        let days = a.days.slice(); const dBox = h('div', { class: 'chips' });
        const drawD = () => { dBox.innerHTML = ''; DN.forEach((n, i) => dBox.append(h('button', { class: 'chip', style: { minWidth: '40px', justifyContent: 'center' }, 'aria-pressed': String(days.includes(i)), onclick: () => { days = days.includes(i) ? days.filter(x => x !== i) : days.concat(i).sort(); drawD(); } }, n))); };
        drawD();
        UI.sheet({ title: a0 ? 'Edit alarm' : 'New alarm', body: h('div', null, time, h('label', { class: 'f mt' }, h('span', null, 'Label'), label), h('div', { class: 'small muted', style: { fontWeight: 600, marginBottom: '6px' } }, 'Repeat on (none = once)'), dBox,
          a0 ? h('button', { class: 'btn bad sm mt', onclick: e => { Alarms.save(Alarms.list().filter(x => x.id !== a.id)); e.target.closest('.scrim').remove(); draw(); } }, 'Delete alarm') : null),
          actions: [{ label: 'Cancel' }, { label: 'Save', cls: 'pri', onClick: c => { const L = Alarms.list().filter(x => x.id !== a.id); L.push(Object.assign(a, { id: a.id || uid(), time: time.value || '07:00', label: label.value.trim(), days, on: true, last: '' })); Alarms.save(L); c(); draw(); UI.toast('Alarm set for ' + time.value); } }] });
      }
      draw(); const t = setInterval(draw, 20000); return () => clearInterval(t);
    }
    function sw(el) {
      let st = Prefs.get('stopwatch', { run: false, t0: 0, acc: 0, laps: [] }); let raf = 0;
      const disp = h('div', { class: 'sw' }), left = h('button'), right = h('button'), laps = h('div', { class: 'list' });
      el.append(disp, h('div', { class: 'roundbtns' }, left, right), laps);
      const now = () => st.acc + (st.run ? Date.now() - st.t0 : 0);
      const f = ms => { const m = Math.floor(ms / 60000), s = Math.floor(ms / 1000) % 60, cs = Math.floor(ms / 10) % 100; return pad2(m) + ':' + pad2(s) + '.' + pad2(cs); };
      const save = () => Prefs.set('stopwatch', st);
      const tick = () => { disp.textContent = f(now()); raf = requestAnimationFrame(tick); };
      const paint = () => {
        left.textContent = st.run ? 'Lap' : 'Reset'; left.disabled = !st.run && !now(); right.textContent = st.run ? 'Stop' : 'Start'; right.className = st.run ? 'stop' : 'go';
        laps.innerHTML = ''; const all = st.laps.slice(); if (st.run || now()) all.unshift(now() - st.laps.reduce((a, b) => a + b, 0));
        const done = st.laps; const mn = Math.min(...done), mx = Math.max(...done);
        all.forEach((ms, i) => { const idx = all.length - i, isCur = (st.run || now()) && i === 0; laps.append(h('div', { class: 'lap' + (!isCur && done.length > 2 && ms === mn ? ' best' : !isCur && done.length > 2 && ms === mx ? ' worst' : '') }, h('span', null, 'Lap ' + idx), h('span', null, f(ms)))); });
        laps.hidden = !all.length;
      };
      left.onclick = () => { if (st.run) st.laps.unshift(now() - st.laps.reduce((a, b) => a + b, 0)); else st = { run: false, t0: 0, acc: 0, laps: [] }; save(); paint(); disp.textContent = f(now()); };
      right.onclick = () => { if (st.run) { st.acc = now(); st.run = false; } else { st.t0 = Date.now(); st.run = true; } save(); paint(); };
      paint(); tick(); const t = setInterval(paint, 1000); return () => { cancelAnimationFrame(raf); clearInterval(t); };
    }
    function timer(el) {
      let total = Prefs.get('timerTotal', 300), raf = 0;
      const ring = h('div', { class: 'ring', html: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="var(--surface2)" stroke-width="6"/><circle class="pg" cx="50" cy="50" r="45" fill="none" stroke="#FF9500" stroke-width="6" stroke-linecap="round" stroke-dasharray="282.7" stroke-dashoffset="0"/></svg><div class="tt"></div>' });
      const pickBox = h('div'), left = h('button'), right = h('button');
      el.append(ring, h('div', { class: 'roundbtns' }, left, right), pickBox);
      const mm = h('input', { type: 'number', min: 0, max: 600, value: Math.floor(total / 60), 'aria-label': 'Minutes', style: { textAlign: 'center', fontSize: '22px' } }), ss = h('input', { type: 'number', min: 0, max: 59, value: total % 60, 'aria-label': 'Seconds', style: { textAlign: 'center', fontSize: '22px' } });
      const setT = s => { total = Math.max(1, s); Prefs.set('timerTotal', total); mm.value = Math.floor(total / 60); ss.value = total % 60; paint(); };
      mm.oninput = ss.oninput = () => setT((+mm.value || 0) * 60 + (+ss.value || 0));
      pickBox.append(h('div', { class: 'grid2' }, h('label', { class: 'f' }, h('span', null, 'Minutes'), mm), h('label', { class: 'f' }, h('span', null, 'Seconds'), ss)), h('div', { class: 'chips' }, [1, 3, 5, 10, 15, 25, 30, 60].map(m => h('button', { class: 'chip', onclick: () => setT(m * 60) }, m + ' min'))));
      const end = () => Prefs.get('timerEnd', 0), paused = () => Prefs.get('timerLeft', 0);
      const left_ = () => end() ? Math.max(0, end() - Date.now()) : paused() || total * 1000;
      function paint() {
        const l = left_(), s = Math.ceil(l / 1000); ring.querySelector('.tt').textContent = (s >= 3600 ? Math.floor(s / 3600) + ':' + pad2(Math.floor(s / 60) % 60) : Math.floor(s / 60)) + ':' + pad2(s % 60);
        ring.querySelector('.pg').setAttribute('stroke-dashoffset', String(282.7 * (1 - l / (total * 1000))));
        const running = !!end(); right.textContent = running ? 'Pause' : paused() ? 'Resume' : 'Start'; right.className = running ? 'stop' : 'go'; left.textContent = 'Cancel'; left.disabled = !running && !paused(); pickBox.hidden = running || !!paused();
      }
      right.onclick = () => { Sfx.ctx(); if (end()) { Prefs.set('timerLeft', left_()); Prefs.set('timerEnd', 0); } else { Prefs.set('timerEnd', Date.now() + (paused() || total * 1000)); Prefs.set('timerLeft', 0); } paint(); };
      left.onclick = () => { Prefs.set('timerEnd', 0); Prefs.set('timerLeft', 0); paint(); };
      const loop = () => { paint(); raf = requestAnimationFrame(loop); }; loop();
      return () => cancelAnimationFrame(raf);
    }
    show();
    return () => { if (stopTab) stopTab(); };
  },
});

/* ---- 15-news.js ---- */
/* ===== News: downloads headlines whenever you're online, keeps them to read offline ===== */
addCSS(`
.story{display:flex;gap:12px;align-items:flex-start;padding:14px;border-top:1px solid var(--line);border-left:0;border-right:0;border-bottom:0;background:none;width:100%;text-align:left;color:var(--ink)}
.story:first-child{border-top:0}
.story .im{width:84px;height:84px;border-radius:12px;flex:0 0 auto;background:var(--surface2) center/cover no-repeat;display:grid;place-items:center;font-size:30px}
.story b{display:block;font-size:16px;line-height:1.3}
.story small{display:block;color:var(--muted);font-size:13px;margin-top:4px}
.story p{margin:4px 0 0;font-size:14px;color:var(--muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.lead{border-radius:20px;overflow:hidden;background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow);text-align:left;width:100%;padding:0;color:var(--ink)}
.lead .im{aspect-ratio:16/9;background:var(--surface2) center/cover no-repeat;display:grid;place-items:center;font-size:48px}
.lead div.tx{padding:14px}
.lead b{font-size:20px;line-height:1.25;display:block}
`);
const strip = s => String(s || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
const News = {
  SRC: { world: 'Wikipedia · In the news', space: 'Space news', tech: 'Tech news', day: 'On this day' },
  async fetchAll() {
    const d = new Date(), path = d.getFullYear() + '/' + pad2(d.getMonth() + 1) + '/' + pad2(d.getDate()), out = {};
    const job = async (k, f) => { try { out[k] = await f(); await DB.kset('news:' + k, { at: Date.now(), items: out[k] }); } catch (e) { out[k] = null; } };
    await Promise.all([
      job('world', async () => {
        // "In the news" headlines from Wikipedia's front page, plus a short summary of each main article
        const itn = await (await fetch('https://en.wikipedia.org/w/api.php?action=parse&page=Template:In_the_news&prop=text&format=json&formatversion=2&origin=*')).json();
        const doc = new DOMParser().parseFromString(itn.parse.text, 'text/html'), ul = doc.querySelector('ul');
        const lis = ul ? [...ul.children].filter(x => x.tagName === 'LI').slice(0, 8) : [];
        const items = await Promise.all(lis.map(async li => {
          const title = li.textContent.replace(/\s*\((pictured|shown)\)/g, '').replace(/\s+/g, ' ').trim(), a = li.querySelector('b a') || li.querySelector('a[href*="/wiki/"]');
          const page = a ? decodeURIComponent((a.getAttribute('href') || '').replace(/^.*\/wiki\//, '')) : ''; const it = { title, sum: '', img: null, url: page ? 'https://en.m.wikipedia.org/wiki/' + encodeURIComponent(page) : null, src: 'Wikipedia · In the news' };
          if (page) try { const sm = await (await fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(page))).json(); it.sum = sm.extract || ''; it.img = sm.thumbnail && sm.thumbnail.source; } catch (e) { }
          return it;
        }));
        try {
          const j = await (await fetch('https://en.wikipedia.org/api/rest_v1/feed/featured/' + path)).json();
          if (j.tfa) items.push({ title: '⭐ Featured article: ' + strip(j.tfa.titles ? j.tfa.titles.normalized : j.tfa.title), sum: strip(j.tfa.extract), img: j.tfa.thumbnail && j.tfa.thumbnail.source, url: j.tfa.content_urls && j.tfa.content_urls.mobile.page, src: 'Wikipedia' });
          await DB.kset('news:day', { at: Date.now(), items: (j.onthisday || []).slice(0, 15).map(o => { const pg = (o.pages || [])[0] || {}; return { title: o.year + ': ' + strip(o.text), sum: strip(pg.extract || ''), img: pg.thumbnail && pg.thumbnail.source, url: pg.content_urls && pg.content_urls.mobile.page, src: 'On this day' }; }) });
        } catch (e) { }
        if (!items.length) throw new Error('no news'); return items; }),
      job('space', async () => { const j = await (await fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=20')).json(); return (j.results || []).map(a => ({ title: a.title, sum: strip(a.summary), img: a.image_url, url: a.url, src: a.news_site, when: Date.parse(a.published_at) })); }),
      job('tech', async () => { const ids = (await (await fetch('https://hacker-news.firebaseio.com/v0/topstories.json')).json()).slice(0, 20); const its = await Promise.all(ids.map(id => fetch('https://hacker-news.firebaseio.com/v0/item/' + id + '.json').then(r => r.json()).catch(() => null))); return its.filter(x => x && x.title).map(x => ({ title: x.title, sum: (x.score || 0) + ' points · ' + (x.descendants || 0) + ' comments', url: x.url || 'https://news.ycombinator.com/item?id=' + x.id, src: x.url ? new URL(x.url).hostname.replace(/^www\./, '') : 'Hacker News', when: x.time * 1000 })); }),
    ]);
    await DB.kset('newsAt', Date.now()); return out;
  },
  async peek() { const w = await DB.kget('news:world', null) || await DB.kget('news:space', null); if (!w || !w.items.length) return null; return { title: w.items[0].title, src: w.items[0].src, at: w.at }; },
  async auto() { if (!navigator.onLine) return; const at = await DB.kget('newsAt', 0); if (Date.now() - at > 3 * 3600e3) { try { await this.fetchAll(); } catch (e) { } } },
};
setTimeout(() => News.auto(), 4000); addEventListener('online', () => setTimeout(() => News.auto(), 2000));
Apps.reg({
  id: 'news', name: 'News', icon: '📰', color: 'linear-gradient(135deg,#FF5F6D,#C81D25)', group: 'day', keys: 'headlines updates world space tech today', blurb: 'Headlines, saved for offline',
  mount(v, ctx) {
    let tab = Prefs.get('newsTab', 'world');
    const box = h('div'), status = h('div', { class: 'row small muted', style: { margin: '0 2px 10px' } });
    v.append(UI.tabs([['world', '🌍 World'], ['space', '🚀 Space'], ['tech', '💻 Tech'], ['day', '📅 On this day']], tab, t => { tab = t; Prefs.set('newsTab', t); draw(); }), status, box);
    const refresh = async () => { if (!navigator.onLine) return UI.toast('No internet right now — showing saved news'); status.textContent = 'Getting the latest…'; await News.fetchAll(); draw(); };
    ctx.setActions(h('button', { class: 'btn ghost sm', onclick: refresh }, '↻'));
    async function draw() {
      const c = await DB.kget('news:' + tab, null); box.innerHTML = ''; status.innerHTML = '';
      status.append(h('span', { class: 'sp' }, c ? (navigator.onLine ? 'Updated ' : '📴 Offline · saved ') + fmtAgo(c.at) : ''), h('span', null, News.SRC[tab]));
      if (!c || !c.items.length) { box.append(UI.empty('📰', 'No news saved yet', navigator.onLine ? 'Tap ↻ to download today’s news.' : 'Connect to Wi-Fi once and I’ll save the news for offline reading.')); return; }
      const img = (u, fb) => ({ style: { backgroundImage: u && navigator.onLine ? 'url("' + u + '")' : 'none' } });
      const [first, ...rest] = c.items;
      box.append(h('button', { class: 'lead', onclick: () => read(first) }, h('div', Object.assign({ class: 'im' }, img(first.img)), first.img && navigator.onLine ? '' : '📰'), h('div', { class: 'tx' }, h('b', null, first.title), first.sum ? h('p', { class: 'muted', style: { margin: '6px 0 0' } }, first.sum.slice(0, 160) + (first.sum.length > 160 ? '…' : '')) : null, h('small', { class: 'muted' }, first.src + (first.when ? ' · ' + fmtAgo(first.when) : '')))),
        h('div', { class: 'list mt' }, rest.map(s => h('button', { class: 'story', onclick: () => read(s) }, h('span', Object.assign({ class: 'im' }, img(s.img)), s.img && navigator.onLine ? '' : ({ world: '🌍', space: '🚀', tech: '💻', day: '📅' })[tab]), h('span', { style: { flex: 1, minWidth: 0 } }, h('b', null, s.title), s.sum && tab !== 'tech' ? h('p', null, s.sum) : null, h('small', null, s.src + (s.when ? ' · ' + fmtAgo(s.when) : '') + (tab === 'tech' ? ' · ' + s.sum : '')))))));
      box.append(h('p', { class: 'tiny muted center mt' }, 'News updates by itself whenever you’re online, and stays readable offline. Sources: Wikipedia, Spaceflight News API, Hacker News.'));
    }
    function read(s) {
      UI.sheet({ title: s.src, body: h('div', null, s.img && navigator.onLine ? h('img', { src: s.img, alt: '', style: { width: '100%', borderRadius: '14px', marginBottom: '10px' } }) : null, h('h3', { style: { fontSize: '21px', marginBottom: '8px' } }, s.title), s.sum ? h('p', { style: { fontSize: '17px', lineHeight: 1.55 } }, s.sum) : null, s.when ? h('p', { class: 'small muted' }, new Date(s.when).toLocaleString()) : null),
        actions: [{ label: '🔊 Read aloud', onClick: () => Speak.say(s.title + '. ' + (tab === 'tech' ? '' : s.sum)) }, { label: 'Full story ↗', cls: 'pri', onClick: () => { if (!navigator.onLine) return UI.toast('The full story needs internet'); if (s.url) window.open(s.url, '_blank', 'noopener'); } }] });
    }
    draw();
    (async () => { const at = await DB.kget('newsAt', 0); if (navigator.onLine && Date.now() - at > 30 * 60e3) refresh(); })();
    const on = () => refresh(); addEventListener('online', on); return () => removeEventListener('online', on);
  },
});

/* ---- 20-media.js ---- */
/* ===== Photos & videos ===== */
addCSS(`
.gal{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:3px;border-radius:14px;overflow:hidden}
@media (min-width:640px){.gal{grid-template-columns:repeat(5,minmax(0,1fr))}}
.gal button{position:relative;aspect-ratio:1/1;border:0;padding:0;background:var(--surface2);overflow:hidden;min-width:0}
.gal img{width:100%;height:100%;object-fit:cover;display:block}
.gal .vd{position:absolute;right:5px;bottom:4px;color:#fff;font-size:12px;font-weight:700;text-shadow:0 1px 3px rgba(0,0,0,.7)}
.gal .fv{position:absolute;left:5px;bottom:3px;font-size:13px}
.viewer{position:fixed;inset:0;z-index:55;background:#000;display:flex;flex-direction:column;color:#fff}
.viewer .vt,.viewer .vb{display:flex;align-items:center;gap:6px;padding:calc(var(--top) + 6px) 10px 6px;background:rgba(0,0,0,.4)}
.viewer .vb{padding:8px 10px calc(var(--bot) + 10px);justify-content:space-around}
.viewer .ib{color:#fff}
.viewer .stage{flex:1;display:flex;align-items:center;justify-content:center;overflow:auto;touch-action:pan-x pan-y pinch-zoom;min-height:0}
.viewer .stage img,.viewer .stage video{max-width:100%;max-height:100%;object-fit:contain}
.viewer .stage.zoom{align-items:flex-start;justify-content:flex-start}
.viewer .stage.zoom img{max-width:none;max-height:none}
.viewer .vb button{display:flex;flex-direction:column;align-items:center;gap:2px;border:0;background:none;color:#fff;font-size:12px;min-width:60px;padding:4px}
.viewer .vb button span{font-size:24px}
`);
const Media = {
  async add(files) {
    let n = 0;
    for (const f of files) {
      const video = f.type.startsWith('video'); const th = video ? await videoThumb(f) : await imageThumb(f);
      await DB.put('media', { id: uid(), kind: video ? 'video' : 'photo', name: f.name, blob: f, type: f.type, thumb: th && th.url, w: th && th.w, h: th && th.h, dur: th && th.dur, size: f.size, fav: false, created: Date.now() }); n++;
    }
    return n;
  },
  async addCanvas(canvas, name, kind = 'drawing', id) {
    const blob = await new Promise(r => canvas.toBlob(r, 'image/png')); const th = await imageThumb(canvas);
    const old = id ? await DB.get('media', id) : null;
    const rec = Object.assign(old || { id: uid(), created: Date.now(), fav: false }, { kind: old ? old.kind : kind, name: name || (old && old.name) || 'Drawing', blob, type: 'image/png', thumb: th && th.url, w: canvas.width, h: canvas.height, size: blob.size, updated: Date.now() });
    await DB.put('media', rec); return rec;
  },
  viewer(list, i, onChange) {
    let idx = i, url = null;
    const stage = h('div', { class: 'stage' }), counter = h('span', { style: { flex: 1, textAlign: 'center', fontWeight: 600 } });
    const favB = h('button', null, h('span', null, '🤍'), 'Favorite');
    const close = () => { if (url) URL.revokeObjectURL(url); el.remove(); removeEventListener('keydown', key); onChange && onChange(); };
    const show = () => {
      const m = list[idx]; if (!m) return close(); if (url) URL.revokeObjectURL(url); url = URL.createObjectURL(m.blob); stage.innerHTML = ''; stage.classList.remove('zoom');
      stage.append(m.kind === 'video' ? h('video', { src: url, controls: true, playsinline: true, autoplay: true }) : h('img', { src: url, alt: m.name || 'Photo', ondblclick: () => stage.classList.toggle('zoom') }));
      counter.textContent = (idx + 1) + ' of ' + list.length; favB.firstChild.textContent = m.fav ? '❤️' : '🤍';
      editB.hidden = m.kind === 'video';
    };
    const go = d => { idx = clamp(idx + d, 0, list.length - 1); show(); };
    favB.onclick = async () => { const m = list[idx]; m.fav = !m.fav; await DB.put('media', m); show(); };
    const editB = h('button', { onclick: () => { const m = list[idx]; close(); Shell.go('studio', m.id); } }, h('span', null, '🎨'), 'Edit');
    const el = h('div', { class: 'viewer', role: 'dialog', 'aria-label': 'Photo viewer' },
      h('div', { class: 'vt' }, h('button', { class: 'ib', 'aria-label': 'Close', html: SVG.close, onclick: close }), counter, h('button', { class: 'ib', 'aria-label': 'Previous', onclick: () => go(-1) }, '‹'), h('button', { class: 'ib', 'aria-label': 'Next', onclick: () => go(1) }, '›')),
      stage,
      h('div', { class: 'vb' }, favB, editB,
        h('button', { onclick: () => { const m = list[idx]; saveFile(m.blob, m.name || ('photo-' + m.id + (m.type.includes('png') ? '.png' : m.kind === 'video' ? '.mp4' : '.jpg'))); } }, h('span', null, '📤'), 'Save'),
        h('button', { onclick: async () => { const m = list[idx]; if (!(await UI.ask('Delete this ' + (m.kind === 'video' ? 'video' : 'picture') + '?', { ok: 'Delete', danger: true }))) return; await DB.del('media', m.id); list.splice(idx, 1); if (!list.length) return close(); idx = Math.min(idx, list.length - 1); show(); } }, h('span', null, '🗑️'), 'Delete')));
    let sx = null; stage.addEventListener('touchstart', e => { sx = e.touches.length === 1 && !stage.classList.contains('zoom') ? e.touches[0].clientX : null; }, { passive: true });
    stage.addEventListener('touchend', e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1); sx = null; });
    const key = e => { if (e.key === 'ArrowLeft') go(-1); else if (e.key === 'ArrowRight') go(1); else if (e.key === 'Escape') close(); };
    addEventListener('keydown', key); document.body.append(el); show();
  },
};
Apps.reg({
  id: 'media', name: 'Photos', icon: '🖼️', color: 'linear-gradient(135deg,#4FD1C5,#2B8CBE)', group: 'make', keys: 'pictures videos gallery media camera', blurb: 'Your pictures and videos',
  mount(v, ctx) {
    let filter = 'all';
    const box = h('div');
    const add = () => UI.menu('Add', [
      { icon: '🖼️', label: 'Choose photos or videos', sub: 'From your library or Files', run: async () => { const f = await pickFiles('image/*,video/*'); if (f.length) { UI.toast('Adding ' + f.length + '…'); const n = await Media.add(f); UI.toast('Added ' + n); draw(); } } },
      { icon: '📷', label: 'Take a photo', run: async () => { const f = await pickFiles('image/*', { multiple: false, capture: 'environment' }); if (f.length) { await Media.add(f); draw(); } } },
      { icon: '🎥', label: 'Record a video', run: async () => { const f = await pickFiles('video/*', { multiple: false, capture: 'environment' }); if (f.length) { await Media.add(f); draw(); } } },
    ]);
    ctx.setActions(h('button', { class: 'btn ghost sm', onclick: add }, '＋ Add'));
    v.append(UI.tabs([['all', 'All'], ['photo', '📷 Photos'], ['video', '🎥 Videos'], ['drawing', '🎨 Drawings'], ['fav', '❤️ Favorites']], filter, f => { filter = f; draw(); }), box);
    async function draw() {
      const all = (await DB.all('media')).sort((a, b) => (b.created || 0) - (a.created || 0));
      const list = all.filter(m => filter === 'all' || (filter === 'fav' ? m.fav : m.kind === filter)); box.innerHTML = '';
      if (!all.length) { box.append(UI.empty('🖼️', 'No pictures yet', 'Add photos and videos here, or draw something in Studio. They stay on this device.'), h('div', { class: 'center' }, h('button', { class: 'btn pri', onclick: add }, '＋ Add photos'))); return; }
      if (!list.length) { box.append(UI.empty('🔎', 'Nothing here yet')); return; }
      const bytes = list.reduce((a, m) => a + (m.size || 0), 0);
      box.append(h('div', { class: 'gal' }, list.map((m, i) => h('button', { 'aria-label': (m.kind === 'video' ? 'Video ' : 'Picture ') + (i + 1), onclick: () => Media.viewer(list, i, draw) },
        m.thumb ? h('img', { src: m.thumb, alt: '', loading: 'lazy' }) : h('span', { style: { fontSize: '30px' } }, m.kind === 'video' ? '🎬' : '🖼️'),
        m.kind === 'video' ? h('span', { class: 'vd' }, '▶ ' + (m.dur ? fmtDur(m.dur) : '')) : null, m.fav ? h('span', { class: 'fv' }, '❤️') : null))),
        h('p', { class: 'tiny muted center mt' }, list.length + ' items · ' + fmtSize(bytes)));
    }
    draw();
  },
});

/* ---- 21-music.js ---- */
/* ===== Music: your songs, built-in tunes, piano, beat maker ===== */
addCSS(`
.np{background:linear-gradient(160deg,#3B2DB0,#7A3FD8 60%,#D24E9B);color:#fff;border-radius:22px;padding:18px;box-shadow:0 10px 30px rgba(80,40,180,.35)}
.np .art{width:64px;height:64px;border-radius:14px;background:rgba(255,255,255,.18);display:grid;place-items:center;font-size:34px;flex:0 0 auto}
.np b{font-size:19px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.np small{opacity:.8}
.np input[type=range]{accent-color:#fff}
.np .ctl{display:flex;justify-content:center;align-items:center;gap:18px;margin-top:6px}
.np .ctl button{border:0;background:none;color:#fff;width:48px;height:48px;display:grid;place-items:center;border-radius:24px}
.np .ctl button svg{width:28px;height:28px}
.np .ctl .big{width:64px;height:64px;background:#fff;color:#4a2fc0;border-radius:32px}
.np .ctl .big svg{width:30px;height:30px}
.np .ctl .tog{opacity:.5;font-size:20px}
.np .ctl .tog.on{opacity:1}
.np .times{display:flex;justify-content:space-between;font-size:12px;opacity:.85;font-variant-numeric:tabular-nums}
.song.playing b{color:var(--accent)}
.piano{position:relative;height:200px;display:flex;touch-action:none;user-select:none;-webkit-user-select:none;margin-top:10px;overflow:hidden;border-radius:0 0 12px 12px}
.piano .w{flex:1;border:1px solid #999;border-top:0;background:linear-gradient(#fff,#f1f1f1);border-radius:0 0 8px 8px;position:relative;display:flex;align-items:flex-end;justify-content:center;padding-bottom:8px;font-size:12px;color:#777;font-weight:700}
.piano .b{position:absolute;top:0;height:60%;background:linear-gradient(#333,#111);border-radius:0 0 6px 6px;z-index:2;box-shadow:0 2px 4px rgba(0,0,0,.4)}
.piano .on{background:linear-gradient(#c9c4ff,#9d96ff)!important}
.beat{display:grid;grid-template-columns:64px repeat(16,minmax(0,1fr));gap:3px;align-items:center;margin-top:10px}
.beat .lab{font-size:12px;font-weight:700;color:var(--muted);white-space:nowrap;overflow:hidden}
.beat .st{aspect-ratio:1/1.3;border:0;border-radius:5px;background:var(--surface2);padding:0;min-width:0}
.beat .st.q{background:color-mix(in srgb,var(--surface2) 70%,var(--muted))}
.beat .st.on{background:var(--accent)}
.beat .st.now{outline:2px solid #FF9500;outline-offset:-2px}
`);
const MIDI = m => 440 * Math.pow(2, (m - 69) / 12);
const Synth = {
  noise: new WeakMap(),
  noiseBuf(ctx) { let b = this.noise.get(ctx); if (!b) { b = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; this.noise.set(ctx, b); } return b; },
  INST: { piano: 'Piano', organ: 'Organ', synth: 'Synth', bell: 'Bell', box: 'Music box', pluck: 'Pluck', bass: 'Bass', soft: 'Soft' },
  // start a note; returns stop(time) for held notes
  note(ctx, dest, inst, freq, t, dur, vel = 1) {
    const g = ctx.createGain(); g.connect(dest); const os = []; const v = 0.22 * vel;
    const osc = (type, f, gain) => { const o = ctx.createOscillator(), gg = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); gg.gain.value = gain; o.connect(gg).connect(g); o.start(t); os.push(o); return o; };
    let rel = 0.08, hold = dur != null;
    switch (inst) {
      case 'organ': osc('square', freq, 0.25); osc('sine', freq / 2, 0.6); osc('sine', freq * 2, 0.25); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v * 0.8, t + 0.02); break;
      case 'synth': { const o = osc('sawtooth', freq, 0.5); osc('sawtooth', freq * 1.006, 0.4); const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(3500, t); lp.frequency.exponentialRampToValueAtTime(900, t + 0.4); g.disconnect(); g.connect(lp).connect(dest); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.02); g.gain.setTargetAtTime(v * 0.6, t + 0.05, 0.2); break; }
      case 'bell': osc('sine', freq, 0.7); osc('sine', freq * 2.76, 0.25); osc('sine', freq * 5.4, 0.08); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2); hold = false; dur = 2.2; break;
      case 'box': osc('sine', freq * 2, 0.6); osc('triangle', freq * 4, 0.15); g.gain.setValueAtTime(v * 0.8, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9); hold = false; dur = 0.9; break;
      case 'pluck': osc('square', freq, 0.35); osc('triangle', freq, 0.5); g.gain.setValueAtTime(v * 0.9, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35); hold = false; dur = 0.35; break;
      case 'bass': osc('triangle', freq, 0.9); osc('square', freq, 0.12); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v * 1.3, t + 0.01); g.gain.setTargetAtTime(v * 0.9, t + 0.03, 0.15); break;
      case 'soft': osc('sine', freq, 0.8); osc('triangle', freq, 0.25); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v * 0.7, t + 0.08); rel = 0.4; break;
      default: osc('triangle', freq, 0.75); osc('sine', freq * 2, 0.18); osc('sine', freq * 3, 0.05); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v * 1.1, t + 0.005); g.gain.exponentialRampToValueAtTime(v * 0.35, t + 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4); dur = dur == null ? 2.4 : Math.min(dur, 2.4); hold = true;
    }
    const stop = (at) => { at = Math.max(at, t + 0.02); try { g.gain.cancelScheduledValues(at); g.gain.setValueAtTime(g.gain.value || 0.0001, at); } catch (e) { } g.gain.setTargetAtTime(0, at, rel / 3); os.forEach(o => { try { o.stop(at + rel + 0.3); } catch (e) { } }); };
    if (dur != null) { if (hold) stop(t + dur); else os.forEach(o => { try { o.stop(t + dur + 0.1); } catch (e) { } }); }
    return stop;
  },
  drum(ctx, dest, kind, t, vel = 1) {
    const g = ctx.createGain(); g.connect(dest);
    const nz = (type, f, q) => { const s = ctx.createBufferSource(); s.buffer = this.noiseBuf(ctx); const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; if (q) fl.Q.value = q; s.connect(fl).connect(g); s.start(t); s.stop(t + 0.5); };
    const tone = (type, f0, f1, d, gain = 1) => { const o = ctx.createOscillator(), gg = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + d); gg.gain.setValueAtTime(gain, t); gg.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(gg).connect(g); o.start(t); o.stop(t + d + 0.05); };
    switch (kind) {
      case 'kick': g.gain.value = 0.9 * vel; tone('sine', 150, 42, 0.32); break;
      case 'snare': g.gain.setValueAtTime(0.45 * vel, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18); nz('highpass', 1200); tone('triangle', 200, 120, 0.1, 0.6); break;
      case 'hat': g.gain.setValueAtTime(0.18 * vel, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05); nz('highpass', 7500); break;
      case 'open': g.gain.setValueAtTime(0.16 * vel, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3); nz('highpass', 6500); break;
      case 'clap': for (let i = 0; i < 3; i++) { const gg = ctx.createGain(); gg.connect(dest); const s = ctx.createBufferSource(); s.buffer = this.noiseBuf(ctx); const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1600; f.Q.value = 1.2; s.connect(f).connect(gg); const tt = t + i * 0.012; gg.gain.setValueAtTime(0.5 * vel, tt); gg.gain.exponentialRampToValueAtTime(0.0001, tt + (i === 2 ? 0.15 : 0.03)); s.start(tt); s.stop(tt + 0.2); } break;
      case 'tom': g.gain.value = 0.6 * vel; tone('sine', 230, 110, 0.28); break;
      case 'bell': g.gain.setValueAtTime(0.18 * vel, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35); tone('square', 540, 538, 0.35, 0.6); tone('square', 800, 798, 0.35, 0.5); break;
    }
  },
  wav(buf) {
    const ch = buf.numberOfChannels, sr = buf.sampleRate, n = buf.length, dv = new DataView(new ArrayBuffer(44 + n * ch * 2));
    const ws = (o, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
    ws(0, 'RIFF'); dv.setUint32(4, 36 + n * ch * 2, true); ws(8, 'WAVE'); ws(12, 'fmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, ch, true);
    dv.setUint32(24, sr, true); dv.setUint32(28, sr * ch * 2, true); dv.setUint16(32, ch * 2, true); dv.setUint16(34, 16, true); ws(36, 'data'); dv.setUint32(40, n * ch * 2, true);
    const data = []; for (let c = 0; c < ch; c++) data.push(buf.getChannelData(c));
    let o = 44; for (let i = 0; i < n; i++) for (let c = 0; c < ch; c++) { const s = Math.max(-1, Math.min(1, data[c][i])); dv.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7FFF, true); o += 2; }
    return new Blob([dv.buffer], { type: 'audio/wav' });
  },
  async render(seconds, fill, sr = 32000) {
    const C = window.OfflineAudioContext || window.webkitOfflineAudioContext; const ctx = new C(1, Math.ceil(seconds * sr), sr);
    const master = ctx.createGain(); master.gain.value = 0.8; const comp = ctx.createDynamicsCompressor(); master.connect(comp).connect(ctx.destination);
    fill(ctx, master); const buf = await ctx.startRendering(); return this.wav(buf);
  },
};
/* ---------- built-in original tunes (made from a seed, rendered on this device) ---------- */
const TUNES = [
  { id: 't1', name: 'Sunny Steps', icon: '🌞', bpm: 118, root: 60, mode: 'maj', prog: [0, 4, 5, 3], lead: 'pluck', arp: 'box', drums: 'pop', seed: 11 },
  { id: 't2', name: 'Night Drive', icon: '🌙', bpm: 96, root: 57, mode: 'min', prog: [0, 5, 2, 6], lead: 'synth', arp: 'soft', drums: 'chill', seed: 23 },
  { id: 't3', name: 'Pixel Rain', icon: '🌧️', bpm: 140, root: 64, mode: 'min', prog: [0, 3, 6, 4], lead: 'pluck', arp: 'pluck', drums: 'fast', seed: 37 },
  { id: 't4', name: 'Lazy Cloud', icon: '☁️', bpm: 84, root: 65, mode: 'maj', prog: [0, 3, 0, 4], lead: 'soft', arp: 'piano', drums: 'chill', seed: 41 },
  { id: 't5', name: 'Boss Rush', icon: '⚔️', bpm: 160, root: 62, mode: 'min', prog: [0, 0, 5, 4], lead: 'synth', arp: 'pluck', drums: 'fast', seed: 59 },
  { id: 't6', name: 'Starlight Lullaby', icon: '✨', bpm: 72, root: 67, mode: 'maj', prog: [0, 5, 3, 4], lead: 'bell', arp: 'box', drums: 'none', seed: 73 },
  { id: 't7', name: 'Ocean Breeze', icon: '🌊', bpm: 104, root: 62, mode: 'maj', prog: [0, 2, 3, 4], lead: 'piano', arp: 'soft', drums: 'pop', seed: 89 },
  { id: 't8', name: 'Cave Echoes', icon: '🦇', bpm: 90, root: 55, mode: 'min', prog: [0, 6, 5, 6], lead: 'bell', arp: 'organ', drums: 'chill', seed: 97 },
];
const DRUMS = {
  pop: { kick: 'x.......x.x.....', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.' },
  chill: { kick: 'x.........x.....', snare: '....x.......x...', hat: '..x...x...x...x.' },
  fast: { kick: 'x...x...x...x...', snare: '....x.......x..x', hat: 'xxxxxxxxxxxxxxxx' },
  none: {},
};
function composeTune(def) {
  const rnd = seeded(def.seed), spb = 60 / def.bpm, s16 = spb / 4, bar = spb * 4;
  const scale = def.mode === 'maj' ? [0, 2, 4, 5, 7, 9, 11] : [0, 2, 3, 5, 7, 8, 10];
  const deg = d => def.root + scale[((d % 7) + 7) % 7] + 12 * Math.floor(d / 7);
  const ev = []; const bars = 26;
  const motif = () => { const m = []; let d = 4 + Math.floor(rnd() * 3); for (let i = 0; i < 8; i++) { if (rnd() < 0.18 && i % 2) { m.push(null); continue; } d += pick([-2, -1, -1, 0, 1, 1, 2, 3, -3]); d = clamp(d, 0, 11); m.push({ d, len: rnd() < 0.25 ? 2 : 1 }); } return m; };
  const A = [motif(), motif()], B = [motif(), motif()];
  const form = ['i', 'i', 'A', 'A', 'B', 'A', 'B', 'B', 'A', 'o'];
  for (let b = 0; b < bars; b++) {
    const t0 = b * bar, ch = def.prog[b % def.prog.length], sect = form[Math.min(form.length - 1, Math.floor(b / 3))];
    const vol = b >= bars - 2 ? 0.6 : 1;
    ev.push({ k: 'n', inst: 'bass', m: deg(ch) - 24, t: t0, d: spb * 1.8, v: 0.9 * vol }, { k: 'n', inst: 'bass', m: deg(ch) - 24 + (rnd() < 0.3 ? 12 : 0), t: t0 + spb * 2, d: spb * 1.8, v: 0.8 * vol });
    const tones = [deg(ch), deg(ch + 2), deg(ch + 4), deg(ch + 7)];
    for (let i = 0; i < 8; i++) ev.push({ k: 'n', inst: def.arp, m: tones[[0, 1, 2, 3, 2, 1, 2, 3][i]] - 12, t: t0 + i * spb / 2, d: spb / 2, v: 0.35 * vol });
    if (sect === 'A' || sect === 'B') {
      const mo = (sect === 'A' ? A : B)[b % 2];
      for (let i = 0; i < 8; i++) { const n = mo[i]; if (!n) continue; const d = i % 2 === 0 ? [ch, ch + 2, ch + 4, ch + 7].reduce((a, c) => Math.abs(c - n.d) < Math.abs(a - n.d) ? c : a) : n.d; ev.push({ k: 'n', inst: def.lead, m: deg(d) + 12, t: t0 + i * spb / 2, d: spb / 2 * n.len * 0.95, v: 0.75 * vol }); }
    }
    const pat = DRUMS[def.drums] || {};
    if (b > 0 && b < bars - 1) for (const kind in pat) for (let s = 0; s < 16; s++) if (pat[kind][s] === 'x') ev.push({ k: 'd', kind, t: t0 + s * s16, v: (s % 4 ? 0.7 : 1) * vol });
  }
  ev.push({ k: 'n', inst: def.arp, m: deg(def.prog[0]), t: bars * bar, d: spb * 3, v: 0.5 }, { k: 'n', inst: 'bass', m: deg(def.prog[0]) - 24, t: bars * bar, d: spb * 3, v: 0.7 });
  return { ev, len: bars * bar + spb * 4 };
}
const MUSIC_BLOCKED = /(^|\.)(spotify\.com|music\.apple\.com|itunes\.apple\.com|youtube\.com|youtu\.be|music\.youtube\.com|soundcloud\.com|tiktok\.com|deezer\.com|tidal\.com|pandora\.com|music\.amazon\.com|amazon\.com|instagram\.com)$/i;
function addLink(done) {
  const inp = h('input', { type: 'url', placeholder: 'https://…/song.mp3', autocapitalize: 'off', autocomplete: 'off' }), name = h('input', { type: 'text', placeholder: 'Song name (optional)' }), msg = h('div', { class: 'small mt' }), bar = h('i', { style: { width: '0%' } }), prog = h('div', { class: 'prog mt', hidden: true }, bar);
  let ctrl = null;
  const go = async () => {
    let u; try { u = new URL(inp.value.trim()); } catch (e) { msg.textContent = 'That doesn’t look like a web link.'; return; }
    if (!/^https?:$/.test(u.protocol)) { msg.textContent = 'Use a link that starts with https://'; return; }
    if (MUSIC_BLOCKED.test(u.hostname.replace(/^www\.|^m\./, ''))) { msg.innerHTML = ''; msg.append(h('div', { class: 'note-banner', style: { margin: 0 } }, '🚫 ' + u.hostname.replace(/^www\./, '') + ' songs are protected — other apps can’t save or play them, and the rules don’t allow it. Listen in that app instead, or use its own “download” button.')); return; }
    if (!navigator.onLine) { msg.textContent = 'You need internet to add a link.'; return; }
    const title = name.value.trim() || decodeURIComponent(u.pathname.split('/').pop() || 'Song').replace(/\.[^.]+$/, '').replace(/[_+]+/g, ' ') || 'Song';
    msg.textContent = 'Getting the song…'; prog.hidden = false; ctrl = new AbortController();
    try {
      const r = await fetch(u.href, { signal: ctrl.signal }); if (!r.ok) throw new Error('The website said ' + r.status + '.');
      const type = (r.headers.get('content-type') || '').split(';')[0];
      if (!/^audio\//.test(type) && !/\.(mp3|m4a|aac|wav|ogg|oga|opus|flac)(\?|$)/i.test(u.pathname)) throw new Error('That link is a web page, not a song file. Look for a link that ends in .mp3 or .m4a.');
      const total = +r.headers.get('content-length') || 0, rd = r.body.getReader(), parts = []; let got = 0;
      for (; ;) { const { done: d, value } = await rd.read(); if (d) break; parts.push(value); got += value.length; bar.style.width = total ? (100 * got / total) + '%' : Math.min(95, got / 1e5) + '%'; msg.textContent = 'Saving… ' + fmtSize(got) + (total ? ' of ' + fmtSize(total) : ''); }
      const blob = new Blob(parts, { type: /^audio\//.test(type) ? type : 'audio/mpeg' });
      const dur = await new Promise(res => { const a = new Audio(), x = URL.createObjectURL(blob); a.onloadedmetadata = () => { res(a.duration); URL.revokeObjectURL(x); }; a.onerror = () => res(0); a.src = x; setTimeout(() => res(0), 5000); });
      await DB.put('songs', { id: uid(), title, blob, type: blob.type, dur, size: blob.size, link: u.href, created: Date.now(), src: 'link' }); Sfx.good(); UI.toast('Saved for offline ✅'); s.close(); done && done();
    } catch (e) {
      prog.hidden = true;
      if (e.name === 'AbortError') { msg.textContent = 'Stopped.'; return; }
      if (e instanceof TypeError) {
        msg.textContent = 'Checking if it can play from the link…';
        const ok = await new Promise(res => { const a = new Audio(); a.preload = 'metadata'; a.onloadedmetadata = () => res(a.duration || 1); a.onerror = () => res(0); setTimeout(() => res(0), 9000); a.src = u.href; });
        if (!ok) { msg.textContent = 'That link doesn’t lead to a song I can play. Look for a link that ends in .mp3 or .m4a.'; return; }
        await DB.put('songs', { id: uid(), title, link: u.href, dur: isFinite(ok) ? ok : 0, created: Date.now(), src: 'link' }); UI.toast('Added as a web link — plays when you’re online 🔗'); s.close(); done && done(); return;
      }
      msg.textContent = e.message;
    }
  };
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  const s = UI.sheet({ title: 'Add a song from a link', onClose: () => ctrl && ctrl.abort(), body: h('div', { class: 'stack' }, inp, name, prog, msg), actions: [{ label: 'Cancel' }, { label: '🔗 Add', cls: 'pri', onClick: () => go() }] });
  if (navigator.clipboard && navigator.clipboard.readText) navigator.clipboard.readText().then(t => { if (/^https?:\/\//.test(t) && !inp.value) inp.value = t.trim(); }).catch(() => { });
}
const tuneCache = {};
async function renderTune(def) {
  if (tuneCache[def.id]) return tuneCache[def.id];
  const { ev, len } = composeTune(def);
  const blob = await Synth.render(len, (ctx, out) => { for (const e of ev) e.k === 'n' ? Synth.note(ctx, out, e.inst, MIDI(e.m), e.t, e.d, e.v) : Synth.drum(ctx, out, e.kind, e.t, e.v); }, 24000);
  return (tuneCache[def.id] = blob);
}
/* ---------- one player for the whole app (keeps playing while you use other apps) ---------- */
const Player = {
  audio: new Audio(), queue: [], idx: -1, url: null, shuffle: false, repeat: 'all', subs: new Set(), loading: false,
  get cur() { return this.queue[this.idx] || null; },
  on(f) { this.subs.add(f); return () => this.subs.delete(f); },
  emit() { this.subs.forEach(f => f()); this.paintMini(); },
  async playList(list, i) { this.queue = list; this.idx = i; await this.load(true); },
  async load(play) {
    const t = this.cur; if (!t) return; this.loading = true; this.emit();
    let blob = t.blob; if (!blob && !t.link && t.make) { try { blob = await t.make(); } catch (e) { UI.toast('Could not play that'); this.loading = false; return; } }
    if (this.cur !== t) return;
    if (this.url) URL.revokeObjectURL(this.url); this.url = null;
    if (t.link && !blob) { if (!navigator.onLine) UI.toast('This song is a web link — it needs internet'); this.audio.src = t.link; } else { this.url = URL.createObjectURL(blob); this.audio.src = this.url; }
    this.loading = false;
    if (play) { try { await this.audio.play(); } catch (e) { } }
    if ('mediaSession' in navigator) { try { navigator.mediaSession.metadata = new MediaMetadata({ title: t.title, artist: t.artist || 'Super One', album: 'Super One' }); } catch (e) { } }
    this.emit();
  },
  toggle() { if (!this.cur) return; if (this.audio.paused) this.audio.play().catch(() => { }); else this.audio.pause(); },
  next(auto) {
    if (!this.queue.length) return;
    if (auto && this.repeat === 'one') { this.audio.currentTime = 0; this.audio.play(); return; }
    if (this.shuffle && this.queue.length > 1) { let j; do { j = Math.floor(Math.random() * this.queue.length); } while (j === this.idx); this.idx = j; }
    else if (this.idx + 1 < this.queue.length) this.idx++; else if (auto && this.repeat === 'off') { this.emit(); return; } else this.idx = 0;
    this.load(true);
  },
  prev() { if (this.audio.currentTime > 3) { this.audio.currentTime = 0; return; } this.idx = (this.idx - 1 + this.queue.length) % this.queue.length; this.load(true); },
  stop() { this.audio.pause(); this.queue = []; this.idx = -1; if (this.url) URL.revokeObjectURL(this.url); this.url = null; this.audio.removeAttribute('src'); this.emit(); },
  paintMini() {
    const m = $('#mini'); if (!m) return; const show = !!this.cur && !(Shell.cur && Shell.cur.id === 'music');
    m.hidden = !show; document.body.classList.toggle('has-mini', show); if (!show) return;
    m.innerHTML = '';
    m.append(h('span', { style: { fontSize: '24px' } }, this.cur.icon || '🎵'), h('button', { class: 't', onclick: () => Shell.go('music') }, h('b', null, this.cur.title), h('small', null, this.loading ? 'Loading…' : this.audio.paused ? 'Paused' : 'Playing')),
      h('button', { class: 'ib', 'aria-label': this.audio.paused ? 'Play' : 'Pause', html: this.audio.paused ? SVG.play : SVG.pause, onclick: () => this.toggle() }),
      h('button', { class: 'ib', 'aria-label': 'Next', html: SVG.next, onclick: () => this.next() }),
      h('button', { class: 'ib', 'aria-label': 'Close player', html: SVG.close, onclick: () => this.stop() }));
  },
};
['play', 'pause', 'ended', 'loadedmetadata'].forEach(k => Player.audio.addEventListener(k, () => { if (k === 'ended') Player.next(true); else Player.emit(); }));
Player.audio.addEventListener('error', () => { if (Player.cur && Player.cur.link) UI.toast(navigator.onLine ? 'That link won’t play. It may have moved.' : 'Needs internet to play'); });
Player.audio.preload = 'auto'; Player.audio.setAttribute('playsinline', '');
if ('mediaSession' in navigator) { const ms = navigator.mediaSession; try { ms.setActionHandler('play', () => Player.toggle()); ms.setActionHandler('pause', () => Player.toggle()); ms.setActionHandler('nexttrack', () => Player.next()); ms.setActionHandler('previoustrack', () => Player.prev()); } catch (e) { } }
addEventListener('hashchange', () => setTimeout(() => Player.paintMini(), 0));

Apps.reg({
  id: 'music', name: 'Music', icon: '🎵', color: 'linear-gradient(135deg,#FF5E8A,#C2185B)', group: 'make', keys: 'songs player piano beats drums', blurb: 'Songs, piano and beats',
  mount(v, ctx) {
    let tab = Prefs.get('musicTab', 'songs'), cleanupTab = null;
    const now = h('div'), body = h('div');
    v.append(now, UI.tabs([['songs', '🎧 My songs'], ['tunes', '🎼 Built-in'], ['piano', '🎹 Piano'], ['beats', '🥁 Beats']], tab, t => { tab = t; Prefs.set('musicTab', t); show(); }), body);
    const paintNow = () => {
      now.innerHTML = ''; const c = Player.cur; if (!c) return;
      const a = Player.audio, dur = a.duration && isFinite(a.duration) ? a.duration : (c.dur || 0);
      const seek = h('input', { type: 'range', min: 0, max: Math.max(1, dur), step: 0.1, value: a.currentTime || 0, 'aria-label': 'Position', oninput: e => { a.currentTime = +e.target.value; } });
      const tl = h('div', { class: 'times' }, h('span', { id: 'mcur' }, fmtDur(a.currentTime)), h('span', null, fmtDur(dur)));
      now.append(h('div', { class: 'np mb' }, h('div', { class: 'row nw', style: { gap: '14px' } }, h('div', { class: 'art' }, c.icon || '🎵'), h('div', { style: { minWidth: 0, flex: 1 } }, h('b', null, c.title), h('small', null, Player.loading ? 'Getting it ready…' : (c.artist || 'Super One')))),
        h('div', { class: 'mt' }, seek, tl),
        h('div', { class: 'ctl' }, h('button', { class: 'tog' + (Player.shuffle ? ' on' : ''), 'aria-label': 'Shuffle', onclick: () => { Player.shuffle = !Player.shuffle; paintNow(); } }, '🔀'),
          h('button', { 'aria-label': 'Previous', html: SVG.prev, onclick: () => Player.prev() }),
          h('button', { class: 'big', 'aria-label': a.paused ? 'Play' : 'Pause', html: a.paused ? SVG.play : SVG.pause, onclick: () => Player.toggle() }),
          h('button', { 'aria-label': 'Next', html: SVG.next, onclick: () => Player.next() }),
          h('button', { class: 'tog' + (Player.repeat !== 'off' ? ' on' : ''), 'aria-label': 'Repeat', onclick: () => { Player.repeat = Player.repeat === 'all' ? 'one' : Player.repeat === 'one' ? 'off' : 'all'; paintNow(); } }, Player.repeat === 'one' ? '🔂' : '🔁'))));
      const upd = () => { if (!seek.isConnected) return; if (document.activeElement !== seek) seek.value = a.currentTime; const s = $('#mcur'); if (s) s.textContent = fmtDur(a.currentTime); };
      a.ontimeupdate = upd;
    };
    const offP = Player.on(paintNow); paintNow();
    function show() { if (cleanupTab) { cleanupTab(); cleanupTab = null; } body.innerHTML = ''; cleanupTab = ({ songs, tunes, piano, beats })[tab](body) || null; }
    function songs(el) {
      const list = h('div');
      const add = async () => {
        const files = await pickFiles('audio/*'); if (!files.length) return; let n = 0;
        for (const f of files) { const dur = await new Promise(r => { const a = new Audio(), u = URL.createObjectURL(f); a.onloadedmetadata = () => { r(a.duration); URL.revokeObjectURL(u); }; a.onerror = () => r(0); a.src = u; setTimeout(() => r(0), 5000); }); await DB.put('songs', { id: uid(), title: f.name.replace(/\.[^.]+$/, '').replace(/[_]+/g, ' '), blob: f, type: f.type, dur, size: f.size, created: Date.now(), src: 'import' }); n++; }
        UI.toast('Added ' + n + ' song' + (n > 1 ? 's' : '')); draw();
      };
      if (typeof Links !== 'undefined') el.append(Links.row('Music', '🎧 Your music apps'));
      el.append(h('div', { class: 'sec' }, '🎵 My songs'), h('div', { class: 'row mb' }, h('button', { class: 'btn pri', onclick: () => addLink(draw) }, '🔗 Add from a link'), h('button', { class: 'btn', onclick: add }, '＋ From Files')), h('p', { class: 'tiny muted', style: { margin: '-4px 2px 10px' } }, 'Paste a link to a song file (mp3, m4a…). I save it for offline if the website allows, or keep the link to play when you’re online.'), list);
      async function draw() {
        const all = (await DB.all('songs')).sort((a, b) => a.title.localeCompare(b.title)); list.innerHTML = '';
        if (!all.length) { list.append(UI.empty('🎧', 'No songs yet', 'Add music files from Files, or make your own with Piano or Beats and save them here.')); return; }
        const q = all.map(s => ({ id: s.id, title: s.title, blob: s.blob, link: s.link, dur: s.dur, icon: s.src === 'made' ? '🎹' : s.link && !s.blob ? '🔗' : '🎵', artist: s.src === 'made' ? 'Made by you' : s.link && !s.blob ? 'Web link · needs internet' : '' }));
        list.append(h('div', { class: 'list' }, all.map((s, i) => h('div', { class: 'li song' + (Player.cur && Player.cur.id === s.id ? ' playing' : '') },
          h('button', { class: 'ic', style: { border: 0 }, 'aria-label': 'Play ' + s.title, onclick: () => Player.playList(q, i) }, Player.cur && Player.cur.id === s.id && !Player.audio.paused ? '🔊' : (s.src === 'made' ? '🎹' : '🎵')),
          h('button', { class: 't', style: { border: 0, background: 'none', textAlign: 'left', padding: 0 }, onclick: () => Player.playList(q, i) }, h('b', null, s.title), h('small', null, (s.link && !s.blob ? '🔗 Web link · ' : '') + (s.dur ? fmtDur(s.dur) : '') + (s.size ? ' · ' + fmtSize(s.size) : ''))),
          h('button', { class: 'ib', 'aria-label': 'Song options', html: SVG.more, onclick: () => UI.menu(s.title, [
            { icon: '✏️', label: 'Rename', run: async () => { const t = await UI.prompt('Song name', { value: s.title }); if (t && t.trim()) { s.title = t.trim(); await DB.put('songs', s); draw(); } } },
            s.blob && { icon: '📤', label: 'Share or save', run: () => saveFile(s.blob, s.title + (s.type && s.type.includes('wav') ? '.wav' : s.type && s.type.includes('mp4') ? '.m4a' : '.mp3')) },
            { icon: '🗑️', label: 'Delete', danger: true, run: async () => { if (await UI.ask('Delete “' + s.title + '”?', { ok: 'Delete', danger: true })) { if (Player.cur && Player.cur.id === s.id) Player.stop(); await DB.del('songs', s.id); draw(); } } },
          ]) })))));
      }
      draw(); const off = Player.on(draw); return off;
    }
    function tunes(el) {
      const q = TUNES.map(t => ({ id: t.id, title: t.name, icon: t.icon, artist: 'Built-in tune · ' + t.bpm + ' bpm', make: () => renderTune(t) }));
      el.append(h('p', { class: 'small muted' }, 'Original tunes made right on your device — no internet needed.'),
        h('div', { class: 'grid2 w' }, TUNES.map((t, i) => h('button', { class: 'bigbtn', onclick: () => Player.playList(q, i) }, h('span', { class: 'e' }, t.icon), h('b', null, t.name), h('small', null, Synth.INST[t.lead] + ' · ' + t.bpm + ' bpm')))));
    }
    function piano(el) {
      let inst = Prefs.get('pianoInst', 'piano'), oct = 4, rec = null, take = null, playing = [];
      const c = Sfx.ctx(); if (!c) { el.append(UI.empty('🔇', 'Sound is not available')); return; }
      const out = c.createGain(); out.gain.value = 0.9; out.connect(c.destination);
      const kb = h('div', { class: 'piano', role: 'group', 'aria-label': 'Piano keys' });
      const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const held = new Map();
      const keyEls = [];
      const build = () => {
        kb.innerHTML = ''; keyEls.length = 0; const whites = []; const base = 12 * (oct + 1);
        for (let i = 0; i < 25; i++) { const m = base + i, n = names[m % 12]; if (!n.includes('#')) whites.push(m); }
        const W = 100 / whites.length;
        whites.forEach((m, i) => { const k = h('div', { class: 'w', 'data-m': m }, names[m % 12] === 'C' ? 'C' + (Math.floor(m / 12) - 1) : ''); kb.append(k); keyEls.push(k); });
        whites.forEach((m, i) => { if (names[(m + 1) % 12].includes('#') && i < whites.length - 1) { const k = h('div', { class: 'b', 'data-m': m + 1, style: { left: (W * (i + 1) - W * 0.32) + '%', width: (W * 0.64) + '%' } }); kb.append(k); keyEls.push(k); } });
      };
      const down = (m, el) => { if (held.has(m)) return; const t = c.currentTime; held.set(m, { stop: Synth.note(c, out, inst, MIDI(m), t, null, 1), el, t }); el.classList.add('on'); if (rec) rec.push({ m, t: performance.now() - rec.start, d: 0 }); };
      const up = m => { const x = held.get(m); if (!x) return; x.stop(c.currentTime); x.el.classList.remove('on'); held.delete(m); if (rec) { for (let i = rec.length - 1; i >= 0; i--) if (rec[i].m === m && !rec[i].d) { rec[i].d = Math.max(80, performance.now() - rec.start - rec[i].t); break; } } };
      const ptr = new Map();
      const hit = (x, y) => { const e = document.elementFromPoint(x, y); return e && e.dataset && e.dataset.m ? e : null; };
      kb.addEventListener('pointerdown', e => { e.preventDefault(); kb.setPointerCapture && kb.setPointerCapture(e.pointerId); const k = hit(e.clientX, e.clientY); if (k) { ptr.set(e.pointerId, +k.dataset.m); down(+k.dataset.m, k); } });
      kb.addEventListener('pointermove', e => { if (!ptr.has(e.pointerId)) return; const k = hit(e.clientX, e.clientY); const m = k ? +k.dataset.m : null; const old = ptr.get(e.pointerId); if (m !== old) { if (old != null) up(old); if (k) down(m, k); ptr.set(e.pointerId, m); } });
      const lift = e => { const m = ptr.get(e.pointerId); if (m != null) up(m); ptr.delete(e.pointerId); };
      kb.addEventListener('pointerup', lift); kb.addEventListener('pointercancel', lift);
      const keymap = 'awsedftgyhujkolp;'; const kd = e => { if (e.repeat || e.target.tagName === 'INPUT') return; const i = keymap.indexOf(e.key); if (i >= 0) { const m = 12 * (oct + 1) + i; const k = keyEls.find(x => +x.dataset.m === m); if (k) down(m, k); } };
      const ku = e => { const i = keymap.indexOf(e.key); if (i >= 0) up(12 * (oct + 1) + i); };
      addEventListener('keydown', kd); addEventListener('keyup', ku);
      const recBtn = h('button', { class: 'btn' }, '⏺ Record'), playBtn = h('button', { class: 'btn', disabled: true }, '▶ Play back'), saveBtn = h('button', { class: 'btn', disabled: true }, '💾 Save as song');
      recBtn.onclick = () => { if (rec) { take = rec; rec = null; take.forEach(n => n.d = n.d || 300); recBtn.textContent = '⏺ Record'; recBtn.classList.remove('bad'); playBtn.disabled = saveBtn.disabled = !take.length; UI.toast(take.length + ' notes recorded'); } else { rec = []; rec.start = performance.now(); rec.inst = inst; recBtn.textContent = '⏹ Stop'; recBtn.classList.add('bad'); } };
      playBtn.onclick = () => { playing.forEach(f => f(c.currentTime)); const t0 = c.currentTime + 0.05; playing = take.map(n => Synth.note(c, out, take.inst, MIDI(n.m), t0 + n.t / 1000, n.d / 1000)); };
      saveBtn.onclick = async () => {
        const name = await UI.prompt('Name your song', { value: 'My melody ' + new Date().toLocaleDateString() }); if (!name) return;
        const len = Math.max(...take.map(n => (n.t + n.d) / 1000)) + 2.5;
        const blob = await Synth.render(len, (ctx, o) => take.forEach(n => Synth.note(ctx, o, take.inst, MIDI(n.m), 0.2 + n.t / 1000, n.d / 1000)));
        await DB.put('songs', { id: uid(), title: name, blob, type: 'audio/wav', dur: len, size: blob.size, created: Date.now(), src: 'made' }); UI.toast('Saved to My songs');
      };
      const instSel = h('select', { 'aria-label': 'Sound', onchange: e => { inst = e.target.value; Prefs.set('pianoInst', inst); } }, Object.entries(Synth.INST).map(([k, n]) => h('option', { value: k, selected: k === inst }, n)));
      el.append(h('div', { class: 'row' }, h('div', { style: { flex: 1, minWidth: '140px' } }, instSel), h('button', { class: 'btn', onclick: () => { oct = Math.max(2, oct - 1); build(); } }, '◀ Lower'), h('button', { class: 'btn', onclick: () => { oct = Math.min(6, oct + 1); build(); } }, 'Higher ▶')),
        kb, h('div', { class: 'row mt' }, recBtn, playBtn, saveBtn), h('p', { class: 'tiny muted mt' }, 'Use many fingers at once. On a keyboard, the letters A W S E D F T G Y H U J K play the keys.'));
      build();
      return () => { removeEventListener('keydown', kd); removeEventListener('keyup', ku); held.forEach((x, m) => up(m)); playing.forEach(f => f(c.currentTime)); };
    }
    function beats(el) {
      const ROWS = [['kick', 'Kick'], ['snare', 'Snare'], ['hat', 'Hi-hat'], ['open', 'Open hat'], ['clap', 'Clap'], ['tom', 'Tom'], ['bell', 'Cowbell']];
      const PRESETS = { 'Basic rock': { kick: 'x.......x.x.....', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.' }, 'Hip hop': { kick: 'x.....x...x.....', snare: '....x.......x...', hat: 'x.xxx.x.x.xxx.x.', clap: '............x...' }, 'Dance': { kick: 'x...x...x...x...', open: '..x...x...x...x.', clap: '....x.......x...', hat: 'xxxxxxxxxxxxxxxx' }, 'Funky': { kick: 'x..x..x...x..x..', snare: '....x..x.x..x...', hat: 'x.x.x.x.x.x.x.x.', bell: 'x.....x.....x...' }, 'Empty': {} };
      let pat = Prefs.get('beat', null) || JSON.parse(JSON.stringify(PRESETS['Basic rock'])); let bpm = Prefs.get('bpm', 100), step = 0, timer = null, nextT = 0;
      for (const [k] of ROWS) pat[k] = (pat[k] || '................').padEnd(16, '.').slice(0, 16);
      const grid = h('div', { class: 'beat' }); const cells = {};
      const draw = () => { grid.innerHTML = ''; for (const [k, label] of ROWS) { grid.append(h('div', { class: 'lab' }, label)); cells[k] = []; for (let s = 0; s < 16; s++) { const b = h('button', { class: 'st' + (s % 4 === 0 ? ' q' : '') + (pat[k][s] === 'x' ? ' on' : ''), 'aria-label': label + ' step ' + (s + 1), onclick: () => { pat[k] = pat[k].slice(0, s) + (pat[k][s] === 'x' ? '.' : 'x') + pat[k].slice(s + 1); b.classList.toggle('on'); Prefs.set('beat', pat); if (!timer) Synth.drum(Sfx.ctx(), Sfx.ctx().destination, k, Sfx.ctx().currentTime); } }); cells[k].push(b); grid.append(b); } } };
      const c = Sfx.ctx();
      const tick = () => { const s16 = 60 / bpm / 4; while (nextT < c.currentTime + 0.12) { for (const [k] of ROWS) if (pat[k][step] === 'x') Synth.drum(c, c.destination, k, nextT); const st = step; setTimeout(() => { $$('.st.now', grid).forEach(x => x.classList.remove('now')); for (const [k] of ROWS) cells[k] && cells[k][st] && cells[k][st].classList.add('now'); }, Math.max(0, (nextT - c.currentTime) * 1000)); nextT += s16; step = (step + 1) % 16; } };
      const playBtn = h('button', { class: 'btn pri' }, '▶ Play');
      playBtn.onclick = () => { if (timer) { clearInterval(timer); timer = null; playBtn.textContent = '▶ Play'; $$('.st.now', grid).forEach(x => x.classList.remove('now')); } else { step = 0; nextT = c.currentTime + 0.05; timer = setInterval(tick, 25); tick(); playBtn.textContent = '⏹ Stop'; } };
      const tempo = h('input', { type: 'range', min: 60, max: 180, value: bpm, 'aria-label': 'Tempo' }), tl = h('b', null, bpm + ' bpm');
      tempo.oninput = () => { bpm = +tempo.value; tl.textContent = bpm + ' bpm'; Prefs.set('bpm', bpm); };
      const preset = h('select', { 'aria-label': 'Preset', onchange: e => { pat = JSON.parse(JSON.stringify(PRESETS[e.target.value])); for (const [k] of ROWS) pat[k] = (pat[k] || '................'); Prefs.set('beat', pat); draw(); } }, h('option', { value: '', disabled: true, selected: true }, 'Start from…'), Object.keys(PRESETS).map(k => h('option', { value: k }, k)));
      const saveBtn = h('button', { class: 'btn', onclick: async () => {
        const name = await UI.prompt('Name your beat', { value: 'My beat ' + new Date().toLocaleDateString() }); if (!name) return;
        const s16 = 60 / bpm / 4, loops = 8, len = loops * 16 * s16 + 1;
        const blob = await Synth.render(len, (ctx, o) => { for (let l = 0; l < loops; l++) for (let s = 0; s < 16; s++) for (const [k] of ROWS) if (pat[k][s] === 'x') Synth.drum(ctx, o, k, (l * 16 + s) * s16); });
        await DB.put('songs', { id: uid(), title: name, blob, type: 'audio/wav', dur: len, size: blob.size, created: Date.now(), src: 'made' }); UI.toast('Saved to My songs');
      } }, '💾 Save as song');
      el.append(h('div', { class: 'row' }, playBtn, h('div', { style: { flex: 1, minWidth: '120px' } }, preset)), h('div', { class: 'row mt nw' }, h('span', { class: 'small' }, 'Speed'), tempo, tl), grid, h('div', { class: 'row mt' }, saveBtn, h('button', { class: 'btn ghost', onclick: () => { for (const [k] of ROWS) pat[k] = '................'; Prefs.set('beat', pat); draw(); } }, 'Clear')));
      draw();
      return () => { if (timer) clearInterval(timer); };
    }
    show();
    return () => { offP(); if (cleanupTab) cleanupTab(); Player.audio.ontimeupdate = null; };
  },
});

/* ---- 22-memos.js ---- */
/* ===== Voice memos ===== */
addCSS(`
.recbox{text-align:center;padding:18px 16px 20px}
.recbox canvas{width:100%;height:70px;display:block}
.rectime{font-size:42px;font-weight:800;font-variant-numeric:tabular-nums;font-family:var(--round);margin:6px 0 10px}
.recbtn{width:84px;height:84px;border-radius:50%;border:5px solid var(--line);background:var(--surface);display:inline-grid;place-items:center;padding:0}
.recbtn i{display:block;width:62px;height:62px;border-radius:31px;background:#FF3B30;transition:all .2s}
.recbtn.on i{width:34px;height:34px;border-radius:8px}
.memo .pbar{height:4px;border-radius:2px;background:var(--surface2);margin-top:6px;overflow:hidden}
.memo .pbar i{display:block;height:100%;width:0;background:var(--accent)}
`);
Apps.reg({
  id: 'memos', name: 'Voice Memos', icon: '🎙️', color: 'linear-gradient(135deg,#FF6B6B,#B5179E)', group: 'make', keys: 'record voice audio microphone', blurb: 'Record your voice',
  mount(v, ctx) {
    let rec = null, stream = null, chunks = [], t0 = 0, acc = 0, timer = null, raf = null, an = null, src = null;
    const audio = new Audio(); audio.setAttribute('playsinline', ''); let playing = null, speed = 1;
    const cv = h('canvas', { width: 600, height: 70 }), time = h('div', { class: 'rectime' }, '0:00');
    const btn = h('button', { class: 'recbtn', 'aria-label': 'Start recording' }, h('i'));
    const pauseB = h('button', { class: 'btn sm', hidden: true }, '⏸ Pause');
    const hint = h('p', { class: 'small muted', style: { margin: '10px 0 0' } }, 'Tap the red button to record.');
    const list = h('div');
    v.append(h('div', { class: 'card recbox' }, cv, time, btn, h('div', { class: 'row', style: { justifyContent: 'center', marginTop: '10px' } }, pauseB), hint), h('div', { class: 'sec' }, 'Recordings'), list);
    const g = cv.getContext('2d');
    const drawWave = () => {
      const W = cv.width, H = cv.height; g.clearRect(0, 0, W, H); const col = getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#4F46E5';
      let lvl = new Uint8Array(64); if (an) an.getByteFrequencyData(lvl);
      for (let i = 0; i < 64; i++) { const v2 = an ? lvl[i] / 255 : 0.04; const bh = Math.max(3, v2 * H * 0.95); g.fillStyle = rec && rec.state === 'recording' ? '#FF3B30' : col; g.globalAlpha = 0.35 + v2 * 0.65; g.fillRect(i * (W / 64) + 2, (H - bh) / 2, W / 64 - 4, bh); }
      g.globalAlpha = 1; raf = requestAnimationFrame(drawWave);
    };
    drawWave();
    const elapsed = () => acc + (rec && rec.state === 'recording' ? (performance.now() - t0) / 1000 : 0);
    const pickType = () => { for (const t of ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg']) if (window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) return t; return ''; };
    async function start() {
      if (!window.MediaRecorder) { UI.toast('Recording is not supported on this device'); return; }
      try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); }
      catch (e) { hint.textContent = '🎤 I need the microphone. Allow it when asked (or in Settings → Safari → Microphone).'; return; }
      const c = Sfx.ctx(); if (c) { src = c.createMediaStreamSource(stream); an = c.createAnalyser(); an.fftSize = 128; src.connect(an); }
      const type = pickType(); rec = new MediaRecorder(stream, type ? { mimeType: type } : undefined); chunks = []; acc = 0; t0 = performance.now();
      rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
      rec.onstop = save; rec.start(1000);
      btn.classList.add('on'); btn.setAttribute('aria-label', 'Stop recording'); hint.textContent = 'Recording… tap the square to stop.'; pauseB.hidden = !rec.pause;
      timer = setInterval(() => time.textContent = fmtDur(elapsed()), 250);
    }
    function stop() { if (!rec) return; acc = elapsed(); try { rec.stop(); } catch (e) { } }
    async function save() {
      clearInterval(timer); const dur = acc; const type = (rec && rec.mimeType) || pickType() || 'audio/webm';
      stream && stream.getTracks().forEach(t => t.stop()); try { src && src.disconnect(); } catch (e) { } an = null; src = null; stream = null; rec = null;
      btn.classList.remove('on'); btn.setAttribute('aria-label', 'Start recording'); pauseB.hidden = true; pauseB.textContent = '⏸ Pause'; time.textContent = '0:00'; hint.textContent = 'Tap the red button to record.';
      if (!chunks.length || dur < 0.5) { UI.toast('Too short — try again'); return; }
      const blob = new Blob(chunks, { type }); const n = (await DB.count('memos')) + 1;
      await DB.put('memos', { id: uid(), name: 'Memo ' + n, blob, type, dur, size: blob.size, created: Date.now() }); UI.toast('Saved'); draw();
    }
    btn.onclick = () => rec ? stop() : start();
    pauseB.onclick = () => { if (!rec) return; if (rec.state === 'recording') { acc = elapsed(); rec.pause(); pauseB.textContent = '⏺ Resume'; hint.textContent = 'Paused.'; } else { t0 = performance.now(); rec.resume(); pauseB.textContent = '⏸ Pause'; hint.textContent = 'Recording…'; } };
    async function draw() {
      const all = (await DB.all('memos')).sort((a, b) => b.created - a.created); list.innerHTML = '';
      if (!all.length) { list.append(UI.empty('🎙️', 'No recordings yet', 'Your voice memos will show up here.')); return; }
      list.append(h('div', { class: 'list' }, all.map(m => {
        const bar = h('i'), isP = playing === m.id;
        const pb = h('button', { class: 'ic', style: { border: 0 }, 'aria-label': isP && !audio.paused ? 'Pause' : 'Play' }, isP && !audio.paused ? '⏸' : '▶️');
        pb.onclick = () => { if (playing === m.id) { audio.paused ? audio.play() : audio.pause(); } else { if (audio.src) URL.revokeObjectURL(audio.src); audio.src = URL.createObjectURL(m.blob); audio.playbackRate = speed; audio.play().catch(() => UI.toast('This recording can’t play on this device')); playing = m.id; } setTimeout(draw, 50); };
        if (isP) audio.ontimeupdate = () => { bar.style.width = (100 * audio.currentTime / (m.dur || audio.duration || 1)) + '%'; };
        return h('div', { class: 'li memo' }, pb, h('div', { class: 't' }, h('b', null, m.name), h('small', null, fmtDay(new Date(m.created)) + ' · ' + fmtTime(new Date(m.created)) + ' · ' + fmtDur(m.dur)), isP ? h('div', { class: 'pbar' }, bar) : null),
          isP ? h('button', { class: 'btn sm', onclick: () => { speed = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1; audio.playbackRate = speed; draw(); } }, speed + '×') : null,
          h('button', { class: 'ib', 'aria-label': 'Memo options', html: SVG.more, onclick: () => UI.menu(m.name, [
            { icon: '✏️', label: 'Rename', run: async () => { const t = await UI.prompt('Name', { value: m.name }); if (t && t.trim()) { m.name = t.trim(); await DB.put('memos', m); draw(); } } },
            { icon: '📤', label: 'Share or save', run: () => saveFile(m.blob, m.name + (m.type.includes('mp4') ? '.m4a' : m.type.includes('ogg') ? '.ogg' : '.webm')) },
            { icon: '🗑️', label: 'Delete', danger: true, run: async () => { if (await UI.ask('Delete “' + m.name + '”?', { ok: 'Delete', danger: true })) { if (playing === m.id) { audio.pause(); playing = null; } await DB.del('memos', m.id); draw(); } } },
          ]) }));
      })));
    }
    audio.onended = () => { playing = null; draw(); };
    draw();
    return () => { cancelAnimationFrame(raf); if (rec) stop(); clearInterval(timer); audio.pause(); if (audio.src) URL.revokeObjectURL(audio.src); stream && stream.getTracks().forEach(t => t.stop()); };
  },
});

/* ---- 23-studio.js ---- */
/* ===== Studio: draw, edit photos, filters ===== */
addCSS(`
.studio{display:flex;flex-direction:column;gap:8px;padding:0 var(--gutr) 12px var(--gut)}
.easel{display:flex;justify-content:center;align-items:center;background:var(--surface2);border-radius:16px;padding:8px;min-height:240px;position:relative;touch-action:none}
.easel canvas{max-width:100%;max-height:58vh;max-height:58dvh;touch-action:none;border-radius:4px;box-shadow:0 2px 10px rgba(0,0,0,.18);background-color:#fff;background-image:linear-gradient(45deg,#ddd 25%,transparent 25%,transparent 75%,#ddd 75%),linear-gradient(45deg,#ddd 25%,transparent 25%,transparent 75%,#ddd 75%);background-size:16px 16px;background-position:0 0,8px 8px}
.easel .ovl{position:absolute;pointer-events:none}
.tools{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding:2px}
.tools::-webkit-scrollbar{display:none}
.tool{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:1px;border:1px solid var(--line);background:var(--surface);border-radius:12px;padding:6px 8px;min-width:56px;font-size:11px;font-weight:650}
.tool span{font-size:22px;line-height:1.1}
.tool[aria-pressed="true"]{border-color:var(--accent);background:var(--accent-soft)}
.colors{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;align-items:center;padding:2px}
.colors::-webkit-scrollbar{display:none}
.colors .swatch{flex:0 0 auto;width:30px;height:30px}
.fthumbs{display:flex;gap:8px;overflow-x:auto;padding:4px 0 8px}
.fthumb{flex:0 0 auto;border:2px solid transparent;background:none;border-radius:12px;padding:2px;display:flex;flex-direction:column;align-items:center;gap:2px;font-size:12px;font-weight:650}
.fthumb canvas{width:72px;height:72px;border-radius:9px;object-fit:cover;display:block}
.fthumb[aria-pressed="true"]{border-color:var(--accent)}
.stickers{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px}
.stickers button{font-size:30px;border:0;background:var(--surface2);border-radius:12px;aspect-ratio:1/1}
`);
const Filters = {
  each(d, f) { const a = d.data; for (let i = 0; i < a.length; i += 4) { const o = f(a[i], a[i + 1], a[i + 2]); a[i] = o[0]; a[i + 1] = o[1]; a[i + 2] = o[2]; } return d; },
  adjust(d, { b = 0, c = 0, s = 0, w = 0 } = {}) {
    const cf = (259 * (c + 255)) / (255 * (259 - c)), sf = 1 + s / 100;
    return this.each(d, (r, g, bl) => {
      r += b; g += b; bl += b; r = cf * (r - 128) + 128; g = cf * (g - 128) + 128; bl = cf * (bl - 128) + 128;
      const L = 0.299 * r + 0.587 * g + 0.114 * bl; r = L + (r - L) * sf; g = L + (g - L) * sf; bl = L + (bl - L) * sf;
      r += w; bl -= w; return [r, g, bl];
    });
  },
  gray: d => Filters.each(d, (r, g, b) => { const L = 0.299 * r + 0.587 * g + 0.114 * b; return [L, L, L]; }),
  sepia: d => Filters.each(d, (r, g, b) => [r * .393 + g * .769 + b * .189, r * .349 + g * .686 + b * .168, r * .272 + g * .534 + b * .131]),
  invert: d => Filters.each(d, (r, g, b) => [255 - r, 255 - g, 255 - b]),
  fade: d => Filters.each(d, (r, g, b) => [r * .82 + 40, g * .82 + 38, b * .82 + 44]),
  poster: (d, n = 4) => { const st = 255 / (n - 1); return Filters.each(d, (r, g, b) => [Math.round(r / st) * st, Math.round(g / st) * st, Math.round(b / st) * st]); },
  vignette(d, k = 0.55) { const W = d.width, H = d.height, a = d.data, cx = W / 2, cy = H / 2, mx = Math.hypot(cx, cy); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const f = 1 - k * Math.pow(Math.hypot(x - cx, y - cy) / mx, 2), i = (y * W + x) * 4; a[i] *= f; a[i + 1] *= f; a[i + 2] *= f; } return d; },
  pixel(d) { const W = d.width, H = d.height, a = d.data, s = Math.max(4, Math.round(Math.max(W, H) / 64)); for (let y = 0; y < H; y += s) for (let x = 0; x < W; x += s) { let r = 0, g = 0, b = 0, n = 0; for (let yy = y; yy < Math.min(H, y + s); yy++) for (let xx = x; xx < Math.min(W, x + s); xx++) { const i = (yy * W + xx) * 4; r += a[i]; g += a[i + 1]; b += a[i + 2]; n++; } r /= n; g /= n; b /= n; for (let yy = y; yy < Math.min(H, y + s); yy++) for (let xx = x; xx < Math.min(W, x + s); xx++) { const i = (yy * W + xx) * 4; a[i] = r; a[i + 1] = g; a[i + 2] = b; } } return d; },
  blur(d, rad) {
    const W = d.width, H = d.height, a = d.data, t = new Float32Array(a.length); rad = rad || Math.max(2, Math.round(Math.max(W, H) / 250));
    for (let pass = 0; pass < 2; pass++) {
      for (let y = 0; y < H; y++) { let r = 0, g = 0, b = 0; for (let x = -rad; x <= rad; x++) { const i = (y * W + clamp(x, 0, W - 1)) * 4; r += a[i]; g += a[i + 1]; b += a[i + 2]; } for (let x = 0; x < W; x++) { const o = (y * W + x) * 4, n = 2 * rad + 1; t[o] = r / n; t[o + 1] = g / n; t[o + 2] = b / n; const i1 = (y * W + clamp(x - rad, 0, W - 1)) * 4, i2 = (y * W + clamp(x + rad + 1, 0, W - 1)) * 4; r += a[i2] - a[i1]; g += a[i2 + 1] - a[i1 + 1]; b += a[i2 + 2] - a[i1 + 2]; } }
      for (let x = 0; x < W; x++) { let r = 0, g = 0, b = 0; for (let y = -rad; y <= rad; y++) { const i = (clamp(y, 0, H - 1) * W + x) * 4; r += t[i]; g += t[i + 1]; b += t[i + 2]; } for (let y = 0; y < H; y++) { const o = (y * W + x) * 4, n = 2 * rad + 1; a[o] = r / n; a[o + 1] = g / n; a[o + 2] = b / n; const i1 = (clamp(y - rad, 0, H - 1) * W + x) * 4, i2 = (clamp(y + rad + 1, 0, H - 1) * W + x) * 4; r += t[i2] - t[i1]; g += t[i2 + 1] - t[i1 + 1]; b += t[i2 + 2] - t[i1 + 2]; } }
    }
    return d;
  },
  sharpen(d) { const W = d.width, H = d.height, s = new Uint8ClampedArray(d.data), a = d.data; for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) for (let c = 0; c < 3; c++) { const i = (y * W + x) * 4 + c; a[i] = 5 * s[i] - s[i - 4] - s[i + 4] - s[i - W * 4] - s[i + W * 4]; } return d; },
  PRESETS: [
    ['none', 'Original', d => d], ['bw', 'B&W', d => Filters.gray(d)], ['noir', 'Noir', d => Filters.adjust(Filters.gray(d), { c: 60, b: -10 })],
    ['sepia', 'Sepia', d => Filters.sepia(d)], ['vintage', 'Vintage', d => Filters.vignette(Filters.fade(Filters.sepia(d)), 0.4)], ['vivid', 'Vivid', d => Filters.adjust(d, { c: 25, s: 45 })],
    ['warm', 'Warm', d => Filters.adjust(d, { w: 28, s: 10 })], ['cool', 'Cool', d => Filters.adjust(d, { w: -28 })], ['fade', 'Faded', d => Filters.fade(d)],
    ['pop', 'Pop art', d => Filters.poster(Filters.adjust(d, { s: 70, c: 30 }), 4)], ['invert', 'Invert', d => Filters.invert(d)], ['pixel', 'Pixel', d => Filters.pixel(d)],
    ['blur', 'Soft blur', d => Filters.blur(d)], ['sharp', 'Sharpen', d => Filters.sharpen(d)], ['vig', 'Spotlight', d => Filters.vignette(d, 0.7)],
  ],
};
const STICKERS = '😀😂🥰😎🤩🥳😜🤔😴🤯👻💀👽🤖🎃⭐🌟✨🔥💧🌈☀️🌙⚡❤️🧡💛💚💙💜🖤👍👏🙌✌️💪👑🎉🎈🎁🏆⚽🏀🎮🎧🎸🍕🍔🍟🍩🍦🍓🐶🐱🦊🐼🐸🦄🐉🌸🌻🍀🚀✈️🚗🏠'.match(/\p{Extended_Pictographic}️?/gu);
Apps.reg({
  id: 'studio', name: 'Studio', icon: '🎨', color: 'linear-gradient(135deg,#F9D423,#FF4E50)', group: 'make', keys: 'draw paint photo edit filter art sketch', blurb: 'Draw and edit photos',
  mount(v, ctx) {
    let cleanup = null;
    const home = async () => {
      if (cleanup) { cleanup(); cleanup = null; }
      v.innerHTML = ''; ctx.full(false); ctx.setTitle('Studio'); ctx.setBack(null); ctx.setActions();
      const SIZES = [['Square', 1080, 1080, '⬛'], ['Tall', 1080, 1440, '📱'], ['Wide', 1440, 1080, '🖥️']];
      v.append(h('div', { class: 'sec', style: { marginTop: '4px' } }, 'Start something new'),
        h('div', { class: 'grid3' }, SIZES.map(([n, w, ht, e]) => h('button', { class: 'bigbtn', onclick: () => editor({ w, h: ht, bg: '#FFFFFF' }) }, h('span', { class: 'e' }, e), h('b', null, n), h('small', null, 'Blank page')))),
        h('div', { class: 'grid2 mt' },
          h('button', { class: 'bigbtn', onclick: async () => { const [f] = await pickFiles('image/*', { multiple: false }); if (f) editor({ blob: f, name: 'Edited photo', kind: 'photo' }); } }, h('span', { class: 'e' }, '🖼️'), h('b', null, 'Edit a photo'), h('small', null, 'Filters, crop, draw on it')),
          h('button', { class: 'bigbtn', onclick: () => editor({ w: 1080, h: 1080, bg: '#11131A', name: 'Night drawing' }) }, h('span', { class: 'e' }, '🌌'), h('b', null, 'Dark page'), h('small', null, 'Bright colors pop'))));
      const mine = (await DB.all('media')).filter(m => m.kind === 'drawing' || m.edited).sort((a, b) => (b.updated || b.created) - (a.updated || a.created));
      if (mine.length) v.append(h('div', { class: 'sec' }, 'Your art'), h('div', { class: 'gal' }, mine.map(m => h('button', { 'aria-label': 'Open ' + (m.name || 'drawing'), onclick: () => editor({ blob: m.blob, id: m.id, name: m.name, kind: m.kind }) }, m.thumb ? h('img', { src: m.thumb, alt: '' }) : '🎨'))));
      const pics = (await DB.all('media')).filter(m => m.kind === 'photo').sort((a, b) => b.created - a.created).slice(0, 12);
      if (pics.length) v.append(h('div', { class: 'sec' }, 'Edit from your Photos'), h('div', { class: 'gal' }, pics.map(m => h('button', { 'aria-label': 'Edit photo', onclick: () => editor({ blob: m.blob, name: 'Edited photo', kind: 'photo' }) }, m.thumb ? h('img', { src: m.thumb, alt: '' }) : '🖼️'))));
    };
    async function editor(opt) {
      v.innerHTML = ''; ctx.full(true); ctx.setTitle(opt.name || 'Drawing'); ctx.setBack(() => { if (dirty) { UI.ask('Leave without saving?', { ok: 'Leave', danger: true }).then(ok => ok && home()); return true; } home(); return true; });
      const cv = h('canvas'), g = cv.getContext('2d', { willReadFrequently: true });
      const orig = h('canvas'), go = orig.getContext('2d', { willReadFrequently: true });
      const isPhoto = !!opt.blob && opt.kind !== 'drawing';
      let bg = opt.bg || '#FFFFFF';
      if (opt.blob) {
        const img = await new Promise((res, rej) => { const i = new Image(), u = URL.createObjectURL(opt.blob); i.onload = () => { res(i); URL.revokeObjectURL(u); }; i.onerror = rej; i.src = u; }).catch(() => null);
        if (!img) { UI.toast('Could not open that picture'); return home(); }
        const k = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight)); cv.width = orig.width = Math.round(img.naturalWidth * k); cv.height = orig.height = Math.round(img.naturalHeight * k);
        g.drawImage(img, 0, 0, cv.width, cv.height);
      } else { cv.width = orig.width = opt.w; cv.height = orig.height = opt.h; g.fillStyle = bg; g.fillRect(0, 0, cv.width, cv.height); }
      go.drawImage(cv, 0, 0);
      let tool = 'brush', color = opt.bg === '#11131A' ? '#FFD84D' : '#1E1E2E', size = 12, dirty = false, hue = 0;
      const undo = [], redo = []; const snap = () => ({ main: g.getImageData(0, 0, cv.width, cv.height), orig: go.getImageData(0, 0, orig.width, orig.height) });
      const push = () => { undo.push(snap()); if (undo.length > 8) undo.shift(); redo.length = 0; dirty = true; paintUndo(); };
      const restore = s => { cv.width = orig.width = s.main.width; cv.height = orig.height = s.main.height; g.putImageData(s.main, 0, 0); go.putImageData(s.orig, 0, 0); };
      const undoB = h('button', { class: 'ib', 'aria-label': 'Undo', onclick: () => { if (!undo.length) return; redo.push(snap()); restore(undo.pop()); paintUndo(); } }, '↩️');
      const redoB = h('button', { class: 'ib', 'aria-label': 'Redo', onclick: () => { if (!redo.length) return; undo.push(snap()); restore(redo.pop()); paintUndo(); } }, '↪️');
      const paintUndo = () => { undoB.style.opacity = undo.length ? 1 : .35; redoB.style.opacity = redo.length ? 1 : .35; };
      const save = async () => {
        let rec;
        if (opt.id) rec = await Media.addCanvas(cv, opt.name, opt.kind || 'drawing', opt.id);
        else { rec = await Media.addCanvas(cv, opt.name || 'Drawing', isPhoto ? 'photo' : 'drawing'); if (isPhoto) { rec.edited = true; await DB.put('media', rec); } opt.id = rec.id; opt.kind = rec.kind; }
        dirty = false; UI.toast('Saved to Photos 🎉');
      };
      ctx.setActions(undoB, redoB, h('button', { class: 'btn pri sm', onclick: save }, 'Save'));
      const easel = h('div', { class: 'easel' }, cv); const ovl = h('canvas', { class: 'ovl' }); easel.append(ovl);
      const TOOLS = [['brush', '✏️', 'Pen'], ['marker', '🖍️', 'Marker'], ['spray', '💨', 'Spray'], ['rainbow', '🌈', 'Rainbow'], ['eraser', '🧽', 'Eraser'], ['fill', '🪣', 'Fill'], ['line', '📏', 'Line'], ['rect', '⬜', 'Box'], ['circle', '⭕', 'Circle'], ['text', '🔤', 'Text'], ['sticker', '😀', 'Sticker'], ['fx', '🎛️', 'Filters'], ['crop', '✂️', 'Crop'], ['rotate', '🔄', 'Turn'], ['flip', '↔️', 'Flip'], ['share', '📤', 'Share']];
      const toolsEl = h('div', { class: 'tools', role: 'toolbar' });
      const drawTools = () => { toolsEl.innerHTML = ''; for (const [id, e, n] of TOOLS) toolsEl.append(h('button', { class: 'tool', 'aria-pressed': String(tool === id), onclick: () => pickTool(id) }, h('span', null, e), n)); };
      const PAL = ['#1E1E2E', '#FFFFFF', '#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#00C7BE', '#0A84FF', '#5E5CE6', '#AF52DE', '#FF2D92', '#8E5A3C', '#8E8E93'];
      const colIn = h('input', { type: 'color', value: color, 'aria-label': 'Any color', oninput: e => { color = e.target.value; drawCols(); } });
      const colorsEl = h('div', { class: 'colors' });
      const drawCols = () => { colorsEl.innerHTML = ''; for (const c of PAL) colorsEl.append(h('button', { class: 'swatch', style: { background: c }, 'aria-label': 'Color ' + c, 'aria-pressed': String(c.toLowerCase() === color.toLowerCase()), onclick: () => { color = c; colIn.value = c; drawCols(); } })); colorsEl.append(colIn); };
      const sizeIn = h('input', { type: 'range', min: 2, max: 80, value: size, 'aria-label': 'Brush size', oninput: e => size = +e.target.value });
      v.append(h('div', { class: 'studio' }, easel, toolsEl, colorsEl, h('div', { class: 'row nw' }, h('span', { class: 'small muted' }, 'Size'), sizeIn)));
      drawTools(); drawCols(); paintUndo();
      let sticker = '⭐';
      function pickTool(id) {
        if (id === 'fx') return filterPanel(); if (id === 'rotate') return transform('rot'); if (id === 'flip') return transform('flip'); if (id === 'share') return share();
        if (id === 'sticker') { const s = UI.sheet({ title: 'Pick a sticker, then tap the picture', body: h('div', { class: 'stickers' }, STICKERS.map(e => h('button', { onclick: () => { sticker = e; tool = 'sticker'; drawTools(); s.close(); } }, e))) }); return; }
        tool = id; drawTools(); if (id === 'crop') startCrop(); else endCrop();
        if (id === 'text') UI.toast('Tap where the words should go'); if (id === 'fill') UI.toast('Tap an area to fill it');
      }
      const pt = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * cv.width / r.width, (e.clientY - r.top) * cv.height / r.height]; };
      const scale = () => cv.width / cv.getBoundingClientRect().width;
      let drawing = false, last = null, startP = null, base = null, mid = null;
      const strokeStyle = () => tool === 'eraser' ? (isPhoto ? g.createPattern(orig, 'no-repeat') : bg) : tool === 'rainbow' ? 'hsl(' + (hue = (hue + 6) % 360) + ' 95% 55%)' : color;
      cv.addEventListener('pointerdown', e => {
        if (e.button > 0 || tool === 'crop') return; e.preventDefault(); cv.setPointerCapture(e.pointerId); const p = pt(e);
        if (tool === 'text') return placeText(p); if (tool === 'sticker') { push(); g.font = Math.max(24, size * 6) + 'px system-ui, "Apple Color Emoji"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(sticker, p[0], p[1]); return; }
        if (tool === 'fill') { push(); flood(Math.round(p[0]), Math.round(p[1]), color); return; }
        push(); drawing = true; last = p; mid = p; startP = p;
        if (['line', 'rect', 'circle'].includes(tool)) base = g.getImageData(0, 0, cv.width, cv.height);
        else dab(p, e);
      });
      cv.addEventListener('pointermove', e => {
        if (!drawing) return; const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
        for (const ev of (evs.length ? evs : [e])) {
          const p = pt(ev);
          if (base) { g.putImageData(base, 0, 0); shape(startP, p); continue; }
          if (tool === 'spray') { dab(p, ev); continue; }
          const w = lineW(ev); g.lineCap = g.lineJoin = 'round'; g.lineWidth = w; g.strokeStyle = strokeStyle(); g.globalAlpha = tool === 'marker' ? 0.35 : 1;
          const m2 = [(last[0] + p[0]) / 2, (last[1] + p[1]) / 2]; g.beginPath(); g.moveTo(mid[0], mid[1]); g.quadraticCurveTo(last[0], last[1], m2[0], m2[1]); g.stroke(); g.globalAlpha = 1; mid = m2; last = p;
        }
      });
      const up = () => { drawing = false; base = null; };
      cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
      const lineW = e => size * scale() * (e.pointerType === 'pen' && e.pressure ? 0.4 + e.pressure * 1.2 : 1) * (tool === 'marker' ? 2.2 : tool === 'eraser' ? 2 : 1);
      function dab(p, e) {
        if (tool === 'spray') { g.fillStyle = color; const r = size * scale() * 2; for (let i = 0; i < 26; i++) { const a = Math.random() * 6.283, d = Math.sqrt(Math.random()) * r; g.fillRect(p[0] + Math.cos(a) * d, p[1] + Math.sin(a) * d, 1.6 * scale(), 1.6 * scale()); } return; }
        g.fillStyle = strokeStyle(); g.globalAlpha = tool === 'marker' ? 0.35 : 1; g.beginPath(); g.arc(p[0], p[1], lineW(e) / 2, 0, 6.283); g.fill(); g.globalAlpha = 1;
      }
      function shape(a, b) {
        g.strokeStyle = color; g.lineWidth = size * scale(); g.lineCap = g.lineJoin = 'round'; g.beginPath();
        if (tool === 'line') { g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); } else if (tool === 'rect') g.rect(a[0], a[1], b[0] - a[0], b[1] - a[1]); else g.ellipse((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, Math.abs(b[0] - a[0]) / 2, Math.abs(b[1] - a[1]) / 2, 0, 0, 6.283);
        g.stroke();
      }
      async function placeText(p) {
        const t = await UI.prompt('Your words', { placeholder: 'Type something', ok: 'Add' }); if (!t) return; push();
        const fs = Math.max(20, size * 4 * scale()); g.font = '800 ' + fs + 'px ' + getComputedStyle(document.body).getPropertyValue('--round'); g.textAlign = 'center'; g.textBaseline = 'middle';
        g.lineWidth = fs / 8; g.strokeStyle = color === '#FFFFFF' || color === '#FFCC00' ? '#000' : '#fff'; g.lineJoin = 'round';
        t.split('\n').forEach((line, i) => { g.strokeText(line, p[0], p[1] + i * fs * 1.15); g.fillStyle = color; g.fillText(line, p[0], p[1] + i * fs * 1.15); });
      }
      function flood(x, y, hex) {
        const W = cv.width, H = cv.height, d = g.getImageData(0, 0, W, H), a = d.data, i0 = (y * W + x) * 4;
        const t = [a[i0], a[i0 + 1], a[i0 + 2], a[i0 + 3]], f = [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16), 255];
        if (t.every((v2, k) => Math.abs(v2 - f[k]) < 3)) return;
        const tol = 48, same = i => Math.abs(a[i] - t[0]) + Math.abs(a[i + 1] - t[1]) + Math.abs(a[i + 2] - t[2]) + Math.abs(a[i + 3] - t[3]) <= tol;
        const seen = new Uint8Array(W * H), st = [x, y];
        while (st.length) {
          let yy = st.pop(), xx = st.pop(); while (xx >= 0 && same((yy * W + xx) * 4) && !seen[yy * W + xx]) xx--; xx++; let upO = false, dnO = false;
          while (xx < W && !seen[yy * W + xx] && same((yy * W + xx) * 4)) {
            const p = yy * W + xx, i = p * 4; seen[p] = 1; a[i] = f[0]; a[i + 1] = f[1]; a[i + 2] = f[2]; a[i + 3] = 255;
            if (yy > 0) { const q = p - W; if (!seen[q] && same(q * 4)) { if (!upO) { st.push(xx, yy - 1); upO = true; } } else upO = false; }
            if (yy < H - 1) { const q = p + W; if (!seen[q] && same(q * 4)) { if (!dnO) { st.push(xx, yy + 1); dnO = true; } } else dnO = false; }
            xx++;
          }
        }
        g.putImageData(d, 0, 0);
      }
      function transform(kind) {
        push(); for (const [c, cx] of [[cv, g], [orig, go]]) {
          const tmp = h('canvas'); tmp.width = c.width; tmp.height = c.height; tmp.getContext('2d').drawImage(c, 0, 0);
          if (kind === 'rot') { c.width = tmp.height; c.height = tmp.width; cx.save(); cx.translate(c.width, 0); cx.rotate(Math.PI / 2); cx.drawImage(tmp, 0, 0); cx.restore(); }
          else { cx.save(); cx.clearRect(0, 0, c.width, c.height); cx.translate(c.width, 0); cx.scale(-1, 1); cx.drawImage(tmp, 0, 0); cx.restore(); }
        }
      }
      let crop = null, cropBar = null;
      function startCrop() {
        endCrop(); crop = { x: cv.width * 0.1, y: cv.height * 0.1, w: cv.width * 0.8, h: cv.height * 0.8 }; paintCrop();
        const setAR = ar => { const W = cv.width, H = cv.height; let w = W, ht = W / ar; if (ht > H) { ht = H; w = H * ar; } crop = { x: (W - w) / 2, y: (H - ht) / 2, w, h: ht }; paintCrop(); };
        cropBar = h('div', { class: 'row', style: { justifyContent: 'center' } }, h('span', { class: 'small muted' }, 'Drag on the picture, or:'), h('button', { class: 'chip', onclick: () => setAR(1) }, 'Square'), h('button', { class: 'chip', onclick: () => setAR(4 / 3) }, '4:3'), h('button', { class: 'chip', onclick: () => setAR(9 / 16) }, 'Phone'), h('button', { class: 'btn pri sm', onclick: doCrop }, '✂️ Crop'), h('button', { class: 'btn sm', onclick: () => { tool = 'brush'; drawTools(); endCrop(); } }, 'Cancel'));
        toolsEl.after(cropBar);
      }
      function paintCrop() {
        const r = cv.getBoundingClientRect(), er = easel.getBoundingClientRect(); ovl.style.left = (r.left - er.left) + 'px'; ovl.style.top = (r.top - er.top) + 'px'; ovl.style.width = r.width + 'px'; ovl.style.height = r.height + 'px'; ovl.width = r.width * devicePixelRatio; ovl.height = r.height * devicePixelRatio;
        const o = ovl.getContext('2d'), k = ovl.width / cv.width; o.clearRect(0, 0, ovl.width, ovl.height); o.fillStyle = 'rgba(0,0,0,.55)'; o.fillRect(0, 0, ovl.width, ovl.height); o.clearRect(crop.x * k, crop.y * k, crop.w * k, crop.h * k); o.strokeStyle = '#fff'; o.lineWidth = 2 * devicePixelRatio; o.strokeRect(crop.x * k, crop.y * k, crop.w * k, crop.h * k);
      }
      function endCrop() { crop = null; if (cropBar) { cropBar.remove(); cropBar = null; } ovl.width = 0; }
      cv.addEventListener('pointerdown', e => { if (tool !== 'crop') return; e.preventDefault(); cv.setPointerCapture(e.pointerId); startP = pt(e); drawing = 'crop'; });
      cv.addEventListener('pointermove', e => { if (drawing !== 'crop') return; const p = pt(e); crop = { x: Math.min(startP[0], p[0]), y: Math.min(startP[1], p[1]), w: Math.abs(p[0] - startP[0]), h: Math.abs(p[1] - startP[1]) }; paintCrop(); });
      function doCrop() {
        if (!crop || crop.w < 10 || crop.h < 10) return UI.toast('Drag a box first'); push();
        for (const [c, cx] of [[cv, g], [orig, go]]) { const d = cx.getImageData(Math.round(crop.x), Math.round(crop.y), Math.round(crop.w), Math.round(crop.h)); c.width = d.width; c.height = d.height; cx.putImageData(d, 0, 0); }
        tool = 'brush'; drawTools(); endCrop();
      }
      function filterPanel() {
        const before = snap(); let cur = 'none'; const adj = { b: 0, c: 0, s: 0, w: 0 };
        const small = h('canvas'); const k = 96 / Math.max(cv.width, cv.height); small.width = Math.max(1, Math.round(cv.width * k)); small.height = Math.max(1, Math.round(cv.height * k)); small.getContext('2d').drawImage(cv, 0, 0, small.width, small.height);
        const sd = small.getContext('2d').getImageData(0, 0, small.width, small.height);
        const apply = (d, withOrig) => { const f = Filters.PRESETS.find(p => p[0] === cur)[2]; f(d); if (adj.b || adj.c || adj.s || adj.w) Filters.adjust(d, adj); return d; };
        const preview = debounce(() => { const d = new ImageData(new Uint8ClampedArray(before.main.data), before.main.width, before.main.height); g.putImageData(apply(d), 0, 0); }, 60);
        const thumbs = h('div', { class: 'fthumbs' }, Filters.PRESETS.map(([id, name, f]) => { const c = h('canvas'); c.width = small.width; c.height = small.height; c.getContext('2d').putImageData(f(new ImageData(new Uint8ClampedArray(sd.data), sd.width, sd.height)), 0, 0); return h('button', { class: 'fthumb', 'aria-pressed': String(id === cur), onclick: e => { cur = id; $$('.fthumb', thumbs).forEach(b => b.setAttribute('aria-pressed', 'false')); e.currentTarget.setAttribute('aria-pressed', 'true'); preview(); } }, c, name); }));
        const slider = (key, label, min, max) => { const r = h('input', { type: 'range', min, max, value: 0, oninput: () => { adj[key] = +r.value; preview(); } }); return h('label', { class: 'f' }, h('span', null, label), r); };
        let applied = false;
        UI.sheet({ title: 'Filters', body: h('div', null, thumbs, slider('b', '☀️ Brightness', -80, 80), slider('c', '◐ Contrast', -60, 80), slider('s', '🎨 Color', -100, 100), slider('w', '🔥 Warmth', -50, 50)),
          onClose: () => { if (!applied) restore(before); },
          actions: [{ label: 'Cancel' }, { label: 'Apply', cls: 'pri', onClick: c => {
            applied = true; preview.flush(); undo.push(before); if (undo.length > 8) undo.shift(); redo.length = 0; dirty = true; paintUndo();
            const od = go.getImageData(0, 0, orig.width, orig.height); go.putImageData(apply(od), 0, 0); c();
          } }] });
      }
      async function share() { const blob = await new Promise(r => isPhoto ? cv.toBlob(r, 'image/jpeg', 0.92) : cv.toBlob(r, 'image/png')); saveFile(blob, (opt.name || 'drawing').replace(/\W+/g, '-') + (isPhoto ? '.jpg' : '.png')); }
      const onResize = () => { if (crop) paintCrop(); }; addEventListener('resize', onResize);
      cleanup = () => removeEventListener('resize', onResize);
    }
    if (ctx.param) DB.get('media', ctx.param).then(m => m ? editor({ blob: m.blob, id: m.kind === 'drawing' ? m.id : null, name: m.kind === 'drawing' ? m.name : 'Edited photo', kind: m.kind }) : home()); else home();
    return () => { if (cleanup) cleanup(); };
  },
});

/* ---- 24-files.js ---- */
/* ===== Files: keep any file, make folders, preview, rename, move, share ===== */
addCSS(`
.crumbs{display:flex;gap:4px;align-items:center;flex-wrap:wrap;font-size:14px;margin:0 2px 10px}
.crumbs button{border:0;background:none;color:var(--accent);font-weight:650;padding:4px 2px}
.fgrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
@media (min-width:640px){.fgrid{grid-template-columns:repeat(5,minmax(0,1fr))}}
.fitem{display:flex;flex-direction:column;align-items:center;gap:6px;border:0;background:none;padding:6px 2px;text-align:center;min-width:0;border-radius:14px}
.fitem:active{background:var(--surface2)}
.fitem .th{width:72px;height:72px;border-radius:14px;display:grid;place-items:center;font-size:40px;background:var(--surface);border:1px solid var(--line);overflow:hidden}
.fitem .th img{width:100%;height:100%;object-fit:cover}
.fitem b{font-size:13px;font-weight:600;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fitem small{font-size:11px;color:var(--muted)}
.fprev{max-height:60vh;overflow:auto;border-radius:12px;background:var(--surface2)}
.fprev img,.fprev video{display:block;max-width:100%;margin:0 auto}
.fprev pre{white-space:pre-wrap;word-break:break-word;font-family:var(--mono);font-size:13px;padding:12px;margin:0}
`);
const FileKit = {
  icon(f) { if (f.dir) return '📁'; const t = f.type || '', n = (f.name || '').toLowerCase(); return t.startsWith('image') ? '🖼️' : t.startsWith('video') ? '🎬' : t.startsWith('audio') ? '🎵' : t.includes('pdf') || n.endsWith('.pdf') ? '📕' : /zip|rar|7z|tar/.test(t + n) ? '🗜️' : /sheet|excel|csv|\.xls/.test(t + n) ? '📊' : /presentation|powerpoint|\.ppt|\.key/.test(t + n) ? '📽️' : /word|\.doc|\.pages/.test(t + n) ? '📘' : FileKit.isText(f) ? '📝' : '📄'; },
  isText(f) { return /^text\/|json|xml|javascript|csv|markdown/.test(f.type || '') || /\.(txt|md|csv|json|js|html|css|py|xml|log|ini|yaml|yml)$/i.test(f.name || ''); },
  async children(folder) { return (await DB.all('files')).filter(f => (f.folder || null) === folder); },
  async removeTree(f) { if (f.dir) for (const c of await this.children(f.id)) await this.removeTree(c); await DB.del('files', f.id); },
  async add(files, folder) { let n = 0; for (const f of files) { const th = f.type.startsWith('image') ? await imageThumb(f, 200) : null; await DB.put('files', { id: uid(), name: f.name, type: f.type || '', size: f.size, blob: f, folder, thumb: th && th.url, created: Date.now(), updated: Date.now() }); n++; } return n; },
};
Apps.reg({
  id: 'files', name: 'Files', icon: '📁', color: 'linear-gradient(135deg,#5AC8FA,#007AFF)', group: 'make', keys: 'documents folders pdf storage', blurb: 'Keep any file, in folders',
  mount(v, ctx) {
    let folder = null, path = [], q = '', sortBy = Prefs.get('fileSort', 'name');
    const crumbs = h('div', { class: 'crumbs' }), search = h('input', { type: 'search', placeholder: 'Search files' }), box = h('div'), info = h('p', { class: 'tiny muted center mt' });
    v.append(h('div', { class: 'search mb' }, search), crumbs, box, info, h('button', { class: 'fab', 'aria-label': 'Add', html: SVG.plus, onclick: addMenu }));
    ctx.setActions(h('button', { class: 'btn ghost sm', onclick: () => UI.menu('Sort by', [['name', 'Name'], ['date', 'Newest'], ['size', 'Size']].map(([k, l]) => ({ icon: sortBy === k ? '✓' : '', label: l, run: () => { sortBy = k; Prefs.set('fileSort', k); draw(); } }))) }, 'Sort'));
    search.addEventListener('input', () => { q = search.value.trim().toLowerCase(); draw(); });
    function addMenu() {
      UI.menu('Add', [
        { icon: '📥', label: 'Import files', sub: 'From Files, iCloud Drive, or your computer', run: async () => { const fs = await pickFiles('*/*'); if (fs.length) { UI.toast('Adding ' + fs.length + '…'); await FileKit.add(fs, folder); draw(); } } },
        { icon: '🖼️', label: 'Import photos or videos', run: async () => { const fs = await pickFiles('image/*,video/*'); if (fs.length) { await FileKit.add(fs, folder); draw(); } } },
        { icon: '📷', label: 'Scan with camera', sub: 'Take a photo of paper', run: async () => { const fs = await pickFiles('image/*', { multiple: false, capture: 'environment' }); if (fs.length) { const f = new File([fs[0]], 'Scan ' + new Date().toLocaleString().replace(/[/:]/g, '-') + '.jpg', { type: fs[0].type }); await FileKit.add([f], folder); draw(); } } },
        { icon: '📁', label: 'New folder', run: async () => { const n = await UI.prompt('Folder name', { value: 'New folder', ok: 'Create' }); if (n && n.trim()) { await DB.put('files', { id: uid(), name: n.trim(), dir: true, folder, created: Date.now(), updated: Date.now() }); draw(); } } },
        { icon: '📝', label: 'New text file', run: async () => { const n = await UI.prompt('File name', { value: 'Untitled.txt', ok: 'Create' }); if (n && n.trim()) { const name = /\.\w+$/.test(n) ? n.trim() : n.trim() + '.txt'; const rec = { id: uid(), name, type: 'text/plain', size: 0, blob: new Blob([''], { type: 'text/plain' }), folder, created: Date.now(), updated: Date.now() }; await DB.put('files', rec); draw(); open(rec); } } },
      ]);
    }
    async function draw() {
      const all = await DB.all('files');
      crumbs.innerHTML = ''; crumbs.append(h('button', { onclick: () => { folder = null; path = []; draw(); } }, '🏠 Files')); path.forEach((p, i) => crumbs.append('›', h('button', { onclick: () => { folder = p.id; path = path.slice(0, i + 1); draw(); } }, p.name)));
      let items = q ? all.filter(f => (f.name || '').toLowerCase().includes(q)) : all.filter(f => (f.folder || null) === folder);
      items.sort((a, b) => (b.dir ? 1 : 0) - (a.dir ? 1 : 0) || (sortBy === 'date' ? b.updated - a.updated : sortBy === 'size' ? (b.size || 0) - (a.size || 0) : a.name.localeCompare(b.name, undefined, { numeric: true })));
      box.innerHTML = '';
      if (!items.length) box.append(UI.empty(q ? '🔎' : '📂', q ? 'No files match' : 'This folder is empty', q ? '' : 'Tap + to import files, make a folder or write a text file.'));
      else box.append(h('div', { class: 'fgrid' }, items.map(f => { const kids = f.dir ? all.filter(x => x.folder === f.id).length : 0;
        return onLongPress(h('button', { class: 'fitem', onclick: () => f.dir ? (folder = f.id, path.push(f), q = '', search.value = '', draw()) : open(f) },
          h('span', { class: 'th' }, f.thumb ? h('img', { src: f.thumb, alt: '' }) : FileKit.icon(f)), h('b', null, f.name), h('small', null, f.dir ? kids + ' items' : fmtSize(f.size || 0))), () => menu(f)); })));
      if (!folder && !q) box.append(h('div', { class: 'sec' }, 'From your apps'), h('div', { class: 'list' }, [['media', '🖼️', 'Photos & drawings'], ['videos', '🎬', 'Videos'], ['memos', '🎙️', 'Voice memos'], ['music', '🎵', 'Songs']].map(([id, e, n]) => h('button', { class: 'li', onclick: () => Shell.go(id) }, h('span', { class: 'ic' }, e), h('span', { class: 't' }, h('b', null, n)), h('span', { class: 'chev' }, '›')))));
      const total = all.reduce((a, f) => a + (f.size || 0), 0); info.textContent = all.filter(f => !f.dir).length + ' files · ' + fmtSize(total) + ' · long-press a file for more options';
      ctx.setBack(folder ? () => { path.pop(); folder = path.length ? path[path.length - 1].id : null; draw(); return true; } : null);
    }
    function menu(f) {
      UI.menu(f.name, [
        { icon: '✏️', label: 'Rename', run: async () => { const n = await UI.prompt('New name', { value: f.name }); if (n && n.trim()) { f.name = n.trim(); f.updated = Date.now(); await DB.put('files', f); draw(); } } },
        { icon: '📂', label: 'Move to…', run: () => move(f) },
        !f.dir && { icon: '📤', label: 'Share or save', run: () => saveFile(f.blob, f.name) },
        !f.dir && { icon: '📑', label: 'Duplicate', run: async () => { await DB.put('files', Object.assign({}, f, { id: uid(), name: f.name.replace(/(\.\w+)?$/, ' copy$1'), created: Date.now(), updated: Date.now() })); draw(); } },
        { icon: '🗑️', label: 'Delete', danger: true, run: async () => { if (await UI.ask('Delete “' + f.name + '”' + (f.dir ? ' and everything inside it' : '') + '?', { ok: 'Delete', danger: true })) { await FileKit.removeTree(f); draw(); } } },
      ]);
    }
    async function move(f) {
      const dirs = (await DB.all('files')).filter(d => d.dir && d.id !== f.id);
      const bad = new Set([f.id]); let grew = true; while (grew) { grew = false; for (const d of dirs) if (!bad.has(d.id) && bad.has(d.folder)) { bad.add(d.id); grew = true; } }
      UI.menu('Move “' + f.name + '” to', [{ icon: '🏠', label: 'Files (top)', run: async () => { f.folder = null; await DB.put('files', f); draw(); } }].concat(dirs.filter(d => !bad.has(d.id)).map(d => ({ icon: '📁', label: d.name, run: async () => { f.folder = d.id; await DB.put('files', f); draw(); } }))));
    }
    async function open(f) {
      const body = h('div'); let url = null;
      const prev = h('div', { class: 'fprev' }); body.append(prev, h('p', { class: 'small muted mt' }, fmtSize(f.size || 0) + ' · ' + (f.type || 'file') + ' · added ' + fmtAgo(f.created)));
      const t = f.type || '';
      if (t.startsWith('image')) { url = URL.createObjectURL(f.blob); prev.append(h('img', { src: url, alt: f.name })); }
      else if (t.startsWith('video')) { url = URL.createObjectURL(f.blob); prev.append(h('video', { src: url, controls: true, playsinline: true })); }
      else if (t.startsWith('audio')) { url = URL.createObjectURL(f.blob); prev.append(h('audio', { src: url, controls: true, style: { width: '100%', margin: '14px 0' } })); }
      else if (FileKit.isText(f)) {
        const ta = h('textarea', { style: { minHeight: '45vh', fontFamily: 'var(--mono)', fontSize: '14px', border: 0 } }); ta.value = await f.blob.text(); prev.replaceWith(ta);
        body.append(h('button', { class: 'btn pri sm', onclick: async () => { f.blob = new Blob([ta.value], { type: f.type || 'text/plain' }); f.size = f.blob.size; f.updated = Date.now(); await DB.put('files', f); UI.toast('Saved'); draw(); } }, '💾 Save changes'));
      } else if (t.includes('pdf') || /\.pdf$/i.test(f.name)) { url = URL.createObjectURL(new Blob([f.blob], { type: 'application/pdf' })); prev.append(h('iframe', { src: url, title: f.name, style: { width: '100%', height: '60vh', border: 0, background: '#fff' } })); body.append(h('p', { class: 'tiny muted' }, 'Tip: tap “Open / share” to read every page.')); }
      else prev.append(UI.empty(FileKit.icon(f), 'No preview for this kind of file', 'Tap “Open / share” to open it in another app.'));
      UI.sheet({ title: f.name, body, onClose: () => url && URL.revokeObjectURL(url), actions: [{ label: '⋯ More', onClick: c => { c(); menu(f); } }, { label: '📤 Open / share', cls: 'pri', onClick: () => saveFile(f.blob, f.name) }] });
    }
    if (ctx.param) DB.get('files', ctx.param).then(f => { draw(); if (f && !f.dir) open(f); }); else draw();
  },
});

/* ---- 25-videos.js ---- */
/* ===== Videos: your video library, player that remembers where you stopped, save a video from a link ===== */
addCSS(`
.vrow{display:flex;gap:10px;overflow-x:auto;padding:2px 0 8px;scrollbar-width:none}
.vrow::-webkit-scrollbar{display:none}
.vcard{flex:0 0 auto;width:220px;border:0;background:none;padding:0;text-align:left;color:var(--ink)}
.vgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
@media (min-width:700px){.vgrid{grid-template-columns:repeat(3,minmax(0,1fr))}}
.vthumb{position:relative;aspect-ratio:16/9;border-radius:14px;overflow:hidden;background:#111;display:grid;place-items:center;font-size:34px;box-shadow:var(--shadow)}
.vthumb img{width:100%;height:100%;object-fit:cover}
.vthumb .d{position:absolute;right:6px;bottom:6px;background:rgba(0,0,0,.7);color:#fff;font-size:12px;font-weight:700;border-radius:6px;padding:2px 6px}
.vthumb .pg{position:absolute;left:0;bottom:0;height:4px;background:#FF3B30}
.vcard b,.vitem b{display:block;font-size:14px;margin-top:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.vcard small,.vitem small{font-size:12px;color:var(--muted)}
.vitem{border:0;background:none;padding:0;text-align:left;min-width:0;color:var(--ink)}
.vplayer{background:#000;border-radius:16px;overflow:hidden}
.vplayer video{display:block;width:100%;max-height:62vh;background:#000}
`);
const BLOCKED_SITES = /(^|\.)(youtube\.com|youtu\.be|tiktok\.com|instagram\.com|facebook\.com|fb\.watch|twitter\.com|x\.com|snapchat\.com|twitch\.tv|vimeo\.com|netflix\.com|disneyplus\.com|reddit\.com|roblox\.com)$/i;
Apps.reg({
  id: 'videos', name: 'Videos', icon: '🎬', color: 'linear-gradient(135deg,#FF416C,#8E2DE2)', group: 'make', keys: 'movies clips watch player download link', blurb: 'Watch and save videos',
  mount(v, ctx) {
    let urlNow = null;
    const pos = id => Prefs.get('vpos', {})[id] || 0, setPos = (id, t, d) => { const p = Prefs.get('vpos', {}); if (t < 3 || (d && t > d - 3)) delete p[id]; else p[id] = t; Prefs.set('vpos', p); };
    async function list() {
      if (ctx._clean) { ctx._clean(); ctx._clean = null; }
      v.innerHTML = ''; ctx.setTitle('Videos'); ctx.setBack(null); if (urlNow) { URL.revokeObjectURL(urlNow); urlNow = null; }
      ctx.setActions(h('button', { class: 'btn ghost sm', onclick: add }, '＋ Add'));
      const all = (await DB.all('media')).filter(m => m.kind === 'video').sort((a, b) => b.created - a.created);
      const watch = () => typeof Links !== 'undefined' ? Links.row('Videos', '📺 Watch online') : '';
      if (!all.length) { v.append(UI.empty('🎬', 'No videos yet', 'Add videos from your library, record one, or paste a link to a video file.'), h('div', { class: 'center' }, h('button', { class: 'btn pri', onclick: add }, '＋ Add a video')), watch()); return; }
      const thumb = m => h('div', { class: 'vthumb' }, m.thumb ? h('img', { src: m.thumb, alt: '' }) : '🎬', m.dur ? h('span', { class: 'd' }, fmtDur(m.dur)) : null, pos(m.id) && m.dur ? h('span', { class: 'pg', style: { width: (100 * pos(m.id) / m.dur) + '%' } }) : null);
      const cont = all.filter(m => pos(m.id));
      if (cont.length) v.append(h('div', { class: 'sec', style: { marginTop: '4px' } }, '▶️ Continue watching'), h('div', { class: 'vrow' }, cont.map(m => h('button', { class: 'vcard', onclick: () => play(m, all) }, thumb(m), h('b', null, m.name || 'Video'), h('small', null, fmtDur(m.dur - pos(m.id)) + ' left')))));
      v.append(watch(), h('div', { class: 'sec' }, 'All videos · ' + all.length), h('div', { class: 'vgrid' }, all.map(m => onLongPress(h('button', { class: 'vitem', onclick: () => play(m, all) }, thumb(m), h('b', null, m.name || 'Video'), h('small', null, fmtDay(new Date(m.created)) + (m.size ? ' · ' + fmtSize(m.size) : ''))), () => opts(m)))),
        h('p', { class: 'tiny muted center mt' }, 'Press and hold a video for options.'));
    }
    function add() {
      UI.menu('Add a video', [
        { icon: '🖼️', label: 'From my photo library', run: async () => { const f = await pickFiles('video/*'); if (f.length) { UI.toast('Adding…'); await Media.add(f); list(); } } },
        { icon: '🎥', label: 'Record a video', run: async () => { const f = await pickFiles('video/*', { multiple: false, capture: 'environment' }); if (f.length) { await Media.add(f); list(); } } },
        { icon: '🔗', label: 'Save from a link', sub: 'A direct link to a video file (.mp4, .mov, .webm)', run: fromLink },
      ]);
    }
    function fromLink() {
      const inp = h('input', { type: 'url', placeholder: 'https://…/video.mp4', autocapitalize: 'off', autocomplete: 'off' }), msg = h('div', { class: 'mt small' }), bar = h('i', { style: { width: '0%' } }), prog = h('div', { class: 'prog mt', hidden: true }, bar);
      let ctrl = null;
      const go = async () => {
        let u; try { u = new URL(inp.value.trim()); } catch (e) { msg.textContent = 'That doesn’t look like a web link.'; return; }
        if (!/^https?:$/.test(u.protocol)) { msg.textContent = 'Use a link that starts with https://'; return; }
        if (BLOCKED_SITES.test(u.hostname.replace(/^www\.|^m\./, ''))) { msg.innerHTML = ''; msg.append(h('div', { class: 'note-banner', style: { margin: 0 } }, '🚫 ' + u.hostname.replace(/^www\./, '') + ' doesn’t let other apps download its videos, and its rules don’t allow it. Use the app’s own save or “download for offline” button instead, or ask the creator for the file.')); return; }
        if (!navigator.onLine) { msg.textContent = 'You need internet to download.'; return; }
        msg.textContent = 'Downloading…'; prog.hidden = false; ctrl = new AbortController();
        try {
          const r = await fetch(u.href, { signal: ctrl.signal }); if (!r.ok) throw new Error('The website said ' + r.status + '.');
          const type = (r.headers.get('content-type') || '').split(';')[0];
          if (!/^video\//.test(type) && !/\.(mp4|m4v|mov|webm|ogv)(\?|$)/i.test(u.pathname)) throw new Error('That link is a web page, not a video file. Look for a link that ends in .mp4.');
          const total = +r.headers.get('content-length') || 0, reader = r.body.getReader(), parts = []; let got = 0;
          for (; ;) { const { done, value } = await reader.read(); if (done) break; parts.push(value); got += value.length; bar.style.width = total ? (100 * got / total) + '%' : Math.min(95, got / 2e5) + '%'; msg.textContent = 'Downloading… ' + fmtSize(got) + (total ? ' of ' + fmtSize(total) : ''); }
          const name = decodeURIComponent(u.pathname.split('/').pop() || 'video.mp4') || 'video.mp4';
          const file = new File(parts, name, { type: /^video\//.test(type) ? type : 'video/mp4' });
          await Media.add([file]); bar.style.width = '100%'; Sfx.good(); UI.toast('Saved to Videos ✅'); s.close(); list();
        } catch (e) {
          prog.hidden = true;
          msg.textContent = e.name === 'AbortError' ? 'Stopped.' : e instanceof TypeError ? 'That website blocks downloads from other apps. Try opening the link in Safari, download it there, then add it here with “From my photo library” or the Files app.' : e.message;
        }
      };
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
      const s = UI.sheet({ title: 'Save a video from a link', onClose: () => ctrl && ctrl.abort(), body: h('div', null, h('p', { class: 'small muted' }, 'Paste a link that goes straight to a video file. It downloads once, then plays offline.'), inp, prog, msg), actions: [{ label: 'Cancel' }, { label: '⬇️ Download', cls: 'pri', onClick: () => go() }] });
      if (navigator.clipboard && navigator.clipboard.readText) navigator.clipboard.readText().then(t => { if (/^https?:\/\//.test(t) && !inp.value) inp.value = t.trim(); }).catch(() => { });
    }
    function opts(m) {
      UI.menu(m.name || 'Video', [
        { icon: '✏️', label: 'Rename', run: async () => { const n = await UI.prompt('Video name', { value: m.name || '' }); if (n && n.trim()) { m.name = n.trim(); await DB.put('media', m); list(); } } },
        { icon: '📤', label: 'Share or save', run: () => saveFile(m.blob, (m.name || 'video').replace(/\.[^.]+$/, '') + (m.type && m.type.includes('quicktime') ? '.mov' : m.type && m.type.includes('webm') ? '.webm' : '.mp4')) },
        { icon: '🗑️', label: 'Delete', danger: true, run: async () => { if (await UI.ask('Delete this video?', { ok: 'Delete', danger: true })) { await DB.del('media', m.id); setPos(m.id, 0); list(); } } },
      ]);
    }
    function play(m, all) {
      v.innerHTML = ''; ctx.setTitle(m.name || 'Video'); ctx.setBack(() => { save(); list(); return true; }); ctx.setActions(h('button', { class: 'ib', 'aria-label': 'Options', html: SVG.more, onclick: () => opts(m) }));
      if (urlNow) URL.revokeObjectURL(urlNow); urlNow = URL.createObjectURL(m.blob);
      const vid = h('video', { src: urlNow, controls: true, playsinline: true, autoplay: true, preload: 'auto' });
      const save = () => { if (vid.currentTime) setPos(m.id, vid.currentTime, vid.duration); };
      vid.addEventListener('loadedmetadata', () => { const p = pos(m.id); if (p && p < vid.duration - 3) { vid.currentTime = p; UI.toast('Resuming at ' + fmtDur(p)); } if (!m.dur && vid.duration) { m.dur = vid.duration; DB.put('media', m); } });
      vid.addEventListener('pause', save); let tsave = setInterval(save, 5000);
      let loop = Prefs.get('vloop', false); vid.loop = loop;
      const i = all.indexOf(m), nextV = all[i + 1];
      vid.addEventListener('ended', () => { setPos(m.id, 0); if (!loop && nextV && Prefs.get('vauto', true)) { UI.toast('Up next: ' + (nextV.name || 'video')); setTimeout(() => { clearInterval(tsave); play(nextV, all); }, 1200); } });
      const speedB = h('div', { class: 'chips' }, [0.5, 1, 1.25, 1.5, 2].map(r => h('button', { class: 'chip', 'aria-pressed': String(r === 1), onclick: e => { vid.playbackRate = r; $$('.chip', speedB).forEach(b => b.setAttribute('aria-pressed', String(b === e.currentTarget))); } }, r + '×')));
      const loopB = h('button', { class: 'chip', 'aria-pressed': String(loop), onclick: () => { loop = !loop; vid.loop = loop; Prefs.set('vloop', loop); loopB.setAttribute('aria-pressed', String(loop)); } }, '🔁 Loop');
      const pip = (document.pictureInPictureEnabled || vid.webkitSupportsPresentationMode) ? h('button', { class: 'chip', onclick: () => { try { if (vid.webkitSetPresentationMode) vid.webkitSetPresentationMode('picture-in-picture'); else vid.requestPictureInPicture(); } catch (e) { UI.toast('Picture in picture isn’t available'); } } }, '⧉ Picture in picture') : null;
      v.append(h('div', { class: 'vplayer' }, vid), h('div', { class: 'row mt' }, h('span', { class: 'small muted' }, 'Speed'), speedB), h('div', { class: 'row mt' }, loopB, pip, h('button', { class: 'chip', onclick: () => { vid.currentTime = Math.max(0, vid.currentTime - 10); } }, '⏪ 10s'), h('button', { class: 'chip', onclick: () => { vid.currentTime += 10; } }, '10s ⏩')),
        nextV ? h('div', null, h('div', { class: 'sec' }, 'Up next'), h('button', { class: 'vcard', style: { width: '100%' }, onclick: () => { save(); clearInterval(tsave); play(nextV, all); } }, h('div', { class: 'vthumb' }, nextV.thumb ? h('img', { src: nextV.thumb, alt: '' }) : '🎬'), h('b', null, nextV.name || 'Video'))) : null);
      if (ctx._clean) ctx._clean(); ctx._clean = () => { save(); clearInterval(tsave); vid.pause(); };
    }
    if (ctx.param) DB.get('media', ctx.param).then(async m => { const all = (await DB.all('media')).filter(x => x.kind === 'video').sort((a, b) => b.created - a.created); m ? play(m, all) : list(); }); else list();
    return () => { if (ctx._clean) ctx._clean(); if (urlNow) URL.revokeObjectURL(urlNow); };
  },
});

/* ---- 26-comics.js ---- */
/* ===== Comics: read comic books (.cbz, pictures, PDF), make your own comic, comic websites ===== */
addCSS(`
.cshelf{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
@media (min-width:640px){.cshelf{grid-template-columns:repeat(5,minmax(0,1fr))}}
.cbook{border:0;background:none;padding:0;text-align:left;min-width:0;color:var(--ink)}
.cbook .cv{aspect-ratio:2/3;border-radius:10px;overflow:hidden;background:var(--surface2);display:grid;place-items:center;font-size:40px;box-shadow:0 4px 14px rgba(0,0,0,.2)}
.cbook .cv img{width:100%;height:100%;object-fit:cover}
.cbook b{display:block;font-size:13px;margin-top:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cbook small{font-size:11px;color:var(--muted)}
.creader{position:fixed;inset:0;z-index:55;background:#0B0B0F;display:flex;flex-direction:column;color:#fff}
.creader .bar{display:flex;align-items:center;gap:6px;padding:calc(var(--top) + 6px) 10px 6px;background:rgba(0,0,0,.6)}
.creader .bar .ib{color:#fff}
.creader .pg{flex:1;overflow:auto;display:flex;align-items:center;justify-content:center;touch-action:pan-x pan-y pinch-zoom}
.creader .pg img{max-width:100%;max-height:100%;object-fit:contain;user-select:none;-webkit-user-select:none}
.creader .pg.fit-w img{max-height:none;width:100%}
.creader .bot{display:flex;align-items:center;gap:10px;padding:8px 14px calc(var(--bot) + 10px);background:rgba(0,0,0,.6)}
.creader input[type=range]{flex:1;accent-color:#fff}
.maker canvas{width:100%;max-width:520px;display:block;margin:0 auto;border-radius:10px;box-shadow:var(--shadow);touch-action:none;background:#fff}
`);
const COMIC_SITES = [
  ['📰', 'GoComics', 'Daily comic strips', 'https://www.gocomics.com'],
  ['🐶', 'Peanuts', 'Charlie Brown & Snoopy strips', 'https://www.peanuts.com/comics'],
  ['📱', 'WEBTOON', 'Scrolling comics on your phone', 'https://www.webtoons.com'],
  ['📚', 'Tapas', 'Web comics and stories', 'https://tapas.io'],
  ['🦸', 'DC Kids', 'Superheroes for kids', 'https://www.dckids.com'],
  ['🕸️', 'Marvel HQ', 'Marvel videos and games for kids', 'https://marvelhq.com'],
  ['🏛️', 'Digital Comic Museum', 'Free old comics (public domain)', 'https://digitalcomicmuseum.com'],
  ['📖', 'Comic Book Plus', 'Free classic comics (public domain)', 'https://comicbookplus.com'],
];
const IMG_RE = /\.(jpe?g|png|gif|webp|bmp)$/i;
Apps.reg({
  id: 'comics', name: 'Comics', icon: '💥', color: 'linear-gradient(135deg,#FFE259,#FF6A3D)', group: 'play', keys: 'comic books manga cbz read make strip', blurb: 'Read and make comics',
  mount(v, ctx) {
    let tab = Prefs.get('comicTab', 'shelf'), stop = null;
    const body = h('div');
    v.append(UI.tabs([['shelf', '📖 My comics'], ['make', '✏️ Make a comic'], ['sites', '🌐 Comic sites']], tab, t => { tab = t; Prefs.set('comicTab', t); show(); }), body);
    function show() { if (stop) stop(); stop = null; body.innerHTML = ''; ctx.setActions(); const r = ({ shelf, make, sites })[tab](); stop = typeof r === 'function' ? r : null; }
    async function shelf() {
      ctx.setActions(h('button', { class: 'btn ghost sm', onclick: importMenu }, '＋ Add'));
      const all = (await DB.all('comics')).sort((a, b) => (b.opened || b.created) - (a.opened || a.created));
      if (!all.length) { body.append(UI.empty('💥', 'No comics yet', 'Add a comic book file (.cbz), a PDF, or pick pictures to turn into a comic. Or make your own!'), h('div', { class: 'row', style: { justifyContent: 'center' } }, h('button', { class: 'btn pri', onclick: importMenu }, '＋ Add a comic'), h('button', { class: 'btn', onclick: () => { tab = 'make'; show(); } }, '✏️ Make one'))); return; }
      body.append(h('div', { class: 'cshelf' }, all.map(c => onLongPress(h('button', { class: 'cbook', onclick: () => read(c) }, h('div', { class: 'cv' }, c.cover ? h('img', { src: c.cover, alt: '' }) : (c.kind === 'pdf' ? '📕' : '💥')), h('b', null, c.title), h('small', null, c.kind === 'pdf' ? 'PDF' : (c.last ? 'Page ' + (c.last + 1) + ' of ' : '') + c.pages.length + ' pages')),
        () => UI.menu(c.title, [
          { icon: '✏️', label: 'Rename', run: async () => { const t = await UI.prompt('Comic name', { value: c.title }); if (t && t.trim()) { c.title = t.trim(); await DB.put('comics', c); show(); } } },
          { icon: '🗑️', label: 'Delete', danger: true, run: async () => { if (await UI.ask('Delete “' + c.title + '”?', { ok: 'Delete', danger: true })) { await DB.del('comics', c.id); show(); } } },
        ])))), h('p', { class: 'tiny muted center mt' }, 'Press and hold a comic to rename or delete it.'));
    }
    function importMenu() {
      UI.menu('Add a comic', [
        { icon: '🗂️', label: 'Comic book file (.cbz)', sub: 'Pages packed in a zip', run: async () => { const [f] = await pickFiles('.cbz,.zip,application/zip,application/x-cbz', { multiple: false }); if (f) addCbz(f); } },
        { icon: '🖼️', label: 'Pick pictures as pages', sub: 'Choose them in page order', run: async () => { const fs = await pickFiles('image/*'); if (fs.length) save(fs[0].name.replace(/\.[^.]+$/, '') || 'My comic', fs.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))); } },
        { icon: '📕', label: 'PDF comic', run: async () => { const [f] = await pickFiles('application/pdf,.pdf', { multiple: false }); if (f) { await DB.put('comics', { id: uid(), title: f.name.replace(/\.pdf$/i, ''), kind: 'pdf', pages: [f], created: Date.now() }); show(); } } },
      ]);
    }
    async function addCbz(f) {
      UI.toast('Opening comic…');
      try { const ents = (await Zip.read(f)).filter(e => IMG_RE.test(e.name) && !/__MACOSX|\/\./.test(e.name)).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
        if (!ents.length) throw new Error('No pictures found in that file.');
        await save(f.name.replace(/\.(cbz|zip)$/i, ''), ents.map(e => new Blob([e.blob], { type: /png$/i.test(e.name) ? 'image/png' : /webp$/i.test(e.name) ? 'image/webp' : /gif$/i.test(e.name) ? 'image/gif' : 'image/jpeg' })));
      } catch (e) { UI.toast(e.message, 4000); }
    }
    async function save(title, pages) { const th = await imageThumb(pages[0], 360); await DB.put('comics', { id: uid(), title, kind: 'images', pages, cover: th && th.url, last: 0, created: Date.now() }); UI.toast('Added “' + title + '” (' + pages.length + ' pages)'); show(); }
    function read(c) {
      if (c.kind === 'pdf') { const u = URL.createObjectURL(new Blob([c.pages[0]], { type: 'application/pdf' })); UI.sheet({ title: c.title, onClose: () => URL.revokeObjectURL(u), body: h('iframe', { src: u, title: c.title, style: { width: '100%', height: '70vh', border: 0, background: '#fff', borderRadius: '10px' } }), actions: [{ label: '📤 Open in Books / Files', cls: 'pri', onClick: () => saveFile(c.pages[0], c.title + '.pdf') }] }); return; }
      let i = clamp(c.last || 0, 0, c.pages.length - 1), url = null, fitW = Prefs.get('comicFitW', false);
      const img = h('img', { alt: 'Page' }), pg = h('div', { class: 'pg' + (fitW ? ' fit-w' : '') }, img), count = h('span', { style: { minWidth: '70px', textAlign: 'center', fontWeight: 600 } }), slider = h('input', { type: 'range', min: 1, max: c.pages.length, value: i + 1, 'aria-label': 'Page' });
      const showP = () => { if (url) URL.revokeObjectURL(url); url = URL.createObjectURL(c.pages[i]); img.src = url; count.textContent = (i + 1) + ' / ' + c.pages.length; slider.value = i + 1; pg.scrollTop = 0; c.last = i; c.opened = Date.now(); DB.put('comics', c); };
      const go = d => { const n = clamp(i + d, 0, c.pages.length - 1); if (n !== i) { i = n; showP(); } else if (d > 0) UI.toast('The end! 🎉'); };
      const close = () => { if (url) URL.revokeObjectURL(url); el.remove(); removeEventListener('keydown', key); show(); };
      slider.oninput = () => { i = slider.value - 1; showP(); };
      const el = h('div', { class: 'creader', role: 'dialog', 'aria-label': c.title }, h('div', { class: 'bar' }, h('button', { class: 'ib', 'aria-label': 'Close', html: SVG.close, onclick: close }), h('b', { style: { flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, c.title), h('button', { class: 'btn sm', onclick: () => { fitW = !fitW; Prefs.set('comicFitW', fitW); pg.classList.toggle('fit-w', fitW); } }, '↔ Fit')), pg, h('div', { class: 'bot' }, h('button', { class: 'ib', 'aria-label': 'Previous page', onclick: () => go(-1) }, '‹'), slider, count, h('button', { class: 'ib', 'aria-label': 'Next page', onclick: () => go(1) }, '›')));
      pg.addEventListener('click', e => { const r = pg.getBoundingClientRect(); if (e.clientX - r.left < r.width * 0.3) go(-1); else if (e.clientX - r.left > r.width * 0.7) go(1); });
      let sx = null; pg.addEventListener('touchstart', e => { sx = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive: true }); pg.addEventListener('touchend', e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 60 && (window.visualViewport ? visualViewport.scale <= 1.01 : true)) go(dx < 0 ? 1 : -1); sx = null; });
      const key = e => { if (e.key === 'ArrowRight' || e.key === ' ') go(1); else if (e.key === 'ArrowLeft') go(-1); else if (e.key === 'Escape') close(); };
      addEventListener('keydown', key); document.body.append(el); showP();
    }
    function sites() {
      body.append(h('p', { class: 'muted small' }, 'Great places to read comics online (needs internet).'), h('div', { class: 'list' }, COMIC_SITES.map(([e, n, d, u]) => h('button', { class: 'li', onclick: () => window.open(u, '_blank', 'noopener') }, h('span', { class: 'ic' }, e), h('span', { class: 't' }, h('b', null, n), h('small', null, d)), h('span', { class: 'chev' }, '↗')))),
        h('p', { class: 'tiny muted mt' }, 'Tip: free classic comics from Digital Comic Museum and Comic Book Plus download as .cbz files — add them here under “My comics” to read offline.'));
    }
    /* ---------- comic maker ---------- */
    function make() {
      const W = 1080, H = 1350, LAYOUTS = { '1': [[0, 0, 1, 1]], '2': [[0, 0, 1, .5], [0, .5, 1, .5]], '3': [[0, 0, 1, 1 / 3], [0, 1 / 3, 1, 1 / 3], [0, 2 / 3, 1, 1 / 3]], '2x2': [[0, 0, .5, .5], [.5, 0, .5, .5], [0, .5, .5, .5], [.5, .5, .5, .5]], '1+2': [[0, 0, 1, .5], [0, .5, .5, .5], [.5, .5, .5, .5]], '2x3': [[0, 0, .5, 1 / 3], [.5, 0, .5, 1 / 3], [0, 1 / 3, .5, 1 / 3], [.5, 1 / 3, .5, 1 / 3], [0, 2 / 3, .5, 1 / 3], [.5, 2 / 3, .5, 1 / 3]] };
      let doc = Prefs.get('comicDraft', null) || { layout: '2x2', title: 'My comic', panels: {} }, sel = 0, selItem = -1, photos = {};
      const BG = ['#FFFFFF', '#FFF4C2', '#D6F5FF', '#E3FFD6', '#FFE0EC', '#EDE3FF', '#20222B'];
      const cv = h('canvas', { width: W, height: H, 'aria-label': 'Comic page' }), g = cv.getContext('2d');
      const tools = h('div', { class: 'row mt', style: { justifyContent: 'center' } }), lay = h('div', { class: 'chips', style: { justifyContent: 'center' } });
      body.append(h('div', { class: 'maker' }, lay, h('div', { class: 'mt' }, cv), tools), h('p', { class: 'tiny muted center mt' }, 'Tap a panel, then add characters, speech bubbles or a photo. Drag things to move them.'));
      const P = k => (doc.panels[k] = doc.panels[k] || { bg: '#FFFFFF', items: [] });
      const rect = k => { const [x, y, w, hh] = LAYOUTS[doc.layout][k], m = 22; return [x * W + m, y * H + m, w * W - 2 * m, hh * H - 2 * m]; };
      const save = debounce(() => { const d = JSON.parse(JSON.stringify(doc)); Prefs.set('comicDraft', d); }, 300);
      async function loadPhotos() { for (const k in doc.panels) { const p = doc.panels[k]; if (p.photo && !photos[p.photo]) { const m = await DB.get('media', p.photo); if (m) { const im = new Image(); im.src = URL.createObjectURL(m.blob); await new Promise(r => { im.onload = r; im.onerror = r; }); photos[p.photo] = im; } } } draw(); }
      function bubble(x, y, w, hh, text, kind) {
        g.save(); g.fillStyle = '#fff'; g.strokeStyle = '#111'; g.lineWidth = 5;
        if (kind === 'think') { g.beginPath(); g.ellipse(x, y, w / 2, hh / 2, 0, 0, 6.283); g.fill(); g.stroke(); [[.35, .62, 16], [.42, .75, 10]].forEach(([a, b, r]) => { g.beginPath(); g.arc(x - w * (a - .5) * 2 * .5 - w * .2, y + hh * b - hh * .1, r, 0, 6.283); g.fill(); g.stroke(); }); }
        else if (kind === 'shout') { g.beginPath(); for (let i = 0; i < 24; i++) { const a = i / 24 * 6.283, r = i % 2 ? 1 : 1.18; g.lineTo(x + Math.cos(a) * w / 2 * r, y + Math.sin(a) * hh / 2 * r); } g.closePath(); g.fillStyle = '#FFE14D'; g.fill(); g.stroke(); }
        else if (kind === 'caption') { g.fillStyle = '#FFF3A8'; g.fillRect(x - w / 2, y - hh / 2, w, hh); g.strokeRect(x - w / 2, y - hh / 2, w, hh); }
        else { g.beginPath(); g.ellipse(x, y, w / 2, hh / 2, 0, 0, 6.283); g.moveTo(x - w * .12, y + hh * .42); g.lineTo(x - w * .25, y + hh * .85); g.lineTo(x + w * .02, y + hh * .47); g.fill(); g.stroke(); g.beginPath(); g.ellipse(x, y, w / 2 - 3, hh / 2 - 3, 0, 0, 6.283); g.fill(); }
        g.fillStyle = '#111'; g.textAlign = 'center'; g.textBaseline = 'middle'; const fs = Math.max(22, Math.min(44, hh / 3.2)); g.font = (kind === 'shout' ? '900 ' : '700 ') + fs + 'px "Comic Sans MS","Chalkboard SE","Marker Felt",sans-serif';
        const words = String(text).split(/\s+/), lines = []; let line = ''; for (const wd of words) { const t = line ? line + ' ' + wd : wd; if (g.measureText(t).width > w * .78 && line) { lines.push(line); line = wd; } else line = t; } lines.push(line);
        lines.forEach((l, i) => g.fillText(kind === 'shout' ? l.toUpperCase() : l, x, y + (i - (lines.length - 1) / 2) * fs * 1.15)); g.restore();
      }
      function draw() {
        g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
        LAYOUTS[doc.layout].forEach((_, k) => {
          const [x, y, w, hh] = rect(k), p = P(k); g.save(); g.beginPath(); g.rect(x, y, w, hh); g.clip(); g.fillStyle = p.bg; g.fillRect(x, y, w, hh);
          const ph = p.photo && photos[p.photo]; if (ph) { const s2 = Math.max(w / ph.width, hh / ph.height); g.drawImage(ph, x + (w - ph.width * s2) / 2, y + (hh - ph.height * s2) / 2, ph.width * s2, ph.height * s2); }
          p.items.forEach((it, j) => { const cx = x + it.x * w, cy = y + it.y * hh;
            if (it.t === 'emoji') { g.font = (90 * it.s) + 'px system-ui,"Apple Color Emoji"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(it.e, cx, cy); }
            else bubble(cx, cy, 300 * it.s, (it.k === 'caption' ? 90 : 170) * it.s, it.text, it.k);
            if (k === sel && j === selItem) { g.strokeStyle = '#3B82F6'; g.setLineDash([12, 8]); g.lineWidth = 4; const r = it.t === 'emoji' ? 60 * it.s : 170 * it.s; g.strokeRect(cx - r, cy - r * (it.t === 'emoji' ? 1 : .6), r * 2, r * (it.t === 'emoji' ? 2 : 1.2)); g.setLineDash([]); } });
          g.restore(); g.lineWidth = 10; g.strokeStyle = '#111'; g.strokeRect(x, y, w, hh);
          if (k === sel) { g.lineWidth = 6; g.strokeStyle = '#3B82F6'; g.strokeRect(x - 8, y - 8, w + 16, hh + 16); }
        });
        tools.innerHTML = ''; if (sel < 0) return; const p = P(sel), it = p.items[selItem];
        const add = item => { p.items.push(Object.assign({ x: .5, y: .45, s: 1 }, item)); selItem = p.items.length - 1; save(); draw(); };
        tools.append(...[
          h('button', { class: 'btn sm', onclick: () => { const s2 = UI.sheet({ title: 'Pick a character', body: h('div', { class: 'stickers' }, STICKERS.concat('🧑‍🚀🦸🦹🧙🧚🧛🧜🧞🧟🥷🤴👸🐕🐈🐲🦖🦕👾'.match(/\p{Extended_Pictographic}(‍\p{Extended_Pictographic})?/gu)).map(e => h('button', { onclick: () => { s2.close(); add({ t: 'emoji', e, y: .62 }); } }, e))) }); } }, '😀 Character'),
          h('button', { class: 'btn sm', onclick: async () => { const t = await UI.prompt('What do they say?', { placeholder: 'Hi!', ok: 'Add' }); if (t) add({ t: 'bubble', k: 'speech', text: t, y: .25 }); } }, '💬 Speech'),
          h('button', { class: 'btn sm', onclick: async () => { const t = await UI.prompt('What do they think?', { ok: 'Add' }); if (t) add({ t: 'bubble', k: 'think', text: t, y: .25 }); } }, '💭 Think'),
          h('button', { class: 'btn sm', onclick: async () => { const t = await UI.prompt('Sound effect', { value: 'POW!', ok: 'Add' }); if (t) add({ t: 'bubble', k: 'shout', text: t, s: .9 }); } }, '💥 Boom'),
          h('button', { class: 'btn sm', onclick: async () => { const t = await UI.prompt('Caption', { placeholder: 'Meanwhile…', ok: 'Add' }); if (t) add({ t: 'bubble', k: 'caption', text: t, y: .1 }); } }, '📝 Caption'),
          h('button', { class: 'btn sm', onclick: async () => { const [f] = await pickFiles('image/*', { multiple: false }); if (!f) return; const [rec] = [await (async () => { await Media.add([f]); return (await DB.all('media')).sort((a, b) => b.created - a.created)[0]; })()]; p.photo = rec.id; save(); loadPhotos(); } }, '🖼️ Photo'),
          h('button', { class: 'btn sm', onclick: () => { p.bg = BG[(BG.indexOf(p.bg) + 1) % BG.length]; save(); draw(); } }, '🎨 Color'),
          it ? h('button', { class: 'btn sm', onclick: () => { it.s = Math.min(3, it.s * 1.2); save(); draw(); } }, '＋') : null,
          it ? h('button', { class: 'btn sm', onclick: () => { it.s = Math.max(.4, it.s / 1.2); save(); draw(); } }, '－') : null,
          it ? h('button', { class: 'btn sm bad', onclick: () => { p.items.splice(selItem, 1); selItem = -1; save(); draw(); } }, '🗑️') : null].filter(Boolean));
      }
      lay.append(...Object.keys(LAYOUTS).map(k => h('button', { class: 'chip', 'aria-pressed': String(k === doc.layout), onclick: e => { doc.layout = k; sel = 0; selItem = -1; $$('.chip', lay).forEach(b => b.setAttribute('aria-pressed', String(b === e.currentTarget))); save(); draw(); } }, { '1': '▢ 1', '2': '▤ 2', '3': '☰ 3', '2x2': '⊞ 4', '1+2': '⊟ 3', '2x3': '▦ 6' }[k])));
      const pt = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
      let drag = null;
      cv.addEventListener('pointerdown', e => {
        const [px, py] = pt(e); const k = LAYOUTS[doc.layout].findIndex((_, j) => { const [x, y, w, hh] = rect(j); return px >= x && px <= x + w && py >= y && py <= y + hh; }); if (k < 0) return;
        sel = k; const [x, y, w, hh] = rect(k), p = P(k); selItem = -1;
        for (let j = p.items.length - 1; j >= 0; j--) { const it = p.items[j], r = it.t === 'emoji' ? 60 * it.s : 150 * it.s; if (Math.abs(x + it.x * w - px) < r && Math.abs(y + it.y * hh - py) < r * .8) { selItem = j; drag = { k, j, ox: px - (x + it.x * w), oy: py - (y + it.y * hh) }; cv.setPointerCapture(e.pointerId); break; } }
        draw();
      });
      cv.addEventListener('pointermove', e => { if (!drag) return; const [px, py] = pt(e), [x, y, w, hh] = rect(drag.k), it = P(drag.k).items[drag.j]; it.x = clamp((px - drag.ox - x) / w, 0, 1); it.y = clamp((py - drag.oy - y) / hh, 0, 1); draw(); });
      cv.addEventListener('pointerup', () => { if (drag) save(); drag = null; });
      ctx.setActions(h('button', { class: 'btn ghost sm', onclick: async () => { if (await UI.ask('Start a new blank comic?', { ok: 'New comic' })) { doc = { layout: '2x2', title: 'My comic', panels: {} }; sel = 0; selItem = -1; Prefs.set('comicDraft', null); draw(); } } }, 'New'),
        h('button', { class: 'btn pri sm', onclick: async () => { selItem = -1; sel = -1; draw(); const t = await UI.prompt('Name your comic', { value: doc.title, ok: 'Save' }); sel = 0; if (!t) { draw(); return; } doc.title = t; const blob = await new Promise(r => cv.toBlob(r, 'image/png')); await Media.addCanvas(cv, t, 'drawing'); await save2(t, blob); draw(); } }, 'Save'));
      async function save2(t, blob) { const th = await imageThumb(cv, 360); await DB.put('comics', { id: uid(), title: t, kind: 'images', pages: [blob], cover: th && th.url, last: 0, created: Date.now() }); UI.toast('Saved to My comics and Photos 🎉'); }
      draw(); loadPhotos();
      return () => { for (const k in photos) URL.revokeObjectURL(photos[k].src); };
    }
    show();
    return () => { if (stop) stop(); };
  },
});

/* ---- 28-cube-cases.js ---- */
/* ===== All 119 CFOP cases (41 F2L, 57 OLL, 21 PLL): every algorithm and scramble-style setup checked in the cube simulator by tools/gen_cfop.py ===== */
const CUBE_CASES = {"f2l":[{"id":"f2l1","n":1,"name":"F2L 1","group":"Both on top","look":"The white corner is above its slot, white facing up. Its edge is on the top right, green side up.","alg":"R U2 R' U' R U R'","len":7,"setups":["U R2 U' R2 U R2 F2 U2 F2 D R2 D' R F2 U2 F2 R' U2","D' R2 D R2 D' R2 F2 D2 F2 U' R2 D2 U' L U2 F2 U2 L' U2"]},{"id":"f2l2","n":2,"name":"F2L 2","group":"Both on top","look":"The white corner is above its slot, white facing up. Its edge is on the top right, orange side up.","alg":"U2 F2 U2 F U F' U F2","len":8,"setups":["U2 F2 L2 U' L2 U L2 D' L2 D F U' F' U2 F U F' U F2","L2 D2 U2 L2 D F2 D' L2 F2 D' F' D F' D2 U2 L2 F U' F'"]},{"id":"f2l3","n":3,"name":"F2L 3","group":"Both on top","look":"The white corner is above its slot, white facing up. Its edge is on the top front, green side up.","alg":"U2 R2 U2 R' U' R U' R2","len":8,"setups":["R2 D F2 L2 D L2 D' L2 U L2 U' F2 R D' L' F2 L D R","D F2 D' F2 U L2 F2 D2 F2 U L2 U' L D2 F2 D2 L' D' U'"]},{"id":"f2l4","n":4,"name":"F2L 4","group":"Both on top","look":"The white corner is above its slot, white facing up. Its edge is on the top front, orange side up.","alg":"F' U2 F U F' U' F","len":7,"setups":["U' F2 U F2 U' F2 R2 U2 R2 D' F2 D F' R2 U2 R2 F U2","D F2 U' R2 U R2 D2 F2 U' R2 U F2 D2 F' D2 R2 D2 F' R2"]},{"id":"f2l5","n":5,"name":"F2L 5","group":"Both on top","look":"The white corner is above its slot, white facing up. Its edge is on the top left, green side up.","alg":"U2 R U R2 F R F'","len":7,"setups":["U2 F2 L2 U' L2 D L2 D' L2 F2 U' R2 D' R' F2 U2 F2 R'","F2 D L2 D' L2 U' F2 U2 L2 U R2 D R2 U2 L' D2 F2 D2 L'"]},{"id":"f2l6","n":6,"name":"F2L 6","group":"Both on top","look":"The white corner is above its slot, white facing up. Its edge is on the top left, orange side up.","alg":"U' F' U' L F' L' F2","len":7,"setups":["U' F2 U' F2 L2 U2 L2 D F2 D2 L2 D L2 F L2 U2 L2 F U'","D' R2 D' R2 U2 F2 U' F2 D2 F2 R2 D' R2 F L2 U2 L2 F U'"]},{"id":"f2l7","n":7,"name":"F2L 7","group":"Both on top","look":"The white corner is above its slot, white facing up. Its edge is on the top back, green side up.","alg":"U R U2 R2 F R F'","len":7,"setups":["D F2 D' F2 L2 D2 R2 U R2 D2 F2 U F2 L' U2 F2 U2 L' U","U L2 D F2 D2 L2 D F2 U2 F2 L2 U' F2 L' U2 F2 U2 L' U"]},{"id":"f2l8","n":8,"name":"F2L 8","group":"Both on top","look":"The white corner is above its slot, white facing up. Its edge is on the top back, orange side up.","alg":"F' L' U2 L F","len":5,"setups":["U F2 L2 D F2 U' R2 U2 R2 F2 D' L2 F2 U F' L2 U2 L2 F","D' F2 L2 U' F2 D R2 D2 R2 F2 U L2 F2 D' F' R2 U2 R2 F"]},{"id":"f2l9","n":9,"name":"F2L 9","group":"Both on top","look":"The white corner is above its slot, white facing right. Its edge is on the top right, green side up.","alg":"U' R U' R' U R U R'","len":8,"setups":["R2 U F2 R2 F2 U' R2 U R2 D' F2 D R' F2 R' F2 U' R'","F2 U' L2 D R2 D' L2 D' U' F2 D U' R' F2 R' F2 U' R'"]},{"id":"f2l10","n":10,"name":"F2L 10","group":"Both on top","look":"The white corner is above its slot, white facing right. Its edge is on the top right, orange side up.","alg":"R U' R' U2 F' U' F","len":7,"setups":["R2 U' L2 U R2 U2 F2 U2 F2 U' L2 U F' D F' D' U F U'","R2 D' B2 U F2 L2 U' B2 D2 F2 D' F' D F' D' U F U'"]},{"id":"f2l11","n":11,"name":"F2L 11","group":"Both on top","look":"The white corner is above its slot, white facing right. Its edge is on the top front, green side up.","alg":"R' U2 R2 U R2 U R","len":7,"setups":["R2 D' R2 U2 F2 U F2 U R2 D L R' U' R' U L' U","R2 U' L2 F2 U2 R2 D' F2 D2 U R2 D' L' R U R' U L' U"]},{"id":"f2l12","n":12,"name":"F2L 12","group":"Both on top","look":"The white corner is above its slot, white facing right. Its edge is on the top front, orange side up.","alg":"U' F' U F","len":4,"setups":["L2 D' L2 F2 D2 F2 D F2 U2 R2 U R2 U F U' F2 D F' U","D L2 U' L2 D2 F2 U' F2 D' F2 U2 F2 L2 F' L2 F L2 F' D2"]},{"id":"f2l13","n":13,"name":"F2L 13","group":"Both on top","look":"The white corner is above its slot, white facing right. Its edge is on the top left, green side up.","alg":"F2 U' L' U L F2","len":6,"setups":["U R2 D' L2 D R2 D U F2 D' U L F2 L F2 U L F2","R2 D2 L2 D' U' R2 D F2 D' R2 U L2 R D2 F2 L F2 D R"]},{"id":"f2l14","n":14,"name":"F2L 14","group":"Both on top","look":"The white corner is above its slot, white facing right. Its edge is on the top left, orange side up.","alg":"U2 F' L' U' L U2 F","len":7,"setups":["R2 U2 F2 U' F2 U' F2 U2 F2 U R2 F R' F' U' F' U F R","F2 D R2 D' R2 F2 U' L2 D2 L2 U' F' L2 F D2 F' L2 U F"]},{"id":"f2l15","n":15,"name":"F2L 15","group":"Both on top","look":"The white corner is above its slot, white facing right. Its edge is on the top back, green side up.","alg":"R U R'","len":3,"setups":["U2 L2 U' L2 U' L2 U' R2 U' L2 U F U R' U R U2 F' R2","U' F2 U F2 D' F2 D2 R2 U2 R2 D' L' R U' R U' L U' R2"]},{"id":"f2l16","n":16,"name":"F2L 16","group":"Both on top","look":"The white corner is above its slot, white facing right. Its edge is on the top back, orange side up.","alg":"R2 U2 F R2 F' U2 R2","len":7,"setups":["D' R2 U R2 U F2 U' R2 U' R2 D R2 F' R2 F R2 U2 F U2","U2 R2 U' F2 U' F2 U2 R2 U F2 U' B U' F U B' F U"]},{"id":"f2l17","n":17,"name":"F2L 17","group":"Both on top","look":"The white corner is above its slot, white facing you. Its edge is on the top right, green side up.","alg":"U R U' R'","len":4,"setups":["R2 D L2 U' L2 U' L2 D L2 U L2 F2 U L D2 R' D2 L D2","F2 R2 D R2 D' F2 D' F2 D F2 D R2 D' L' F2 L D2 R' D2"]},{"id":"f2l18","n":18,"name":"F2L 18","group":"Both on top","look":"The white corner is above its slot, white facing you. Its edge is on the top right, orange side up.","alg":"F U2 F2 U' F2 U' F'","len":7,"setups":["F2 U L2 U2 F2 U' F2 U' L2 U' F2 U' L' U F' U F U2 L","D2 F2 U L2 U L2 U2 L2 U L2 F2 D2 L U F' U F U2 L'"]},{"id":"f2l19","n":19,"name":"F2L 19","group":"Both on top","look":"The white corner is above its slot, white facing you. Its edge is on the top front, green side up.","alg":"F' U F U2 R U R'","len":7,"setups":["F2 D L2 D2 U L2 F2 U R2 U2 R2 D R D' R D U' R' U","D2 L2 B2 U2 L2 D F2 D R2 D' L2 U' R U' L U' L R' D"]},{"id":"f2l20","n":20,"name":"F2L 20","group":"Both on top","look":"The white corner is above its slot, white facing you. Its edge is on the top front, orange side up.","alg":"U F' U F U' F' U' F","len":8,"setups":["L2 D U2 R2 U R2 F2 U F2 D2 F' L2 F L2 D F'","F2 U' R2 F2 R2 U F2 U' F2 D R2 D' F R2 F R2 U F"]},{"id":"f2l21","n":21,"name":"F2L 21","group":"Both on top","look":"The white corner is above its slot, white facing you. Its edge is on the top left, green side up.","alg":"F2 U2 R' F2 R U2 F2","len":7,"setups":["U' R2 D' L2 D L2 R2 U F2 U' L2 U R U2 F2 R' D2 L D2","L2 D' L2 D F2 D F2 U' R2 D' F2 U R F2 R' F2 U2 R' U2"]},{"id":"f2l22","n":22,"name":"F2L 22","group":"Both on top","look":"The white corner is above its slot, white facing you. Its edge is on the top left, orange side up.","alg":"F' U' F","len":3,"setups":["D2 R2 D' R2 D' F2 U' L2 U2 L2 R U' F U' F' U2 R' F2","D2 F2 R2 B2 U' L2 U' L2 B2 U' R' U' F U' F' U2 R' F2"]},{"id":"f2l23","n":23,"name":"F2L 23","group":"Both on top","look":"The white corner is above its slot, white facing you. Its edge is on the top back, green side up.","alg":"F2 L' U' L U F2","len":6,"setups":["R2 U R2 F2 D2 R2 U' R2 U F2 D' R F2 R D2 R' F2 U' R'","U R2 D R2 U' L2 F2 U2 F2 L2 U R F2 R D2 R' F2 U' R'"]},{"id":"f2l24","n":24,"name":"F2L 24","group":"Both on top","look":"The white corner is above its slot, white facing you. Its edge is on the top back, orange side up.","alg":"F' U L' U' L U2 F","len":7,"setups":["D2 F2 L2 D U2 F2 U F2 L2 R2 D2 U F R2 U2 F' R2 D' F'","D2 F2 L2 U' L2 U L2 D' U L2 R2 U' F R2 U2 F' R2 D' F'"]},{"id":"f2l25","n":25,"name":"F2L 25","group":"Edge in the slot","look":"The white corner is above its slot, white facing up. Its edge is in its slot.","alg":"R2 U R2 U R2 U2 R2","len":7,"setups":["U R2 D' F2 D2 R2 D' F2 R2 D2 L2 D L2 F2 D","U2 L2 U' F2 U F2 U2 R2 U' L2 U R2 F2 U F2"]},{"id":"f2l26","n":26,"name":"F2L 26","group":"Edge in the slot","look":"The white corner is above its slot, white facing up. Its edge is in its slot but flipped.","alg":"R U' R' F' U2 F","len":6,"setups":["L2 F2 U' F2 U L2 D' L2 D L2 F2 R F2 R' F' R F' U' R'","U F2 R2 U' F2 U2 R2 U F2 U2 R2 F' R' D' F2 D F R U2"]},{"id":"f2l27","n":27,"name":"F2L 27","group":"Edge in the slot","look":"The white corner is above its slot, white facing right. Its edge is in its slot.","alg":"U2 F' L' U2 L U2 F","len":7,"setups":["R2 U R2 U' R2 U2 F2 U R2 U R2 U2 F2 L' U R2 U' L U'","R2 U R2 U F2 U2 R2 D' F2 D R2 U2 F2 L' U R2 U' L U'"]},{"id":"f2l28","n":28,"name":"F2L 28","group":"Edge in the slot","look":"The white corner is above its slot, white facing right. Its edge is in its slot but flipped.","alg":"U F' U' F U' R U R'","len":8,"setups":["R2 U' R2 D' U' F2 D U F2 R2 U' R' F' R U2 R' U R' F","R2 D' F2 D U' F2 U2 R2 U2 R2 U' R' F' R U2 R' U R' F"]},{"id":"f2l29","n":29,"name":"F2L 29","group":"Edge in the slot","look":"The white corner is above its slot, white facing you. Its edge is in its slot.","alg":"U' F' U2 L' U2 L F","len":7,"setups":["F2 D' L2 D F2 D2 L2 D' R2 U' R2 D2 F2 R U' L2 U R' D","F2 D' L2 U' F2 U2 L2 U L2 U' L2 U2 F2 R U' L2 U R' D"]},{"id":"f2l30","n":30,"name":"F2L 30","group":"Edge in the slot","look":"The white corner is above its slot, white facing you. Its edge is in its slot but flipped.","alg":"U' R U R' U F' U' F","len":8,"setups":["F2 D' L2 F2 U F2 D' L2 D2 F2 U2 R U R' U F' U' F U'","F2 U' F2 R2 D' U2 F2 D F2 U2 R' U R' U F' U' F U'"]},{"id":"f2l31","n":31,"name":"F2L 31","group":"Corner in the slot","look":"The white corner is in its slot, white facing down. Its edge is on the top front, green side up.","alg":"F' U2 F U2 R U R'","len":7,"setups":["L2 F2 R2 U' L2 U R2 F2 L2 U' F2 U2 L U2 F2 U2 L' U'","D' R2 D' L2 D' U2 L2 R2 U' R2 D' R' F2 U2 F2 R' U'"]},{"id":"f2l32","n":32,"name":"F2L 32","group":"Corner in the slot","look":"The white corner is in its slot, white facing down. Its edge is on the top front, orange side up.","alg":"F U2 L F L' U2 F'","len":7,"setups":["U' F2 U L2 R2 U' L2 D2 U' R2 D2 F R2 U2 R2 F U2","L2 D' U F2 D' F2 R2 D2 F2 D2 F2 U' L2 F U2 R2 U2 F' R2"]},{"id":"f2l33","n":33,"name":"F2L 33","group":"Corner in the slot","look":"The white corner is in its slot, white facing you. Its edge is on the top front, green side up.","alg":"U' R U' R2 F R F'","len":7,"setups":["U' L2 F2 D F2 U' R2 U2 R2 F2 D' L U2 L' U2 L' F2 U' L2","U' L2 F2 U L2 U' F2 U2 F2 L2 U' L U2 L' U2 L' F2 U' L2"]},{"id":"f2l34","n":34,"name":"F2L 34","group":"Corner in the slot","look":"The white corner is in its slot, white facing you. Its edge is on the top front, orange side up.","alg":"U R' F R F2 U' F","len":7,"setups":["R2 U R2 D R2 D' R2 F2 U' F2 R2 U' R' F U2 F' U2 R' F'","R2 D B2 D B2 D' B2 R2 U' R2 B2 D' R' F U2 F' U2 R' F'"]},{"id":"f2l35","n":35,"name":"F2L 35","group":"Corner in the slot","look":"The white corner is in its slot, white facing right. Its edge is on the top front, green side up.","alg":"U F' U F R U R'","len":7,"setups":["L2 U' R2 U2 F2 U F2 U L2 R2 U L2 R' D' L F2 L D R","F2 U R2 U R2 U R2 U2 R2 U F2 R' D' L F2 L' D R"]},{"id":"f2l36","n":36,"name":"F2L 36","group":"Corner in the slot","look":"The white corner is in its slot, white facing right. Its edge is on the top front, orange side up.","alg":"R U2 R' F' U2 F","len":6,"setups":["U' R2 D' F2 U2 F2 D F2 U2 R2 U2 F R2 F R2 U2 F","U' R2 U R2 D R2 D' U' F2 R2 U2 F R2 F R2 U2 F"]},{"id":"f2l37","n":37,"name":"F2L 37","group":"Both in the slot","look":"The white corner is in its slot, white facing down. Its edge is in its slot but flipped.","alg":"R U' R U2 F R2 F' U2 R2","len":9,"setups":["R2 U2 R2 F2 D2 L2 D L2 D F2 U' R' F R F' U R U2 R'","D U R2 D F2 R2 D2 R2 F2 D2 R F' D' F2 D R F U'"]},{"id":"f2l38","n":38,"name":"F2L 38","group":"Both in the slot","look":"The white corner is in its slot, white facing you. Its edge is in its slot.","alg":"R U' R' F2 L' U' L U F2","len":9,"setups":["F2 U R2 U' F2 U R2 U' F2 D L U' R2 U L' D'","F2 D' F2 D2 U' L2 D' R2 D R2 D' R' D L2 D' R U"]},{"id":"f2l39","n":39,"name":"F2L 39","group":"Both in the slot","look":"The white corner is in its slot, white facing you. Its edge is in its slot but flipped.","alg":"F' L' U2 L F R U R'","len":8,"setups":["D' L2 U F2 U' L2 U2 F2 D' L2 D2 F U' F' R' F2 R F2 U'","D' F2 D2 R2 U R2 F2 D L2 D' F D' F' R U L2 U2 R'"]},{"id":"f2l40","n":40,"name":"F2L 40","group":"Both in the slot","look":"The white corner is in its slot, white facing right. Its edge is in its slot.","alg":"R U2 R U R' U R U2 R2","len":9,"setups":["L2 U' L2 U R2 U' L2 U L2 U' L' U R2 U' L U","L2 U' L2 U R2 U' L2 D F2 U' F2 D' U L U R2 U' L U"]},{"id":"f2l41","n":41,"name":"F2L 41","group":"Both in the slot","look":"The white corner is in its slot, white facing right. Its edge is in its slot but flipped.","alg":"R U' R' F' L' U2 L F","len":8,"setups":["F2 L2 R2 U R2 D R2 U' R2 D2 L' D L' F' R F' R U2 R2","B2 D2 L2 D2 L2 U B2 U R2 U' B' D' B R F' R F D U'"]}],"oll":[{"id":"oll1","n":1,"name":"Dot","alg":"R U2 R2 F R F' U2 R' F R F'","len":11,"setups":["U' L2 U F2 D F2 U' F' D' L' F U F R' F R F2 L'","U2 F' L F L' U2 F' L F L2 U2 L"]},{"id":"oll2","n":2,"name":"Dot","alg":"F R U R' U' F' f R U R' U' f'","len":12,"setups":["R2 F2 U2 F2 R2 U R2 D' F2 L F L' U F2 D R F' R U2","L2 F2 D R2 U' R2 U F2 R' F' R D' L' F U2 F' U' L'"]},{"id":"oll3","n":3,"name":"Dot","alg":"f R U R' U' f' U' F R U R' U' F'","len":13,"setups":["L2 U F2 U F2 U2 L2 U' L F L' F2 U L' U L F U' F","R2 D R2 D' F2 U F2 U2 R U2 R2 U2 R F R F2 U2 F R"]},{"id":"oll4","n":4,"name":"Dot","alg":"f R U R' U' f' U F R U R' U' F'","len":13,"setups":["R2 U R2 F2 U F2 R2 U' R F' L' U2 L2 F' L' F R' F R2","F2 R2 U' R2 U F2 U R' U F' U R' F' U F2 R U' R"]},{"id":"oll5","n":5,"name":"Square","alg":"r' U2 R U R' U r","len":7,"setups":["F2 R2 U2 R2 F2 R2 U2 L F' R F' L' U2 R","R2 F2 L2 U2 L2 F2 L2 U2 L' F' R F' L' U2 R"]},{"id":"oll6","n":6,"name":"Square","alg":"r U2 R' U' R U' r'","len":7,"setups":["U2 F2 D' R2 D F2 U2 F2 D' R2 D F L D L D' L2 F","L2 D2 R2 U' R2 U F2 D' F2 D' L2 F' L D L D' L2 F"]},{"id":"oll7","n":7,"name":"Lightning","alg":"r U R' U R U2 r'","len":7,"setups":["R2 D2 U2 L2 R2 D2 U2 L' F2 R' F' R F' L'","R2 D2 L2 F2 L2 D2 L2 F2 R D2 L' F' R F' L'"]},{"id":"oll8","n":8,"name":"Lightning","alg":"r' U' R U' R' U2 r","len":7,"setups":["D2 U2 R2 F2 R2 D2 R2 F2 L D2 R F L' F R U2","F2 D' U L2 U2 L2 D U' F' R' F R F2 L' U2 L"]},{"id":"oll9","n":9,"name":"Fish","alg":"R U R' U' R' F R2 U R' U' F'","len":11,"setups":["L2 U F2 D' L2 D L2 U' F2 L2 F U F' R' U' F2 U F R","L2 U F2 U' F2 D F2 D' F2 L2 F U F' R' U' F2 U F R"]},{"id":"oll10","n":10,"name":"Fish","alg":"R U R' U R' F R F' R U2 R'","len":11,"setups":["L2 D' L2 D F2 U' F2 U2 R' F2 L2 F' U2 L2 F L2 U2 F' R","U' R2 U2 L2 D' R2 F2 D' R' F2 D' L D' L' F R F' L2 U'"]},{"id":"oll11","n":11,"name":"Lightning","alg":"r U R' U R' F R F' R U2 r'","len":11,"setups":["F2 R2 U' R2 U R2 U L2 F' R2 F L2 R2 F L F L' U'","D' F2 U L2 U' L2 D2 R2 D' R' F L F L' F R2 F R F2"]},{"id":"oll12","n":12,"name":"Lightning","alg":"M' R' U' R U' R' U2 R U' R r'","len":11,"setups":["R2 F2 U' F2 R2 D' F2 D F' R' F' R' F R' F' U R2","R2 F2 D' L2 F2 U' F2 U L' F' L' F' L F' L' D R2"]},{"id":"oll13","n":13,"name":"Knight","alg":"F U R U' R2 F' R U R U' R'","len":11,"setups":["U F2 U F2 U' F2 U2 F L F' U F' U' L' U F'","F2 U F2 D' F2 D2 R2 U' R2 F' U2 F R' D' R F' U2 F'"]},{"id":"oll14","n":14,"name":"Knight","alg":"R' F R U R' F' R F U' F'","len":10,"setups":["R2 D' R2 U R2 U' R2 D R2 F D U R U' R' D' F' R2","F2 D2 B2 D B2 U' B2 U B2 R B2 L B' L' B' R' D F2"]},{"id":"oll15","n":15,"name":"Knight","alg":"r' U' r R' U' R U r' U r","len":10,"setups":["U L2 F2 L2 U2 L2 F2 L2 U' R' F' U' F2 U R F U' F' U2","U2 F2 L2 F2 U2 F2 L2 F2 U' F' L' U' L2 U F L U' L' U"]},{"id":"oll16","n":16,"name":"Knight","alg":"r U r' R U R' U' r U' r'","len":10,"setups":["U L2 F2 L2 U2 L2 F2 L2 U L F U F2 U' L' F' U F","L2 F2 D R2 F2 U F2 U' R2 F2 R' F' R D' L' F U F' L'"]},{"id":"oll17","n":17,"name":"Dot","alg":"R U R' U R' F R F' U2 R' F R F'","len":13,"setups":["F2 U' F2 U F2 U' F2 U' L2 F2 U R' F' R U' F2 L' F L'","F2 U2 L2 F2 U' L2 U' L2 U L2 U2 R' F' R U' F2 L' F L'"]},{"id":"oll18","n":18,"name":"Dot","alg":"r U R' U R U2 r2 U' R U' R' U2 r","len":13,"setups":["F2 U2 R2 U' F2 U' R2 U F2 U L R F' R U' F2 U' F2 U L'","F2 U2 R2 U' F2 U' R2 U F2 U L R F' R D' L2 U' L2 D L'"]},{"id":"oll19","n":19,"name":"Dot","alg":"M U R U R' U' M' R' F R F'","len":11,"setups":["U' L2 D L2 U R2 U2 F U F' L' U L2 R F' R D' L'","L2 D R2 D' L2 U' L2 D L' F' L' F U L R F' R D' L'"]},{"id":"oll20","n":20,"name":"Dot","alg":"r U R' U' M2 U R U' R' U' M'","len":11,"setups":["U F2 D2 U2 L2 F2 R2 D R2 F2 L2 D2 L R' F L' R U2 F2","U' R2 U L2 F2 R2 D L2 U2 L2 R2 D L' R F U2 F2 L' R"]},{"id":"oll21","n":21,"name":"Cross","alg":"R U2 R' U' R U R' U' R U' R'","len":11,"setups":["D2 F2 U F2 D U F2 U R2 D F2 R U2 F2 R' U2 R2 F2 R","D U L2 U L2 D2 F2 U R2 D F2 R U2 F2 R' U2 R2 F2 R"]},{"id":"oll22","n":22,"name":"Cross","alg":"R U2 R2 U' R2 U' R2 U2 R","len":9,"setups":["D' U2 R2 D' F2 D' F2 L2 D2 R2 D F U' F' L2 U F' L2 F","U B2 U' B2 U' L2 B2 U2 B2 U F U' F' L2 U F' L2 F"]},{"id":"oll23","n":23,"name":"Cross","alg":"R2 D' R U2 R' D R U2 R","len":9,"setups":["L2 U' L2 U F2 D U2 F2 D2 U2 R' U L2 U' R D L2","R2 D U' L2 R2 D' F2 R2 U' R2 U F2 R D L2 D' R U R2"]},{"id":"oll24","n":24,"name":"Cross","alg":"r U R' U' r' F R F'","len":8,"setups":["D' R2 D' L2 U' F2 U2 F2 U' F2 L2 D2 R' F2 L' D2 L F2 R'","F2 D L2 D' L2 D L2 U' L2 D' L2 R' D L2 D' R U F2"]},{"id":"oll25","n":25,"name":"Cross","alg":"F' r U R' U' r' F R","len":8,"setups":["R2 D U2 R2 D L2 D2 U2 R' D' L2 D R","D U' L2 B2 U F2 D' R2 B' D F2 D' B'"]},{"id":"oll26","n":26,"name":"Cross","alg":"R U2 R' U' R U' R'","len":7,"setups":["D2 U' L2 F2 R2 D R2 F2 L2 D2 U2 R U R' U L F2 L'","D2 U' R2 F2 L2 D L2 F2 R2 D2 U' F U F2 U' F2 U F"]},{"id":"oll27","n":27,"name":"Cross","alg":"R U R' U R U2 R'","len":7,"setups":["F2 L2 U2 L2 F2 L2 U2 L' F2 L' U' R U' R'","F2 D2 R2 F2 L2 D L2 F2 R2 D2 U F U' F U' F' U2 F"]},{"id":"oll28","n":28,"name":"Corners done","alg":"r U R' U' r' R U R U' R'","len":10,"setups":["R2 U R2 U F2 L2 U2 L2 F2 L2 U2 L' R' F' R2 F' L' R'","L2 F2 D R2 D' U2 F2 R2 U' F2 U' L R F' R2 F' L R'"]},{"id":"oll29","n":29,"name":"Awkward","alg":"R U R' U' R U' R' F' U' F R U R'","len":13,"setups":["L2 D L2 F2 L2 D' L2 R2 U' R2 D' F D F R2 U R F' R","R2 U' L2 B2 L2 F2 L2 U R2 B2 L2 F D F R2 U R F' R"]},{"id":"oll30","n":30,"name":"Awkward","alg":"F R' F R2 U' R' U' R U R' F2","len":11,"setups":["U L2 D R2 D' L2 D R2 D' F U' F' U F R' F R F2","R2 B2 U' R2 U B2 R2 U L2 U' F2 R' B' R2 B R F2 U L2"]},{"id":"oll31","n":31,"name":"P shape","alg":"R' U' F U R U' R' F' R","len":9,"setups":["U' R2 D R2 F2 L2 D' L2 F2 D' F2 U L F' D' F D L' F2","D' F2 U L2 B2 R2 U' B2 L2 U' F2 U L F' D' F D L' F2"]},{"id":"oll32","n":32,"name":"P shape","alg":"L U F' U' L' U L F L'","len":9,"setups":["U L2 D' L2 F2 R2 D R2 F2 D F2 U' R' F D F' D' R F2","D F2 U' R2 B2 L2 D L2 B2 U R2 D' R' F D F' D' R F2"]},{"id":"oll33","n":33,"name":"T shape","alg":"R U R' U' R' F R F'","len":8,"setups":["D R2 D' R2 U R2 U' R2 F2 U2 F U L' U2 L U' F","F2 U F2 D R2 U' R2 D' U F R' F2 R F' U' F2"]},{"id":"oll34","n":34,"name":"C shape","alg":"R U R2 U' R' F R U R U' F'","len":11,"setups":["U2 L2 D' L2 D F2 U' F2 U' F' U2 L2 U L U' L U2 F","F2 L2 F2 U' L2 U F2 L2 U' F' U F' R' F R F U' F"]},{"id":"oll35","n":35,"name":"Fish","alg":"R U2 R2 F R F' R U2 R'","len":9,"setups":["D2 U2 L2 R2 D2 U2 L2 R' U2 R' F R' F' R2 U2 R'","L2 D2 U2 L2 R2 D2 U2 R' U2 R' F R' F' R2 U2 R'"]},{"id":"oll36","n":36,"name":"W shape","alg":"L' U' L U' L' U L U L F' L' F","len":12,"setups":["D' L2 D F2 L2 U L2 F2 D' L2 D F' L U' L' U L' F","U' F2 U F2 L2 U L2 F2 U' F2 U F' L U' L' U L' F"]},{"id":"oll37","n":37,"name":"Fish","alg":"F R' F' R U R U' R'","len":8,"setups":["R2 D' U2 F2 U' F2 D U' R F R2 F' R'","D' U F2 D R2 U' R2 F' R' F2 R F"]},{"id":"oll38","n":38,"name":"W shape","alg":"R U R' U R U' R' U' R' F R F'","len":12,"setups":["U2 R2 F2 U2 R2 F2 R2 U R2 U' R2 U F' R' U R U' R F'","R2 F2 U' F2 U F2 R2 U' F2 U R2 U' F' R' U R U' R F'"]},{"id":"oll39","n":39,"name":"Lightning","alg":"L F' L' U' L U F U' L'","len":9,"setups":["R2 U F2 U' F2 U' R2 U F2 U F R U' L' U L R' F","F2 U F2 U L2 U' F2 U' F2 U L2 F' R2 U' L' U L R2 F"]},{"id":"oll40","n":40,"name":"Lightning","alg":"R' F R U R' U' F' U R","len":9,"setups":["F2 U2 F2 L2 U2 L2 U L2 U L2 U2 F' L' U' L U F' U F2","L2 U' F2 U F2 U L2 U' F2 U' F' L' U R U' L R' F'"]},{"id":"oll41","n":41,"name":"Awkward","alg":"R U R' U R U2 R' F R U R' U' F'","len":13,"setups":["U F2 R2 F2 U F2 R2 F2 U2 F U R' U' R2 U R U' F'","U2 F2 R2 F2 U' F2 R2 F2 U' F U2 R' U2 R2 U2 R U2 F'"]},{"id":"oll42","n":42,"name":"Awkward","alg":"R' U' R U' R' U2 R F R U R' U' F'","len":13,"setups":["L2 F2 L2 U' L2 F2 L2 U' R' F' U' F U' L R' F2 L' R2","R2 F2 R2 U' R2 F2 R2 U' R' F' U' F U' L R' F2 L' R2"]},{"id":"oll43","n":43,"name":"P shape","alg":"F' U' L' U L F","len":6,"setups":["F2 L2 D2 U2 L2 R2 D2 U2 R2 F L' U' L U F","F2 L2 R2 D2 U2 L2 R2 D2 U2 F L' U' L U F"]},{"id":"oll44","n":44,"name":"P shape","alg":"F U R U' R' F'","len":6,"setups":["F2 L2 R2 D2 U2 L2 R2 D2 U2 F' R U R' U' F'","F2 R2 D2 U2 L2 R2 D2 U2 L2 F' R U R' U' F'"]},{"id":"oll45","n":45,"name":"T shape","alg":"F R U R' U' F'","len":6,"setups":["F2 L2 D2 U2 L2 R2 D2 U2 R2 F' U R U' R' F'","F2 L2 R2 D2 U2 L2 R2 D2 U2 F' U R U' R' F'"]},{"id":"oll46","n":46,"name":"C shape","alg":"R' U' R' F R F' U R","len":8,"setups":["R2 U' F2 D' F2 U F2 L F L' F2 D R F' R","L2 D2 U2 L2 R2 D2 U2 R F' L' U L U' F R"]},{"id":"oll47","n":47,"name":"Small L","alg":"R' U' R' F R F' R' F R F' U R","len":12,"setups":["F2 D F2 U' F2 D R2 U R D' R2 U' F' R' U F2 D' F","L2 D2 F2 L2 B2 U R2 B2 U2 L F L2 U2 L2 F' D' L2 U2 L"]},{"id":"oll48","n":48,"name":"Small L","alg":"F R U R' U' R U R' U' F'","len":10,"setups":["U R2 U' R2 F2 D F2 R2 U R U' F' U F' D' F2 R2 U' R'","F2 L2 R2 D2 U2 L2 R2 D2 U2 F' U R U' R' U R U' R' F'"]},{"id":"oll49","n":49,"name":"Small L","alg":"r U' r2 U r2 U r2 U' r","len":9,"setups":["R2 F2 U2 R2 F2 R2 U2 R2 F' R2 F2 L F' R2 F2 L'","L2 F2 R2 U2 R2 F2 R2 U2 F2 R2 F R2 F2 L' F' R2 F2 L'"]},{"id":"oll50","n":50,"name":"Small L","alg":"r' U r2 U' r2 U' r2 U r'","len":9,"setups":["U2 L2 F2 U2 L2 F2 L2 U2 L2 F L2 F2 R' F L2 F2 R U2","R2 D2 U2 L2 R2 D2 U2 L' F' L2 F U2 F U2 F' L"]},{"id":"oll51","n":51,"name":"Line","alg":"F U R U' R' U R U' R' F'","len":10,"setups":["F2 L2 R2 D2 U2 L2 R2 D2 U2 F' R U R' U' R U R' U' F'","D' U' F2 D2 R2 D' U' R2 U2 F' R U R' U' R U R' U' F'"]},{"id":"oll52","n":52,"name":"Line","alg":"R U R' U R U' B U' B' R'","len":10,"setups":["L2 D2 U2 L2 R2 D2 U2 R F' L F' L' F U' F U R","L2 D2 U2 L2 R2 D2 U2 R F' U' F U' R U R' U R"]},{"id":"oll53","n":53,"name":"Small L","alg":"r' U' R U' R' U R U' R' U2 r","len":11,"setups":["R2 D R2 D' F2 R2 U' R2 U F' R' F R F2 U2 L F' L' F","R2 U F2 U' F2 R2 D' F2 D F' R' F R F2 U2 L F' L' F"]},{"id":"oll54","n":54,"name":"Small L","alg":"r U R' U R U' R' U R U2 r'","len":11,"setups":["U F2 U' L2 U' L2 U2 F2 L2 F' L' F L2 U L2 U2 L U L","D B2 D' R2 U R2 U F2 D B2 R' D' U R U' F' R U F'"]},{"id":"oll55","n":55,"name":"Line","alg":"R' F R U R U' R2 F' R2 U' R' U R U R'","len":15,"setups":["F2 U' F2 D R2 D' R2 F R' U R' U' F' U R' U' R","U' B2 D2 L2 U R2 U' L2 R2 D' L' U' L D' B' U L U' B'"]},{"id":"oll56","n":56,"name":"Line","alg":"r' U' r U' R' U R U' R' U R r' U r","len":14,"setups":["U' F2 U2 F2 L2 U' L2 D F2 U2 R F R' F' D' U2 F' U2 F'","U' R2 L' F2 L D2 R2 F' L2 F' U2 L2 U' R' F R2 D2 R' L2 U' F2 U2 D' F2 R2 U' R2 F2"]},{"id":"oll57","n":57,"name":"Corners done","alg":"R U R' U' M' U R U' r'","len":9,"setups":["R2 F2 U F2 R2 F2 U' F D' U R' F2 R D U' F","F2 U L2 R2 U' R2 U L R' F' R2 F L R' U' F2"]}],"pll":[{"id":"pll-Aa","n":"Aa","name":"Aa perm","alg":"R' F R' B2 R F' R' B2 R2","len":9,"setups":["U' F D L R2 F F' R2 L' D' F D' L2 U F2 U' L2 U F2 L2 D","U2 L' U L2 R D' D R' L2 U' L U2 F2 L2 D R2 D' L2 D R2 D' F2"]},{"id":"pll-Ab","n":"Ab","name":"Ab perm","alg":"R2 B2 R F R' B2 R F' R","len":9,"setups":["U' L2 D F2 U' F2 F2 U R2 U F2 U' F2 R2 D' F2 L2 U","L2 D' R' L U R2 R2 U R L' D L2 U D R2 D' R2 U' F2 U R2 U F2 U2"]},{"id":"pll-E","n":"E","name":"E perm","alg":"R' U L' D2 L U' R L' U R' D2 R U' L","len":14,"setups":["R2 U F2 U2 F2 R2 U F2 U F2 U2 R2 U' R2 U2","L2 U' L2 U2 F2 U F2 U L2 F2 U2 F2 U L2 U2"]},{"id":"pll-F","n":"F","name":"F perm","alg":"R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R","len":18,"setups":["R2 D' F2 R2 U2 R2 U' F2 U F2 D' F2 D2 R2 U","R2 U R2 F2 U2 F2 U R2 D' F2 D F2 U2 R2 U'"]},{"id":"pll-Ga","n":"Ga","name":"Ga perm","alg":"R2 U R' U R' U' R U' R2 U' D R' U R D'","len":15,"setups":["U2 F2 L2 D R2 D' R2 U R2 U' L2 R2 F2 U'","U2 F2 L2 U F2 D' F2 D R2 U' L2 R2 F2 U'"]},{"id":"pll-Gb","n":"Gb","name":"Gb perm","alg":"R' U' R U D' R2 U R' U R U' R U' R2 D","len":15,"setups":["U F2 L2 R2 U R2 U' R2 D R2 D' L2 F2 U2","U F2 L2 R2 U R2 D' F2 D F2 U' L2 F2 U2"]},{"id":"pll-Gc","n":"Gc","name":"Gc perm","alg":"R2 U' R U' R U R' U R2 U D' R U' R' D","len":15,"setups":["F2 R2 U' F2 D F2 D' L2 U L2 R2 F2 U'","F2 R2 D' L2 D L2 U' L2 U L2 R2 F2 U'"]},{"id":"pll-Gd","n":"Gd","name":"Gd perm","alg":"R U R' U' D R2 U' R U' R' U R' U R2 D'","len":15,"setups":["U F2 L2 R2 U' L2 U L2 D' L2 D R2 F2","U F2 L2 R2 U' L2 D F2 D' F2 U R2 F2"]},{"id":"pll-H","n":"H","name":"H perm","alg":"M2 U M2 U2 M2 U M2","len":7,"setups":["U' F' L' R' D2 F F' D2 R L F D' L2 U2 L2 F2 U D F2 R2 U2 R2","F' D' R2 U R' F2 F2 R U' R2 D F R2 L2 D R2 L2 U2 R2 L2 D R2 L2"]},{"id":"pll-Ja","n":"Ja","name":"Ja perm","alg":"L' U' L F L' U' L U L F' L2 U L","len":13,"setups":["R U R2 F' L' U U' L F R2 U' R' F2 U' F2 D F2 D' L2 U L2 F2 U2","U2 L2 F' R' F L' L F' R F' U2 F2 L2 F2 U' L2 U' F2 D F2 D' L2 F2 U2"]},{"id":"pll-Jb","n":"Jb","name":"Jb perm","alg":"R U R' F' R U R' U' R' F R2 U' R'","len":13,"setups":["R F2 U F' L D2 D2 L' F U' F2 R U D' R2 U R2 U' R2 D R2 U' R2","F2 U2 F2 R L2 U2 U2 R L2 U' D2 L2 D F2 U' F2 U2 L2 D R2"]},{"id":"pll-Na","n":"Na","name":"Na perm","alg":"R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'","len":21,"setups":["L2 F2 U2 F2 U' F2 L2 U2 L2 U' F2 U2 L2 U'","F2 R2 U2 R2 U' R2 F2 U2 F2 U' R2 U2 F2 U"]},{"id":"pll-Nb","n":"Nb","name":"Nb perm","alg":"R' U R U' R' F' U' F R U R' F R' F' R U' R","len":17,"setups":["F2 L2 U2 L2 U L2 F2 U2 F2 U L2 U2 F2 U'","R2 F2 U2 F2 U F2 R2 U2 R2 D' F2 D2 R2 D'"]},{"id":"pll-Ra","n":"Ra","name":"Ra perm","alg":"R U' R' U' R U R D R' U' R D' R' U2 R'","len":15,"setups":["F2 U L2 U2 F2 U' F2 R2 U' L2 U R2 U2 F2 U2","L2 U' L2 U' F2 U2 L2 U L2 U' L2 U L2 U F2"]},{"id":"pll-Rb","n":"Rb","name":"Rb perm","alg":"R2 F R U R U' R' F' R U2 R' U2 R","len":13,"setups":["U2 F2 U' R2 U2 F2 U F2 L2 U R2 U' L2 U2 F2","R2 D' U' L2 U R2 U' L2 F2 U' F2 U2 R2 D R2"]},{"id":"pll-T","n":"T","name":"T perm","alg":"R U R' U' R' F R2 U' R' U' R U R' F'","len":14,"setups":["R F' U' D2 U2 R R' U' D2 F R U R2 U' R2 F2 U' F2 D R2 D'","D F L U2 D2 R R' U2 D2 L' F U D' L2 F2 U' F2 U2 D' L2 F2 D R2 U' R2"]},{"id":"pll-Ua","n":"Ua","name":"Ua perm","alg":"R U' R U R U R U' R' U' R2","len":11,"setups":["R D' F2 L' D2 F F' D2 L F2 D R D2 L2 D' R2 L2 U L2 U' R2 L2 D' R2","F2 D' L R2 D R R' D' L' D2 F2 L2 F2 D2 F2 L2 F2 R2 D F2"]},{"id":"pll-Ub","n":"Ub","name":"Ub perm","alg":"R2 U R U R' U' R' U' R' U R'","len":11,"setups":["R L R U' F2 U U' F2 U L D' R2 F2 R2 D2 R2 F2 R2 D' R2 L2","U F' R' L D U U' D' R L' F' D2 R2 F2 L2 D' L2 F2 R2 U' D2 F2 U'"]},{"id":"pll-V","n":"V","name":"V perm","alg":"R U' R U R' D R D' R U' D R2 U R2 D' R2","len":16,"setups":["F2 D F2 D2 L2 U' L2 D F2 L2 U2 L2 U F2 U'","F2 U R2 U2 R2 F2 D R2 U' R2 D2 F2 D F2 U'"]},{"id":"pll-Y","n":"Y","name":"Y perm","alg":"F R U' R' U' R U R' F' R U R' U' R' F R F'","len":17,"setups":["R2 D2 F2 U' L2 D L2 R2 D R2 U' F2 U2 R2 U","F2 U2 L2 U L2 D L2 R2 D R2 D' L2 U2 F2 D'"]},{"id":"pll-Z","n":"Z","name":"Z perm","alg":"M' U M2 U M2 U M' U2 M2","len":9,"setups":["U' R2 F2 U R2 U' F2 R2 F2 U' F2 U F2","L2 F2 U' L2 U F2 L2 F2 D R2 U' R2 D'"]}]};

/* ---- 29-cube-data.js ---- */
/* ===== Cube data: engine, CFOP solver, word moves, lessons and scramble setups (from the user's CFOP Coach, simulator-checked) ===== */
const Cube = (() => {
/* ---------- Cube engine ---------- */
const CubeEngine = (() => {
  const FACES=['U','R','F','D','L','B'];
  const NORMALS={U:[0,1,0],D:[0,-1,0],R:[1,0,0],L:[-1,0,0],F:[0,0,1],B:[0,0,-1]};
  const FACE_INFO={R:[0,1,-1],L:[0,-1,1],U:[1,1,-1],D:[1,-1,1],F:[2,1,-1],B:[2,-1,1]};
  function solved(n){ const st=[], m=n-1;
    for(const f of FACES){ const nv=NORMALS[f], ax=nv.findIndex(v=>v), s=nv[ax], o=[0,1,2].filter(i=>i!==ax);
      for(let a=-m;a<=m;a+=2)for(let b=-m;b<=m;b+=2){ const p=[0,0,0]; p[ax]=s*m; p[o[0]]=a; p[o[1]]=b; st.push({p,n:nv.slice(),c:f,h:p.join()}); } }
    return {n,st}; }
  function rot1(v,ax){ const [x,y,z]=v; if(ax===0) return [x,-z,y]; if(ax===1) return [z,y,-x]; return [-y,x,z]; }
  const tokenize=a=>a.trim().split(/\s+/).filter(Boolean);
  function parseMove(tok,n){
    const m=tok.match(/^(\d*)([URFDLBurfdlbMESxyz])(w?)(\d*)('?)$/); if(!m) throw new Error('Bad move '+tok);
    const pre=m[1]?+m[1]:0, L=m[2], w=m[3], amt=m[4]?+m[4]:1, q0=m[5]?-amt:amt, M=n-1; let ax, coords=[], base;
    if('xyz'.includes(L)){ ax='xyz'.indexOf(L); base=-1; for(let c=-M;c<=M;c+=2) coords.push(c); }
    else if('MES'.includes(L)){ ax='MES'.indexOf(L); base=L==='S'?-1:1; coords=n%2?[0]:[]; }
    else { const up=L.toUpperCase(), fi=FACE_INFO[up]; ax=fi[0]; base=fi[2]; const lower=L!==up;
      const layers = pre&&w ? Array.from({length:pre},(_,k)=>k+1) : pre ? [pre] : (w||lower) ? [1,2] : [1];
      coords=layers.filter(k=>k<=n).map(k=>fi[1]*(M-2*(k-1))); }
    return {ax, coords:new Set(coords), q:((base*q0)%4+4)%4, tok}; }
  function applyMove(state,mv){ if(typeof mv==='string') mv=parseMove(mv,state.n);
    for(const s of state.st) if(mv.coords.has(s.p[mv.ax])) for(let i=0;i<mv.q;i++){ s.p=rot1(s.p,mv.ax); s.n=rot1(s.n,mv.ax); }
    return state; }
  const applyAlg=(s,a)=>{ for(const t of tokenize(a)) applyMove(s,t); return s; };
  const invertTok=t=>t.endsWith("'")?t.slice(0,-1):/2$/.test(t)?t:t+"'";
  const invert=a=>tokenize(a).reverse().map(invertTok).join(' ');
  const key=(p,n)=>p.join(',')+'|'+n.join(',');
  const clone=s=>({n:s.n,st:s.st.map(x=>({p:x.p.slice(),n:x.n.slice(),c:x.c,h:x.h}))});
  return {solved,parseMove,applyMove,applyAlg,invert,invertTok,tokenize,key,clone,NORMALS};
})();

/* ---------- CFOP solver: cross, F2L pairs, 2-look OLL, 2-look PLL ---------- */
const Solver=(()=>{
  const E=CubeEngine;
  const M18=[]; for(const f of 'URFDLB') for(const s of ['',"'",'2']) M18.push(f+s);
  const F2LM=["U","U'","U2","R","R'","R2","F","F'","F2","L","L'","L2"];
  const sol=E.solved(3), eSlots=[], cSlots=[];
  for(const s of sol.st){ const z=s.p.filter(v=>v===0).length; if(z===1) eSlots.push(E.key(s.p,s.n)); else if(z===0) cSlots.push(E.key(s.p,s.n)); }
  const eIdx=Object.fromEntries(eSlots.map((k,i)=>[k,i])), cIdx=Object.fromEntries(cSlots.map((k,i)=>[k,i]));
  function mapFor(tok,slots,idx){ const mv=E.parseMove(tok,3); return slots.map(k=>{ const [ps,ns]=k.split('|'); const st={n:3,st:[{p:ps.split(',').map(Number),n:ns.split(',').map(Number)}]}; E.applyMove(st,mv); return idx[E.key(st.st[0].p,st.st[0].n)]; }); }
  const EM={}, CM={}; for(const t of M18){ EM[t]=Int8Array.from(mapFor(t,eSlots,eIdx)); CM[t]=Int8Array.from(mapFor(t,cSlots,cIdx)); }
  const K=(p,n)=>p.join(',')+'|'+n.join(','), D=[0,-1,0];
  const CROSS=[[0,-2,2],[2,-2,0],[0,-2,-2],[-2,-2,0]].map(p=>eIdx[K(p,D)]);
  const SLOTS={FR:{c:cIdx[K([2,-2,2],D)],e:eIdx[K([2,0,2],[0,0,1])]},FL:{c:cIdx[K([-2,-2,2],D)],e:eIdx[K([-2,0,2],[0,0,1])]},
               BR:{c:cIdx[K([2,-2,-2],D)],e:eIdx[K([2,0,-2],[0,0,-1])]},BL:{c:cIdx[K([-2,-2,-2],D)],e:eIdx[K([-2,0,-2],[0,0,-1])]}};
  const SN=['FR','FL','BR','BL'];
  const cross=new Uint8Array(331776).fill(255), ci=a=>a[0]*13824+a[1]*576+a[2]*24+a[3];
  { let fr=[CROSS.slice()]; cross[ci(CROSS)]=0; let d=0; while(fr.length){ const nx=[]; for(const s of fr) for(const t of M18){ const m=EM[t]; const n=[m[s[0]],m[s[1]],m[s[2]],m[s[3]]]; const i=ci(n); if(cross[i]===255){ cross[i]=d+1; nx.push(n);} } fr=nx; d++; } }
  const pairT={}; for(const s of SN){ const T=new Uint8Array(576).fill(255); const g=SLOTS[s]; T[g.c*24+g.e]=0; let fr=[[g.c,g.e]], d=0;
    while(fr.length){ const nx=[]; for(const [c,e] of fr) for(const t of M18){ const nc=CM[t][c], ne=EM[t][e]; if(T[nc*24+ne]===255){ T[nc*24+ne]=d+1; nx.push([nc,ne]); } } fr=nx; d++; } pairT[s]=T; }
  const E_N=E.NORMALS, FACEPOS={U:[1,2],D:[1,-2],R:[0,2],L:[0,-2],F:[2,2],B:[2,-2]};
  const faceOfN=n=>Object.keys(E_N).find(k=>E_N[k].join()===n.join());
  function relInfo(state){ const cen={}; for(const s of state.st) if(s.p.filter(v=>v===0).length===2) cen[s.c]=faceOfN(s.n);
    const byPos={}; for(const s of state.st){ const k=s.p.join(); (byPos[k]=byPos[k]||[]).push(s); } return {cen,byPos}; }
  function homeOf(faces){ const p=[0,0,0]; for(const f of faces){ const [a,v]=FACEPOS[f]; p[a]=v; } return p; }
  function findRef(info,home,refN,isCorner){ const rf=faceOfN(refN);
    for(const k in info.byPos){ const sts=info.byPos[k]; if(homeOf(sts.map(s=>info.cen[s.c])).join()===home.join()){ const s=sts.find(s=>info.cen[s.c]===rf); return (isCorner?cIdx:eIdx)[K(s.p,s.n)]; } }
    return -1; }
  function compact(state){ const info=relInfo(state);
    const cr=[[0,-2,2],[2,-2,0],[0,-2,-2],[-2,-2,0]].map(p=>findRef(info,p,D,false));
    const pr={FR:[findRef(info,[2,-2,2],D,true),findRef(info,[2,0,2],[0,0,1],false)],FL:[findRef(info,[-2,-2,2],D,true),findRef(info,[-2,0,2],[0,0,1],false)],
              BR:[findRef(info,[2,-2,-2],D,true),findRef(info,[2,0,-2],[0,0,-1],false)],BL:[findRef(info,[-2,-2,-2],D,true),findRef(info,[-2,0,-2],[0,0,-1],false)]};
    return {cr,pr}; }
  function crossMoves(state){ let s=compact(state).cr.slice(); const out=[];
    while(cross[ci(s)]>0){ const d=cross[ci(s)]; for(const t of M18){ const m=EM[t], n=[m[s[0]],m[s[1]],m[s[2]],m[s[3]]]; if(cross[ci(n)]===d-1){ out.push(t); s=n; break; } } }
    return out; }
  const pairSolved=(pr,s)=>pr[s][0]===SLOTS[s].c&&pr[s][1]===SLOTS[s].e;
  function searchPair(cr,pr,keep,depth){ const path=[];
    const h=(cr,pr)=>{ let v=cross[ci(cr)]; const p=pairT.FR[pr.FR[0]*24+pr.FR[1]]; if(p>v) v=p; for(const s of keep){ const q=pairT[s][pr[s][0]*24+pr[s][1]]; if(q>v) v=q; } return v; };
    function rec(cr,pr,d,last){ const hv=h(cr,pr); if(hv===0) return true; if(hv>d) return false;
      for(const t of F2LM){ if(t[0]===last) continue; const em=EM[t], cm=CM[t];
        const ncr=[em[cr[0]],em[cr[1]],em[cr[2]],em[cr[3]]], npr={}; for(const s of SN) npr[s]=[cm[pr[s][0]],em[pr[s][1]]];
        path.push(t); if(rec(ncr,npr,d-1,t[0])) return true; path.pop(); }
      return false; }
    return rec(cr,pr,depth,'')?path.slice():null; }
  const ROTFOR={FR:'',FL:"y'",BR:'y',BL:'y2'};
  function solveF2L(state){ const st=E.clone(state), steps=[];
    for(let k=0;k<4;k++){ const c0=compact(st); const unsolved=SN.filter(s=>!pairSolved(c0.pr,s)); if(!unsolved.length) break;
      let best=null;
      for(let d=0;d<=14&&!best;d++) for(const s of unsolved){ const rot=ROTFOR[s]; const tmp=E.clone(st); if(rot) E.applyAlg(tmp,rot);
        const c=compact(tmp); const keep=SN.filter(x=>x!=='FR'&&pairSolved(c.pr,x)); const r=searchPair(c.cr,c.pr,keep,d); if(r){ best={rot,moves:r}; break; } }
      if(!best) throw new Error('F2L');
      if(best.rot) E.applyAlg(st,best.rot); E.applyAlg(st,best.moves.join(' ')); steps.push(best); }
    return {steps,state:st}; }
  const ufaceDone=st=>{ const info=relInfo(st); return st.st.every(s=>s.n[1]!==1||info.cen[s.c]==='U'); };
  const uedgesDone=st=>{ const info=relInfo(st); return st.st.every(s=>!(s.n[1]===1&&s.p.filter(v=>v===0).length===1)||info.cen[s.c]==='U'); };
  const allDone=st=>{ const info=relInfo(st); return st.st.every(s=>E_N[info.cen[s.c]].join()===s.n.join()); };
  const cornersDone=st=>{ const info=relInfo(st); return st.st.every(s=>s.p.some(v=>v===0)||E_N[info.cen[s.c]].join()===s.n.join()); };
  const AUF=['',"U","U2","U'"];
  const OLL_E=[['o1',"F R U R' U' F'"],['o2',"F U R U' R' F'"],['o3',"F R U R' U' F' U2 F U R U' R' F'"]];
  const OLL_C=[['o4',"R U R' U R U2 R'"],['o5',"R U2 R' U' R U' R'"],['o6',"R U R' U R U' R' U R U2 R'"],['o7',"R U2 R2 U' R2 U' R2 U2 R"],['o8',"R2 D R' U2 R D' R' U2 R'"],['o9',"r U R' U' r' F R F'"],['o10',"F' r U R' U' r' F R"]];
  const PLL_C=[['p1',"R' F R' B2 R F' R' B2 R2"],['p2',"F R U' R' U' R U R' F' R U R' U' R' F R F'"]];
  const PLL_E=[['p3',"R U' R U R U R U' R' U' R2"],['p4',"R2 U R U R' U' R' U' R' U R'"],['p5',"M2 U M2 U2 M2 U M2"],['p6',"M' U M2 U M2 U M' U2 M2 U'"]];
  const ap=(st,a)=>a?E.applyAlg(E.clone(st),a):st;
  function oneLook(st,set,pred){ if(pred(st)) return {done:true}; for(const [id,alg] of set) for(const a of AUF){ if(pred(ap(st,(a+' '+alg).trim()))) return {id,auf:a,alg}; } return null; }
  function solve(state){
    let st=E.clone(state); const out=[];
    const cm=crossMoves(st); E.applyAlg(st,cm.join(' ')); out.push({stage:'cross',moves:cm});
    const f=solveF2L(st); st=f.state; f.steps.forEach((s,i)=>out.push({stage:'f2l',n:i+1,rot:s.rot,moves:s.moves}));
    const run=r=>{ if(r&&!r.done) E.applyAlg(st,(r.auf+' '+r.alg).trim()); };
    let r=oneLook(st,OLL_E,uedgesDone); if(!r) throw new Error('OLL'); run(r); out.push({stage:'olle',...r});
    r=oneLook(st,OLL_C,ufaceDone); if(!r) throw new Error('OLL'); run(r); out.push({stage:'ollc',...r});
    const cOK=s2=>AUF.some(a=>cornersDone(ap(s2,a)));
    if(cOK(st)) out.push({stage:'pllc',done:true});
    else { let r1=oneLook(st,PLL_C,cOK), r2=null;
      if(!r1){ outer: for(const [id,alg] of PLL_C) for(const a of AUF){ const q=oneLook(ap(st,(a+' '+alg).trim()),PLL_C,cOK); if(q&&!q.done){ r1={id,auf:a,alg}; r2=q; break outer; } } }
      if(!r1) throw new Error('PLL'); run(r1); out.push({stage:'pllc',...r1}); if(r2){ run(r2); out.push({stage:'pllc',...r2}); } }
    const eOK=s2=>AUF.some(a=>allDone(ap(s2,a)));
    r=oneLook(st,PLL_E,eOK); if(!r) throw new Error('PLL'); run(r); out.push({stage:'plle',...r});
    const fin=AUF.find(a=>allDone(ap(st,a))); if(fin) E.applyAlg(st,fin); out.push({stage:'auf',moves:fin?[fin]:[]});
    if(!allDone(st)) throw new Error('unsolved');
    return out; }
  return {solve,crossMoves,M18,OLL_E,OLL_C,PLL_C,PLL_E};
})();

/* ---------- Plain-word moves and arrow icons ---------- */
const WORDS={
  "R":"Right side up","R'":"Right side down","R2":"Right side twice",
  "L":"Left side down","L'":"Left side up","L2":"Left side twice",
  "U":"Top to the left","U'":"Top to the right","U2":"Top twice",
  "D":"Bottom to the right","D'":"Bottom to the left","D2":"Bottom twice",
  "F":"Front clockwise","F'":"Front counter-clockwise","F2":"Front twice",
  "B":"Back layer: its top goes left","B'":"Back layer: its top goes right","B2":"Back layer twice",
  "M":"Middle column down","M'":"Middle column up","M2":"Middle column twice",
  "r":"Right two columns up","r'":"Right two columns down","r2":"Right two columns twice",
  "x":"Roll the whole cube up","x'":"Roll the whole cube down","y":"Turn the whole cube left","y'":"Turn the whole cube right","y2":"Turn the whole cube around"
};
const say=t=>WORDS[t]||t;
function icon(tok){
  const base=tok.replace(/['2]/g,''), prime=tok.includes("'"), dbl=tok.includes('2');
  const C=12, X0=6, Y0=6; let cells=new Set(), arrow='', dashed=false;
  const col=c=>[0,1,2].forEach(r=>cells.add(r*3+c)), row=r=>[0,1,2].forEach(c=>cells.add(r*3+c)), all=()=>[...Array(9).keys()].forEach(i=>cells.add(i));
  const cx=c=>X0+C*c+C/2, cy=r=>Y0+C*r+C/2;
  const vert=(x,up)=>{ const y1=up?42:6, y2=up?8:40; return `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" class="as"/><path d="${up?`M${x-5} ${y2+6} L${x} ${y2-1} L${x+5} ${y2+6} Z`:`M${x-5} ${y2-6} L${x} ${y2+1} L${x+5} ${y2-6} Z`}" class="ah"/>`; };
  const horiz=(y,left)=>{ const x1=left?42:6, x2=left?8:40; return `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" class="as"/><path d="${left?`M${x2+6} ${y-5} L${x2-1} ${y} L${x2+6} ${y+5} Z`:`M${x2-6} ${y-5} L${x2+1} ${y} L${x2-6} ${y+5} Z`}" class="ah"/>`; };
  const curl=(cw)=>{ const r=12, c=24; const a0=cw?-150:-30, a1=cw?120:-300; const p=a=>[c+r*Math.cos(a*Math.PI/180), c+r*Math.sin(a*Math.PI/180)];
    const [x0,y0]=p(a0), [x1,y1]=p(a1); const t=(a1+(cw?90:-90))*Math.PI/180, tx=Math.cos(t), ty=Math.sin(t); const hx=x1+tx*4, hy=y1+ty*4, nx=-ty, ny=tx;
    return `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 1 ${cw?1:0} ${x1.toFixed(1)} ${y1.toFixed(1)}" class="as" fill="none"/><path d="M${(x1+nx*5-tx*2).toFixed(1)} ${(y1+ny*5-ty*2).toFixed(1)} L${hx.toFixed(1)} ${hy.toFixed(1)} L${(x1-nx*5-tx*2).toFixed(1)} ${(y1-ny*5-ty*2).toFixed(1)} Z" class="ah"/>`; };
  switch(base){
    case 'R': col(2); arrow=vert(cx(2),!prime); break;
    case 'r': col(1); col(2); arrow=vert(cx(2)-C/2,!prime); break;
    case 'L': col(0); arrow=vert(cx(0),prime); break;
    case 'M': col(1); arrow=vert(cx(1),prime); break;
    case 'U': row(0); arrow=horiz(cy(0),!prime); break;
    case 'D': row(2); arrow=horiz(cy(2),prime); break;
    case 'F': all(); arrow=curl(!prime); break;
    case 'B': all(); dashed=true; arrow=curl(prime); break;
    case 'x': all(); arrow=vert(24,!prime); break;
    case 'y': all(); arrow=horiz(24,!prime); break;
  }
  let g=''; for(let r=0;r<3;r++)for(let c=0;c<3;c++){ const hi=cells.has(r*3+c); g+=`<rect x="${X0+C*c+1}" y="${Y0+C*r+1}" width="${C-2}" height="${C-2}" rx="2" fill="${hi?'var(--cell-hi)':'var(--cell)'}" ${dashed&&hi?'stroke="var(--arrow)" stroke-dasharray="2 2" stroke-width="1"':''}/>`; }
  const badge=dbl?`<circle cx="40" cy="8" r="7.5" fill="var(--arrow)"/><text x="40" y="11.5" text-anchor="middle" font-size="10" font-weight="700" fill="#fff" font-family="Atkinson Hyperlegible, sans-serif">×2</text>`:'';
  return `<svg viewBox="0 0 48 48" role="img" aria-label="${say(tok)}"><style>.as{stroke:var(--arrow);stroke-width:4;stroke-linecap:round}.ah{fill:var(--arrow)}</style>${g}${arrow}${badge}</svg>`;
}

/* ---------- Lessons (all algorithms simulator-checked) ---------- */
const TRACKS={
  f2l:{title:'F2L lessons', sub:'White cross on the bottom. We fill the front-right slot; the colored pieces are the corner and edge we pair. Gray pieces don’t matter yet.', focus:'f2l'},
  oll:{title:'OLL lessons', sub:'Two looks: first make a yellow cross, then turn the corners yellow side up. Only yellow stickers are colored on top.', focus:'oll'},
  pll:{title:'PLL lessons', sub:'Two looks: first fix the corners, then the edges. The top is already all yellow.', focus:'pll'},
  solve:{title:'Solve my cube', sub:'Paint your cube’s colors or pick a random case. I’ll solve it with you: cross, F2L, OLL, then PLL, using the moves from the lessons.', focus:'all'}
};
const LESSONS=[
  {id:'f1',t:'f2l',g:'Basic inserts',title:'Three-move insert',alg:"R U R'",
   look:'The white corner sits right above its slot, with white facing right. Its edge waits at the back of the top layer.',
   plan:'Right side up carries the corner to the back, next to its edge, so they join. Top to the left brings the pair over the slot. Right side down drops them in.'},
  {id:'f2',t:'f2l',g:'Basic inserts',title:'Three-move insert, front side',alg:"F' U' F",
   look:'The corner is above its slot again, but now white faces you. Its edge is on the left of the top layer.',
   plan:'This is the mirror of the first lesson, done with the front instead of the right side.'},
  {id:'f3',t:'f2l',g:'Split pairs',title:'Split pair, right',alg:"U R U' R'",
   look:'Corner above the slot with white facing you. Its edge is on the right of the top layer, ready to slide in.',
   plan:'Top to the left moves both pieces out of the way. Right side up opens the empty slot. Top to the right brings the pair back over it. Right side down drops both in.'},
  {id:'f4',t:'f2l',g:'Split pairs',title:'Split pair, front',alg:"U' F' U F",
   look:'Corner above the slot with white facing right. Its edge is at the front of the top layer.',
   plan:'The mirror of the last lesson: move the pieces aside, open the slot with the front, bring them back, close the front.'},
  {id:'f5',t:'f2l',g:'Tricky cases',title:'White faces up',alg:"R U2 R' U' R U R'",
   look:'The corner is above its slot with white facing straight up. Its edge is on the right of the top layer.',
   plan:'White facing up can’t go straight in. The first three moves turn the corner so white faces sideways. Then a top turn sets up the three-move insert from lesson one.'},
  {id:'f6',t:'f2l',g:'Tricky cases',title:'Pieces facing the wrong way',alg:"U' R U' R' U R U R'",
   look:'The corner is above the slot with white facing right, and the edge is next to it on the right, but their colors don’t line up.',
   plan:'First we pull them apart into a better spot, then join them, then insert. Watch how the pair forms in the middle of the moves.'},
  {id:'f7',t:'f2l',g:'Tricky cases',title:'Corner stuck in the slot',alg:"R U' R' U R U' R'",
   look:'The corner is already in the slot, but twisted: white faces you instead of down. Its edge is on top, on the right.',
   plan:'Right side up, top to the right, right side down lifts the stuck corner out. Top to the left lines it up. The last three moves insert the pair.'},
  {id:'o1',t:'oll',g:'Step 1: yellow cross',title:'Yellow line',alg:"F R U R' U' F'",
   look:'The top shows a yellow line going left to right through the center.',
   plan:'Keep the line left to right. One six-move sequence turns it into a cross.'},
  {id:'o2',t:'oll',g:'Step 1: yellow cross',title:'Yellow L shape',alg:"F U R U' R' F'",
   look:'The top shows a yellow L: yellow edges at the back and on the left, pointing to the back-left corner.',
   plan:'Hold the L at the back-left. This is the same idea as the line, with two moves swapped.'},
  {id:'o3',t:'oll',g:'Step 1: yellow cross',title:'Yellow dot',alg:"F R U R' U' F' U2 F U R U' R' F'",
   look:'Only the center is yellow. No yellow edges on top.',
   plan:'Do the line sequence, turn the top twice, then do the L sequence.'},
  {id:'o4',t:'oll',g:'Step 2: yellow corners',title:'Sune (the fish)',alg:"R U R' U R U2 R'",
   look:'One corner faces yellow up, at the front-left. The front-right corner shows its yellow facing you.',
   plan:'Seven moves, mostly right side up and down with top turns in between.'},
  {id:'o5',t:'oll',g:'Step 2: yellow corners',title:'Antisune',alg:"R U2 R' U' R U' R'",
   look:'One corner faces yellow up, at the back-right. The front-left corner shows its yellow facing you.',
   plan:'This is the Sune done backwards.'},
  {id:'o6',t:'oll',g:'Step 2: yellow corners',title:'Double headlights (H)',alg:"R U R' U R U' R' U R U2 R'",
   look:'No corners face up. Both left corners show yellow on the left side, and both right corners show yellow on the right side.',
   plan:'Like the Sune, with one extra up-and-down in the middle.'},
  {id:'o7',t:'oll',g:'Step 2: yellow corners',title:'Pi',alg:"R U2 R2 U' R2 U' R2 U2 R",
   look:'No corners face up. Both left corners show yellow facing left. The front-right yellow faces you, and the back-right faces away.',
   plan:'Lots of right side twice. Keep your grip steady.'},
  {id:'o8',t:'oll',g:'Step 2: yellow corners',title:'Headlights',alg:"R2 D R' U2 R D' R' U2 R'",
   look:'Two corners face up at the back. The two front corners show their yellow facing you, like car headlights.',
   plan:'This one uses the bottom layer. It comes back to where it started by the end.'},
  {id:'o9',t:'oll',g:'Step 2: yellow corners',title:'T shape',alg:"r U R' U' r' F R F'",
   look:'Two corners face up on the right. The left corners show yellow facing front and back.',
   plan:'Here the right two columns turn together, so the pink stripe is wider.'},
  {id:'o10',t:'oll',g:'Step 2: yellow corners',title:'Bowtie',alg:"F' r U R' U' r' F R",
   look:'Two corners face up diagonally: front-left and back-right. The front-right corner shows yellow facing you.',
   plan:'A cousin of the T shape, starting and ending with the front.'},
  {id:'p1',t:'pll',g:'Step 1: corners',title:'Headlights at the back',alg:"R' F R' B2 R F' R' B2 R2",
   look:'Look at the two top corners on each side. On the back side, both corners match: headlights. The other corners need to swap around.',
   plan:'Hold the headlights at the back. After this, all corners match. If no side had headlights, do it once from any side and look again.'},
  {id:'p2',t:'pll',g:'Step 1: corners',title:'No headlights',alg:"F R U' R' U' R U R' F' R U R' U' R' F R F'",
   look:'No side has two matching corners. Two corners need to swap diagonally across the top.',
   plan:'A longer one. Take it slow the first few times.'},
  {id:'p3',t:'pll',g:'Step 2: edges',title:'Edges go right',alg:"R U' R U R U R U' R' U' R2",
   look:'All corners match and the back side is fully solved. The front middle sticker matches the right side, so the edges need to cycle to the right.',
   plan:'Hold the solved side at the back.'},
  {id:'p4',t:'pll',g:'Step 2: edges',title:'Edges go left',alg:"R2 U R U R' U' R' U' R' U R'",
   look:'All corners match and the back side is fully solved. The front middle sticker matches the left side, so the edges cycle to the left.',
   plan:'Hold the solved side at the back. If you picked the wrong one, the other one fixes it.'},
  {id:'p5',t:'pll',g:'Step 2: edges',title:'Opposite swap',alg:"M2 U M2 U2 M2 U M2",
   look:'No side is solved. Every middle sticker shows the color of the opposite side: front matches back, left matches right.',
   plan:'Only the middle column and the top move here.'},
  {id:'p6',t:'pll',g:'Step 2: edges',title:'Neighbor swap',alg:"M' U M2 U M2 U M' U2 M2 U'",
   look:'No side is solved. Edges swap with their neighbors: the front middle matches the left side, and the right middle matches the back.',
   plan:'Hold it so the front swaps with the left.'},
  {id:'p7',t:'pll',g:'Bonus',title:'T perm',alg:"R U R' U' R' F R2 U' R' U' R U R' F'",
   look:'Headlights on the left side. The right corners are swapped and the left and right edges are swapped.',
   plan:'One of the most famous moves in cubing. It fixes corners and edges at once.'}
];
const byId=Object.fromEntries(LESSONS.map(l=>[l.id,l]));
const LESSON_DONE='Done. Watch it again, or step through it one arrow at a time while you copy it on your own cube.';
const LINES={
  cross:'Step one: the white cross. We put the four white edges around the white center on the bottom.',
  f2l:'Step two: the first two layers. We pair each white corner with its edge and drop them in together.',
  pair:'This pair goes in the front-right slot. Watch the colored pieces.',
  olle:'Step three: make the top yellow. First, the yellow cross.',
  olleDone:'The yellow cross is already there.',
  ollc:'Now the yellow corners.',
  ollcDone:'The top is already all yellow.',
  pllc:'Step four: move the top pieces into place. First, the corners.',
  pllcDone:'The corners already match.',
  pllc2:'One more corner step. Now there are headlights.',
  plle:'Now the edges.',
  plleDone:'The edges are already in place.',
  auf:'Last, turn the top to line everything up.',
  solved:'Solved! Great job. Press Play to watch it again, or try another one.',
  check:'Sound check. If you can hear me, the voice is working.',
  hold:'Hold your cube with yellow on top and green facing you. After each move, copy it on your cube, then press I did it.',
  setup:'Start with a solved cube, yellow on top and green facing you. These moves turn it into the case.',
  ready:'Now your cube matches the picture. Here is how to solve it.',
  next:'Nice! On to the next lesson.',
  last:'That was the last lesson. Great work!'
};
const SETUPS={"f1":["U2 L2 D L2 F2 U' L2 D L2 U' F2 U R2 F2 U' R' U' L D2 L' R'","R2 F2 D2 R2 F2 R2 D2 F2 R D2 U' R2 D2 R2 D2 R","D2 R2 D F2 L2 F2 D2 F2 L2 F2 D R2 D2 R U' F2 L R' D2 L'"],"f2":["F2 U2 F2 D F2 U2 F D U R2 D' R2 D' F","F2 U2 F2 U' R2 F2 U R2 U' F2 R2 U2 F' U F U F2 U2 F' U","U R2 F2 U' F2 R2 D' F2 D R2 U' F2 U F' U F' L' R' U2 L R'"],"f3":["U2 F2 D2 L2 F2 U F2 U' F2 U L' D L' U2 F2 U' L2 D","D2 U2 L2 D F2 D F2 U' R2 U' R' U R' D' U2 L2 D U","F2 D' U L2 D' U L U L D U' F2 D U2"],"f4":["U' R2 F2 D F2 U' R2 D2 U' L2 D' U' L2 D' F2 D' F' D' F D F2","R2 U R2 D2 R2 D F2 L2 U2 L2 D F' U F' D2 U' R2 D2 F'","F2 D' L2 U' L2 U' F2 U F2 U F U' F U' F2 D F2 U2"],"f5":["U' R2 U R2 F2 L2 U' L2 D F2 R2 D' R2 U' R' F D R' D' R2 F'","U L2 D R2 U F2 D2 F2 U' L2 R2 U2 R U' L' F2 L R' D2 U","D' R2 F2 U L2 D' L2 U' F2 L2 D' U R D' R' D U L2 R2 D'"],"f6":["D' L2 D F2 U L2 U2 F2 L2 R U L' R' U L' U L2","U R2 U2 R2 D' F2 D R2 U R2 U2 R2 U R U2 R D' U2 F2 D R","U2 R2 D U R2 F2 L2 D' L2 F2 R2 D' R' U' R U' R' U' R' U'"],"f7":["U2 L2 U' R2 U' L2 U R2 U' L2 U2 F2 L' F2 L' U L U' L' U'","U F2 D' L2 D F2 U2 F2 L2 F2 U' F2 D' L D L2 F2 U' F2 L F2","F2 D R2 D' R2 U R2 U' R2 F2 U' F R' F' R U2 F' U2 F"],"o1":["D F2 U F2 D' U L2 U' L' U F U' F' L' U'","F2 U R2 F2 R2 F2 R2 D2 R2 U' F2 D2 F' U R U' R' F' R2 D2","F2 D' U F2 D2 F2 D U' R2 D2 R2 F' U R U' R' F'"],"o2":["R2 F2 U R2 U' F2 R2 F2 L F R' F' L' F' R F","F2 L2 D2 U2 R2 U' R2 D2 U2 L2 U F' R U R' U' F'","D F2 U F2 D' U L2 U' L' F U F' U' L' U'"],"o3":["R2 U2 R2 U' R2 F2 U2 F2 U' R2 U2 F2 U' R' F' R U2 F' R' F' R"],"o4":["R2 D' L2 U' L2 D' L2 U' L2 D' R2 F' U' F U' F' U2 F D'","R2 U R2 U' R2 U' L2 D R2 D' F2 U F' U2 F' U F U F' L2","U F2 D R2 D' R2 U R2 U' R2 F2 R' U L U' R U L' U2"],"o5":["F2 U' R2 U2 R2 F2 U' F2 U R2 D R2 D2 F D F2 D' U F2 D F'","D U' R2 F2 L2 D L2 F2 R2 D' U2 R U R2 U' R2 U R U","F2 D U2 F2 U' F2 U' R2 U' R2 U' F U2 F U F' U F D'"],"o6":["D2 F2 U' F2 D2 L2 D U2 L2 D' F2 L2 U2 F' U2 L2 F' U2 F2 L2 F","F2 R2 U F2 U2 R2 F2 R2 U F2 R2 U' R U' R2 F2 R' F2 U R","L2 U L2 U L2 F2 L2 F2 U L' U L2 F2 L F2 U' L'"],"o7":["L2 U F2 U' R2 U' F2 D2 F2 U R2 F2 U' R' D' L2 F2 D F2 D R","D' U2 R2 D' F2 D' F2 L2 D2 R2 D F U' F' L2 U F' L2 F","D' F2 U2 L2 F2 U' L2 D U2 F2 D R2 U' R D' F2 D' F2 L2 D R"],"o8":["D R2 D2 U' F2 D' R2 D F2 L2 D2 U2 R' D' L2 D R' D' F2 U'","L2 U2 L2 U F2 U2 L2 U' F2 U2 L2 U' F2 L' D' L2 U' L2 D L'","R2 D' R2 D R2 D' L D R2 D' L' R2 D R2"],"o9":["U2 F2 D' F2 D F2 U' R2 U F2 U F' U2 F' R2 F U2 F U","D2 U R2 U F2 U' R2 U F2 D' F2 D' L F2 R D2 R' F2 L' U2","R2 D' L2 F2 R2 U R2 U' R2 F2 D R2 U' F' D2 F' L2 F D2 F' U"],"o10":["R2 D F2 D' L2 U L2 U' F2 R2 F2 L2 D L F2 L' D' L F2 L F2","L2 U' L2 U R2 U' L2 U L2 R' F' L F R' F' L' F","L2 U R2 D2 R2 U' F2 D2 R2 F2 R2 D2 F2 R' D2 U R2 D2 U' L2 R'"],"p1":["L2 U F2 R2 D2 R2 U R2 U R2 F2 D2 U' R2 D U' L' R' F2 L' R'","U2 R2 D' F2 U R2 U' F2 D' R2 U2 F2 L' F2 L2 F2 L' R' D2 R","F2 U F2 R2 F2 U F2 U' R2 U' R2 U F2 U' F' L F' R2 F L' F'"],"p2":["L2 U L2 U' F2 D F2 D R2 D' R2 F2 U' R U F' U' F2 R' D' F","R2 U' R2 F2 U' R2 U R2 D R2 D' R2 U' F' D' U' F2 D U F' U","U' R2 F2 U L2 U' R2 U R2 U F2 U' F2 L' F' L' F2 U' R' F R'"],"p3":["R2 D L2 R2 U' R2 U L2 R2 F2 U2 F2 D2 F D2 U2 F2 D2 U2 F' D","F2 U R2 D' F2 D F2 U' L2 F2 U F2 R2 F' U' F L2 F' U F' U","U L2 R2 D' R2 D2 U L2 U' F2 U' F2 D U2 F2 D U2 F2 D U2"],"p4":["U' L2 D' L2 D' R2 F2 D U' F2 D' R2 D' F2 D' F2 D' F2 D' F2","F2 U F2 U2 F2 U2 F2 L2 F2 L2 U' F2 L2 F' L2 F2 L2 F2 L2 F'","F2 U' L2 F2 L2 U' L2 F2 U2 L2 F2 U2 L2 U2 L2 U2 L2 U2 L2 U2"],"p5":["R2 D2 R2 F2 D2 L2 D F2 L2 D2 F2 U2 L' D F' D' F2 L' U' F'","U' L2 U2 L2 D' F2 D F2 U2 L2 F2 U2 F2 L2 U R2 D2 U R2 D2 U","L2 U' L2 U' L2 D' L2 R2 U L2 D U' L2 D' R2 D' R2 D' R2 D'"],"p6":["U F2 U2 L2 F2 L2 U2 F2 U L2 U L2 U L2 U L2 U L2","L2 R2 U' L2 R2 D2 F2 L2 D2 F2 R2 F2 D2 F2 L2 U L R D2 L R","D' L2 D' R2 D' F2 D' R2 U' F2 U' R2 U' R2 U' L' R' U2 L' R'"],"p7":["U2 L2 D R2 U' F2 R2 F2 R2 D' L2 U F2 L' U L' F2 L U' L' U'","R2 U F2 U2 R2 F2 U2 F2 U F2 U' F2 U F2 R2 U' F2 U2 F2 U2 F2","F2 D F2 D R2 U R2 D2 F2 U' L2 U' L2 U2 F L2 F2 L2 F2 L2 F"]};
return { CubeEngine, Solver, WORDS, say, icon, TRACKS, LESSONS, byId, LESSON_DONE, LINES, SETUPS };
})();

/* ---- 30-cfop.js ---- */
/* ===== CFOP Learner: 3D cube, word moves + arrows, follow along with your real cube ===== */
addCSS(`
.cube-wrap{--cell:#C9CCD6;--cell-hi:#FFC2DE;--arrow:#FF2E93}
.cube-stage{background:radial-gradient(circle at 50% 40%,#232838,#0E1016);border-radius:20px;overflow:hidden;position:relative}
.cube-stage canvas{display:block;width:100%;aspect-ratio:1/1;max-height:52vh;touch-action:none;cursor:grab;margin:0 auto}
.cube-cap{display:flex;gap:12px;align-items:center;background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:12px 14px;margin-top:10px;min-height:76px}
.cube-cap .ci{flex:0 0 auto;width:52px;height:52px}
.cube-cap .ci svg{width:52px;height:52px}
.cube-cap p{margin:0;font-size:18px;line-height:1.35;flex:1;font-weight:600}
.cube-cap p small{display:block;font-size:13px;color:var(--muted);font-weight:600}
.mstrip{display:flex;gap:4px;overflow-x:auto;padding:8px 2px;scrollbar-width:none}
.mstrip::-webkit-scrollbar{display:none}
.mstrip button{flex:0 0 auto;border:2px solid transparent;background:var(--surface);border-radius:10px;padding:3px;display:flex;flex-direction:column;align-items:center;font-size:10px;color:var(--muted);width:56px}
.mstrip button svg{width:40px;height:40px}
.mstrip button.on{border-color:#FF2E93}
.mstrip button.past{opacity:.45}
.mstrip .lbl{flex:0 0 auto;align-self:center;font-size:12px;font-weight:700;background:var(--surface2);border-radius:999px;padding:4px 10px;white-space:nowrap}
.hold-tip{display:flex;gap:10px;flex-wrap:wrap;font-size:13px;font-weight:650;color:var(--muted);margin:8px 2px}
.hold-tip i{display:inline-block;width:14px;height:14px;border-radius:3px;vertical-align:-2px;margin-right:4px;border:1px solid rgba(0,0,0,.2)}
.lessons{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
@media (min-width:640px){.lessons{grid-template-columns:repeat(4,minmax(0,1fr))}}
.lesson{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;border:1px solid var(--line);background:var(--surface);border-radius:16px;padding:10px;text-align:center;min-width:0;box-shadow:var(--shadow)}
.lesson canvas{width:96px;height:96px}
.lesson b{font-size:14px;line-height:1.25}
.lesson small{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em}
.lesson .ok{position:absolute;top:8px;right:10px;color:var(--good);font-weight:800}
.scr{display:flex;flex-wrap:wrap;gap:6px}
.scr span{display:inline-flex;align-items:center;gap:4px;background:var(--surface2);border-radius:10px;padding:3px 8px 3px 3px;font-size:13px;font-weight:650}
.scr span svg{width:30px;height:30px}
.timer{font-size:64px;font-weight:800;text-align:center;font-variant-numeric:tabular-nums;font-family:var(--round);padding:22px 0;border-radius:20px;background:var(--surface);border:1px solid var(--line);width:100%;user-select:none;-webkit-user-select:none;touch-action:manipulation}
.timer.run{background:var(--good-soft);color:var(--good)}
`);
const CubeView = cv => {
  const COLS = { U: '#FFD500', D: '#F4F6F9', F: '#009E60', B: '#0051BA', R: '#FF5800', L: '#C41E3A' };
  const DEF = [-0.55, 0.5]; let yaw = DEF[0], pitch = DEF[1], state = null, mv = null, th = 0;
  const g = cv.getContext('2d');
  const rot = (v, ax, a) => { const c = Math.cos(a), s = Math.sin(a), [x, y, z] = v; return ax === 0 ? [x, y * c - z * s, y * s + z * c] : ax === 1 ? [x * c + z * s, y, -x * s + z * c] : [x * c - y * s, x * s + y * c, z]; };
  const view = v => { let [x, y, z] = v, c = Math.cos(yaw), s = Math.sin(yaw); [x, z] = [x * c + z * s, -x * s + z * c]; c = Math.cos(pitch); s = Math.sin(pitch); [y, z] = [y * c - z * s, y * s + z * c]; return [x, y, z]; };
  function draw() {
    if (!state) return; const r = cv.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1), W = Math.max(50, Math.round(r.width * dpr)), H = Math.max(50, Math.round(r.height * dpr));
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    g.clearRect(0, 0, W, H); const D = 22, f = Math.min(W, H) * 1.8, cx = W / 2, cy = H / 2;
    const P = v => { const k = f / (D - v[2]); return [cx + v[0] * k, cy - v[1] * k]; };
    const cubies = {}; for (const s of state.st) { const k = s.p.join(); (cubies[k] = cubies[k] || { p: s.p, st: [] }).st.push(s); }
    const list = [];
    for (const k in cubies) {
      const cb = cubies[k], moving = mv && mv.coords.has(cb.p[mv.ax]);
      const T = v => view(moving ? rot(v, mv.ax, th) : v);
      const c3 = T(cb.p), faces = [];
      for (const ax of [0, 1, 2]) for (const sg of [-1, 1]) {
        const d = [0, 0, 0]; d[ax] = sg; const o = [0, 1, 2].filter(i => i !== ax), sticker = cb.st.find(s => s.n[ax] === sg);
        if (!sticker && Math.abs(cb.p[ax]) === 2 && Math.sign(cb.p[ax]) === sg) { /* outer face without sticker cannot happen */ }
        const quad = (half, out) => [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => { const v = cb.p.slice(); v[ax] += sg * out; v[o[0]] += a * half; v[o[1]] += b * half; return T(v); });
        const nn = T(d.map((x, i) => x + cb.p[i])).map((x, i) => x - c3[i]);
        const fc = T(cb.p.map((x, i) => x + d[i]));
        const toCam = [-fc[0], -fc[1], D - fc[2]]; if (nn[0] * toCam[0] + nn[1] * toCam[1] + nn[2] * toCam[2] <= 0) continue;
        faces.push({ plate: quad(0.985, 1), st: sticker ? quad(0.8, 1.012) : null, col: sticker ? COLS[sticker.c] : null, shade: 0.75 + 0.25 * Math.max(0, nn[1] * 0.6 + nn[2] * 0.8) });
      }
      list.push({ z: c3[2], faces });
    }
    list.sort((a, b) => a.z - b.z);
    g.lineJoin = 'round';
    for (const cb of list) for (const fc of cb.faces) {
      const pl = fc.plate.map(P); g.beginPath(); pl.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fillStyle = '#0B0C10'; g.fill(); g.strokeStyle = '#0B0C10'; g.lineWidth = 1.5; g.stroke();
      if (fc.st) { const q = fc.st.map(P); g.beginPath(); q.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fillStyle = fc.col; g.fill(); if (fc.shade < 1) { g.fillStyle = 'rgba(0,0,0,' + (1 - fc.shade).toFixed(3) + ')'; g.fill(); } g.strokeStyle = 'rgba(255,255,255,.14)'; g.lineWidth = 1; g.stroke(); }
    }
  }
  let animEnd = null;
  function turn(tok, ms) {
    const E = Cube.CubeEngine; mv = E.parseMove(tok, 3); const target = mv.q === 3 ? -Math.PI / 2 : mv.q * Math.PI / 2; const t0 = performance.now(); const from = state;
    return new Promise(res => {
      let done = false; const fin = () => { if (done) return; done = true; mv = null; th = 0; state = E.applyMove(E.clone(from), tok); draw(); animEnd = null; res(); };
      animEnd = fin;
      const step = () => { if (done) return; const k = Math.min(1, (performance.now() - t0) / ms); th = target * (k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2); draw(); if (k < 1) requestAnimationFrame(step); else fin(); };
      requestAnimationFrame(step); setTimeout(fin, ms + 120);
    });
  }
  let drag = null;
  cv.addEventListener('pointerdown', e => { drag = [e.clientX, e.clientY, yaw, pitch]; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => { if (!drag) return; yaw = drag[2] + (e.clientX - drag[0]) * 0.01; pitch = clamp(drag[3] + (e.clientY - drag[1]) * 0.01, -1.4, 1.4); draw(); });
  cv.addEventListener('pointerup', () => drag = null);
  cv.addEventListener('dblclick', () => { yaw = DEF[0]; pitch = DEF[1]; draw(); });
  return { set(s) { if (animEnd) animEnd(); state = Cube.CubeEngine.clone(s); mv = null; draw(); }, turn, draw, reset() { yaw = DEF[0]; pitch = DEF[1]; draw(); }, get state() { return state; } };
};
function cubeThumb(state, size = 96) {
  const c = h('canvas', { width: size * 2, height: size * 2, style: { width: size + 'px', height: size + 'px' } });
  document.body.append(c); c.style.position = 'fixed'; c.style.left = '-999px';
  const v = CubeView(c); v.set(state); c.remove(); c.style.position = ''; c.style.left = ''; return c;
}
Apps.reg({
  id: 'cfop', name: 'CFOP Learner', icon: '🧊', color: 'linear-gradient(135deg,#FF2E93,#7B2FF7)', group: 'learn', keys: 'rubik cube speedcube f2l oll pll timer', blurb: 'Rubik’s cube lessons in plain words',
  mount(v, ctx) {
    const C = Cube, E = C.CubeEngine;
    let tab = Prefs.get('cubeTab', 'f2l'), follow = Prefs.get('cubeFollow', true), voice = Prefs.get('cubeVoice', true), pace = Prefs.get('cubePace', 1);
    let done = Prefs.get('cubeDone', {}), stopPlay = null, timerOff = null;
    const caseState = l => E.applyAlg(E.solved(3), E.invert(l.alg));
    const pickSetup = l => { const a = C.SETUPS[l.id]; return a && a.length ? pick(a) : E.invert(l.alg); };
    const holdTip = () => h('div', { class: 'hold-tip' }, h('span', null, h('i', { style: { background: '#FFD500' } }), 'Yellow on top'), h('span', null, h('i', { style: { background: '#009E60' } }), 'Green facing you'), h('span', null, h('i', { style: { background: '#FF5800' } }), 'Orange on the right'));
    function home() {
      if (stopPlay) stopPlay(); if (timerOff) { timerOff(); timerOff = null; }
      v.innerHTML = ''; ctx.setTitle('CFOP Learner'); ctx.setBack(null); ctx.setActions();
      const body = h('div', { class: 'cube-wrap' });
      v.append(UI.tabs([['f2l', 'F2L'], ['oll', 'OLL'], ['pll', 'PLL'], ['all', '📚 All 119'], ['solve', '🎲 Solve with me'], ['timer', '⏱️ Timer']], tab, t => { tab = t; Prefs.set('cubeTab', t); fill(); }), body);
      function fill() {
        body.innerHTML = ''; if (timerOff) { timerOff(); timerOff = null; }
        if (tab === 'timer') return timerOff = timer(body);
        if (tab === 'solve') return practice(body);
        if (tab === 'all') return allCases(body);
        const SUB = { f2l: 'White cross on the bottom. Each case fills the front-right slot: pair a white corner with its edge, then drop them in together.', oll: 'Two looks: first make a yellow cross, then turn the yellow corners to face up.', pll: 'Two looks: first fix the top corners, then the top edges. The top is already all yellow.' };
        body.append(h('p', { class: 'muted small', style: { margin: '0 2px 10px' } }, SUB[tab]), holdTip());
        const groups = {}; for (const l of C.LESSONS.filter(x => x.t === tab)) (groups[l.g] = groups[l.g] || []).push(l);
        for (const gname in groups) body.append(h('div', { class: 'sec' }, gname), h('div', { class: 'lessons' }, groups[gname].map(l =>
          h('button', { class: 'lesson', onclick: () => lesson(l) }, done[l.id] ? h('span', { class: 'ok', 'aria-label': 'done' }, '✓') : null, cubeThumb(caseState(l)), h('b', null, l.title)))));
        body.append(h('p', { class: 'tiny muted mt' },'Tap a case. With “Follow my cube” on, you start from a solved cube: I give you scramble moves that make the case, then we solve it together, one move at a time.'));
      }
      fill();
    }
    function player(prog) {
      if (stopPlay) stopPlay();
      v.innerHTML = ''; ctx.setTitle(prog.title); ctx.setBack(() => { home(); return true; });
      const cv = h('canvas'), stage = h('div', { class: 'cube-stage' }, cv), view = CubeView(cv);
      const capIcon = h('span', { class: 'ci' }), capText = h('p'), cap = h('div', { class: 'cube-cap', 'aria-live': 'polite' }, capIcon, capText);
      const strip = h('div', { class: 'mstrip', 'aria-label': 'Moves' });
      const backB = h('button', { class: 'btn', 'aria-label': 'Back one step' }, '◀'), mainB = h('button', { class: 'btn pri', style: { flex: 1 } }), againB = h('button', { class: 'btn' }, '↻ Again'), playB = h('button', { class: 'btn' });
      const followB = h('button', { class: 'chip' }), voiceB = h('button', { class: 'chip' });
      const steps = prog.steps, before = [E.clone(prog.init)];
      for (const s of steps) { const st = E.clone(before[before.length - 1]); if (s.k === 'move') E.applyMove(st, s.tok); before.push(st); }
      let pos = 0, auto = false, busy = false;
      v.append(h('div', { class: 'cube-wrap' }, stage, cap, h('div', { class: 'row nw mt' }, backB, againB, mainB), h('div', { class: 'row mt' }, playB, followB, voiceB, UI.seg([[0.6, 'Slow'], [1, 'Normal'], [1.6, 'Fast']], pace, p => { pace = p; Prefs.set('cubePace', p); })), strip, holdTip()));
      const moveIdx = steps.map((s, i) => s.k === 'move' ? i : -1).filter(i => i >= 0);
      strip.append(...steps.map((s, i) => s.k === 'move' ? h('button', { 'data-i': i, 'aria-label': C.say(s.tok), onclick: () => { auto = false; show(i, true); }, html: C.icon(s.tok) + '<span>' + (moveIdx.indexOf(i) + 1) + '</span>' }) : s.label ? h('span', { class: 'lbl', 'data-i': i }, s.label) : null).filter(Boolean));
      const paintChips = () => { followB.textContent = (follow ? '✋ Follow my cube: on' : '👀 Just watch'); followB.classList.toggle('on', follow); voiceB.textContent = voice ? '🔊 Voice on' : '🔇 Voice off'; voiceB.classList.toggle('on', voice); };
      followB.onclick = () => { follow = !follow; Prefs.set('cubeFollow', follow); if (prog.rebuild) player(prog.rebuild(follow)); else paintChips(); };
      voiceB.onclick = () => { voice = !voice; Prefs.set('cubeVoice', voice); if (!voice) Speak.stop(); paintChips(); };
      paintChips();
      async function show(i, animate) {
        pos = clamp(i, 0, steps.length - 1); const s = steps[pos];
        $$('button[data-i]', strip).forEach(b => { const k = +b.dataset.i; b.classList.toggle('on', k === pos); b.classList.toggle('past', k < pos); });
        const cur = strip.querySelector('.on'); if (cur) cur.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
        backB.disabled = pos === 0; againB.hidden = s.k !== 'move';
        if (s.k === 'move') {
          const n = moveIdx.indexOf(pos) + 1;
          capIcon.innerHTML = C.icon(s.tok); capText.innerHTML = esc(C.say(s.tok)) + '<small>Move ' + n + ' of ' + moveIdx.length + (prog.setupEnd && pos < prog.setupEnd ? ' · setting up the case' : '') + '</small>';
          mainB.textContent = follow ? 'I did it ✓' : 'Next ▶';
          if (voice) Speak.say(C.say(s.tok), { rate: 0.95 });
          if (animate) { view.set(before[pos]); busy = true; await view.turn(s.tok, 650 / pace); busy = false; } else view.set(before[pos + 1]);
        } else {
          capIcon.innerHTML = s.end ? '<span style="font-size:40px">🎉</span>' : '<span style="font-size:40px">💬</span>'; capText.textContent = s.text;
          mainB.textContent = s.end ? 'Back to lessons' : 'Next ▶'; view.set(before[pos]);
          if (voice) Speak.say(s.text, { rate: 0.98 });
          if (s.end && prog.onEnd) prog.onEnd();
        }
        playB.textContent = auto ? '⏸ Pause' : '▶ Play all';
      }
      const next = () => { const s = steps[pos]; if (s.end) { home(); return; } if (pos < steps.length - 1) show(pos + 1, true); };
      mainB.onclick = () => { auto = false; if (!busy) next(); };
      backB.onclick = () => { auto = false; show(pos - 1, false); };
      againB.onclick = () => show(pos, true);
      playB.onclick = async () => {
        if (auto) { auto = false; playB.textContent = '▶ Play all'; return; }
        auto = true; playB.textContent = '⏸ Pause';
        while (auto && pos < steps.length - 1) {
          const s = steps[pos]; await sleep(s.k === 'say' ? Math.max(1600, s.text.split(' ').length * 330) / pace : 350 / pace);
          if (!auto) break; await show(pos + 1, true);
        }
        auto = false; playB.textContent = '▶ Play all';
      };
      const onKey = e => { if (e.target.tagName === 'INPUT') return; if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); mainB.click(); } else if (e.key === 'ArrowLeft') backB.click(); };
      addEventListener('keydown', onKey); const onRs = () => view.draw(); addEventListener('resize', onRs);
      stopPlay = () => { auto = false; Speak.stop(); removeEventListener('keydown', onKey); removeEventListener('resize', onRs); stopPlay = null; };
      requestAnimationFrame(() => show(0, false)); setTimeout(() => view.draw(), 60);
    }
    /* ---------- all 119 cases (41 F2L + 57 OLL + 21 PLL) ---------- */
    function topView(st, mode) {
      const COL = { U: '#FFD500', D: '#F4F6F9', F: '#009E60', B: '#0051BA', R: '#FF5800', L: '#C41E3A' }, m = {};
      for (const s of st.st) if (s.p[1] === 2) m[s.p.join() + '|' + s.n.join()] = s.c;
      const col = c => mode === 'oll' ? (c === 'U' ? COL.U : '#5B6070') : COL[c];
      let g = '';
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const x = -2 + 2 * c, z = -2 + 2 * r; g += '<rect x="' + (14 + c * 24) + '" y="' + (14 + r * 24) + '" width="22" height="22" rx="4" fill="' + col(m[x + ',2,' + z + '|0,1,0']) + '"/>'; }
      for (let i = 0; i < 3; i++) { const x = -2 + 2 * i;
        g += '<rect x="' + (14 + i * 24) + '" y="2" width="22" height="10" rx="3" fill="' + col(m[x + ',2,-2|0,0,-1']) + '"/>';
        g += '<rect x="' + (14 + i * 24) + '" y="88" width="22" height="10" rx="3" fill="' + col(m[x + ',2,2|0,0,1']) + '"/>';
        g += '<rect x="2" y="' + (14 + i * 24) + '" width="10" height="22" rx="3" fill="' + col(m['-2,2,' + x + '|-1,0,0']) + '"/>';
        g += '<rect x="88" y="' + (14 + i * 24) + '" width="10" height="22" rx="3" fill="' + col(m['2,2,' + x + '|1,0,0']) + '"/>'; }
      return '<svg viewBox="0 0 100 100" width="96" height="96" role="img" aria-label="Top of the cube">' + g + '</svg>';
    }
    function allCases(el) {
      let kind = Prefs.get('cube119', 'oll'); const done = Prefs.get('cubeDone', {});
      const box = h('div');
      el.append(h('p', { class: 'muted small', style: { margin: '0 2px 10px' } }, 'Every CFOP case: 41 F2L, 57 OLL and 21 PLL. Each one starts from a solved cube with a real scramble, then shows the moves in words and arrows.'), holdTip(),
        UI.seg([['f2l', 'F2L · 41'], ['oll', 'OLL · 57'], ['pll', 'PLL · 21']], kind, k => { kind = k; Prefs.set('cube119', k); draw(); }), box);
      function draw() {
        box.innerHTML = ''; const list = CUBE_CASES[kind], learned = list.filter(c => done[c.id]).length;
        box.append(h('p', { class: 'small muted mt' }, learned + ' of ' + list.length + ' learned ✓'));
        const groups = {}; for (const c of list) (groups[c.group || c.name.split(' ')[0]] = groups[c.group || c.name.split(' ')[0]] || []).push(c);
        const G = kind === 'oll' ? (() => { const g = {}; for (const c of list) (g[c.name] = g[c.name] || []).push(c); return g; })() : kind === 'pll' ? { 'All PLL cases': list } : groups;
        for (const gname in G) box.append(h('div', { class: 'sec' }, gname), h('div', { class: 'lessons' }, G[gname].map(c => {
          const st = E.applyAlg(E.solved(3), c.setups[0]);
          return h('button', { class: 'lesson', onclick: () => caseLesson(c, kind) }, done[c.id] ? h('span', { class: 'ok', 'aria-label': 'learned' }, '✓') : null, kind === 'f2l' ? cubeThumb(st) : h('span', { html: topView(st, kind) }), h('b', null, kind === 'oll' ? 'OLL ' + c.n : kind === 'pll' ? c.n + ' perm' : c.name), h('small', null, c.len + ' moves'));
        })));
      }
      draw();
    }
    function caseLesson(c, kind) {
      const build = fol => {
        const steps = []; let setupEnd = 0; const setup = pick(c.setups);
        if (fol) { steps.push({ k: 'say', text: C.LINES.setup, label: 'Solved → case' }); E.tokenize(setup).forEach(t => steps.push({ k: 'move', tok: t })); setupEnd = steps.length; steps.push({ k: 'say', text: C.LINES.ready, label: 'Solve it' }); }
        const look = kind === 'f2l' ? c.look : kind === 'oll' ? 'OLL ' + c.n + ' (' + c.name + '). Turn the top until the yellow pattern matches the picture.' : c.name + '. Turn the top until the sides match the picture.';
        steps.push({ k: 'say', text: look }, { k: 'say', text: c.len + ' moves. Watch the pink arrow.' });
        E.tokenize(c.alg).forEach(t => steps.push({ k: 'move', tok: t }));
        steps.push({ k: 'say', text: kind === 'f2l' ? 'The pair is in! Try the next case.' : kind === 'oll' ? 'The whole top is yellow now. Nice!' : 'Solved! Great job.', end: true });
        return { title: kind === 'oll' ? 'OLL ' + c.n : kind === 'pll' ? c.n + ' perm' : c.name, init: fol ? E.solved(3) : E.applyAlg(E.solved(3), setup), steps, setupEnd, rebuild: build, onEnd: () => { const d = Prefs.get('cubeDone', {}); d[c.id] = 1; Prefs.set('cubeDone', d); } };
      };
      player(build(follow));
    }
    function lesson(l) {
      const build = fol => {
        const steps = []; let setupEnd = 0;
        if (fol) { steps.push({ k: 'say', text: C.LINES.setup, label: 'Solved → case' }); E.tokenize(pickSetup(l)).forEach(t => steps.push({ k: 'move', tok: t })); setupEnd = steps.length; steps.push({ k: 'say', text: C.LINES.ready, label: 'Solve it' }); }
        steps.push({ k: 'say', text: l.look }, { k: 'say', text: l.plan + ' Watch the pink arrow.' });
        E.tokenize(l.alg).forEach(t => steps.push({ k: 'move', tok: t }));
        const nx = C.LESSONS[C.LESSONS.indexOf(l) + 1];
        steps.push({ k: 'say', text: nx && nx.t === l.t ? 'Done! Next up: ' + nx.title + '. Go back to pick it, or tap ◀ to practice this one again.' : C.LINES.last, end: true });
        return { title: l.title, init: fol ? E.solved(3) : caseState(l), steps, setupEnd, rebuild: build, onEnd: () => { done[l.id] = 1; Prefs.set('cubeDone', done); } };
      };
      player(build(follow));
    }
    function solveProg(state, setup, title) {
      const res = C.Solver.solve(state), steps = []; const mv = t => steps.push({ k: 'move', tok: t }); let pair = 0, pllTold = false, setupEnd = 0;
      const NAMES = { cross: 'Cross', olle: 'Yellow cross', ollc: 'Yellow corners', pllc: 'Top corners', plle: 'Top edges' };
      if (setup) { steps.push({ k: 'say', text: 'Start with a solved cube, yellow on top and green facing you. Do these scramble moves first.', label: 'Scramble' }); E.tokenize(setup).forEach(mv); setupEnd = steps.length; }
      for (const s of res) {
        if (s.stage === 'cross') { if (!s.moves.length) continue; steps.push({ k: 'say', text: C.LINES.cross, label: 'Cross' }); s.moves.forEach(mv); }
        else if (s.stage === 'f2l') { pair++; if (pair === 1) steps.push({ k: 'say', text: C.LINES.f2l }); if (s.rot) mv(s.rot); steps.push({ k: 'say', text: C.LINES.pair, label: 'Pair ' + pair }); s.moves.forEach(mv); }
        else if (['olle', 'ollc', 'pllc', 'plle'].includes(s.stage)) {
          const key = s.stage, intro = key === 'olle' ? C.LINES.olle : key === 'ollc' ? C.LINES.ollc : key === 'pllc' ? (pllTold ? C.LINES.pllc2 : C.LINES.pllc) : C.LINES.plle; if (key === 'pllc') pllTold = true;
          if (s.done) { steps.push({ k: 'say', text: intro + ' ' + C.LINES[key + 'Done'], label: NAMES[key] }); continue; }
          const l = C.byId[s.id]; steps.push({ k: 'say', text: intro, label: NAMES[key] + ': ' + l.title }); if (s.auf) mv(s.auf); steps.push({ k: 'say', text: l.look }); E.tokenize(s.alg).forEach(mv);
        } else if (s.stage === 'auf' && s.moves.length) { steps.push({ k: 'say', text: C.LINES.auf, label: 'Finish' }); s.moves.forEach(mv); }
      }
      steps.push({ k: 'say', text: C.LINES.solved, end: true });
      return { title, init: setup ? E.solved(3) : state, steps, setupEnd };
    }
    const scramble = (len = 20) => { const out = []; let last = ''; while (out.length < len) { const t = pick(C.Solver.M18.filter(m => m[0] !== 'B')); if (t[0] === last) continue; last = t[0]; out.push(t); } return out.join(' '); };
    function practice(el) {
      el.append(h('p', { class: 'muted small' }, 'I make a random scramble, you copy it on your real cube, then I walk you through the whole solve: cross, F2L, OLL and PLL — using the moves from the lessons.'), holdTip(),
        h('div', { class: 'grid2 mt' },
          h('button', { class: 'bigbtn', onclick: () => { const s = scramble(); const st = E.applyAlg(E.solved(3), s); player(solveProg(st, s, 'Solve with me')); } }, h('span', { class: 'e' }, '🎲'), h('b', null, 'Full solve'), h('small', null, 'Scramble, then solve every step')),
          h('button', { class: 'bigbtn', onclick: () => { const s = scramble(); const st = E.applyAlg(E.solved(3), s); const cm = C.Solver.crossMoves(st); player(solveProg(E.applyAlg(st, cm.join(' ')), s + (cm.length ? ' ' + cm.join(' ') : ''), 'F2L practice')); } }, h('span', { class: 'e' }, '🧩'), h('b', null, 'F2L practice'), h('small', null, 'Starts with the cross already done'))));
    }
    function timer(el) {
      let times = Prefs.get('cubeTimes', []), t0 = 0, run = false, raf = 0, scr = scramble();
      const disp = h('button', { class: 'timer', 'aria-label': 'Timer. Tap to start or stop.' }, '0.00'), scrBox = h('div', { class: 'scr' }), stats = h('div', { class: 'grid3 mt' }), list = h('div', { class: 'mt' });
      const fmt = ms => (ms / 1000).toFixed(2);
      const avg = n => { if (times.length < n) return '—'; const a = times.slice(0, n).map(t => t.ms).sort((x, y) => x - y); const m = a.slice(1, -1); return fmt(m.reduce((x, y) => x + y, 0) / m.length); };
      const paint = () => {
        scrBox.innerHTML = ''; E.tokenize(scr).forEach((t, i) => scrBox.append(h('span', { html: C.icon(t) + esc((i + 1) + '. ' + C.say(t)) })));
        stats.innerHTML = ''; stats.append(h('div', { class: 'stat' }, h('b', null, times.length ? fmt(Math.min(...times.map(t => t.ms))) : '—'), h('small', null, 'Best')), h('div', { class: 'stat' }, h('b', null, avg(5)), h('small', null, 'Average of 5')), h('div', { class: 'stat' }, h('b', null, avg(12)), h('small', null, 'Average of 12')));
        list.innerHTML = ''; if (times.length) list.append(h('div', { class: 'list' }, times.slice(0, 30).map((t, i) => h('div', { class: 'li' }, h('span', { class: 't' }, h('b', null, fmt(t.ms) + ' s'), h('small', null, fmtDay(new Date(t.at)) + ' · ' + fmtTime(new Date(t.at)))), h('button', { class: 'ib', 'aria-label': 'Delete time', html: SVG.trash, onclick: () => { times.splice(i, 1); Prefs.set('cubeTimes', times); paint(); } })))));
      };
      const tick = () => { disp.textContent = fmt(performance.now() - t0); raf = requestAnimationFrame(tick); };
      const toggle = () => {
        if (!run) { run = true; t0 = performance.now(); disp.classList.add('run'); tick(); }
        else { run = false; cancelAnimationFrame(raf); const ms = performance.now() - t0; disp.textContent = fmt(ms); disp.classList.remove('run'); times.unshift({ ms, at: Date.now(), scr }); Prefs.set('cubeTimes', times.slice(0, 200)); scr = scramble(); Sfx.good(); paint(); }
      };
      disp.onclick = toggle; const onKey = e => { if (e.code === 'Space' && e.target === document.body) { e.preventDefault(); toggle(); } }; addEventListener('keydown', onKey);
      el.append(h('div', { class: 'sec', style: { marginTop: '4px' } }, 'Scramble (yellow top, green front)'), scrBox, h('div', { class: 'row mt' }, h('button', { class: 'btn sm', onclick: () => { scr = scramble(); paint(); } }, '🎲 New scramble')), h('div', { class: 'mt' }, disp), h('p', { class: 'tiny muted center' }, 'Tap the timer to start, tap again when solved. Space bar works too.'), stats, list);
      paint();
      return () => { cancelAnimationFrame(raf); removeEventListener('keydown', onKey); };
    }
    home();
    return () => { if (stopPlay) stopPlay(); if (timerOff) timerOff(); };
  },
});

/* ---- 31-chess.js ---- */
/* ===== Chess: full rules + a computer opponent (alpha-beta search) ===== */
addCSS(`
.chess{max-width:520px;margin:0 auto}
.board{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));border-radius:10px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,.25);aspect-ratio:1/1;user-select:none;-webkit-user-select:none;touch-action:manipulation}
.sq{position:relative;border:0;padding:0;display:grid;place-items:center;font-size:min(10.5vw,52px);line-height:1;aspect-ratio:1/1;min-width:0}
.sq.l{background:#EEDDBB}.sq.d{background:#B58863}
.sq.last.l{background:#F3E37A}.sq.last.d{background:#D6B54B}
.sq.sel{background:#8FB8F0!important}
.sq.chk{background:radial-gradient(circle,#FF5A4E 0,#FF5A4E 35%,transparent 75%),#B58863}
.sq.hint{box-shadow:inset 0 0 0 4px #36B37E}
.sq .pc{font-family:"Apple Symbols","Segoe UI Symbol","DejaVu Sans",serif;pointer-events:none}
.sq .pc.w{color:#FFFFFF;text-shadow:0 0 1px #000,0 0 1px #000,0 1px 2px rgba(0,0,0,.6);-webkit-text-stroke:1px #222}
.sq .pc.b{color:#16161A;text-shadow:0 1px 1px rgba(255,255,255,.35)}
.sq .dot{position:absolute;width:30%;height:30%;border-radius:50%;background:rgba(20,30,50,.32)}
.sq .ring{position:absolute;inset:4%;border-radius:50%;border:5px solid rgba(20,30,50,.32)}
.sq .co{position:absolute;font-size:10px;font-weight:700;opacity:.7;font-family:var(--font)}
.sq .co.f{right:3px;bottom:1px}.sq .co.r{left:3px;top:2px}
.sq.l .co{color:#B58863}.sq.d .co{color:#EEDDBB}
.cstatus{display:flex;align-items:center;gap:8px;margin:10px 2px;min-height:36px}
.cstatus b{flex:1;font-size:17px}
.caps{font-size:22px;letter-spacing:-4px;min-height:28px;color:var(--muted)}
.mlist{font-family:var(--mono);font-size:14px;display:flex;flex-wrap:wrap;gap:4px 10px;max-height:110px;overflow:auto;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:10px}
`);
const Chess = (() => {
  const VAL = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
  const PST = {
    p: [0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30, 20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, -5, -10, 0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0],
    n: [-50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30, 0, 10, 15, 15, 10, 0, -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30, -40, -20, 0, 5, 5, 0, -20, -40, -50, -40, -30, -30, -30, -30, -40, -50],
    b: [-20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 10, 10, 5, 0, -10, -10, 5, 5, 10, 10, 5, 5, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 5, 0, 0, 0, 0, 5, -10, -20, -10, -10, -10, -10, -10, -10, -20],
    r: [0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 10, 10, 10, 5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 5, 5, 0, 0, 0],
    q: [-20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 5, 5, 5, 0, -10, -5, 0, 5, 5, 5, 5, 0, -5, 0, 0, 5, 5, 5, 5, 0, -5, -10, 5, 5, 5, 5, 5, 0, -10, -10, 0, 5, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10, -10, -20],
    k: [-30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20, -20, -20, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20],
    ke: [-50, -40, -30, -20, -20, -30, -40, -50, -30, -20, -10, 0, 0, -10, -20, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30, -10, 30, 40, 40, 30, -10, -30, -30, -10, 30, 40, 40, 30, -10, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30, -30, 0, 0, 0, 0, -30, -30, -50, -30, -30, -30, -30, -30, -30, -50],
  };
  const N8 = [-17, -15, -10, -6, 6, 10, 15, 17], K8 = [-9, -8, -7, -1, 1, 7, 8, 9];
  const col = p => p && (p === p.toUpperCase() ? 'w' : 'b'), typ = p => p && p.toLowerCase();
  const file = s => s & 7, rank = s => s >> 3;
  const sqName = s => 'abcdefgh'[file(s)] + (8 - rank(s));
  function start() { const b = Array(64).fill(''); 'rnbqkbnr'.split('').forEach((p, i) => { b[i] = p; b[56 + i] = p.toUpperCase(); b[8 + i] = 'p'; b[48 + i] = 'P'; }); return { b, turn: 'w', cs: { K: 1, Q: 1, k: 1, q: 1 }, ep: -1, half: 0, full: 1, keys: [] }; }
  function attacked(S, sq, by) {
    const b = S.b, f = file(sq);
    const pawn = by === 'w' ? 'P' : 'p', dir = by === 'w' ? 8 : -8;
    for (const df of [-1, 1]) { const s = sq + dir + df; if (s >= 0 && s < 64 && Math.abs(file(s) - f) === 1 && b[s] === pawn) return true; }
    const kn = by === 'w' ? 'N' : 'n'; for (const d of N8) { const s = sq + d; if (s >= 0 && s < 64 && Math.abs(file(s) - f) <= 2 && b[s] === kn) return true; }
    const kg = by === 'w' ? 'K' : 'k'; for (const d of K8) { const s = sq + d; if (s >= 0 && s < 64 && Math.abs(file(s) - f) <= 1 && b[s] === kg) return true; }
    const rq = by === 'w' ? ['R', 'Q'] : ['r', 'q'], bq = by === 'w' ? ['B', 'Q'] : ['b', 'q'];
    for (const [d, set] of [[-8, rq], [8, rq], [-1, rq], [1, rq], [-9, bq], [-7, bq], [7, bq], [9, bq]]) {
      let s = sq; for (; ;) { const pf = file(s); s += d; if (s < 0 || s > 63 || Math.abs(file(s) - pf) > 1) break; if (b[s]) { if (set.includes(b[s])) return true; break; } }
    }
    return false;
  }
  const kingSq = (S, c) => S.b.indexOf(c === 'w' ? 'K' : 'k');
  const inCheck = (S, c) => attacked(S, kingSq(S, c), c === 'w' ? 'b' : 'w');
  function pseudo(S, capsOnly) {
    const out = [], b = S.b, me = S.turn, opp = me === 'w' ? 'b' : 'w';
    for (let s = 0; s < 64; s++) {
      const p = b[s]; if (!p || col(p) !== me) continue; const t = typ(p), f = file(s);
      const add = (to, extra) => { if (capsOnly && !b[to] && !(extra && (extra.ep || extra.promo))) return; out.push(Object.assign({ from: s, to, p, cap: b[to] }, extra)); };
      if (t === 'p') {
        const d = me === 'w' ? -8 : 8, startR = me === 'w' ? 6 : 1, lastR = me === 'w' ? 0 : 7, one = s + d;
        const push = (to, cap) => { if (rank(to) === lastR) for (const pr of 'qrbn') add(to, { promo: me === 'w' ? pr.toUpperCase() : pr }); else add(to); };
        if (one >= 0 && one < 64 && !b[one]) { push(one); if (rank(s) === startR && !b[one + d] && !capsOnly) add(one + d, { dbl: true }); }
        for (const df of [-1, 1]) { const to = one + df; if (to < 0 || to > 63 || Math.abs(file(to) - f) !== 1) continue; if (b[to] && col(b[to]) === opp) push(to); else if (to === S.ep) add(to, { ep: true, cap: me === 'w' ? 'p' : 'P' }); }
      } else if (t === 'n' || t === 'k') {
        for (const d of t === 'n' ? N8 : K8) { const to = s + d; if (to < 0 || to > 63 || Math.abs(file(to) - f) > (t === 'n' ? 2 : 1)) continue; if (!b[to] || col(b[to]) === opp) add(to); }
        if (t === 'k' && !capsOnly) {
          const r = me === 'w' ? 56 : 0, K = me === 'w' ? 'K' : 'k', Q = me === 'w' ? 'Q' : 'q';
          if (s === r + 4 && !attacked(S, s, opp)) {
            if (S.cs[K] && !b[r + 5] && !b[r + 6] && b[r + 7] === (me === 'w' ? 'R' : 'r') && !attacked(S, r + 5, opp) && !attacked(S, r + 6, opp)) add(r + 6, { castle: 'K' });
            if (S.cs[Q] && !b[r + 3] && !b[r + 2] && !b[r + 1] && b[r] === (me === 'w' ? 'R' : 'r') && !attacked(S, r + 3, opp) && !attacked(S, r + 2, opp)) add(r + 2, { castle: 'Q' });
          }
        }
      } else {
        const dirs = t === 'r' ? [-8, 8, -1, 1] : t === 'b' ? [-9, -7, 7, 9] : [-8, 8, -1, 1, -9, -7, 7, 9];
        for (const d of dirs) { let to = s; for (; ;) { const pf = file(to); to += d; if (to < 0 || to > 63 || Math.abs(file(to) - pf) > 1) break; if (!b[to]) add(to); else { if (col(b[to]) === opp) add(to); break; } } }
      }
    }
    return out;
  }
  function make(S, m) {
    const b = S.b, u = { m, cs: { ...S.cs }, ep: S.ep, half: S.half, full: S.full };
    b[m.to] = m.promo || m.p; b[m.from] = '';
    if (m.ep) b[m.to + (S.turn === 'w' ? 8 : -8)] = '';
    if (m.castle) { const r = S.turn === 'w' ? 56 : 0; if (m.castle === 'K') { b[r + 5] = b[r + 7]; b[r + 7] = ''; } else { b[r + 3] = b[r]; b[r] = ''; } }
    if (typ(m.p) === 'k') { if (S.turn === 'w') S.cs.K = S.cs.Q = 0; else S.cs.k = S.cs.q = 0; }
    for (const [sq, k] of [[63, 'K'], [56, 'Q'], [7, 'k'], [0, 'q']]) if (m.from === sq || m.to === sq) S.cs[k] = 0;
    S.ep = m.dbl ? (m.from + m.to) / 2 : -1; S.half = typ(m.p) === 'p' || m.cap ? 0 : S.half + 1; if (S.turn === 'b') S.full++;
    S.turn = S.turn === 'w' ? 'b' : 'w'; return u;
  }
  function unmake(S, u) {
    const m = u.m, b = S.b; S.turn = S.turn === 'w' ? 'b' : 'w'; S.cs = u.cs; S.ep = u.ep; S.half = u.half; S.full = u.full;
    b[m.from] = m.p; b[m.to] = m.ep ? '' : (m.cap || '');
    if (m.ep) b[m.to + (S.turn === 'w' ? 8 : -8)] = m.cap;
    if (m.castle) { const r = S.turn === 'w' ? 56 : 0; if (m.castle === 'K') { b[r + 7] = b[r + 5]; b[r + 5] = ''; } else { b[r] = b[r + 3]; b[r + 3] = ''; } }
  }
  function legal(S, capsOnly) { const me = S.turn, out = []; for (const m of pseudo(S, capsOnly)) { const u = make(S, m); if (!inCheck(S, me)) out.push(m); unmake(S, u); } return out; }
  const key = S => S.b.map(p => p || '.').join('') + S.turn + (S.cs.K ? 'K' : '') + (S.cs.Q ? 'Q' : '') + (S.cs.k ? 'k' : '') + (S.cs.q ? 'q' : '') + S.ep;
  function evaluate(S) {
    let s = 0, mat = 0; for (let i = 0; i < 64; i++) { const p = S.b[i]; if (p && typ(p) !== 'p' && typ(p) !== 'k') mat += VAL[typ(p)]; }
    const end = mat <= 2600;
    for (let i = 0; i < 64; i++) { const p = S.b[i]; if (!p) continue; const t = typ(p), w = col(p) === 'w', idx = w ? i : (7 - rank(i)) * 8 + file(i); const v = VAL[t] + (t === 'k' && end ? PST.ke : PST[t])[idx]; s += w ? v : -v; }
    return S.turn === 'w' ? s : -s;
  }
  function order(ms) { return ms.sort((a, b) => ((b.cap ? 10 * VAL[typ(b.cap)] - VAL[typ(b.p)] : 0) + (b.promo ? 800 : 0)) - ((a.cap ? 10 * VAL[typ(a.cap)] - VAL[typ(a.p)] : 0) + (a.promo ? 800 : 0))); }
  function search(S, level) {
    const cfg = [{ d: 1, t: 200, noise: 120 }, { d: 2, t: 700, noise: 35 }, { d: 4, t: 1300, noise: 0 }, { d: 6, t: 2600, noise: 0 }][level];
    const t0 = performance.now(); let nodes = 0, stop = false;
    const q = (alpha, beta, depth) => {
      if ((++nodes & 1023) === 0 && performance.now() - t0 > cfg.t) stop = true;
      const stand = evaluate(S); if (stand >= beta) return beta; if (stand > alpha) alpha = stand; if (depth <= 0) return alpha;
      for (const m of order(legal(S, true))) { const u = make(S, m); const sc = -q(-beta, -alpha, depth - 1); unmake(S, u); if (stop) return alpha; if (sc >= beta) return beta; if (sc > alpha) alpha = sc; }
      return alpha;
    };
    const ab = (depth, alpha, beta, ply) => {
      if ((++nodes & 1023) === 0 && performance.now() - t0 > cfg.t) stop = true;
      const ms = legal(S); if (!ms.length) return inCheck(S, S.turn) ? -100000 + ply : 0;
      if (S.half >= 100) return 0;
      if (depth <= 0) return q(alpha, beta, level >= 2 ? 6 : 2);
      for (const m of order(ms)) { const u = make(S, m); const sc = -ab(depth - 1, -beta, -alpha, ply + 1); unmake(S, u); if (stop) return alpha; if (sc >= beta) return beta; if (sc > alpha) alpha = sc; }
      return alpha;
    };
    let root = order(legal(S)); if (!root.length) return null; let best = root[0], bestScores = null;
    for (let d = 1; d <= cfg.d; d++) {
      const scores = []; let alpha = -Infinity;
      // easy levels search every root move fully (exact scores, then add "mistake" noise); strong levels prune with alpha-beta
      for (const m of root) { const u = make(S, m); const sc = -ab(d - 1, -Infinity, cfg.noise ? Infinity : -alpha, 1); unmake(S, u); if (stop) break; scores.push([m, sc]); if (sc > alpha) alpha = sc; }
      if (stop && d > 1) break;
      scores.sort((a, b) => b[1] - a[1]); bestScores = scores; root = scores.map(x => x[0]).concat(root.filter(m => !scores.find(x => x[0] === m)));
      if (stop) break;
    }
    if (bestScores && bestScores.length) { const noisy = bestScores.map(([m, sc]) => [m, sc + (Math.random() - 0.5) * 2 * cfg.noise]); noisy.sort((a, b) => b[1] - a[1]); best = noisy[0][0]; }
    return best;
  }
  function san(S, m) {
    if (m.castle) return m.castle === 'K' ? 'O-O' : 'O-O-O';
    const t = typ(m.p); let s = '';
    if (t === 'p') { if (m.cap) s = 'abcdefgh'[file(m.from)] + 'x'; s += sqName(m.to); if (m.promo) s += '=' + m.promo.toUpperCase(); }
    else {
      s = t.toUpperCase(); const others = legal(S).filter(o => o.p === m.p && o.to === m.to && o.from !== m.from);
      if (others.length) { if (others.every(o => file(o.from) !== file(m.from))) s += 'abcdefgh'[file(m.from)]; else if (others.every(o => rank(o.from) !== rank(m.from))) s += 8 - rank(m.from); else s += sqName(m.from); }
      if (m.cap) s += 'x'; s += sqName(m.to);
    }
    const u = make(S, m); const chk = inCheck(S, S.turn), mate = chk && !legal(S).length; unmake(S, u);
    return s + (mate ? '#' : chk ? '+' : '');
  }
  function status(S) {
    const ms = legal(S); const chk = inCheck(S, S.turn);
    if (!ms.length) return chk ? { over: true, win: S.turn === 'w' ? 'b' : 'w', why: 'Checkmate' } : { over: true, why: 'Stalemate — it’s a draw' };
    if (S.half >= 100) return { over: true, why: '50 moves with no capture — draw' };
    const pcs = S.b.filter(p => p && typ(p) !== 'k');
    if (!pcs.length || (pcs.length === 1 && 'nb'.includes(typ(pcs[0])))) return { over: true, why: 'Not enough pieces to win — draw' };
    const k = key(S); if (S.keys.filter(x => x === k).length >= 3) return { over: true, why: 'Same position 3 times — draw' };
    return { over: false, check: chk };
  }
  return { start, legal, make, unmake, search, san, status, key, inCheck, sqName, col, typ, VAL, kingSq };
})();
Apps.reg({
  id: 'chess', name: 'Chess', icon: '♟️', color: 'linear-gradient(135deg,#8D6E63,#4E342E)', group: 'play', keys: 'board game strategy checkmate', blurb: 'Play the computer or a friend',
  mount(v, ctx) {
    const GLY = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' };
    const LEVELS = ['Easy', 'Medium', 'Hard', 'Expert'];
    let S, cfg, moves = [], sans = [], sel = -1, targets = [], last = null, hint = null, thinking = false, over = null, flipped = false, alive = true;
    const boardEl = h('div', { class: 'board', role: 'grid', 'aria-label': 'Chess board' });
    const status = h('div', { class: 'cstatus' }), capsTop = h('div', { class: 'caps' }), capsBot = h('div', { class: 'caps' }), mlist = h('div', { class: 'mlist', 'aria-label': 'Moves' });
    const btns = h('div', { class: 'row mt' },
      h('button', { class: 'btn', onclick: () => undo() }, '↩️ Undo'), h('button', { class: 'btn', onclick: () => doHint() }, '💡 Hint'),
      h('button', { class: 'btn', onclick: () => { flipped = !flipped; draw(); } }, '🔄 Flip'), h('button', { class: 'btn pri', onclick: () => newGame() }, 'New game'));
    v.append(h('div', { class: 'chess' }, capsTop, boardEl, capsBot, status, btns, h('div', { class: 'sec' }, 'Moves'), mlist, h('button', { class: 'btn ghost mt', onclick: rules }, '📘 How the pieces move')));
    const save = () => Prefs.set('chessGame', { cfg, moves: moves.map(m => [m.from, m.to, m.promo || '']) });
    function load() {
      const g = Prefs.get('chessGame', null); cfg = g && g.cfg || { mode: 'ai', you: 'w', level: 1 };
      S = Chess.start(); S.keys = [Chess.key(S)]; moves = []; sans = []; flipped = cfg.mode === 'ai' && cfg.you === 'b';
      if (g) for (const [f, t, pr] of g.moves) { const m = Chess.legal(S).find(x => x.from === f && x.to === t && (x.promo || '') === pr); if (!m) break; apply(m, true); }
      draw(); maybeAI();
    }
    function apply(m, quiet) {
      sans.push(Chess.san(S, m)); Chess.make(S, m); S.keys.push(Chess.key(S)); moves.push(m); last = m; sel = -1; targets = []; hint = null;
      const st = Chess.status(S); over = st.over ? st : null;
      if (!quiet) { if (m.cap) Sfx.tone(300, 0.08, { type: 'square', vol: 0.06 }); else Sfx.tap(); if (over) setTimeout(() => (over.win ? (cfg.mode === 'ai' && over.win !== cfg.you ? Sfx.bad() : Sfx.win()) : null), 200); save(); }
    }
    function undo() {
      if (thinking || !moves.length) return; let n = cfg.mode === 'ai' ? (S.turn === cfg.you ? 2 : 1) : 1; n = Math.min(n, moves.length);
      const keep = moves.slice(0, moves.length - n); S = Chess.start(); S.keys = [Chess.key(S)]; moves = []; sans = []; last = null; over = null;
      for (const m of keep) apply(Chess.legal(S).find(x => x.from === m.from && x.to === m.to && (x.promo || '') === (m.promo || '')), true);
      save(); draw();
    }
    function aiTurn() { return cfg.mode === 'ai' && S.turn !== cfg.you && !over; }
    function maybeAI() {
      if (!aiTurn()) return; thinking = true; draw();
      setTimeout(() => { if (!alive) return; const m = Chess.search(S, cfg.level); thinking = false; if (m) apply(m); draw(); }, 280);
    }
    function doHint() { if (over || thinking || aiTurn()) return; status.firstChild && (status.firstChild.textContent = 'Thinking of a good move…'); setTimeout(() => { hint = Chess.search(S, 2); draw(); }, 30); }
    async function promoPick() { return new Promise(res => { const c = S.turn; const s = UI.sheet({ title: 'Turn your pawn into…', onClose: () => res(null), body: h('div', { class: 'row', style: { justifyContent: 'center' } }, ['q', 'r', 'b', 'n'].map(t => h('button', { class: 'btn', style: { fontSize: '40px', minWidth: '64px' }, onclick: () => { res(c === 'w' ? t.toUpperCase() : t); s.close(); } }, GLY[t] + '︎'))) }); }); }
    async function tap(sq) {
      if (over || thinking || aiTurn()) return;
      const p = S.b[sq];
      if (sel >= 0 && targets.some(m => m.to === sq)) {
        let opts = targets.filter(m => m.to === sq), m = opts[0];
        if (opts.length > 1) { const pr = await promoPick(); if (!pr) return; m = opts.find(x => x.promo === pr); }
        apply(m); draw(); maybeAI(); return;
      }
      if (p && Chess.col(p) === S.turn) { sel = sq; targets = Chess.legal(S).filter(m => m.from === sq); } else { sel = -1; targets = []; }
      draw();
    }
    function draw() {
      boardEl.innerHTML = ''; const kSq = Chess.inCheck(S, S.turn) ? Chess.kingSq(S, S.turn) : -1;
      for (let i = 0; i < 64; i++) {
        const sq = flipped ? 63 - i : i, r = sq >> 3, f = sq & 7, light = (r + f) % 2 === 0, p = S.b[sq];
        const t = targets.find(m => m.to === sq);
        const cls = 'sq ' + (light ? 'l' : 'd') + (last && (last.from === sq || last.to === sq) ? ' last' : '') + (sq === sel ? ' sel' : '') + (sq === kSq ? ' chk' : '') + (hint && (hint.from === sq || hint.to === sq) ? ' hint' : '');
        boardEl.append(h('button', { class: cls, 'aria-label': Chess.sqName(sq) + (p ? ' ' + (Chess.col(p) === 'w' ? 'white ' : 'black ') + ({ k: 'king', q: 'queen', r: 'rook', b: 'bishop', n: 'knight', p: 'pawn' })[Chess.typ(p)] : ''), onclick: () => tap(sq) },
          p ? h('span', { class: 'pc ' + Chess.col(p) }, GLY[Chess.typ(p)] + '︎') : null, t ? h('span', { class: t.cap ? 'ring' : 'dot' }) : null,
          (flipped ? r === 0 : r === 7) ? h('span', { class: 'co f' }, 'abcdefgh'[f]) : null, (flipped ? f === 7 : f === 0) ? h('span', { class: 'co r' }, 8 - r) : null));
      }
      const cap = { w: [], b: [] }; const cnt = {}; for (const p of S.b) if (p) cnt[p] = (cnt[p] || 0) + 1;
      const full = { p: 8, n: 2, b: 2, r: 2, q: 1 }; let diff = 0;
      for (const t in full) for (const c of ['w', 'b']) { const P = c === 'w' ? t.toUpperCase() : t, miss = Math.max(0, full[t] - (cnt[P] || 0)); for (let i = 0; i < miss; i++) cap[c].push(GLY[t] + '︎'); diff += (c === 'w' ? -1 : 1) * miss * Chess.VAL[t]; }
      const bottom = flipped ? 'b' : 'w', top = bottom === 'w' ? 'b' : 'w';
      const capLine = c => { const lost = c === 'w' ? cap.b : cap.w, adv = (c === 'w' ? diff : -diff) / 100; return lost.join('') + (adv > 0 ? '  +' + adv : ''); };
      capsTop.textContent = capLine(top); capsBot.textContent = capLine(bottom);
      status.innerHTML = '';
      const who = c => cfg.mode === 'ai' ? (c === cfg.you ? 'You' : 'Computer') : (c === 'w' ? 'White' : 'Black');
      let msg = over ? (over.win ? '🏆 ' + over.why + '! ' + (cfg.mode === 'ai' ? (over.win === cfg.you ? 'You win!' : 'The computer wins.') : (over.win === 'w' ? 'White' : 'Black') + ' wins!') : '🤝 ' + over.why) : thinking ? '🤔 Computer is thinking…' : (Chess.inCheck(S, S.turn) ? '⚠️ Check! ' : '') + (cfg.mode === 'ai' ? (S.turn === cfg.you ? 'Your move' : '') : who(S.turn) + ' to move');
      if (hint && !over) msg = '💡 Try moving from ' + Chess.sqName(hint.from) + ' to ' + Chess.sqName(hint.to);
      status.append(h('b', null, msg), h('span', { class: 'pill' }, cfg.mode === 'ai' ? '🤖 ' + LEVELS[cfg.level] : '👥 2 players'));
      mlist.innerHTML = ''; for (let i = 0; i < sans.length; i += 2) mlist.append(h('span', null, (i / 2 + 1) + '. ' + sans[i] + (sans[i + 1] ? ' ' + sans[i + 1] : '')));
      mlist.scrollTop = mlist.scrollHeight;
      if (!moves.length) mlist.append(h('span', { class: 'muted' }, 'No moves yet'));
    }
    function newGame() {
      let mode = cfg.mode, you = cfg.you, level = cfg.level;
      const body = h('div', null,
        h('label', { class: 'f' }, h('span', null, 'Play against'), UI.seg([['ai', '🤖 Computer'], ['two', '👥 A friend']], mode, m => { mode = m; aiOpts.hidden = m !== 'ai'; })),
        h('div', { id: 'aiOpts' }));
      const aiOpts = body.querySelector('#aiOpts');
      aiOpts.append(h('label', { class: 'f' }, h('span', null, 'You play'), UI.seg([['w', '⚪ White'], ['b', '⚫ Black'], ['r', '🎲 Random']], you, x => you = x)),
        h('label', { class: 'f' }, h('span', null, 'Computer level'), UI.seg(LEVELS.map((l, i) => [i, l]), level, x => level = x)));
      aiOpts.hidden = mode !== 'ai';
      UI.sheet({ title: 'New game', body, actions: [{ label: 'Cancel' }, { label: 'Start', cls: 'pri', onClick: c => {
        cfg = { mode, you: you === 'r' ? (Math.random() < 0.5 ? 'w' : 'b') : you, level }; Prefs.set('chessGame', { cfg, moves: [] }); c(); load();
      } }] });
    }
    function rules() {
      const r = (g, n, t) => h('div', { class: 'li' }, h('span', { class: 'ic', style: { fontSize: '28px' } }, g + '︎'), h('span', { class: 't' }, h('b', null, n), h('small', { style: { whiteSpace: 'normal' } }, t)));
      UI.sheet({ title: 'How the pieces move', body: h('div', null, h('div', { class: 'list' },
        r('♚', 'King', 'One square any way. Keep him safe! If he is attacked and can’t escape, that’s checkmate.'),
        r('♛', 'Queen', 'Any number of squares in a straight line or diagonal. The strongest piece.'),
        r('♜', 'Rook', 'Any number of squares up, down, left or right.'),
        r('♝', 'Bishop', 'Any number of squares diagonally. Stays on one color.'),
        r('♞', 'Knight', 'Jumps in an L: two squares one way, then one to the side. It can hop over pieces.'),
        r('♟', 'Pawn', 'Forward one (two on its first move). Captures one square diagonally. Reach the far side to become a queen!')),
        h('p', { class: 'small muted mt' }, 'Special moves: castling (king jumps two squares toward a rook, rook hops over), and en passant (a pawn can capture a pawn that just jumped two squares past it).')) });
    }
    load();
    return () => { alive = false; };
  },
});

/* ---- 32-cards.js ---- */
/* ===== Flashcards: your own decks with spaced review ===== */
addCSS(`
.deck{display:flex;flex-direction:column;align-items:flex-start;gap:4px;border:0;border-radius:18px;padding:14px;color:#fff;text-align:left;min-height:118px;box-shadow:var(--shadow);min-width:0}
.deck .e{font-size:30px;line-height:1}
.deck b{font-size:17px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.deck small{opacity:.9;font-size:13px}
.flip{perspective:1200px;margin:6px 0 12px}
.flip .in{position:relative;min-height:260px;transition:transform .45s cubic-bezier(.2,.8,.2,1);transform-style:preserve-3d}
.flip.on .in{transform:rotateY(180deg)}
.flip .face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;background:var(--surface);border:1px solid var(--line);border-radius:22px;box-shadow:var(--shadow);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:22px;text-align:center;font-size:clamp(20px,5.5vw,30px);font-weight:700;white-space:pre-wrap;word-break:break-word;overflow:auto}
.flip .face small{position:absolute;top:12px;left:16px;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.flip .back{transform:rotateY(180deg);background:var(--accent-soft)}
.choices{display:grid;gap:8px}
.choices button{text-align:left;border:1px solid var(--line);background:var(--surface);border-radius:14px;padding:14px;font-size:17px;font-weight:600;min-height:54px}
.choices button.right{background:var(--good-soft);border-color:var(--good)}
.choices button.wrong{background:var(--bad-soft);border-color:var(--bad)}
`);
const DECK_COLORS = ['linear-gradient(135deg,#6C63FF,#3F37C9)', 'linear-gradient(135deg,#FF8A5B,#E5446D)', 'linear-gradient(135deg,#2EC4B6,#118AB2)', 'linear-gradient(135deg,#F9C74F,#F8961E)', 'linear-gradient(135deg,#90BE6D,#43AA8B)', 'linear-gradient(135deg,#C77DFF,#7B2CBF)'];
const BOX_DAYS = [0, 1, 3, 7, 14, 30];
const SAMPLE_DECKS = {
  'World capitals': ['🌍', 'France\tParis', 'Japan\tTokyo', 'Brazil\tBrasília', 'Canada\tOttawa', 'Australia\tCanberra', 'Egypt\tCairo', 'India\tNew Delhi', 'Mexico\tMexico City', 'Kenya\tNairobi', 'Germany\tBerlin', 'Argentina\tBuenos Aires', 'South Korea\tSeoul'],
  'Spanish starter': ['🇪🇸', 'Hello\tHola', 'Thank you\tGracias', 'Please\tPor favor', 'Good morning\tBuenos días', 'Water\tAgua', 'Friend\tAmigo / Amiga', 'Cat\tGato', 'Dog\tPerro', 'House\tCasa', 'Book\tLibro', 'Red\tRojo', 'How are you?\t¿Cómo estás?'],
  'Science facts': ['🔬', 'Closest star to Earth\tThe Sun', 'H2O is…\tWater', 'Planet with the biggest rings\tSaturn', 'Gas plants breathe in\tCarbon dioxide', 'Hardest natural material\tDiamond', 'Boiling point of water\t100 °C (212 °F)', 'Largest organ of the human body\tSkin', 'Force that pulls things down\tGravity', 'Speed of light (about)\t300,000 km per second', 'Smallest unit of life\tThe cell'],
};
const Cards = {
  async decks() { return (await DB.all('decks')).sort((a, b) => a.created - b.created); },
  async cards(deck) { return (await DB.all('cards')).filter(c => c.deck === deck); },
  due: c => (c.due || 0) <= Date.now(),
  async addSample(name) { const [emoji, ...rows] = SAMPLE_DECKS[name]; const d = { id: uid(), name, emoji, color: pick(DECK_COLORS), created: Date.now() }; await DB.put('decks', d); for (const r of rows) { const [f, b] = r.split('\t'); await DB.put('cards', { id: uid(), deck: d.id, front: f, back: b, box: 0, due: 0, created: Date.now() }); } return d; },
  norm: s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\p{L}\p{N} ]+/gu, ' ').replace(/\s+/g, ' ').trim(),
  close(a, b) { a = this.norm(a); b = this.norm(b); if (a === b) return true; if (b.length < 5) return false; const m = a.length, n = b.length; if (Math.abs(m - n) > 1) return false; const d = Array.from({ length: m + 1 }, (_, i) => [i]); for (let j = 1; j <= n; j++) d[0][j] = j; for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[m][n] <= 1; },
  async grade(c, ok) { c.seen = (c.seen || 0) + 1; if (ok) { c.right = (c.right || 0) + 1; c.box = Math.min(5, (c.box || 0) + 1); } else { c.wrong = (c.wrong || 0) + 1; c.box = 0; } c.due = Date.now() + BOX_DAYS[c.box] * 86400e3; await DB.put('cards', c); },
};
Apps.reg({
  id: 'cards', name: 'Flashcards', icon: '🗂️', color: 'linear-gradient(135deg,#7F7FD5,#5B5BD6)', group: 'learn', keys: 'study quiz memorize decks review', blurb: 'Make cards, learn anything',
  async badge() { return (await DB.all('cards')).filter(c => Cards.due(c) && c.seen).length; },
  mount(v, ctx) {
    async function home() {
      v.innerHTML = ''; ctx.setTitle('Flashcards'); ctx.setBack(null); ctx.setActions();
      const decks = await Cards.decks(), all = await DB.all('cards');
      v.append(h('button', { class: 'fab', 'aria-label': 'New deck', html: SVG.plus, onclick: newDeck }));
      if (!decks.length) {
        v.append(UI.empty('🗂️', 'Make your first deck', 'A deck is a set of cards: a question on the front, the answer on the back. I show you hard cards more often.'),
          h('div', { class: 'center' }, h('button', { class: 'btn pri', onclick: newDeck }, '＋ New deck')), h('div', { class: 'sec' }, 'Or start with a sample'),
          h('div', { class: 'list' }, Object.keys(SAMPLE_DECKS).map(n => h('button', { class: 'li', onclick: async () => { const d = await Cards.addSample(n); deck(d); } }, h('span', { class: 'ic' }, SAMPLE_DECKS[n][0]), h('span', { class: 't' }, h('b', null, n), h('small', null, (SAMPLE_DECKS[n].length - 1) + ' cards')), h('span', { class: 'chev' }, '›')))));
        return;
      }
      const due = all.filter(Cards.due).length;
      v.append(h('p', { class: 'muted', style: { margin: '0 2px 12px' } }, due ? '📚 ' + due + ' cards ready to review.' : '✅ Nothing due right now. Great job!'));
      v.append(h('div', { class: 'grid2 w' }, decks.map(d => { const cs = all.filter(c => c.deck === d.id), dn = cs.filter(Cards.due).length; return h('button', { class: 'deck', style: { background: d.color }, onclick: () => deck(d) }, h('span', { class: 'e' }, d.emoji || '🗂️'), h('b', null, d.name), h('small', null, cs.length + ' cards' + (dn ? ' · ' + dn + ' due' : ' · all done ✓'))); })));
      const left = Object.keys(SAMPLE_DECKS).filter(n => !decks.some(d => d.name === n));
      if (left.length) v.append(h('div', { class: 'sec' }, 'Sample decks'), h('div', { class: 'chips' }, left.map(n => h('button', { class: 'chip', onclick: async () => { await Cards.addSample(n); home(); } }, SAMPLE_DECKS[n][0] + ' ' + n))));
    }
    function newDeck(d0) {
      const d = d0 && d0.id ? d0 : null;
      const name = h('input', { type: 'text', value: d ? d.name : '', placeholder: 'Deck name (e.g. Science test)' }), emoji = h('input', { type: 'text', value: d ? d.emoji : '📘', maxlength: 4, style: { width: '72px', textAlign: 'center', fontSize: '24px' } });
      let color = d ? d.color : pick(DECK_COLORS);
      UI.sheet({ title: d ? 'Edit deck' : 'New deck', body: h('div', null, h('div', { class: 'row nw' }, emoji, name), h('div', { class: 'mt' }, UI.swatches(DECK_COLORS, color, c => color = c))),
        actions: [{ label: 'Cancel' }, { label: d ? 'Save' : 'Create', cls: 'pri', onClick: async c => { if (!name.value.trim()) return UI.toast('Name your deck'); const rec = Object.assign(d || { id: uid(), created: Date.now() }, { name: name.value.trim(), emoji: emoji.value.trim() || '📘', color }); await DB.put('decks', rec); c(); deck(rec); } }] });
    }
    async function deck(d) {
      v.innerHTML = ''; ctx.setTitle(d.name); ctx.setBack(() => { home(); return true; });
      ctx.setActions(h('button', { class: 'ib', 'aria-label': 'Deck options', html: SVG.more, onclick: () => UI.menu(d.name, [
        { icon: '✏️', label: 'Rename or recolor', run: () => newDeck(d) },
        { icon: '📋', label: 'Add many cards at once', run: () => bulk(d) },
        { icon: '📤', label: 'Share as text', run: async () => shareText((await Cards.cards(d.id)).map(c => c.front + ' = ' + c.back).join('\n'), d.name) },
        { icon: '🔄', label: 'Reset progress', run: async () => { for (const c of await Cards.cards(d.id)) { c.box = 0; c.due = 0; c.seen = c.right = c.wrong = 0; await DB.put('cards', c); } deck(d); } },
        { icon: '🗑️', label: 'Delete deck', danger: true, run: async () => { if (await UI.ask('Delete “' + d.name + '” and all its cards?', { ok: 'Delete', danger: true })) { for (const c of await Cards.cards(d.id)) await DB.del('cards', c.id); await DB.del('decks', d.id); home(); } } },
      ]) }));
      const cs = (await Cards.cards(d.id)).sort((a, b) => a.created - b.created), due = cs.filter(Cards.due).length, known = cs.filter(c => (c.box || 0) >= 3).length;
      v.append(h('div', { class: 'grid3' }, h('div', { class: 'stat' }, h('b', null, cs.length), h('small', null, 'Cards')), h('div', { class: 'stat' }, h('b', null, due), h('small', null, 'Due now')), h('div', { class: 'stat' }, h('b', null, cs.length ? Math.round(100 * known / cs.length) + '%' : '—'), h('small', null, 'Learned'))),
        h('div', { class: 'grid3 mt' },
          h('button', { class: 'bigbtn', disabled: !cs.length, onclick: () => study(d, cs, 'flip') }, h('span', { class: 'e' }, '🃏'), h('b', null, 'Study'), h('small', null, 'Flip cards')),
          h('button', { class: 'bigbtn', disabled: cs.length < 4, onclick: () => study(d, cs, 'quiz') }, h('span', { class: 'e' }, '✅'), h('b', null, 'Quiz'), h('small', null, cs.length < 4 ? 'Needs 4 cards' : 'Pick the answer')),
          h('button', { class: 'bigbtn', disabled: !cs.length, onclick: () => study(d, cs, 'type') }, h('span', { class: 'e' }, '⌨️'), h('b', null, 'Type it'), h('small', null, 'Spell the answer'))),
        h('div', { class: 'row', style: { margin: '20px 4px 8px' } }, h('div', { class: 'sec', style: { margin: 0, flex: 1 } }, 'Cards'), h('button', { class: 'btn sm', onclick: () => bulk(d) }, '📋 Paste many'), h('button', { class: 'btn pri sm', onclick: () => editCard(d, null) }, '＋ Card')));
      if (!cs.length) v.append(UI.empty('✍️', 'No cards yet', 'Add a card: a question on the front and the answer on the back.'));
      else v.append(h('div', { class: 'list' }, cs.map(c => h('button', { class: 'li', onclick: () => editCard(d, c) }, h('span', { class: 'ic', style: { fontSize: '13px', fontWeight: 800 } }, ['🆕', '1', '2', '3', '4', '⭐'][c.box || 0]), h('span', { class: 't' }, h('b', null, c.front), h('small', null, c.back))))));
    }
    function editCard(d, c) {
      const f = h('textarea', { placeholder: 'Front (question)', style: { minHeight: '80px' } }), b = h('textarea', { placeholder: 'Back (answer)', style: { minHeight: '80px' } });
      f.value = c ? c.front : ''; b.value = c ? c.back : '';
      const saveIt = async (close, again) => { if (!f.value.trim() || !b.value.trim()) return UI.toast('Fill in both sides'); await DB.put('cards', Object.assign(c || { id: uid(), deck: d.id, box: 0, due: 0, created: Date.now() }, { front: f.value.trim(), back: b.value.trim() })); if (again) { f.value = b.value = ''; f.focus(); UI.toast('Added — keep going!'); } else { close(); deck(d); } };
      const s = UI.sheet({ title: c ? 'Edit card' : 'New card', body: h('div', { class: 'stack' }, f, b, c ? h('button', { class: 'btn bad sm', onclick: async () => { await DB.del('cards', c.id); s.close(); deck(d); } }, 'Delete card') : null),
        onClose: () => { if (!c) deck(d); },
        actions: c ? [{ label: 'Cancel' }, { label: 'Save', cls: 'pri', onClick: cl => saveIt(cl) }] : [{ label: 'Done' }, { label: 'Add + next', cls: 'pri', onClick: cl => saveIt(cl, true) }] });
    }
    function bulk(d) {
      const ta = h('textarea', { placeholder: 'One card per line:\ndog = perro\ncat = gato\n\n(“ - ”, “ = ”, “:” or a tab between the two sides)', style: { minHeight: '200px' } });
      UI.sheet({ title: 'Add many cards', body: ta, actions: [{ label: 'Cancel' }, { label: 'Add cards', cls: 'pri', onClick: async c => {
        let n = 0; for (const line of ta.value.split('\n')) { const m = line.match(/^(.+?)\s*(?:\t| = | - | – |: |=)\s*(.+)$/); if (!m) continue; await DB.put('cards', { id: uid(), deck: d.id, front: m[1].trim(), back: m[2].trim(), box: 0, due: 0, created: Date.now() + n }); n++; }
        UI.toast(n ? 'Added ' + n + ' cards' : 'No cards found — use “front = back”'); if (n) { c(); deck(d); }
      } }] });
    }
    function study(d, all, mode) {
      let reverse = Prefs.get('cardsRev', false);
      let queue = all.filter(Cards.due).sort((a, b) => (a.due || 0) - (b.due || 0)); let practice = false;
      if (!queue.length) { queue = shuffle(all); practice = true; }
      queue = queue.slice(0, 30); let i = 0, right = 0, wrong = 0;
      v.innerHTML = ''; ctx.setTitle(d.name); ctx.setBack(() => { deck(d); return true; });
      ctx.setActions(h('button', { class: 'btn ghost sm', onclick: () => { reverse = !reverse; Prefs.set('cardsRev', reverse); UI.toast(reverse ? 'Showing answers first' : 'Showing questions first'); show(); } }, '⇄ Flip sides'));
      const bar = h('i'), info = h('div', { class: 'small muted row' }), box = h('div');
      v.append(h('div', { class: 'prog' }, bar), info, box);
      const Q = c => reverse ? c.back : c.front, A = c => reverse ? c.front : c.back;
      function show() {
        bar.style.width = (100 * i / queue.length) + '%'; info.innerHTML = ''; info.append(h('span', { class: 'sp' }, practice ? 'Extra practice (nothing due)' : 'Card ' + Math.min(i + 1, queue.length) + ' of ' + queue.length), h('span', null, '✅ ' + right + '  ❌ ' + wrong));
        box.innerHTML = '';
        if (i >= queue.length) { Sfx.win(); box.append(UI.empty(right >= wrong ? '🎉' : '💪', right + ' right, ' + wrong + ' to practice', practice ? 'Practice makes perfect!' : 'Cards you missed will come back soon.'), h('div', { class: 'row', style: { justifyContent: 'center' } }, h('button', { class: 'btn', onclick: () => deck(d) }, 'Back to deck'), h('button', { class: 'btn pri', onclick: () => study(d, all, mode) }, 'Go again'))); return; }
        const c = queue[i];
        const say = h('button', { class: 'btn sm', onclick: e => { e.stopPropagation(); Speak.say(Q(c)); } }, '🔊');
        if (mode === 'flip') {
          const fl = h('div', { class: 'flip', role: 'button', 'aria-label': 'Tap to flip card', tabindex: 0 }, h('div', { class: 'in' }, h('div', { class: 'face' }, h('small', null, reverse ? 'Answer' : 'Question'), Q(c)), h('div', { class: 'face back' }, h('small', null, reverse ? 'Question' : 'Answer'), A(c))));
          const grade = h('div', { class: 'grid2', hidden: true }, h('button', { class: 'btn bad', style: { minHeight: '56px' }, onclick: () => next(c, false) }, '😕 Not yet'), h('button', { class: 'btn good', style: { minHeight: '56px' }, onclick: () => next(c, true) }, '😀 Got it'));
          const flipIt = () => { fl.classList.toggle('on'); grade.hidden = false; tapHint.hidden = true; };
          const tapHint = h('button', { class: 'btn pri wide', style: { minHeight: '56px' }, onclick: flipIt }, 'Show answer');
          fl.onclick = flipIt; fl.onkeydown = e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flipIt(); } };
          box.append(fl, tapHint, grade, h('div', { class: 'center mt' }, say));
        } else if (mode === 'quiz') {
          const opts = shuffle([A(c), ...shuffle(all.filter(x => A(x) !== A(c)).map(A)).filter((x, k, arr) => arr.indexOf(x) === k).slice(0, 3)]);
          let answered = false;
          box.append(h('div', { class: 'card center', style: { fontSize: '24px', fontWeight: 700, padding: '28px 18px', margin: '10px 0' } }, Q(c), h('div', null, say)),
            h('div', { class: 'choices' }, opts.map(o => h('button', { onclick: e => { if (answered) return; answered = true; const ok = o === A(c); e.currentTarget.classList.add(ok ? 'right' : 'wrong'); if (!ok) $$('.choices button', box).find(b => b.textContent === A(c)).classList.add('right'); ok ? Sfx.good() : Sfx.bad(); setTimeout(() => next(c, ok), ok ? 600 : 1500); } }, o))));
        } else {
          const inp = h('input', { type: 'text', placeholder: 'Type the answer', autocapitalize: 'off', autocomplete: 'off', spellcheck: 'false', enterkeyhint: 'go' }), fb = h('div', { class: 'mt', style: { minHeight: '60px' } });
          let answered = false;
          const check = () => { if (answered) { next(c, okNow); return; } answered = true; okNow = Cards.close(inp.value, A(c)); okNow ? Sfx.good() : Sfx.bad(); fb.innerHTML = ''; fb.append(h('div', { class: okNow ? 'pill good' : 'pill bad', style: { fontSize: '15px' } }, okNow ? '✓ Correct!' : '✗ The answer is: ' + A(c))); go.textContent = 'Next ▶'; };
          let okNow = false;
          const go = h('button', { class: 'btn pri', onclick: check }, 'Check');
          inp.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
          box.append(h('div', { class: 'card center', style: { fontSize: '24px', fontWeight: 700, padding: '28px 18px', margin: '10px 0' } }, Q(c), h('div', null, say)), h('div', { class: 'row nw' }, inp, go), fb);
          setTimeout(() => inp.focus(), 60);
        }
      }
      async function next(c, ok) { if (ok) right++; else { wrong++; if (queue.filter(x => x === c).length < 2) queue.push(c); } if (!practice || !ok) await Cards.grade(c, ok); i++; show(); }
      show();
    }
    home();
  },
});

/* ---- 33-games.js ---- */
/* ===== Fun games: Meteor Dash, Memory Match, Tic-Tac-Toe, Sudoku, Word Scramble, Slide Puzzle ===== */
addCSS(`
.gcard{display:flex;gap:12px;align-items:center;border:0;border-radius:18px;padding:14px;color:#fff;text-align:left;min-height:84px;box-shadow:var(--shadow);width:100%}
.gcard .e{font-size:38px;line-height:1}
.gcard b{font-size:18px;display:block}
.gcard small{opacity:.9;font-size:13px}
.arena{position:relative;border-radius:18px;overflow:hidden;background:#070A18;touch-action:none;user-select:none;-webkit-user-select:none}
.arena canvas{display:block;width:100%;height:min(68vh,620px);height:min(68dvh,620px)}
.arena .over{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:#fff;text-align:center;background:rgba(5,8,20,.55);padding:20px}
.arena .over h2{font-size:30px}
.mm{display:grid;gap:8px;max-width:520px;margin:0 auto}
.mm button{aspect-ratio:3/4;border:0;border-radius:14px;font-size:clamp(26px,8vw,44px);background:linear-gradient(135deg,#6C63FF,#3F37C9);color:transparent;transition:transform .25s,background .25s;box-shadow:var(--shadow)}
.mm button.up,.mm button.done{background:var(--surface);color:inherit;transform:rotateY(180deg) scaleX(-1)}
.mm button.done{opacity:.55}
.ttt{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:360px;margin:12px auto}
.ttt button{aspect-ratio:1/1;border:0;border-radius:18px;background:var(--surface);font-size:56px;font-weight:800;box-shadow:var(--shadow);font-family:var(--round)}
.ttt button.x{color:#FF4D6D}.ttt button.o{color:#3A86FF}
.ttt button.win{background:var(--good-soft)}
.sud{display:grid;grid-template-columns:repeat(9,minmax(0,1fr));max-width:460px;margin:8px auto;border:2px solid var(--ink);border-radius:8px;overflow:hidden;background:var(--line)}
.sud button{aspect-ratio:1/1;border:0;border-right:1px solid var(--line);border-bottom:1px solid var(--line);background:var(--surface);font-size:clamp(16px,5vw,24px);font-weight:600;padding:0;min-width:0;position:relative;color:var(--accent)}
.sud button.g{color:var(--ink);font-weight:800}
.sud button.c3{border-right:2px solid var(--ink)}.sud button.r3{border-bottom:2px solid var(--ink)}
.sud button.hl{background:var(--surface2)}.sud button.same{background:var(--accent-soft)}
.sud button.sel{background:#BBD3FF;color:#111}
.sud button.bad{color:var(--bad)!important;background:var(--bad-soft)}
.sud .nt{position:absolute;inset:1px;display:grid;grid-template-columns:repeat(3,1fr);font-size:clamp(7px,2vw,10px);color:var(--muted);font-weight:600;line-height:1}
.numpad{display:grid;grid-template-columns:repeat(9,minmax(0,1fr));gap:4px;max-width:460px;margin:8px auto}
.numpad button{border:1px solid var(--line);background:var(--surface);border-radius:10px;font-size:22px;font-weight:700;min-height:48px;padding:0}
.ltiles{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;min-height:58px}
.ltile{width:48px;height:54px;border:0;border-radius:12px;background:linear-gradient(#FFE08A,#F5B83D);color:#5A3A00;font-size:26px;font-weight:800;box-shadow:0 3px 0 #C98A12;font-family:var(--round);text-transform:uppercase}
.ltile.used{visibility:hidden}
.ltile.ans{background:linear-gradient(#C9C4FF,#9D96FF);color:#1E1660;box-shadow:0 3px 0 #6C63FF}
.slide{display:grid;gap:6px;max-width:380px;margin:12px auto;touch-action:manipulation}
.slide button{aspect-ratio:1/1;border:0;border-radius:14px;font-size:clamp(22px,7vw,36px);font-weight:800;background:linear-gradient(135deg,#43AA8B,#2A9D8F);color:#fff;box-shadow:0 3px 0 #1E7466;font-family:var(--round)}
.slide button.blank{visibility:hidden}
`);
const EXTRA_GAMES = {};
const MY_GAMES = [
  ['🏟️', 'Nova Arcade (all your games + friends)', 'Your game hub', 'https://claude.ai/artifact/GzogvAQESpamhyH1a6uWUE'],
  ['🦸', 'Capeborn', '3D superhero · offline app', 'https://szeszeming2-lgtm.github.io/capeborn/', 1],
  ['🏝️', 'Hollowsky', '3D adventure · offline app', 'https://szeszeming2-lgtm.github.io/hollowsky/', 1],
  ['⚔️', 'Anime Legends: Islands', 'Open world', 'https://szeszeming2-lgtm.github.io/anime-legends-arena/', 1],
  ['🟢', 'Slimeborn', '3D RPG', 'https://claude.ai/artifact/H5aqkxbP2AbCJjSX8nLKQ7'],
  ['👑', 'Misfit Sovereign', '3D RPG · 2 players', 'https://claude.ai/artifact/Fm2VkxhWFvH1q7ZrsE48Am'],
  ['🏮', 'Lanternbound', 'Adventure RPG', 'https://claude.ai/artifact/HVJfmd44xXB7TX77Swn8Tr'],
  ['💥', 'Hero Surge', '3D action', 'https://claude.ai/artifact/5e8RkbEBwa6H45uj1BrpeG'],
  ['🎨', 'Creative Whatever You Want', 'Sandbox', 'https://claude.ai/artifact/KLpN2jFRgPdbTK6gVsPQCB'],
  ['🧸', 'Chibi Studio', 'Character creator', 'https://claude.ai/artifact/8dH3QufDgvUn8V4U7FSgMq'],
  ['🗡️', 'Say & Slay', 'Word RPG', 'https://claude.ai/artifact/Dw71tjHt7gtYaczjvXWKrW'],
  ['🔮', 'Star Orb Saga', '3D action', 'https://claude.ai/artifact/8n7DkyxKjGxVVRX86XqqEP'],
  ['🌙', 'Hollow Moon', '3D action', 'https://claude.ai/artifact/KFfwNheQQ56X1DDLeiWgD4'],
  ['🚗', 'Roadster Over Manhattan', 'Flying car', 'https://claude.ai/artifact/AkX8iiaxTumZQFtkdYM6z8'],
  ['🗡', 'Shadow Monarch Ascent', '3D action', 'https://claude.ai/artifact/7m593d8nggE5GJrHikhdFv'],
  ['🧊', 'Quarter Turn', 'Rubik’s cube puzzle', 'https://claude.ai/artifact/YaVWbAdbYcNL1WwWNK6ikH'],
  ['🦸‍♂️', 'Capeborn (Claude link)', '3D superhero', 'https://claude.ai/artifact/UpbieWc5vi9o7n4VdLHvi3'],
  ['🏝', 'Hollowsky (Claude link, co-op)', '3D adventure · play with friends', 'https://claude.ai/artifact/YZkGzjrrr1XRucVDZMhx3D'],
];
function GameBest(k, val, lower) { const all = Prefs.get('gameBest', {}); if (val == null) return all[k]; if (all[k] == null || (lower ? val < all[k] : val > all[k])) { all[k] = val; Prefs.set('gameBest', all); return true; } return false; }
const GAMES = [
  ['meteor', '☄️', 'Meteor Dash', 'Dodge space rocks, grab stars', 'linear-gradient(135deg,#3A1C71,#D76D77)'],
  ['memory', '🃏', 'Memory Match', 'Find all the pairs', 'linear-gradient(135deg,#6C63FF,#3F37C9)'],
  ['ttt', '❌', 'Tic-Tac-Toe', 'Beat the bot or a friend', 'linear-gradient(135deg,#FF4D6D,#3A86FF)'],
  ['sudoku', '🔢', 'Sudoku', 'Fill the grid with 1–9', 'linear-gradient(135deg,#118AB2,#073B4C)'],
  ['words', '🔤', 'Word Scramble', 'Unscramble the letters', 'linear-gradient(135deg,#F8961E,#F3722C)'],
  ['slide', '🧩', 'Slide Puzzle', 'Put the numbers in order', 'linear-gradient(135deg,#43AA8B,#2A9D8F)'],
];
const WORDLIST = 'apple,beach,brave,bread,bunny,candy,chair,cloud,dance,dream,eagle,earth,flame,frost,ghost,giant,grape,happy,heart,horse,house,juice,jelly,kitten,laugh,lemon,light,magic,maple,money,moon,music,night,ocean,panda,party,pizza,plant,queen,quiet,rainbow,river,robot,rocket,shark,sheep,smile,snake,space,spoon,storm,sugar,sunny,table,tiger,toast,train,tulip,unicorn,water,whale,winter,zebra,pencil,garden,planet,castle,dragon,forest,island,jungle,monkey,orange,parrot,pirate,puzzle,rabbit,school,silver,soccer,spider,summer,turtle,violin,window,yellow,banana,bubble,cookie,dinosaur,elephant,football,hamburger,kangaroo,keyboard,mountain,penguin,popcorn,sandwich,scissors,skeleton,snowman,squirrel,strawberry,sunflower,telescope,tomato,treasure,umbrella,volcano,waterfall,airplane,backpack,blanket,butterfly,camera,cheese,chicken,crayon,diamond,doctor,donut,feather,firefly,flower,guitar,hammer,helmet,honey,jacket,ladder,lizard,marble,mirror,muffin,octopus,pillow,pumpkin,rocket,saddle,shadow,thunder,tornado,trumpet,wizard';
Apps.reg({
  id: 'games', name: 'Games', icon: '🎮', color: 'linear-gradient(135deg,#00C9FF,#5B2EFF)', group: 'play', keys: 'play fun arcade puzzle sudoku memory', blurb: 'Six quick fun games',
  mount(v, ctx) {
    let cleanup = null;
    const best = GameBest;
    function home() {
      if (cleanup) { cleanup(); cleanup = null; } v.innerHTML = ''; ctx.setTitle('Games'); ctx.setBack(null); ctx.setActions();
      v.append(h('div', { class: 'stack' }, GAMES.map(([id, e, n, d, c]) => h('button', { class: 'gcard', style: { background: c }, onclick: () => open(id, n) }, h('span', { class: 'e' }, e), h('span', null, h('b', null, n), h('small', null, d + (best(id) != null ? ' · Best: ' + (id === 'sudoku' || id === 'memory' || id === 'slide' ? fmtDur(best(id)) : best(id)) : '')))))),
        h('div', { class: 'sec' }, '🕹️ All your games (' + MY_GAMES.length + ')'), h('p', { class: 'tiny muted', style: { margin: '0 4px 8px' } }, 'Your own big games. They open in Safari. ⚡ = works offline after the first visit; the others open on claude.ai.'),
        h('div', { class: 'list' }, MY_GAMES.map(([e, n, g, u, off]) => h('button', { class: 'li', onclick: () => window.open(u, '_blank', 'noopener') }, h('span', { class: 'ic' }, e), h('span', { class: 't' }, h('b', null, n + (off ? ' ⚡' : '')), h('small', null, g)), h('span', { class: 'chev' }, '↗')))));
    }
    function open(id, name) {
      if (cleanup) cleanup(); v.innerHTML = ''; ctx.setTitle(name); ctx.setBack(() => { home(); return true; }); ctx.setActions();
      cleanup = (({ meteor, memory, ttt, sudoku, words, slide })[id] || EXTRA_GAMES[id])(v) || null;
    }
    /* ---------- Meteor Dash ---------- */
    function meteor(el) {
      const cv = h('canvas'), over = h('div', { class: 'over' }), arena = h('div', { class: 'arena' }, cv, over); el.append(arena, h('p', { class: 'tiny muted center mt' }, 'Slide your finger (or use ← →) to steer. Stars give points. Three hits and it’s over.'));
      const g = cv.getContext('2d'); let W, H, dpr, ship, rocks, stars, parts, bg, score, lives, t, run = false, raf, last, inv, keys = {}, target = null, spawnR = 0, spawnS = 0;
      const size = () => { const r = cv.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); };
      const reset = () => { size(); ship = { x: W / 2, y: H - 70, r: 18 }; rocks = []; stars = []; parts = []; score = 0; lives = 3; t = 0; inv = 0; bg = Array.from({ length: 70 }, () => ({ x: Math.random() * W, y: Math.random() * H, s: Math.random() * 1.6 + .3 })); };
      const menu = (title, sub) => { over.hidden = false; over.innerHTML = ''; over.append(h('h2', null, title), sub ? h('p', null, sub) : null, h('button', { class: 'btn pri', onclick: start }, run ? 'Play' : '▶ Play'), best('meteor') != null ? h('small', null, 'Best: ' + best('meteor')) : null); };
      const start = () => { reset(); over.hidden = true; run = true; last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); };
      const boom = (x, y, c, n = 18) => { for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, s = Math.random() * 220 + 40; parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, l: .7, c }); } };
      function loop(now) {
        const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt; if (!run) return;
        const diff = 1 + t / 25;
        if (keys.ArrowLeft) ship.x -= 420 * dt; if (keys.ArrowRight) ship.x += 420 * dt;
        if (target != null) ship.x += (target - ship.x) * Math.min(1, dt * 14);
        ship.x = clamp(ship.x, 20, W - 20);
        spawnR -= dt; if (spawnR <= 0) { spawnR = Math.max(0.18, 0.9 / diff); const r = 12 + Math.random() * 26; rocks.push({ x: Math.random() * W, y: -r, r, vy: (90 + Math.random() * 90) * diff, vx: (Math.random() - .5) * 60, a: 0, va: (Math.random() - .5) * 3, pts: Array.from({ length: 9 }, () => 0.75 + Math.random() * 0.35) }); }
        spawnS -= dt; if (spawnS <= 0) { spawnS = 1.6 + Math.random() * 1.6; stars.push({ x: 20 + Math.random() * (W - 40), y: -10, vy: 140 + 30 * diff }); }
        score += dt * 10 * diff; inv = Math.max(0, inv - dt);
        g.fillStyle = '#070A18'; g.fillRect(0, 0, W, H);
        for (const s of bg) { s.y += s.s * 40 * dt * diff; if (s.y > H) { s.y = 0; s.x = Math.random() * W; } g.fillStyle = 'rgba(255,255,255,' + (0.3 + s.s / 3) + ')'; g.fillRect(s.x, s.y, s.s, s.s); }
        for (const r of rocks) {
          r.y += r.vy * dt; r.x += r.vx * dt; r.a += r.va * dt;
          g.save(); g.translate(r.x, r.y); g.rotate(r.a); g.beginPath(); r.pts.forEach((k, i) => { const a = i / r.pts.length * 6.283; g.lineTo(Math.cos(a) * r.r * k, Math.sin(a) * r.r * k); }); g.closePath();
          g.fillStyle = '#7A6A5C'; g.fill(); g.strokeStyle = '#B9A48E'; g.lineWidth = 2; g.stroke(); g.restore();
          if (inv <= 0 && Math.hypot(r.x - ship.x, r.y - ship.y) < r.r * 0.85 + ship.r * 0.7) { lives--; inv = 1.6; boom(ship.x, ship.y, '#FF6B6B', 26); r.y = H + 99; Sfx.bad(); try { navigator.vibrate && navigator.vibrate(120); } catch (e) { } if (lives <= 0) return end(); }
        }
        rocks = rocks.filter(r => r.y < H + 60);
        for (const s of stars) {
          s.y += s.vy * dt; g.save(); g.translate(s.x, s.y); g.rotate(t * 2); g.beginPath(); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? 5 : 12; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath(); g.fillStyle = '#FFD84D'; g.shadowColor = '#FFD84D'; g.shadowBlur = 12; g.fill(); g.restore();
          if (Math.hypot(s.x - ship.x, s.y - ship.y) < 28) { s.y = H + 99; score += 25; boom(s.x, s.y, '#FFD84D', 12); Sfx.good(); }
        }
        stars = stars.filter(s => s.y < H + 20);
        for (const p of parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.l -= dt; g.globalAlpha = Math.max(0, p.l / .7); g.fillStyle = p.c; g.fillRect(p.x, p.y, 3, 3); } g.globalAlpha = 1; parts = parts.filter(p => p.l > 0);
        if (!(inv > 0 && Math.floor(t * 10) % 2)) {
          g.save(); g.translate(ship.x, ship.y);
          g.fillStyle = 'rgba(255,140,40,' + (0.6 + Math.random() * .4) + ')'; g.beginPath(); g.moveTo(-7, 14); g.lineTo(0, 26 + Math.random() * 10); g.lineTo(7, 14); g.fill();
          g.beginPath(); g.moveTo(0, -22); g.lineTo(16, 16); g.lineTo(0, 9); g.lineTo(-16, 16); g.closePath(); const sg = g.createLinearGradient(0, -22, 0, 16); sg.addColorStop(0, '#E0F2FF'); sg.addColorStop(1, '#4C8DFF'); g.fillStyle = sg; g.fill();
          g.fillStyle = '#1C2B5A'; g.beginPath(); g.ellipse(0, -4, 4, 7, 0, 0, 6.283); g.fill(); g.restore();
        }
        g.fillStyle = '#fff'; g.font = '700 20px ' + getComputedStyle(document.body).fontFamily; g.fillText('⭐ ' + Math.floor(score), 14, 30); g.textAlign = 'right'; g.fillText('❤️'.repeat(Math.max(0, lives)), W - 14, 30); g.textAlign = 'left';
        raf = requestAnimationFrame(loop);
      }
      function end() { run = false; const s = Math.floor(score); const nb = best('meteor', s); if (nb) Sfx.win(); menu(nb ? '🏆 New best: ' + s : 'Score: ' + s, 'You survived ' + Math.floor(t) + ' seconds.'); }
      const pdown = e => { const r = cv.getBoundingClientRect(); target = e.clientX - r.left; };
      cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); pdown(e); }); cv.addEventListener('pointermove', e => { if (e.buttons || e.pointerType === 'touch') pdown(e); }); cv.addEventListener('pointerup', () => target = null);
      const kd = e => { keys[e.key] = e.type === 'keydown'; if (e.key.startsWith('Arrow')) { e.preventDefault(); target = null; } };
      addEventListener('keydown', kd); addEventListener('keyup', kd);
      const vis = () => { if (document.hidden && run) { run = false; menu('Paused'); } };
      document.addEventListener('visibilitychange', vis);
      requestAnimationFrame(() => { reset(); g.fillStyle = '#070A18'; g.fillRect(0, 0, W, H); menu('☄️ Meteor Dash', 'Dodge the rocks, catch the stars!'); });
      return () => { run = false; cancelAnimationFrame(raf); removeEventListener('keydown', kd); removeEventListener('keyup', kd); document.removeEventListener('visibilitychange', vis); };
    }
    /* ---------- Memory Match ---------- */
    function memory(el) {
      const SETS = '🐶🐱🦊🐼🐸🦄🐙🦋🐢🦁🐧🐝🍕🍩🍓🚀⚽🎸🌈⭐🎈🍉🌵🐳'.match(/\p{Extended_Pictographic}/gu);
      let size = Prefs.get('memSize', 8), cards, up = [], moves = 0, found = 0, t0 = 0, timer = null, lock = false;
      const grid = h('div', { class: 'mm' }), info = h('div', { class: 'row mb' });
      el.append(UI.seg([[6, 'Easy'], [8, 'Medium'], [12, 'Hard']], size, s => { size = s; Prefs.set('memSize', s); deal(); }), h('div', { class: 'mt' }, info), grid);
      const paint = () => { info.innerHTML = ''; info.append(h('span', { class: 'pill' }, '🔁 ' + moves + ' moves'), h('span', { class: 'pill' }, '⏱️ ' + fmtDur(t0 ? (Date.now() - t0) / 1000 : 0)), h('span', { class: 'sp' }), best('memory' + size) != null ? h('span', { class: 'small muted' }, 'Best ' + fmtDur(best('memory' + size))) : null); };
      function deal() {
        clearInterval(timer); t0 = 0; moves = 0; found = 0; up = []; lock = false;
        cards = shuffle(shuffle(SETS).slice(0, size).flatMap(e => [e, e])); grid.style.gridTemplateColumns = 'repeat(' + (size === 6 ? 4 : size === 8 ? 4 : 6) + ',minmax(0,1fr))';
        grid.innerHTML = ''; cards.forEach((e, i) => grid.append(h('button', { 'aria-label': 'Card ' + (i + 1), onclick: ev => flip(i, ev.currentTarget) }, e))); paint();
      }
      function flip(i, b) {
        if (lock || b.classList.contains('up') || b.classList.contains('done')) return;
        if (!t0) { t0 = Date.now(); timer = setInterval(paint, 1000); }
        b.classList.add('up'); up.push([i, b]); Sfx.tap();
        if (up.length === 2) {
          moves++; const [[a, ba], [c, bc]] = up; up = [];
          if (cards[a] === cards[c]) { setTimeout(() => { ba.classList.add('done'); bc.classList.add('done'); }, 250); found++; Sfx.good(); if (found === size) { clearInterval(timer); const s = Math.round((Date.now() - t0) / 1000); const nb = best('memory' + size, s, true); best('memory', s, true); setTimeout(() => { Sfx.win(); UI.toast((nb ? '🏆 New best! ' : '🎉 ') + 'All pairs in ' + moves + ' moves, ' + fmtDur(s)); }, 400); } }
          else { lock = true; setTimeout(() => { ba.classList.remove('up'); bc.classList.remove('up'); lock = false; }, 800); }
        }
        paint();
      }
      deal(); return () => clearInterval(timer);
    }
    /* ---------- Tic-Tac-Toe ---------- */
    function ttt(el) {
      let mode = Prefs.get('tttMode', 'hard'), b, turn, done, score = Prefs.get('tttScore', { x: 0, o: 0, d: 0 });
      const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
      const grid = h('div', { class: 'ttt' }), info = h('div', { class: 'center', style: { fontSize: '18px', fontWeight: 700, minHeight: '28px' } }), sc = h('div', { class: 'grid3' });
      el.append(UI.seg([['easy', '🤖 Easy'], ['hard', '🤖 Hard'], ['two', '👥 Friend']], mode, m => { mode = m; Prefs.set('tttMode', m); reset(); }), grid, info, sc, h('div', { class: 'center mt' }, h('button', { class: 'btn pri', onclick: () => reset() }, 'New round')));
      const win = bb => { for (const l of LINES) if (bb[l[0]] && bb[l[0]] === bb[l[1]] && bb[l[1]] === bb[l[2]]) return l; return null; };
      const mm = (bb, p) => { const w = win(bb); if (w) return bb[w[0]] === 'o' ? 10 : -10; if (bb.every(Boolean)) return 0; let bestS = p === 'o' ? -99 : 99; for (let i = 0; i < 9; i++) if (!bb[i]) { bb[i] = p; const s = mm(bb, p === 'o' ? 'x' : 'o'); bb[i] = ''; bestS = p === 'o' ? Math.max(bestS, s) : Math.min(bestS, s); } return bestS; };
      const bot = () => { const free = b.map((x, i) => x ? -1 : i).filter(i => i >= 0); if (mode === 'easy' && Math.random() < 0.6) return pick(free); let bi = free[0], bs = -99; for (const i of free) { b[i] = 'o'; const s = mm(b, 'x'); b[i] = ''; if (s > bs) { bs = s; bi = i; } } return bi; };
      function reset() { b = Array(9).fill(''); turn = 'x'; done = false; draw(); }
      function play(i) {
        if (done || b[i] || (mode !== 'two' && turn === 'o')) return; b[i] = turn; Sfx.tap(); turn = turn === 'x' ? 'o' : 'x'; check();
        if (!done && mode !== 'two') setTimeout(() => { b[bot()] = 'o'; turn = 'x'; check(); draw(); }, 350);
        draw();
      }
      function check() { const w = win(b); if (w) { done = w; score[b[w[0]]]++; Prefs.set('tttScore', score); (mode !== 'two' && b[w[0]] === 'o') ? Sfx.bad() : Sfx.win(); } else if (b.every(Boolean)) { done = true; score.d++; Prefs.set('tttScore', score); } }
      function draw() {
        grid.innerHTML = ''; b.forEach((x, i) => grid.append(h('button', { class: (x || '') + (Array.isArray(done) && done.includes(i) ? ' win' : ''), 'aria-label': 'Square ' + (i + 1) + (x ? ' ' + x : ''), onclick: () => play(i) }, x === 'x' ? '✕' : x === 'o' ? '◯' : '')));
        info.textContent = Array.isArray(done) ? (b[done[0]] === 'x' ? (mode === 'two' ? '✕ wins!' : '🎉 You win!') : (mode === 'two' ? '◯ wins!' : '🤖 The bot wins!')) : done ? '🤝 It’s a tie!' : (mode === 'two' ? (turn === 'x' ? '✕' : '◯') + ' to play' : turn === 'x' ? 'Your turn (✕)' : 'Bot is thinking…');
        sc.innerHTML = ''; sc.append(h('div', { class: 'stat' }, h('b', null, score.x), h('small', null, mode === 'two' ? '✕ wins' : 'You')), h('div', { class: 'stat' }, h('b', null, score.d), h('small', null, 'Ties')), h('div', { class: 'stat' }, h('b', null, score.o), h('small', null, mode === 'two' ? '◯ wins' : 'Bot')));
      }
      reset();
    }
    /* ---------- Sudoku ---------- */
    function sudoku(el) {
      const solveCount = (a, limit = 2) => { let n = 0; const rec = () => { let idx = a.indexOf(0); if (idx < 0) { n++; return n >= limit; } const r = Math.floor(idx / 9), c = idx % 9; for (const d of [1, 2, 3, 4, 5, 6, 7, 8, 9]) if (ok(a, r, c, d)) { a[idx] = d; if (rec()) { a[idx] = 0; return true; } a[idx] = 0; } return false; }; rec(); return n; };
      const ok = (a, r, c, d) => { for (let i = 0; i < 9; i++) if (a[r * 9 + i] === d || a[i * 9 + c] === d) return false; const br = r - r % 3, bc = c - c % 3; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (a[(br + i) * 9 + bc + j] === d) return false; return true; };
      const full = () => { const a = Array(81).fill(0); const rec = i => { if (i === 81) return true; const r = Math.floor(i / 9), c = i % 9; for (const d of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) if (ok(a, r, c, d)) { a[i] = d; if (rec(i + 1)) return true; a[i] = 0; } return false; }; rec(0); return a; };
      const make = holes => { const sol = full(), puz = sol.slice(); let removed = 0; for (const i of shuffle([...Array(81).keys()])) { if (removed >= holes) break; const k = puz[i]; puz[i] = 0; if (solveCount(puz.slice()) !== 1) puz[i] = k; else removed++; } return { sol, puz, cur: puz.slice(), notes: Array.from({ length: 81 }, () => []), level: holes, t: 0, mistakes: 0 }; };
      let G = Prefs.get('sudoku', null), sel = -1, notesMode = false, timer = null;
      const grid = h('div', { class: 'sud', role: 'grid' }), pad = h('div', { class: 'numpad' }), info = h('div', { class: 'row' });
      const noteB = h('button', { class: 'btn sm', onclick: () => { notesMode = !notesMode; noteB.classList.toggle('pri', notesMode); } }, '✏️ Notes');
      el.append(info, grid, pad, h('div', { class: 'row', style: { justifyContent: 'center' } }, noteB, h('button', { class: 'btn sm', onclick: () => input(0) }, '⌫ Erase'), h('button', { class: 'btn sm', onclick: hint }, '💡 Hint'), h('button', { class: 'btn sm pri', onclick: newGame }, 'New')));
      for (let d = 1; d <= 9; d++) pad.append(h('button', { onclick: () => input(d) }, d));
      function newGame() { UI.menu('New Sudoku', [['🙂', 'Easy', 36], ['🤔', 'Medium', 46], ['😤', 'Hard', 52]].map(([i, n, holes]) => ({ icon: i, label: n, run: () => { UI.toast('Making a puzzle…'); setTimeout(() => { G = make(holes); sel = -1; save(); draw(); start(); }, 30); } }))); }
      const save = () => Prefs.set('sudoku', G);
      const start = () => { clearInterval(timer); timer = setInterval(() => { if (!G || G.won || document.hidden) return; G.t++; if (G.t % 5 === 0) save(); paintInfo(); }, 1000); };
      const paintInfo = () => { info.innerHTML = ''; if (!G) return; info.append(h('span', { class: 'pill' }, ['', 'Easy', 'Medium', 'Hard'][G.level === 36 ? 1 : G.level === 46 ? 2 : 3]), h('span', { class: 'pill' }, '⏱️ ' + fmtDur(G.t)), h('span', { class: 'pill' + (G.mistakes ? ' bad' : '') }, '❌ ' + G.mistakes), h('span', { class: 'sp' })); };
      function input(d) {
        if (!G || G.won || sel < 0 || G.puz[sel]) return;
        if (notesMode && d) { const n = G.notes[sel]; const k = n.indexOf(d); k >= 0 ? n.splice(k, 1) : n.push(d); }
        else { G.cur[sel] = d; G.notes[sel] = []; if (d && d !== G.sol[sel]) { G.mistakes++; Sfx.bad(); } else if (d) { Sfx.tap(); const r = Math.floor(sel / 9), c = sel % 9; for (let i = 0; i < 9; i++) { G.notes[r * 9 + i] = G.notes[r * 9 + i].filter(x => x !== d); G.notes[i * 9 + c] = G.notes[i * 9 + c].filter(x => x !== d); } } }
        if (G.cur.every((x, i) => x === G.sol[i])) { G.won = true; Sfx.win(); const nb = best('sudoku', G.t, true); UI.toast((nb ? '🏆 New best! ' : '🎉 Solved! ') + fmtDur(G.t)); }
        save(); draw();
      }
      function hint() { if (!G || G.won) return; let i = sel >= 0 && !G.puz[sel] && G.cur[sel] !== G.sol[sel] ? sel : G.cur.findIndex((x, k) => x !== G.sol[k]); if (i < 0) return; sel = i; notesMode = false; noteB.classList.remove('pri'); input(G.sol[i]); }
      function draw() {
        grid.innerHTML = ''; if (!G) return; const sv = sel >= 0 ? G.cur[sel] : 0;
        for (let i = 0; i < 81; i++) {
          const r = Math.floor(i / 9), c = i % 9, val = G.cur[i];
          const rel = sel >= 0 && (Math.floor(sel / 9) === r || sel % 9 === c || (Math.floor(Math.floor(sel / 9) / 3) === Math.floor(r / 3) && Math.floor(sel % 9 / 3) === Math.floor(c / 3)));
          const cls = (G.puz[i] ? 'g' : '') + (c % 3 === 2 && c < 8 ? ' c3' : '') + (r % 3 === 2 && r < 8 ? ' r3' : '') + (i === sel ? ' sel' : sv && val === sv ? ' same' : rel ? ' hl' : '') + (val && val !== G.sol[i] ? ' bad' : '');
          grid.append(h('button', { class: cls, 'aria-label': 'Row ' + (r + 1) + ' column ' + (c + 1) + (val ? ': ' + val : ''), onclick: () => { sel = i; draw(); } }, val ? String(val) : G.notes[i].length ? h('span', { class: 'nt' }, [1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => h('span', null, G.notes[i].includes(d) ? d : ''))) : ''));
        }
        $$('button', pad).forEach((b, k) => { const cnt = G.cur.filter(x => x === k + 1).length; b.style.opacity = cnt >= 9 ? .3 : 1; });
        paintInfo();
      }
      const kd = e => { if (/^[1-9]$/.test(e.key)) input(+e.key); else if (e.key === 'Backspace' || e.key === 'Delete') input(0); else if (e.key.startsWith('Arrow') && sel >= 0) { const m = { ArrowUp: -9, ArrowDown: 9, ArrowLeft: -1, ArrowRight: 1 }[e.key]; sel = clamp(sel + m, 0, 80); draw(); } };
      addEventListener('keydown', kd);
      if (!G) { G = make(36); save(); } draw(); start();
      return () => { clearInterval(timer); removeEventListener('keydown', kd); save(); };
    }
    /* ---------- Word Scramble ---------- */
    function words(el) {
      const list = [...new Set(WORDLIST.split(','))]; let word, letters, ans, score = 0, streak = 0, hints = 0;
      const sbox = h('div', { class: 'grid3' }), clue = h('p', { class: 'center muted', style: { minHeight: '48px', margin: '10px 0' } }), ansEl = h('div', { class: 'ltiles', style: { marginBottom: '14px' } }), pool = h('div', { class: 'ltiles' });
      el.append(sbox, clue, h('div', { class: 'card' }, ansEl, pool), h('div', { class: 'row mt', style: { justifyContent: 'center' } }, h('button', { class: 'btn', onclick: () => { hints++; giveHint(); } }, '💡 Hint'), h('button', { class: 'btn', onclick: () => { ans = []; draw(); } }, '↺ Clear'), h('button', { class: 'btn', onclick: () => { streak = 0; UI.toast('It was: ' + word.toUpperCase()); next(); } }, 'Skip ▶')));
      const paintS = () => { sbox.innerHTML = ''; sbox.append(h('div', { class: 'stat' }, h('b', null, score), h('small', null, 'Score')), h('div', { class: 'stat' }, h('b', null, streak), h('small', null, 'Streak 🔥')), h('div', { class: 'stat' }, h('b', null, best('words') || 0), h('small', null, 'Best'))); };
      function next() {
        const lvl = Math.min(10, 4 + Math.floor(score / 50)); const pool2 = list.filter(w => w.length <= lvl + 1 && w.length >= Math.min(lvl - 1, 7));
        word = pick(pool2.length ? pool2 : list); do { letters = shuffle(word.split('')).map((ch, i) => ({ ch, i })); } while (letters.map(x => x.ch).join('') === word && word.length > 2);
        ans = []; hints = 0; clue.textContent = word.length + ' letters'; draw(); paintS();
        if (typeof Dict !== 'undefined') Dict.lookup(word).then(r => { if (r && r.senses && r.senses[0] && clue.textContent.endsWith('letters')) clue.textContent = '“' + r.senses[0][1].replace(new RegExp(word, 'gi'), '___') + '”'; }).catch(() => { });
      }
      function giveHint() { const k = ans.length; if (k >= word.length) return; const need = word[k]; if (ans.some((a, j) => a.ch !== word[j])) { ans = []; } const t = letters.find(l => l.ch === word[ans.length] && !ans.includes(l)); if (t) ans.push(t); draw(); check(); }
      function check() {
        if (ans.length !== word.length) return; const guess = ans.map(a => a.ch).join('');
        if (guess === word) { const pts = Math.max(2, word.length * 5 - hints * 4); score += pts; streak++; Sfx.good(); best('words', score); UI.toast('✅ ' + word.toUpperCase() + ' +' + pts); setTimeout(next, 600); }
        else { Sfx.bad(); ansEl.classList.add('flash-bad'); setTimeout(() => { ansEl.classList.remove('flash-bad'); ans = []; draw(); }, 600); streak = 0; paintS(); }
      }
      function draw() {
        ansEl.innerHTML = ''; pool.innerHTML = '';
        for (let k = 0; k < word.length; k++) { const a = ans[k]; ansEl.append(a ? h('button', { class: 'ltile ans', onclick: () => { ans.splice(k); draw(); } }, a.ch) : h('span', { class: 'ltile', style: { background: 'var(--surface2)', boxShadow: 'none', display: 'inline-block' } })); }
        for (const l of letters) pool.append(h('button', { class: 'ltile' + (ans.includes(l) ? ' used' : ''), onclick: () => { if (ans.includes(l)) return; ans.push(l); Sfx.tap(); draw(); check(); } }, l.ch));
      }
      next();
    }
    /* ---------- Slide Puzzle ---------- */
    function slide(el) {
      let n = Prefs.get('slideN', 3), tiles, moves, t0, timer;
      const grid = h('div', { class: 'slide' }), info = h('div', { class: 'row', style: { justifyContent: 'center' } });
      el.append(UI.seg([[3, '3 × 3'], [4, '4 × 4'], [5, '5 × 5']], n, x => { n = x; Prefs.set('slideN', x); deal(); }), h('div', { class: 'mt' }, info), grid, h('div', { class: 'center' }, h('button', { class: 'btn pri', onclick: () => deal() }, 'Shuffle')));
      const paint = () => { info.innerHTML = ''; info.append(h('span', { class: 'pill' }, '🔁 ' + moves), h('span', { class: 'pill' }, '⏱️ ' + fmtDur(t0 ? (Date.now() - t0) / 1000 : 0))); };
      function deal() {
        clearInterval(timer); t0 = 0; moves = 0; tiles = [...Array(n * n).keys()].map(i => (i + 1) % (n * n));
        let blank = n * n - 1, prev = -1; for (let k = 0; k < n * n * 40; k++) { const opts = nb(blank).filter(x => x !== prev); const m = pick(opts); [tiles[blank], tiles[m]] = [tiles[m], tiles[blank]]; prev = blank; blank = m; }
        grid.style.gridTemplateColumns = 'repeat(' + n + ',minmax(0,1fr))'; draw();
      }
      const nb = i => { const r = Math.floor(i / n), c = i % n, o = []; if (r > 0) o.push(i - n); if (r < n - 1) o.push(i + n); if (c > 0) o.push(i - 1); if (c < n - 1) o.push(i + 1); return o; };
      function tap(i) {
        const b = tiles.indexOf(0); if (!nb(b).includes(i)) return; if (!t0) { t0 = Date.now(); timer = setInterval(paint, 1000); }
        [tiles[b], tiles[i]] = [tiles[i], tiles[b]]; moves++; Sfx.tap(); draw();
        if (tiles.every((x, k) => x === (k + 1) % (n * n))) { clearInterval(timer); const s = Math.round((Date.now() - t0) / 1000); const nbst = best('slide' + n, s, true); best('slide', s, true); Sfx.win(); UI.toast((nbst ? '🏆 New best! ' : '🎉 Solved in ') + moves + ' moves, ' + fmtDur(s)); }
      }
      function draw() { grid.innerHTML = ''; tiles.forEach((x, i) => grid.append(h('button', { class: x ? '' : 'blank', 'aria-label': x ? 'Tile ' + x : 'Empty', onclick: () => tap(i) }, x || ''))); paint(); }
      deal(); return () => clearInterval(timer);
    }
    const g0 = ctx.param && GAMES.find(g => g[0] === ctx.param); if (g0) open(g0[0], g0[2]); else home();
    return () => { if (cleanup) cleanup(); };
  },
});

/* ---- 34-learn.js ---- */
/* ===== Learn: math practice, periodic table, solar system, world quiz, word quiz ===== */
addCSS(`
.ptable{display:grid;grid-template-columns:repeat(18,minmax(30px,1fr));gap:2px;overflow-x:auto;padding-bottom:6px;min-width:0}
.ptable-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:0 -4px;padding:0 4px}
.ptable-wrap .ptable{min-width:640px}
.el{aspect-ratio:1/1.15;border:0;border-radius:5px;padding:2px;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1;color:#111;min-width:0}
.el b{font-size:14px}
.el small{font-size:8px;opacity:.7}
.el.dim{opacity:.25}
.qbig{font-size:44px;font-weight:800;text-align:center;font-family:var(--round);padding:14px 0 6px;font-variant-numeric:tabular-nums}
.ansbox{font-size:34px;font-weight:800;text-align:center;min-height:56px;border-radius:14px;background:var(--surface2);padding:6px;font-family:var(--round);margin-bottom:10px}
.orbit canvas{width:100%;height:340px;display:block;border-radius:18px;background:radial-gradient(circle at 50% 50%,#1B1F3B,#05060D)}
`);
const ELEMENTS = 'H,Hydrogen,1.008,nm|He,Helium,4.0026,ng|Li,Lithium,6.94,am|Be,Beryllium,9.0122,ae|B,Boron,10.81,md|C,Carbon,12.011,nm|N,Nitrogen,14.007,nm|O,Oxygen,15.999,nm|F,Fluorine,18.998,hg|Ne,Neon,20.180,ng|Na,Sodium,22.990,am|Mg,Magnesium,24.305,ae|Al,Aluminium,26.982,pt|Si,Silicon,28.085,md|P,Phosphorus,30.974,nm|S,Sulfur,32.06,nm|Cl,Chlorine,35.45,hg|Ar,Argon,39.948,ng|K,Potassium,39.098,am|Ca,Calcium,40.078,ae|Sc,Scandium,44.956,tm|Ti,Titanium,47.867,tm|V,Vanadium,50.942,tm|Cr,Chromium,51.996,tm|Mn,Manganese,54.938,tm|Fe,Iron,55.845,tm|Co,Cobalt,58.933,tm|Ni,Nickel,58.693,tm|Cu,Copper,63.546,tm|Zn,Zinc,65.38,tm|Ga,Gallium,69.723,pt|Ge,Germanium,72.630,md|As,Arsenic,74.922,md|Se,Selenium,78.971,nm|Br,Bromine,79.904,hg|Kr,Krypton,83.798,ng|Rb,Rubidium,85.468,am|Sr,Strontium,87.62,ae|Y,Yttrium,88.906,tm|Zr,Zirconium,91.224,tm|Nb,Niobium,92.906,tm|Mo,Molybdenum,95.95,tm|Tc,Technetium,98,tm|Ru,Ruthenium,101.07,tm|Rh,Rhodium,102.91,tm|Pd,Palladium,106.42,tm|Ag,Silver,107.87,tm|Cd,Cadmium,112.41,tm|In,Indium,114.82,pt|Sn,Tin,118.71,pt|Sb,Antimony,121.76,md|Te,Tellurium,127.60,md|I,Iodine,126.90,hg|Xe,Xenon,131.29,ng|Cs,Caesium,132.91,am|Ba,Barium,137.33,ae|La,Lanthanum,138.91,ln|Ce,Cerium,140.12,ln|Pr,Praseodymium,140.91,ln|Nd,Neodymium,144.24,ln|Pm,Promethium,145,ln|Sm,Samarium,150.36,ln|Eu,Europium,151.96,ln|Gd,Gadolinium,157.25,ln|Tb,Terbium,158.93,ln|Dy,Dysprosium,162.50,ln|Ho,Holmium,164.93,ln|Er,Erbium,167.26,ln|Tm,Thulium,168.93,ln|Yb,Ytterbium,173.05,ln|Lu,Lutetium,174.97,ln|Hf,Hafnium,178.49,tm|Ta,Tantalum,180.95,tm|W,Tungsten,183.84,tm|Re,Rhenium,186.21,tm|Os,Osmium,190.23,tm|Ir,Iridium,192.22,tm|Pt,Platinum,195.08,tm|Au,Gold,196.97,tm|Hg,Mercury,200.59,tm|Tl,Thallium,204.38,pt|Pb,Lead,207.2,pt|Bi,Bismuth,208.98,pt|Po,Polonium,209,pt|At,Astatine,210,hg|Rn,Radon,222,ng|Fr,Francium,223,am|Ra,Radium,226,ae|Ac,Actinium,227,ac|Th,Thorium,232.04,ac|Pa,Protactinium,231.04,ac|U,Uranium,238.03,ac|Np,Neptunium,237,ac|Pu,Plutonium,244,ac|Am,Americium,243,ac|Cm,Curium,247,ac|Bk,Berkelium,247,ac|Cf,Californium,251,ac|Es,Einsteinium,252,ac|Fm,Fermium,257,ac|Md,Mendelevium,258,ac|No,Nobelium,259,ac|Lr,Lawrencium,266,ac|Rf,Rutherfordium,267,tm|Db,Dubnium,268,tm|Sg,Seaborgium,269,tm|Bh,Bohrium,270,tm|Hs,Hassium,269,tm|Mt,Meitnerium,278,tm|Ds,Darmstadtium,281,tm|Rg,Roentgenium,282,tm|Cn,Copernicium,285,tm|Nh,Nihonium,286,pt|Fl,Flerovium,289,pt|Mc,Moscovium,290,pt|Lv,Livermorium,293,pt|Ts,Tennessine,294,hg|Og,Oganesson,294,ng'.split('|').map((s, i) => { const [sym, name, mass, cat] = s.split(','); return { n: i + 1, sym, name, mass: +mass, cat }; });
const EL_CATS = { am: ['Alkali metal', '#FF9F9F'], ae: ['Alkaline earth metal', '#FFD08A'], tm: ['Transition metal', '#F5C6E8'], pt: ['Post-transition metal', '#C8D6E5'], md: ['Metalloid', '#C7E9B0'], nm: ['Nonmetal', '#A0E7E5'], hg: ['Halogen', '#FFF59D'], ng: ['Noble gas', '#C3B1E1'], ln: ['Lanthanide', '#FFCBA4'], ac: ['Actinide', '#F4A3A8'] };
const EL_FACTS = { H: 'The lightest element. Stars like the Sun burn it to shine.', He: 'Makes balloons float and your voice squeaky.', Li: 'Used in rechargeable phone batteries.', C: 'Diamonds and pencil “lead” are both pure carbon. All living things contain it.', N: 'About 78% of the air you breathe.', O: 'You need it to live. About 21% of the air.', F: 'Helps protect teeth — it’s in toothpaste.', Ne: 'Glows bright red-orange in neon signs.', Na: 'Half of table salt (sodium chloride).', Mg: 'Burns with a dazzling white flash in fireworks.', Al: 'Light metal used for cans and planes.', Si: 'Computer chips are made from it. Sand is mostly silicon and oxygen.', S: 'Its compounds smell like rotten eggs.', Cl: 'Keeps swimming pools clean.', K: 'Bananas are full of it.', Ca: 'Makes your bones and teeth strong.', Ti: 'Strong and light — used in jets and bike frames.', Fe: 'Steel is mostly iron. It also carries oxygen in your blood.', Ni: 'Used in coins and magnets.', Cu: 'Carries electricity in wires. The Statue of Liberty is copper.', Zn: 'Protects steel from rust.', Ag: 'The best conductor of electricity of all metals.', Sn: 'Used to coat “tin” cans.', I: 'Your body needs a little; it’s added to salt.', W: 'Has the highest melting point of any metal.', Pt: 'Rare and precious — used in jewelry and car exhausts.', Au: 'Gold never rusts, so ancient gold still shines.', Hg: 'The only metal that is liquid at room temperature.', Pb: 'Very heavy and soft. Once used in pipes and paint.', U: 'Powers nuclear power plants.', Pu: 'Powers some space probes far from the Sun.', Og: 'The heaviest element ever made.' };
const PLANETS = [
  { n: 'Sun', e: '☀️', c: '#FFC93C', r: 22, a: 0, info: [['Type', 'Star'], ['Width', '1,392,700 km'], ['Surface', 'about 5,500 °C'], ['Age', '4.6 billion years']], fact: 'The Sun holds 99.8% of all the mass in the solar system.' },
  { n: 'Mercury', e: '🪨', c: '#B5B5B5', r: 3, a: 1, d: '58 million km', info: [['Width', '4,879 km'], ['Day', '176 Earth days (sunrise to sunrise)'], ['Year', '88 days'], ['Moons', '0'], ['Temperature', '−180 to 430 °C']], fact: 'The smallest planet and the closest to the Sun.' },
  { n: 'Venus', e: '🌕', c: '#E8C27A', r: 5, a: 1.5, d: '108 million km', info: [['Width', '12,104 km'], ['Day', '243 Earth days — it spins backwards!'], ['Year', '225 days'], ['Moons', '0'], ['Temperature', 'about 465 °C']], fact: 'The hottest planet, because thick clouds trap the heat.' },
  { n: 'Earth', e: '🌍', c: '#4C9BE8', r: 5, a: 2, d: '150 million km', info: [['Width', '12,742 km'], ['Day', '24 hours'], ['Year', '365¼ days'], ['Moons', '1'], ['Temperature', 'about 15 °C on average']], fact: 'The only planet we know with life — and liquid water on its surface.' },
  { n: 'Mars', e: '🔴', c: '#D2603A', r: 4, a: 2.5, d: '228 million km', info: [['Width', '6,779 km'], ['Day', '24 h 37 min'], ['Year', '687 days'], ['Moons', '2 (Phobos, Deimos)'], ['Temperature', 'about −65 °C']], fact: 'Home of Olympus Mons, the tallest volcano in the solar system.' },
  { n: 'Jupiter', e: '🟠', c: '#D9A066', r: 12, a: 3.4, d: '778 million km', info: [['Width', '139,820 km'], ['Day', '10 hours'], ['Year', '12 Earth years'], ['Moons', '90+'], ['Made of', 'Mostly gas']], fact: 'The biggest planet. Its Great Red Spot is a storm bigger than Earth.' },
  { n: 'Saturn', e: '🪐', c: '#E3C77E', r: 10, a: 4.3, ring: true, d: '1.4 billion km', info: [['Width', '116,460 km'], ['Day', '10.7 hours'], ['Year', '29 Earth years'], ['Moons', '140+'], ['Rings', 'Ice and rock']], fact: 'Saturn is so light it would float in a giant bathtub.' },
  { n: 'Uranus', e: '🔵', c: '#8FD8E0', r: 7, a: 5.1, d: '2.9 billion km', info: [['Width', '50,724 km'], ['Day', '17 hours'], ['Year', '84 Earth years'], ['Moons', '28'], ['Temperature', 'about −195 °C']], fact: 'It spins on its side, like a rolling ball.' },
  { n: 'Neptune', e: '🔷', c: '#4166F5', r: 7, a: 5.8, d: '4.5 billion km', info: [['Width', '49,244 km'], ['Day', '16 hours'], ['Year', '165 Earth years'], ['Moons', '16'], ['Wind', 'Up to 2,100 km/h']], fact: 'The windiest planet. It was found using math before anyone saw it.' },
];
Apps.reg({
  id: 'learn', name: 'Learn', icon: '🎓', color: 'linear-gradient(135deg,#11998E,#38EF7D)', group: 'learn', keys: 'education school math science planets periodic table geography quiz', blurb: 'Math, science and the world',
  mount(v, ctx) {
    let cleanup = null;
    const best = (k, val) => { const all = Prefs.get('learnBest', {}); if (val == null) return all[k] || 0; if (val > (all[k] || 0)) { all[k] = val; Prefs.set('learnBest', all); return true; } return false; };
    function home() {
      if (cleanup) { cleanup(); cleanup = null; } v.innerHTML = ''; ctx.setTitle('Learn'); ctx.setBack(null); ctx.setActions();
      const T = [['math', '➗', 'Math practice', 'Add, subtract, times, divide'], ['times', '✖️', 'Times tables', 'Master 1 to 12'], ['ptable', '⚗️', 'Periodic table', 'All 118 elements'], ['space', '🪐', 'Solar system', 'Planets and the Sun'], ['world', '🌎', 'World quiz', 'Capitals, flags, countries'], ['wordq', '📚', 'Word quiz', 'What does it mean?']];
      v.append(h('div', { class: 'grid2 w' }, T.map(([id, e, n, d]) => h('button', { class: 'bigbtn', onclick: () => open(id, n) }, h('span', { class: 'e' }, e), h('b', null, n), h('small', null, d)))));
    }
    function open(id, n) { if (cleanup) cleanup(); v.innerHTML = ''; ctx.setTitle(n); ctx.setBack(() => { home(); return true; }); cleanup = ({ math, times, ptable, space, world, wordq })[id](v) || null; }
    /* ---------- math ---------- */
    function drill(el, { title, gen, key }) {
      let q, input = '', n = 0, right = 0, streak = 0, t0 = Date.now(); const N = 10;
      const prog = h('i'), qEl = h('div', { class: 'qbig' }), aEl = h('div', { class: 'ansbox' }), info = h('div', { class: 'row small muted' });
      const pad = h('div', { class: 'keypad' }, [1, 2, 3, 4, 5, 6, 7, 8, 9, '−', 0, '⌫'].map(k => h('button', { onclick: () => press(String(k)) }, k)), h('button', { class: 'btn pri', style: { gridColumn: 'span 3', fontSize: '20px' }, onclick: () => press('ok') }, 'Check ✓'));
      el.append(h('div', { class: 'prog' }, prog), info, qEl, aEl, pad);
      const nextQ = () => { q = gen(); input = ''; paint(); };
      const paint = () => { prog.style.width = (100 * n / N) + '%'; qEl.textContent = q.text + ' = ?'; aEl.textContent = input || ' '; info.innerHTML = ''; info.append(h('span', { class: 'sp' }, 'Question ' + Math.min(n + 1, N) + ' of ' + N), h('span', null, '✅ ' + right + '  🔥 ' + streak)); };
      function press(k) {
        if (n >= N) return;
        if (k === '⌫') input = input.slice(0, -1); else if (k === '−') input = input.startsWith('-') ? input.slice(1) : '-' + input; else if (k === 'ok') { if (!input || input === '-') return; const ok = +input === q.a; n++; if (ok) { right++; streak++; Sfx.good(); aEl.classList.add('flash-good'); } else { streak = 0; Sfx.bad(); UI.toast(q.text + ' = ' + q.a); aEl.classList.add('flash-bad'); } setTimeout(() => aEl.classList.remove('flash-good', 'flash-bad'), 500); if (n >= N) return finish(); nextQ(); return; } else if (input.replace('-', '').length < 6) input += k;
        paint();
      }
      function finish() {
        prog.style.width = '100%'; const secs = Math.round((Date.now() - t0) / 1000), stars = right >= 10 ? 3 : right >= 8 ? 2 : right >= 5 ? 1 : 0; const nb = best(key, right * 1000 - secs);
        if (stars >= 2) Sfx.win(); el.innerHTML = '';
        el.append(UI.empty('⭐'.repeat(stars) || '💪', right + ' out of ' + N + ' right', 'Time: ' + fmtDur(secs) + (nb ? ' · 🏆 Your best!' : '')), h('div', { class: 'row', style: { justifyContent: 'center' } }, h('button', { class: 'btn', onclick: home }, 'Done'), h('button', { class: 'btn pri', onclick: () => { el.innerHTML = ''; drill(el, { title, gen, key }); } }, 'Play again')));
      }
      const kd = e => { if (/^\d$/.test(e.key)) press(e.key); else if (e.key === 'Backspace') press('⌫'); else if (e.key === 'Enter') press('ok'); else if (e.key === '-') press('−'); };
      addEventListener('keydown', kd); nextQ(); return () => removeEventListener('keydown', kd);
    }
    function math(el) {
      let ops = Prefs.get('mathOps', ['+', '-']), level = Prefs.get('mathLvl', 1);
      const r = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
      const gen = () => {
        const op = pick(ops), L = [10, 20, 100, 1000][level];
        if (op === '+') { const a = r(0, L), b = r(0, L); return { text: a + ' + ' + b, a: a + b }; }
        if (op === '-') { let a = r(0, L), b = r(0, L); if (level < 2 && b > a) [a, b] = [b, a]; return { text: a + ' − ' + b, a: a - b }; }
        const M = [5, 10, 12, 20][level];
        if (op === '×') { const a = r(1, M), b = r(1, M); return { text: a + ' × ' + b, a: a * b }; }
        const b = r(1, M), a = r(0, M); return { text: (a * b) + ' ÷ ' + b, a };
      };
      const body = h('div');
      const opsEl = h('div', { class: 'chips' }, ['+', '-', '×', '÷'].map(o => { const b = h('button', { class: 'chip', 'aria-pressed': String(ops.includes(o)), style: { fontSize: '20px', minWidth: '54px', justifyContent: 'center' } }, o === '-' ? '−' : o); b.onclick = () => { ops = ops.includes(o) ? ops.filter(x => x !== o) : ops.concat(o); if (!ops.length) ops = [o]; Prefs.set('mathOps', ops); $$('.chip', opsEl).forEach((c, k) => c.setAttribute('aria-pressed', String(ops.includes(['+', '-', '×', '÷'][k])))); }; return b; }));
      body.append(h('label', { class: 'f' }, h('span', null, 'Which kinds?'), opsEl), h('label', { class: 'f' }, h('span', null, 'How hard?'), UI.seg([[0, '🐣 Easy'], [1, '🙂 Medium'], [2, '🤓 Hard'], [3, '🚀 Pro']], level, l => { level = l; Prefs.set('mathLvl', l); })),
        h('button', { class: 'btn pri wide mt', onclick: () => { el.innerHTML = ''; cleanup = drill(el, { title: 'Math', gen, key: 'math' + level }); } }, '▶ Start 10 questions'), h('p', { class: 'tiny muted center mt' }, 'Best score: ' + Math.floor(best('math' + level) / 1000) + ' / 10'));
      el.append(body);
    }
    function times(el) {
      const g = h('div', { class: 'grid3 w' });
      for (let t = 1; t <= 12; t++) g.append(h('button', { class: 'bigbtn', style: { minHeight: '70px', alignItems: 'center' }, onclick: () => { el.innerHTML = ''; const order = shuffle([...Array(12).keys()].map(i => i + 1)); let k = 0; cleanup = drill(el, { title: '×' + t, key: 'times' + t, gen: () => { const b = order[k++ % 12]; return Math.random() < 0.5 ? { text: t + ' × ' + b, a: t * b } : { text: b + ' × ' + t, a: t * b }; } }); } }, h('b', { style: { fontSize: '22px' } }, '× ' + t), h('small', null, best('times' + t) >= 10000 ? '⭐ mastered' : best('times' + t) ? Math.floor(best('times' + t) / 1000) + '/10' : 'not tried')));
      el.append(h('p', { class: 'muted small' }, 'Pick a table. Get 10 out of 10 to master it.'), g);
    }
    /* ---------- periodic table ---------- */
    function ptable(el) {
      let filter = null;
      const pos = n => { if (n === 1) return [1, 1]; if (n === 2) return [1, 18]; const P = [[3, 10, 2], [11, 18, 3], [19, 36, 4], [37, 54, 5], [55, 86, 6], [87, 118, 7]];
        for (const [a, b, p] of P) if (n >= a && n <= b) { if (p <= 3) { const i = n - a; return [p, i < 2 ? i + 1 : i + 11]; } if (p <= 5) return [p, n - a + 1]; if ((n >= 57 && n <= 71) || (n >= 89 && n <= 103)) return [p === 6 ? 9 : 10, (n >= 89 ? n - 89 : n - 57) + 3]; const i = n - a; return [p, i < 2 ? i + 1 : i - 14 + 1]; } };
      const state = n => [1, 2, 7, 8, 9, 10, 17, 18, 36, 54, 86].includes(n) ? '💨 Gas' : [35, 80].includes(n) ? '💧 Liquid' : n >= 104 ? '❔ Unknown (made in labs)' : '🧱 Solid';
      const wrap = h('div', { class: 'ptable-wrap' }), legend = h('div', { class: 'chips mt' });
      const draw = () => {
        const t = h('div', { class: 'ptable', role: 'grid' });
        for (const e of ELEMENTS) { const [r, c] = pos(e.n); t.append(h('button', { class: 'el' + (filter && filter !== e.cat ? ' dim' : ''), style: { gridRow: r, gridColumn: c, background: EL_CATS[e.cat][1] }, 'aria-label': e.name, onclick: () => show(e) }, h('small', null, e.n), h('b', null, e.sym))); }
        t.append(h('div', { style: { gridRow: 8, gridColumn: '1 / span 18', height: '8px' } }), h('div', { class: 'tiny muted', style: { gridRow: 6, gridColumn: 3, display: 'grid', placeItems: 'center', fontSize: '9px' } }, '57–71'), h('div', { class: 'tiny muted', style: { gridRow: 7, gridColumn: 3, display: 'grid', placeItems: 'center', fontSize: '9px' } }, '89–103'));
        wrap.innerHTML = ''; wrap.append(t);
      };
      legend.append(...Object.entries(EL_CATS).map(([k, [n, c]]) => h('button', { class: 'chip', style: { background: c, color: '#111', borderColor: 'transparent' }, onclick: () => { filter = filter === k ? null : k; draw(); } }, n)));
      function show(e) {
        const fact = EL_FACTS[e.sym];
        UI.sheet({ title: e.name, body: h('div', null, h('div', { class: 'row nw', style: { gap: '16px' } }, h('div', { style: { width: '96px', height: '110px', borderRadius: '14px', background: EL_CATS[e.cat][1], color: '#111', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' } }, h('small', null, e.n), h('b', { style: { fontSize: '40px' } }, e.sym), h('small', null, e.mass)),
          h('div', null, h('p', null, h('b', null, 'Atomic number: '), e.n), h('p', null, h('b', null, 'Mass: '), e.mass + ' u'), h('p', null, h('b', null, 'Group: '), EL_CATS[e.cat][0]), h('p', null, h('b', null, 'At room temp: '), state(e.n)))),
          fact ? h('div', { class: 'info-banner mt' }, '💡 ' + fact) : null, h('button', { class: 'btn sm mt', onclick: () => Speak.say(e.name) }, '🔊 Say it')) });
      }
      el.append(h('p', { class: 'muted small' }, 'Tap an element to learn about it. Tap a color to highlight that family. Swipe sideways on small screens.'), wrap, legend);
      draw();
    }
    /* ---------- solar system ---------- */
    function space(el) {
      const cv = h('canvas'), list = h('div', { class: 'list mt' }); el.append(h('div', { class: 'orbit' }, cv), h('p', { class: 'tiny muted center' }, 'Not to scale — the real distances are WAY bigger! Tap a planet.'), list);
      const g = cv.getContext('2d'); let raf, t = 0, hits = [];
      const loop = () => {
        const r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); if (cv.width !== r.width * d) { cv.width = r.width * d; cv.height = r.height * d; } g.setTransform(d, 0, 0, d, 0, 0);
        const W = r.width, H = r.height, cx = W / 2, cy = H / 2, maxR = Math.min(W, H * 1.6) / 2 - 14; g.clearRect(0, 0, W, H); t += 0.004; hits = [];
        PLANETS.forEach((p, i) => {
          if (!i) { const gr = g.createRadialGradient(cx, cy, 2, cx, cy, p.r * 2); gr.addColorStop(0, '#FFF3B0'); gr.addColorStop(.5, p.c); gr.addColorStop(1, 'rgba(255,150,0,0)'); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, p.r * 2, 0, 6.28); g.fill(); hits.push([cx, cy, p.r + 6, p]); return; }
          const R = 30 + (maxR - 30) * (i - 1) / 7, yr = 0.55; g.strokeStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.ellipse(cx, cy, R, R * yr, 0, 0, 6.28); g.stroke();
          const ang = t * 6 / Math.pow(i, 1.3) + i * 1.7, x = cx + Math.cos(ang) * R, y = cy + Math.sin(ang) * R * yr;
          if (p.ring) { g.strokeStyle = 'rgba(227,199,126,.8)'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, p.r * 1.8, p.r * .6, -0.3, 0, 6.28); g.stroke(); g.lineWidth = 1; }
          g.fillStyle = p.c; g.beginPath(); g.arc(x, y, p.r, 0, 6.28); g.fill(); hits.push([x, y, p.r + 10, p]);
        });
        raf = requestAnimationFrame(loop);
      };
      cv.addEventListener('click', e => { const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; const hit = hits.filter(([a, b, rr]) => Math.hypot(a - x, b - y) < rr).pop(); if (hit) show(hit[3]); });
      const show = p => UI.sheet({ title: p.e + ' ' + p.n, body: h('div', null, h('div', { class: 'info-banner' }, '💡 ' + p.fact), h('div', { class: 'list' }, (p.d ? [['Distance from Sun', p.d]] : []).concat(p.info).map(([k, val]) => h('div', { class: 'li' }, h('span', { class: 't' }, h('small', null, k), h('b', { style: { whiteSpace: 'normal' } }, val))))), h('button', { class: 'btn sm mt', onclick: () => Speak.say(p.n + '. ' + p.fact) }, '🔊 Read it to me')) });
      list.append(...PLANETS.map(p => h('button', { class: 'li', onclick: () => show(p) }, h('span', { class: 'ic' }, p.e), h('span', { class: 't' }, h('b', null, p.n), h('small', null, p.d ? p.d + ' from the Sun' : 'Our star')), h('span', { class: 'chev' }, '›'))));
      loop(); return () => cancelAnimationFrame(raf);
    }
    /* ---------- quizzes ---------- */
    function mcq(el, { key, make, rounds = 10 }) {
      let n = 0, right = 0; const box = h('div'), prog = h('i'); el.append(h('div', { class: 'prog mb' }, prog), box);
      async function next() {
        prog.style.width = (100 * n / rounds) + '%'; box.innerHTML = '';
        if (n >= rounds) { const nb = best(key, right); if (right >= 8) Sfx.win(); box.append(UI.empty(right >= 9 ? '🏆' : right >= 6 ? '🎉' : '💪', right + ' / ' + rounds, nb ? 'That’s your best!' : 'Best: ' + best(key) + ' / ' + rounds), h('div', { class: 'row', style: { justifyContent: 'center' } }, h('button', { class: 'btn', onclick: home }, 'Done'), h('button', { class: 'btn pri', onclick: () => { n = 0; right = 0; next(); } }, 'Play again'))); return; }
        box.append(h('div', { class: 'empty' }, 'Loading…'));
        const q = await make(); box.innerHTML = ''; let done = false;
        box.append(h('div', { class: 'card center', style: { padding: '22px 16px', margin: '4px 0 12px' } }, q.big ? h('div', { style: { fontSize: '72px', lineHeight: 1 } }, q.big) : null, q.node || null, h('div', { style: { fontSize: '20px', fontWeight: 700, marginTop: '6px' } }, q.q)),
          h('div', { class: 'choices' }, q.opts.map(o => h('button', { onclick: e => { if (done) return; done = true; const ok = o === q.a; n++; if (ok) { right++; Sfx.good(); } else Sfx.bad(); e.currentTarget.classList.add(ok ? 'right' : 'wrong'); $$('.choices button', box).find(b => b.textContent === q.a).classList.add('right'); setTimeout(next, ok ? 700 : 1600); } }, o))));
      }
      next();
    }
    function world(el) {
      el.append(h('p', { class: 'muted small' }, 'Uses the offline world map data.'), h('div', { class: 'grid3' },
        [['cap', '🏛️', 'Capitals'], ['flag', '🏳️', 'Flags'], ['map', '🗺️', 'Find it']].map(([m, e, n]) => h('button', { class: 'bigbtn', onclick: () => start(m) }, h('span', { class: 'e' }, e), h('b', null, n)))));
      async function start(mode) {
        el.innerHTML = ''; const C = await WorldData.load().catch(() => null);
        if (!C) { el.append(UI.empty('🌐', 'World data isn’t saved yet', 'Open Super One once with internet so it can save the map.')); return; }
        const pool = Object.entries(C.facts).filter(([id, f]) => f.capital && f.flag && f.region);
        mcq(el, { key: 'world-' + mode, make: async () => {
          const [id, f] = pick(pool); const others = shuffle(pool.filter(([, g]) => g.name !== f.name && g.capital !== f.capital));
          if (mode === 'cap') return { q: 'What is the capital of ' + f.name + '?', big: f.flag, a: f.capital, opts: shuffle([f.capital, ...others.slice(0, 3).map(([, g]) => g.capital)]) };
          if (mode === 'flag') return { q: 'Which country has this flag?', big: f.flag, a: f.name, opts: shuffle([f.name, ...others.slice(0, 3).map(([, g]) => g.name)]) };
          const c = h('canvas', { style: { width: '100%', height: '200px', display: 'block', borderRadius: '12px', background: '#BFE3F7' } }); setTimeout(() => WorldData.drawMini(c, id), 20);
          return { q: 'Which country is shown in red?', node: c, a: f.name, opts: shuffle([f.name, ...others.filter(([, g]) => g.region === f.region).slice(0, 3).concat(others.slice(0, 3)).slice(0, 3).map(([, g]) => g.name)]) };
        } });
      }
    }
    function wordq(el) {
      if (typeof Dict === 'undefined') { el.append(UI.empty('📚', 'Dictionary missing')); return; }
      const list = [...new Set(WORDLIST.split(','))];
      mcq(el, { key: 'wordq', make: async () => {
        for (let tries = 0; tries < 6; tries++) { const w = pick(list); const r = await Dict.lookup(w).catch(() => null); if (r && r.senses.length) { const def = r.senses[0][1]; return { q: '“' + def.replace(new RegExp(w, 'gi'), '___') + '”', a: w, opts: shuffle([w, ...shuffle(list.filter(x => x !== w)).slice(0, 3)]) }; } }
        const w = pick(list); return { q: 'Which word is spelled correctly?', a: w, opts: shuffle([w, w.split('').reverse().join(''), w + w[0], w.slice(1)]) };
      } });
    }
    home();
    return () => { if (cleanup) cleanup(); };
  },
});

/* ---- 35-social.js ---- */
/* ===== Social: one place to jump into your social apps (they need internet) + your own links ===== */
addCSS(`
.sgrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
@media (min-width:640px){.sgrid{grid-template-columns:repeat(5,minmax(0,1fr))}}
.sapp{display:flex;flex-direction:column;align-items:center;gap:8px;border:1px solid var(--line);background:var(--surface);border-radius:20px;padding:14px 6px;min-width:0;box-shadow:var(--shadow);color:var(--ink)}
.sapp .lg{width:56px;height:56px;border-radius:16px;display:grid;place-items:center;font-size:28px;color:#fff;font-weight:900;box-shadow:inset 0 1px 0 rgba(255,255,255,.3)}
.sapp b{font-size:13px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sapp:active{transform:scale(.96)}
`);
const SOCIAL = [
  ['youtube', 'YouTube', '▶', '#FF0000', 'youtube://', 'https://m.youtube.com'],
  ['tiktok', 'TikTok', '♪', '#111111', 'tiktok://', 'https://www.tiktok.com'],
  ['instagram', 'Instagram', '◎', 'linear-gradient(45deg,#F58529,#DD2A7B,#8134AF,#515BD4)', 'instagram://app', 'https://www.instagram.com'],
  ['snapchat', 'Snapchat', '👻', '#FFCC00', 'snapchat://', 'https://www.snapchat.com'],
  ['whatsapp', 'WhatsApp', '✆', '#25D366', 'whatsapp://', 'https://web.whatsapp.com'],
  ['discord', 'Discord', '🎮', '#5865F2', 'discord://', 'https://discord.com/app'],
  ['roblox', 'Roblox', '◆', '#393B3D', 'roblox://', 'https://www.roblox.com'],
  ['messages', 'Messages', '💬', '#34C759', 'sms:', ''],
  ['reddit', 'Reddit', '◉', '#FF4500', 'reddit://', 'https://www.reddit.com'],
  ['pinterest', 'Pinterest', 'P', '#E60023', 'pinterest://', 'https://www.pinterest.com'],
  ['x', 'X', '𝕏', '#000000', 'twitter://', 'https://x.com'],
  ['facebook', 'Facebook', 'f', '#1877F2', 'fb://', 'https://m.facebook.com'],
  ['messenger', 'Messenger', '⚡', 'linear-gradient(45deg,#0099FF,#A033FF,#FF5280)', 'fb-messenger://', 'https://www.messenger.com'],
  ['twitch', 'Twitch', '📺', '#9146FF', 'twitch://', 'https://m.twitch.tv'],
  ['spotify', 'Spotify', '♫', '#1DB954', 'spotify://', 'https://open.spotify.com'],
  ['telegram', 'Telegram', '✈', '#2AABEE', 'tg://', 'https://web.telegram.org'],
];
function openOut(scheme, web) {
  // try the real app first; if nothing happens (app not installed), open the website
  if (!scheme) { if (web) window.open(web, '_blank', 'noopener'); return; }
  let left = false; const vis = () => { if (document.hidden) left = true; };
  document.addEventListener('visibilitychange', vis);
  location.href = scheme;
  setTimeout(() => { document.removeEventListener('visibilitychange', vis); if (!left && web && navigator.onLine) window.open(web, '_blank', 'noopener'); }, 1400);
}
Apps.reg({
  id: 'social', name: 'Social', icon: '💬', color: 'linear-gradient(135deg,#FF6CAB,#7366FF)', group: 'play', keys: 'social media youtube tiktok instagram snapchat discord roblox friends', blurb: 'Your social apps in one place',
  mount(v, ctx) {
    const draw = () => {
      v.innerHTML = '';
      const on = Prefs.get('socialOn', ['youtube', 'tiktok', 'instagram', 'snapchat', 'whatsapp', 'discord', 'roblox', 'messages']), mine = Prefs.get('socialMine', []);
      ctx.setActions(h('button', { class: 'btn ghost sm', onclick: edit }, 'Edit'));
      if (!navigator.onLine) v.append(h('div', { class: 'note-banner' }, '📴 You’re offline. Social apps need internet — your messages will be waiting when you’re back on Wi-Fi.'));
      v.append(h('p', { class: 'muted small', style: { margin: '0 2px 12px' } }, 'Tap to open the real app. If you don’t have it, I open the website.'),
        h('div', { class: 'sgrid' }, SOCIAL.filter(s => on.includes(s[0])).map(([id, n, g, c, scheme, web]) => h('button', { class: 'sapp', onclick: () => openOut(scheme, web) }, h('span', { class: 'lg', style: { background: c, color: id === 'snapchat' ? '#111' : '#fff' } }, g), h('b', null, n)))));
      v.append(h('div', { class: 'sec' }, '⭐ My links'));
      if (mine.length) v.append(h('div', { class: 'list' }, mine.map((l, i) => onLongPress(h('button', { class: 'li', onclick: () => window.open(l.url, '_blank', 'noopener') }, h('span', { class: 'ic' }, l.emoji || '🔗'), h('span', { class: 't' }, h('b', null, l.name), h('small', null, l.url.replace(/^https?:\/\//, ''))), h('span', { class: 'chev' }, '↗')), async () => { if (await UI.ask('Remove “' + l.name + '”?', { ok: 'Remove', danger: true })) { mine.splice(i, 1); Prefs.set('socialMine', mine); draw(); } }))));
      v.append(h('button', { class: 'btn wide mt', onclick: addLink }, '＋ Add a link (a friend’s channel, a game, a website)'),
        h('div', { class: 'sec' }, '🎮 Your games'), h('div', { class: 'list' },
          [['🦸', 'Capeborn', 'https://szeszeming2-lgtm.github.io/capeborn/'], ['🏝️', 'Hollowsky', 'https://szeszeming2-lgtm.github.io/hollowsky/']].map(([e, n, u]) => h('button', { class: 'li', onclick: () => window.open(u, '_blank', 'noopener') }, h('span', { class: 'ic' }, e), h('span', { class: 't' }, h('b', null, n), h('small', null, 'Your offline 3D game')), h('span', { class: 'chev' }, '↗')))),
        h('p', { class: 'tiny muted mt' }, 'Stay safe online: only add friends you know in real life, and never share your passwords or address.'));
    };
    function edit() {
      const on = Prefs.get('socialOn', ['youtube', 'tiktok', 'instagram', 'snapchat', 'whatsapp', 'discord', 'roblox', 'messages']);
      UI.sheet({ title: 'Which apps to show', onClose: draw, body: h('div', { class: 'chips' }, SOCIAL.map(([id, n, g]) => { const b = h('button', { class: 'chip', 'aria-pressed': String(on.includes(id)) }, n); b.onclick = () => { const i = on.indexOf(id); if (i >= 0) on.splice(i, 1); else on.push(id); Prefs.set('socialOn', on); b.setAttribute('aria-pressed', String(on.includes(id))); }; return b; })) });
    }
    function addLink() {
      const n = h('input', { type: 'text', placeholder: 'Name (e.g. My YouTube channel)' }), u = h('input', { type: 'url', placeholder: 'https://…', autocapitalize: 'off' }), e = h('input', { type: 'text', value: '🔗', maxlength: 4, style: { width: '70px', textAlign: 'center', fontSize: '22px' } });
      UI.sheet({ title: 'Add a link', body: h('div', { class: 'stack' }, h('div', { class: 'row nw' }, e, n), u), actions: [{ label: 'Cancel' }, { label: 'Add', cls: 'pri', onClick: c => { let url = u.value.trim(); if (!url) return UI.toast('Paste a link'); if (!/^[a-z]+:/i.test(url)) url = 'https://' + url; const mine = Prefs.get('socialMine', []); mine.push({ name: n.value.trim() || url.replace(/^https?:\/\//, '').split('/')[0], url, emoji: e.value.trim() || '🔗' }); Prefs.set('socialMine', mine); c(); draw(); } }] });
    }
    const re = () => draw(); addEventListener('online', re); addEventListener('offline', re);
    draw(); return () => { removeEventListener('online', re); removeEventListener('offline', re); };
  },
});

/* ---- 36-games2.js ---- */
/* ===== More games: Snake, Brick Smash, Four in a Row, Sky Hopper ===== */
addCSS(`
.dpad{display:grid;grid-template-columns:repeat(3,64px);grid-template-rows:repeat(2,52px);gap:6px;justify-content:center;margin-top:10px}
.dpad button{border:0;border-radius:14px;background:var(--surface2);font-size:24px;color:var(--ink)}
.c4{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px;background:#1E4FD8;padding:8px;border-radius:18px;max-width:460px;margin:10px auto;box-shadow:0 8px 24px rgba(30,79,216,.35)}
.c4 button{aspect-ratio:1/1;border-radius:50%;border:0;background:var(--bg);box-shadow:inset 0 3px 6px rgba(0,0,0,.25);padding:0}
.c4 button.r{background:radial-gradient(circle at 35% 35%,#FF8A8A,#E5383B)}.c4 button.y{background:radial-gradient(circle at 35% 35%,#FFF0A0,#F5B700)}
.c4 button.win{outline:4px solid #fff;outline-offset:-4px}
`);
GAMES.push(
  ['snake', '🐍', 'Snake', 'Eat, grow, don’t bite yourself', 'linear-gradient(135deg,#56AB2F,#1E6B1E)'],
  ['bricks', '🧱', 'Brick Smash', 'Bounce the ball, break the wall', 'linear-gradient(135deg,#F7971E,#D7263D)'],
  ['four', '🔴', 'Four in a Row', 'Line up 4 before the bot', 'linear-gradient(135deg,#2B5BFF,#0A1F8F)'],
  ['hopper', '🦘', 'Sky Hopper', 'Tap to jump, run forever', 'linear-gradient(135deg,#36D1DC,#5B86E5)'],
);
function arenaKit(el, tip) {
  const cv = h('canvas'), over = h('div', { class: 'over' }), arena = h('div', { class: 'arena' }, cv, over); el.append(arena, tip ? h('p', { class: 'tiny muted center mt' }, tip) : null);
  const g = cv.getContext('2d'); const k = { cv, g, over, W: 0, H: 0 };
  k.size = () => { const r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); k.W = r.width; k.H = r.height; cv.width = r.width * d; cv.height = r.height * d; g.setTransform(d, 0, 0, d, 0, 0); };
  k.menu = (title, sub, label, fn, bestKey) => { over.hidden = false; over.innerHTML = ''; over.append(h('h2', null, title), sub ? h('p', null, sub) : null, h('button', { class: 'btn pri', onclick: () => { over.hidden = true; fn(); } }, label || '▶ Play'), bestKey && GameBest(bestKey) != null ? h('small', null, 'Best: ' + GameBest(bestKey)) : null); };
  return k;
}
EXTRA_GAMES.snake = el => {
  const K = arenaKit(el, 'Swipe, use the arrows below, or the arrow keys.'); const N = 18; let snake, dir, nextDir, food, score, alive = false, timer = null, speed;
  el.append(h('div', { class: 'dpad' }, h('span'), h('button', { 'aria-label': 'Up', onclick: () => turn(0, -1) }, '▲'), h('span'), h('button', { 'aria-label': 'Left', onclick: () => turn(-1, 0) }, '◀'), h('button', { 'aria-label': 'Down', onclick: () => turn(0, 1) }, '▼'), h('button', { 'aria-label': 'Right', onclick: () => turn(1, 0) }, '▶')));
  const turn = (x, y) => { if (x === -dir[0] && y === -dir[1]) return; nextDir = [x, y]; };
  const place = () => { do { food = [Math.floor(Math.random() * N), Math.floor(Math.random() * N)]; } while (snake.some(s => s[0] === food[0] && s[1] === food[1])); };
  function start() { K.size(); snake = [[8, 9], [7, 9], [6, 9]]; dir = [1, 0]; nextDir = dir; score = 0; speed = 140; place(); alive = true; clearInterval(timer); timer = setInterval(step, speed); draw(); }
  function step() {
    dir = nextDir; const hd = [snake[0][0] + dir[0], snake[0][1] + dir[1]];
    if (hd[0] < 0 || hd[1] < 0 || hd[0] >= N || hd[1] >= N || snake.some(s => s[0] === hd[0] && s[1] === hd[1])) { alive = false; clearInterval(timer); Sfx.bad(); const nb = GameBest('snake', score); K.menu(nb ? '🏆 New best: ' + score : 'Score: ' + score, 'Length ' + snake.length, 'Play again', start, 'snake'); return; }
    snake.unshift(hd); if (hd[0] === food[0] && hd[1] === food[1]) { score += 10; Sfx.good(); place(); if (speed > 70) { speed -= 4; clearInterval(timer); timer = setInterval(step, speed); } } else snake.pop();
    draw();
  }
  function draw() {
    const { g, W, H } = K, c = Math.min(W, H) / N, ox = (W - c * N) / 2, oy = (H - c * N) / 2;
    g.fillStyle = '#0D2B12'; g.fillRect(0, 0, W, H); for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { g.fillStyle = (x + y) % 2 ? '#143D1A' : '#174620'; g.fillRect(ox + x * c, oy + y * c, c, c); }
    g.font = Math.floor(c * .9) + 'px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('🍎', ox + food[0] * c + c / 2, oy + food[1] * c + c / 2 + 1);
    snake.forEach(([x, y], i) => { g.fillStyle = i ? 'hsl(' + (100 + i * 3) + ' 70% ' + (55 - Math.min(20, i)) + '%)' : '#B6F25A'; g.beginPath(); g.roundRect(ox + x * c + 1, oy + y * c + 1, c - 2, c - 2, c / 3); g.fill(); });
    const [hx, hy] = snake[0]; g.fillStyle = '#111'; g.beginPath(); g.arc(ox + hx * c + c / 2 + dir[0] * c / 5 - dir[1] * c / 5, oy + hy * c + c / 2 + dir[1] * c / 5 - dir[0] * c / 5, c / 9, 0, 6.28); g.arc(ox + hx * c + c / 2 + dir[0] * c / 5 + dir[1] * c / 5, oy + hy * c + c / 2 + dir[1] * c / 5 + dir[0] * c / 5, c / 9, 0, 6.28); g.fill();
    g.fillStyle = '#fff'; g.font = '700 18px ' + getComputedStyle(document.body).fontFamily; g.textAlign = 'left'; g.fillText('🍎 ' + score, 12, 20);
  }
  let sx, sy; K.cv.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; }); K.cv.addEventListener('pointerup', e => { const dx = e.clientX - sx, dy = e.clientY - sy; if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return; Math.abs(dx) > Math.abs(dy) ? turn(Math.sign(dx), 0) : turn(0, Math.sign(dy)); });
  const kd = e => { const m = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.key]; if (m && alive) { e.preventDefault(); turn(...m); } }; addEventListener('keydown', kd);
  requestAnimationFrame(() => { K.size(); snake = [[8, 9], [7, 9], [6, 9]]; dir = [1, 0]; food = [13, 9]; score = 0; draw(); K.menu('🐍 Snake', 'Eat apples to grow. Don’t hit the walls or yourself!', '▶ Play', start, 'snake'); });
  return () => { clearInterval(timer); removeEventListener('keydown', kd); };
};
EXTRA_GAMES.bricks = el => {
  const K = arenaKit(el, 'Drag to move the paddle. Catch ⭐ for a wider paddle and ❤️ for a life.'); let pad, balls, bricks, drops, lives, score, level, raf, last, run = false, held = false;
  function setup(lv) { K.size(); const { W } = K, cols = 8, rows = Math.min(8, 3 + lv), bw = (W - 20) / cols; bricks = []; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (lv < 3 || (r + c) % 5) bricks.push({ x: 10 + c * bw, y: 50 + r * 24, w: bw - 4, h: 18, hp: r < lv - 2 ? 2 : 1, col: 'hsl(' + (r * 40 + lv * 25) % 360 + ' 80% 60%)' }); pad = { x: W / 2, w: 90 }; balls = [{ x: W / 2, y: K.H - 60, vx: 180, vy: -(260 + lv * 25), stuck: true }]; drops = []; }
  function start() { lives = 3; score = 0; level = 1; setup(1); go(); }
  function go() { run = true; last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); }
  function loop(now) {
    if (!run) return; const dt = Math.min(0.033, (now - last) / 1000); last = now; const { g, W, H } = K; const py = H - 36;
    g.fillStyle = '#12091F'; g.fillRect(0, 0, W, H);
    for (const b of balls) {
      if (b.stuck) { b.x = pad.x; b.y = py - 10; continue; }
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.x < 8 || b.x > W - 8) { b.vx *= -1; b.x = clamp(b.x, 8, W - 8); } if (b.y < 8) { b.vy = Math.abs(b.vy); }
      if (b.vy > 0 && b.y > py - 8 && b.y < py + 6 && Math.abs(b.x - pad.x) < pad.w / 2 + 6) { const hit = (b.x - pad.x) / (pad.w / 2), sp = Math.hypot(b.vx, b.vy); b.vx = sp * Math.sin(hit * 1.05); b.vy = -Math.abs(sp * Math.cos(hit * 1.05)); Sfx.tap(); }
      for (const br of bricks) { if (br.hp <= 0) continue; if (b.x > br.x - 6 && b.x < br.x + br.w + 6 && b.y > br.y - 6 && b.y < br.y + br.h + 6) { br.hp--; const fromSide = Math.min(Math.abs(b.x - br.x), Math.abs(b.x - br.x - br.w)) < Math.min(Math.abs(b.y - br.y), Math.abs(b.y - br.y - br.h)); if (fromSide) b.vx *= -1; else b.vy *= -1; if (br.hp <= 0) { score += 10; Sfx.tone(500 + Math.random() * 300, .06, { type: 'square', vol: .06 }); if (Math.random() < 0.12) drops.push({ x: br.x + br.w / 2, y: br.y, t: Math.random() < 0.6 ? 'wide' : 'life' }); } break; } }
    }
    balls = balls.filter(b => b.y < H + 20);
    if (!balls.length) { lives--; Sfx.bad(); if (lives <= 0) { run = false; const nb = GameBest('bricks', score); K.menu(nb ? '🏆 New best: ' + score : 'Game over', 'Score ' + score + ' · reached level ' + level, 'Play again', start, 'bricks'); return; } balls = [{ x: pad.x, y: py - 10, vx: 180, vy: -(260 + level * 25), stuck: true }]; }
    if (bricks.every(b => b.hp <= 0)) { level++; Sfx.win(); setup(level); }
    for (const d of drops) { d.y += 120 * dt; if (d.y > py - 10 && Math.abs(d.x - pad.x) < pad.w / 2) { d.y = H + 99; if (d.t === 'wide') { pad.w = Math.min(170, pad.w + 40); setTimeout(() => pad.w = 90, 12000); } else lives++; Sfx.good(); } }
    drops = drops.filter(d => d.y < H + 20);
    for (const br of bricks) if (br.hp > 0) { g.fillStyle = br.col; g.globalAlpha = br.hp > 1 ? 1 : .85; g.beginPath(); g.roundRect(br.x, br.y, br.w, br.h, 5); g.fill(); if (br.hp > 1) { g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke(); } } g.globalAlpha = 1;
    g.font = '20px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; for (const d of drops) g.fillText(d.t === 'wide' ? '⭐' : '❤️', d.x, d.y);
    const pg = g.createLinearGradient(0, py, 0, py + 12); pg.addColorStop(0, '#9AE6FF'); pg.addColorStop(1, '#3A86FF'); g.fillStyle = pg; g.beginPath(); g.roundRect(pad.x - pad.w / 2, py, pad.w, 12, 6); g.fill();
    g.fillStyle = '#fff'; for (const b of balls) { g.beginPath(); g.arc(b.x, b.y, 7, 0, 6.28); g.fill(); }
    g.font = '700 17px ' + getComputedStyle(document.body).fontFamily; g.textAlign = 'left'; g.fillText('⭐ ' + score + '   Level ' + level, 12, 22); g.textAlign = 'right'; g.fillText('❤️'.repeat(Math.max(0, Math.min(lives, 6))), W - 12, 22);
    if (balls.some(b => b.stuck)) { g.textAlign = 'center'; g.fillStyle = 'rgba(255,255,255,.8)'; g.fillText('Tap to launch', W / 2, H / 2 + 60); }
    raf = requestAnimationFrame(loop);
  }
  const moveTo = e => { const r = K.cv.getBoundingClientRect(); pad.x = clamp(e.clientX - r.left, pad.w / 2, K.W - pad.w / 2); };
  K.cv.addEventListener('pointerdown', e => { held = true; K.cv.setPointerCapture(e.pointerId); if (pad) { moveTo(e); balls.forEach(b => b.stuck = false); } });
  K.cv.addEventListener('pointermove', e => { if (pad && (held || e.pointerType === 'mouse')) moveTo(e); }); K.cv.addEventListener('pointerup', () => held = false);
  const kd = e => { if (!pad) return; if (e.key === 'ArrowLeft') pad.x = Math.max(pad.w / 2, pad.x - 30); if (e.key === 'ArrowRight') pad.x = Math.min(K.W - pad.w / 2, pad.x + 30); if (e.key === ' ') balls.forEach(b => b.stuck = false); }; addEventListener('keydown', kd);
  const vis = () => { if (document.hidden && run) { run = false; K.menu('Paused', '', 'Keep playing', go); } }; document.addEventListener('visibilitychange', vis);
  requestAnimationFrame(() => { K.size(); K.g.fillStyle = '#12091F'; K.g.fillRect(0, 0, K.W, K.H); K.menu('🧱 Brick Smash', 'Break every brick to reach the next level.', '▶ Play', start, 'bricks'); });
  return () => { run = false; cancelAnimationFrame(raf); removeEventListener('keydown', kd); document.removeEventListener('visibilitychange', vis); };
};
EXTRA_GAMES.four = el => {
  const R = 6, C = 7; let b, turn, over, mode = Prefs.get('c4Mode', 'bot'), busy = false, winCells = [];
  const grid = h('div', { class: 'c4', role: 'grid', 'aria-label': 'Four in a row board' }), info = h('div', { class: 'center', style: { fontSize: '18px', fontWeight: 700, minHeight: '28px' } });
  el.append(UI.seg([['bot', '🤖 vs Bot'], ['two', '👥 2 players']], mode, m => { mode = m; Prefs.set('c4Mode', m); reset(); }), grid, info, h('div', { class: 'center mt' }, h('button', { class: 'btn pri', onclick: () => reset() }, 'New game')));
  const drop = (bb, c, p) => { for (let r = R - 1; r >= 0; r--) if (!bb[r][c]) { bb[r][c] = p; return r; } return -1; };
  const lines = (bb, p) => { for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) { const cells = []; for (let k = 0; k < 4; k++) { const rr = r + dr * k, cc = c + dc * k; if (rr < 0 || rr >= R || cc < 0 || cc >= C || bb[rr][cc] !== p) break; cells.push([rr, cc]); } if (cells.length === 4) return cells; } return null; };
  const scoreWin = (bb, p) => { let s = 0; const o = p === 'r' ? 'y' : 'r'; for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) { let mine = 0, theirs = 0, ok = true; for (let k = 0; k < 4; k++) { const rr = r + dr * k, cc = c + dc * k; if (rr < 0 || rr >= R || cc < 0 || cc >= C) { ok = false; break; } if (bb[rr][cc] === p) mine++; else if (bb[rr][cc] === o) theirs++; } if (!ok) continue; if (!theirs) s += [0, 1, 6, 40, 1000][mine]; if (!mine) s -= [0, 1, 7, 50, 1000][theirs]; } for (let r = 0; r < R; r++) if (bb[r][3] === p) s += 3; return s; };
  const valid = bb => [3, 2, 4, 1, 5, 0, 6].filter(c => !bb[0][c]);
  const mm = (bb, d, a, be, maxi) => { if (lines(bb, 'y')) return 100000 + d; if (lines(bb, 'r')) return -100000 - d; const vs = valid(bb); if (!d || !vs.length) return scoreWin(bb, 'y'); if (maxi) { let v = -Infinity; for (const c of vs) { const r = drop(bb, c, 'y'); v = Math.max(v, mm(bb, d - 1, a, be, false)); bb[r][c] = ''; a = Math.max(a, v); if (a >= be) break; } return v; } let v = Infinity; for (const c of vs) { const r = drop(bb, c, 'r'); v = Math.min(v, mm(bb, d - 1, a, be, true)); bb[r][c] = ''; be = Math.min(be, v); if (a >= be) break; } return v; };
  const bot = () => { let best = -Infinity, pickC = 3; for (const c of valid(b)) { const r = drop(b, c, 'y'); const v = mm(b, 5, -Infinity, Infinity, false) + (Math.random() - .5) * 4; b[r][c] = ''; if (v > best) { best = v; pickC = c; } } return pickC; };
  function reset() { b = Array.from({ length: R }, () => Array(C).fill('')); turn = 'r'; over = false; winCells = []; busy = false; draw(); }
  function play(c) {
    if (over || busy || b[0][c]) return; drop(b, c, turn); Sfx.tap(); check(); if (over) return draw();
    turn = turn === 'r' ? 'y' : 'r'; draw();
    if (mode === 'bot' && turn === 'y') { busy = true; setTimeout(() => { drop(b, bot(), 'y'); busy = false; check(); if (!over) turn = 'r'; draw(); }, 350); }
  }
  function check() { for (const p of ['r', 'y']) { const w = lines(b, p); if (w) { over = p; winCells = w; mode === 'bot' && p === 'y' ? Sfx.bad() : Sfx.win(); if (mode === 'bot' && p === 'r') GameBest('four', (GameBest('four') || 0) + 1); return; } } if (b[0].every(Boolean)) over = 'draw'; }
  function draw() {
    grid.innerHTML = ''; for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) grid.append(h('button', { class: (b[r][c] || '') + (winCells.some(([a, d]) => a === r && d === c) ? ' win' : ''), 'aria-label': 'Column ' + (c + 1), onclick: () => play(c) }));
    info.textContent = over === 'draw' ? '🤝 Board full — it’s a tie' : over ? (mode === 'bot' ? (over === 'r' ? '🎉 You win! (' + GameBest('four') + ' wins so far)' : '🤖 The bot wins this time') : (over === 'r' ? '🔴 Red' : '🟡 Yellow') + ' wins!') : busy ? '🤖 Thinking…' : (mode === 'bot' ? 'Your turn — you are 🔴' : (turn === 'r' ? '🔴 Red' : '🟡 Yellow') + '’s turn');
  }
  reset();
};
EXTRA_GAMES.hopper = el => {
  const K = arenaKit(el, 'Tap (or press space) to jump. Tap again in the air for a double jump!'); let p, obs, coins, clouds, t, dist, run = false, raf, last, speed, spawn, coinN;
  const ground = () => K.H - 70;
  function start() { K.size(); p = { x: 70, y: ground(), vy: 0, jumps: 0 }; obs = []; coins = []; clouds = Array.from({ length: 5 }, (_, i) => ({ x: i * 120, y: 40 + Math.random() * 120, s: .5 + Math.random() })); t = 0; dist = 0; speed = 260; spawn = 1; coinN = 0; run = true; last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); }
  const jump = () => { if (!run) return; if (p.jumps < 2) { p.vy = p.jumps ? -560 : -640; p.jumps++; Sfx.tone(p.jumps === 1 ? 520 : 760, .08, { type: 'triangle', vol: .08 }); } };
  function loop(now) {
    if (!run) return; const dt = Math.min(0.033, (now - last) / 1000); last = now; t += dt; speed = 260 + t * 9; dist += speed * dt / 10; const { g, W, H } = K, gy = ground();
    p.vy += 1800 * dt; p.y += p.vy * dt; if (p.y >= gy) { p.y = gy; p.vy = 0; p.jumps = 0; }
    spawn -= dt; if (spawn <= 0) { spawn = clamp(1.6 - t / 60, .65, 1.6) * (0.7 + Math.random() * .6); const fly = t > 15 && Math.random() < .3; obs.push(fly ? { x: W + 30, y: gy - 70 - Math.random() * 40, w: 34, h: 24, fly: true } : { x: W + 30, y: gy, w: 26 + Math.random() * 18, h: 30 + Math.random() * 30 }); if (Math.random() < .6) for (let i = 0; i < 3; i++) coins.push({ x: W + 120 + i * 32, y: gy - 60 - (Math.random() < .5 ? 60 : 0) }); }
    const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#5BC0F8'); sky.addColorStop(1, '#C7F0FF'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
    g.font = '40px system-ui'; g.textBaseline = 'middle'; for (const c of clouds) { c.x -= speed * .15 * c.s * dt; if (c.x < -80) { c.x = W + 40; c.y = 40 + Math.random() * 120; } g.globalAlpha = .9; g.fillText('☁️', c.x, c.y); } g.globalAlpha = 1;
    g.fillStyle = '#6BCB4D'; g.fillRect(0, gy + 18, W, H); g.fillStyle = '#4FA83A'; for (let x = -((dist * 10) % 40); x < W; x += 40) g.fillRect(x, gy + 18, 20, 6);
    for (const o of obs) { o.x -= speed * dt * (o.fly ? 1.25 : 1); if (o.fly) { g.font = '30px system-ui'; g.fillText('🦅', o.x, o.y); } else { g.fillStyle = '#A0522D'; g.beginPath(); g.roundRect(o.x - o.w / 2, gy + 18 - o.h, o.w, o.h, 5); g.fill(); g.strokeStyle = '#6B3410'; g.lineWidth = 2; g.strokeRect(o.x - o.w / 2 + 4, gy + 22 - o.h, o.w - 8, o.h - 8); }
      const hx = Math.abs(o.x - p.x) < o.w / 2 + 12, hy = o.fly ? Math.abs(o.y - (p.y - 10)) < 26 : p.y + 18 > gy + 18 - o.h + 6; if (hx && hy) { run = false; Sfx.bad(); const sc = Math.floor(dist) + coinN * 10; const nb = GameBest('hopper', sc); K.menu(nb ? '🏆 New best: ' + sc : 'Score: ' + sc, Math.floor(dist) + ' m · ' + coinN + ' coins', 'Run again', start, 'hopper'); return; } }
    obs = obs.filter(o => o.x > -60);
    g.font = '24px system-ui'; for (const c of coins) { c.x -= speed * dt; if (Math.hypot(c.x - p.x, c.y - (p.y - 10)) < 26) { c.x = -99; coinN++; Sfx.good(); } else g.fillText('🪙', c.x, c.y); } coins = coins.filter(c => c.x > -30);
    g.save(); g.translate(p.x, p.y); if (p.jumps) g.rotate(p.jumps === 2 ? t * 12 : -0.15); g.font = '40px system-ui'; g.textAlign = 'center'; g.fillText('🦘', 0, -4); g.restore(); g.textAlign = 'left';
    g.fillStyle = '#0B3954'; g.font = '800 20px ' + getComputedStyle(document.body).fontFamily; g.fillText(Math.floor(dist) + ' m', 14, 26); g.textAlign = 'right'; g.fillText('🪙 ' + coinN, W - 14, 26); g.textAlign = 'left';
    raf = requestAnimationFrame(loop);
  }
  K.cv.addEventListener('pointerdown', e => { e.preventDefault(); jump(); });
  const kd = e => { if (e.key === ' ' || e.key === 'ArrowUp') { e.preventDefault(); jump(); } }; addEventListener('keydown', kd);
  const vis = () => { if (document.hidden && run) { run = false; K.menu('Paused', '', 'Keep running', () => { run = true; last = performance.now(); raf = requestAnimationFrame(loop); }); } }; document.addEventListener('visibilitychange', vis);
  requestAnimationFrame(() => { K.size(); const { g, W, H } = K; g.fillStyle = '#5BC0F8'; g.fillRect(0, 0, W, H); K.menu('🦘 Sky Hopper', 'Jump over crates, dodge the birds, grab coins!', '▶ Run', start, 'hopper'); });
  return () => { run = false; cancelAnimationFrame(raf); removeEventListener('keydown', kd); document.removeEventListener('visibilitychange', vis); };
};

/* ---- 37-links.js ---- */
/* ===== Links: your favorite websites and apps in one place, with recommended ones to add in a tap ===== */
addCSS(`
.lgrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px 8px}
@media (min-width:640px){.lgrid{grid-template-columns:repeat(6,minmax(0,1fr))}}
.lnk{position:relative;display:flex;flex-direction:column;align-items:center;gap:6px;border:0;background:none;padding:0;min-width:0;color:var(--ink)}
.lnk .lg{position:relative;width:58px;height:58px;border-radius:16px;display:grid;place-items:center;font-size:28px;color:#fff;font-weight:800;box-shadow:var(--shadow)}
.lnk b{font-size:12px;font-weight:600;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lnk .plus{position:absolute;right:-6px;top:-6px;width:22px;height:22px;border-radius:50%;background:var(--accent);color:#fff;font-size:15px;font-weight:900;line-height:22px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.3)}
.lnk .plus.on{background:#22A55A}
.lrow{display:flex;gap:12px;overflow-x:auto;scrollbar-width:none;padding:8px 2px 6px;margin:0 -2px}
.lrow::-webkit-scrollbar{display:none}
.lrow .lnk{flex:0 0 68px}
.recbox{background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:14px 12px 16px;margin-top:8px}
.recbox .chips{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;padding-bottom:4px}
.recbox .chips::-webkit-scrollbar{display:none}
.recbox .chip{flex:0 0 auto}
.recbox .chip[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:#fff}
`);
const LINK_CATS = [['Music', '🎵'], ['Videos', '🎬'], ['Games', '🎮'], ['My games', '⭐'], ['Comics', '💥'], ['Learning', '🧠'], ['Cubing', '🧊'], ['News', '📰'], ['Tools', '🔧']];
// [group, emoji, name, web address, app link (opens the phone app if you have it), short note]
const LINK_IDEAS = [
  ['Music', '🟢', 'Spotify', 'https://open.spotify.com', 'spotify://', 'Songs, playlists, podcasts'],
  ['Music', '🎵', 'Apple Music', 'https://music.apple.com', 'music://', 'The Music app'],
  ['Music', '▶️', 'YouTube Music', 'https://music.youtube.com', 'youtubemusic://', 'Songs and music videos'],
  ['Music', '☁️', 'SoundCloud', 'https://soundcloud.com', 'soundcloud://', 'New artists and remixes'],
  ['Music', '📻', 'Radio Garden', 'https://radio.garden', '', 'Live radio from the whole world'],
  ['Music', '🎹', 'Chrome Music Lab', 'https://musiclab.chromeexperiments.com', '', 'Make music in fun ways'],
  ['Music', '🍁', 'CBC Music', 'https://www.cbc.ca/music', '', 'Canadian radio and playlists'],
  ['Videos', '📺', 'YouTube', 'https://m.youtube.com', 'youtube://', 'Videos of everything'],
  ['Videos', '🧒', 'YouTube Kids', 'https://www.youtubekids.com', '', 'Videos made for kids'],
  ['Videos', '🍿', 'Netflix', 'https://www.netflix.com', 'nflx://', 'Shows and movies'],
  ['Videos', '🏰', 'Disney+', 'https://www.disneyplus.com', 'disneyplus://', 'Disney, Pixar, Marvel, Star Wars'],
  ['Videos', '📦', 'Prime Video', 'https://www.primevideo.com', 'aiv://', 'Shows and movies'],
  ['Videos', '🐻', 'PBS Kids Video', 'https://pbskids.org/videos', '', 'Free kids’ shows'],
  ['Videos', '💡', 'TED-Ed', 'https://ed.ted.com', '', 'Short videos that teach'],
  ['Videos', '🚀', 'NASA+', 'https://plus.nasa.gov', '', 'Free space videos and launches'],
  ['Games', '🟥', 'Roblox', 'https://www.roblox.com', 'roblox://', 'Play and make games'],
  ['Games', '🧱', 'Minecraft', 'https://www.minecraft.net', 'minecraft://', 'Build anything'],
  ['Games', '🧮', 'Coolmath Games', 'https://www.coolmathgames.com', '', 'Brain games and puzzles'],
  ['Games', '♟️', 'Chess.com', 'https://www.chess.com', '', 'Play chess with people'],
  ['Games', '♞', 'Lichess', 'https://lichess.org', '', 'Free chess, no ads'],
  ['Learning', '🧠', 'Khan Academy', 'https://www.khanacademy.org', '', 'Free lessons for every subject'], ['Learning', '🐱', 'Scratch', 'https://scratch.mit.edu', '', 'Make your own games'], ['Learning', '🦉', 'Duolingo', 'https://www.duolingo.com', 'duolingo://', 'Learn a language'],
  ['Learning', '🚀', 'NASA Space Place', 'https://spaceplace.nasa.gov', '', 'Space for kids'], ['Learning', '🦁', 'Nat Geo Kids', 'https://kids.nationalgeographic.com', '', 'Animals and the world'], ['Learning', '🧩', 'Code.org', 'https://code.org', '', 'Learn to code'],
  ['Cubing', '🧊', 'J Perm', 'https://jperm.net', '', 'Cube tutorials'], ['Cubing', '⏱️', 'csTimer', 'https://cstimer.net', '', 'Speedcubing timer'], ['Cubing', '🏆', 'World Cube Association', 'https://www.worldcubeassociation.org', '', 'Competitions and records'],
  ['News', '🍁', 'CBC Kids News', 'https://www.cbc.ca/kidsnews', '', 'News for kids in Canada'], ['News', '🌍', 'BBC Newsround', 'https://www.bbc.co.uk/newsround', '', 'World news for kids'], ['News', '📰', 'Time for Kids', 'https://www.timeforkids.com', '', 'News stories for kids'], ['News', '🛰️', 'NASA', 'https://www.nasa.gov', '', 'Space news'],
  ['Tools', '🔍', 'Google', 'https://www.google.com', '', 'Search the web'], ['Tools', '📖', 'Wikipedia', 'https://en.wikipedia.org', '', 'The free encyclopedia'], ['Tools', '🗺️', 'Google Maps', 'https://maps.google.com', 'comgooglemaps://', 'Maps and directions'], ['Tools', '🌐', 'Google Translate', 'https://translate.google.com', '', 'Translate anything'],
];
const Links = {
  get: () => Prefs.get('links', []), set: l => Prefs.set('links', l),
  ideas() {
    const all = LINK_IDEAS.slice();
    if (typeof MY_GAMES !== 'undefined') for (const [e, n, d, u] of MY_GAMES) all.push(['My games', e, n, u, '', d]);
    if (typeof COMIC_SITES !== 'undefined') for (const [e, n, d, u] of COMIC_SITES.slice(0, 5)) all.push(['Comics', e, n, u, '', d]);
    return all;
  },
  col: name => 'hsl(' + (hashStr(name.toLowerCase()) % 360) + ' 62% 50%)',
  has(url) { return this.get().some(l => l.url === url); },
  add([g, e, n, u, app]) { if (this.has(u)) return false; this.set(this.get().concat({ id: uid(), name: n, url: u, emoji: e, group: g, app: app || '' })); return true; },
  open(l) { if (!navigator.onLine) UI.toast('Websites need internet'); if (l.app) openOut(l.app, l.url); else window.open(l.url, '_blank', 'noopener'); },
  tile(name, emoji, onclick, extra) { return h('button', { class: 'lnk', onclick, 'aria-label': name }, h('span', { class: 'lg', style: { background: this.col(name) } }, emoji || name[0].toUpperCase(), extra || null), h('b', null, name)); },
  // a row of recommended apps/sites that open in one tap (used in Music and Videos)
  row(group, title) {
    const list = this.ideas().filter(x => x[0] === group);
    return h('div', null, h('div', { class: 'sec row nw', style: { justifyContent: 'space-between', alignItems: 'center' } }, h('span', null, title), h('button', { class: 'btn ghost sm', onclick: () => { Prefs.set('linkCat', group); Shell.go('links', 'recs'); } }, '＋ Save to Links')),
      h('div', { class: 'lrow' }, list.map(([g, e, n, u, app]) => this.tile(n, e, () => this.open({ url: u, app })))),
      h('p', { class: 'tiny muted', style: { margin: '0 2px 6px' } }, 'Opens the app if you have it, or the website. Needs internet.'));
  },
};
Apps.reg({
  id: 'links', name: 'Links', icon: '🔗', color: 'linear-gradient(135deg,#43CEA2,#185A9D)', group: 'tools', keys: 'bookmarks websites favorites urls shortcuts music video apps recommended', blurb: 'Your favorite websites and apps',
  mount(v, ctx) {
    const get = () => Links.get(), set = l => Links.set(l);
    function draw() {
      const y = scrollY; v.innerHTML = ''; const all = get(); ctx.setActions(h('button', { class: 'btn ghost sm', onclick: () => edit(null) }, '＋ Add'));
      const q = h('input', { type: 'search', placeholder: 'Search your links' }), box = h('div'), recs = h('div');
      if (all.length) v.append(h('div', { class: 'search mb' }, q));
      v.append(box, recs);
      const paint = () => {
        box.innerHTML = ''; const s = q.value.trim().toLowerCase(), list = all.filter(l => !s || (l.name + ' ' + l.url + ' ' + (l.group || '')).toLowerCase().includes(s));
        if (!all.length) box.append(UI.empty('🔗', 'No links yet', 'Tap any app below to add it — music, videos, your games and more. Or tap ＋ Add to paste your own.'));
        const groups = {}; for (const l of list) (groups[l.group || 'My links'] = groups[l.group || 'My links'] || []).push(l);
        for (const gname in groups) box.append(h('div', { class: 'sec' }, gname), h('div', { class: 'lgrid' }, groups[gname].map(l => onLongPress(Links.tile(l.name, l.emoji, () => Links.open(l)), () => edit(l)))));
        if (all.length) box.append(h('p', { class: 'tiny muted mt' }, 'Press and hold a link to change or delete it.'));
      };
      q.addEventListener('input', paint); paint(); paintRecs(recs); scrollTo(0, y);
    }
    // recommended links, by group: tap to add, tap again to open
    function paintRecs(el) {
      el.innerHTML = ''; const ideas = Links.ideas(); let cat = Prefs.get('linkCat', 'Music'); if (!LINK_CATS.some(c => c[0] === cat)) cat = 'Music';
      const chips = h('div', { class: 'chips', role: 'tablist' }), grid = h('div', { class: 'lgrid mt' }), addAll = h('button', { class: 'btn sm' }), note = h('p', { class: 'tiny muted', style: { margin: '10px 2px 0' } });
      const show = () => {
        chips.innerHTML = ''; for (const [c, e] of LINK_CATS) chips.append(h('button', { class: 'chip', role: 'tab', 'aria-pressed': String(c === cat), onclick: () => { cat = c; Prefs.set('linkCat', c); show(); } }, e + ' ' + c));
        const list = ideas.filter(x => x[0] === cat), left = list.filter(x => !Links.has(x[3]));
        grid.innerHTML = ''; for (const it of list) { const on = Links.has(it[3]); grid.append(Links.tile(it[2], it[1], () => { if (Links.has(it[3])) return Links.open({ url: it[3], app: it[4] }); Links.add(it); Sfx.good(); UI.toast('Added ' + it[2] + ' ✓'); draw(); }, h('span', { class: 'plus' + (on ? ' on' : '') }, on ? '✓' : '＋'))); }
        addAll.hidden = !left.length; addAll.textContent = '＋ Add all ' + left.length; addAll.onclick = () => { left.forEach(x => Links.add(x)); UI.toast('Added ' + left.length + ' links ✓'); draw(); };
        note.textContent = cat === 'My games' ? 'Your own games. Tap ＋ to keep them here.' : '＋ adds it to your links. ✓ means it’s already added — tap to open.';
      };
      show();
      el.append(h('div', { class: 'sec row nw', style: { justifyContent: 'space-between', alignItems: 'center' } }, h('span', null, '✨ Recommended for you'), addAll), h('div', { class: 'recbox' }, chips, grid, note));
      if (ctx.param === 'recs' && get().length) { ctx.param = null; setTimeout(() => el.scrollIntoView({ block: 'start' }), 60); }
    }
    function edit(l0) {
      const l = Object.assign({ name: '', url: '', emoji: '', group: '' }, l0 || {});
      const n = h('input', { type: 'text', value: l.name, placeholder: 'Name' }), u = h('input', { type: 'url', value: l.url, placeholder: 'https://…', autocapitalize: 'off' }), e = h('input', { type: 'text', value: l.emoji, placeholder: '🙂', maxlength: 4, style: { width: '70px', textAlign: 'center', fontSize: '22px' } }), gr = h('input', { type: 'text', value: l.group, placeholder: 'Group (optional, e.g. School)' });
      UI.sheet({ title: l0 ? 'Edit link' : 'Add a link', body: h('div', { class: 'stack' }, h('div', { class: 'row nw' }, e, n), u, gr, l0 ? h('button', { class: 'btn bad sm', onclick: ev => { set(get().filter(x => x.id !== l.id)); ev.target.closest('.scrim').remove(); draw(); } }, 'Delete link') : null),
        actions: [{ label: 'Cancel' }, { label: 'Save', cls: 'pri', onClick: c => { let url = u.value.trim(); if (!url) return UI.toast('Paste a web address'); if (!/^[a-z]+:/i.test(url)) url = 'https://' + url; const rec = Object.assign(l, { id: l.id || uid(), name: n.value.trim() || url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0], url, emoji: e.value.trim(), group: gr.value.trim() }); if (l0 && l0.url !== url) rec.app = ''; set(get().filter(x => x.id !== rec.id).concat(rec)); c(); draw(); } }] });
      if (!l0 && navigator.clipboard && navigator.clipboard.readText) navigator.clipboard.readText().then(t => { if (/^https?:\/\//.test(t) && !u.value) u.value = t.trim(); }).catch(() => { });
    }
    draw();
  },
});

/* ---- 38-wheel.js ---- */
/* ===== Spin Wheel: make wheels, spin to pick ===== */
addCSS(`
.wheelbox{position:relative;max-width:420px;margin:0 auto}
.wheelbox canvas{width:100%;aspect-ratio:1/1;display:block}
.wheelbox .ptr{position:absolute;left:50%;top:-6px;transform:translateX(-50%);width:0;height:0;border-left:18px solid transparent;border-right:18px solid transparent;border-top:34px solid #FF2E63;filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))}
.wheelbox .hub{position:absolute;left:50%;top:50%;width:76px;height:76px;margin:-38px 0 0 -38px;border-radius:50%;border:0;background:radial-gradient(circle at 35% 35%,#fff,#ddd);box-shadow:0 4px 12px rgba(0,0,0,.3);font-weight:900;font-size:17px;color:#222}
.winner{text-align:center;font-size:28px;font-weight:800;font-family:var(--round);min-height:42px;margin:12px 0 4px}
`);
const WHEEL_PRESETS = [
  ['🎲 Yes or No', ['Yes', 'No', 'Yes', 'No', 'Maybe', 'Ask again']],
  ['🍕 What to eat', ['Pizza', 'Tacos', 'Pasta', 'Burgers', 'Sushi', 'Noodles', 'Salad', 'Chicken']],
  ['🎮 Which game', ['Chess', 'Sudoku', 'Snake', 'Meteor Dash', 'Brick Smash', 'Sky Hopper', 'Memory Match', 'Four in a Row']],
  ['🧊 Cube practice', ['Sune', 'Antisune', 'T perm', 'Y perm', 'Ua perm', 'Ub perm', 'H perm', 'Z perm', 'Jb perm']],
  ['🔢 1 to 10', ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']],
  ['🧹 Chores', ['Dishes', 'Trash', 'Make bed', 'Vacuum', 'Laundry', 'Feed pet']],
  ['🎭 Truth or dare', ['Truth', 'Dare', 'Truth', 'Dare', 'Pass', 'Double dare']],
];
const WHEEL_COLORS = ['#FF595E', '#FFCA3A', '#8AC926', '#1982C4', '#6A4C93', '#FF924C', '#52A675', '#4267AC', '#B5A6C9', '#F15BB5'];
Apps.reg({
  id: 'wheel', name: 'Spin Wheel', icon: '🎡', color: 'linear-gradient(135deg,#F857A6,#FF5858)', group: 'play', keys: 'random picker decide spinner choose wheel', blurb: 'Spin to decide',
  mount(v, ctx) {
    let wheels = Prefs.get('wheels', null) || WHEEL_PRESETS.map(([n, o]) => ({ id: uid(), name: n, opts: o }));
    let cur = wheels.find(w => w.id === Prefs.get('wheelCur')) || wheels[0], ang = 0, spinning = false, raf = 0, removeWin = Prefs.get('wheelRemove', false);
    const saveW = () => Prefs.set('wheels', wheels);
    const cv = h('canvas', { width: 840, height: 840, 'aria-label': 'Wheel' }), g = cv.getContext('2d');
    const winEl = h('div', { class: 'winner', 'aria-live': 'polite' }), pickSel = h('select', { 'aria-label': 'Which wheel' }), hist = h('div', { class: 'chips', style: { justifyContent: 'center' } });
    const hub = h('button', { class: 'hub', onclick: () => spin() }, 'SPIN');
    const remB = h('button', { class: 'chip', 'aria-pressed': String(removeWin), onclick: () => { removeWin = !removeWin; Prefs.set('wheelRemove', removeWin); remB.setAttribute('aria-pressed', String(removeWin)); } }, '✂️ Remove the winner');
    v.append(h('div', { class: 'row nw mb' }, pickSel, h('button', { class: 'btn', onclick: () => edit(cur) }, 'Edit'), h('button', { class: 'btn', onclick: () => edit(null) }, '＋ New')),
      h('div', { class: 'wheelbox' }, cv, h('div', { class: 'ptr' }), hub), winEl, h('div', { class: 'row', style: { justifyContent: 'center' } }, h('button', { class: 'btn pri', style: { minWidth: '160px' }, onclick: () => spin() }, '🎡 Spin!'), remB), h('div', { class: 'sec center' }, 'Last spins'), hist);
    const opts = () => cur.live || cur.opts;
    function fillSel() { pickSel.innerHTML = ''; wheels.forEach(w => pickSel.append(h('option', { value: w.id, selected: w === cur }, w.name))); }
    pickSel.onchange = () => { cur = wheels.find(w => w.id === pickSel.value); cur.live = null; Prefs.set('wheelCur', cur.id); winEl.textContent = ''; draw(); };
    function draw() {
      const o = opts(), n = Math.max(1, o.length), R = 400, c = 420; g.clearRect(0, 0, 840, 840);
      g.save(); g.translate(c, c); g.rotate(ang);
      o.forEach((txt, i) => { const a0 = i / n * 6.2832 - Math.PI / 2 - Math.PI / n, a1 = a0 + 6.2832 / n; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, R, a0, a1); g.closePath(); g.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length]; g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 4; g.stroke();
        g.save(); g.rotate((a0 + a1) / 2); g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.font = '800 ' + Math.max(22, Math.min(44, 560 / n)) + 'px ' + getComputedStyle(document.body).fontFamily; g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 4; let t = String(txt); while (g.measureText(t).width > R - 110 && t.length > 3) t = t.slice(0, -2) + '…'; g.fillText(t, R - 26, 0); g.restore(); });
      g.restore(); g.beginPath(); g.arc(c, c, R, 0, 6.2832); g.lineWidth = 12; g.strokeStyle = '#222'; g.stroke();
    }
    function spin() {
      if (spinning) return; const o = opts(); if (o.length < 2) { UI.toast('Add at least 2 choices'); return; }
      spinning = true; winEl.textContent = '…'; Sfx.ctx(); const start = ang, target = start + 6.2832 * (5 + Math.random() * 3) + Math.random() * 6.2832, dur = 4200 + Math.random() * 1200, t0 = performance.now(); let lastTick = -1;
      const n = o.length, step = () => { const k = Math.min(1, (performance.now() - t0) / dur), e = 1 - Math.pow(1 - k, 4); ang = start + (target - start) * e; draw();
        const idx = Math.floor((((-ang / 6.2832) * n) % n + n + 0.5) % n); if (idx !== lastTick) { lastTick = idx; if (Prefs.get('sound', true)) Sfx.tone(900, 0.02, { type: 'square', vol: 0.04 }); }
        if (k < 1) raf = requestAnimationFrame(step); else done(); };
      const done = () => { spinning = false; const idx = Math.floor((((-ang / 6.2832) * n) % n + n + 0.5) % n) % n, win = o[idx]; winEl.textContent = '🎉 ' + win; Sfx.win();
        const H = Prefs.get('wheelHist', []); H.unshift(win); Prefs.set('wheelHist', H.slice(0, 12)); paintHist();
        if (removeWin) { cur.live = o.filter((_, i) => i !== idx); if (cur.live.length < 2) { cur.live = null; UI.toast('Everyone had a turn — wheel is full again'); } setTimeout(draw, 900); } };
      raf = requestAnimationFrame(step); setTimeout(() => { if (spinning) { ang = target; draw(); done(); } }, dur + 400);
    }
    function paintHist() { hist.innerHTML = ''; Prefs.get('wheelHist', []).forEach(x => hist.append(h('span', { class: 'chip' }, x))); }
    function edit(w0) {
      const w = w0 || { id: uid(), name: 'My wheel', opts: [] }, name = h('input', { type: 'text', value: w.name }), ta = h('textarea', { placeholder: 'One choice per line', style: { minHeight: '180px' } }); ta.value = w.opts.join('\n');
      UI.sheet({ title: w0 ? 'Edit wheel' : 'New wheel', body: h('div', { class: 'stack' }, h('label', { class: 'f' }, h('span', null, 'Name'), name), h('label', { class: 'f' }, h('span', null, 'Choices (one per line)'), ta), w0 && wheels.length > 1 ? h('button', { class: 'btn bad sm', onclick: e => { wheels = wheels.filter(x => x !== w); saveW(); cur = wheels[0]; e.target.closest('.scrim').remove(); fillSel(); draw(); } }, 'Delete this wheel') : null),
        actions: [{ label: 'Cancel' }, { label: 'Save', cls: 'pri', onClick: c => { const o = ta.value.split('\n').map(x => x.trim()).filter(Boolean).slice(0, 40); if (o.length < 2) return UI.toast('Add at least 2 choices'); w.name = name.value.trim() || 'My wheel'; w.opts = o; w.live = null; if (!w0) wheels.push(w); cur = w; Prefs.set('wheelCur', w.id); saveW(); c(); fillSel(); draw(); } }] });
    }
    fillSel(); draw(); paintHist();
    return () => cancelAnimationFrame(raf);
  },
});

/* ---- 39-fit-data.js ---- */
/* ===== Calisthenics data: moves, moving stick-figure demos, level ladders, workouts ===== */
/* Stick figure: side view, facing right, 100×100 box, floor at y=90.
   A pose gives the hip, a point the shoulders lean toward, the hands and the feet (ankles).
   Elbows and knees are found by 2-bone IK, so hands and feet stay planted while the body moves. */
const Fig = (() => {
  const G = 90, T = 24, UA = 12, FA = 12, TH = 15, SH = 15, HR = 5.5;
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]], len = v => Math.hypot(v[0], v[1]) || 0.001;
  function ik(A, P, l1, l2, s) {
    const v = sub(P, A), d = len(v), dd = clamp(d, Math.abs(l1 - l2) + 0.05, l1 + l2 - 0.05), base = Math.atan2(v[1], v[0]);
    const a = Math.acos(clamp((l1 * l1 + dd * dd - l2 * l2) / (2 * l1 * dd), -1, 1)), j = base + s * a;
    return [[A[0] + l1 * Math.cos(j), A[1] + l1 * Math.sin(j)], [A[0] + dd * Math.cos(base), A[1] + dd * Math.sin(base)]];
  }
  const two = x => x.length > 1 ? x : [x[0], x[0]], bend = (b, i, d) => b == null ? d : Array.isArray(b) ? b[i] : b;
  const lerpP = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  function mix(A, B, t) {
    const a2 = two(A.a), b2 = two(B.a), f2 = two(A.f), g2 = two(B.f), S = t < 0.5 ? A : B;
    return { h: lerpP(A.h, B.h, t), s: lerpP(A.s, B.s, t), a: [lerpP(a2[0], b2[0], t), lerpP(a2[1], b2[1], t)], f: [lerpP(f2[0], g2[0], t), lerpP(f2[1], g2[1], t)], eb: S.eb, kb: S.kb, toe: S.toe };
  }
  // where every joint is for a pose
  function solve(p) {
    const hip = p.h, dv = sub(p.s, hip), dl = len(dv), u = [dv[0] / dl, dv[1] / dl], sh = [hip[0] + u[0] * T, hip[1] + u[1] * T];
    let head = [sh[0] + u[0] * (HR + 2), sh[1] + u[1] * (HR + 2)]; head[1] = Math.min(head[1], G - HR - 0.5);
    const arms = two(p.a).map((t, i) => { const [el, ha] = ik(sh, t, UA, FA, bend(p.eb, i, 1)); return [sh, el, ha]; });
    const legs = two(p.f).map((t, i) => {
      const [kn, an] = ik(hip, t, TH, SH, bend(p.kb, i, -1)); let toe;
      if (p.toe) toe = [an[0] + p.toe[0], an[1] + p.toe[1]];
      else { const dy = G - an[1]; toe = dy < 0.6 ? [an[0] + 5, G] : dy < 5 ? [an[0] + Math.sqrt(25 - dy * dy), G] : [an[0] + 4, an[1] + 2]; }
      return [hip, kn, an, toe];
    });
    return { hip, sh, head, arms, legs };
  }
  const pts = a => a.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  function propSvg(list) {
    return (list || []).map(([k, ...v]) => k === 'r' ? '<rect x="' + v[0] + '" y="' + v[1] + '" width="' + v[2] + '" height="' + v[3] + '" rx="1.5" fill="var(--fig-prop)"/>'
      : '<line x1="' + v[0] + '" y1="' + v[1] + '" x2="' + v[2] + '" y2="' + v[3] + '" stroke="var(--fig-prop' + (v[4] > 2.5 ? '-dark' : '') + ')" stroke-width="' + (v[4] || 2) + '" stroke-linecap="round"/>').join('');
  }
  const ease = t => t * t * (3 - 2 * t);
  // make a figure. anim = key in ANIMS. Returns {el, stop}
  // the part of the 100×100 box the figure and its props really use, so low moves aren't tiny
  function box(A) {
    let y0 = G; for (const p of A.k) { const j = solve(p); y0 = Math.min(y0, j.head[1] - HR, ...j.arms.flat().map(q => q[1]), ...j.legs.flat().map(q => q[1])); }
    for (const [k, ...v] of A.p || []) y0 = Math.min(y0, k === 'r' ? v[1] : Math.min(v[1], v[3]));
    y0 = clamp(Math.floor(y0 - 6), 0, 58); return '0 ' + y0 + ' 100 ' + (96 - y0);
  }
  function make(anim, { still = false, cls = 'fig', tempo, crop = false } = {}) {
    const A = ANIMS[anim] || ANIMS.stand, K = A.k, D = tempo || A.d || K.map(() => 1);
    const svg = h('div', { class: cls, html: '<svg viewBox="0 0 100 100" aria-hidden="true"><line x1="2" y1="' + (G + 0.8) + '" x2="98" y2="' + (G + 0.8) + '" stroke="var(--fig-floor)" stroke-width="1.6" stroke-linecap="round"/>' + propSvg(A.p) +
      '<g fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline class="lf" stroke="var(--fig-far)" stroke-width="3.4"/><polyline class="af" stroke="var(--fig-far)" stroke-width="3.2"/><polyline class="tr" stroke="var(--fig-ink)" stroke-width="4.2"/><polyline class="ln" stroke="var(--fig-ink)" stroke-width="3.6"/><polyline class="an" stroke="var(--fig-ink)" stroke-width="3.4"/></g><circle class="hd" r="' + HR + '" fill="var(--fig-ink)"/></svg>' });
    if (crop) svg.firstChild.setAttribute('viewBox', A.box || (A.box = box(A)));
    const q = s => svg.querySelector(s), lf = q('.lf'), af = q('.af'), tr = q('.tr'), ln = q('.ln'), an = q('.an'), hd = q('.hd');
    const draw = p => { const j = solve(p); lf.setAttribute('points', pts(j.legs[1])); af.setAttribute('points', pts(j.arms[1])); tr.setAttribute('points', pts([j.hip, j.sh])); ln.setAttribute('points', pts(j.legs[0])); an.setAttribute('points', pts(j.arms[0])); hd.setAttribute('cx', j.head[0].toFixed(1)); hd.setAttribute('cy', j.head[1].toFixed(1)); };
    const total = D.reduce((a, b) => a + b, 0) * 1000; let raf = 0, t0 = performance.now(), on = !still && K.length > 1;
    const frame = now => {
      if (!svg.isConnected && now - t0 > 2000) { on = false; return; }
      let t = (now - t0) % total, i = 0; while (t > D[i] * 1000 && i < K.length - 1) { t -= D[i] * 1000; i++; }
      draw(mix(K[i], K[(i + 1) % K.length], ease(clamp(t / (D[i] * 1000), 0, 1)))); if (on) raf = requestAnimationFrame(frame);
    };
    draw(K[still && A.show != null ? A.show : 0]); if (on) raf = requestAnimationFrame(frame);
    return { el: svg, stop() { on = false; cancelAnimationFrame(raf); } };
  }
  return { make, solve, G };
})();
// props: ['l', x1,y1,x2,y2,width] line, ['r', x,y,w,h] box
const BAR = [['l', 28, 10, 28, 90, 1.6], ['l', 72, 10, 72, 90, 1.6], ['l', 22, 10, 78, 10, 3.2]];
const STAND = { h: [50, 60], s: [50, 36], a: [[52, 59], [49, 59]], f: [[52, 90], [49, 90]] };
const PUSH_UP = { h: [49.7, 75.6], s: [71.9, 66.5], a: [[73, 90]], f: [[22, 87]] }, PUSH_DOWN = { h: [51.9, 84.1], s: [75.8, 81.8], a: [[73, 90]], f: [[22, 87]] };
const SQUAT_LOW = { h: [38, 74], s: [50, 53], a: [[73, 50], [72, 52]], f: [[52, 90], [50, 90]] };
const HANG = { h: [50, 58], s: [51, 34], a: [[53, 10], [50, 10]], f: [[40, 80], [42, 81]], eb: 1 };
const ANIMS = {
  stand: { k: [STAND] },
  squat: { k: [{ h: [50, 60], s: [51, 36], a: [[75, 38], [74, 40]], f: [[52, 90], [50, 90]] }, SQUAT_LOW], d: [1.1, 1.1] },
  jumpsquat: { k: [SQUAT_LOW, { h: [50, 50], s: [51, 26], a: [[54, 2], [51, 2]], f: [[52, 80], [50, 80]] }], d: [0.45, 0.65] },
  lunge: { k: [{ h: [50, 60], s: [50, 36], a: [[52, 59]], f: [[52, 90], [49, 90]] }, { h: [48, 73], s: [48, 49], a: [[51, 72]], f: [[66, 90], [30, 90]] }], d: [1.1, 1.1] },
  calf: { k: [STAND, { h: [50, 56], s: [50, 32], a: [[52, 55], [49, 55]], f: [[52, 86], [49, 86]] }], d: [0.9, 1.1] },
  bridge: { k: [{ h: [46, 85], s: [22, 85], a: [[46.2, 88]], f: [[64, 90]] }, { h: [44, 71], s: [22, 85], a: [[46.2, 88]], f: [[64, 90]] }], d: [1.1, 1.1] },
  wallsit: { p: [['r', 18, 20, 13, 70], ['l', 31, 20, 31, 90, 1.4]], k: [{ h: [37, 72], s: [36, 48], a: [[50, 71]], f: [[54, 90], [52, 90]] }, { h: [37, 72.6], s: [36.3, 48.5], a: [[50, 71.5]], f: [[54, 90], [52, 90]] }], d: [1.6, 1.6] },
  pushup: { k: [PUSH_UP, PUSH_DOWN], d: [1.1, 1] },
  kneepush: { k: [{ h: [52, 79], s: [72, 65.8], a: [[72, 90]], f: [[30, 79]], toe: [3, -2] }, { h: [55, 86], s: [78.3, 80.2], a: [[72, 90]], f: [[30, 79]], toe: [3, -2] }], d: [1.1, 1] },
  wallpush: { p: [['r', 81, 8, 17, 82], ['l', 81, 8, 81, 90, 1.4]], k: [{ h: [50, 61.7], s: [58, 39], a: [[81, 37], [81, 39]], f: [[40, 90]] }, { h: [54.9, 64], s: [66.8, 43.2], a: [[81, 37], [81, 39]], f: [[40, 90]] }], d: [1.1, 1] },
  inclinepush: { p: [['r', 62, 73, 24, 3], ['l', 64, 76, 64, 90, 1.6], ['l', 84, 76, 84, 90, 1.6]], k: [{ h: [51.2, 66.1], s: [68, 49], a: [[68, 73]], f: [[30.2, 87.5]] }, { h: [56.7, 73.4], s: [77.9, 62.1], a: [[68, 73]], f: [[30.2, 87.5]] }], d: [1.1, 1] },
  pike: { k: [{ h: [34, 58.5], s: [52, 74], a: [[70, 90]], f: [[30, 88]] }, { h: [42, 62], s: [62, 78], a: [[70, 90]], f: [[30, 88]] }], d: [1.2, 1.1] },
  benchdip: { p: [['r', 26, 70, 20, 3], ['l', 28, 73, 28, 90, 1.6], ['l', 44, 73, 44, 90, 1.6]], k: [{ h: [48, 70], s: [46, 46], a: [[44, 70]], f: [[68, 90]] }, { h: [49, 82], s: [47, 58], a: [[44, 70]], f: [[68, 90]] }], d: [1.1, 1.1] },
  dip: { p: [['l', 38, 64, 38, 90, 1.6], ['l', 64, 64, 64, 90, 1.6], ['l', 34, 63.5, 68, 63.5, 3.2]], k: [{ h: [50, 62], s: [51, 38], a: [[52, 62], [50, 62]], f: [[40, 84], [42, 85]] }, { h: [47, 74], s: [53, 51], a: [[52, 62], [50, 62]], f: [[38, 88], [40, 88]] }], d: [1.1, 1.2] },
  hang: { p: BAR, k: [HANG, Object.assign({}, HANG, { h: [50.4, 58.4], f: [[40.6, 80.4], [42.5, 81.4]] })], d: [1.6, 1.6] },
  scap: { p: BAR, k: [HANG, { h: [50, 55], s: [51, 31], a: [[53, 10], [50, 10]], f: [[40, 77], [42, 78]], eb: 1 }], d: [0.9, 1] },
  pullup: { p: BAR, k: [HANG, { h: [48, 39], s: [48, 15], a: [[56, 10], [53, 10]], f: [[38, 61], [40, 62]], eb: 1 }], d: [1.1, 1.3] },
  hangknee: { p: BAR, k: [Object.assign({}, HANG, { f: [[51, 87], [49, 87]] }), Object.assign({}, HANG, { f: [[60, 62], [58, 63]] })], d: [1, 1.1] },
  row: { p: [['l', 82, 55, 82, 90, 1.6], ['l', 58, 55, 86, 55, 3.2]], k: [{ h: [53.4, 81.9], s: [77, 77], a: [[70, 55], [68, 55]], f: [[24, 88]], eb: -1 }, { h: [50.3, 73.5], s: [71, 62], a: [[70, 55], [68, 55]], f: [[24, 88]], eb: -1 }], d: [1, 1.2] },
  plank: { k: [{ h: [42.5, 81.4], s: [66, 77], a: [[78, 89]], f: [[13, 87]] }, { h: [42.5, 82], s: [66, 77.2], a: [[78, 89]], f: [[13, 87]] }], d: [1.6, 1.6] },
  hollow: { k: [{ h: [50, 88], s: [28, 82], a: [[4, 75]], f: [[79, 80]], toe: [4, -1] }, { h: [50, 88], s: [28, 81], a: [[4, 73.5]], f: [[79, 78.6]], toe: [4, -1] }], d: [1.6, 1.6] },
  legraise: { k: [{ h: [50, 87], s: [26, 87], a: [[50, 88.6]], f: [[80, 88]], toe: [4, -2] }, { h: [50, 87], s: [26, 87], a: [[50, 88.6]], f: [[52, 57]], toe: [4, -1] }], d: [1.2, 1.6] },
  superman: { k: [{ h: [48, 87], s: [72, 85], a: [[94, 79]], f: [[20, 82]], toe: [-4, 1] }, { h: [48, 87], s: [72, 84], a: [[94, 76]], f: [[20, 79]], toe: [-4, 1] }], d: [1.3, 1.3] },
  lsit: { p: [['l', 44, 81, 44, 90, 1.6], ['l', 56, 81, 56, 90, 1.6], ['l', 41, 80.5, 59, 80.5, 3.2]], k: [{ h: [49, 80], s: [50, 56], a: [[51, 80], [49, 80]], f: [[60, 82]], toe: [4, 0] }, { h: [49, 79.5], s: [50, 55.6], a: [[51, 80], [49, 80]], f: [[60, 81]], toe: [4, 0] }], d: [1.5, 1.5] },
  handstand: { p: [['r', 61, 2, 37, 88], ['l', 61, 2, 61, 90, 1.4]], k: [{ h: [55, 42], s: [54, 66], a: [[54, 90], [52, 90]], f: [[57, 12]], toe: [3, -3] }, { h: [55.4, 42], s: [54.2, 66], a: [[54, 90], [52, 90]], f: [[57.5, 12]], toe: [3, -3] }], d: [1.4, 1.4] },
  climber: { k: [{ h: [49.7, 75.6], s: [71.9, 66.5], a: [[73, 90]], f: [[52, 84], [22, 87]] }, { h: [49.7, 75.6], s: [71.9, 66.5], a: [[73, 90]], f: [[22, 87], [52, 84]] }], d: [0.38, 0.38] },
  highknee: { k: [{ h: [50, 59], s: [51, 35], a: [[43, 55], [63, 44]], f: [[56, 73], [51, 89]] }, { h: [50, 59], s: [51, 35], a: [[63, 44], [43, 55]], f: [[51, 89], [56, 73]] }], d: [0.34, 0.34] },
  armcircle: { k: [0, 45, 90, 135, 180, 225, 270, 315].map(g => { const r = g * Math.PI / 180, x = 50 + 24 * Math.cos(r), y = 36 + 24 * Math.sin(r); return { h: [50, 60], s: [50, 36], a: [[x, y], [x - 1, y]], f: [[52, 90], [49, 90]] }; }), d: [0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3] },
  burpee: { k: [STAND, { h: [38, 76], s: [57, 64], a: [[62, 88], [60, 88]], f: [[52, 90], [50, 90]] }, PUSH_UP, { h: [38, 76], s: [57, 64], a: [[62, 88], [60, 88]], f: [[52, 90], [50, 90]] }, STAND, { h: [50, 50], s: [51, 26], a: [[54, 2], [51, 2]], f: [[52, 80], [50, 80]] }], d: [0.5, 0.45, 0.5, 0.45, 0.35, 0.45] },
};
// which frame to show in still pictures
Object.assign(ANIMS.lunge, { show: 1 }); Object.assign(ANIMS.bridge, { show: 1 }); Object.assign(ANIMS.legraise, { show: 1 }); Object.assign(ANIMS.burpee, { show: 2 }); Object.assign(ANIMS.squat, { show: 1 }); Object.assign(ANIMS.dip, { show: 1 }); Object.assign(ANIMS.benchdip, { show: 1 }); Object.assign(ANIMS.hangknee, { show: 1 }); Object.assign(ANIMS.highknee, { show: 0 }); Object.assign(ANIMS.armcircle, { show: 2 });
// moves: id, name, emoji, demo, unit (reps|sec), works, kind, how-to steps, tip, needs a pull-up bar
const FIT_EX = {};
[
  ['wallpush', 'Wall push-up', '🧱', 'wallpush', 'reps', 'Chest, arms', 'push', ['Stand an arm’s length from a wall.', 'Put your hands flat on the wall at shoulder height.', 'Bend your elbows and bring your chest toward the wall.', 'Push back until your arms are straight.'], 'Keep your body straight like a board.'],
  ['inclinepush', 'Incline push-up', '📐', 'inclinepush', 'reps', 'Chest, arms', 'push', ['Put your hands on a bench, bed edge or sturdy table.', 'Walk your feet back so your body is straight.', 'Lower your chest to the edge.', 'Push back up.'], 'The lower the surface, the harder it gets.'],
  ['kneepush', 'Knee push-up', '🦵', 'kneepush', 'reps', 'Chest, arms, core', 'push', ['Get in a push-up with your knees on the floor.', 'Hands a little wider than your shoulders.', 'Lower your chest close to the floor.', 'Push back up. Keep your hips in line with your back.'], 'Put a towel under your knees.'],
  ['pushup', 'Push-up', '💪', 'pushup', 'reps', 'Chest, arms, core', 'push', ['Hands under your shoulders, body straight from head to heels.', 'Lower your chest until it almost touches the floor.', 'Elbows go back at an angle, not straight out to the sides.', 'Push the floor away until your arms are straight.'], 'Squeeze your belly and bottom so your hips don’t sag.'],
  ['diamond', 'Diamond push-up', '💎', 'pushup', 'reps', 'Back of arms, chest', 'push', ['Touch your thumbs and pointer fingers together to make a diamond under your chest.', 'Keep your body straight.', 'Lower your chest to your hands.', 'Push back up.'], 'Harder than a normal push-up — great for arms.'],
  ['pike', 'Pike push-up', '🔺', 'pike', 'reps', 'Shoulders', 'push', ['Make an upside-down V: hips high, hands and feet on the floor.', 'Bend your elbows and lower the top of your head toward the floor.', 'Push back up.'], 'This builds up to handstand push-ups.'],
  ['benchdip', 'Bench dip', '🪑', 'benchdip', 'reps', 'Back of arms, shoulders', 'push', ['Sit on the edge of a sturdy chair or bench, hands next to your hips.', 'Slide your bottom off, legs out in front.', 'Bend your elbows to lower down.', 'Push back up until your arms are straight.'], 'Keep your back close to the bench.'],
  ['dip', 'Dip', '⬇️', 'dip', 'reps', 'Arms, chest, shoulders', 'push', ['Hold yourself up on parallel bars (or two sturdy chairs) with straight arms.', 'Lean forward a little and bend your elbows.', 'Go down until your shoulders are a bit below your elbows.', 'Push back up.'], 'Go slowly on the way down.'],
  ['hang', 'Dead hang', '🙌', 'hang', 'sec', 'Grip, shoulders', 'pull', ['Grab the bar with your hands a bit wider than your shoulders.', 'Hang with straight arms, feet off the floor.', 'Breathe and hold on.'], 'Great for grip and shoulders.', 1],
  ['scap', 'Scapular pull', '🦅', 'scap', 'reps', 'Upper back', 'pull', ['Hang from the bar with straight arms.', 'Pull your shoulders down, away from your ears. Arms stay straight.', 'Your body rises a little. Relax back to the hang.'], 'A small move that really helps your first pull-up.', 1],
  ['row', 'Australian row', '🦘', 'row', 'reps', 'Back, biceps', 'pull', ['Lie under a sturdy table or low bar and grab the edge.', 'Keep your body straight, heels on the floor.', 'Pull your chest up to the edge.', 'Lower slowly.'], 'No bar? A strong table works — ask an adult to check it won’t tip.'],
  ['negpull', 'Negative pull-up', '🐢', 'pullup', 'reps', 'Back, biceps', 'pull', ['Jump or step up so your chin is over the bar.', 'Lower yourself as slowly as you can — count to 5.', 'Drop down and repeat.'], 'Going down slowly builds pull-up strength fast.', 1, [0.7, 3.4]],
  ['chinup', 'Chin-up', '🧗', 'pullup', 'reps', 'Biceps, back', 'pull', ['Grab the bar with palms facing you, shoulder-width apart.', 'Pull until your chin goes over the bar.', 'Lower all the way down with control.'], 'Usually a bit easier than a pull-up.', 1],
  ['pullup', 'Pull-up', '🏆', 'pullup', 'reps', 'Back, biceps, grip', 'pull', ['Grab the bar with palms facing away, a bit wider than your shoulders.', 'Pull your chest toward the bar until your chin is over it.', 'Lower all the way down to straight arms.'], 'No swinging — squeeze your belly.', 1],
  ['superman', 'Superman', '🦸', 'superman', 'sec', 'Back', 'pull', ['Lie on your belly with your arms forward.', 'Lift your arms, chest and legs off the floor.', 'Hold like you are flying.'], 'Look at the floor, not up.'],
  ['wallsit', 'Wall sit', '🧱', 'wallsit', 'sec', 'Legs', 'legs', ['Lean your back on a wall.', 'Slide down until your knees bend like a chair.', 'Hold and breathe.'], 'Keep your knees above your ankles.'],
  ['squat', 'Squat', '🪑', 'squat', 'reps', 'Legs, bottom', 'legs', ['Feet shoulder-width apart, toes a little out.', 'Push your hips back and bend your knees, like sitting in a chair.', 'Go down until your thighs are flat (or as low as is comfy).', 'Stand back up.'], 'Heels stay down, chest stays up.'],
  ['lunge', 'Lunge', '🚶', 'lunge', 'reps', 'Legs, bottom', 'legs', ['Stand tall with your hands on your hips.', 'Take a big step forward.', 'Lower your back knee toward the floor.', 'Push back up and switch legs.'], 'Each leg counts as one rep.'],
  ['jumpsquat', 'Jump squat', '🚀', 'jumpsquat', 'reps', 'Legs, power', 'legs', ['Squat down.', 'Jump up as high as you can with your arms up.', 'Land softly and go straight into the next squat.'], 'Land quietly, like a ninja.'],
  ['calf', 'Calf raise', '🩰', 'calf', 'reps', 'Calves', 'legs', ['Stand tall (hold a wall for balance).', 'Rise up onto your toes.', 'Lower your heels slowly.'], 'Try one leg at a time to make it harder.'],
  ['bridge', 'Glute bridge', '🌉', 'bridge', 'reps', 'Bottom, lower back', 'legs', ['Lie on your back, knees bent, feet flat.', 'Push through your heels and lift your hips.', 'Squeeze at the top, then lower.'], 'Don’t push with your neck.'],
  ['plank', 'Plank', '📏', 'plank', 'sec', 'Core', 'core', ['Forearms on the floor, elbows under your shoulders.', 'Body straight from head to heels.', 'Squeeze your belly and hold.'], 'Don’t let your hips sag or stick up.'],
  ['legraise', 'Leg raise', '🦿', 'legraise', 'reps', 'Lower belly', 'core', ['Lie on your back, legs straight, hands by your sides.', 'Lift your legs up to point at the ceiling.', 'Lower them slowly without touching the floor.'], 'Keep your lower back pressed down.'],
  ['hollow', 'Hollow hold', '🍌', 'hollow', 'sec', 'Core', 'core', ['Lie on your back.', 'Press your lower back into the floor.', 'Lift your arms, shoulders and legs a little off the floor.', 'Hold like a banana.'], 'Bend your knees if it’s too hard.'],
  ['hangknee', 'Hanging knee raise', '🎋', 'hangknee', 'reps', 'Core, grip', 'core', ['Hang from the bar.', 'Pull your knees up toward your chest.', 'Lower them slowly without swinging.'], 'Slow and steady beats fast and swingy.', 1],
  ['lsit', 'Tuck L-sit', '🪜', 'lsit', 'sec', 'Core, arms', 'core', ['Put your hands on two sturdy handles, thick books or the floor beside your hips.', 'Push down with straight arms to lift your bottom.', 'Pull your knees up to your chest and hold.'], 'Even 5 seconds is a great start.'],
  ['handstand', 'Wall handstand', '🤸', 'handstand', 'sec', 'Shoulders, balance', 'skill', ['Put your hands on the floor close to a wall.', 'Walk your feet up the wall, chest facing the wall.', 'Hold with straight arms and a tight belly.', 'Walk back down slowly.'], 'Only on a soft floor with space around you. Ask someone to spot you the first time.'],
  ['climber', 'Mountain climbers', '⛰️', 'climber', 'sec', 'Core, heart', 'cardio', ['Start at the top of a push-up.', 'Drive one knee toward your chest, then switch fast.', 'Keep your hips low.'], 'Like running, but on your hands.'],
  ['highknee', 'High knees', '🏃', 'highknee', 'sec', 'Heart, legs', 'cardio', ['Run in place.', 'Lift your knees up to hip height.', 'Pump your arms.'], ''],
  ['armcircle', 'Arm circles', '🔄', 'armcircle', 'sec', 'Shoulders (warm-up)', 'cardio', ['Hold your arms straight.', 'Make big slow circles forward, then backward.'], ''],
  ['burpee', 'Burpee', '🔥', 'burpee', 'reps', 'Whole body', 'cardio', ['Squat down and put your hands on the floor.', 'Jump your feet back to a push-up position.', 'Jump your feet back in.', 'Jump up with your arms high.'], 'Go at your own speed.'],
].forEach(([id, n, e, anim, unit, works, kind, how, tip, bar, tempo]) => { FIT_EX[id] = { id, n, e, anim, unit, works, kind, how, tip, bar: !!bar, tempo }; });
// level ladders: [move, sets, goal reps (or seconds)] — hit the goal on every set to move up
const FIT_LADDERS = [
  { id: 'push', n: 'Push', e: '💪', steps: [['wallpush', 3, 15], ['inclinepush', 3, 12], ['kneepush', 3, 12], ['pushup', 3, 10], ['diamond', 3, 10], ['pike', 3, 10]] },
  { id: 'pull', n: 'Pull', e: '🧗', steps: [['hang', 3, 30], ['scap', 3, 10], ['row', 3, 12], ['negpull', 3, 5], ['chinup', 3, 6], ['pullup', 3, 8]], nobar: [['superman', 3, 20], ['row', 3, 10], ['row', 4, 15]] },
  { id: 'legs', n: 'Legs', e: '🦵', steps: [['wallsit', 3, 30], ['squat', 3, 15], ['lunge', 3, 16], ['jumpsquat', 3, 15]] },
  { id: 'core', n: 'Core', e: '🍫', steps: [['plank', 3, 30], ['legraise', 3, 12], ['hollow', 3, 30], ['hangknee', 3, 10], ['lsit', 3, 15]] },
  { id: 'dips', n: 'Dips', e: '⬇️', steps: [['benchdip', 3, 10], ['dip', 3, 8]] },
  { id: 'hand', n: 'Handstand', e: '🤸', steps: [['plank', 3, 40], ['pike', 3, 8], ['handstand', 3, 20]] },
];
// '@slot' = your level on that ladder, '@slot-1' = one step easier, 'move:target' = fixed
const FIT_WORKOUTS = [
  { id: 'full', n: 'Full body', e: '⚡', d: 'Push, pull, legs and core', rounds: 3, warm: true, items: ['@push', '@pull', '@legs', '@core'] },
  { id: 'upper', n: 'Upper body', e: '💪', d: 'Push, pull and dips', rounds: 3, warm: true, items: ['@push', '@pull', '@dips', '@push-1'] },
  { id: 'lower', n: 'Legs & core', e: '🦵', d: 'Legs, bottom and belly', rounds: 3, warm: true, items: ['@legs', 'bridge:15', '@core', 'calf:20'] },
  { id: 'hiit', n: '7-minute sweat', e: '🔥', d: '40 s go, 20 s rest — as many as you can', rounds: 1, hiit: [40, 20], items: ['highknee', 'squat', 'climber', '@push', 'jumpsquat', 'plank', 'burpee'] },
  { id: 'coreb', n: 'Core blast', e: '🍫', d: 'Belly and back', rounds: 2, items: ['plank:30', 'legraise:12', 'hollow:20', 'superman:20', 'climber:30'] },
  { id: 'hand', n: 'Handstand practice', e: '🤸', d: 'Shoulders and balance', rounds: 3, warm: true, items: ['@hand', 'pike:8'] },
  { id: 'warm', n: '5-minute warm-up', e: '🌤️', d: 'Get loose before anything', rounds: 1, rest: 10, items: ['armcircle:30', 'highknee:30', 'squat:10', 'climber:20', 'calf:15'] },
];
const FIT_START = { // quick level picks
  new: { push: 'inclinepush', pull: 'hang', pullNB: 'superman', legs: 'squat', core: 'plank', dips: 'benchdip', hand: 'plank' },
  some: { push: 'pushup', pull: 'negpull', pullNB: 'row', legs: 'lunge', core: 'legraise', dips: 'benchdip', hand: 'pike' },
  strong: { push: 'diamond', pull: 'pullup', pullNB: 'row', legs: 'jumpsquat', core: 'hollow', dips: 'dip', hand: 'handstand' },
};

/* ---- 39-fit.js ---- */
/* ===== Calisthenics: find your level, follow-along workouts, level ladders, progress ===== */
addCSS(`
:root{--fig-ink:var(--ink);--fig-far:rgba(128,132,150,.55);--fig-floor:var(--line);--fig-prop:rgba(128,132,150,.2);--fig-prop-dark:rgba(128,132,150,.85)}
.fig svg{display:block;width:100%;height:auto}
.fig-white{--fig-ink:#fff;--fig-far:rgba(255,255,255,.55);--fig-floor:rgba(255,255,255,.45);--fig-prop:rgba(255,255,255,.22);--fig-prop-dark:rgba(255,255,255,.75)}
.ftoday{background:linear-gradient(135deg,#FF5F6D,#FF9A5A 60%,#FFC371);color:#fff;border-radius:22px;padding:16px;box-shadow:var(--shadow);display:flex;gap:12px;align-items:center}
.ftoday .fig{width:116px;flex:0 0 auto}
.ftoday .k{font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;opacity:.9}
.ftoday h3{margin:2px 0 4px;font-size:24px;font-family:var(--round)}
.ftoday p{margin:0 0 10px;font-size:14px;opacity:.95}
.ftoday .btn{background:#fff;color:#E2364B;border:0;font-weight:800}
.fkinds{flex-wrap:nowrap!important;overflow-x:auto;scrollbar-width:none;padding-bottom:4px}
.fkinds::-webkit-scrollbar{display:none}
.fkinds .chip{flex:0 0 auto;white-space:nowrap}
.fittabs{gap:4px}.fittabs button{padding-left:10px!important;padding-right:10px!important;flex:1 1 auto}
.mgrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
@media (min-width:640px){.fkinds{flex-wrap:nowrap!important;overflow-x:auto;scrollbar-width:none;padding-bottom:4px}
.fkinds::-webkit-scrollbar{display:none}
.fkinds .chip{flex:0 0 auto;white-space:nowrap}
.mgrid{grid-template-columns:repeat(5,minmax(0,1fr))}}
.mcard{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:4px 6px 10px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:1px;color:var(--ink);min-width:0}
.mcard .fig{width:100%}
.mcard b{font-size:13px;line-height:1.2}
.mcard small{font-size:11px;color:var(--muted);line-height:1.2}
.ldr{background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:12px;margin-bottom:12px}
.ldr h4{margin:0 0 6px;font-size:17px;display:flex;align-items:center;gap:8px}
.ldr h4 small{margin-left:auto;font-size:13px;color:var(--muted);font-weight:600}
.stp{display:flex;align-items:center;gap:10px;padding:4px 8px;border-radius:14px;width:100%;border:0;background:none;text-align:left;color:var(--ink)}
.stp .fig{width:54px;flex:0 0 auto}
.stp .t{flex:1;min-width:0}.stp .t b{display:block;font-size:15px}.stp .t small{color:var(--muted);font-size:13px}
.stp.cur{background:var(--accent-soft)}
.stp.lock{opacity:.5}
.stp .st{font-size:18px}
.fstats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.fstat{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:12px 14px}
.fstat b{display:block;font-size:28px;font-family:var(--round);line-height:1.1}
.fstat small{color:var(--muted);font-size:13px}
.fcal{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px}
.fcal span{aspect-ratio:1/1;border-radius:9px;background:var(--surface2);display:grid;place-items:center;font-size:12px;color:var(--muted);font-weight:600}
.fcal span.h{background:none;aspect-ratio:auto;font-weight:800}
.fcal span.fon{background:linear-gradient(135deg,#FF5F6D,#FFC371);color:#fff;font-weight:800}
.fcal span.ftd{box-shadow:inset 0 0 0 2px var(--accent)}
.fcal span.fut{opacity:.35}
.fplay{position:fixed;inset:0;z-index:45;background:var(--bg);color:var(--ink);display:flex;flex-direction:column;padding:calc(env(safe-area-inset-top) + 8px) 16px calc(env(safe-area-inset-bottom) + 14px);overflow-y:auto;--ring-bg:var(--surface2);--ring-fg:var(--accent)}
.fplay.rest{background:linear-gradient(180deg,#0E7C66,#0B4F6C);color:#fff;--ring-bg:rgba(255,255,255,.22);--ring-fg:#fff}
.fplay.rest .ib{color:#fff}.fplay.rest .prog{background:rgba(255,255,255,.25)}.fplay.rest .prog i{background:#fff}
.fplay.done{background:linear-gradient(180deg,#5B3CC4,#E2364B);color:#fff}
.ftop{display:flex;align-items:center;gap:10px}
.ftop .prog{flex:1}
.fname{font-size:27px;font-weight:800;text-align:center;font-family:var(--round);line-height:1.15;margin-top:2px}
.fsub{text-align:center;opacity:.75;font-weight:600;font-size:15px;min-height:20px}
.fbig{font-size:84px;font-weight:800;text-align:center;line-height:1;font-variant-numeric:tabular-nums;font-family:var(--round);min-width:120px}
.fplay .fig{width:100%;max-width:min(380px,92vw);margin:0 auto}
.fplay .fig svg{max-height:40vh}
.fplay .fig.mid{max-width:min(320px,80vw)}
.fplay .fig.mid svg{max-height:30vh}
.fplay .fig.sm{max-width:min(220px,56vw)}
.fplay .fig.sm svg{max-height:22vh}
.fctl{display:flex;gap:10px;justify-content:center;align-items:center;flex-wrap:wrap;margin-top:auto;padding-top:14px}
.fdone{min-width:190px;min-height:58px;font-size:20px!important}
.fadj{display:flex;align-items:center;justify-content:center;gap:16px;margin-top:6px}
.fadj .btn{width:58px;height:58px;border-radius:50%;font-size:28px;padding:0}
.fring{position:relative;width:min(220px,54vw);margin:6px auto 0}
.fring svg{display:block;width:100%}
.fring .rg{transition:stroke-dashoffset 1s linear}
.fring .fbig{position:absolute;inset:0;display:grid;place-items:center;font-size:62px}
.fdonebox{text-align:center;margin:auto 0}
.fdonebox .big{font-size:76px;line-height:1.2;padding-top:6px}
.fdonebox h2{font-size:32px;margin:8px 0 14px;font-family:var(--round)}
.fdonebox .fstats{max-width:420px;margin:0 auto}
.fdonebox .fstat{background:rgba(255,255,255,.16);border-color:rgba(255,255,255,.25);color:#fff}
.fdonebox .fstat small{color:rgba(255,255,255,.85)}
.fwin{background:rgba(255,255,255,.18);border-radius:14px;padding:10px 12px;margin:10px auto 0;max-width:420px;text-align:left;font-weight:600}
.fwin .btn{margin-top:8px;background:#fff;color:#5B3CC4;border:0;font-weight:800}
`);
const Fit = {
  async st() { return Object.assign({ setup: false, bar: true, lv: {}, rest: 45, voice: true }, await DB.kget('fitSet', {})); },
  save(s) { return DB.kset('fitSet', s); },
  log() { return DB.kget('fitLog', []); },
  // the active list of steps for a ladder (no bar = skip bar moves) and where you are on it
  ladder(L, s) {
    const nb = !s.bar, needsBar = L.nobar || L.steps.some(x => FIT_EX[x[0]].bar);
    const list = nb ? (L.nobar || L.steps.filter(x => !FIT_EX[x[0]].bar)) : L.steps, key = L.id + (nb && needsBar ? 'NB' : '');
    return { L, list, key, i: clamp(s.lv[key] || 0, 0, list.length - 1) };
  },
  ladderByKey(key, s) { return this.ladder(FIT_LADDERS.find(l => l.id === key.replace(/NB$/, '')), s); },
  setStart(kind, s) {
    const P = FIT_START[kind];
    for (const L of FIT_LADDERS) { const r = this.ladder(L, s), id = P[r.key] || P[L.id], i = r.list.findIndex(x => x[0] === id); s.lv[r.key] = i < 0 ? 0 : i; }
    s.setup = true;
  },
  // turn a workout into steps: exercises with rests between them
  build(w, s) {
    const one = it => {
      if (it[0] === '@') {
        const m = it.slice(1).match(/^(\w+)(-1)?$/), r = this.ladder(FIT_LADDERS.find(l => l.id === m[1]), s), i = Math.max(0, r.i - (m[2] ? 1 : 0)), [ex, sets, goal] = r.list[i];
        return { ex, target: goal, goal, sets, slot: m[2] ? null : r.key, next: !m[2] && r.list[i + 1] ? r.list[i + 1][0] : null };
      }
      const [ex, t] = it.split(':'), E = FIT_EX[ex]; return { ex, target: +t || (E.unit === 'sec' ? 30 : 10) };
    };
    const items = w.items.map(one).filter(x => s.bar || !FIT_EX[x.ex].bar || w.id === 'try'), seq = [];
    if (w.warm) for (const it of ['armcircle:20', 'highknee:20', 'squat:8']) seq.push(Object.assign(one(it), { warm: true, round: 0 }));
    for (let r = 1; r <= w.rounds; r++) for (const it of items) seq.push(Object.assign({}, it, { round: r }));
    for (const x of seq) { x.unit = FIT_EX[x.ex].unit; if (w.hiit && !x.warm) { x.unit = 'sec'; x.target = w.hiit[0]; x.amrap = true; } }
    const rest = w.hiit ? w.hiit[1] : (w.rest || s.rest), out = [];
    seq.forEach((x, i) => { out.push(x); const nx = seq[i + 1]; if (nx) out.push({ rest: x.warm ? (nx.warm ? 8 : 20) : nx.round !== x.round && !w.hiit ? Math.max(60, rest) : rest }); });
    return out;
  },
  minutes(w, s) { const st = this.build(w, s); return Math.max(1, Math.round(st.reduce((a, x) => a + (x.rest || (x.unit === 'reps' ? x.target * 3 + 6 : x.target + 5)), 0) / 60)); },
  async next(s) {
    const order = ['full', 'upper', 'lower'], log = await this.log(), last = log.find(e => order.includes(e.w));
    const w = FIT_WORKOUTS.find(x => x.id === (last ? order[(order.indexOf(last.w) + 1) % 3] : 'full'));
    return { w, today: log.some(e => ymd(new Date(e.at)) === ymd(new Date())) };
  },
  streak(log) {
    const days = new Set(log.map(e => ymd(new Date(e.at)))), d = new Date(); let n = 0;
    if (!days.has(ymd(d))) d.setDate(d.getDate() - 1);
    while (days.has(ymd(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  },
};
Apps.reg({
  id: 'fit', name: 'Calisthenics', icon: '🤸', color: 'linear-gradient(135deg,#FF5F6D,#FFC371)', group: 'day', keys: 'calisthenics workout exercise training fitness push-ups pull-ups gym bodyweight strength sport muscles plank squat', blurb: 'Bodyweight training that levels up',
  async mount(v, ctx) {
    let s = await Fit.st(), tab = Prefs.get('fitTab', 'train'), play = null;
    const body = h('div');
    const tabs = UI.tabs([['train', '🏋️ Train'], ['levels', '🪜 Levels'], ['moves', '📖 Moves'], ['progress', '📈 Stats']], tab, t => { tab = t; Prefs.set('fitTab', t); show(); }); tabs.classList.add('fittabs');
    v.append(tabs, body);
    function show() { body.innerHTML = ''; ({ train, levels, moves, progress })[tab](); }
    const goalTxt = (ex, sets, goal) => sets + ' × ' + goal + (FIT_EX[ex].unit === 'sec' ? ' s' : '');
    /* ---------- Train ---------- */
    async function train() {
      if (!s.setup) {
        const f = Fig.make('pushup', { crop: true, cls: 'fig fig-white' });
        body.append(h('div', { class: 'ftoday' }, f.el, h('div', null, h('div', { class: 'k' }, 'Welcome'), h('h3', null, 'Train with your body'), h('p', null, 'No gym needed. Push-ups, pull-ups, squats and more — and you level up as you get stronger.'), h('button', { class: 'btn', onclick: onboard }, 'Find my level →'))));
        body.append(h('p', { class: 'tiny muted mt' }, 'Takes 30 seconds. You can change it any time.'));
        return;
      }
      const { w, today } = await Fit.next(s), f = Fig.make(FIT_EX[Fit.build(w, s).find(x => !x.rest && !x.warm).ex].anim, { crop: true, cls: 'fig fig-white' });
      body.append(h('div', { class: 'ftoday' }, f.el, h('div', { style: { minWidth: 0 } }, h('div', { class: 'k' }, today ? '✓ You trained today' : 'Today’s workout'), h('h3', null, w.e + ' ' + w.n), h('p', null, (today ? 'Nice work! Resting helps muscles grow. Or go again: ' : '') + '~' + Fit.minutes(w, s) + ' min · ' + w.d), h('button', { class: 'btn', onclick: () => start(w) }, today ? 'Go again ▶' : 'Start ▶'))));
      body.append(h('div', { class: 'sec' }, 'All workouts'), h('div', { class: 'list' }, FIT_WORKOUTS.map(x => h('button', { class: 'li', onclick: () => start(x) }, h('span', { class: 'ic' }, x.e), h('span', { class: 't' }, h('b', null, x.n), h('small', null, '~' + Fit.minutes(x, s) + ' min · ' + x.d)), h('span', { class: 'chev' }, '▶')))));
      const set = (k, v2) => { s[k] = v2; Fit.save(s); };
      body.append(h('div', { class: 'sec' }, 'Settings'), h('div', { class: 'card stack' },
        h('div', null, h('div', { class: 'small muted mb' }, 'Do you have a pull-up bar?'), UI.seg([[true, '✅ Yes'], [false, '🚫 No bar']], s.bar, x => { set('bar', x); })),
        h('div', null, h('div', { class: 'small muted mb' }, 'Rest between moves'), UI.seg([[30, '30 s'], [45, '45 s'], [60, '60 s'], [90, '90 s']], s.rest, x => set('rest', x))),
        h('div', null, h('div', { class: 'small muted mb' }, 'Voice coach'), UI.seg([[true, '🔊 On'], [false, '🔇 Off']], s.voice, x => set('voice', x))),
        h('button', { class: 'btn', onclick: onboard }, '🎯 Find my level again')));
      body.append(h('p', { class: 'tiny muted mt' }, '⚠️ Warm up first. A burning feeling is OK — sharp pain is not, so stop. Drink water. Train on a safe, clear floor.'));
    }
    function onboard() {
      let bar = s.bar;
      const pick = kind => { s.bar = bar; Fit.setStart(kind, s); Fit.save(s); sh.close(); Sfx.good(); UI.toast('Levels set! See them in 🪜 Levels'); show(); };
      const opt = (kind, e, b, sm) => h('button', { class: 'li', onclick: () => pick(kind) }, h('span', { class: 'ic' }, e), h('span', { class: 't' }, h('b', null, b), h('small', null, sm)), h('span', { class: 'chev' }, '›'));
      const sh = UI.sheet({ title: '🎯 Find my level', body: h('div', { class: 'stack' },
        h('div', null, h('div', { class: 'small muted mb' }, '1. Do you have a pull-up bar (or something safe to hang from)?'), UI.seg([[true, '✅ Yes'], [false, '🚫 No']], bar, x => { bar = x; })),
        h('div', { class: 'small muted' }, '2. Which sounds most like you?'),
        h('div', { class: 'list' }, opt('new', '🌱', 'Just starting', 'Push-ups are hard for me'), opt('some', '💪', 'I can do about 10 push-ups', 'But pull-ups are tough'), opt('strong', '🔥', 'I can do push-ups and pull-ups', 'I want a challenge'))) });
    }
    /* ---------- Levels ---------- */
    function levels() {
      body.append(h('p', { class: 'small muted' }, 'Each ladder goes from easy to hard. Hit the goal on every set in a workout and you can move up a step.'));
      if (!s.setup) body.append(h('div', { class: 'center mb' }, h('button', { class: 'btn pri', onclick: onboard }, '🎯 Find my level')));
      for (const L of FIT_LADDERS) {
        const r = Fit.ladder(L, s);
        body.append(h('div', { class: 'ldr' }, h('h4', null, L.e + ' ' + L.n, h('small', null, 'Step ' + (r.i + 1) + ' of ' + r.list.length)),
          r.list.map(([ex, sets, goal], i) => { const E = FIT_EX[ex], f = Fig.make(E.anim, { still: true });
            return h('button', { class: 'stp' + (i === r.i ? ' cur' : i > r.i ? ' lock' : ''), onclick: () => howTo(E, { goal: goalTxt(ex, sets, goal), setLevel: i === r.i ? null : () => { s.lv[r.key] = i; Fit.save(s); UI.toast(L.n + ': ' + E.n + ' is your level now'); show(); } }) },
              f.el, h('span', { class: 't' }, h('b', null, E.n), h('small', null, 'Goal ' + goalTxt(ex, sets, goal) + (i === r.i ? ' · you are here' : ''))), h('span', { class: 'st' }, i < r.i ? '✅' : i === r.i ? '👉' : '🔒')); }),
          !s.bar && L.id === 'pull' ? h('p', { class: 'tiny muted', style: { margin: '6px 4px 0' } }, 'No bar: these work your back at home. Get a pull-up bar to unlock real pull-ups.') : null));
      }
    }
    /* ---------- Moves ---------- */
    function moves() {
      let kind = Prefs.get('fitKind', 'all'); const grid = h('div', { class: 'mgrid mt' });
      const KINDS = [['all', 'All'], ['push', '💪 Push'], ['pull', '🧗 Pull'], ['legs', '🦵 Legs'], ['core', '🍫 Core'], ['cardio', '❤️ Cardio'], ['skill', '🤸 Skill']];
      const paint = () => { grid.innerHTML = ''; for (const E of Object.values(FIT_EX)) if (kind === 'all' || E.kind === kind) grid.append(h('button', { class: 'mcard', onclick: () => howTo(E, { tryIt: true }) }, Fig.make(E.anim, { still: true }).el, h('b', null, E.n), h('small', null, E.bar ? 'Needs a bar' : E.works))); };
      body.append(h('div', { class: 'chips fkinds' }, KINDS.map(([k, l]) => { const b = h('button', { class: 'chip', 'aria-pressed': String(k === kind) }, l); b.onclick = () => { kind = k; Prefs.set('fitKind', k); [...b.parentNode.children].forEach(c => c.setAttribute('aria-pressed', String(c === b))); paint(); }; return b; })), grid);
      paint();
    }
    function howTo(E, { goal, setLevel, tryIt, onClose } = {}) {
      const f = Fig.make(E.anim, { tempo: E.tempo, crop: true, cls: 'fig' }); f.el.style.maxWidth = '300px'; f.el.style.margin = '0 auto';
      const acts = [{ label: '🔊 Read', onClick: () => Speak.say(E.n + '. ' + E.how.join(' ') + (E.tip ? ' Tip: ' + E.tip : '')) }];
      if (setLevel) acts.push({ label: 'Make this my level', cls: 'pri', onClick: c => { c(); setLevel(); } });
      if (tryIt) acts.push({ label: '▶ Try it', cls: 'pri', onClick: c => { c(); start({ id: 'try', n: E.n, e: E.e, rounds: 1, items: [E.id + ':' + (E.unit === 'sec' ? 20 : 8)] }); } });
      UI.sheet({ title: E.e + ' ' + E.n, onClose: () => { f.stop(); Speak.stop(); onClose && onClose(); }, actions: acts, body: h('div', null, f.el,
        h('div', { class: 'row', style: { justifyContent: 'center', gap: '6px' } }, h('span', { class: 'pill' }, '💪 ' + E.works), goal ? h('span', { class: 'pill' }, '🎯 ' + goal) : null, E.bar ? h('span', { class: 'pill' }, 'Needs a pull-up bar') : null),
        h('ol', { style: { paddingLeft: '22px', lineHeight: 1.5, fontSize: '16px' } }, E.how.map(x => h('li', null, x))),
        E.tip ? h('p', { class: 'small', style: { background: 'var(--accent-soft)', padding: '10px 12px', borderRadius: '12px' } }, '💡 ' + E.tip) : null) });
    }
    /* ---------- Progress ---------- */
    async function progress() {
      const log = await Fit.log(), pb = await DB.kget('fitPB', {}), now = new Date(), mon = new Date(now); mon.setHours(0, 0, 0, 0); mon.setDate(mon.getDate() - (mon.getDay() + 6) % 7);
      const week = log.filter(e => e.at >= +mon).length, reps = log.reduce((a, e) => a + e.sets.reduce((b, x) => b + (x[2] ? 0 : x[1]), 0), 0);
      const st = (b, sm) => h('div', { class: 'fstat' }, h('b', null, b), h('small', null, sm));
      body.append(h('div', { class: 'fstats' }, st('🔥 ' + Fit.streak(log), 'day streak'), st(week + ' / 3', 'workouts this week'), st(log.length, 'workouts in all'), st(reps.toLocaleString(), 'reps in all')));
      const days = new Set(log.map(e => ymd(new Date(e.at)))), start0 = new Date(mon); start0.setDate(start0.getDate() - 28), cal = h('div', { class: 'fcal' });
      for (const d of ['M', 'T', 'W', 'T', 'F', 'S', 'S']) cal.append(h('span', { class: 'h' }, d));
      for (let i = 0; i < 35; i++) { const d = new Date(start0); d.setDate(d.getDate() + i); const k = ymd(d); cal.append(h('span', { class: (days.has(k) ? 'fon' : '') + (k === ymd(now) ? ' ftd' : '') + (d > now ? ' fut' : ''), title: fmtDay(d) }, d.getDate())); }
      body.append(h('div', { class: 'sec' }, 'Last 5 weeks'), cal);
      const pbs = Object.entries(pb).filter(([k]) => FIT_EX[k]).sort((a, b) => FIT_EX[a[0]].n.localeCompare(FIT_EX[b[0]].n));
      body.append(h('div', { class: 'sec' }, '🏅 Personal bests (one set)'), pbs.length ? h('div', { class: 'list' }, pbs.map(([k, val]) => h('div', { class: 'li' }, h('span', { class: 'ic' }, FIT_EX[k].e), h('span', { class: 't' }, h('b', null, FIT_EX[k].n)), h('b', null, val + (FIT_EX[k].unit === 'sec' ? ' s' : ' reps'))))) : h('p', { class: 'small muted' }, 'Finish a workout to set your first bests.'));
      body.append(h('div', { class: 'sec' }, '🗓️ History'), log.length ? h('div', { class: 'list' }, log.slice(0, 60).map(e => { const W = FIT_WORKOUTS.find(x => x.id === e.w), r = e.sets.reduce((a, x) => a + (x[2] ? 0 : x[1]), 0);
        return h('button', { class: 'li', onclick: () => detail(e) }, h('span', { class: 'ic' }, W ? W.e : '🤸'), h('span', { class: 't' }, h('b', null, e.n), h('small', null, fmtDay(new Date(e.at)) + ' · ' + fmtDur(e.secs) + ' · ' + e.sets.length + ' sets' + (r ? ' · ' + r + ' reps' : ''))), h('span', { class: 'chev' }, '›')); })) : UI.empty('🤸', 'No workouts yet', 'Your workouts will show up here.'));
    }
    function detail(e) {
      const by = {}; for (const [ex, val, sec] of e.sets) (by[ex] = by[ex] || []).push(val + (sec ? 's' : ''));
      UI.sheet({ title: e.n, body: h('div', null, h('p', { class: 'muted small' }, fmtDay(new Date(e.at), { weekday: 'long', month: 'long', day: 'numeric' }) + ' · ' + fmtDur(e.secs)), h('div', { class: 'list' }, Object.entries(by).map(([ex, vals]) => h('div', { class: 'li' }, h('span', { class: 'ic' }, FIT_EX[ex] ? FIT_EX[ex].e : '•'), h('span', { class: 't' }, h('b', null, FIT_EX[ex] ? FIT_EX[ex].n : ex), h('small', null, vals.join(' · '))))))),
        actions: [{ label: 'Delete', cls: 'bad', onClick: async c => { if (!await UI.ask('Delete this workout from your history?', { ok: 'Delete', danger: true })) return; await DB.kset('fitLog', (await Fit.log()).filter(x => x.id !== e.id)); c(); show(); } }, { label: 'Close', cls: 'pri' }] });
    }
    /* ---------- the follow-along player ---------- */
    function start(w) {
      if (!s.setup && w.id !== 'try' && w.id !== 'warm' && w.id !== 'hiit' && w.id !== 'coreb') { onboard(); return; }
      if (play) play.close(); play = player(w, () => { play = null; show(); });
    }
    function player(w, onEnd) {
      const steps = Fit.build(w, s), ov = h('div', { class: 'fplay', role: 'dialog', 'aria-label': w.n }), nEx = steps.filter(x => !x.rest).length, t0 = Date.now(), done = [];
      let i = 0, tm = null, fig = null, lock = null, closed = false;
      const wake = () => { try { if (navigator.wakeLock && !closed) navigator.wakeLock.request('screen').then(l => { lock = l; }).catch(() => { }); } catch (e) { } };
      const onVis = () => { if (!document.hidden) wake(); }; document.addEventListener('visibilitychange', onVis); wake();
      const say = t => { if (s.voice) Speak.say(t); }, beep = (f = 880) => { if (Sfx.on()) Sfx.tone(f, 0.13, { type: 'square', vol: 0.06 }); };
      document.body.append(ov); Sfx.ctx();
      function clear() { if (tm) { tm.stop(); tm = null; } if (fig) { fig.stop(); fig = null; } ov.innerHTML = ''; ov.className = 'fplay'; ov.scrollTop = 0; }
      function top() { const k = steps.slice(0, i).filter(x => !x.rest).length; return h('div', { class: 'ftop' }, h('button', { class: 'ib', 'aria-label': 'Stop workout', html: SVG.close, onclick: quit }), h('div', { class: 'prog' }, h('i', { style: { width: (100 * k / nEx) + '%' } })), h('b', { class: 'small' }, Math.min(k + 1, nEx) + ' / ' + nEx)); }
      function timer(secs, onTick, onDone) {
        let end = performance.now() + secs * 1000, left = secs, total = secs, paused = false, last = -1;
        const tick = () => { if (paused) return; left = Math.max(0, (end - performance.now()) / 1000); const c = Math.ceil(left); if (c !== last) { last = c; onTick(c, left, total); } if (left <= 0) { clearInterval(iv); onDone(); } };
        const iv = setInterval(tick, 100); tick();
        return { stop: () => clearInterval(iv), pause() { paused = true; }, resume() { paused = false; end = performance.now() + left * 1000; }, add(x) { end += x * 1000; left += x; total += x; last = -1; tick(); }, get paused() { return paused; }, get left() { return left; } };
      }
      function ring() {
        const C = 2 * Math.PI * 52, num = h('div', { class: 'fbig' }), el = h('div', { class: 'fring', html: '<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" fill="none" stroke="var(--ring-bg)" stroke-width="9"/><circle class="rg" cx="60" cy="60" r="52" fill="none" stroke="var(--ring-fg)" stroke-width="9" stroke-linecap="round" stroke-dasharray="' + C.toFixed(1) + '" transform="rotate(-90 60 60)"/></svg>' });
        el.append(num); const rg = el.querySelector('.rg');
        return { el, set(c, left, total) { num.textContent = c >= 60 ? Math.floor(c / 60) + ':' + pad2(c % 60) : String(c); rg.style.strokeDashoffset = (C * (1 - clamp((left - 1) / total, 0, 1))).toFixed(1); }, text(t) { num.textContent = t; } };
      }
      const next = () => { if (closed) return; if (i >= steps.length) return finishAll(); if (steps[i].rest) showRest(); else showEx(); };
      const record = val => { const x = steps[i]; done.push({ ex: x.ex, val: Math.max(0, Math.round(val)), unit: x.amrap ? 'sec' : x.unit, slot: x.slot, goal: x.goal, sets: x.sets, next: x.next, warm: x.warm, amrap: x.amrap }); i++; next(); };
      function showEx() {
        const x = steps[i], E = FIT_EX[x.ex]; clear();
        fig = Fig.make(E.anim, { tempo: E.tempo, crop: true, cls: 'fig' + (x.unit === 'sec' ? ' mid' : '') });
        ov.append(top(), h('div', { class: 'fsub mt' }, x.warm ? '🌤️ Warm-up' : w.rounds > 1 ? 'Round ' + x.round + ' of ' + w.rounds : ''), fig.el, h('div', { class: 'fname' }, E.e + ' ' + E.n));
        const how = h('button', { class: 'btn', onclick: () => { const was = tm && !tm.paused; if (was) tm.pause(); howTo(E, { onClose: () => { if (was && tm) tm.resume(); } }); } }, '❓ How');
        if (x.unit === 'reps') {
          let n = x.target; const num = h('div', { class: 'fbig' }, String(n)), adj = d => { n = Math.max(0, n + d); num.textContent = n; };
          ov.append(h('div', { class: 'fsub' }, 'Goal: ' + x.target + ' reps' + (E.id === 'lunge' ? ' (both legs together)' : '') + ', then tap Done'),
            h('div', { class: 'fadj' }, h('button', { class: 'btn', 'aria-label': 'One less', onclick: () => adj(-1) }, '−'), num, h('button', { class: 'btn', 'aria-label': 'One more', onclick: () => adj(1) }, '＋')),
            h('div', { class: 'tiny center', style: { opacity: 0.7 } }, 'Did more or fewer? Change the number first.'),
            h('div', { class: 'fctl' }, how, h('button', { class: 'btn pri fdone', onclick: () => { Sfx.good(); record(n); } }, '✓ Done')));
          say(E.n + '. ' + x.target + ' reps.');
        } else {
          const rg = ring(), lab = h('div', { class: 'fsub' }, 'Get ready…'), pauseB = h('button', { class: 'btn' }, '⏸ Pause');
          ov.append(lab, rg.el, h('div', { class: 'fctl' }, how, pauseB, h('button', { class: 'btn', onclick: () => record(tm && lab.dataset.go ? x.target - tm.left : 0) }, 'Skip ⏭')));
          pauseB.onclick = () => { if (!tm) return; if (tm.paused) { tm.resume(); pauseB.textContent = '⏸ Pause'; } else { tm.pause(); pauseB.textContent = '▶ Go on'; } };
          say(E.n + (x.amrap ? '. As many as you can in ' : '. Hold for ') + x.target + ' seconds.');
          tm = timer(3, c => { rg.text(c > 0 ? String(c) : 'Go!'); if (c > 0) beep(660); }, () => {
            lab.dataset.go = '1'; lab.textContent = x.amrap ? 'As many as you can!' : 'Hold it!'; beep(1100);
            tm = timer(x.target, (c, left, total) => { rg.set(c, left, total); if (c <= 3 && c > 0) beep(); if (x.target >= 20 && c === Math.round(x.target / 2)) say('Halfway'); }, () => { beep(1320); Sfx.good(); record(x.target); });
          });
        }
      }
      function showRest() {
        const x = steps[i], nx = steps[i + 1], E = FIT_EX[nx.ex]; clear(); ov.classList.add('rest');
        fig = Fig.make(E.anim, { tempo: E.tempo, crop: true, cls: 'fig sm fig-white' }); const rg = ring();
        ov.append(top(), h('div', { class: 'fname mt' }, 'Rest'), rg.el, h('div', { class: 'fsub mt' }, 'Next up'), fig.el, h('div', { class: 'fname', style: { fontSize: '22px' } }, E.e + ' ' + E.n), h('div', { class: 'fsub' }, nx.unit === 'reps' ? nx.target + ' reps' : nx.target + ' seconds'),
          h('div', { class: 'fctl' }, h('button', { class: 'btn', onclick: () => tm && tm.add(15) }, '+15 s'), h('button', { class: 'btn pri fdone', onclick: () => { i++; next(); } }, 'Skip rest ⏭')));
        say('Rest. Next: ' + E.n + '.');
        tm = timer(x.rest, (c, left, total) => { rg.set(c, left, total); if (c <= 3 && c > 0) beep(); }, () => { i++; next(); });
      }
      async function save() {
        const work = done.filter(d => !d.warm); if (!work.length) return null;
        const secs = Math.round((Date.now() - t0) / 1000), pb = await DB.kget('fitPB', {}), best = [];
        for (const d of work) if (!d.amrap && d.val > (pb[d.ex] || 0)) { if (pb[d.ex] && !best.includes(d.ex)) best.push(d.ex); pb[d.ex] = d.val; }
        await DB.kset('fitPB', pb);
        const ups = []; for (const slot of [...new Set(work.filter(d => d.slot).map(d => d.slot))]) { const sets = work.filter(d => d.slot === slot), need = Math.min(sets[0].sets, w.rounds); if (sets[0].next && sets.length >= need && sets.every(d => d.val >= d.goal)) ups.push(sets[0]); }
        const log = await Fit.log(); log.unshift({ id: uid(), at: Date.now(), w: w.id, n: w.n, secs, sets: work.map(d => [d.ex, d.val, d.unit === 'sec' ? 1 : 0]) }); await DB.kset('fitLog', log.slice(0, 500));
        return { secs, sets: work.length, reps: work.reduce((a, d) => a + (d.unit === 'sec' ? 0 : d.val), 0), best, ups };
      }
      async function finishAll() {
        clear(); ov.classList.add('done'); Sfx.win(); say('Workout done! Great job.'); const r = await save() || { secs: 0, sets: 0, reps: 0, best: [], ups: [] };
        const st = (b, sm) => h('div', { class: 'fstat' }, h('b', null, b), h('small', null, sm));
        const box = h('div', { class: 'fdonebox' }, h('div', { class: 'big' }, '🎉'), h('h2', null, 'Workout done!'), h('div', { class: 'fstats' }, st(fmtDur(r.secs), 'time'), st(r.sets, 'sets'), st(r.reps, 'reps'), st('🔥 ' + Fit.streak(await Fit.log()), 'day streak')));
        for (const ex of r.best) box.append(h('div', { class: 'fwin' }, '🏅 New best: ' + FIT_EX[ex].n + ' — ' + Math.max(...done.filter(d => d.ex === ex).map(d => d.val)) + (FIT_EX[ex].unit === 'sec' ? ' s' : ' reps')));
        for (const u of r.ups) { const nx = FIT_EX[u.next], b = h('button', { class: 'btn' }, 'Move up to ' + nx.n + ' →');
          b.onclick = () => { s.lv[u.slot] = (s.lv[u.slot] || 0) + 1; Fit.save(s); b.disabled = true; b.textContent = '✓ Leveled up!'; Sfx.chime(); };
          box.append(h('div', { class: 'fwin' }, '⬆️ You hit the goal for ' + FIT_EX[u.ex].n + ' on every set! Ready for the next step?', h('br'), b)); }
        ov.append(box, h('div', { class: 'fctl' }, h('button', { class: 'btn fdone', style: { background: '#fff', color: '#5B3CC4', border: 0, fontWeight: 800 }, onclick: close }, 'Done')));
      }
      async function quit() {
        const was = tm && !tm.paused; if (was) tm.pause();
        if (!await UI.ask(done.some(d => !d.warm) ? 'Stop the workout? What you did so far is saved.' : 'Stop the workout?', { ok: 'Stop', danger: true })) { if (was && tm) tm.resume(); return; }
        if (await save()) UI.toast('Saved what you did ✓'); close();
      }
      function close() { if (closed) return; closed = true; clear(); ov.remove(); Speak.stop(); document.removeEventListener('visibilitychange', onVis); try { lock && lock.release(); } catch (e) { } onEnd && onEnd(); }
      next();
      return { close, get i() { return i; }, steps };
    }
    window.__fit = { get play() { return play; }, start: id => start(FIT_WORKOUTS.find(x => x.id === id)) };
    const W = ctx.param && FIT_WORKOUTS.find(x => x.id === ctx.param);
    show(); if (W) setTimeout(() => start(W), 250);
    return () => { if (play) play.close(); };
  },
});

/* ---- 40-dict.js ---- */
/* ===== Dictionary: 87,000 English words from WordNet, all offline ===== */
addCSS(`
.dword{font-size:34px;font-weight:800;font-family:var(--round);word-break:break-word}
.dpos{font-size:13px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--accent);margin:18px 0 6px}
.dsense{display:flex;gap:10px;padding:8px 0;border-top:1px solid var(--line)}
.dsense:first-of-type{border-top:0}
.dsense .num{flex:0 0 auto;width:24px;height:24px;border-radius:12px;background:var(--surface2);display:grid;place-items:center;font-size:13px;font-weight:700}
.dsense p{margin:0;font-size:17px}
.dsense em{display:block;color:var(--muted);font-size:15px;margin-top:3px}
.sugg{position:relative}
.sugg .list{position:absolute;left:0;right:0;top:calc(100% + 6px);z-index:5;max-height:50vh;overflow:auto}
`);
const Dict = {
  files: {},
  letter: w => { const c = w[0]; return c >= 'a' && c <= 'z' ? c : '0'; },
  file(l) { return this.files[l] || (this.files[l] = fetch('data/dict/' + l + '.json').then(r => { if (!r.ok) throw new Error('missing'); return r.json(); }).catch(e => { delete this.files[l]; throw e; })); },
  norm: w => String(w || '').toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ').trim(),
  async raw(w) { if (!w) return null; const d = await this.file(this.letter(w)); return d[w] ? { word: w, senses: d[w] } : null; },
  stems(w) {
    const out = [], add = x => { if (x && x.length > 1 && x !== w && !out.includes(x)) out.push(x); }, e = (s, n) => w.endsWith(s) ? w.slice(0, -n) : null;
    add(e('ies', 3) && e('ies', 3) + 'y'); add(e('es', 2)); add(e('s', 1)); add(e('ied', 3) && e('ied', 3) + 'y'); add(e('ed', 2)); add(e('ed', 1));
    if (w.endsWith('ed') && w.length > 4 && w[w.length - 3] === w[w.length - 4]) add(w.slice(0, -3));
    add(e('ing', 3)); add(e('ing', 3) && e('ing', 3) + 'e'); if (w.endsWith('ing') && w.length > 5 && w[w.length - 4] === w[w.length - 5]) add(w.slice(0, -4));
    add(e('ier', 3) && e('ier', 3) + 'y'); add(e('iest', 4) && e('iest', 4) + 'y'); add(e('er', 2)); add(e('er', 1)); add(e('est', 3)); add(e('est', 2)); add(e('ly', 2)); add(e('ily', 3) && e('ily', 3) + 'y');
    add({ men: 'man', women: 'woman', children: 'child', mice: 'mouse', feet: 'foot', teeth: 'tooth', geese: 'goose', people: 'person', went: 'go', ran: 'run', ate: 'eat', saw: 'see', took: 'take', gave: 'give', came: 'come', made: 'make', said: 'say', got: 'get', did: 'do', was: 'be', were: 'be', is: 'be', are: 'be', had: 'have', has: 'have', better: 'good', best: 'good', worse: 'bad', worst: 'bad' }[w]);
    return out;
  },
  async lookup(w) { w = this.norm(w); if (!w) return null; let r = await this.raw(w); if (r) return r; for (const b of this.stems(w)) { r = await this.raw(b); if (r) return Object.assign({ from: w }, r); } return null; },
  async suggest(p, n = 8) { p = this.norm(p); if (!p) return []; const d = await this.file(this.letter(p)); const out = []; for (const k in d) if (k.startsWith(p)) { out.push(k); if (out.length > 400) break; } return out.sort((a, b) => a.length - b.length || a.localeCompare(b)).slice(0, n); },
  async near(w) {
    w = this.norm(w); const d = await this.file(this.letter(w)); const res = [];
    const lev = (a, b) => { const m = a.length, n = b.length; let prev = Array.from({ length: n + 1 }, (_, j) => j); for (let i = 1; i <= m; i++) { const cur = [i]; let rowMin = i; for (let j = 1; j <= n; j++) { cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); rowMin = Math.min(rowMin, cur[j]); } if (rowMin > 2) return 9; prev = cur; } return prev[n]; };
    for (const k in d) { if (Math.abs(k.length - w.length) > 2 || k.includes(' ')) continue; const x = lev(k, w); if (x <= 2) res.push([x, k]); }
    return res.sort((a, b) => a[0] - b[0] || a[1].length - b[1].length).slice(0, 8).map(x => x[1]);
  },
  async wordOfDay() {
    const seed = hashStr(ymd(new Date())), L = 'abcdefghilmnoprstuw'[seed % 19], d = await this.file(L);
    const keys = Object.keys(d).filter(k => /^[a-z]{5,11}$/.test(k) && d[k][0][2]); return keys.length ? { word: keys[seed % keys.length], senses: d[keys[seed % keys.length]] } : null;
  },
};
Apps.reg({
  id: 'dict', name: 'Dictionary', icon: '📖', color: 'linear-gradient(135deg,#4A6CF7,#1E3A8A)', group: 'learn', keys: 'words meaning define definition spelling thesaurus synonyms', blurb: '87,000 words, offline',
  mount(v, ctx) {
    let hist = Prefs.get('dictHist', []), saved = Prefs.get('dictSaved', []);
    const q = h('input', { type: 'search', placeholder: 'Look up a word', autocapitalize: 'off', autocomplete: 'off', spellcheck: 'false', enterkeyhint: 'search', 'aria-label': 'Word' });
    const sug = h('div', { class: 'list', hidden: true }), out = h('div', { class: 'mt' });
    v.append(h('div', { class: 'sugg' }, h('div', { class: 'search' }, q), sug), out);
    const go = async w => { sug.hidden = true; q.value = w; q.blur(); await show(w); };
    q.addEventListener('keydown', e => { if (e.key === 'Enter' && q.value.trim()) go(q.value.trim()); });
    q.addEventListener('input', debounce(async () => {
      const s = q.value.trim(); if (s.length < 2) { sug.hidden = true; return; }
      try { const list = await Dict.suggest(s); sug.innerHTML = ''; sug.hidden = !list.length; list.forEach(w => sug.append(h('button', { class: 'li', onclick: () => go(w) }, h('span', { class: 't' }, h('b', null, w))))); } catch (e) { sug.hidden = true; }
    }, 150));
    const onDoc = e => { if (!sug.contains(e.target) && e.target !== q) sug.hidden = true; }; document.addEventListener('pointerdown', onDoc);
    async function home() {
      ctx.setBack(null); out.innerHTML = '';
      try {
        const wod = await Dict.wordOfDay();
        if (wod) out.append(h('button', { class: 'card', style: { width: '100%', textAlign: 'left', display: 'block', background: 'linear-gradient(135deg,var(--accent-soft),var(--surface))' }, onclick: () => go(wod.word) }, h('div', { class: 'tiny muted', style: { fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' } }, '✨ Word of the day'), h('div', { class: 'dword', style: { fontSize: '28px' } }, wod.word), h('p', { style: { margin: '4px 0 0' } }, wod.senses[0][1])));
      } catch (e) { out.append(h('div', { class: 'note-banner' }, '📥 The dictionary is still being saved for offline use. Keep the app open with internet for a minute.')); }
      if (saved.length) out.append(h('div', { class: 'sec' }, '⭐ Saved words'), h('div', { class: 'chips' }, saved.map(w => h('button', { class: 'chip', onclick: () => go(w) }, w))));
      if (hist.length) out.append(h('div', { class: 'row', style: { margin: '22px 4px 8px' } }, h('div', { class: 'sec', style: { margin: 0, flex: 1 } }, 'Recent'), h('button', { class: 'btn ghost sm', onclick: () => { hist = []; Prefs.set('dictHist', hist); home(); } }, 'Clear')), h('div', { class: 'chips' }, hist.slice(0, 24).map(w => h('button', { class: 'chip', onclick: () => go(w) }, w))));
      out.append(h('p', { class: 'tiny muted mt2' }, 'Tip: tap 🔊 to hear a word. Tap a green word to look it up.'));
    }
    async function show(w) {
      out.innerHTML = ''; out.append(h('div', { class: 'empty' }, 'Looking…'));
      let r; try { r = await Dict.lookup(w); } catch (e) { out.innerHTML = ''; out.append(UI.empty('📥', 'Dictionary not saved yet', 'Connect to the internet once so I can save all 87,000 words.')); return; }
      out.innerHTML = ''; ctx.setBack(() => { q.value = ''; home(); return true; });
      if (!r) {
        out.append(UI.empty('🤔', 'No word “' + w + '”', 'Check the spelling, or try one of these:'));
        const near = await Dict.near(w).catch(() => []); out.append(h('div', { class: 'chips', style: { justifyContent: 'center' } }, near.length ? near.map(x => h('button', { class: 'chip', onclick: () => go(x) }, x)) : h('span', { class: 'muted' }, 'No close matches.')));
        return;
      }
      hist = [r.word].concat(hist.filter(x => x !== r.word)).slice(0, 50); Prefs.set('dictHist', hist);
      const isSaved = () => saved.includes(r.word);
      const star = h('button', { class: 'btn sm', onclick: () => { saved = isSaved() ? saved.filter(x => x !== r.word) : [r.word].concat(saved); Prefs.set('dictSaved', saved); star.textContent = isSaved() ? '⭐ Saved' : '☆ Save'; } }, isSaved() ? '⭐ Saved' : '☆ Save');
      const card = h('div', { class: 'card' }, h('div', { class: 'row nw' }, h('div', { class: 'dword', style: { flex: 1 } }, r.word), h('button', { class: 'btn sm', 'aria-label': 'Say it', onclick: () => Speak.say(r.word, { rate: 0.9 }) }, '🔊'), star),
        r.from ? h('p', { class: 'small muted' }, 'You searched “' + r.from + '” — showing the base word.') : null);
      let lastPos = '', n = 0;
      for (const [pos, def, ex, syn] of r.senses) {
        if (pos !== lastPos) { card.append(h('div', { class: 'dpos' }, pos)); lastPos = pos; n = 0; }
        n++; card.append(h('div', { class: 'dsense' }, h('span', { class: 'num' }, n), h('div', null, h('p', null, def), ex ? h('em', null, '“' + ex + '”') : null,
          syn && syn.length ? h('div', { class: 'chips', style: { marginTop: '6px' } }, syn.map(s => h('button', { class: 'chip', style: { color: 'var(--good)', fontSize: '13px', minHeight: '28px', padding: '3px 10px' }, onclick: () => go(s) }, s))) : null)));
      }
      out.append(card, h('div', { class: 'row mt' }, h('button', { class: 'btn sm', onclick: () => shareText(r.word + ': ' + r.senses.slice(0, 3).map((s, i) => (i + 1) + '. ' + s[1]).join(' '), r.word) }, '📤 Share'), h('button', { class: 'btn sm', onclick: async () => { const decks = await Cards.decks(); let d = decks.find(x => x.name === 'My words'); if (!d) { d = { id: uid(), name: 'My words', emoji: '📖', color: DECK_COLORS[0], created: Date.now() }; await DB.put('decks', d); } await DB.put('cards', { id: uid(), deck: d.id, front: r.word, back: r.senses[0][1], box: 0, due: 0, created: Date.now() }); UI.toast('Added to Flashcards → My words'); } }, '🗂️ Make a flashcard')));
    }
    if (ctx.param) go(ctx.param); else home();
    if (!isTouch() && !ctx.param) setTimeout(() => q.focus(), 60);
    return () => document.removeEventListener('pointerdown', onDoc);
  },
});

/* ---- 41-map.js ---- */
/* ===== World map: every country, your GPS spot, saved places — all offline ===== */
addCSS(`
.mapbox{position:relative;border-radius:18px;overflow:hidden;background:#A9D3F0;touch-action:none;user-select:none;-webkit-user-select:none}
.mapbox canvas{display:block;width:100%;height:min(66vh,640px);height:min(66dvh,640px);cursor:grab}
.mapctl{position:absolute;right:10px;top:10px;display:flex;flex-direction:column;gap:6px}
.mapctl button{width:44px;height:44px;border-radius:12px;border:0;background:var(--surface);box-shadow:0 2px 8px rgba(0,0,0,.2);font-size:20px;font-weight:700;color:var(--ink)}
.mapinfo{position:absolute;left:10px;bottom:10px;right:10px;pointer-events:none;display:flex;justify-content:flex-start}
.mapinfo span{background:rgba(255,255,255,.88);color:#123;border-radius:10px;padding:4px 10px;font-size:12px;font-weight:650}
.facts{display:grid;grid-template-columns:auto 1fr;gap:6px 14px;font-size:16px}
.facts dt{color:var(--muted);font-weight:600}
.facts dd{margin:0;font-weight:650}
`);
const REGION_COLORS = { Africa: '#F6D58E', Americas: '#BFE3A5', Asia: '#F7B9A1', Europe: '#C8C2F2', Oceania: '#A8E0D8', Antarctic: '#F2F5F8', '': '#E4E4E4' };
const WorldData = {
  p: null,
  load() { return this.p || (this.p = Promise.all([fetch('data/world.json').then(r => r.json()), fetch('data/countries.json').then(r => r.json())]).then(([t, f]) => this.build(t, f)).catch(e => { this.p = null; throw e; })); },
  merc(lon, lat) { lat = clamp(lat, -85, 85); return [(lon + 180) / 360, (1 - Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)) / Math.PI) / 2]; },
  unmerc(x, y) { return [x * 360 - 180, Math.atan(Math.sinh(Math.PI * (1 - 2 * y))) * 180 / Math.PI]; },
  build(topo, facts) {
    const tf = topo.transform, S = 1000;
    const arcs = topo.arcs.map(a => { let x = 0, y = 0; return a.map(([dx, dy]) => { x += dx; y += dy; return tf ? [x * tf.scale[0] + tf.translate[0], y * tf.scale[1] + tf.translate[1]] : [dx, dy]; }); });
    const ring = idx => {
      const pts = []; for (const i of idx) { const a = i < 0 ? arcs[~i].slice().reverse() : arcs[i]; for (let k = pts.length ? 1 : 0; k < a.length; k++) pts.push(a[k]); }
      // shapes that cross the date line (Russia, Fiji…): make longitudes continuous, then pin them to the map edge
      let off = 0; const un = pts.map(([lo, la], k) => { if (k) { const d = lo - pts[k - 1][0]; if (d > 180) off -= 360; else if (d < -180) off += 360; } return [lo + off, la]; });
      const mean = un.reduce((a, p) => a + p[0], 0) / (un.length || 1), shift = mean > 180 ? -360 : mean < -180 ? 360 : 0;
      return un.map(([lo, la]) => this.merc(clamp(lo + shift, -180, 180), la).map(v => v * S));
    };
    const countries = [];
    for (const g of topo.objects.countries.geometries) {
      const polys = g.type === 'Polygon' ? [g.arcs] : g.type === 'MultiPolygon' ? g.arcs : []; if (!polys.length) continue;
      const rings = polys.map(p => p.map(ring)); const path = new Path2D(); let bb = [1e9, 1e9, -1e9, -1e9], big = null, bigA = 0;
      for (const poly of rings) for (let ri = 0; ri < poly.length; ri++) {
        const r = poly[ri]; let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
        r.forEach(([x, y], k) => { k ? path.lineTo(x, y) : path.moveTo(x, y); x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }); path.closePath();
        bb = [Math.min(bb[0], x0), Math.min(bb[1], y0), Math.max(bb[2], x1), Math.max(bb[3], y1)];
        const A = (x1 - x0) * (y1 - y0); if (ri === 0 && A > bigA) { bigA = A; big = [(x0 + x1) / 2, (y0 + y1) / 2, x1 - x0]; }
      }
      const f = facts[g.id] || { name: (g.properties || {}).name || '?' };
      countries.push({ id: g.id, name: f.name, f, rings, path, bb, label: big, color: REGION_COLORS[f.region || ''] || REGION_COLORS[''] });
    }
    return (this.data = { countries, facts, S });
  },
  hit(D, x, y) {
    for (const c of D.countries) {
      if (x < c.bb[0] || x > c.bb[2] || y < c.bb[1] || y > c.bb[3]) continue; let inside = false;
      for (const poly of c.rings) for (const r of poly) for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside; }
      if (inside) return c;
    }
    return null;
  },
  async countryAt(lat, lon) { const D = await this.load(); const [x, y] = this.merc(lon, lat).map(v => v * D.S); return this.hit(D, x, y); },
  async drawMini(cv, id) {
    const D = await this.load(), c = D.countries.find(k => k.id === id); if (!c) return; const r = cv.getBoundingClientRect(), d = devicePixelRatio || 1; cv.width = r.width * d; cv.height = r.height * d; const g = cv.getContext('2d');
    const w = Math.max(c.bb[2] - c.bb[0], 30), hh = Math.max(c.bb[3] - c.bb[1], 30), cx = (c.bb[0] + c.bb[2]) / 2, cy = (c.bb[1] + c.bb[3]) / 2, s = Math.min(cv.width / (w * 4), cv.height / (hh * 4));
    g.fillStyle = '#A9D3F0'; g.fillRect(0, 0, cv.width, cv.height); g.setTransform(s, 0, 0, s, cv.width / 2 - cx * s, cv.height / 2 - cy * s);
    for (const k of D.countries) { g.fillStyle = k === c ? '#E5383B' : '#F1EDE4'; g.fill(k.path); g.lineWidth = 0.6 / s * d; g.strokeStyle = '#9AA5B1'; g.stroke(k.path); }
  },
};
const geoHere = () => new Promise((res, rej) => { if (!navigator.geolocation) return rej(new Error('No location on this device')); navigator.geolocation.getCurrentPosition(p => res(p.coords), e => rej(new Error(e.code === 1 ? 'Location is turned off for Super One. Allow it in Settings → Privacy → Location.' : 'Could not find you. Try near a window or outside.')), { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 }); });
const haversine = (a, b, c, d) => { const R = 6371, r = Math.PI / 180, x = Math.sin((c - a) * r / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin((d - b) * r / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };
const fmtKm = km => km < 1 ? Math.round(km * 1000) + ' m' : km < 100 ? km.toFixed(1) + ' km' : Math.round(km).toLocaleString() + ' km';
/* ===== Take me home: one tap opens directions to your house. The address is kept only on this device. ===== */
addCSS(`
.hmarrow{width:150px;height:150px;margin:6px auto 2px;display:block}
.hmdist{text-align:center;font-size:30px;font-weight:800;font-family:var(--round);margin-top:4px}
.hmdir{text-align:center;font-size:16px;color:var(--muted);margin-bottom:8px}
`);
const GoHome = {
  MODES: [['driving', '🚗 Car', 'd'], ['walking', '🚶 Walk', 'w'], ['transit', '🚌 Bus/train', 'r']],
  get() { return Prefs.get('home', null); },
  isSet() { const s = this.get(); return !!(s && (s.addr || s.lat != null)); },
  dest() { const s = this.get(); return s.lat != null ? s.lat.toFixed(6) + ',' + s.lon.toFixed(6) : s.addr; },
  where() { const s = this.get(); return s ? (s.addr || 'Your saved GPS spot') : ''; },
  bearing(a, b, c, d) { const r = Math.PI / 180, y = Math.sin((d - b) * r) * Math.cos(c * r), x = Math.cos(a * r) * Math.sin(c * r) - Math.sin(a * r) * Math.cos(c * r) * Math.cos((d - b) * r); return (Math.atan2(y, x) / r + 360) % 360; },
  compass(deg) { return ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'][Math.round(deg / 45) % 8]; },
  // open the map app with the route from where you are now to home
  launch() {
    const s = this.get(), t = encodeURIComponent(this.dest()), m = this.MODES.find(x => x[0] === s.mode) || this.MODES[0];
    UI.toast('🏠 Opening directions home…');
    if (s.app === 'apple') { window.open('https://maps.apple.com/?daddr=' + t + '&dirflg=' + m[2], '_blank', 'noopener'); return; }
    openOut('comgooglemaps://?daddr=' + t + '&directionsmode=' + m[0], 'https://www.google.com/maps/dir/?api=1&destination=' + t + '&travelmode=' + m[0] + '&dir_action=navigate');
  },
  go() {
    if (!this.isSet()) return this.setup(() => this.go());
    if (navigator.onLine) return this.launch();
    this.offline();
  },
  setup(after) {
    const s = Object.assign({ addr: '', lat: null, lon: null, mode: 'driving', app: 'google' }, this.get() || {});
    const addr = h('input', { type: 'text', value: s.addr, placeholder: 'House number, street, city', autocomplete: 'street-address', enterkeyhint: 'done' });
    const gpsNote = h('div', { class: 'tiny muted' }), gpsB = h('button', { class: 'btn' }, '📍 I’m home right now — save this spot');
    const paintGps = () => { gpsNote.textContent = s.lat != null ? '✓ GPS spot saved. This is the most exact, and it gives you an arrow home even with no internet.' : 'Most exact: tap this while you are at home.'; };
    gpsB.onclick = async () => { gpsB.disabled = true; gpsB.textContent = 'Finding you…'; try { const c = await geoHere(); s.lat = c.latitude; s.lon = c.longitude; UI.toast('📍 Home spot saved (±' + fmtKm((c.accuracy || 30) / 1000) + ')'); } catch (e) { UI.toast(e.message, 4500); } gpsB.disabled = false; gpsB.textContent = '📍 I’m home right now — save this spot'; paintGps(); };
    paintGps();
    const body = h('div', { class: 'stack' },
      h('label', { class: 'f' }, h('span', null, 'Your home address'), addr),
      h('div', { class: 'stack', style: { gap: '6px' } }, gpsB, gpsNote),
      h('div', { class: 'sec', style: { margin: '6px 0 0' } }, 'How do you go home?'), UI.seg(this.MODES.map(m => [m[0], m[1]]), s.mode, v => { s.mode = v; }),
      h('div', { class: 'sec', style: { margin: '6px 0 0' } }, 'Open in'), UI.seg([['google', 'Google Maps'], ['apple', 'Apple Maps']], s.app, v => { s.app = v; }),
      h('p', { class: 'tiny muted' }, '🔒 Saved only on this phone, never on the website. When you tap “Take me home”, the address goes to the map app so it can plan the route.'),
      this.isSet() ? h('button', { class: 'btn bad sm', onclick: e => { localStorage.removeItem('np.home'); e.target.closest('.scrim').remove(); UI.toast('Home removed'); GoHome.changed(); } }, 'Forget my home') : null);
    UI.sheet({ title: '🏠 My home', body, actions: [{ label: 'Cancel' }, { label: after ? 'Save & go' : 'Save', cls: 'pri', onClick: c => {
      s.addr = addr.value.trim(); if (!s.addr && s.lat == null) return UI.toast('Type your address, or tap “I’m home right now”');
      Prefs.set('home', { addr: s.addr, lat: s.lat, lon: s.lon, mode: s.mode, app: s.app, at: Date.now() }); c(); UI.toast('🏠 Home saved'); this.changed(); if (after) after(); } }] });
  },
  changed() { document.dispatchEvent(new CustomEvent('home-changed')); },
  // no internet: show distance and an arrow pointing home (needs the saved GPS spot)
  offline() {
    const s = this.get(), arrow = h('div', { html: '<svg class="hmarrow" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="var(--surface2)" stroke="var(--line)" stroke-width="2"/><g class="nl"><text x="50" y="15" text-anchor="middle" font-size="10" font-weight="800" fill="var(--muted)">N</text></g><g class="ar"><path d="M50 16 L72 70 L50 58 L28 70 Z" fill="#FF3D7F" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></g><circle cx="50" cy="50" r="3" fill="#fff"/></svg>' });
    const dist = h('div', { class: 'hmdist' }, s.lat != null ? '…' : ''), dir = h('div', { class: 'hmdir' }), svg = arrow.firstChild, arG = svg.querySelector('.ar'), nG = svg.querySelector('.nl');
    let watch = null, heading = null, brg = null; const onOri = e => { const hd = e.webkitCompassHeading != null ? e.webkitCompassHeading : (e.absolute && e.alpha != null ? 360 - e.alpha : null); if (hd != null) { heading = hd; turn(); } };
    const turn = () => { if (brg == null) return; const hd = heading || 0; arG.setAttribute('transform', 'rotate(' + ((brg - hd + 360) % 360).toFixed(1) + ' 50 50)'); nG.setAttribute('transform', 'rotate(' + ((360 - hd) % 360).toFixed(1) + ' 50 50)'); };
    const compB = h('button', { class: 'btn sm' }, '🧭 Point my phone');
    compB.onclick = async () => { try { if (window.DeviceOrientationEvent && DeviceOrientationEvent.requestPermission) { if (await DeviceOrientationEvent.requestPermission() !== 'granted') return UI.toast('Compass not allowed'); } addEventListener('deviceorientationabsolute', onOri); addEventListener('deviceorientation', onOri); compB.textContent = '🧭 Hold your phone flat'; } catch (e) { UI.toast('No compass on this device'); } };
    const body = h('div', null, h('div', { class: 'note-banner' }, '📴 No internet, so the map app can’t plan the route right now.'));
    if (s.lat != null) {
      body.append(arrow, dist, dir, h('div', { class: 'center' }, compB), h('p', { class: 'tiny muted mt center' }, 'The arrow points the straight-line way home. With the compass on, turn until it points up, then walk that way.'));
      const upd = p => { const c = p.coords; brg = this.bearing(c.latitude, c.longitude, s.lat, s.lon); const km = haversine(c.latitude, c.longitude, s.lat, s.lon);
        dist.textContent = km < 0.04 ? 'You’re home! 🎉' : fmtKm(km); dir.textContent = km < 0.04 ? '' : 'Home is to the ' + this.compass(brg) + ' (straight line)'; turn(); };
      if (navigator.geolocation) watch = navigator.geolocation.watchPosition(upd, e => { dist.textContent = '—'; dir.textContent = e.code === 1 ? 'Location is off for Super One. Turn it on in Settings → Privacy → Location.' : 'Can’t find you yet. Try near a window or outside.'; }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 });
    } else body.append(h('p', { class: 'mt' }, 'Tip: next time you are at home, open 🏠 My home and tap “I’m home right now”. Then this screen shows an arrow and the distance home, even with no internet.'));
    UI.sheet({ title: '🏠 Take me home', body, onClose: () => { if (watch != null) navigator.geolocation.clearWatch(watch); removeEventListener('deviceorientationabsolute', onOri); removeEventListener('deviceorientation', onOri); },
      actions: [{ label: '✏️ My home', onClick: c => { c(); this.setup(); } }, { label: 'Open map app anyway', cls: 'pri', onClick: c => { c(); this.launch(); } }] });
  },
};
Apps.reg({
  id: 'map', name: 'Map', icon: '🗺️', color: 'linear-gradient(135deg,#56CCF2,#2F80ED)', group: 'day', keys: 'world countries gps location places globe geography home house directions take me home navigate', blurb: 'World map + your GPS spot',
  async mount(v, ctx) {
    const cv = h('canvas', { 'aria-label': 'World map. Drag to move, pinch or use + and − to zoom, tap a country.' }), info = h('div', { class: 'mapinfo' });
    const box = h('div', { class: 'mapbox' }, cv, h('div', { class: 'mapctl' }, h('button', { 'aria-label': 'Zoom in', onclick: () => zoomAt(1.6) }, '+'), h('button', { 'aria-label': 'Zoom out', onclick: () => zoomAt(1 / 1.6) }, '−'), h('button', { 'aria-label': 'Show my location', onclick: locate }, '📍')), info);
    const search = h('input', { type: 'search', placeholder: 'Find a country', 'aria-label': 'Find a country' });
    const placesBox = h('div'), homeBox = h('div');
    v.append(h('button', { class: 'btn pri mb', style: { width: '100%', fontSize: '18px', minHeight: '52px' }, onclick: () => GoHome.go() }, '🏠 Take me home'), h('div', { class: 'search mb' }, search), box, h('div', { class: 'row mt' }, h('button', { class: 'btn', onclick: locate }, '📍 Where am I?'), h('button', { class: 'btn', onclick: () => addPlace() }, '⭐ Save a place'), h('button', { class: 'btn', onclick: () => gmaps('') }, '🌍 Google Maps')), homeBox, placesBox,
      h('p', { class: 'tiny muted mt' }, 'Your phone’s GPS works without internet. This map shows countries; for streets and directions tap 🌍 Google Maps (needs internet).'));
    let D; try { D = await WorldData.load(); } catch (e) { box.replaceWith(UI.empty('🌐', 'Map not saved yet', 'Open Super One once with internet so it can save the world map.')); return; }
    const g = cv.getContext('2d'); let W = 0, H = 0, dpr = 1, s = 1, tx = 0, ty = 0, sel = null, me = null, places = [], raf = 0;
    const fit = (x0, y0, x1, y1, pad = 0.12) => { const w = x1 - x0, hh = y1 - y0; s = Math.min(W / (w * (1 + pad * 2)), H / (hh * (1 + pad * 2))); s = clamp(s, minS(), 400); tx = W / 2 - (x0 + w / 2) * s; ty = H / 2 - (y0 + hh / 2) * s; clampView(); draw(); };
    const minS = () => Math.max(W / D.S, H / (D.S * 0.8)) * 0.98;
    const clampView = () => { s = clamp(s, minS(), 400); tx = clamp(tx, W - D.S * s, 0); const yTop = D.S * 0.06, yBot = D.S * 0.93; ty = clamp(ty, H - yBot * s, -yTop * s); };
    const size = () => { const r = cv.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; };
    const toWorld = (px, py) => [(px - tx) / s, (py - ty) / s];
    function draw() { cancelAnimationFrame(raf); raf = requestAnimationFrame(paint); }
    function paint() {
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = '#A9D3F0'; g.fillRect(0, 0, W, H);
      g.setTransform(s * dpr, 0, 0, s * dpr, tx * dpr, ty * dpr);
      g.lineWidth = 1 / s; g.strokeStyle = 'rgba(255,255,255,.45)';
      for (let lon = -180; lon <= 180; lon += 30) { const [x] = WorldData.merc(lon, 0); g.beginPath(); g.moveTo(x * D.S, 0); g.lineTo(x * D.S, D.S); g.stroke(); }
      for (let lat = -60; lat <= 60; lat += 30) { const [, y] = WorldData.merc(0, lat); g.beginPath(); g.moveTo(0, y * D.S); g.lineTo(D.S, y * D.S); g.stroke(); }
      const vx0 = -tx / s, vy0 = -ty / s, vx1 = (W - tx) / s, vy1 = (H - ty) / s;
      for (const c of D.countries) { if (c.bb[2] < vx0 || c.bb[0] > vx1 || c.bb[3] < vy0 || c.bb[1] > vy1) continue; g.fillStyle = c === sel ? '#FF8A65' : c.color; g.fill(c.path); }
      g.lineWidth = 0.8 / s; g.strokeStyle = 'rgba(70,80,95,.55)'; for (const c of D.countries) { if (c.bb[2] < vx0 || c.bb[0] > vx1 || c.bb[3] < vy0 || c.bb[1] > vy1) continue; g.stroke(c.path); }
      if (sel) { g.lineWidth = 2.2 / s; g.strokeStyle = '#C2410C'; g.stroke(sel.path); }
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.textAlign = 'center'; g.textBaseline = 'middle';
      for (const c of D.countries) {
        if (!c.label) continue; const px = c.label[0] * s + tx, py = c.label[1] * s + ty, wpx = c.label[2] * s;
        if (px < -50 || px > W + 50 || py < -20 || py > H + 20 || wpx < Math.max(28, c.name.length * 5.2)) continue;
        const fs = clamp(wpx / c.name.length * 1.1, 9, 15); g.font = '650 ' + fs + 'px ' + getComputedStyle(document.body).fontFamily; g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.8)'; g.strokeText(c.name, px, py); g.fillStyle = '#2B2F3A'; g.fillText(c.name, px, py);
      }
      g.font = '22px system-ui'; for (const p of places) { const [x, y] = WorldData.merc(p.lon, p.lat).map(q => q * D.S); const px = x * s + tx, py = y * s + ty; if (px < -20 || px > W + 20 || py < -20 || py > H + 20) continue; g.textBaseline = 'bottom'; g.fillText('📍', px, py + 4); g.font = '700 12px ' + getComputedStyle(document.body).fontFamily; g.lineWidth = 3; g.strokeStyle = '#fff'; g.strokeText(p.name, px, py + 14); g.fillStyle = '#B91C1C'; g.fillText(p.name, px, py + 14); g.font = '22px system-ui'; }
      const hm = GoHome.get(); if (hm && hm.lat != null) { const [x, y] = WorldData.merc(hm.lon, hm.lat).map(q => q * D.S); const px = x * s + tx, py = y * s + ty; if (px > -20 && px < W + 20 && py > -20 && py < H + 20) { g.font = '24px system-ui'; g.textBaseline = 'bottom'; g.fillText('🏠', px, py + 6); } }
      if (me) { const [x, y] = WorldData.merc(me.lon, me.lat).map(q => q * D.S); const px = x * s + tx, py = y * s + ty; g.fillStyle = 'rgba(10,132,255,.18)'; g.beginPath(); g.arc(px, py, Math.max(10, me.acc / 1000 / 40075 * D.S * s * Math.cos(me.lat * Math.PI / 180) ** -1), 0, 6.283); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(px, py, 9, 0, 6.283); g.fill(); g.fillStyle = '#0A84FF'; g.beginPath(); g.arc(px, py, 6.5, 0, 6.283); g.fill(); }
      const [lo, la] = WorldData.unmerc((W / 2 - tx) / s / D.S, (H / 2 - ty) / s / D.S);
      info.innerHTML = ''; info.append(h('span', null, 'Center: ' + Math.abs(la).toFixed(1) + '°' + (la >= 0 ? 'N' : 'S') + ', ' + Math.abs(lo).toFixed(1) + '°' + (lo >= 0 ? 'E' : 'W') + ' · zoom ' + (s / minS()).toFixed(1) + '×'));
    }
    function zoomAt(k, px = W / 2, py = H / 2) { const [wx, wy] = toWorld(px, py); s = clamp(s * k, minS(), 400); tx = px - wx * s; ty = py - wy * s; clampView(); draw(); }
    const ptrs = new Map(); let pinch = null, moved = 0, downAt = 0, longT = null;
    cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]); moved = 0; downAt = Date.now(); if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), s }; clearTimeout(longT); } else { const r = cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top; clearTimeout(longT); longT = setTimeout(() => { if (moved < 8) { const [wx, wy] = toWorld(px, py); const [lo, la] = WorldData.unmerc(wx / D.S, wy / D.S); addPlace(la, lo); } }, 650); } });
    cv.addEventListener('pointermove', e => {
      if (!ptrs.has(e.pointerId)) return; const prev = ptrs.get(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]);
      if (ptrs.size === 2 && pinch) { const [a, b] = [...ptrs.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]); const r = cv.getBoundingClientRect(); const k = (pinch.s * d / pinch.d) / s; zoomAt(k, (a[0] + b[0]) / 2 - r.left, (a[1] + b[1]) / 2 - r.top); moved += 10; return; }
      const dx = e.clientX - prev[0], dy = e.clientY - prev[1]; moved += Math.abs(dx) + Math.abs(dy); if (moved > 8) clearTimeout(longT); tx += dx; ty += dy; clampView(); draw();
    });
    const up = e => {
      clearTimeout(longT); ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch = null;
      if (moved < 8 && Date.now() - downAt < 600 && e.type === 'pointerup') { const r = cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top; const [wx, wy] = toWorld(px, py);
        const pin = places.find(p => { const [x, y] = WorldData.merc(p.lon, p.lat).map(q => q * D.S * s); return Math.hypot(x + tx - px, y + ty - py + 12) < 18; });
        if (pin) return showPlace(pin); const c = WorldData.hit(D, wx, wy); sel = c; draw(); if (c) showCountry(c); }
    };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('wheel', e => { e.preventDefault(); const r = cv.getBoundingClientRect(); zoomAt(Math.exp(-e.deltaY * 0.002), e.clientX - r.left, e.clientY - r.top); }, { passive: false });
    cv.addEventListener('dblclick', e => { const r = cv.getBoundingClientRect(); zoomAt(2, e.clientX - r.left, e.clientY - r.top); });
    function showCountry(c) {
      const f = c.f; const row = (k, val) => val ? [h('dt', null, k), h('dd', null, val)] : [];
      UI.sheet({ title: (f.flag ? f.flag + ' ' : '') + c.name, onClose: () => { sel = null; draw(); }, body: h('div', null,
        f.official && f.official !== c.name ? h('p', { class: 'muted small' }, f.official) : null,
        h('dl', { class: 'facts' }, row('Capital', f.capital), row('Region', [f.sub || f.region].filter(Boolean).join('')), row('Size', f.area ? Math.round(f.area).toLocaleString() + ' km²' : ''), row('Languages', (f.lang || []).join(', ')), row('Money', (f.money || []).join(', ')), row('Borders', f.borders != null ? (f.borders ? f.borders + ' countries' : 'No land borders') + (f.land ? ' · no coast' : '') : '')),
        me ? h('p', { class: 'small muted mt' }, '📏 About ' + fmtKm(haversine(me.lat, me.lon, f.latlng[0], f.latlng[1])) + ' from you (to the middle of the country).') : null),
        actions: [{ label: '🔊 Say it', onClick: () => Speak.say(c.name + (f.capital ? '. Capital: ' + f.capital : '')) }, { label: '🌍 Google Maps', onClick: cl => { cl(); gmaps(c.name); } }, { label: 'Zoom to it', cls: 'pri', onClick: cl => { cl(); sel = c; fit(...c.bb, 0.3); } }] });
    }
    function gmaps(query, label) {
      const inp = h('input', { type: 'search', placeholder: 'Search a place, address or shop', value: label || query || '', enterkeyhint: 'search' }), frame = h('div', { style: { marginTop: '10px' } });
      const q = () => inp.value.trim() || (me ? me.lat.toFixed(5) + ',' + me.lon.toFixed(5) : '');
      const show = () => { frame.innerHTML = ''; const v2 = query && !inp.value.trim() ? query : q(); if (!v2) return; if (!navigator.onLine) { frame.append(h('div', { class: 'note-banner' }, '📴 Google Maps needs internet. The world map here still works offline.')); return; }
        frame.append(h('iframe', { src: 'https://www.google.com/maps?q=' + encodeURIComponent(query && /^-?\d/.test(query) && label === inp.value.trim() ? query : v2) + '&z=15&output=embed', title: 'Google Maps', loading: 'lazy', referrerpolicy: 'no-referrer-when-downgrade', style: { width: '100%', height: '55vh', border: 0, borderRadius: '14px' } })); };
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') { query = ''; show(); } });
      const target = () => (query && label === inp.value.trim() ? query : q());
      UI.sheet({ title: '🌍 Google Maps', body: h('div', null, inp, frame, h('p', { class: 'tiny muted mt' }, 'Google Maps works online. “Open app” uses the Google Maps app if you have it, or the website.')),
        actions: [{ label: '🧭 Directions', onClick: () => { const t = target(); if (t) openOut('comgooglemaps://?daddr=' + encodeURIComponent(t) + '&directionsmode=driving', 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(t)); } },
          { label: 'Open app ↗', cls: 'pri', onClick: () => { const t = target(); openOut('comgooglemaps://?q=' + encodeURIComponent(t), 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(t)); } }] });
      show(); if (!query && !label) setTimeout(() => inp.focus(), 80);
    }
    async function locate() {
      UI.toast('Finding you…');
      try { const c = await geoHere(); me = { lat: c.latitude, lon: c.longitude, acc: c.accuracy || 50 }; const [x, y] = WorldData.merc(me.lon, me.lat).map(q => q * D.S); s = Math.max(s, minS() * 12); tx = W / 2 - x * s; ty = H / 2 - y * s; clampView(); draw(); const k = WorldData.hit(D, x, y); UI.toast('You are ' + (k ? 'in ' + k.name : 'here') + ' (±' + fmtKm(me.acc / 1000) + ')', 3500); paintPlaces(); paintHome(); }
      catch (e) { UI.toast(e.message, 4000); }
    }
    async function addPlace(lat, lon) {
      if (lat == null) { try { const c = await geoHere(); lat = c.latitude; lon = c.longitude; me = { lat, lon, acc: c.accuracy || 50 }; } catch (e) { UI.toast(e.message + ' You can also press and hold on the map.', 4500); return; } }
      const name = await UI.prompt('Name this place', { placeholder: 'e.g. Home, Grandma’s, Beach' }); if (!name) return;
      await DB.put('places', { id: uid(), name: name.trim(), lat, lon, created: Date.now() }); await loadPlaces(); draw(); UI.toast('Saved ⭐');
    }
    function showPlace(p) {
      UI.sheet({ title: '📍 ' + p.name, body: h('div', null, h('p', null, Math.abs(p.lat).toFixed(4) + '°' + (p.lat >= 0 ? 'N' : 'S') + ', ' + Math.abs(p.lon).toFixed(4) + '°' + (p.lon >= 0 ? 'E' : 'W')), me ? h('p', null, '📏 ' + fmtKm(haversine(me.lat, me.lon, p.lat, p.lon)) + ' away (straight line)') : null, h('p', { class: 'muted small' }, 'Saved ' + fmtDay(new Date(p.created)))),
        actions: [{ label: 'Delete', cls: 'bad', onClick: async c => { await DB.del('places', p.id); c(); await loadPlaces(); draw(); } }, { label: '🌍 Google', onClick: c => { c(); gmaps(p.lat.toFixed(5) + ',' + p.lon.toFixed(5), p.name); } }, { label: 'Go there', cls: 'pri', onClick: c => { c(); const [x, y] = WorldData.merc(p.lon, p.lat).map(q => q * D.S); s = Math.max(s, minS() * 20); tx = W / 2 - x * s; ty = H / 2 - y * s; clampView(); draw(); } }] });
    }
    function paintHome() { const hm = GoHome.get(), set = GoHome.isSet(); homeBox.innerHTML = '';
      homeBox.append(h('div', { class: 'sec' }, '🏠 Home'), h('div', { class: 'list' }, h('button', { class: 'li', onclick: () => GoHome.setup() }, h('span', { class: 'ic' }, '🏠'), h('span', { class: 't' }, h('b', null, set ? GoHome.where() : 'Set your home'), h('small', null, set ? ((GoHome.MODES.find(m => m[0] === hm.mode) || GoHome.MODES[0])[1] + ' · ' + (hm.app === 'apple' ? 'Apple Maps' : 'Google Maps') + (hm.lat != null ? (me ? ' · ' + fmtKm(haversine(me.lat, me.lon, hm.lat, hm.lon)) + ' away' : ' · GPS spot saved') : '')) : 'Then “Take me home” works in one tap')), h('span', { class: 'chev' }, set ? '✏️' : '›')))); }
    const onHome = () => { paintHome(); draw(); }; document.addEventListener('home-changed', onHome);
    async function loadPlaces() { places = (await DB.all('places')).sort((a, b) => b.created - a.created); paintPlaces(); }
    function paintPlaces() { placesBox.innerHTML = ''; if (!places.length) return; placesBox.append(h('div', { class: 'sec' }, '⭐ My places'), h('div', { class: 'list' }, places.map(p => h('button', { class: 'li', onclick: () => showPlace(p) }, h('span', { class: 'ic' }, '📍'), h('span', { class: 't' }, h('b', null, p.name), h('small', null, me ? fmtKm(haversine(me.lat, me.lon, p.lat, p.lon)) + ' away' : p.lat.toFixed(3) + ', ' + p.lon.toFixed(3))), h('span', { class: 'chev' }, '›'))))); }
    search.addEventListener('keydown', e => { if (e.key !== 'Enter') return; const q2 = search.value.trim().toLowerCase(); if (!q2) return; const c = D.countries.find(c => c.name.toLowerCase() === q2) || D.countries.find(c => c.name.toLowerCase().startsWith(q2)) || D.countries.find(c => c.name.toLowerCase().includes(q2) || (c.f.capital || '').toLowerCase() === q2); if (!c) return UI.toast('No country called “' + search.value + '”'); search.blur(); sel = c; fit(...c.bb, 0.3); setTimeout(() => showCountry(c), 300); });
    const onRs = () => { size(); clampView(); draw(); }; addEventListener('resize', onRs);
    size(); s = minS(); fit(0, D.S * 0.12, D.S, D.S * 0.82, 0); paintHome(); await loadPlaces();
    if (ctx.param === 'home') GoHome.go();
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', onRs); clearTimeout(longT); document.removeEventListener('home-changed', onHome); };
  },
});

/* ---- 42-weather.js ---- */
/* ===== Weather: downloads a 7-day forecast when online (Open-Meteo, no account), keeps it for offline ===== */
addCSS(`
.wx-now{border-radius:22px;padding:20px;color:#fff;background:linear-gradient(160deg,#4FACFE,#2B6CDE);box-shadow:0 10px 30px rgba(40,100,220,.3)}
.wx-now.night{background:linear-gradient(160deg,#2C3E7A,#141A3A)}
.wx-now .t{font-size:72px;font-weight:300;line-height:1;font-family:var(--round)}
.wx-now .e{font-size:64px;line-height:1}
.wx-hours{display:flex;gap:6px;overflow-x:auto;padding:4px 0 6px;scrollbar-width:none}
.wx-hours::-webkit-scrollbar{display:none}
.wx-hours div{flex:0 0 auto;width:62px;text-align:center;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:8px 2px;font-size:13px}
.wx-hours b{display:block;font-size:16px}
.wx-hours span{display:block;font-size:24px;margin:2px 0}
.wx-day{display:grid;grid-template-columns:64px 34px 40px 1fr 40px;gap:8px;align-items:center;padding:10px 14px;border-top:1px solid var(--line)}
.wx-day:first-child{border-top:0}
.wx-bar{height:6px;border-radius:3px;background:var(--surface2);position:relative}
.wx-bar i{position:absolute;top:0;bottom:0;border-radius:3px;background:linear-gradient(90deg,#4FACFE,#FFB347)}
`);
const WMO = { 0: ['☀️', 'Clear sky'], 1: ['🌤️', 'Mostly clear'], 2: ['⛅', 'Partly cloudy'], 3: ['☁️', 'Cloudy'], 45: ['🌫️', 'Fog'], 48: ['🌫️', 'Icy fog'], 51: ['🌦️', 'Light drizzle'], 53: ['🌦️', 'Drizzle'], 55: ['🌧️', 'Heavy drizzle'], 56: ['🌧️', 'Freezing drizzle'], 57: ['🌧️', 'Freezing drizzle'], 61: ['🌦️', 'Light rain'], 63: ['🌧️', 'Rain'], 65: ['🌧️', 'Heavy rain'], 66: ['🌧️', 'Freezing rain'], 67: ['🌧️', 'Freezing rain'], 71: ['🌨️', 'Light snow'], 73: ['🌨️', 'Snow'], 75: ['❄️', 'Heavy snow'], 77: ['🌨️', 'Snow grains'], 80: ['🌦️', 'Rain showers'], 81: ['🌧️', 'Rain showers'], 82: ['⛈️', 'Heavy showers'], 85: ['🌨️', 'Snow showers'], 86: ['❄️', 'Snow showers'], 95: ['⛈️', 'Thunderstorm'], 96: ['⛈️', 'Thunderstorm + hail'], 99: ['⛈️', 'Thunderstorm + hail'] };
const wmo = (c, day = 1) => { const w = WMO[c] || ['🌡️', 'Weather']; if (!day && (c === 0 || c === 1)) return ['🌙', c ? 'Mostly clear' : 'Clear night']; return w; };
const Weather = {
  places() { return Prefs.get('wxPlaces', []); },
  cur() { const p = this.places(); return p[Prefs.get('wxIdx', 0)] || p[0] || null; },
  unit() { return Prefs.get('wxUnit', 'C'); },
  t(c) { return this.unit() === 'F' ? Math.round(c * 9 / 5 + 32) + '°' : Math.round(c) + '°'; },
  async fetch(p) {
    const u = 'https://api.open-meteo.com/v1/forecast?latitude=' + p.lat.toFixed(3) + '&longitude=' + p.lon.toFixed(3) + '&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day,precipitation&hourly=temperature_2m,precipitation_probability,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max&timezone=auto&forecast_days=7';
    const r = await fetch(u, { cache: 'no-store' }); if (!r.ok) throw new Error('Weather service error ' + r.status); const d = await r.json(); d.at = Date.now(); await DB.kset('wx:' + p.id, d); return d;
  },
  async peek() { const p = this.cur(); if (!p) return null; const d = await DB.kget('wx:' + p.id, null); if (!d) return null; const hr = this.nowHour(d); return { temp: this.t(hr ? hr.t : d.current.temperature_2m), icon: wmo(hr ? hr.code : d.current.weather_code, hr ? hr.day : d.current.is_day)[0], place: p.name }; },
  nowHour(d) { const H = d.hourly; if (!H) return null; const now = Date.now(); for (let i = 0; i < H.time.length; i++) { const t = this.when(d, H.time[i]); if (t > now - 3600e3 && t <= now) return { t: H.temperature_2m[i], code: H.weather_code[i], day: H.is_day ? H.is_day[i] : 1 }; } return null; },
  when(d, iso) { return Date.parse(iso + 'Z') - (d.utc_offset_seconds || 0) * 1000; },
};
Apps.reg({
  id: 'weather', name: 'Weather', icon: '⛅', color: 'linear-gradient(135deg,#74B9FF,#0984E3)', group: 'day', keys: 'forecast rain temperature sun', blurb: 'Forecast, saved for offline',
  mount(v, ctx) {
    const body = h('div');
    v.append(body);
    ctx.setActions(h('button', { class: 'btn ghost sm', onclick: () => { Prefs.set('wxUnit', Weather.unit() === 'C' ? 'F' : 'C'); draw(); } }, '°C / °F'), h('button', { class: 'ib', 'aria-label': 'Places', onclick: places }, '📍'));
    async function draw(refresh) {
      body.innerHTML = ''; const p = Weather.cur();
      if (!p) { body.append(UI.empty('⛅', 'Pick a place', 'I download a 7-day forecast while you have internet and keep it, so you can still check it offline.'), h('div', { class: 'row', style: { justifyContent: 'center' } }, h('button', { class: 'btn pri', onclick: useMine }, '📍 Use my location'), h('button', { class: 'btn', onclick: findCity }, '🔎 Search a city'))); return; }
      let d = await DB.kget('wx:' + p.id, null); let err = '';
      if ((refresh || !d || Date.now() - d.at > 30 * 60e3) && navigator.onLine) { body.append(h('div', { class: 'empty' }, d ? '' : 'Getting the forecast…')); try { d = await Weather.fetch(p); } catch (e) { err = e.message; } body.innerHTML = ''; }
      const all = Weather.places();
      if (all.length > 1) body.append(h('div', { class: 'tabs' }, all.map((q, i) => h('button', { 'aria-pressed': String(q.id === p.id), onclick: () => { Prefs.set('wxIdx', i); draw(); } }, q.name))));
      if (!d) { body.append(UI.empty('📡', 'No forecast saved yet', navigator.onLine ? 'Could not reach the weather service. ' + err : 'Connect to the internet once to download the forecast.'), h('div', { class: 'center' }, h('button', { class: 'btn pri', onclick: () => draw(true) }, 'Try again'))); return; }
      const age = Date.now() - d.at;
      if (!navigator.onLine || err) body.append(h('div', { class: 'note-banner' }, '📴 ' + (navigator.onLine ? 'Couldn’t refresh. ' : 'You’re offline. ') + 'Showing the forecast saved ' + fmtAgo(d.at) + '.'));
      else if (age > 3 * 3600e3) body.append(h('div', { class: 'note-banner' }, 'This forecast is from ' + fmtAgo(d.at) + '. Tap refresh.'));
      const nh = Weather.nowHour(d), useNow = age < 2 * 3600e3, cu = d.current;
      const temp = useNow || !nh ? cu.temperature_2m : nh.t, code = useNow || !nh ? cu.weather_code : nh.code, day = useNow || !nh ? cu.is_day : nh.day;
      const [ico, words] = wmo(code, day);
      const D = d.daily, todayI = Math.max(0, D.time.indexOf(ymd(new Date())));
      body.append(h('div', { class: 'wx-now' + (day ? '' : ' night') },
        h('div', { class: 'row nw' }, h('div', { style: { flex: 1 } }, h('div', { style: { fontWeight: 700, fontSize: '18px' } }, '📍 ' + p.name), h('div', { class: 't' }, Weather.t(temp)), h('div', { style: { fontSize: '18px', fontWeight: 600 } }, words)), h('div', { class: 'e' }, ico)),
        h('div', { class: 'row mt', style: { opacity: .92, fontSize: '15px', gap: '14px' } }, h('span', null, '↑ ' + Weather.t(D.temperature_2m_max[todayI]) + '  ↓ ' + Weather.t(D.temperature_2m_min[todayI])), useNow ? h('span', null, 'Feels ' + Weather.t(cu.apparent_temperature)) : null, useNow ? h('span', null, '💧 ' + cu.relative_humidity_2m + '%') : null, useNow ? h('span', null, '💨 ' + Math.round(Weather.unit() === 'F' ? cu.wind_speed_10m * 0.621 : cu.wind_speed_10m) + (Weather.unit() === 'F' ? ' mph' : ' km/h')) : null)));
      const H = d.hourly, now = Date.now(), hrs = h('div', { class: 'wx-hours' });
      for (let i = 0; i < H.time.length && hrs.childNodes.length < 24; i++) { const t = Weather.when(d, H.time[i]); if (t < now - 3600e3) continue; const dt = new Date(t); hrs.append(h('div', null, h('small', null, hrs.childNodes.length ? dt.toLocaleTimeString(undefined, { hour: 'numeric' }) : 'Now'), h('span', null, wmo(H.weather_code[i], H.is_day ? H.is_day[i] : 1)[0]), h('b', null, Weather.t(H.temperature_2m[i])), H.precipitation_probability && H.precipitation_probability[i] > 10 ? h('small', { style: { color: '#2B8BE0' } }, H.precipitation_probability[i] + '%') : h('small', null, ' '))); }
      if (hrs.childNodes.length) body.append(h('div', { class: 'sec' }, 'Next hours'), hrs); else body.append(h('div', { class: 'note-banner mt' }, 'The saved hourly forecast has run out. Connect to refresh.'));
      const lo = Math.min(...D.temperature_2m_min), hi = Math.max(...D.temperature_2m_max), days = h('div', { class: 'list' });
      D.time.forEach((ds, i) => { const dd = fromYmd(ds); const a = (D.temperature_2m_min[i] - lo) / (hi - lo || 1) * 100, b = (D.temperature_2m_max[i] - lo) / (hi - lo || 1) * 100;
        days.append(h('div', { class: 'wx-day' }, h('b', null, ds === ymd(new Date()) ? 'Today' : fmtDay(dd, { weekday: 'short' })), h('span', { style: { fontSize: '22px' } }, wmo(D.weather_code[i])[0]), h('span', { class: 'muted' }, Weather.t(D.temperature_2m_min[i])), h('div', { class: 'wx-bar' }, h('i', { style: { left: a + '%', right: (100 - b) + '%' } })), h('b', null, Weather.t(D.temperature_2m_max[i])))); });
      body.append(h('div', { class: 'sec' }, '7 days'), days);
      const sr = D.sunrise && D.sunrise[todayI], ss = D.sunset && D.sunset[todayI];
      body.append(h('div', { class: 'grid3 mt' }, h('div', { class: 'stat' }, h('b', null, sr ? fmtTime(new Date(Weather.when(d, sr))) : '—'), h('small', null, '🌅 Sunrise')), h('div', { class: 'stat' }, h('b', null, ss ? fmtTime(new Date(Weather.when(d, ss))) : '—'), h('small', null, '🌇 Sunset')), h('div', { class: 'stat' }, h('b', null, D.uv_index_max ? Math.round(D.uv_index_max[todayI]) : '—'), h('small', null, '😎 UV max'))),
        h('div', { class: 'row mt' }, h('button', { class: 'btn', disabled: !navigator.onLine, onclick: () => draw(true) }, '↻ Refresh'), h('span', { class: 'sp small muted' }, 'Updated ' + fmtAgo(d.at))),
        h('p', { class: 'tiny muted mt' }, 'Weather data by Open-Meteo.com. Only the place’s rough position is sent, and only when you refresh.'));
    }
    async function savePlace(p) { const all = Weather.places().filter(q => !(Math.abs(q.lat - p.lat) < 0.02 && Math.abs(q.lon - p.lon) < 0.02)); all.push(p); Prefs.set('wxPlaces', all); Prefs.set('wxIdx', all.length - 1); }
    async function useMine() {
      UI.toast('Finding you…');
      try { const c = await geoHere(); let nm = 'My location'; try { const k = await WorldData.countryAt(c.latitude, c.longitude); if (k) nm = 'Here (' + k.name + ')'; } catch (e) { } await savePlace({ id: uid(), name: nm, lat: c.latitude, lon: c.longitude }); draw(true); }
      catch (e) { UI.toast(e.message, 4000); }
    }
    function findCity() {
      if (!navigator.onLine) return UI.toast('Searching cities needs internet. “Use my location” works with GPS.', 4000);
      const inp = h('input', { type: 'search', placeholder: 'City name', autocomplete: 'off' }), res = h('div', { class: 'mt' });
      const run = debounce(async () => { const q = inp.value.trim(); if (q.length < 2) return; try { const r = await fetch('https://geocoding-api.open-meteo.com/v1/search?count=8&language=en&name=' + encodeURIComponent(q)); const d = await r.json(); res.innerHTML = ''; res.append(h('div', { class: 'list' }, (d.results || []).map(c => h('button', { class: 'li', onclick: async () => { await savePlace({ id: uid(), name: c.name, lat: c.latitude, lon: c.longitude, country: c.country }); s.close(); draw(true); } }, h('span', { class: 't' }, h('b', null, c.name), h('small', null, [c.admin1, c.country].filter(Boolean).join(', '))))))); if (!(d.results || []).length) res.append(h('p', { class: 'muted' }, 'No cities found.')); } catch (e) { res.textContent = 'Search failed.'; } }, 350);
      inp.addEventListener('input', run);
      const s = UI.sheet({ title: 'Find a city', body: h('div', null, inp, res) });
    }
    function places() {
      const all = Weather.places();
      UI.sheet({ title: 'Weather places', body: h('div', null, all.length ? h('div', { class: 'list' }, all.map((p, i) => h('div', { class: 'li' }, h('span', { class: 't' }, h('b', null, p.name), h('small', null, p.lat.toFixed(2) + ', ' + p.lon.toFixed(2))), h('button', { class: 'ib', 'aria-label': 'Remove', html: SVG.trash, onclick: async e => { const nx = Weather.places().filter(q => q.id !== p.id); Prefs.set('wxPlaces', nx); Prefs.set('wxIdx', 0); await DB.kdel('wx:' + p.id); e.currentTarget.closest('.li').remove(); draw(); } })))) : h('p', { class: 'muted' }, 'No places yet.'),
        h('div', { class: 'row mt' }, h('button', { class: 'btn pri', onclick: useMine }, '📍 My location'), h('button', { class: 'btn', onclick: findCity }, '🔎 Search a city'))) });
    }
    const on = () => draw(); addEventListener('online', on); addEventListener('offline', on);
    draw();
    return () => { removeEventListener('online', on); removeEventListener('offline', on); };
  },
});

/* ---- 43-calc.js ---- */
/* ===== Calculator: standard + scientific, safe parser (no eval), history ===== */
addCSS(`
.calc{max-width:440px;margin:0 auto}
.cdisp{text-align:right;padding:10px 6px 14px;min-height:130px;display:flex;flex-direction:column;justify-content:flex-end}
.cdisp .ex{font-size:20px;color:var(--muted);min-height:28px;word-break:break-all;font-variant-numeric:tabular-nums}
.cdisp .rs{font-size:64px;font-weight:300;line-height:1.05;font-variant-numeric:tabular-nums;word-break:break-all;font-family:var(--round)}
.ckeys{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.ckeys.sci{grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin-bottom:10px}
.ck{aspect-ratio:1/1;border:0;border-radius:50%;font-size:30px;font-weight:500;background:#333438;color:#fff;display:grid;place-items:center;padding:0}
.ckeys.sci .ck{aspect-ratio:auto;height:42px;border-radius:21px;font-size:16px;background:var(--surface2);color:var(--ink)}
.ck.fn{background:#A5A5A5;color:#111}.ck.op{background:#FF9F0A}.ck.op.on{background:#fff;color:#FF9F0A}
.ck.zero{grid-column:span 2;aspect-ratio:auto;border-radius:999px;justify-content:start;padding-left:30px}
.ck:active{filter:brightness(1.3)}
`);
const Calc = {
  eval(src, deg) {
    let s = src.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/π/g, ' pi ').replace(/√/g, ' sqrt ').replace(/²/g, '^2').replace(/,/g, '');
    const toks = []; const re = /\s*(\d+\.?\d*(?:e[+-]?\d+)?|\.\d+|pi|sqrt|sin|cos|tan|asin|acos|atan|ln|log|e|[+\-*/^%!()])/y; let m;
    while (re.lastIndex < s.length) { const at = re.lastIndex; if (/^\s*$/.test(s.slice(at))) break; m = re.exec(s); if (!m) throw new Error('?'); toks.push(m[1]); }
    let open = 0; for (const t of toks) open += t === '(' ? 1 : t === ')' ? -1 : 0; while (open-- > 0) toks.push(')');
    let i = 0; const peek = () => toks[i], next = () => toks[i++];
    const rad = x => deg ? x * Math.PI / 180 : x, unrad = x => deg ? x * 180 / Math.PI : x;
    const F = { sqrt: Math.sqrt, sin: x => Math.sin(rad(x)), cos: x => Math.cos(rad(x)), tan: x => Math.tan(rad(x)), asin: x => unrad(Math.asin(x)), acos: x => unrad(Math.acos(x)), atan: x => unrad(Math.atan(x)), ln: Math.log, log: Math.log10 };
    const fact = n => { if (n < 0 || n !== Math.floor(n) || n > 170) throw new Error('?'); let r = 1; for (let k = 2; k <= n; k++) r *= k; return r; };
    const startsPrimary = t => t != null && (/^[\d.]/.test(t) || t === '(' || t === 'pi' || t === 'e' || t in F);
    function expr() { let v = term(); while (peek() === '+' || peek() === '-') { const o = next(), r = term(); v = o === '+' ? v + r : v - r; } return v; }
    function term() { let v = power(); for (; ;) { const t = peek(); if (t === '*' || t === '/') { next(); const r = power(); if (t === '/' && r === 0) throw new Error('Can’t divide by 0'); v = t === '*' ? v * r : v / r; } else if (startsPrimary(t)) v *= power(); else return v; } }
    function power() { const b = unary(); if (peek() === '^') { next(); return Math.pow(b, power()); } return b; }
    function unary() { if (peek() === '-') { next(); return -unary(); } if (peek() === '+') { next(); return unary(); } return post(); }
    function post() { let v = prim(); while (peek() === '!' || peek() === '%') { v = next() === '!' ? fact(v) : v / 100; } return v; }
    function prim() {
      const t = next(); if (t == null) throw new Error('?');
      if (/^[\d.]/.test(t)) return parseFloat(t); if (t === 'pi') return Math.PI; if (t === 'e') return Math.E;
      if (t === '(') { const v = expr(); if (next() !== ')') throw new Error('?'); return v; }
      if (t in F) { const a = peek() === '(' ? prim() : power(); return F[t](a); }
      throw new Error('?');
    }
    const v = expr(); if (i < toks.length) throw new Error('?'); if (!isFinite(v)) throw new Error(isNaN(v) ? 'Not a number' : 'Too big'); return v;
  },
  fmt(v) { if (Math.abs(v) >= 1e15 || (Math.abs(v) < 1e-9 && v !== 0)) return v.toExponential(8).replace(/\.?0+e/, 'e'); const r = Number(v.toPrecision(12)); return r.toLocaleString(undefined, { maximumFractionDigits: 10 }); },
};
Apps.reg({
  id: 'calc', name: 'Calculator', icon: '🧮', color: 'linear-gradient(135deg,#FFB547,#FF7A00)', group: 'tools', keys: 'math numbers add multiply scientific', blurb: 'Standard + scientific',
  mount(v, ctx) {
    let ex = '', last = '', sci = Prefs.get('calcSci', false), deg = Prefs.get('calcDeg', true), justDone = false;
    const exEl = h('div', { class: 'ex' }), rsEl = h('div', { class: 'rs', 'aria-live': 'polite' }), sciBox = h('div', { class: 'ckeys sci' }), keys = h('div', { class: 'ckeys' });
    v.append(h('div', { class: 'calc' }, h('div', { class: 'cdisp' }, exEl, rsEl), sciBox, keys));
    ctx.setActions(h('button', { class: 'btn ghost sm', onclick: hist }, '🕘'), h('button', { class: 'btn ghost sm', onclick: () => { sci = !sci; Prefs.set('calcSci', sci); build(); } }, sci ? '123' : 'ƒx'));
    const preview = () => { if (!ex) return ''; try { return Calc.fmt(Calc.eval(ex, deg)); } catch (e) { return ''; } };
    function paint() {
      exEl.textContent = justDone ? last : ex.length ? ex : ' ';
      const out = justDone ? rsEl.dataset.v : (preview() || (ex ? rsEl.dataset.p || '' : '0'));
      rsEl.textContent = out || ex || '0'; if (!justDone) rsEl.dataset.p = preview();
      const len = rsEl.textContent.length; rsEl.style.fontSize = len > 14 ? '34px' : len > 10 ? '46px' : '64px';
      const ac = keys.querySelector('[data-k="AC"]'); if (ac) ac.textContent = ex && !justDone ? '⌫' : 'AC';
    }
    function press(k) {
      Sfx.tap();
      if (k === 'AC') { if (ex && !justDone) ex = ex.slice(0, -1); else { ex = ''; last = ''; } justDone = false; return paint(); }
      if (k === '=') { if (!ex) return; try { const r = Calc.eval(ex, deg); const out = Calc.fmt(r); const H = Prefs.get('calcHist', []); H.unshift({ ex, out, at: Date.now() }); Prefs.set('calcHist', H.slice(0, 40)); last = ex + ' ='; ex = String(Number(r.toPrecision(12))); rsEl.dataset.v = out; justDone = true; } catch (e) { rsEl.dataset.v = e.message === '?' ? 'Error' : e.message; last = ex; justDone = true; ex = ''; } return paint(); }
      if (k === '±') { ex = ex ? (ex.startsWith('−(') && ex.endsWith(')') ? ex.slice(2, -1) : '−(' + ex + ')') : '−'; justDone = false; return paint(); }
      if (k === 'deg') { deg = !deg; Prefs.set('calcDeg', deg); build(); return; }
      const isOp = /^[+−×÷^]$/.test(k);
      if (justDone && !isOp && !['%', '!', '²'].includes(k)) ex = '';
      justDone = false;
      if (isOp && /[+−×÷^]$/.test(ex)) ex = ex.slice(0, -1);
      if (['sin', 'cos', 'tan', 'ln', 'log', '√', 'asin', 'acos', 'atan'].includes(k)) ex += k + '('; else if (k === '1/x') ex = '1÷(' + (ex || '1') + ')'; else ex += k;
      paint();
    }
    const btn = (k, cls = '', label) => h('button', { class: 'ck ' + cls, 'data-k': k, 'aria-label': label || k, onclick: () => press(k) }, label || k);
    function build() {
      keys.innerHTML = ''; sciBox.innerHTML = ''; sciBox.hidden = !sci;
      if (sci) sciBox.append(...[['(', '('], [')', ')'], ['²', 'x²'], ['^', 'xʸ'], ['√', '√'], ['sin', 'sin'], ['cos', 'cos'], ['tan', 'tan'], ['ln', 'ln'], ['log', 'log'], ['π', 'π'], ['e', 'e'], ['!', 'x!'], ['1/x', '1/x'], ['deg', deg ? 'Deg' : 'Rad']].map(([k, l]) => btn(k, '', l)));
      keys.append(btn('AC', 'fn'), btn('±', 'fn', '+/−'), btn('%', 'fn'), btn('÷', 'op'), btn('7'), btn('8'), btn('9'), btn('×', 'op'), btn('4'), btn('5'), btn('6'), btn('−', 'op'), btn('1'), btn('2'), btn('3'), btn('+', 'op'), btn('0', 'zero'), btn('.'), btn('=', 'op'));
      paint();
    }
    function hist() {
      const H = Prefs.get('calcHist', []);
      UI.sheet({ title: 'History', body: H.length ? h('div', { class: 'list' }, H.map(x => h('button', { class: 'li', onclick: e => { ex = x.ex; justDone = false; paint(); e.target.closest('.scrim').remove(); } }, h('span', { class: 't' }, h('small', null, x.ex), h('b', { style: { fontSize: '20px' } }, '= ' + x.out))))) : UI.empty('🕘', 'No history yet'), actions: H.length ? [{ label: 'Clear history', cls: 'bad', onClick: c => { Prefs.set('calcHist', []); c(); } }] : [] });
    }
    const kd = e => { if (e.target.tagName === 'INPUT') return; const map = { '*': '×', '/': '÷', '-': '−', Enter: '=', '=': '=', Backspace: 'AC', Escape: 'AC' }; const k = map[e.key] || e.key; if (/^[\d.+%()^!]$/.test(k) || ['×', '÷', '−', '='].includes(k) || (k === 'AC' && e.key === 'Backspace')) { e.preventDefault(); press(k); } };
    addEventListener('keydown', kd); build();
    return () => removeEventListener('keydown', kd);
  },
});

/* ---- 44-measure.js ---- */
/* ===== Measure: ruler, bubble level, unit converter, sound meter ===== */
addCSS(`
.ruler{position:relative;height:min(70vh,640px);height:min(70dvh,640px);border-radius:16px;background:linear-gradient(90deg,#FFE9A8,#FFD970);overflow:hidden;touch-action:none;color:#3A2A00}
.ruler canvas{position:absolute;inset:0;width:100%;height:100%}
.ruler .read{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:rgba(255,255,255,.85);border-radius:14px;padding:10px 14px;font-size:22px;font-weight:800;text-align:right;font-family:var(--round)}
.ruler .read small{display:block;font-size:13px;font-weight:600;color:#7A5A00}
.level{position:relative;width:min(300px,80vw);height:min(300px,80vw);margin:10px auto;border-radius:50%;background:radial-gradient(circle,var(--surface) 0,var(--surface2) 100%);border:2px solid var(--line);overflow:hidden}
.level .cross{position:absolute;inset:0}
.level .cross::before,.level .cross::after{content:"";position:absolute;background:var(--line)}
.level .cross::before{left:50%;top:0;bottom:0;width:2px;margin-left:-1px}.level .cross::after{top:50%;left:0;right:0;height:2px;margin-top:-1px}
.level .ring0{position:absolute;left:50%;top:50%;width:70px;height:70px;margin:-35px 0 0 -35px;border-radius:50%;border:2px dashed var(--muted)}
.level .bub{position:absolute;left:50%;top:50%;width:60px;height:60px;margin:-30px 0 0 -30px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#E8FFB0,#7BC74D);box-shadow:0 4px 12px rgba(60,120,20,.4);transition:transform .08s linear}
.level.flat .bub{background:radial-gradient(circle at 35% 35%,#C8FFE0,#18B65A)}
.lvread{text-align:center;font-size:56px;font-weight:300;font-family:var(--round);font-variant-numeric:tabular-nums}
.meterbar{height:22px;border-radius:11px;background:linear-gradient(90deg,#34C759,#FFCC00 60%,#FF3B30);position:relative;overflow:hidden}
.meterbar i{position:absolute;right:0;top:0;bottom:0;background:var(--surface2);transition:width .1s}
`);
const UNITS = {
  Length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.344, yd: 0.9144, ft: 0.3048, in: 0.0254 },
  Weight: { kg: 1, g: 0.001, mg: 1e-6, t: 1000, lb: 0.45359237, oz: 0.028349523, st: 6.35029318 },
  Temperature: { '°C': 'C', '°F': 'F', K: 'K' },
  Volume: { L: 1, mL: 0.001, 'm³': 1000, gal: 3.785411784, qt: 0.946352946, pt: 0.473176473, cup: 0.2365882365, 'fl oz': 0.0295735296, tbsp: 0.0147867648, tsp: 0.00492892159 },
  Speed: { 'km/h': 1, 'mph': 1.609344, 'm/s': 3.6, knot: 1.852 },
  Area: { 'm²': 1, 'km²': 1e6, 'cm²': 1e-4, ha: 1e4, acre: 4046.8564224, 'ft²': 0.09290304, 'mi²': 2589988.110336 },
  Time: { s: 1, min: 60, h: 3600, day: 86400, week: 604800, year: 31557600 },
  Data: { B: 1, KB: 1e3, MB: 1e6, GB: 1e9, TB: 1e12 },
};
const convert = (cat, val, a, b) => {
  if (cat !== 'Temperature') return val * UNITS[cat][a] / UNITS[cat][b];
  const c = a === '°C' ? val : a === '°F' ? (val - 32) * 5 / 9 : val - 273.15; return b === '°C' ? c : b === '°F' ? c * 9 / 5 + 32 : c + 273.15;
};
Apps.reg({
  id: 'measure', name: 'Measure', icon: '📏', color: 'linear-gradient(135deg,#FFD84D,#E6A700)', group: 'tools', keys: 'ruler level converter units sound decibel inches cm', blurb: 'Ruler, level, converter, sound meter',
  mount(v, ctx) {
    let tab = Prefs.get('measTab', 'ruler'), stop = null;
    const body = h('div');
    v.append(UI.tabs([['ruler', '📏 Ruler'], ['level', '🫧 Level'], ['conv', '🔁 Convert'], ['sound', '🔊 Sound']], tab, t => { tab = t; Prefs.set('measTab', t); show(); }), body);
    function show() { if (stop) stop(); stop = null; body.innerHTML = ''; ctx.setActions(); stop = ({ ruler, level, conv, sound })[tab](body) || null; }
    function ruler(el) {
      // CSS pixels per millimeter: iPhones are about 6.03 (460 ppi ÷ 3); you can calibrate with a bank card
      let pxmm = Prefs.get('pxmm', /iPhone/.test(navigator.userAgent) ? 6.03 : /iPad/.test(navigator.userAgent) ? 5.18 : 3.78), a = 0.2, b = 0.55;
      const cv = h('canvas'), read = h('div', { class: 'read' }), box = h('div', { class: 'ruler' }, cv, read);
      el.append(box, h('div', { class: 'row mt' }, h('button', { class: 'btn sm', onclick: calib }, '🎯 Calibrate with a card'), h('span', { class: 'small muted sp' }, 'Drag the two lines. Put the object against the left edge.')));
      const g = cv.getContext('2d');
      const draw = () => {
        const r = box.getBoundingClientRect(), d = devicePixelRatio || 1; cv.width = r.width * d; cv.height = r.height * d; g.setTransform(d, 0, 0, d, 0, 0); const H = r.height;
        g.clearRect(0, 0, r.width, H); g.strokeStyle = '#3A2A00'; g.fillStyle = '#3A2A00'; g.font = '700 13px ' + getComputedStyle(document.body).fontFamily; g.textBaseline = 'middle';
        for (let mm = 0; mm * pxmm < H; mm++) { const y = mm * pxmm, L = mm % 10 === 0 ? 34 : mm % 5 === 0 ? 24 : 14; g.lineWidth = mm % 10 ? 1 : 1.6; g.beginPath(); g.moveTo(0, y); g.lineTo(L, y); g.stroke(); if (mm % 10 === 0 && mm) g.fillText(mm / 10, 40, y); }
        const pxin = pxmm * 25.4; for (let s = 0; s * pxin / 16 < H; s++) { const y = s * pxin / 16, L = s % 16 === 0 ? 30 : s % 8 === 0 ? 22 : s % 4 === 0 ? 16 : 10; g.lineWidth = s % 16 ? 1 : 1.6; g.beginPath(); g.moveTo(r.width, y); g.lineTo(r.width - L, y); g.stroke(); if (s % 16 === 0 && s) { g.textAlign = 'right'; g.fillText(s / 16 + '"', r.width - 36, y); g.textAlign = 'left'; } }
        g.fillText('cm', 40, 12); g.textAlign = 'right'; g.fillText('in', r.width - 36, 12); g.textAlign = 'left';
        for (const [k, col] of [[a, '#E5383B'], [b, '#1D4ED8']]) { const y = k * H; g.strokeStyle = col; g.lineWidth = 3; g.beginPath(); g.moveTo(0, y); g.lineTo(r.width, y); g.stroke(); g.fillStyle = col; g.beginPath(); g.arc(r.width / 2, y, 12, 0, 6.283); g.fill(); }
        g.fillStyle = 'rgba(29,78,216,.08)'; g.fillRect(0, Math.min(a, b) * H, r.width, Math.abs(b - a) * H);
        const mmLen = Math.abs(b - a) * H / pxmm; read.innerHTML = (mmLen / 10).toFixed(1) + ' cm<small>' + (mmLen / 25.4).toFixed(2) + ' in</small>';
      };
      let dragging = null;
      box.addEventListener('pointerdown', e => { const r = box.getBoundingClientRect(), y = (e.clientY - r.top) / r.height; dragging = Math.abs(y - a) < Math.abs(y - b) ? 'a' : 'b'; box.setPointerCapture(e.pointerId); move(e); });
      const move = e => { if (!dragging) return; const r = box.getBoundingClientRect(), y = clamp((e.clientY - r.top) / r.height, 0, 1); if (dragging === 'a') a = y; else b = y; draw(); };
      box.addEventListener('pointermove', move); box.addEventListener('pointerup', () => dragging = null);
      function calib() {
        const card = h('div', { style: { width: '120px', height: (85.6 * pxmm) + 'px', margin: '10px auto', borderRadius: '10px', background: 'linear-gradient(135deg,#7C3AED,#1E40FF)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700 } }, '💳');
        const sl = h('input', { type: 'range', min: 2.5, max: 9, step: 0.01, value: pxmm, oninput: () => { card.style.height = (85.6 * sl.value) + 'px'; } });
        UI.sheet({ title: 'Calibrate the ruler', body: h('div', null, h('p', { class: 'small' }, 'Hold any bank or library card (long side up) against the screen. Slide until the purple box is exactly as tall as the card.'), sl, card), actions: [{ label: 'Reset', onClick: c => { Prefs.set('pxmm', null); pxmm = /iPhone/.test(navigator.userAgent) ? 6.03 : 3.78; c(); draw(); } }, { label: 'Save', cls: 'pri', onClick: c => { pxmm = +sl.value; Prefs.set('pxmm', pxmm); c(); draw(); } }] });
      }
      requestAnimationFrame(draw); addEventListener('resize', draw); return () => removeEventListener('resize', draw);
    }
    function level(el) {
      const bub = h('div', { class: 'bub' }), lv = h('div', { class: 'level' }, h('div', { class: 'cross' }), h('div', { class: 'ring0' }), bub), rd = h('div', { class: 'lvread' }, '0°'), hint = h('p', { class: 'center small muted' });
      let zero = Prefs.get('levelZero', [0, 0]), cur = [0, 0], got = false;
      const on = e => {
        if (e.beta == null) return; got = true; cur = [e.gamma || 0, e.beta || 0]; const x = clamp(cur[0] - zero[0], -45, 45), y = clamp(cur[1] - zero[1], -45, 45);
        const R = lv.clientWidth / 2 - 30; bub.style.transform = 'translate(' + (-x / 45 * R) + 'px,' + (-y / 45 * R) + 'px)';
        const ang = Math.round(Math.hypot(x, y)); rd.textContent = ang + '°'; lv.classList.toggle('flat', ang <= 1); if (ang === 0 && rd.dataset.last !== '0') Sfx.tap(); rd.dataset.last = String(ang);
      };
      const start = async () => { try { if (window.DeviceOrientationEvent && DeviceOrientationEvent.requestPermission) { const p = await DeviceOrientationEvent.requestPermission(); if (p !== 'granted') { hint.textContent = 'Motion access was turned off. Allow it in Settings → Safari → Motion & Orientation.'; return; } } addEventListener('deviceorientation', on); hint.textContent = 'Lay your phone flat. The green bubble moves to the middle when it’s level.'; setTimeout(() => { if (!got) hint.textContent = 'No tilt sensor found on this device — try it on your phone.'; }, 2500); } catch (e) { hint.textContent = 'Could not start the level.'; } };
      el.append(lv, rd, hint, h('div', { class: 'row', style: { justifyContent: 'center' } }, h('button', { class: 'btn pri', onclick: start }, '▶ Start level'), h('button', { class: 'btn', onclick: () => { zero = cur.slice(); Prefs.set('levelZero', zero); UI.toast('Set as level'); } }, 'Set zero'), h('button', { class: 'btn ghost', onclick: () => { zero = [0, 0]; Prefs.set('levelZero', zero); } }, 'Reset')));
      if (!(window.DeviceOrientationEvent && DeviceOrientationEvent.requestPermission)) start();
      return () => removeEventListener('deviceorientation', on);
    }
    function conv(el) {
      let cat = Prefs.get('convCat', 'Length');
      const box = h('div'); el.append(h('div', { class: 'chips mb' }, Object.keys(UNITS).map(c => h('button', { class: 'chip', 'aria-pressed': String(c === cat), onclick: e => { cat = c; Prefs.set('convCat', c); $$('.chip', e.target.parentNode).forEach(b => b.setAttribute('aria-pressed', String(b.textContent === c))); draw(); } }, c))), box);
      function draw() {
        const u = Object.keys(UNITS[cat]); box.innerHTML = '';
        const sel = (val) => h('select', null, u.map(x => h('option', { value: x, selected: x === val }, x)));
        const s1 = sel(Prefs.get('conv1' + cat, u[0])), s2 = sel(Prefs.get('conv2' + cat, u[1] || u[0])), i1 = h('input', { type: 'number', inputmode: 'decimal', value: '1', style: { fontSize: '24px' } }), out = h('div', { style: { fontSize: '34px', fontWeight: 700, fontFamily: 'var(--round)', wordBreak: 'break-all' } });
        const calc = () => { Prefs.set('conv1' + cat, s1.value); Prefs.set('conv2' + cat, s2.value); const x = parseFloat(i1.value); out.textContent = isNaN(x) ? '—' : Calc.fmt(convert(cat, x, s1.value, s2.value)) + ' ' + s2.value; all.innerHTML = ''; if (!isNaN(x)) u.filter(k => k !== s1.value).forEach(k => all.append(h('div', { class: 'li' }, h('span', { class: 't' }, h('b', null, Calc.fmt(convert(cat, x, s1.value, k)) + ' ' + k))))); };
        const all = h('div', { class: 'list mt' });
        [s1, s2, i1].forEach(e => e.addEventListener('input', calc));
        box.append(h('div', { class: 'card' }, h('div', { class: 'row nw' }, i1, h('div', { style: { width: '120px', flex: '0 0 auto' } }, s1)), h('div', { class: 'row nw mt' }, h('button', { class: 'btn', 'aria-label': 'Swap', onclick: () => { const t = s1.value; s1.value = s2.value; s2.value = t; calc(); } }, '⇅'), h('div', { style: { flex: 1 } }, s2)), h('div', { class: 'mt' }, out)), all);
        calc();
      }
      draw();
    }
    function sound(el) {
      let stream = null, raf = 0, peak = 0, sum = 0, n = 0;
      const big = h('div', { class: 'lvread' }, '— dB'), bar = h('i', { style: { width: '100%' } }), lab = h('p', { class: 'center' }), stats = h('div', { class: 'grid2 mt' });
      const startB = h('button', { class: 'btn pri' }, '🎤 Start');
      el.append(big, h('div', { class: 'meterbar' }, bar), lab, stats, h('div', { class: 'center mt' }, startB), h('p', { class: 'tiny muted center mt' }, 'Rough loudness from your microphone — great for “how loud is it?”, not for official measurements.'));
      const LV = [[30, '🤫 Whisper quiet'], [50, '🏠 Quiet room'], [65, '🗣️ Talking'], [80, '🚗 Busy street'], [95, '📢 Very loud'], [999, '🚨 Painfully loud — protect your ears']];
      startB.onclick = async () => {
        if (stream) { stop2(); return; }
        try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }); } catch (e) { lab.textContent = '🎤 I need the microphone for this.'; return; }
        const c = Sfx.ctx(), src = c.createMediaStreamSource(stream), an = c.createAnalyser(); an.fftSize = 2048; src.connect(an); const buf = new Float32Array(an.fftSize); startB.textContent = '⏹ Stop'; peak = 0; sum = 0; n = 0;
        const loop = () => { an.getFloatTimeDomainData(buf); let s = 0; for (const x of buf) s += x * x; const rms = Math.sqrt(s / buf.length); const db = Math.max(0, Math.round(20 * Math.log10(rms + 1e-9) + 94)); peak = Math.max(peak, db); sum += db; n++;
          big.textContent = db + ' dB'; bar.style.width = (100 - clamp(db, 0, 120) / 120 * 100) + '%'; lab.textContent = LV.find(([t]) => db < t)[1];
          stats.innerHTML = ''; stats.append(h('div', { class: 'stat' }, h('b', null, Math.round(sum / n)), h('small', null, 'Average dB')), h('div', { class: 'stat' }, h('b', null, peak), h('small', null, 'Loudest dB'))); raf = requestAnimationFrame(loop); };
        loop();
      };
      const stop2 = () => { cancelAnimationFrame(raf); if (stream) stream.getTracks().forEach(t => t.stop()); stream = null; startB.textContent = '🎤 Start'; };
      return stop2;
    }
    show();
    return () => { if (stop) stop(); };
  },
});

/* ---- 45-translate.js ---- */
/* ===== Translate: offline phrasebook (10 languages) + translate anything when online (MyMemory) ===== */
addCSS(`
.tbox{background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:12px;box-shadow:var(--shadow)}
.tbox textarea{border:0;min-height:96px;font-size:20px;padding:4px;background:transparent}
.tout{font-size:22px;font-weight:600;min-height:40px;padding:6px 4px;word-break:break-word}
.langbar{display:flex;gap:8px;align-items:center;margin-bottom:10px}
.langbar select{flex:1}
.phr{display:flex;align-items:center;gap:10px;padding:12px 14px;border-top:1px solid var(--line)}
.phr:first-child{border-top:0}
.phr .t{flex:1;min-width:0}
.phr .t b{display:block;font-size:18px;white-space:normal}
.phr .t small{display:block;color:var(--muted);font-size:14px}
`);
const PB_LANGS = [['es', 'Spanish', 'es-ES', '🇪🇸'], ['fr', 'French', 'fr-FR', '🇫🇷'], ['de', 'German', 'de-DE', '🇩🇪'], ['it', 'Italian', 'it-IT', '🇮🇹'], ['pt', 'Portuguese', 'pt-BR', '🇧🇷'], ['zh-CN', 'Chinese', 'zh-CN', '🇨🇳'], ['ja', 'Japanese', 'ja-JP', '🇯🇵'], ['ko', 'Korean', 'ko-KR', '🇰🇷'], ['hi', 'Hindi', 'hi-IN', '🇮🇳'], ['ar', 'Arabic', 'ar-SA', '🇸🇦']];
const MORE_LANGS = [['en', 'English', 'en-US', '🇺🇸'], ['zh-TW', 'Chinese (Traditional)', 'zh-TW', '🇹🇼'], ['ru', 'Russian', 'ru-RU', '🇷🇺'], ['tr', 'Turkish', 'tr-TR', '🇹🇷'], ['vi', 'Vietnamese', 'vi-VN', '🇻🇳'], ['th', 'Thai', 'th-TH', '🇹🇭'], ['id', 'Indonesian', 'id-ID', '🇮🇩'], ['tl', 'Filipino', 'fil-PH', '🇵🇭'], ['nl', 'Dutch', 'nl-NL', '🇳🇱'], ['pl', 'Polish', 'pl-PL', '🇵🇱'], ['uk', 'Ukrainian', 'uk-UA', '🇺🇦'], ['el', 'Greek', 'el-GR', '🇬🇷'], ['he', 'Hebrew', 'he-IL', '🇮🇱'], ['sv', 'Swedish', 'sv-SE', '🇸🇪']];
const ALL_LANGS = [MORE_LANGS[0], ...PB_LANGS, ...MORE_LANGS.slice(1)];
const PHRASES = {
  '👋 Basics': [
    ['Hello', 'Hola', 'Bonjour', 'Hallo', 'Ciao', 'Olá', '你好', 'こんにちは', '안녕하세요', 'नमस्ते', 'مرحبا'],
    ['Goodbye', 'Adiós', 'Au revoir', 'Tschüss', 'Arrivederci', 'Tchau', '再见', 'さようなら', '안녕히 가세요', 'अलविदा', 'مع السلامة'],
    ['Please', 'Por favor', 'S’il vous plaît', 'Bitte', 'Per favore', 'Por favor', '请', 'お願いします', '부탁합니다', 'कृपया', 'من فضلك'],
    ['Thank you', 'Gracias', 'Merci', 'Danke', 'Grazie', 'Obrigado', '谢谢', 'ありがとう', '감사합니다', 'धन्यवाद', 'شكرا'],
    ['You’re welcome', 'De nada', 'De rien', 'Gern geschehen', 'Prego', 'De nada', '不客气', 'どういたしまして', '천만에요', 'आपका स्वागत है', 'عفوا'],
    ['Yes', 'Sí', 'Oui', 'Ja', 'Sì', 'Sim', '是', 'はい', '네', 'हाँ', 'نعم'],
    ['No', 'No', 'Non', 'Nein', 'No', 'Não', '不', 'いいえ', '아니요', 'नहीं', 'لا'],
    ['Excuse me', 'Perdón', 'Excusez-moi', 'Entschuldigung', 'Mi scusi', 'Com licença', '打扰一下', 'すみません', '실례합니다', 'माफ़ कीजिए', 'لو سمحت'],
    ['Sorry', 'Lo siento', 'Désolé', 'Es tut mir leid', 'Mi dispiace', 'Desculpe', '对不起', 'ごめんなさい', '죄송합니다', 'मुझे माफ़ करें', 'آسف'],
    ['Good morning', 'Buenos días', 'Bonjour', 'Guten Morgen', 'Buongiorno', 'Bom dia', '早上好', 'おはようございます', '좋은 아침이에요', 'सुप्रभात', 'صباح الخير'],
    ['Good night', 'Buenas noches', 'Bonne nuit', 'Gute Nacht', 'Buona notte', 'Boa noite', '晚安', 'おやすみなさい', '안녕히 주무세요', 'शुभ रात्रि', 'تصبح على خير'],
    ['How are you?', '¿Cómo estás?', 'Comment ça va ?', 'Wie geht es dir?', 'Come stai?', 'Como você está?', '你好吗？', 'お元気ですか？', '어떻게 지내세요?', 'आप कैसे हैं?', 'كيف حالك؟'],
    ['I’m fine, thanks', 'Estoy bien, gracias', 'Ça va bien, merci', 'Mir geht es gut, danke', 'Sto bene, grazie', 'Estou bem, obrigado', '我很好，谢谢', '元気です、ありがとう', '잘 지내요, 감사합니다', 'मैं ठीक हूँ, धन्यवाद', 'أنا بخير، شكرا'],
    ['What’s your name?', '¿Cómo te llamas?', 'Comment tu t’appelles ?', 'Wie heißt du?', 'Come ti chiami?', 'Qual é o seu nome?', '你叫什么名字？', 'お名前は何ですか？', '이름이 뭐예요?', 'आपका नाम क्या है?', 'ما اسمك؟'],
    ['My name is …', 'Me llamo …', 'Je m’appelle …', 'Ich heiße …', 'Mi chiamo …', 'Meu nome é …', '我叫…', '私の名前は…です', '제 이름은 …예요', 'मेरा नाम … है', 'اسمي …'],
    ['Nice to meet you', 'Mucho gusto', 'Enchanté', 'Freut mich', 'Piacere', 'Muito prazer', '很高兴认识你', 'はじめまして', '만나서 반가워요', 'आपसे मिलकर खुशी हुई', 'تشرفنا'],
    ['I don’t understand', 'No entiendo', 'Je ne comprends pas', 'Ich verstehe nicht', 'Non capisco', 'Não entendo', '我不明白', 'わかりません', '이해가 안 돼요', 'मुझे समझ नहीं आया', 'لا أفهم'],
    ['Do you speak English?', '¿Hablas inglés?', 'Parlez-vous anglais ?', 'Sprechen Sie Englisch?', 'Parli inglese?', 'Você fala inglês?', '你会说英语吗？', '英語を話せますか？', '영어 할 줄 아세요?', 'क्या आप अंग्रेज़ी बोलते हैं?', 'هل تتكلم الإنجليزية؟'],
    ['Can you help me?', '¿Puedes ayudarme?', 'Pouvez-vous m’aider ?', 'Können Sie mir helfen?', 'Può aiutarmi?', 'Você pode me ajudar?', '你能帮我吗？', '手伝ってもらえますか？', '도와주실 수 있어요?', 'क्या आप मेरी मदद कर सकते हैं?', 'هل يمكنك مساعدتي؟'],
  ],
  '🧭 Getting around': [
    ['Where is the bathroom?', '¿Dónde está el baño?', 'Où sont les toilettes ?', 'Wo ist die Toilette?', 'Dov’è il bagno?', 'Onde fica o banheiro?', '洗手间在哪里？', 'トイレはどこですか？', '화장실이 어디예요?', 'शौचालय कहाँ है?', 'أين الحمام؟'],
    ['How much does it cost?', '¿Cuánto cuesta?', 'Combien ça coûte ?', 'Wie viel kostet das?', 'Quanto costa?', 'Quanto custa?', '多少钱？', 'いくらですか？', '얼마예요?', 'यह कितने का है?', 'كم الثمن؟'],
    ['Where is …?', '¿Dónde está …?', 'Où est … ?', 'Wo ist …?', 'Dov’è …?', 'Onde fica …?', '…在哪里？', '…はどこですか？', '…은/는 어디예요?', '… कहाँ है?', 'أين …؟'],
    ['Left / Right', 'Izquierda / Derecha', 'Gauche / Droite', 'Links / Rechts', 'Sinistra / Destra', 'Esquerda / Direita', '左 / 右', '左 / 右', '왼쪽 / 오른쪽', 'बाएँ / दाएँ', 'يسار / يمين'],
    ['Straight ahead', 'Todo recto', 'Tout droit', 'Geradeaus', 'Sempre dritto', 'Em frente', '一直走', 'まっすぐ', '직진', 'सीधे', 'إلى الأمام مباشرة'],
    ['Train station', 'Estación de tren', 'Gare', 'Bahnhof', 'Stazione ferroviaria', 'Estação de trem', '火车站', '駅', '기차역', 'रेलवे स्टेशन', 'محطة القطار'],
    ['Airport', 'Aeropuerto', 'Aéroport', 'Flughafen', 'Aeroporto', 'Aeroporto', '机场', '空港', '공항', 'हवाई अड्डा', 'المطار'],
    ['I’m lost', 'Estoy perdido', 'Je suis perdu', 'Ich habe mich verlaufen', 'Mi sono perso', 'Estou perdido', '我迷路了', '道に迷いました', '길을 잃었어요', 'मैं रास्ता भटक गया हूँ', 'أنا تائه'],
  ],
  '🍽️ Food': [
    ['I’m hungry', 'Tengo hambre', 'J’ai faim', 'Ich habe Hunger', 'Ho fame', 'Estou com fome', '我饿了', 'お腹がすきました', '배고파요', 'मुझे भूख लगी है', 'أنا جائع'],
    ['Water, please', 'Agua, por favor', 'De l’eau, s’il vous plaît', 'Wasser, bitte', 'Acqua, per favore', 'Água, por favor', '请给我水', 'お水をください', '물 주세요', 'पानी, कृपया', 'ماء من فضلك'],
    ['The menu, please', 'La carta, por favor', 'La carte, s’il vous plaît', 'Die Speisekarte, bitte', 'Il menù, per favore', 'O cardápio, por favor', '请给我菜单', 'メニューをください', '메뉴판 주세요', 'मेन्यू दीजिए', 'القائمة من فضلك'],
    ['The check, please', 'La cuenta, por favor', 'L’addition, s’il vous plaît', 'Die Rechnung, bitte', 'Il conto, per favore', 'A conta, por favor', '请结账', 'お会計をお願いします', '계산서 주세요', 'बिल दीजिए', 'الحساب من فضلك'],
    ['Delicious!', '¡Delicioso!', 'Délicieux !', 'Lecker!', 'Delizioso!', 'Delicioso!', '好吃！', 'おいしい！', '맛있어요!', 'स्वादिष्ट!', 'لذيذ!'],
    ['I’m allergic to …', 'Soy alérgico a …', 'Je suis allergique à …', 'Ich bin allergisch gegen …', 'Sono allergico a …', 'Sou alérgico a …', '我对…过敏', '…アレルギーがあります', '저는 …알레르기가 있어요', 'मुझे … से एलर्जी है', 'عندي حساسية من …'],
    ['I’m vegetarian', 'Soy vegetariano', 'Je suis végétarien', 'Ich bin Vegetarier', 'Sono vegetariano', 'Sou vegetariano', '我吃素', '私はベジタリアンです', '저는 채식주의자예요', 'मैं शाकाहारी हूँ', 'أنا نباتي'],
  ],
  '🚨 Emergency': [
    ['Help!', '¡Ayuda!', 'Au secours !', 'Hilfe!', 'Aiuto!', 'Socorro!', '救命！', '助けて！', '도와주세요!', 'बचाओ!', 'النجدة!'],
    ['Call the police', 'Llame a la policía', 'Appelez la police', 'Rufen Sie die Polizei', 'Chiami la polizia', 'Chame a polícia', '请报警', '警察を呼んでください', '경찰을 불러 주세요', 'पुलिस को बुलाइए', 'اتصل بالشرطة'],
    ['I need a doctor', 'Necesito un médico', 'J’ai besoin d’un médecin', 'Ich brauche einen Arzt', 'Ho bisogno di un medico', 'Preciso de um médico', '我需要医生', '医者が必要です', '의사가 필요해요', 'मुझे डॉक्टर चाहिए', 'أحتاج إلى طبيب'],
    ['Where is the hospital?', '¿Dónde está el hospital?', 'Où est l’hôpital ?', 'Wo ist das Krankenhaus?', 'Dov’è l’ospedale?', 'Onde fica o hospital?', '医院在哪里？', '病院はどこですか？', '병원이 어디예요?', 'अस्पताल कहाँ है?', 'أين المستشفى؟'],
  ],
  '🎉 Friends & fun': [
    ['Let’s play!', '¡Vamos a jugar!', 'On joue !', 'Lass uns spielen!', 'Giochiamo!', 'Vamos brincar!', '我们一起玩吧！', '遊ぼう！', '같이 놀자!', 'चलो खेलते हैं!', 'هيا نلعب!'],
    ['I love it!', '¡Me encanta!', 'J’adore !', 'Ich liebe es!', 'Lo adoro!', 'Eu adoro!', '我很喜欢！', '大好き！', '정말 좋아요!', 'मुझे यह बहुत पसंद है!', 'أحبه!'],
    ['Happy birthday!', '¡Feliz cumpleaños!', 'Joyeux anniversaire !', 'Alles Gute zum Geburtstag!', 'Buon compleanno!', 'Feliz aniversário!', '生日快乐！', 'お誕生日おめでとう！', '생일 축하해요!', 'जन्मदिन मुबारक हो!', 'عيد ميلاد سعيد!'],
    ['See you later!', '¡Hasta luego!', 'À plus tard !', 'Bis später!', 'A dopo!', 'Até logo!', '回头见！', 'またね！', '나중에 봐요!', 'फिर मिलेंगे!', 'أراك لاحقا!'],
    ['One, two, three, four, five', 'Uno, dos, tres, cuatro, cinco', 'Un, deux, trois, quatre, cinq', 'Eins, zwei, drei, vier, fünf', 'Uno, due, tre, quattro, cinque', 'Um, dois, três, quatro, cinco', '一，二，三，四，五', 'いち、に、さん、し、ご', '하나, 둘, 셋, 넷, 다섯', 'एक, दो, तीन, चार, पाँच', 'واحد، اثنان، ثلاثة، أربعة، خمسة'],
    ['Six, seven, eight, nine, ten', 'Seis, siete, ocho, nueve, diez', 'Six, sept, huit, neuf, dix', 'Sechs, sieben, acht, neun, zehn', 'Sei, sette, otto, nove, dieci', 'Seis, sete, oito, nove, dez', '六，七，八，九，十', 'ろく、なな、はち、きゅう、じゅう', '여섯, 일곱, 여덟, 아홉, 열', 'छह, सात, आठ, नौ, दस', 'ستة، سبعة، ثمانية، تسعة، عشرة'],
  ],
};
const speakIn = (text, code) => { if (!Speak.ok) return UI.toast('Speaking isn’t available'); const L = ALL_LANGS.find(l => l[0] === code); speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text.replace(/…/g, '')); u.lang = L ? L[2] : code; u.rate = 0.9; const vv = speechSynthesis.getVoices().find(x => x.lang.replace('_', '-').toLowerCase().startsWith(u.lang.toLowerCase().slice(0, 2))); if (vv) u.voice = vv; speechSynthesis.speak(u); };
Apps.reg({
  id: 'translate', name: 'Translate', icon: '🌐', color: 'linear-gradient(135deg,#4285F4,#1A47B8)', group: 'learn', keys: 'language spanish french chinese japanese korean phrasebook', blurb: 'Phrasebook + live translate',
  mount(v, ctx) {
    let tab = Prefs.get('trTab', 'live');
    const body = h('div'); v.append(UI.tabs([['live', '✍️ Translate'], ['book', '📗 Phrasebook (offline)'], ['hist', '🕘 Saved']], tab, t => { tab = t; Prefs.set('trTab', t); show(); }), body);
    function show() { body.innerHTML = ''; ({ live, book, hist })[tab](); }
    const sel = (val, list) => h('select', null, list.map(([c, n, , f]) => h('option', { value: c, selected: c === val }, f + ' ' + n)));
    function phraseLookup(text, from, to) { const t = text.trim().toLowerCase().replace(/[.!?¿¡]+$/, ''); const cols = ['en', ...PB_LANGS.map(l => l[0])]; const fi = cols.indexOf(from), ti = cols.indexOf(to); if (fi < 0 || ti < 0) return null; for (const g in PHRASES) for (const row of PHRASES[g]) if (row[fi].toLowerCase().replace(/[’']/g, "'").replace(/[.!?¿¡]+$/, '') === t.replace(/[’']/g, "'")) return row[ti]; return null; }
    async function online(text, from, to) {
      const r = await fetch('https://api.mymemory.translated.net/get?mt=1&q=' + encodeURIComponent(text) + '&langpair=' + from + '|' + to); const d = await r.json();
      let out = d.responseData && d.responseData.translatedText || ''; const bad = s => !s || /MYMEMORY WARNING|testvalue|INVALID|QUERY LENGTH/i.test(s);
      if (bad(out) || (d.responseData.match || 0) < 0.99) { const mt = (d.matches || []).find(m => m['created-by'] === 'MT!' && !bad(m.translation)); if (mt) out = mt.translation; }
      if (/MYMEMORY WARNING/i.test(out)) throw new Error('The free translator is busy for today. The phrasebook still works.');
      if (bad(out)) throw new Error('Could not translate that.'); return out.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
    }
    function live() {
      const from = sel(Prefs.get('trFrom', 'en'), ALL_LANGS), to = sel(Prefs.get('trTo', 'es'), ALL_LANGS);
      const inp = h('textarea', { placeholder: 'Type something to translate', 'aria-label': 'Text to translate' }), out = h('div', { class: 'tout', 'aria-live': 'polite' }), note = h('div', { class: 'small muted' });
      if (ctx.param && !Prefs.get('trParamUsed' + ctx.param)) { inp.value = ctx.param; }
      from.onchange = () => Prefs.set('trFrom', from.value); to.onchange = () => { Prefs.set('trTo', to.value); if (inp.value.trim()) go(); };
      const go = async () => {
        const t = inp.value.trim(); if (!t) return; if (from.value === to.value) { out.textContent = t; return; }
        const pb = phraseLookup(t, from.value, to.value); out.textContent = '…'; note.textContent = '';
        let res = pb, how = pb ? '📗 From the offline phrasebook' : '';
        if (!pb) { if (!navigator.onLine) { out.textContent = ''; note.textContent = '📴 New sentences need internet. Try the Phrasebook tab — it works offline.'; return; } try { res = await online(t, from.value, to.value); how = '🌐 Online translation (MyMemory)'; } catch (e) { out.textContent = ''; note.textContent = e.message; return; } }
        out.textContent = res; note.textContent = how;
        const H = Prefs.get('trHist', []); H.unshift({ src: t, out: res, from: from.value, to: to.value, at: Date.now() }); Prefs.set('trHist', H.slice(0, 100));
      };
      body.append(h('div', { class: 'langbar' }, from, h('button', { class: 'btn', 'aria-label': 'Swap languages', onclick: () => { const a = from.value; from.value = to.value; to.value = a; Prefs.set('trFrom', from.value); Prefs.set('trTo', to.value); if (out.textContent && out.textContent !== '…') { inp.value = out.textContent; go(); } } }, '⇄'), to),
        h('div', { class: 'tbox' }, inp, h('div', { class: 'row' }, h('button', { class: 'btn sm', onclick: () => speakIn(inp.value, from.value) }, '🔊'), h('button', { class: 'btn sm ghost', onclick: () => { inp.value = ''; out.textContent = ''; note.textContent = ''; } }, 'Clear'), h('span', { class: 'sp' }), h('button', { class: 'btn pri', onclick: go }, 'Translate'))),
        h('div', { class: 'tbox mt' }, out, h('div', { class: 'row' }, h('button', { class: 'btn sm', onclick: () => out.textContent && speakIn(out.textContent, to.value) }, '🔊 Say it'), h('button', { class: 'btn sm', onclick: () => out.textContent && copyText(out.textContent) }, '📋 Copy'), h('span', { class: 'sp' })), note),
        h('p', { class: 'tiny muted mt' }, 'Online translations send just the words you typed to MyMemory. Every translation is saved under “Saved” so you can see it offline.'));
      inp.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); go(); } });
      if (inp.value) go();
    }
    function book() {
      let lang = Prefs.get('pbLang', 'es'); const li = PB_LANGS.findIndex(l => l[0] === lang) + 1;
      body.append(h('div', { class: 'chips mb' }, PB_LANGS.map(([c, n, , f]) => h('button', { class: 'chip', 'aria-pressed': String(c === lang), onclick: () => { Prefs.set('pbLang', c); show(); } }, f + ' ' + n))));
      for (const g in PHRASES) body.append(h('div', { class: 'sec' }, g), h('div', { class: 'list' }, PHRASES[g].map(row => h('div', { class: 'phr' }, h('div', { class: 't' }, h('b', { lang }, row[li]), h('small', null, row[0])), h('button', { class: 'ib', 'aria-label': 'Say it', onclick: () => speakIn(row[li], lang) }, '🔊')))));
      body.append(h('p', { class: 'tiny muted mt' }, 'The phrasebook works with no internet. If 🔊 is silent, add the language’s voice in iPhone Settings → Accessibility → Spoken Content → Voices.'));
    }
    function hist() {
      const H = Prefs.get('trHist', []); const L = c => (ALL_LANGS.find(l => l[0] === c) || [c, c, c, ''])[3];
      if (!H.length) { body.append(UI.empty('🕘', 'Nothing saved yet', 'Translations you make show up here, even offline.')); return; }
      body.append(h('div', { class: 'list' }, H.map(x => h('div', { class: 'phr' }, h('div', { class: 't' }, h('b', null, x.out), h('small', null, L(x.from) + ' ' + x.src + ' → ' + L(x.to))), h('button', { class: 'ib', 'aria-label': 'Say it', onclick: () => speakIn(x.out, x.to) }, '🔊')))),
        h('button', { class: 'btn ghost mt', onclick: () => { Prefs.set('trHist', []); show(); } }, 'Clear saved'));
    }
    show();
  },
});

/* ---- 46-bible.js ---- */
/* ===== Bible: three public-domain translations, fully offline ===== */
addCSS(`
.bk{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
@media (min-width:640px){.bk{grid-template-columns:repeat(4,minmax(0,1fr))}}
.bk button{border:1px solid var(--line);background:var(--surface);border-radius:12px;padding:10px 12px;text-align:left;font-weight:650;font-size:15px;color:var(--ink)}
.chg{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px}
.chg button{aspect-ratio:1/1;border:1px solid var(--line);background:var(--surface);border-radius:12px;font-weight:700;font-size:16px;color:var(--ink)}
.chg button.read{background:var(--accent-soft)}
.scripture{background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:18px 18px 22px;line-height:1.75;font-family:Georgia,"Iowan Old Style","Times New Roman",serif;color:var(--ink)}
.scripture h2{font-family:var(--round);font-size:26px;margin-bottom:10px}
.vs{cursor:pointer;border-radius:4px;padding:1px 0;-webkit-tap-highlight-color:transparent}
.vs sup{font-family:var(--font);font-size:.62em;font-weight:800;color:var(--accent);margin-right:3px}
.vs.sel{text-decoration:underline;text-decoration-color:var(--accent);text-decoration-thickness:2px;text-underline-offset:4px}
.vs.hl-y{background:#FFF1A6}.vs.hl-g{background:#C9F5D0}.vs.hl-b{background:#CFE3FF}.vs.hl-p{background:#FFD6E8}
:root[data-theme="dark"] .vs[class*="hl-"]{color:#111}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .vs[class*="hl-"]{color:#111}}
.vsbar{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(var(--bot) + 16px);z-index:40;display:flex;gap:6px;align-items:center;padding:8px;border-radius:18px;background:var(--surface);border:1px solid var(--line);box-shadow:0 10px 30px rgba(0,0,0,.25);max-width:calc(100% - 24px);overflow-x:auto}
.vsbar .sw2{width:30px;height:30px;border-radius:15px;border:2px solid var(--line);flex:0 0 auto}
`);
const VOTD_REFS = [[42, 3, 16], [18, 23, 1], [49, 4, 13], [23, 29, 11], [19, 3, 5], [44, 8, 28], [22, 40, 31], [5, 1, 9], [39, 11, 28], [18, 46, 1], [49, 4, 6], [45, 13, 4], [47, 5, 22], [18, 118, 24], [39, 5, 14], [48, 2, 8], [54, 1, 7], [57, 11, 1], [18, 119, 105], [22, 41, 10], [39, 6, 33], [44, 12, 2], [59, 5, 7], [19, 17, 17], [50, 3, 23], [18, 37, 4], [24, 3, 22], [39, 19, 26], [42, 14, 27], [61, 4, 19], [18, 139, 14], [48, 4, 32], [39, 7, 12], [44, 15, 13], [58, 1, 5], [18, 27, 1], [35, 3, 17], [32, 6, 8], [4, 31, 6], [22, 26, 3]];
const Bible = {
  T: [['NHEB', 'New Heart English (modern)'], ['KJV', 'King James Version (classic)'], ['BBE', 'Basic English (easy words)']],
  cache: {},
  tr() { return Prefs.get('bibleTr', 'NHEB'); },
  load(id = this.tr()) { return this.cache[id] || (this.cache[id] = fetch('data/bible/' + id + '.json').then(r => { if (!r.ok) throw new Error('missing'); return r.json(); }).catch(e => { delete this.cache[id]; throw e; })); },
  ref(B, b, c, v) { return B.b[b][0] + ' ' + c + (v ? ':' + v : ''); },
  async votd() {
    const today = ymd(new Date()), tr = this.tr(), saved = Prefs.get('votd', null); if (saved && saved.d === today && saved.tr === tr) return saved;
    const B = await this.load(tr), [b, c, v] = VOTD_REFS[Math.floor(Date.now() / 86400e3) % VOTD_REFS.length]; const text = B.b[b][1][c - 1][v - 1];
    const out = { d: today, tr, ref: this.ref(B, b, c, v) + ' (' + tr + ')', text, b, c, v }; Prefs.set('votd', out); return out;
  },
};
Apps.reg({
  id: 'bible', name: 'Bible', icon: '✝️', color: 'linear-gradient(135deg,#C9A227,#7A4E12)', group: 'learn', keys: 'scripture verse god jesus psalms gospel church', blurb: 'Read offline, 3 translations',
  async mount(v, ctx) {
    let B; const body = h('div'); v.append(body);
    const marks = () => Prefs.get('bibleMarks', []), hl = () => Prefs.get('bibleHL', {});
    try { B = await Bible.load(); } catch (e) { v.append(UI.empty('📥', 'The Bible isn’t saved yet', 'Connect to Wi-Fi once — Super One saves it for offline reading.')); return; }
    const size = () => Prefs.get('bibleSize', 19);
    async function switchTr(id) { Prefs.set('bibleTr', id); try { B = await Bible.load(id); } catch (e) { UI.toast('That translation isn’t saved yet'); } }
    function trMenu(after) { UI.menu('Translation', Bible.T.map(([id, n]) => ({ icon: Bible.tr() === id ? '✓' : '📖', label: n, run: async () => { await switchTr(id); after(); } }))); }
    async function home() {
      if (ctx._bar) ctx._bar(); body.innerHTML = ''; ctx.setTitle('Bible'); ctx.setBack(null);
      ctx.setActions(h('button', { class: 'btn ghost sm', onclick: () => trMenu(home) }, Bible.tr()), h('button', { class: 'ib', 'aria-label': 'Search', html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">' + ICON_PATHS.search + '</svg>', onclick: () => search('') }));
      const vd = await Bible.votd().catch(() => null), last = Prefs.get('bibleLast', null);
      if (vd) body.append(h('button', { class: 'card', style: { display: 'block', width: '100%', textAlign: 'left', background: 'linear-gradient(135deg,#FFF6D8,var(--surface))', color: 'var(--ink)' }, onclick: () => chapter(vd.b, vd.c, vd.v) }, h('div', { class: 'tiny', style: { fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: '#9A6B00' } }, '✨ Verse of the day'), h('p', { style: { fontFamily: 'Georgia,serif', fontSize: '19px', lineHeight: 1.5, margin: '8px 0' } }, '“' + vd.text + '”'), h('b', null, vd.ref)));
      if (last) body.append(h('button', { class: 'btn wide mt', onclick: () => chapter(last.b, last.c) }, '📖 Continue reading: ' + B.b[last.b][0] + ' ' + last.c));
      const mk = marks(); if (mk.length) body.append(h('div', { class: 'sec' }, '🔖 Bookmarks'), h('div', { class: 'list' }, mk.slice(0, 8).map(m => h('button', { class: 'li', onclick: () => chapter(m.b, m.c, m.v) }, h('span', { class: 'ic' }, '🔖'), h('span', { class: 't' }, h('b', null, B.b[m.b][0] + ' ' + m.c + ':' + m.v), h('small', null, (B.b[m.b][1][m.c - 1] || [])[m.v - 1] || '')), h('span', { class: 'chev' }, '›')))));
      body.append(h('div', { class: 'sec' }, 'Old Testament'), h('div', { class: 'bk' }, B.b.slice(0, 39).map((bk, i) => h('button', { onclick: () => chapters(i) }, bk[0]))),
        h('div', { class: 'sec' }, 'New Testament'), h('div', { class: 'bk' }, B.b.slice(39).map((bk, i) => h('button', { onclick: () => chapters(i + 39) }, bk[0]))),
        h('p', { class: 'tiny muted mt2' }, 'Public-domain texts: New Heart English Bible, King James Version (1769), Bible in Basic English. Saved on your device.'));
    }
    function chapters(b) {
      if (ctx._bar) ctx._bar(); body.innerHTML = ''; ctx.setTitle(B.b[b][0]); ctx.setBack(() => { home(); return true; }); const read = Prefs.get('bibleRead', {});
      body.append(h('div', { class: 'chg' }, B.b[b][1].map((_, i) => h('button', { class: read[b + ':' + (i + 1)] ? 'read' : '', onclick: () => chapter(b, i + 1) }, i + 1))));
    }
    function chapter(b, c, focus) {
      if (ctx._bar) ctx._bar(); body.innerHTML = ''; const bk = B.b[b], verses = bk[1][c - 1]; ctx.setTitle(bk[0] + ' ' + c); ctx.setBack(() => { chapters(b); return true; });
      Prefs.set('bibleLast', { b, c }); const read = Prefs.get('bibleRead', {}); read[b + ':' + c] = 1; Prefs.set('bibleRead', read);
      ctx.setActions(h('button', { class: 'btn ghost sm', onclick: () => trMenu(() => chapter(b, c)) }, Bible.tr()), h('button', { class: 'ib', 'aria-label': 'Text size and reading', html: SVG.more, onclick: () => UI.menu('Reading', [
        { icon: '🔊', label: 'Read this chapter aloud', run: () => readAloud(verses, 0) },
        { icon: '🔠', label: 'Bigger text', run: () => { Prefs.set('bibleSize', Math.min(30, size() + 2)); chapter(b, c); } },
        { icon: '🔡', label: 'Smaller text', run: () => { Prefs.set('bibleSize', Math.max(14, size() - 2)); chapter(b, c); } },
      ]) }));
      const H = hl(); let sel = new Set();
      const sc = h('div', { class: 'scripture', style: { fontSize: size() + 'px' } }, h('h2', null, bk[0] + ' ' + c));
      verses.forEach((t, i) => { const k = b + ':' + c + ':' + (i + 1); const s = h('span', { class: 'vs' + (H[k] ? ' hl-' + H[k] : ''), 'data-v': i + 1 }, h('sup', null, i + 1), t + ' '); s.onclick = () => { sel.has(i + 1) ? sel.delete(i + 1) : sel.add(i + 1); s.classList.toggle('sel'); bar(); }; sc.append(s); });
      const nav = h('div', { class: 'row mt', style: { justifyContent: 'space-between' } },
        h('button', { class: 'btn', disabled: b === 0 && c === 1, onclick: () => c > 1 ? chapter(b, c - 1) : chapter(b - 1, B.b[b - 1][1].length) }, '‹ Previous'),
        h('button', { class: 'btn', disabled: b === B.b.length - 1 && c === bk[1].length, onclick: () => c < bk[1].length ? chapter(b, c + 1) : chapter(b + 1, 1) }, 'Next ›'));
      body.append(sc, nav); scrollTo(0, 0);
      if (focus) setTimeout(() => { const el = sc.querySelector('[data-v="' + focus + '"]'); if (el) { el.scrollIntoView({ block: 'center' }); el.classList.add('hl-y'); setTimeout(() => { if (!H[b + ':' + c + ':' + focus]) el.classList.remove('hl-y'); }, 1600); } }, 60);
      let sx = null; sc.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true }); sc.addEventListener('touchend', e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 90) $$('button', nav)[dx < 0 ? 1 : 0].click(); sx = null; });
      let barEl = null;
      function bar() {
        if (barEl) barEl.remove(); barEl = null; if (!sel.size) return; const vs = [...sel].sort((a, b2) => a - b2), ref = bk[0] + ' ' + c + ':' + (vs.length > 1 ? vs[0] + '–' + vs[vs.length - 1] : vs[0]), text = vs.map(n => verses[n - 1]).join(' ');
        const setHL = col => { const H2 = hl(); vs.forEach(n => { const k = b + ':' + c + ':' + n; if (col) H2[k] = col; else delete H2[k]; }); Prefs.set('bibleHL', H2); chapter(b, c); };
        barEl = h('div', { class: 'vsbar' }, ['y', 'g', 'b', 'p'].map(col => h('button', { class: 'sw2 vs hl-' + col, 'aria-label': 'Highlight', onclick: () => setHL(col) })), h('button', { class: 'btn sm', onclick: () => setHL(null) }, '✕'),
          h('button', { class: 'btn sm', onclick: () => { const m = marks().filter(x => !(x.b === b && x.c === c && x.v === vs[0])); m.unshift({ b, c, v: vs[0] }); Prefs.set('bibleMarks', m.slice(0, 100)); UI.toast('Bookmarked ' + ref); } }, '🔖'),
          h('button', { class: 'btn sm', onclick: () => shareText('“' + text + '” — ' + ref + ' (' + Bible.tr() + ')', ref) }, '📤'),
          h('button', { class: 'btn sm', onclick: () => readAloud(verses, vs[0] - 1, vs[vs.length - 1]) }, '🔊'),
          h('button', { class: 'btn sm', onclick: async () => { const decks = await Cards.decks(); let d = decks.find(x => x.name === 'Memory verses'); if (!d) { d = { id: uid(), name: 'Memory verses', emoji: '✝️', color: DECK_COLORS[3], created: Date.now() }; await DB.put('decks', d); } await DB.put('cards', { id: uid(), deck: d.id, front: ref, back: text, box: 0, due: 0, created: Date.now() }); UI.toast('Added to Flashcards → Memory verses'); } }, '🗂️'));
        document.body.append(barEl);
      }
      ctx._bar = () => { if (barEl) barEl.remove(); };
    }
    function readAloud(verses, from, to) { if (!Speak.ok) return UI.toast('Reading aloud isn’t available'); speechSynthesis.cancel(); const end = to || verses.length; for (let i = from; i < end; i++) { const u = new SpeechSynthesisUtterance(verses[i]); u.rate = 0.95; u.lang = 'en-US'; speechSynthesis.speak(u); } UI.toast('Reading… leave the page to stop'); }
    function search(q0) {
      body.innerHTML = ''; ctx.setTitle('Search'); ctx.setBack(() => { home(); return true; });
      const inp = h('input', { type: 'search', placeholder: 'Words like “love” or “shepherd”', value: q0 }), res = h('div', { class: 'mt' });
      const run = () => { const q = inp.value.trim().toLowerCase(); res.innerHTML = ''; if (q.length < 3) return; const hits = []; B.b.forEach((bk, bi) => bk[1].forEach((ch, ci) => ch.forEach((t, vi) => { if (hits.length < 200 && t.toLowerCase().includes(q)) hits.push([bi, ci + 1, vi + 1, t]); })));
        res.append(h('p', { class: 'small muted' }, (hits.length >= 200 ? '200+' : hits.length) + ' verses found'), h('div', { class: 'list' }, hits.map(([bi, c, vv, t]) => { const i = t.toLowerCase().indexOf(q); return h('button', { class: 'li', onclick: () => chapter(bi, c, vv) }, h('span', { class: 't' }, h('b', null, B.b[bi][0] + ' ' + c + ':' + vv), h('small', { style: { whiteSpace: 'normal' } }, t.slice(0, i), h('mark', null, t.slice(i, i + q.length)), t.slice(i + q.length)))); }))); };
      inp.addEventListener('input', debounce(run, 250)); body.append(h('div', { class: 'search' }, inp), res); if (q0) run(); else setTimeout(() => inp.focus(), 60);
    }
    if (ctx.param && ctx.param.startsWith('search:')) search(ctx.param.slice(7)); else home();
    return () => { if (window.speechSynthesis) speechSynthesis.cancel(); if (ctx._bar) ctx._bar(); };
  },
});

/* ---- 47-wiki.js ---- */
/* ===== Wikipedia: search and read articles online, save them to read offline ===== */
addCSS(`
.wart{background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:16px 16px 22px;line-height:1.6;font-size:17px;overflow-wrap:anywhere}
.wart h1{font-size:28px;margin:0 0 6px;font-family:Georgia,"Iowan Old Style",serif}
.wart h2{font-size:22px;margin:22px 0 6px;font-family:Georgia,serif;border-bottom:1px solid var(--line);padding-bottom:4px}
.wart h3{font-size:18px;margin:16px 0 4px}
.wart p{margin:0 0 12px}
.wart img{max-width:100%;height:auto;border-radius:8px}
.wart figure,.wart .thumb{margin:10px 0;text-align:center;font-size:13px;color:var(--muted)}
.wart .infobox{width:100%!important;font-size:14px;border-collapse:collapse;margin:0 0 14px;background:var(--surface2);border-radius:12px;overflow:hidden;display:block;overflow-x:auto}
.wart table{max-width:100%;display:block;overflow-x:auto;border-collapse:collapse;font-size:14px}
.wart td,.wart th{padding:4px 8px;border-bottom:1px solid var(--line);vertical-align:top;text-align:left}
.wart a{color:var(--accent);text-decoration:none}
.wart ul,.wart ol{padding-left:22px}
.wsum{display:flex;gap:12px;align-items:flex-start;padding:12px 14px;border-top:1px solid var(--line);background:none;border-left:0;border-right:0;border-bottom:0;width:100%;text-align:left;color:var(--ink)}
.wsum:first-child{border-top:0}
.wsum .im{width:56px;height:56px;border-radius:10px;flex:0 0 auto;background:var(--surface2) center/cover;display:grid;place-items:center;font-size:24px}
.wsum b{display:block}.wsum small{display:block;color:var(--muted);font-size:13px}
`);
const Wiki = {
  api: 'https://en.wikipedia.org/w/api.php?format=json&formatversion=2&origin=*&',
  async search(q) { const r = await (await fetch(this.api + 'action=query&list=search&srlimit=12&srprop=snippet&srsearch=' + encodeURIComponent(q))).json(); return (r.query && r.query.search || []).map(x => ({ title: x.title, sum: strip(x.snippet) })); },
  async article(title) {
    const r = await (await fetch(this.api + 'action=parse&prop=text|displaytitle&redirects=1&disableeditsection=1&disabletoc=1&page=' + encodeURIComponent(title))).json();
    if (r.error) throw new Error(r.error.info || 'Not found'); return { title: r.parse.title, html: this.clean(r.parse.text) };
  },
  clean(html) {
    const d = new DOMParser().parseFromString(html, 'text/html');
    d.querySelectorAll('script,style,link,.mw-editsection,sup.reference,.reference,.reflist,ol.references,.navbox,.navbox-styles,.ambox,.mbox-small,.metadata,.noprint,.sistersitebox,.mw-empty-elt,.portalbox,.shortdescription,#coordinates,.hatnote,.mw-references-wrap,.sidebar,.vertical-navbox').forEach(e => e.remove());
    // drop the end sections (references, links) — they are long and not useful offline
    for (const hdr of d.querySelectorAll('h2')) { if (/^(References|External links|Notes|Further reading|Sources|Bibliography|Citations|Footnotes)/i.test(hdr.textContent.trim())) { let n = (hdr.closest('.mw-heading') || hdr); const kill = []; while (n) { kill.push(n); n = n.nextElementSibling; } kill.forEach(k => k.remove()); break; } }
    d.querySelectorAll('img').forEach(i => { let s = i.getAttribute('src') || ''; if (s.startsWith('//')) i.setAttribute('src', 'https:' + s); i.removeAttribute('srcset'); i.setAttribute('loading', 'lazy'); i.removeAttribute('width'); i.removeAttribute('height'); });
    d.querySelectorAll('a').forEach(a => { const h2 = a.getAttribute('href') || ''; const m = h2.match(/^\/wiki\/([^#?]+)/); if (m && !/^(File|Special|Help|Category|Template|Wikipedia|Portal|Talk):/.test(decodeURIComponent(m[1]))) { a.setAttribute('data-wiki', decodeURIComponent(m[1]).replace(/_/g, ' ')); a.setAttribute('href', '#'); } else if (/^https?:/.test(h2)) { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); } else if (h2.startsWith('#')) { } else { a.replaceWith(...a.childNodes); } });
    d.querySelectorAll('[style]').forEach(e => { if (!e.matches('.infobox *')) e.removeAttribute('style'); });
    return d.body.innerHTML;
  },
};
Apps.reg({
  id: 'wiki', name: 'Wikipedia', icon: '📚', color: 'linear-gradient(135deg,#8E9EAB,#3E4A59)', group: 'learn', keys: 'encyclopedia wiki article facts research search', blurb: 'Read Wikipedia, save for offline',
  mount(v, ctx) {
    const savedList = () => Prefs.get('wikiSaved', []);
    const q = h('input', { type: 'search', placeholder: 'Search Wikipedia', enterkeyhint: 'search', autocomplete: 'off' }), out = h('div', { class: 'mt' });
    v.append(h('div', { class: 'search' }, q), out);
    q.addEventListener('keydown', e => { if (e.key === 'Enter' && q.value.trim()) { q.blur(); results(q.value.trim()); } });
    async function home() {
      ctx.setTitle('Wikipedia'); ctx.setBack(null); ctx.setActions(navigator.onLine ? h('button', { class: 'btn ghost sm', onclick: random }, '🎲 Random') : null); out.innerHTML = '';
      if (!navigator.onLine) out.append(h('div', { class: 'note-banner' }, '📴 You’re offline. Your saved articles still open below.'));
      const S = savedList();
      if (S.length) out.append(h('div', { class: 'sec' }, '⭐ Saved for offline (' + S.length + ')'), h('div', { class: 'list' }, S.map(s => h('button', { class: 'wsum', onclick: () => open(s.title) }, h('span', { class: 'im' }, '📄'), h('span', null, h('b', null, s.title), h('small', null, 'Saved ' + fmtAgo(s.at)))))));
      if (navigator.onLine) {
        try { const d = new Date(), j = await (await fetch('https://en.wikipedia.org/api/rest_v1/feed/featured/' + d.getFullYear() + '/' + pad2(d.getMonth() + 1) + '/' + pad2(d.getDate()))).json();
          if (j.tfa) out.prepend(h('div', { class: 'sec', style: { marginTop: '4px' } }, '⭐ Today’s featured article'), h('button', { class: 'wsum card', style: { border: '1px solid var(--line)' }, onclick: () => open(j.tfa.titles.normalized) }, h('span', { class: 'im', style: { backgroundImage: j.tfa.thumbnail ? 'url("' + j.tfa.thumbnail.source + '")' : 'none' } }, j.tfa.thumbnail ? '' : '📖'), h('span', null, h('b', null, j.tfa.titles.normalized), h('small', null, strip(j.tfa.extract).slice(0, 140) + '…'))));
          if (j.mostread) {} } catch (e) { }
        out.append(h('div', { class: 'sec' }, 'Try'), h('div', { class: 'chips' }, ['Rubik’s Cube', 'Solar System', 'Dinosaur', 'Volcano', 'Black hole', 'Chess', 'Ancient Egypt', 'Shark', 'Moon landing', 'Minecraft'].map(t => h('button', { class: 'chip', onclick: () => open(t) }, t))));
      } else if (!S.length) out.append(UI.empty('📚', 'Nothing saved yet', 'When you’re online, open an article and tap “Save for offline”.'));
    }
    async function results(term) {
      ctx.setBack(() => { home(); return true; }); out.innerHTML = '';
      if (!navigator.onLine) { const S = savedList().filter(s => s.title.toLowerCase().includes(term.toLowerCase())); out.append(S.length ? h('div', { class: 'list' }, S.map(s => h('button', { class: 'wsum', onclick: () => open(s.title) }, h('span', { class: 'im' }, '📄'), h('b', null, s.title)))) : UI.empty('📴', 'Searching needs internet', 'Your saved articles still work offline.')); return; }
      out.append(h('div', { class: 'empty' }, 'Searching…'));
      try { const R = await Wiki.search(term); out.innerHTML = ''; if (!R.length) { out.append(UI.empty('🤔', 'No articles found')); return; } out.append(h('div', { class: 'list' }, R.map(r => h('button', { class: 'wsum', onclick: () => open(r.title) }, h('span', { class: 'im' }, '📄'), h('span', null, h('b', null, r.title), h('small', null, r.sum.slice(0, 150))))))); }
      catch (e) { out.innerHTML = ''; out.append(UI.empty('⚠️', 'Couldn’t search right now', e.message)); }
    }
    async function random() { try { const r = await (await fetch('https://en.wikipedia.org/api/rest_v1/page/random/summary')).json(); open(r.titles ? r.titles.normalized : r.title); } catch (e) { UI.toast('Couldn’t load a random article'); } }
    async function open(title) {
      ctx.setBack(() => { home(); return true; }); out.innerHTML = ''; out.append(h('div', { class: 'empty' }, 'Opening…')); scrollTo(0, 0);
      let art = await DB.kget('wiki:' + title, null), fromSave = !!art;
      if (!art || navigator.onLine) { try { art = await Wiki.article(title); fromSave = false; } catch (e) { if (!art) { out.innerHTML = ''; out.append(UI.empty('📴', navigator.onLine ? 'Couldn’t open that article' : 'This article isn’t saved', navigator.onLine ? e.message : 'Connect to the internet to read it, then tap “Save for offline”.')); return; } } }
      const isSaved = () => savedList().some(s => s.title === art.title);
      const saveB = h('button', { class: 'btn sm' + (isSaved() ? '' : ' pri') }, isSaved() ? '✓ Saved' : '⭐ Save for offline');
      saveB.onclick = async () => { if (isSaved()) { Prefs.set('wikiSaved', savedList().filter(s => s.title !== art.title)); await DB.kdel('wiki:' + art.title); saveB.textContent = '⭐ Save for offline'; saveB.classList.add('pri'); UI.toast('Removed from offline'); } else { await DB.kset('wiki:' + art.title, art); Prefs.set('wikiSaved', [{ title: art.title, at: Date.now() }].concat(savedList().filter(s => s.title !== art.title)).slice(0, 200)); saveB.textContent = '✓ Saved'; saveB.classList.remove('pri'); UI.toast('Saved — readable offline (text only)'); } };
      ctx.setTitle(art.title); ctx.setActions(h('button', { class: 'ib', 'aria-label': 'Read aloud', onclick: () => { const t = body.innerText.slice(0, 4000); Speak.say(t); } }, '🔊'));
      const body = h('div', { class: 'wart', html: '<h1>' + esc(art.title) + '</h1>' + art.html });
      body.addEventListener('click', e => { const a = e.target.closest('a[data-wiki]'); if (a) { e.preventDefault(); open(a.dataset.wiki); } });
      out.innerHTML = ''; out.append(h('div', { class: 'row mb' }, saveB, h('button', { class: 'btn sm', onclick: () => shareText('https://en.wikipedia.org/wiki/' + encodeURIComponent(art.title.replace(/ /g, '_')), art.title) }, '📤 Share'), fromSave ? h('span', { class: 'pill' }, '📴 Saved copy') : null), body,
        h('p', { class: 'tiny muted mt' }, 'From Wikipedia, the free encyclopedia (CC BY-SA). Pictures need internet.'));
    }
    if (ctx.param) open(ctx.param); else home();
    return () => Speak.stop();
  },
});

/* ---- 99-boot.js ---- */
/* ===== start ===== */
Offline.init();
Shell.init();
window.__np = { ready: () => true, apps: () => Apps.list.map(a => a.id), errors: [] };
addEventListener('error', e => window.__np.errors.push(String(e.message || e)));
addEventListener('unhandledrejection', e => window.__np.errors.push('promise: ' + String(e.reason && e.reason.message || e.reason)));
