self.addEventListener('install', (e) => {
    console.log('[Service Worker] Install');
});

self.addEventListener('fetch', (e) => {
    // বেসিক ফেচ রিকোয়েস্ট হ্যান্ডেল করা
    e.respondWith(fetch(e.request));
});