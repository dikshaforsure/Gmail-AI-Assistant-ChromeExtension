import React, { useState, useEffect } from 'react'
import { Settings } from 'lucide-react'
import './App.css'

const Popup = () => {
  const [apiKey, setApiKey] = useState('')
  const [saved, setSaved] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    chrome.storage.local.get(['apiKey'], (result) => {
      if (result.apiKey) {
        setApiKey(result.apiKey)
        setSaved(true)
      }
    })
  }, [])

  const handleChange = (e) => {
    setApiKey(e.target.value)
    setSaved(false)
    setMessage('')
  }

  const saveApiKey = () => {
    if (!apiKey.trim()) {
      setMessage('Please enter a valid API key.')
      return
    }

    chrome.storage.local.set({ apiKey }, () => {
      setSaved(true)
      setMessage('API Key saved successfully! 🎉')
    })
  }

  return (
    <div className="popup-container">
      <div className="popup-header">
        <Settings className="icon" />
        <h2>Gmail AI Assistant</h2>
      </div>

      <div className="popup-content">
        <div className="input-group">
          <label htmlFor="apiKey">
            🔑
            Groq API Key
          </label>

          <input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={handleChange}
            placeholder="Enter your Groq API key"
          />

          <button
            onClick={saveApiKey}
            className={`save-btn ${saved ? 'saved' : ''}`}
            disabled={!apiKey.trim()}
          >
            {saved ? '👍🏻 Already Saved' : '💾 Save Key'}
          </button>
        </div>

        {message && (
          <div className="info">
            <p>{message}</p>
          </div>
        )}

        <div className="info">
          <p>
            Get your API key from{' '}
            <a
              href="https://console.groq.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Groq Console
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Popup
