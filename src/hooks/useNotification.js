import { useState, useCallback } from 'react'

const useNotification = () => {
  const [notification, setNotification] = useState({
    show: false,
    type: 'info',
    title: '',
    message: '',
    autoClose: true,
    duration: 5000
  })

  const showNotification = useCallback(({
    type = 'info',
    title,
    message,
    autoClose = true,
    duration = 5000
  }) => {
    setNotification({
      show: true,
      type,
      title,
      message,
      autoClose,
      duration
    })
  }, [])

  const hideNotification = useCallback(() => {
    setNotification(prev => ({
      ...prev,
      show: false
    }))
  }, [])

  // Métodos de conveniencia
  const showSuccess = useCallback((title, message) => {
    showNotification({ type: 'success', title, message })
  }, [showNotification])

  const showError = useCallback((title, message) => {
    showNotification({ type: 'error', title, message })
  }, [showNotification])

  const showWarning = useCallback((title, message) => {
    showNotification({ type: 'warning', title, message })
  }, [showNotification])

  const showInfo = useCallback((title, message) => {
    showNotification({ type: 'info', title, message })
  }, [showNotification])

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}

export default useNotification