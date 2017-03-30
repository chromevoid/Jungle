'use strict';

// The files we want to cache
var urlsToCache = [
  // '//yoav-zibin.github.io/TicTacToe/dist/index.min.html',

  // Same list as in Gruntfile.js (for AppCache)
  // '//yoav-zibin.github.io/TicTacToe/dist/js/everything.min.js',
  // '//yoav-zibin.github.io/TicTacToe/dist/css/everything.min.css',
            '//chromevoid.github.io/Jungle/dist/index.min.html',
            '//chromevoid.github.io/Jungle/dist/js/everything.min.js',
            '//chromevoid.github.io/Jungle/dist/css/everything.min.css',
            '//chromevoid.github.io/Jungle/dist/img/Bcat.png',
            '//chromevoid.github.io/Jungle/dist/img/Bcheetah.png',
            '//chromevoid.github.io/Jungle/dist/img/Bdog.png',
            '//chromevoid.github.io/Jungle/dist/img/Belephant.png',
            '//chromevoid.github.io/Jungle/dist/img/Blion.png',
            '//chromevoid.github.io/Jungle/dist/img/Bmouse.png',
            '//chromevoid.github.io/Jungle/dist/img/Btiger.png',
            '//chromevoid.github.io/Jungle/dist/img/Bwolf.png',
            '//chromevoid.github.io/Jungle/dist/img/go.png',
            '//chromevoid.github.io/Jungle/dist/img/Home.png',
            '//chromevoid.github.io/Jungle/dist/img/Rcat.png',
            '//chromevoid.github.io/Jungle/dist/img/Rcheetah.png',
            '//chromevoid.github.io/Jungle/dist/img/Rdog.png',
            '//chromevoid.github.io/Jungle/dist/img/Relephant.png',
            '//chromevoid.github.io/Jungle/dist/img/Rlion.png',
            '//chromevoid.github.io/Jungle/dist/img/Rmouse.png',
            '//chromevoid.github.io/Jungle/dist/img/Rtiger.png',
            '//chromevoid.github.io/Jungle/dist/img/Rwolf.png',
            '//chromevoid.github.io/Jungle/dist/img/texture.png',
            '//chromevoid.github.io/Jungle/dist/img/Trap.png'
];
var CACHE_NAME = 'cache-v2017-03-30T01:48:20.343Z';

self.addEventListener('activate', function(event) {
  event.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
            cacheNames.map(function(cacheName) {
              if (cacheName != CACHE_NAME) {
                return caches.delete(cacheName);
              }
            })  
        );
      })
  );
});

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          console.log('Service-worker: Cache hit for request ', event.request);
          return response;
        }
        //return fetch(event.request);

        console.log('Service-worker: Cache miss (fetching from internet) for request ', event.request);
        // Cache miss - fetch from the internet and put in cache (for things like avatars from FB).

        // IMPORTANT: Clone the request. A request is a stream and
        // can only be consumed once. Since we are consuming this
        // once by cache and once by the browser for fetch, we need
        // to clone the response
        var fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have 2 stream.
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                console.log('Service-worker: Storing in cache request ', event.request);
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});
