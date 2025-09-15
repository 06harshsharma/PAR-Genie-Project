
import React, { useEffect, useRef, useState } from 'react'
import { askGenie } from '../services/api'

type Props = { open: boolean; onClose: () => void }

export function ChatDrawer({ open, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<{ role: 'system'|'user'|'assistant'; text: string }[]>([
    { role: 'system', text: '👋 Hey there! I’m PAR Genie. Ask me anything about your Admin Portal data.' }
  ])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200)
      window.addEventListener('keydown', onEsc)
    }
    return () => window.removeEventListener('keydown', onEsc)
  }, [open, onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setMessages(m => [...m, { role: 'user', text: query }])
    setLoading(true)
    
    try {
      // Call POST API with input value as body
      const response = await fetch('http://localhost:5145/api/Reports/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, limit: 3 }),
      })
      if (!response.ok) throw new Error('Network response was not ok')
      const data = await response.json()
      // Assuming the API returns { reply: string }
        let replyText = ''
        if (Array.isArray(data.matches) && data.matches.length > 0) {
          replyText = data.matches.map(m => {
            const percent = Math.round(m.score * 100)
            return `• ${m.name} (${m.category})\n${m.description}\nMatch: ${percent}%`
          }).join('\n\n')
        } else if (data.reply) {
          replyText = data.reply
        } else {
          replyText = 'No matches found.'
        }

        setMessages(m => [...m, { role: 'assistant', text: replyText }])
    } catch (err: any) {
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

        <div className="drawer-body">
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              <div className="bubble">{m.text}</div>
            </div>
          ))}
        </div>

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
.drawer {
  position: fixed; top: 59px; right: 0; width: 420px; height: calc(100vh - 56px);
  background: #fff; border-left: 1px solid var(--par-outline);
  box-shadow: -10px 0 30px rgba(0,0,0,.08);
  transform: translateX(100%); transition: transform .25s ease;
  display: grid; grid-template-rows: auto 1fr auto; z-index: 50;
}
.drawer.open { transform: translateX(0); }

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
.msg { margin: 8px 0; display:flex; }
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
