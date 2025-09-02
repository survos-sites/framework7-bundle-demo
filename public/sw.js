

/**************************************************** WORKBOX IMPORT ****************************************************/
// The configuration is set to use Workbox
// The following code will import Workbox from CDN or public URL
// Import from public URL

importScripts('/workbox/workbox-sw.js');
importScripts('/idb/umd.js');
workbox.setConfig({modulePathPrefix: '/workbox'});
/**************************************************** END WORKBOX IMPORT ****************************************************/



function registerCacheFirst(routeMatchFn, cacheName, plugins = []) {
  const strategy = new workbox.strategies.CacheFirst({ cacheName, plugins });
  workbox.routing.registerRoute(routeMatchFn, strategy);
  return strategy;
}

function precacheResources(strategy, resourceList, event) {
  if (!(event instanceof ExtendableEvent)) {
    throw new Error("precacheResources needs a valid ExtendableEvent");
  }
  return Promise.all(resourceList.map(path =>
    strategy.handleAll({
      event,
      request: new Request(path),
    })[1]
  ));
}

function createBackgroundSyncPlugin(queueName, maxRetentionTime = 2880, forceSyncFallback = false) {
  return new workbox.backgroundSync.BackgroundSyncPlugin(queueName, {
    maxRetentionTime,
    forceSyncFallback
  });
}

function createBackgroundSyncPluginWithBroadcast(queueName, channelName, maxRetentionTime = 2880, forceSyncFallback = false) {
  const queue = new workbox.backgroundSync.Queue(queueName, {
    maxRetentionTime,
    forceSyncFallback,
  });

  const bc = new BroadcastChannel(channelName);

  const replayQueueWithProgress = async () => {
    let entry;
    let successCount = 0;
    let failureCount = 0;
    const total = (await queue.getAll()).length;

    while ((entry = await queue.shiftRequest())) {
      try {
        await fetch(entry.request.clone());
        successCount++;
      } catch (error) {
        failureCount++;
        await queue.unshiftRequest(entry);
        throw error;
      } finally {
        const remaining = (await queue.getAll()).length;
        bc.postMessage({ name: queueName, replaying: true, remaining });
      }
    }

    const remaining = (await queue.getAll()).length;
    bc.postMessage({
      name: queueName,
      replayed: true,
      remaining,
      successCount,
      failureCount,
    });
  };

  bc.onmessage = async (event) => {
    if (event.data?.type === 'status-request') {
      const entries = await queue.getAll();
      bc.postMessage({ name: queueName, remaining: entries.length });
    }

    if (event.data?.type === 'replay-request') {
      try {
        await replayQueueWithProgress();
      } catch (error) {
        const entries = await queue.getAll();
        bc.postMessage({
          name: queueName,
          replayed: false,
          remaining: entries.length,
          error: error.message,
        });
      }
    }
  };

  return {
    fetchDidFail: async ({ request }) => {
      await queue.pushRequest({ request });
      const entries = await queue.getAll();
      bc.postMessage({ name: queueName, remaining: entries.length });
    },
    onSync: async () => {
      await replayQueueWithProgress();
    },
  };
}

const messageTasks = [];
function registerMessageTask(callback) {
  messageTasks.push(callback);
}

self.addEventListener('message', (event) => {
  event.waitUntil(
    messageTasks.reduce(
      (chain, task) => chain.then(() => task(event)),
      Promise.resolve()
    )
  );
});

const installTasks = [];
function registerInstallTask(callback, priority = 100) {
  installTasks.push({
    callback: (event) => {
      const result = callback(event);
      if (!result?.then) console.warn("Install task did not return a Promise");
      return result;
    },
    priority,
  });
}
self.addEventListener('install', (event) => {
  event.waitUntil(
    installTasks
      .sort((a, b) => a.priority - b.priority)
      .reduce(
        (chain, task) => chain.then(() => task.callback(event)),
        Promise.resolve()
      )
  );
});

function statusGuard(min, max) {
  return {
    fetchDidSucceed: ({ response }) => {
      if (response.status >= min && response.status <= max) {
        throw new Error(`Server error: ${response.status}`);
      }
      return response;
    }
  };
}

