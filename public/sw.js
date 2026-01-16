// 心语伙伴 PWA Service Worker
const CACHE_NAME = 'xinyu-companion-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/assets/liana.png',
    '/assets/mei.png',
    '/assets/shiori.png',
    '/assets/starrin.png',
    '/assets/onboarding_bg.jpg',
    '/assets/discover_bg.jpg'
];

// 安装 Service Worker
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// 激活 Service Worker
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

// 拦截请求 - 网络优先，失败时使用缓存
self.addEventListener('fetch', (event) => {
    // 跳过非 GET 请求和 API 请求
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // API 请求不缓存
    if (url.pathname.includes('/api/') ||
        url.hostname.includes('openrouter.ai') ||
        url.hostname.includes('siliconflow.cn') ||
        url.hostname.includes('supabase')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // 成功获取响应，更新缓存
                if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // 网络失败，尝试从缓存获取
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // 返回离线页面
                    if (event.request.mode === 'navigate') {
                        return caches.match('/');
                    }
                    return new Response('Offline', { status: 503 });
                });
            })
    );
});

// 处理推送通知（可选功能）
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : '心语伙伴有新消息',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            { action: 'open', title: '打开应用' },
            { action: 'close', title: '稍后查看' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('心语伙伴', options)
    );
});

// 处理通知点击
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});
