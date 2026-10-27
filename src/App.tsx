import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, ReactNode, SubmitEvent } from 'react'
import { apiRequest, convertCode, defaults, serverUrl } from './lib/llm'
import type { Settings } from './lib/llm'
import './App.css'

type IconName = 'settings' | 'arrow' | 'upload' | 'copy' | 'download' | 'close' | 'shield' | 'code' | 'spark' | 'check' | 'book' | 'reset' | 'moon'
function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    moon: <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />,
    settings: <><path d="m9 3 1-1h4l1 3 3 1 3 3-1 3 1 3-3 3-3 1-1 3h-4l-1-3-3-1-3-3 1-3-1-3 3-3 3-1Z" /><circle cx="12" cy="12" r="3" /></>,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />, upload: <path d="M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6" />,
    copy: <><rect x="8" y="8" width="12" height="13" rx="2" /><path d="M16 8V3H3v13h5" /></>, download: <path d="M12 3v13m-5-5 5 5 5-5M4 16v5h16v-5" />,
    close: <path d="m6 6 12 12M6 18 18 6" />, shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z" /><path d="m8 12 3 3 5-6" /></>,
    code: <path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-14-2 18" />, spark: <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4m-2-2h4" />,
    check: <path d="m5 12 4 4L19 6" />, book: <path d="M12 5v16M3 4c4-1 6 0 9 2 3-2 5-3 9-2v15c-4-1-6 0-9 2-3-2-5-3-9-2Z" />, reset: <path d="M3 10a9 9 0 1 1 1 7M3 4v6h6" />,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}
function Pumpkin() {
  return <svg width="34" height="34" viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M24 13c-6-9-19-1-19 13 0 15 14 18 19 13 7 5 19 0 19-13 0-14-13-22-19-13Z" fill="#ed955b" stroke="#342b35" strokeWidth="2" /><path d="M24 13c-9 4-10 22 0 26 9-5 9-22 0-26ZM24 13c-2-6 0-9 5-10" stroke="#342b35" strokeWidth="2" /><path d="m13 22 7 4-8 2Zm22 0-7 4 8 2ZM15 32l5 3 4-2 4 2 5-3" fill="#342b35" stroke="#342b35" strokeLinejoin="round" /></svg>
}
function Graveyard() {
  return <svg className="graveyard" viewBox="0 0 380 220" fill="none" aria-hidden="true">
    <circle cx="273" cy="70" r="51" fill="#e9e2ee" /><path d="M304 27a47 47 0 0 0 14 81 51 51 0 0 1-14-81" fill="#f8f7f3" />
    <path d="m47 52 8 4 7-2-3 9 5 8-12-3-10 4 3-10-5-8Z" fill="#453b52" /><path d="m302 126 8-4 7 1-2-7 7-7-11 1-7-5 1 8-6 6Z" fill="#453b52" />
    <g transform="rotate(-9 135 140)"><path d="M88 179V96a46 46 0 0 1 92 0v83" fill="#ded9e1" stroke="#776b81" strokeWidth="2" /><path d="M97 177V97a37 37 0 0 1 74 0v80" stroke="#b4a9bc" /><text x="134" y="107" textAnchor="middle" fontFamily="Georgia,serif" fontSize="19" fill="#65576e">R.I.P.</text><path d="M112 117h44" stroke="#b5a9bc" /><text x="134" y="139" textAnchor="middle" fontFamily="monospace" fontSize="12" fill="#65576e">FORTRAN</text><text x="134" y="155" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="#85758f">1957 — ∞</text><path d="m156 63-6 19 9 8-7 12" stroke="#a598ae" /></g>
    <path d="M181 118c12-13 27-13 38-8m-9-10 10 11-13 5" stroke="#8e73a5" strokeWidth="2" strokeDasharray="4 4" />
    <g transform="rotate(8 250 150)"><rect x="224" y="124" width="58" height="61" rx="16" fill="#d4c4e8" stroke="#6d5488" strokeWidth="1.5" /><path d="M253 136h-12a9 9 0 0 0-9 9v6h22v7h-22" stroke="#6d5488" strokeWidth="3" strokeLinecap="round" /><path d="M253 173h12a9 9 0 0 0 9-9v-6h-22v-7h22" stroke="#6d5488" strokeWidth="3" strokeLinecap="round" /><circle cx="242" cy="141" r="2" fill="#6d5488" /><circle cx="264" cy="168" r="2" fill="#6d5488" /></g>
    <path d="M52 187c66-15 170 10 265-2M72 184l-5-15m9 15 4-11m109 16-3-16m6 16 6-11m101 8 4-16m-1 17 9-10" stroke="#a9a0ad" strokeWidth="1.5" strokeLinecap="round" />
    <path d="m205 48 2 6 6 2-6 2-2 6-2-6-6-2 6-2Zm124 33 1 4 4 1-4 1-1 4-1-4-4-1 4-1Z" fill="#ab94bc" />
  </svg>
}
const example = `C     A little life left in these old bones.
      PROGRAM FIBONACCI
      INTEGER N, I, A, B, TEMP
      PARAMETER (N = 10)
C
C     PRINT THE FIRST N FIBONACCI NUMBERS
      A = 0
      B = 1
      DO 10 I = 1, N
         PRINT *, A
         TEMP = A + B
         A = B
         B = TEMP
   10 CONTINUE
C
      END`