registerMessageTask(async (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    await self.skipWaiting();
  }
});

const usedCacheNames = new Set();
function registerCacheName(name) {
  usedCacheNames.add(name);
  return name;
}

async function openBackgroundFetchDatabase() {
  return await self.idb.openDB('bgfetch-completed', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('files')) {
        db.createObjectStore('files', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('chunks')) {
        const store = db.createObjectStore('chunks', { keyPath: ['id', 'index'] });
        store.createIndex('by-id', 'id');
      } else {
        const store = db.transaction.objectStore('chunks');
        if (!Array.from(store.indexNames).includes('by-id')) {
          store.createIndex('by-id', 'id');
        }
      }
    }
  });
}

const bgFetchMetadata = new Map();
const bgFetchChannel = new BroadcastChannel('bg-fetch');
bgFetchChannel.onmessage = async (event) => {
  const { type, id, meta } = event.data || {};

  switch (type) {
    case 'register-meta':
      bgFetchMetadata.set(id, meta);
      break;

    case 'get-meta':
      const metadata = bgFetchMetadata.get(id) || null;
      bgFetchChannel.postMessage({ type: 'meta-response', id, metadata });
      break;

    case 'clear-meta':
      bgFetchMetadata.delete(id);
      break;
      
    case 'list-stored-files':
      {
        const db = await openBackgroundFetchDatabase();
        const files = await db.getAll('files');
        bgFetchChannel.postMessage({ type: 'stored-files', files });
        break;
      }
    
    case 'delete-stored-file':
      {
        const name = event.data.name;
        const db = await openBackgroundFetchDatabase();
        const allFiles = await db.getAll('files');
        const target = allFiles.find(f => f.name === name);
        if (target) {
          await db.delete('files', target.id);
          let index = 0;
          while (await db.get('chunks', [target.id, index])) {
            await db.delete('chunks', [target.id, index++]);
          }
        }
        break;
      }
  }
};

const backgroundFetchTasks = {
  click: [],
  success: [],
  fail: [],
};
function registerBackgroundFetchTask(type, callback, priority = 100) {
  if (!backgroundFetchTasks[type]) {
    throw new Error(`Unknown background fetch event type: ${type}`);
  }

  backgroundFetchTasks[type].push({
    callback: (event) => {
      const result = callback(event);
      if (!result?.then) {
        console.warn(`[${type}] task did not return a Promise`);
      }
      return result;
    },
    priority,
  });
}

function runBackgroundFetchTasks(type, event) {
  const tasks = backgroundFetchTasks[type] ?? [];
  return tasks
    .sort((a, b) => a.priority - b.priority)
    .reduce(
      (chain, task) => chain.then(() => task.callback(event)),
      Promise.resolve()
    );
}

self.addEventListener('backgroundfetchclick', (event) => {
  event.waitUntil(runBackgroundFetchTasks('click', event));
});

self.addEventListener('backgroundfetchsuccess', (event) => {
  event.waitUntil(runBackgroundFetchTasks('success', event));
});

self.addEventListener('backgroundfetchfail', (event) => {
  event.waitUntil(runBackgroundFetchTasks('fail', event));
});


const pushTasks = [];
function registerPushTask(callback) {
  pushTasks.push(callback);
}
self.addEventListener('push', (event) => {
    if (!(self.Notification && self.Notification.permission === 'granted')) {
        return;
    }
    event.waitUntil(
      pushTasks.reduce(
        (chain, task) => chain.then(() => task(event)),
        Promise.resolve()
      )
    );
});

