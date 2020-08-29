import React, { createContext, useCallback, useEffect, useState } from 'react'
import { Workbox } from 'workbox-window'
import { Snack } from './Snack'

export const ServiceWorkerContext = createContext<() => void>(() => {
  console.log('update check')
})

export const ServiceWorker: React.FC<{
  scriptURL?: string
}> = React.memo(({ children, scriptURL = '/service-worker.js' }) => {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration>()
  const [notification, setNotification] = useState<React.ReactElement>()

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      return
    }

    const workbox = new Workbox(scriptURL)

    const handleReload = () => {
      setNotification(undefined)

      workbox.addEventListener('controlling', () => {
        window.location.reload()
      })

      workbox.messageSW({ type: 'SKIP_WAITING' }).catch((error) => {
        console.error(error)
      })
    }

    const handleWaiting = () => {
      setNotification(
        <Snack
          message={'A new version of the app is available'}
          actions={[
            {
              text: 'UPDATE',
              callback: handleReload,
            },
          ]}
        />
      )
    }

    workbox.addEventListener('waiting', handleWaiting)

    workbox
      .register()
      .then(setRegistration)
      .catch((error) => {
        console.error(error)
      })

    return () => {
      workbox.removeEventListener('waiting', handleWaiting)
    }
  }, [scriptURL])

  const updateCheck = useCallback(() => {
    if (registration) {
      registration.update().catch((error) => {
        console.error(error)
      })
    }
  }, [registration])

  return (
    <ServiceWorkerContext.Provider value={updateCheck}>
      {children}
      {notification}
    </ServiceWorkerContext.Provider>
  )
})
