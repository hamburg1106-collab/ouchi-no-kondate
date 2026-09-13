"use strict";

/* サービスワーカー: アプリの見た目（HTML/CSS/JS/アイコン）を端末に保存しておき、
   次回起動を速くしたり、電波が弱い場所でも画面だけは開けるようにする。
   在庫・レシピ・履歴のデータそのものはここではキャッシュしない（常に最新を取りに行く）。 */

const CACHE_NAME = "ucm-shell-v1";
const SHELL_FILES = ["./", "./index.html", "./style.css", "./script.js", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