const notificationActionHandlers = new Map();
function registerNotificationAction(actionName, handler) {
  notificationActionHandlers.set(actionName, handler);
}
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const action = event.action || "";
  const promises = [];

  const specificHandler = notificationActionHandlers.get(action);
  if (typeof specificHandler === 'function') {
    promises.push(Promise.resolve(specificHandler(event)));
  }

  const wildcardHandler = notificationActionHandlers.get('*');
  if (typeof wildcardHandler === 'function') {
    promises.push(Promise.resolve(wildcardHandler(event)));
  }

  if (promises.length > 0) {
    event.waitUntil(Promise.all(promises));
  }
});
const structuredPushNotificationSupport = (event) => {
  const {data} = event;
  const sendNotification = response => {
    const {title, options} = JSON.parse(response);
    return self.registration.showNotification(title, options);
  };

  if (data) {
    const message = data.text();
    event.waitUntil(sendNotification(message));
  }
}
function simplePushNotificationSupport(event) {
  const { data } = event;

  if (!data) return;

  const message = data.text();
  const sendNotification = (text) => {
    return self.registration.showNotification('Notification', {
      body: text
    });
  };

  event.waitUntil(sendNotification(message));
}



/**************************************************** CACHE STRATEGY ****************************************************/
// Strategy: CacheFirst
// Match: ({url}) => url.pathname.startsWith('/assets')
// Cache Name: assets
// Enabled: 1
// Needs Workbox: 1
// Method: 

// 1. Creation of the Workbox Cache Strategy object
// 2. Register the route with the Workbox Router
// 3. Add the assets to the cache when the service worker is installed


