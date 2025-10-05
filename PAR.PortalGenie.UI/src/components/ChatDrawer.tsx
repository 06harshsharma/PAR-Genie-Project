
import React, { useEffect, useRef, useState } from 'react'
import { askGenie } from '../services/api'

type Props = { open: boolean; onClose: () => void }

export function ChatDrawer({ open, onClose }: Props) {
  // Loader state
  const [showLoader, setShowLoader] = useState(false)
  const chatBodyRef = useRef<HTMLDivElement>(null)
  // Intro animation state
  const [showIntro, setShowIntro] = useState(false)
  const [introPhase, setIntroPhase] = useState<'slide-in' | 'show' | 'slide-out' | 'done'>('slide-in')
  const [hasPlayedIntro, setHasPlayedIntro] = useState(false)
  // Feedback state
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [lastQuery, setLastQuery] = useState('')
  const [lastMatches, setLastMatches] = useState<any[]>([])
  
  async function sendFeedback(type: 'up' | 'down', query: string, matches: any[]) {
    setFeedbackLoading(true)
    try {
      // Extract report IDs from matches array
      const reportIds = matches.map(match => match.id || match.reportId).filter(Boolean)
      
      await fetch('http://localhost:5145/api/Assistant/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: query,
          matches: reportIds,
          feedback: type === 'up' ? 'positive' : 'negative'
        }),
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
    items?: any;
    action?: any;
    message?: any;
  }[]>([
    { role: 'system', text: '👋 Hey there! I\'m PAR Genie. Ask me anything about your Admin Portal.' }
  ])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Handle intro animation sequence when drawer opens (only on first time)
    if (open && showIntro && !hasPlayedIntro) {
      // Force initial state, then start slide-in animation
      const timer0 = setTimeout(() => setIntroPhase('slide-in'), 100) // Trigger slide-in
      const timer1 = setTimeout(() => setIntroPhase('show'), 1100) // Slide in duration (100 + 1000)
      const timer2 = setTimeout(() => setIntroPhase('slide-out'), 3100) // Show duration (1100 + 2000) - further reduced delay
      const timer3 = setTimeout(() => {
        setIntroPhase('done')
        setShowIntro(false)
        setHasPlayedIntro(true) // Mark intro as played
      }, 4100) // Slide out duration (3100 + 1000)
      
      return () => {
        clearTimeout(timer0)
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    }
  }, [open, showIntro, hasPlayedIntro])

  useEffect(() => {
    // Only show intro animation on first time opening
    if (open && !hasPlayedIntro) {
      setShowIntro(true)
      setIntroPhase('slide-in') // Start with slide-in phase but GIF should be hidden initially
    } else if (open && hasPlayedIntro) {
      // Skip intro animation on subsequent opens
      setShowIntro(false)
    } else {
      // Reset state when drawer closes
      setShowIntro(false)
      setIntroPhase('slide-in')
    }
  }, [open, hasPlayedIntro])

  useEffect(() => {
    // Scroll chat to bottom when messages change
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
    }

    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open && !showIntro) {
      setTimeout(() => inputRef.current?.focus(), 200)
      window.addEventListener('keydown', onEsc)
    }
    return () => window.removeEventListener('keydown', onEsc)
  }, [open, onClose, messages, showIntro])

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
        setLastQuery(query)
        setLastMatches(data.matches)
        setMessages(m => [...m, { role: 'assistant', text: '', matches: data.matches }])
      } else if (data.item) {
        setMessages(m => [...m, { role: 'assistant', text: '', items: data.item, action: data.action, message: data.message }])
      } else {
        setMessages(m => [...m, { role: 'assistant', text: 'Looks like I don’t have that information yet. Want to try a different query?' }])
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
          {showIntro ? (
            <div className={`genie-intro-overlay ${introPhase}`}>
              <img src="/src/assets/images/par_genie.gif" alt="PAR Genie" className="genie-gif-intro" />
            </div>
          ) : (
            <>
              {messages.map((m, i) => (
                <div key={i} className={`msg ${m.role}`}>
                  <div className="bubble">
                    {m.role === 'assistant' && Array.isArray(m.matches) && m.matches.length > 0 ? (
                      <>
                        <ul className="match-list">
                          Sure! Here are some relevant matches:
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
                            onClick={() => sendFeedback('up', lastQuery, m.matches || [])}
                          >
                            <span role="img" aria-label="Thumbs Up">👍</span>
                          </button>
                          <button
                            className="feedback-btn"
                            aria-label="Thumbs Down"
                            disabled={feedbackLoading}
                            onClick={() => sendFeedback('down', lastQuery, m.matches || [])}
                          >
                            <span role="img" aria-label="Thumbs Down">👎</span>
                          </button>
                        </div>
                      </>
                    ) : m.role === 'assistant' && m.items ? (
                      <div className="item-entry">
                        { m.action == "read" ? "Here are some of the details I found:" : m.message}
                        <div><strong>{m.items.name}</strong></div>
                        <div>ID: {m.items.id}</div>
                        <div>Price: ${m.items.price}</div>
                        <div>Discount: {m.items.discount}</div>
                      </div>
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
            </>
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
        {!showIntro && (
          <>
            <form className="drawer-footer" onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Start typing..."
                aria-label="Query"
              />
              <button type="submit" className="btn submit" disabled={loading}>
                {loading ? 'Thinking...' : 'Ask Genie'}
              </button>
            </form>
            <div style={{ fontSize: '12px', color: '#888', textAlign: 'center', padding: '5px 0' }}>
              PAR Genie is evolving. Responses may not always be accurate.<br />Your feedback helps us get better.
            </div>
          </>
        )}
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
  background: #fff;
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
/* Animated intro overlay */
.genie-intro-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #FAFAFA;
  z-index: 10;
  overflow: hidden;
}
.genie-gif-intro {
  width: 320px;
  height: auto;
  border-radius: 24px;
  box-shadow: 0 16px 40px rgba(0,0,0,0.25);
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, calc(-50% + 350px));
  opacity: 0;
  visibility: hidden;
  transition: all 1s ease-out;
}
/* Initial slide-in state - GIF should stay hidden at bottom initially */
.genie-intro-overlay.slide-in .genie-gif-intro {
  transform: translate(-50%, calc(-50% + 350px));
  opacity: 0;
  visibility: hidden;
  animation: slideUpToCenter 1s ease-out 0.1s forwards;
}
@keyframes slideUpToCenter {
  to {
    transform: translate(-50%, -50%);
    opacity: 1;
    visibility: visible;
  }
}
.genie-intro-overlay.show .genie-gif-intro {
  transform: translate(-50%, -50%);
  opacity: 1;
  visibility: visible;
}
.genie-intro-overlay.slide-out .genie-gif-intro {
  transform: translate(-50%, calc(-50% - 350px));
  opacity: 0;
  visibility: hidden;
  transition: all 1s ease-in;
}
.msg { margin: 15px 0; display:flex; }
.msg.system .bubble { background: #EEF0FF; color: #2F3452; }
.msg.user { justify-content: flex-end; }
.msg.user .bubble { background: #E7F7EF; color: #133A2C; }
.msg.assistant .bubble { background: #FFFFFF; border: 1px solid var(--par-outline); }
.bubble { padding: 10px 12px; border-radius: 12px; max-width: 80%; }

.drawer-footer {
  display:flex; gap:8px; padding: 12px 12px 0; border-top:1px solid var(--par-outline); background:#fff;
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
