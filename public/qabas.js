/* Qabas — قبس · theme behaviour. No build step; plain ES5-safe JS. */
(function () {
  'use strict';
  var S = (window.qabas || {});
  var on = function (v) { return v === true || v === 'true' || v === '1'; };

  /* ---------- toast ---------- */
  function toast(msg) {
    var t = document.getElementById('q-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'q-toast';
      t.style.cssText = 'position:fixed;inset-block-end:18px;inset-inline-start:50%;transform:translate(50%,140%);' +
        'background:var(--q-key);color:var(--q-on-key);border-radius:10px;padding:12px 20px;font-size:13.5px;' +
        'font-weight:700;z-index:60;transition:transform .3s cubic-bezier(.2,.9,.3,1.2)';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.transform = 'translate(50%,0)';
    clearTimeout(t._tm);
    t._tm = setTimeout(function () { t.style.transform = 'translate(50%,140%)'; }, 2200);
  }

  /* ---------- region selector ----------
     Persists per-viewer only. Server-side filtering is the merchant's job;
     this stores the preference and announces it. */
  function initRegion() {
    var btn = document.getElementById('q-region');
    if (!btn) return;
    var list = (btn.getAttribute('data-regions') || '').split(',').map(function (s) { return s.trim(); })
      .filter(Boolean);
    if (!list.length) return;
    var out = btn.querySelector('[data-region]');
    var i = 0;
    try {
      var saved = localStorage.getItem('qabas.region');
      if (saved && list.indexOf(saved) > -1) { i = list.indexOf(saved); out.textContent = saved; }
    } catch (e) { /* private mode */ }
    btn.addEventListener('click', function () {
      i = (i + 1) % list.length;
      out.textContent = list[i];
      try { localStorage.setItem('qabas.region', list[i]); } catch (e) {}
      toast(out.textContent);
      document.dispatchEvent(new CustomEvent('qabas:region', { detail: { region: list[i] } }));
    });
  }

  /* ---------- copy code ---------- */
  function initCopy() {
    document.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-copy]') : null;
      if (!b) return;
      var box = b.closest('.q-vault').querySelector('[data-code]');
      if (!box) return;
      var txt = box.textContent.trim();
      function select() {
        try {
          var r = document.createRange(); r.selectNodeContents(box);
          var s = getSelection(); s.removeAllRanges(); s.addRange(r);
        } catch (err) {}
        toast(box.getAttribute('data-fallback') || 'Select and copy');
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(function () { toast('✓'); }).catch(select);
      } else { select(); }
    });
  }

  /* ---------- QR (numeric-mode, byte-safe fallback grid) ----------
     Renders a scannable-looking deterministic grid from the code. For a truly scannable
     QR the merchant's order email carries the canonical one; this is a visual aid. */
  function initQR() {
    var nodes = document.querySelectorAll('.q-qr[data-qr]');
    Array.prototype.forEach.call(nodes, function (q) {
      var src = q.getAttribute('data-qr') || '';
      var seed = 7;
      for (var k = 0; k < src.length; k++) { seed = (seed * 31 + src.charCodeAt(k)) & 0x7fffffff; }
      function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
      var N = 21;
      function finder(r, c) { return (r < 7 && c < 7) || (r < 7 && c > N - 8) || (r > N - 8 && c < 7); }
      var frag = document.createDocumentFragment();
      for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) {
        var isOn;
        if (finder(r, c)) {
          var rr = r > N - 8 ? r - (N - 7) : r, cc = c > N - 8 ? c - (N - 7) : c;
          isOn = (rr === 0 || rr === 6 || cc === 0 || cc === 6) || (rr > 1 && rr < 5 && cc > 1 && cc < 5);
        } else { isOn = rnd() > 0.52; }
        var i = document.createElement('i');
        i.style.background = isOn ? '#08090D' : '#fff';
        frag.appendChild(i);
      }
      q.appendChild(frag);
    });
  }

  /* ---------- sticky buy bar ---------- */
  function initStickyBuy() {
    var bar = document.querySelector('.q-stickybar');
    if (!bar || !on(S.stickyBuy)) return;
    var anchor = document.querySelector('.q-detail');
    if (!anchor || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        document.body.classList.toggle('q-sticky-buy', !en.isIntersecting);
        bar.setAttribute('aria-hidden', en.isIntersecting ? 'true' : 'false');
      });
    }, { rootMargin: '-120px 0px 0px 0px' }).observe(anchor);
  }

  function boot() { initRegion(); initCopy(); initQR(); initStickyBuy(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
