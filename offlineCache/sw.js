const VERSION = "v1";
const urlsToCache = ['/', "./index.html", "./image.jpeg"]

self.addEventListener("install", event => {
  console.log('----install');
  // ServiceWoker注册后，立即添加缓存文件，
  // 当缓存文件被添加完后，才从install -> waiting
  event.waitUntil(
    // 缓存名称调用caches.open()
    caches.open(VERSION).then(cache => {
      // cache.addAll()传入文件数组
      return cache.addAll(urlsToCache);
    })
  );
  // 跳过 waiting 状态，然后会直接进入 activate 阶段
  // event.waitUntil(self.skipWaiting());
});

// 缓存更新
self.addEventListener("activate", event => {
  console.log('----caches');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all([
        // 更新所有客户端 Service Worker
        self.clients.claim(),
        // 清理旧版本
        cacheNames.map(cacheName => {
          // 如果当前版本和缓存版本不一样
          if (cacheName !== VERSION) {
            return caches.delete(cacheName);
          }
        })
      ]);
    })
  );
});

self.addEventListener("fetch", event => {
  console.log('----fetch');
  event.respondWith(
    caches.match(event.request).then(response => {
      // 如果 Service Workder 有自己的返回
      if (response) {
        console.log('-----response');
        return response;
      }

      let request = event.request.clone();
      return fetch(request).then(httpRes => {
        // http请求的返回已被抓到，可以处置了。

        // 请求失败了，直接返回失败的结果就好了。。
        if (!httpRes || httpRes.status !== 200) {
          console.log('----httpRes',httpRes);
          return httpRes;
        }

        // 请求成功的话，将请求缓存起来。
        let responseClone = httpRes.clone();
        caches.open(VERSION).then(cache => {
          cache.put(event.request, responseClone);
        });

        return httpRes;
      });
    })
  );
});