function readSettings(): Settings {
  try {
    // Stored preferences may be stale or manually edited; fall back to defaults unless their shape matches.
    const saved = JSON.parse(localStorage.getItem('reanimate-settings') || 'null')
    if (saved && ['host', 'port', 'basePath', 'model'].every(k => typeof saved[k] === 'string') && ['http', 'https'].includes(saved.protocol)) return saved
  } catch { /* Storage is optional. */ }
  return defaults
}
function App() {
  // main.tsx applies the saved theme before React mounts; use that value for the initial toggle state.
  const [darkMode, setDarkMode] = useState(() => document.documentElement.dataset.theme !== 'light')
  useEffect(() => {
    const theme = darkMode ? 'dark' : 'light'
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', darkMode ? '#18151e' : '#f8f7f3')
    try { localStorage.setItem('reanimate-theme', theme) } catch { /* Theme still works for this tab. */ }
  }, [darkMode])
  const [settings, setSettings] = useState<Settings>(readSettings)
  // Edit a draft so dismissing the dialog leaves the active server settings unchanged.
  const [draft, setDraft] = useState(settings)
  // Credentials and source/output code stay in React state and are never written to browser storage.
  const [apiKey, setApiKey] = useState('')
  const [modal, setModal] = useState<'settings' | 'guide' | null>(null)
  const [source, setSource] = useState(example)
  const [filename, setFilename] = useState('fibonacci.f')
  const [output, setOutput] = useState('')
  const [comments, setComments] = useState(true)
  const [numpy, setNumpy] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [connection, setConnection] = useState('Not connected')
  const [testMessage, setTestMessage] = useState('')
  const [testing, setTesting] = useState(false)
  const [models, setModels] = useState<string[]>([])
  const [dragging, setDragging] = useState(false)
  const [copied, setCopied] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const controller = useRef<AbortController | null>(null)
  // Discovery and conversion have separate lifetimes: closing settings only cancels discovery.
  const connectionController = useRef<AbortController | null>(null)
  const lineNumbers = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (modal) dialog.current?.showModal()
    else dialog.current?.close()
    if (modal !== 'settings') {
      connectionController.current?.abort()
    }
  }, [modal])
  // Stop outstanding requests when the app unmounts, including React Strict Mode's development cleanup.
  useEffect(() => () => { controller.current?.abort(); connectionController.current?.abort() }, [])
  function openSettings() { setDraft(settings); setTestMessage(''); setModels([]); setModal('settings') }
  function updateDraft(next: Partial<Settings>) { setDraft({ ...draft, ...next }); setTestMessage(''); setModels([]) }
  async function testConnection() {
    const abort = new AbortController()
    connectionController.current = abort
    setTesting(true); setTestMessage('')
    try {
      // Either closing the dialog or the ten-second deadline can stop model discovery.
      const response = await apiRequest(draft, apiKey, '/models', { signal: AbortSignal.any([abort.signal, AbortSignal.timeout(10000)]) })
      const data = await response.json()
      // The dialog may have closed while the response body was being read.
      if (abort.signal.aborted) return
      if (!Array.isArray(data.data)) throw new Error('The server did not return an OpenAI-compatible model list.')
      const names = data.data.map((m: { id?: string }) => m.id).filter((id: unknown): id is string => typeof id === 'string')
      setModels(names)
      if (!draft.model && names.length) setDraft({ ...draft, model: names[0] })
      setTestMessage(names.length ? `Connected. Found ${names.length} model${names.length === 1 ? '' : 's'}.` : 'Connected. No models reported; enter a loaded model name below.')
    } catch (e) { if (!abort.signal.aborted) setTestMessage(e instanceof Error ? (e.name === 'TimeoutError' ? 'Connection timed out after 10 seconds.' : e.message) : 'Connection failed.') }
    finally { setTesting(false) }
  }
  function saveSettings(e: SubmitEvent) {
    e.preventDefault()
    try {
      serverUrl(draft)
      if (!draft.model.trim()) throw new Error('Enter the model name served by your LLM server.')
      setSettings({ ...draft, model: draft.model.trim() }); setConnection('Ready to connect')
      // Saving preferences does not contact the server; only explicit discovery or conversion does.
      try { localStorage.setItem('reanimate-settings', JSON.stringify(draft)) } catch { setNotice('Settings are available for this session; browser storage is unavailable.') }
      setModal(null)
    } catch (e) { setTestMessage(e instanceof Error ? e.message : 'Invalid settings.') }
  }
  async function resurrect() {
    if (!settings.model) { openSettings(); return }
    if (!source.trim() || busy) return
    setBusy(true); setError(''); setNotice(''); setOutput('')
    const abort = new AbortController(); controller.current = abort
    try {
      // Share one signal with fetch so both the Cancel button and the five-minute deadline stop the request.
      const result = await convertCode(settings, apiKey, source, comments, numpy, AbortSignal.any([abort.signal, AbortSignal.timeout(300000)]))
      setOutput(result); setConnection('Connected')
    } catch (e) {
      if (abort.signal.aborted) setNotice('Resurrection cancelled. Your FORTRAN is still here.')
      else { setConnection('Connection needs attention'); setError(e instanceof Error ? e.name === 'TimeoutError' ? 'The model took longer than five minutes. Try a smaller program.' : e.message : 'Conversion failed.') }
    } finally { setBusy(false); controller.current = null }
  }
  async function loadFile(file?: File) {
    if (!file || busy) return
    if (file.size > 1024 * 1024) { setError('Please choose a source file smaller than 1 MB.'); return }
    // Read locally; a NUL byte is a simple check for accidental binary uploads before accepting the text.
    try { const text = await file.text(); if (text.includes('\0')) throw new Error('Please upload a text source file.'); setSource(text); setFilename(file.name); setOutput(''); setError(''); setNotice('') }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not read this file.') }
  }
  async function copyOutput() {
    try { await navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000) }
    catch { setError('Clipboard access is unavailable. Select the Python code to copy it, or download the file.') }
  }
  function download() {
    // Export the text as a file without executing it, then release the temporary URL after the click.
    const url = URL.createObjectURL(new Blob([output], { type: 'text/x-python;charset=utf-8' }))
    const link = document.createElement('a'); link.href = url; link.download = filename.replace(/\.[^.]*$/, '') + '.py'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  // Editing invalidates the previous conversion so it cannot be mistaken for output from the new source.
  function editSource(e: ChangeEvent<HTMLTextAreaElement>) { setSource(e.target.value); setOutput(''); setNotice(''); setError('') }
  return <>
    <header className="topbar"><a className="brand" href="#" aria-label="Reanimate home"><Pumpkin /><span>reanimate fortran<span className="brand-dot">.</span></span></a><nav aria-label="Main navigation"><span className="nav-active">The laboratory</span><button onClick={() => setModal('guide')}><span>How it works</span> <Icon name="arrow" size={14} /></button></nav><div className="header-actions"><button className="theme-toggle" type="button" aria-label="Dark mode" aria-pressed={darkMode} title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'} onClick={() => setDarkMode(current => !current)}><Icon name="moon" size={16} /></button><button className="settings-button" onClick={openSettings}><Icon name="settings" size={16} /> Settings</button></div></header>
    <main>
      <section className="intro"><div className="intro-copy"><h1>Some code deserves<br />a <span>second life.</span><svg viewBox="0 0 270 13" aria-hidden="true"><path d="M3 8Q110-3 264 5M8 12Q151 2 254 10" fill="none" stroke="#c6afd9" strokeWidth="3" strokeLinecap="round" /></svg></h1><p>Bring your FORTRAN back from the dead.<br />Turn legacy code into modern Python, with a little local LLM magic.</p></div><Graveyard /><div className="hero-note">A fresh start for old souls. <span>✦</span></div></section>
      <section className="laboratory" aria-label="Code conversion laboratory">
        <div className="lab-heading"><div><span className="lab-icon"><Icon name="code" size={18} /></span><h2>The resurrection lab</h2><span className="version-tag">FORTRAN → PYTHON</span></div><span className="local-badge"><Icon name="shield" size={14} /> Local by design</span></div>
        <div className="editors">
          <section className={`editor source-editor ${dragging ? 'dragging' : ''}`} onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); void loadFile(e.dataTransfer.files[0]) }}>
            <div className="editor-header"><div><span className="language-dot fortran-dot" /><h3>The old bones</h3><span className="language-tag">FORTRAN</span></div><button className="text-button" onClick={() => fileInput.current?.click()} disabled={busy}><Icon name="upload" size={14} /> Upload file</button><input ref={fileInput} type="file" accept=".f,.for,.f77,.f90,.f95,.f03,.f08,.ftn,.txt" hidden onChange={e => { void loadFile(e.target.files?.[0]); e.target.value = '' }} /></div>
            <div className="file-tab"><Icon name="code" size={13} /><span>{filename}</span><span className="file-tab-dot" /></div>
            <div className="code-input"><div className="line-numbers" aria-hidden="true" ref={lineNumbers}>{source.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}</div><textarea aria-label="FORTRAN source code" value={source} onChange={editSource} spellCheck={false} disabled={busy} onScroll={e => { if (lineNumbers.current) lineNumbers.current.scrollTop = e.currentTarget.scrollTop }} placeholder="Paste your FORTRAN code here…" /></div>
            <div className="editor-footer"><span>{source.split('\n').length} lines <span className="separator">·</span> {source.length.toLocaleString()} characters</span><button className="text-button" disabled={busy} onClick={() => { setSource(example); setFilename('fibonacci.f'); setOutput(''); setError(''); setNotice('') }}><Icon name="reset" size={12} /> Load example</button></div>
          </section>
          <section className="editor output-editor"><div className="editor-header"><div><span className="language-dot python-dot" /><h3>A new beginning</h3><span className="language-tag">PYTHON</span></div><div className="output-actions"><button className="icon-button" title={copied ? 'Copied!' : 'Copy Python'} aria-label={copied ? 'Copied' : 'Copy Python'} disabled={!output} onClick={() => void copyOutput()}><Icon name={copied ? 'check' : 'copy'} size={15} /></button><button className="icon-button" title="Download Python" aria-label="Download Python" disabled={!output} onClick={download}><Icon name="download" size={16} /></button></div></div>
            {output ? <><div className="file-tab output-file"><Icon name="code" size={13} />{filename.replace(/\.[^.]*$/, '')}.py <span className="result-tag">RESURRECTED</span></div><pre className="python-output" tabIndex={0} aria-label="Converted Python code">{output.split('\n').map((line, i) => <div key={i}><span className="output-line-number" aria-hidden="true">{i + 1}</span><code>{line || ' '}</code></div>)}</pre></> : <div className={`empty-output ${busy ? 'working' : ''}`} role="status"><div className="ghost"><svg viewBox="0 0 90 96" fill="none" aria-hidden="true"><path d="M19 78V43a26 26 0 0 1 52 0v35l-9-6-9 7-9-7-8 7-9-7-8 6Z" fill="#ece6f2" stroke="#c8b9d8" strokeWidth="1.5" /><ellipse cx="35" cy="43" rx="3" ry="5" fill="#9a85ad" /><ellipse cx="55" cy="43" rx="3" ry="5" fill="#9a85ad" /><path d="M40 57q5 4 10-1" stroke="#9a85ad" strokeWidth="1.5" strokeLinecap="round" /><path d="m7 25 2 5 5 2-5 2-2 5-2-5-5-2 5-2Zm73 28 1 4 4 1-4 1-1 4-1-4-4-1 4-1Z" fill="#c8b9d8" /></svg></div><h4>{busy ? 'Summoning your Python…' : 'Awaiting a little magic'}</h4><p>{busy ? 'Your local model is breathing new life into old code.' : <>Your modern Python will appear here.<br />No spirits summoned. Just better syntax.</>}</p><span className="empty-caption">{busy ? 'Larger programs can take a few minutes.' : 'OUT WITH THE GOTO. IN WITH THE NEW.'}</span></div>}
            <div className="editor-footer"><span className="output-state"><span className={output ? 'status-dot green' : 'status-dot'} />{busy ? 'Resurrection in progress' : output ? 'Ready for review' : 'Waiting for resurrection'}</span><span>Python 3</span></div></section>
        </div>
        <div className="conversion-toolbar"><div className="options"><span>Spell ingredients</span><label><input type="checkbox" checked={comments} disabled={busy} onChange={e => setComments(e.target.checked)} /> Explain changes <span className="info" title="Adds comments explaining important changes and assumptions">i</span></label><label><input type="checkbox" checked={numpy} disabled={busy} onChange={e => setNumpy(e.target.checked)} /> Allow NumPy</label></div>{busy ? <button className="resurrect cancel" onClick={() => controller.current?.abort()}><Icon name="close" size={17} /> Cancel resurrection</button> : <button className="resurrect" disabled={!source.trim()} onClick={() => void resurrect()}><Icon name="spark" size={18} /> Resurrect as Python <Icon name="arrow" size={17} /></button>}</div>
      </section>
      {error && <div className="message error" role="alert"><span>{error}</span><button className="text-button" onClick={openSettings}>Check settings <Icon name="arrow" size={14} /></button></div>}{notice && <div className="message" role="status">{notice}</div>}
      <div className="connection-strip"><div><span className={`status-dot ${connection === 'Connected' ? 'green' : ''}`} /><span>{connection}</span><span className="strip-divider" /><span className="connection-detail">{settings.model || 'Your local LLM, your rules.'}</span><button onClick={openSettings}>{settings.model ? 'Configure server' : 'Connect a local model'} <Icon name="arrow" size={13} /></button></div><span className="compatible">Ollama, LM Studio, llama.cpp & friends</span></div>
      <section className="benefits" aria-label="Privacy and conversion features"><div><span className="benefit-icon"><Icon name="shield" size={20} /></span><div><h3>Your code stays yours.</h3><p>Direct to your configured LLM.<br />No middleman. No tracking. No tricks.</p></div></div><div><span className="benefit-icon"><Icon name="code" size={20} /></span><div><h3>Old logic. Modern language.</h3><p>From dusty DO loops to clean Python.<br />Keep the intent. Lose the cobwebs.</p></div></div><div><span className="benefit-icon"><Icon name="spark" size={20} /></span><div><h3>A little magic. All local.</h3><p>Powered by your model, on your machine.<br />OpenAI-compatible. Cloud optional.</p></div></div></section>
      <div className="review-note"><Icon name="book" size={14} /><span>Even resurrected code needs a checkup. Review and test generated Python before using it.</span></div>
    </main>
    <footer><span className="footer-brand"><Pumpkin /> Built for code with unfinished business.</span><span>Less legacy. More life. <span className="footer-star">✦</span></span><span>EST. 2026 <span className="footer-divider">/</span> RUNS ON YOUR MACHINE</span></footer>
    <dialog ref={dialog} aria-labelledby="modal-title" onCancel={() => setModal(null)} onClick={e => { if (e.target === dialog.current) setModal(null) }}><div className="modal-content"><div className="modal-heading"><span className="modal-icon"><Icon name={modal === 'settings' ? 'settings' : 'book'} size={21} /></span><button className="icon-button" aria-label="Close modal" onClick={() => setModal(null)}><Icon name="close" /></button></div>{modal === 'settings' ? <form onSubmit={saveSettings}><div className="eyebrow">THE POWER BEHIND THE MAGIC</div><h2 id="modal-title">Connect your local model.</h2><p className="modal-description">Point the lab at an OpenAI-compatible server. Your code travels directly from this browser to that address.</p><div className="presets">{[{ name: 'Ollama', port: '11434' }, { name: 'LM Studio', port: '1234' }, { name: 'llama.cpp', port: '8080' }].map(p => <button type="button" key={p.name} disabled={testing} onClick={() => updateDraft({ ...defaults, port: p.port })}>{p.name}</button>)}</div><fieldset disabled={testing}><div className="form-grid"><label className="host-field">IP address / hostname<input required autoFocus value={draft.host} onChange={e => updateDraft({ host: e.target.value })} placeholder="127.0.0.1" /></label><label>Port<input inputMode="numeric" value={draft.port} onChange={e => updateDraft({ port: e.target.value })} placeholder="11434" /></label><label>Protocol<select value={draft.protocol} onChange={e => updateDraft({ protocol: e.target.value as 'http' | 'https' })}><option value="http">HTTP</option><option value="https">HTTPS</option></select></label><label className="path-field">API base path<input value={draft.basePath} onChange={e => updateDraft({ basePath: e.target.value })} placeholder="/v1" /></label></div><label className="full-field">API key <span>Optional · kept in memory for this tab only</span><input type="password" autoComplete="off" value={apiKey} onChange={e => { setApiKey(e.target.value); setTestMessage('') }} placeholder="Only if your server requires one" /></label></fieldset><button type="button" className="test-button" disabled={testing} onClick={() => void testConnection()}><span className={`status-dot ${testing ? 'pulsing' : ''}`} />{testing ? 'Testing connection…' : 'Test connection & discover models'}<Icon name="arrow" size={15} /></button>{testMessage && <p className="test-message" role="status">{testMessage}</p>}<label className="full-field">Model name<input required disabled={testing} list="server-models" value={draft.model} onChange={e => setDraft({ ...draft, model: e.target.value })} placeholder="e.g. qwen2.5-coder:7b" /><datalist id="server-models">{models.map(m => <option key={m} value={m} />)}</datalist></label><p className="field-help">Use the exact model ID on your server, or test the connection to discover available models.</p><div className="cors-note"><Icon name="shield" size={17} /><span>Enable CORS on your LLM server for this app’s origin. Browser security may block HTTPS pages from reaching HTTP servers; run this app locally over HTTP when needed. Only server settings and your theme preference are saved on this browser; source code is never saved.</span></div><div className="modal-footer"><button type="button" className="secondary-button" onClick={() => setModal(null)}>Cancel</button><button className="resurrect" type="submit" disabled={testing}>Save settings <Icon name="check" size={17} /></button></div></form> : <><div className="eyebrow">A PRACTICAL LITTLE SPELL</div><h2 id="modal-title">Give old code a new life.</h2><div className="guide-steps"><div><span>01</span><div><h3>Wake up your local model</h3><p>Start Ollama, LM Studio, llama.cpp, or any server with OpenAI-compatible <code>/v1/models</code> and <code>/v1/chat/completions</code> endpoints. Enable CORS for this browser’s origin.</p></div></div><div><span>02</span><div><h3>Set the coordinates</h3><p>Open Settings, enter your server’s IP, port, and model ID. Test the connection to discover models. Nothing connects until you ask.</p></div></div><div><span>03</span><div><h3>Resurrect, review, repeat</h3><p>Paste or upload your FORTRAN, choose your options, and resurrect it as Python. Copy or download the result. Always review and test numerical behavior.</p></div></div></div><div className="cors-note"><Icon name="shield" /><span>No analytics, remote fonts, or app backend. Only server settings and your theme preference persist in this browser. Code and API keys remain in memory until you leave the page. Your LLM server controls its own logging.</span></div><button className="resurrect guide-done" onClick={() => setModal(null)}>Back to the laboratory <Icon name="arrow" size={17} /></button></>}</div></dialog>
  </>
}
export default App
