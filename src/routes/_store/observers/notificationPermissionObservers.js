export function notificationPermissionObservers (store) {
  if (!process.browser || !navigator.permissions || !navigator.permissions.query) {
    return
  }

  navigator.permissions.query({ name: 'notifications' }).then(permission => {
    store.set({ notificationPermission: permission.state })

    permission.onchange = event => {
      store.set({ notificationPermission: event.target.state })
    }
  })
}