const cache_0_0 = new workbox.strategies.CacheFirst({
  cacheName: registerCacheName('assets'),plugins: [new workbox.expiration.ExpirationPlugin({
    "maxEntries": 264,
    "maxAgeSeconds": 31536000
})]
});
workbox.routing.registerRoute(({url}) => url.pathname.startsWith('/assets'),cache_0_0);
registerInstallTask((event) => precacheResources(cache_0_0, [
    "/assets/@spomky-labs/pwa-bundle/battery_controller-1zvUlM8.js",
    "/assets/@spomky-labs/pwa-bundle/presentation_controller-Ja4LWIU.js",
    "/assets/@spomky-labs/pwa-bundle/receiver_controller-auggO9d.js",
    "/assets/@spomky-labs/pwa-bundle/speech-synthesis_controller-pnLgiyG.js",
    "/assets/@spomky-labs/pwa-bundle/contact_controller--bz1Lhb.js",
    "/assets/@spomky-labs/pwa-bundle/prefetch-on-demand_controller-EGnyR3S.js",
    "/assets/@spomky-labs/pwa-bundle/jwt_signer-rMDxy1b.js",
    "/assets/@spomky-labs/pwa-bundle/wake-lock_controller-AZuUNNo.js",
    "/assets/@spomky-labs/pwa-bundle/network-information_controller-a36uKfa.js",
    "/assets/@spomky-labs/pwa-bundle/fullscreen_controller-cDz4gEY.js",
    "/assets/@spomky-labs/pwa-bundle/web-push_controller-czf9Gth.js",
    "/assets/@spomky-labs/pwa-bundle/device-motion_controller-Vn1KsVn.js",
    "/assets/@spomky-labs/pwa-bundle/background-fetch_controller-RRspbNT.js",
    "/assets/@spomky-labs/pwa-bundle/abstract_controller-lHossdH.js",
    "/assets/@spomky-labs/pwa-bundle/vibration_controller-WWNgRJt.js",
    "/assets/@spomky-labs/pwa-bundle/barcode-detection_controller-2wM_rT7.js",
    "/assets/@spomky-labs/pwa-bundle/file-handling_controller-F0Y1cZK.js",
    "/assets/@spomky-labs/pwa-bundle/capture_controller-yP__Kii.js",
    "/assets/@spomky-labs/pwa-bundle/picture-in-picture_controller-BzBogPR.js",
    "/assets/@spomky-labs/pwa-bundle/backgroundsync-form_controller-hG3bG3M.js",
    "/assets/@spomky-labs/pwa-bundle/connection-status_controller-a6qV4RW.js",
    "/assets/@spomky-labs/pwa-bundle/device-orientation_controller-IHb4jim.js",
    "/assets/@spomky-labs/pwa-bundle/geolocation_controller-eLT6hhX.js",
    "/assets/@spomky-labs/pwa-bundle/install_controller-TRkeV12.js",
    "/assets/@spomky-labs/pwa-bundle/touch_controller-mAGtlT0.js",
    "/assets/@spomky-labs/pwa-bundle/service-worker_controller-rj3_R_-.js",
    "/assets/@spomky-labs/pwa-bundle/badge_controller-fxsMWke.js",
    "/assets/@spomky-labs/pwa-bundle/web-share_controller-WHj4CRa.js",
    "/assets/@symfony/ux-map/abstract_map_controller-sLMvcdT.js",
    "/assets/@symfony/ux-leaflet-map/map_controller-5Im8-dr.js",
    "/assets/@survos/js-twig/package-43u_m_9.json",
    "/assets/@survos/js-twig/src/lib/dexieDatabase-uS2DZ0v.js",
    "/assets/@survos/js-twig/src/lib/localeUtilities-V-QnXnE.js",
    "/assets/@survos/js-twig/src/controllers/js_twig_controller-madCgpi.js",
    "/assets/@survos/js-twig/src/controllers/dexie_controller-UFfXpt7.js",
    "/assets/@survos/fw/package-G0n42XD.json",
    "/assets/@survos/fw/src/controllers/mobile_controller-SPBPBTY.js",
    "/assets/@symfony/stimulus-bundle/controllers-VpUFp9C.js",
    "/assets/@symfony/stimulus-bundle/loader-V1GtHuK.js",
    "/assets/debug-overlay-8Nc3c5B.js",
    "/assets/images/narrow-UWKwhRQ.png",
    "/assets/images/wide-aF4fqEP.png",
    "/assets/images/ngrok-ARO9WwM.png",
    "/assets/images/pwabundlelogo-a-GWGQU.svg",
    "/assets/store-vYCBRy-.js",
    "/assets/bootstrap-lTtzzxN.js",
    "/assets/old_app-YwHazr8.js",
    "/assets/styles/app-Ay0KkUP.css",
    "/assets/chijal-Ys2ksmA.png",
    "/assets/routes-0YdINgt.js",
    "/assets/icons/tabler/list-RhjHDKa.svg",
    "/assets/icons/tabler/menu-2-DJgtlvL.svg",
    "/assets/icons/tabler/home-aLnp8vf.svg",
    "/assets/icons/tabler/map-DIsGLTR.svg",
    "/assets/icons/tabler/qrcode-tUTXLiz.svg",
    "/assets/icons/tabler/settings-M-7iweN.svg",
    "/assets/icons/tabler/user-heart-rJyl58d.svg",
    "/assets/icons/tabler/home-filled-AhiEteK.svg",
    "/assets/icons/tabler/info-circle-Cx7yBtq.svg",
    "/assets/icons/tabler/refresh-wN58sKA.svg",
    "/assets/icons/tabler/info-square-rounded-fI3uTGl.svg",
    "/assets/icons/tabler/language-katakana-HtcvCcm.svg",
    "/assets/icons/tabler/bug-w6G60Sp.svg",
    "/assets/icons/tabler/location-search-0-2SiPN.svg",
    "/assets/icons/tabler/help-1tq2Qjn.svg",
    "/assets/icons/tabler/refresh-dot-EVGEIs4.svg",
    "/assets/icons/tabler/building-veNjgAx.svg",
    "/assets/icons/tabler/users-ZrsnqVj.svg",
    "/assets/icons/openmoji/artist-MGbXI1C.svg",
    "/assets/icons/symfony-ty857Pe.svg",
    "/assets/icons/icon-park-outline/building-four-UMVzHR8.svg",
    "/assets/icons/icon-park-outline/more-three-ntdx3lW.svg",
    "/assets/icons/mdi/location-on-outline-BS5_M29.svg",
    "/assets/icons/mdi/user-esUFLXc.svg",
    "/assets/icons/mdi/fast-rewind-fVyKHnf.svg",
    "/assets/icons/mdi/headphones-s99eBGU.svg",
    "/assets/icons/mdi/fast-forward-5-AANrO4j.svg",
    "/assets/icons/mdi/play-outline-TMS9hEa.svg",
    "/assets/icons/mdi/fast-forward-t-3BcAW.svg",
    "/assets/icons/mdi/user-star-outline-7_khRPz.svg",
    "/assets/icons/mdi/location-right-7ABl0P1.svg",
    "/assets/icons/mdi/rewind-5-3pi5M-9.svg",
    "/assets/icons/mdi/calendar-L3iFGBq.svg",
    "/assets/icons/grommet-icons/gallery-gWLqBTA.svg",
    "/assets/icons/game-icons/porcelain-vase-VLOQC03.svg",
    "/assets/icons/material-symbols/restaurant-Y1iUuLP.svg",
    "/assets/icons/material-symbols/museum-ZogMxne.svg",
    "/assets/controllers/install-status_controller-tOSJCML.js",
    "/assets/controllers/hello_controller-VYgvytJ.js",
    "/assets/controllers/app_controller-6FPq4RC.js",
    "/assets/controllers/mymap_controller-0U_qZen.js",
    "/assets/controllers/csrf_protection_controller-E_gSC5e.js",
    "/assets/fw--t_dERC.js",
    "/assets/app-t1BSmMu.js",
    "/assets/vendor/idb/idb.index-4Dldwsm.js",
    "/assets/vendor/@hotwired/stimulus/stimulus.index-S4zNcea.js",
    "/assets/vendor/@hotwired/turbo/turbo.index-bxxZ9I5.js",
    "/assets/vendor/htm/htm.index-GFVfo1q.js",
    "/assets/vendor/unlazy/unlazy.index-kKbCI2W.js",
    "/assets/vendor/dom7/dom7.index-czqzdL6.js",
    "/assets/vendor/swiper/swiper.index-gmDHkDk.js",
    "/assets/vendor/stimulus-attributes/stimulus-attributes.index-hpgkI8C.js",
    "/assets/vendor/locutus/php/strings/strip_tags-2gKdFQq.js",
    "/assets/vendor/locutus/php/strings/vsprintf-bzZ10FN.js",
    "/assets/vendor/locutus/php/strings/sprintf-N5SnsEC.js",
    "/assets/vendor/locutus/php/datetime/strtotime-rFibqM_.js",
    "/assets/vendor/locutus/php/datetime/date-VMwoooi.js",
    "/assets/vendor/locutus/php/var/boolval-rXhJqut.js",
    "/assets/vendor/locutus/php/math/max-XOp8bIA.js",
    "/assets/vendor/locutus/php/math/round-0eQUWDK.js",
    "/assets/vendor/locutus/php/math/min-zHRCaHv.js",
    "/assets/vendor/ssr-window/ssr-window.index-Ag2a0DI.js",
    "/assets/vendor/path-to-regexp/path-to-regexp.index-IfRUbQU.js",
    "/assets/vendor/dexie/dexie.index-8SBuQlJ.js",
    "/assets/vendor/leaflet/dist/images/layers-3pzBF1o.png",
    "/assets/vendor/leaflet/dist/images/marker-icon-YJxSj7B.png",
    "/assets/vendor/leaflet/dist/images/layers-2x-gfH5GX_.png",
    "/assets/vendor/leaflet/dist/leaflet.min-eAGB7KE.css",
    "/assets/vendor/leaflet/leaflet.index-Y9-WLvo.js",
    "/assets/vendor/framework7-icons/css/framework7-icons.min-BD5goC-.css",
    "/assets/vendor/framework7-icons/framework7-icons.index-n6DSP2-.js",
    "/assets/vendor/framework7/framework7.index-D9BZ-lH.js",
    "/assets/vendor/framework7/framework7-bundle.min--dzUHOQ.css",
    "/assets/vendor/framework7/framework7-bundle-sCK-GHF.js",
    "/assets/vendor/escape-html/escape-html.index-sWR_y41.js",
    "/assets/vendor/twig/twig.index-psisEMH.js",
    "/assets/vendor/@unlazy/core/core.index-DGR_d36.js",
    "/assets/vendor/fos-routing/fos-routing.index-TVwRjud.js",
    "/assets/vendor/idb-keyval/idb-keyval.index-qD0OEME.js",
    "/assets/bundles/survosfw/style-sYWi-U3.css",
    "/assets/bundles/fosjsrouting/js/router.min-0ceAacf.js",
    "/assets/bundles/fosjsrouting/js/router-Tqg2Aif.js"
], event));
/**************************************************** END CACHE STRATEGY ****************************************************/





