var CACHE_NAME = “passport-v1”;
var SHELL = [
“/index.html”,
“/manifest.json”,
“/icon-192.png”,
“/icon-512.png”
];

self.addEventListener(“install”, function(event) {
event.waitUntil(
caches.open(CACHE_NAME).then(function(cache) {
return cache.addAll(SHELL);
})
);
self.skipWaiting();
});

self.addEventListener(“activate”, function(event) {
event.waitUntil(
caches.keys().then(function(keys) {
return Promise.all(
keys.filter(function(k) { return k !== CACHE_NAME; })
.map(function(k)   { return caches.delete(k); })
);
})
);
self.clients.claim();
});

self.addEventListener(“fetch”, function(event) {
var url = event.request.url;

// Always go network-first for Firebase so live scores stay fresh
if (url.indexOf(“firebaseio.com”) !== -1 ||
url.indexOf(“googleapis.com”) !== -1 ||
url.indexOf(“gstatic.com”)    !== -1) {
event.respondWith(fetch(event.request));
return;
}

// Cache-first for everything else (app shell)
event.respondWith(
caches.match(event.request).then(function(cached) {
return cached || fetch(event.request).then(function(response) {
return caches.open(CACHE_NAME).then(function(cache) {
cache.put(event.request, response.clone());
return response;
});
});
})
);
});
