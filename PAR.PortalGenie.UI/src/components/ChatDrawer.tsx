
import React, { useEffect, useRef, useState } from 'react'
import { askGenie } from '../services/api'

type Props = { open: boolean; onClose: () => void }

export function ChatDrawer({ open, onClose }: Props) {
  // Loader state
  const [showLoader, setShowLoader] = useState(false)
  const chatBodyRef = useRef<HTMLDivElement>(null)
  // Feedback state
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  async function sendFeedback(type: 'up' | 'down') {
    setFeedbackLoading(true)
    try {
      await fetch('/your-feedback-api-endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: type }),
      })
      // Optionally show a thank you message or toast
    } catch (err) {
      // Optionally handle error
    } finally {
      setFeedbackLoading(false)
    }
  }
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<{
    role: 'system' | 'user' | 'assistant';
    text: string;
    matches?: any[];
    items?: any[];
  }[]>([
    { role: 'system', text: '👋 Hey there! I\'m PAR Genie. Ask me anything about your Admin Portal.' }
  ])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Scroll chat to bottom when messages change
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
    }

    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200)
      window.addEventListener('keydown', onEsc)
    }
    return () => window.removeEventListener('keydown', onEsc)
  }, [open, onClose, messages])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setMessages(m => [...m, { role: 'user', text: query }])
    setLoading(true)
    setShowLoader(true)

    try {
      // Add artificial delay for loader visibility
      await new Promise(res => setTimeout(res, 900))
      const response = await fetch('http://localhost:5145/api/Assistant/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, limit: 3 }),
      })
      if (!response.ok) throw new Error('Network response was not ok')
      const data = await response.json()
      // Assuming the API returns { reply: string }
      setShowLoader(false)
      if (Array.isArray(data.matches) && data.matches.length > 0) {
        setMessages(m => [...m, { role: 'assistant', text: '', matches: data.matches }])
      } else if (Array.isArray(data.items) && data.items.length > 0) {
        setMessages(m => [...m, { role: 'assistant', text: '', items: data.items }])
      } else {
        setMessages(m => [...m, { role: 'assistant', text: 'No matches found.' }])
      }
    } catch (err: any) {
      setShowLoader(false)
      setMessages(m => [...m, { role: 'assistant', text: 'Sorry, I could not reach the service.' }])
    } finally {
      setLoading(false)
      setQuery('')
    }
  }

  return (
    <>
      <div className={`drawer ${open ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="PAR Genie">
        <div className="drawer-header">
          <div className="genie-badge">✨</div>
          <div className="drawer-title">PAR Genie</div>
          <button className="btn close" onClick={onClose} aria-label="Close">✖</button>
        </div>

        <div className="drawer-body" ref={chatBodyRef}>
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              <div className="bubble">
                {m.role === 'assistant' && Array.isArray(m.matches) && m.matches.length > 0 ? (
                  <>
                    <ul className="match-list">
                      {m.matches.map((match, idx) => (
                        <li key={idx} className="match-item">
                          <div className="match-header">{match.name}</div>
                          <a href="#" className="match-desc">{match.description}</a>
                          <div className="match-percent">{Math.round(match.score * 100)}%</div>
                        </li>
                      ))}
                    </ul>
                    <div className="bubble-feedback">
                      <button
                        className="feedback-btn"
                        aria-label="Thumbs Up"
                        disabled={feedbackLoading}
                        onClick={() => sendFeedback('up')}
                      >
                        <span role="img" aria-label="Thumbs Up">👍</span>
                      </button>
                      <button
                        className="feedback-btn"
                        aria-label="Thumbs Down"
                        disabled={feedbackLoading}
                        onClick={() => sendFeedback('down')}
                      >
                        <span role="img" aria-label="Thumbs Down">👎</span>
                      </button>
                    </div>
                  </>
                ) : m.role === 'assistant' && Array.isArray(m.items) && m.items.length > 0 ? (
                  <ul className="item-list">
                    {m.items.map((item: any, idx: number) => (
                      <li key={idx} className="item-entry">
                        <div><strong>{item.name}</strong></div>
                        <div>ID: {item.id}</div>
                        <div>Price: ${item.price}</div>
                        <div>Discount: {item.discount}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  m.text
                )}
              </div>
            </div>
          ))}
          {showLoader && (
            <div className="msg assistant">
              <div className="bubble">
                <span className="dot-loader">
                  <span></span><span></span><span></span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Feedback icons floating above input */}
        {/* <div className="feedback-bar">
          <button
            className="feedback-btn"
            aria-label="Thumbs Up"
            disabled={feedbackLoading}
            onClick={() => sendFeedback('up')}
          >
            <span role="img" aria-label="Thumbs Up">👍</span>
          </button>
          <button
            className="feedback-btn"
            aria-label="Thumbs Down"
            disabled={feedbackLoading}
            onClick={() => sendFeedback('down')}
          >
            <span role="img" aria-label="Thumbs Down">👎</span>
          </button>
        </div> */}
        <form className="drawer-footer" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type your query…"
            aria-label="Query"
          />
          <button type="submit" className="btn submit" disabled={loading}>
            {loading ? 'Searching…' : 'Search'}
          </button>
        </form>
      </div>

      {open && <div className="backdrop" onClick={onClose} />}
      <style>{css}</style>
    </>
  )
}

const css = `
/* Three dot loader styles */
.dot-loader {
  display: inline-block;
  width: 40px;
  text-align: center;
}
.dot-loader span {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin: 0 2px;
  background: #1bbf4c;
  border-radius: 50%;
  animation: dot-bounce 1s infinite both;
}
.dot-loader span:nth-child(2) {
  animation-delay: 0.2s;
}
.dot-loader span:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes dot-bounce {
  0%, 80%, 100% { transform: scale(1); }
  40% { transform: scale(1.5); }
}
/* Feedback bar styles */
.bubble-feedback {
  position: absolute;
  bottom: 0px;
  right: -84px;
  display: flex;
  gap: 5px;
  z-index: 2;
}
.msg.assistant .bubble {
  position: relative;
}
.feedback-btn {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 18px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  transition: background 0.2s, transform 0.2s;
}
.feedback-btn:hover:not(:disabled) {
  background: #e6f7ee;
  transform: scale(1.15);
}
.feedback-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
/* Match list styles */
.match-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.match-item {
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 12px 0 18px 0;
  border-bottom: 1px solid #eee;
}
.match-header {
  font-weight: bold;
  margin-bottom: 4px;
}
.match-desc {
  color: #2F3452;
  text-decoration: underline;
  margin-bottom: 4px;
  word-break: break-word;
}
.match-percent {
  position: absolute;
  right: 0;
  top: 12px;
  font-weight: bold;
  color: #1bbf4c;
}
.drawer {
  position: fixed; top: 59px; right: 0; width: 420px; height: calc(100vh - 56px);
  background: #fff; border-left: 1px solid var(--par-outline);
  box-shadow: -10px 0 30px rgba(0,0,0,.08);
  transform: translateX(100%); transition: transform .25s ease;
  display: grid; grid-template-rows: auto 1fr auto; z-index: 50;
}
.drawer.open { transform: translateX(0); }

/* Match list styles */
.match-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.match-item {
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 12px 0 18px 0;
  border-bottom: 1px solid #eee;
}
.match-header {
  font-weight: bold;
  margin-bottom: 4px;
}
.match-desc {
  color: #2F3452;
  text-decoration: underline;
  margin-bottom: 4px;
  word-break: break-word;
}
.match-percent {
  position: absolute;
  right: 0;
  top: 12px;
  font-weight: bold;
  color: #1bbf4c;
}

.drawer-header {
  display:flex; align-items:center; gap:10px; padding: 12px 12px; border-bottom: 1px solid var(--par-outline);
  background: linear-gradient(180deg, var(--par-ink) 0%, #3A3F63 100%);
  color:#fff;
}
.genie-badge { width:28px; height:28px; display:grid; place-items:center; border-radius:50%;
  background: linear-gradient(90deg, var(--par-accent-2), var(--par-accent-1)); }
.drawer-title { font-weight:bold; }
.btn.close { margin-left:auto; background: transparent; color:#fff; border:1px solid rgba(255,255,255,.3); cursor:pointer; }

.drawer-body {
  padding: 12px; overflow:auto; background: #FAFAFA;
}
.msg { margin: 15px 0; display:flex; }
.msg.system .bubble { background: #EEF0FF; color: #2F3452; }
.msg.user { justify-content: flex-end; }
.msg.user .bubble { background: #E7F7EF; color: #133A2C; }
.msg.assistant .bubble { background: #FFFFFF; border: 1px solid var(--par-outline); }
.bubble { padding: 10px 12px; border-radius: 12px; max-width: 80%; }

.drawer-footer {
  display:flex; gap:8px; padding: 12px; border-top:1px solid var(--par-outline); background:#fff;
}
.drawer-footer input {
  flex:1; padding:10px 12px; border-radius: 8px; border: 1px solid var(--par-outline);
  font: inherit;
}
.drawer-footer .btn.submit { background: var(--par-accent-2); color:#fff; border:none; cursor:pointer; border-radius:8px; padding: 8px 12px; }
.backdrop {
  position: fixed; inset: 59px 0 0 0; background: rgba(0,0,0,.25); z-index: 40;
}
`