/**************************************************** CACHE STRATEGY ****************************************************/
// Strategy: NetworkOnly
// Match: ({url}) => url.pathname.startsWith('/form')
// Cache Name: Background Sync
// Enabled: 1
// Needs Workbox: 1
// Method: POST

// 1. Creation of the Workbox Cache Strategy object
// 2. Register the route with the Workbox Router
// 3. Add the assets to the cache when the service worker is installed
const plugin_cache_1_0_0 = createBackgroundSyncPluginWithBroadcast('form', 'form-list', 7200, true);






const cache_1_0 = new workbox.strategies.NetworkOnly({
  plugins: [plugin_cache_1_0_0, statusGuard(400, 499), statusGuard(500, 599)]
});
workbox.routing.registerRoute(({url}) => url.pathname.startsWith('/form'),cache_1_0,'POST');
/**************************************************** END CACHE STRATEGY ****************************************************/





/**************************************************** CACHE STRATEGY ****************************************************/
// Strategy: CacheFirst
// Match: ({request}) => request.destination === 'font'
// Cache Name: fonts
// Enabled: 1
// Needs Workbox: 1
// Method: GET

// 1. Creation of the Workbox Cache Strategy object
// 2. Register the route with the Workbox Router
// 3. Add the assets to the cache when the service worker is installed




