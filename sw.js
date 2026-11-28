/* خدمة التخزين المؤقت لتطبيق أصول القطع: تعمل بدون إنترنت بعد أول فتح */
const V = 'usool-v8', CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
const LIBS = ['cdn.jsdelivr.net', 'cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url); if (r.method !== 'GET') return;
  if (u.origin === location.origin) {
    /* الصفحة: الشبكة أولًا ليصل آخر إصدار، وإلا النسخة المحفوظة */
    e.respondWith(fetch(r, { cache: 'no-cache' }).then(res => { if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; }).catch(() => caches.match(r).then(x => x || caches.match('./index.html'))));
  } else if (LIBS.includes(u.hostname)) {
    /* المكتبات والخطوط: من الذاكرة فورًا ثم تحديث في الخلفية */
    e.respondWith(caches.open(V).then(c => c.match(r).then(hit => { const net = fetch(r).then(res => { c.put(r, res.clone()); return res; }).catch(() => hit); return hit || net; })));
  }
  /* كل ما عدا ذلك (مثل المزامنة مع Supabase) يمرّ للشبكة دون تخزين */
});
