import { useEffect, useRef } from 'react'
import './CallWidget.css'

declare global {
  interface Window {
    VapiClientSDK: any
  }
}

export default function CallWidget() {
  const vapi = useRef<any>(null)
  const isInitializing = useRef(false)

  useEffect(() => {
    if (isInitializing.current) return
    isInitializing.current = true

    const initVapi = async () => {
      try {
        // Load Vapi SDK
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/@vapi-ai/web@latest/build/index.js'
        script.async = true
        script.onload = () => {
          const vapiKey = import.meta.env.VITE_VAPI_PUBLIC_KEY
          if (!vapiKey) {
            console.error('VITE_VAPI_PUBLIC_KEY not set in environment')
            return
          }

          vapi.current = new (window as any).Vapi({
            apiKey: vapiKey,
          })
        }
        document.head.appendChild(script)
      } catch (error) {
        console.error('Failed to initialize Vapi:', error)
      }
    }

    initVapi()

    return () => {
      if (vapi.current) {
        try {
          vapi.current.stop()
        } catch (error) {
          console.error('Error stopping Vapi:', error)
        }
      }
    }
  }, [])

  const handleStartCall = () => {
    if (!vapi.current) {
      console.error('Vapi not initialized')
      return
    }

    try {
      vapi.current.start()
    } catch (error) {
      console.error('Failed to start call:', error)
    }
  }

  const handleStopCall = () => {
    if (!vapi.current) return

    try {
      vapi.current.stop()
    } catch (error) {
      console.error('Failed to stop call:', error)
    }
  }

  return (
    <div className="call-widget">
      <div className="call-widget-buttons">
        <button className="call-btn start-btn" onClick={handleStartCall}>
          <span className="btn-icon">📞</span>
          <span>Start Call</span>
        </button>
        <button className="call-btn stop-btn" onClick={handleStopCall}>
          <span className="btn-icon">⏹️</span>
          <span>End Call</span>
        </button>
      </div>
      <p className="call-widget-info">
        Your browser microphone and speakers will be used. Make sure they're enabled.
      </p>
    </div>
  )
}