const cache_2_0 = new workbox.strategies.CacheFirst({
  cacheName: registerCacheName('fonts'),plugins: [new workbox.cacheableResponse.CacheableResponsePlugin({
    "statuses": [
        0,
        200
    ]
}), new workbox.expiration.ExpirationPlugin({
    "maxEntries": 62,
    "maxAgeSeconds": 31536000
})]
});
workbox.routing.registerRoute(({request}) => request.destination === 'font',cache_2_0,'GET');
registerInstallTask((event) => precacheResources(cache_2_0, [
    "/assets/vendor/framework7-icons/fonts/Framework7Icons-Regular-9oylwT9.ttf",
    "/assets/vendor/framework7-icons/fonts/Framework7Icons-Regular-rpCKQiL.woff2"
], event));
/**************************************************** END CACHE STRATEGY ****************************************************/





/**************************************************** CACHE STRATEGY ****************************************************/
// Strategy: StaleWhileRevalidate
// Match: ({url}) => url.origin === 'https://fonts.googleapis.com'
// Cache Name: google-fonts-stylesheets
// Enabled: 1
// Needs Workbox: 1
// Method: 

// 1. Creation of the Workbox Cache Strategy object
// 2. Register the route with the Workbox Router
// 3. Add the assets to the cache when the service worker is installed


const cache_3_0 = new workbox.strategies.StaleWhileRevalidate({
  cacheName: registerCacheName('google-fonts-stylesheets'),plugins: []
});
workbox.routing.registerRoute(({url}) => url.origin === 'https://fonts.googleapis.com',cache_3_0);
/**************************************************** END CACHE STRATEGY ****************************************************/





/**************************************************** CACHE STRATEGY ****************************************************/
// Strategy: CacheFirst
// Match: ({url}) => url.origin === 'https://fonts.gstatic.com'
// Cache Name: google-fonts-webfonts
// Enabled: 1
// Needs Workbox: 1
// Method: 

// 1. Creation of the Workbox Cache Strategy object
// 2. Register the route with the Workbox Router
// 3. Add the assets to the cache when the service worker is installed




const cache_3_1 = new workbox.strategies.CacheFirst({
  cacheName: registerCacheName('google-fonts-webfonts'),plugins: [new workbox.cacheableResponse.CacheableResponsePlugin({
    "statuses": [
        0,
        200
    ]
}), new workbox.expiration.ExpirationPlugin({
    "maxEntries": 30,
    "maxAgeSeconds": 31536000
})]
});
workbox.routing.registerRoute(({url}) => url.origin === 'https://fonts.gstatic.com',cache_3_1);
/**************************************************** END CACHE STRATEGY ****************************************************/





