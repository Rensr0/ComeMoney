// Service Worker文件

// 缓存名称和版本
const CACHE_NAME = 'come-money-cache-v1';

// 需要缓存的资源列表
const CACHE_URLS = [
  '/',
  '/index.html',
  '/setting.html',
  '/about.html',
  '/css/style.css',
  '/css/mobile.css',
  '/css/all.min.css',
  '/img/money.png',
  '/js/index-main.js',
  '/js/setting-main.js',
  '/js/about-main.js',
  '/js/modules/navigation.js',
  '/js/modules/config.js',
  '/js/modules/ui.js',
  '/js/modules/settings-events.js',
  '/js/modules/timers.js',
  '/js/modules/calculator.js',
  '/js/modules/holiday.js',
  '/js/modules/clipboard.js'
];

// 安装事件 - 预缓存资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('缓存已打开');
        return cache.addAll(CACHE_URLS);
      })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 拦截请求 - 优先使用缓存，失败时才请求网络
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果找到缓存的响应，则返回缓存
        if (response) {
          return response;
        }
        
        // 没有找到缓存，请求网络
        return fetch(event.request).then(response => {
          // 检查是否收到有效响应
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // 克隆响应，因为响应是流，只能使用一次
          const responseToCache = response.clone();
          
          // 打开缓存并存储响应
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
            
          return response;
        });
      })
  );
}); 