// Custom Background Sync event listener for VKU Field Survey
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-surveys') {
    console.log('[Service Worker] Background Sync event triggered for tag: "sync-surveys"');
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        if (clientList && clientList.length > 0) {
          for (const client of clientList) {
            client.postMessage({ type: 'SYNC_TRIGGERED', tag: event.tag });
          }
        }
      })
    );
  }
});