/**************************************************** CACHE STRATEGY ****************************************************/
// Strategy: CacheFirst
// Match: ({request, url}) => (request.destination === 'image' && !url.pathname.startsWith('/assets'))
// Cache Name: images
// Enabled: 1
// Needs Workbox: 1
// Method: 

// 1. Creation of the Workbox Cache Strategy object
// 2. Register the route with the Workbox Router
// 3. Add the assets to the cache when the service worker is installed


const cache_4_0 = new workbox.strategies.CacheFirst({
  cacheName: registerCacheName('images'),plugins: []
});
workbox.routing.registerRoute(({request, url}) => (request.destination === 'image' && !url.pathname.startsWith('/assets')),cache_4_0);
/**************************************************** END CACHE STRATEGY ****************************************************/





/**************************************************** CACHE STRATEGY ****************************************************/
// Strategy: CacheFirst
// Match: ({url}) => url.pathname.startsWith('/videos/')
// Cache Name: videos
// Enabled: 1
// Needs Workbox: 1
// Method: 

// 1. Creation of the Workbox Cache Strategy object
// 2. Register the route with the Workbox Router
// 3. Add the assets to the cache when the service worker is installed


const cache_5_0 = new workbox.strategies.CacheFirst({
  cacheName: registerCacheName('videos'),plugins: [new workbox.cacheableResponse.CacheableResponsePlugin({
    "statuses": [
        0,
        200
    ]
})]
});
workbox.routing.registerRoute(({url}) => url.pathname.startsWith('/videos/'),cache_5_0);
/**************************************************** END CACHE STRATEGY ****************************************************/





/**************************************************** CACHE STRATEGY ****************************************************/
// Strategy: NetworkFirst
// Match: ({request}) => request.mode === 'navigate'
// Cache Name: pages
// Enabled: 1
// Needs Workbox: 1
// Method: 

// 1. Creation of the Workbox Cache Strategy object
// 2. Register the route with the Workbox Router
// 3. Add the assets to the cache when the service worker is installed


const cache_5_1 = new workbox.strategies.NetworkFirst({
  networkTimeoutSeconds: 2,cacheName: registerCacheName('pages'),plugins: [new workbox.cacheableResponse.CacheableResponsePlugin({
    "statuses": [
        0,
        200
    ]
})]
});
workbox.routing.registerRoute(({request}) => request.mode === 'navigate',cache_5_1);
/**************************************************** END CACHE STRATEGY ****************************************************/




/**************************************************** CACHE CLEAR ****************************************************/
// The configuration is set to clear the cache on each install event
// The following code will remove all the caches
registerInstallTask(() =>
  caches.keys().then(keys =>
    Promise.all(
      keys
        .filter(k => usedCacheNames.has(k))
        .map(k => caches.delete(k))
    )
  )
, 0);
/**************************************************** END CACHE CLEAR ****************************************************/





/**************************************************** OFFLINE FALLBACK ****************************************************/
// The configuration is set to provide offline fallbacks
workbox.routing.setDefaultHandler(new workbox.strategies.NetworkOnly());
registerInstallTask(() => {
  return caches.open(registerCacheName('offline')).then(cache =>
    cache.addAll([
    "/?_locale=en_US"
])
  );
}, 10);
workbox.routing.setCatchHandler(async ({ request }) => {
  const dest = request.destination;
  const cache = await caches.open('offline');
  const fallbacks = {
    "pageFallback": "/?_locale=en_US"
};

  if (dest === 'document' && fallbacks.pageFallback) {
    return await cache.match(fallbacks.pageFallback) ?? Response.error();
  }
  if (dest === 'image' && fallbacks.imageFallback) {
    return await cache.match(fallbacks.imageFallback) ?? Response.error();
  }
  if (dest === 'font' && fallbacks.fontFallback) {
    return await cache.match(fallbacks.fontFallback) ?? Response.error();
  }

  return Response.error();
});
/**************************************************** END OFFLINE FALLBACK ****************************************************/





/**************************************************** SKIP WAITING ****************************************************/
// The configuration is set to skip waiting on each install event
registerInstallTask(() => self.skipWaiting(), 5);
self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});
/**************************************************** END SKIP WAITING ****************************************************/



