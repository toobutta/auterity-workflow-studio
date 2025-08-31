/**
 * Service Worker for Auterity PWA
 * Handles caching, offline functionality, and background sync
 */

const CACHE_NAME = 'auterity-v1.0.0';
const STATIC_CACHE_NAME = 'auterity-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'auterity-dynamic-v1.0.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/robots.txt'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/workflows',
  '/api/analytics',
  '/api/templates',
  '/api/user/profile'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME)
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Handle other requests
  event.respondWith(handleDefaultRequest(request));
});

// Handle API requests with offline support
async function handleApiRequest(request) {
  // Try network first for API calls
  try {
    const response = await fetch(request);

    // Cache successful GET responses
    if (request.method === 'GET' && response.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Network failed, try cache
    console.log('[SW] Network failed, trying cache for:', request.url);

    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline response for critical endpoints
    if (API_ENDPOINTS.some(endpoint => request.url.includes(endpoint))) {
      return new Response(
        JSON.stringify({
          error: 'Offline',
          message: 'You are currently offline. This data will sync when connection is restored.',
          offline: true
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    throw error;
  }
}

// Handle static assets
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.status === 200) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return offline fallback for HTML
    if (request.headers.get('accept').includes('text/html')) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      return cache.match('/index.html');
    }
    throw error;
  }
}

// Handle default requests
async function handleDefaultRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);

    // Cache successful responses
    if (response.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Return offline fallback for HTML requests
    if (request.headers.get('accept').includes('text/html')) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      return cache.match('/index.html');
    }
    throw error;
  }
}

// Check if request is for a static asset
function isStaticAsset(request) {
  const url = new URL(request.url);
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];

  return staticExtensions.some(ext => url.pathname.endsWith(ext)) ||
         url.pathname.startsWith('/static/') ||
         url.pathname.startsWith('/assets/');
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'background-sync-workflows') {
    event.waitUntil(syncWorkflows());
  }

  if (event.tag === 'background-sync-analytics') {
    event.waitUntil(syncAnalytics());
  }
});

// Sync workflows when back online
async function syncWorkflows() {
  try {
    // Get pending workflow operations from IndexedDB
    const pendingOperations = await getPendingWorkflowOperations();

    for (const operation of pendingOperations) {
      try {
        await fetch('/api/workflows/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(operation)
        });

        // Mark as synced
        await markOperationAsSynced(operation.id);
      } catch (error) {
        console.error('[SW] Failed to sync workflow operation:', operation.id, error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Sync analytics data
async function syncAnalytics() {
  try {
    const pendingAnalytics = await getPendingAnalyticsData();

    if (pendingAnalytics.length > 0) {
      await fetch('/api/analytics/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: pendingAnalytics })
      });

      await clearPendingAnalytics();
    }
  } catch (error) {
    console.error('[SW] Analytics sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);

  if (event.data) {
    const data = event.data.json();

    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/',
        type: data.type
      },
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: '/icons/view.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Auterity', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);

  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.openWindow(url)
  );
});

// Periodic background sync for critical data
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync triggered:', event.tag);

  if (event.tag === 'update-templates') {
    event.waitUntil(updateTemplatesCache());
  }

  if (event.tag === 'sync-user-data') {
    event.waitUntil(syncUserData());
  }
});

// Update templates cache
async function updateTemplatesCache() {
  try {
    const response = await fetch('/api/templates?lastModified=' + Date.now());
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      await cache.put('/api/templates', response);
      console.log('[SW] Templates cache updated');
    }
  } catch (error) {
    console.error('[SW] Failed to update templates cache:', error);
  }
}

// Sync user data
async function syncUserData() {
  try {
    // Sync user preferences, settings, etc.
    const userData = await getLocalUserData();

    if (userData) {
      await fetch('/api/user/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
    }
  } catch (error) {
    console.error('[SW] User data sync failed:', error);
  }
}

// Utility functions for IndexedDB operations (simplified)
async function getPendingWorkflowOperations() {
  // Implementation would use IndexedDB to get pending operations
  return [];
}

async function markOperationAsSynced(operationId) {
  // Implementation would mark operation as synced in IndexedDB
}

async function getPendingAnalyticsData() {
  // Implementation would get pending analytics from IndexedDB
  return [];
}

async function clearPendingAnalytics() {
  // Implementation would clear pending analytics from IndexedDB
}

async function getLocalUserData() {
  // Implementation would get local user data from IndexedDB
  return null;
}

// Message handling from main thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CLEAR_CACHE':
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
      break;

    case 'UPDATE_CACHE':
      updateCache(data.urls);
      break;

    default:
      console.log('[SW] Unknown message type:', type);
  }
});

// Update cache with new URLs
async function updateCache(urls) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);

  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
      }
    } catch (error) {
      console.error('[SW] Failed to cache:', url, error);
    }
  }
}

// Error handling
self.addEventListener('error', (event) => {
  console.error('[SW] Service worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Service worker unhandled rejection:', event.reason);
});