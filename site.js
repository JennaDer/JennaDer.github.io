// Motion for the site: scroll reveals, counting numbers, rotating text, and tilt effects.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 0. Build the circuit tulips, Paxton, and the footer garden
  function tulip(cls, delay) {
    return '<svg class="tulip ' + cls + '" style="--td:' + delay + 's" viewBox="0 0 60 122" aria-hidden="true">' +
      '<path class="stem" pathLength="100" d="M30 118 V50 M30 98 l-14 -14 V72 M30 86 l12 -12 V64"/>' +
      '<circle class="via stem" cx="16" cy="70" r="3"/><circle class="via stem" cx="42" cy="62" r="3"/><circle class="via stem" cx="30" cy="118" r="3"/>' +
      '<path class="bloom" pathLength="100" d="M14 16 l8 10 l8 -14 l8 14 l8 -10 v20 l-9 13 h-14 l-9 -13 z"/></svg>';
  }
  var kinds = ['small t-lilac', 'tall', 't-orange', 'small', 't-lilac', 'tall t-orange', 'small', 't-lilac', 'tall', 'small t-orange', '', 'small t-lilac'];
  function garden(n) {
    var out = '';
    for (var k = 0; k < n; k++) out += tulip(kinds[k % kinds.length], (0.1 + k * 0.18).toFixed(2));
    return out;
  }
  var PAXTON = '<div class="paxton" aria-hidden="true"><span class="paxton-tag">Paxton</span>' +
    '<svg viewBox="0 0 124 84"><g class="pax-body">' +
    '<g class="legs-a"><path d="M40 50 L20 66"/><path d="M36 46 L14 60"/><path d="M78 52 L96 68"/><path d="M82 48 L102 62"/></g>' +
    '<g class="legs-b"><path d="M40 50 L50 70"/><path d="M36 48 L44 68"/><path d="M78 52 L68 70"/><path d="M82 50 L74 68"/></g>' +
    '<circle class="fur" cx="25" cy="36" r="7"/>' +
    '<ellipse class="fur" cx="56" cy="40" rx="31" ry="15.5"/>' +
    '<ellipse class="patch" cx="44" cy="33" rx="9" ry="5"/><ellipse class="patch" cx="62" cy="45" rx="7" ry="4"/><ellipse class="patch" cx="30" cy="42" rx="5" ry="3.5"/>' +
    '<ellipse class="white" cx="80" cy="45" rx="11" ry="13"/>' +
    '<path class="patch" d="M83 17 l5 -13 l9 12 z"/>' +
    '<circle class="fur" cx="93" cy="26" r="12.5"/>' +
    '<path class="white" d="M97 14 q6 6 5 14 l-6 -2 z"/>' +
    '<ellipse class="white" cx="105" cy="31" rx="10" ry="6.5"/>' +
    '<ellipse class="tan" cx="95" cy="33" rx="4.5" ry="3.2"/>' +
    '<circle class="dark" cx="113" cy="28.5" r="2.6"/><circle class="dark" cx="96" cy="23" r="1.9"/>' +
    '<path class="tongue" d="M104 36 q1 8 6 4 q1 -3 -1 -5 z"/>' +
    '</g></svg></div>';

  document.querySelectorAll('[data-tulips]').forEach(function (el) {
    el.innerHTML = garden(parseInt(el.dataset.tulips, 10) || 6);
  });
  document.querySelectorAll('[data-paxton]').forEach(function (el) { el.insertAdjacentHTML('beforeend', PAXTON); });

  var footer = document.querySelector('footer.footer');
  if (footer) {
    var g = document.createElement('div');
    g.className = 'footer-garden';
    g.innerHTML = '<div class="footer-tulips">' + garden(9) + '</div>' + (document.querySelector('.field') ? '' : PAXTON);
    footer.parentNode.insertBefore(g, footer);
  }
  // 1. Reveal elements as they scroll into view
  var targets = document.querySelectorAll('.reveal, .route-card, .tulip');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          e.target.querySelectorAll('[data-count]').forEach(count);
          if (e.target.hasAttribute('data-count')) count(e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.18 });
    targets.forEach(function (t) { io.observe(t); });
  } else {
    targets.forEach(function (t) { t.classList.add('in'); });
  }

  // 2. Numbers that count up
  function count(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    var end = parseFloat(el.dataset.count);
    var prefix = el.dataset.prefix || '', suffix = el.dataset.suffix || '';
    var start = null, dur = 1500;
    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(end * eased).toLocaleString('en-US') + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // 3. Rotating "currently" line
  var rot = document.querySelector('.rotator');
  if (rot && !reduce) {
    var items = JSON.parse(rot.dataset.items), i = 0;
    setInterval(function () {
      rot.classList.add('out');
      setTimeout(function () {
        i = (i + 1) % items.length;
        rot.textContent = items[i];
        rot.classList.remove('out');
      }, 420);
    }, 3200);
  }

  // 4. Live local time in each region
  var clocks = document.querySelectorAll('[data-tz]');
  function tick() {
    clocks.forEach(function (el) {
      try {
        el.textContent = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: el.dataset.tz }).format(new Date());
      } catch (e) { el.parentNode.style.display = 'none'; }
    });
  }
  if (clocks.length) { tick(); setInterval(tick, 20000); }

  // 5. Tilt the wafer and project cards toward the cursor
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('[data-tilt]').forEach(function (el) {
      var max = parseFloat(el.dataset.tilt) || 8;
      var inner = el.querySelector('.wafer-tilt') || el;
      el.addEventListener('mousemove', function (ev) {
        var r = el.getBoundingClientRect();
        var x = (ev.clientX - r.left) / r.width - 0.5;
        var y = (ev.clientY - r.top) / r.height - 0.5;
        inner.style.transform = 'perspective(900px) rotateY(' + (x * max) + 'deg) rotateX(' + (-y * max) + 'deg)' + (inner === el ? ' translateY(-6px)' : '');
      });
      el.addEventListener('mouseleave', function () { inner.style.transform = ''; });
    });
  }
})();