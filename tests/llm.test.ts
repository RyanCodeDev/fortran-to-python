import { test, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { apiRequest, cleanPython, convertCode, defaults, serverUrl } from '../src/lib/llm.ts'

const originalFetch = globalThis.fetch
afterEach(() => { globalThis.fetch = originalFetch })

test('builds compatible URLs for IPv4, IPv6, hostnames and custom paths', () => {
  assert.equal(serverUrl(defaults), 'http://127.0.0.1:11434/v1')
  assert.equal(serverUrl({ ...defaults, host: '::1', port: '1234' }), 'http://[::1]:1234/v1')
  assert.equal(serverUrl({ ...defaults, host: '[::1]' }), 'http://[::1]:11434/v1')
  assert.equal(serverUrl({ ...defaults, host: 'localhost', protocol: 'https', port: '', basePath: '/api/v1/' }), 'https://localhost/api/v1')
  assert.equal(serverUrl({ ...defaults, basePath: '' }), 'http://127.0.0.1:11434')
})

test('rejects malformed addresses, ports, and paths', () => {
  for (const host of ['', 'http://localhost', 'localhost/path', 'user@host', 'a b']) assert.throws(() => serverUrl({ ...defaults, host }))
  for (const port of ['0', '65536', '-1', '12abc', '1.5']) assert.throws(() => serverUrl({ ...defaults, port }))
  assert.throws(() => serverUrl({ ...defaults, basePath: '/v1?token=x' }))
})

test('conversion sends code only to configured endpoint, with privacy options and requested ingredients', async () => {
  const settings = { ...defaults, host: '192.168.1.4', model: 'local-coder' }
  globalThis.fetch = async (url, init) => {
    assert.equal(url, 'http://192.168.1.4:11434/v1/chat/completions')
    assert.equal(init?.method, 'POST')
    assert.equal(init?.credentials, 'omit')
    assert.equal(init?.cache, 'no-store')
    assert.equal(init?.referrerPolicy, 'no-referrer')
    assert.equal((init?.headers as Record<string, string>).Authorization, 'Bearer session-secret')
    const body = JSON.parse(init?.body as string)
    assert.equal(body.model, 'local-coder')
    assert.equal(body.stream, false)
    assert.match(body.messages[0].content, /only the Python standard library/)
    assert.match(body.messages[0].content, /comments explaining/)
    assert.match(body.messages[1].content, /PROGRAM TEST/)
    return Response.json({ choices: [{ message: { content: '```python\nprint("alive")\n```' }, finish_reason: 'stop' }] })
  }
  assert.equal(await convertCode(settings, 'session-secret', 'PROGRAM TEST', true, false, new AbortController().signal), 'print("alive")')
})

test('omits authorization without a key and supports model discovery', async () => {
  globalThis.fetch = async (url, init) => {
    assert.equal(url, 'http://127.0.0.1:11434/v1/models')
    assert.equal((init?.headers as Record<string, string>).Authorization, undefined)
    return Response.json({ data: [{ id: 'coder' }] })
  }
  assert.deepEqual(await (await apiRequest(defaults, '', '/models')).json(), { data: [{ id: 'coder' }] })
})

test('surfaces server errors and connection guidance', async () => {
  globalThis.fetch = async () => Response.json({ error: { message: 'Model not loaded' } }, { status: 404 })
  await assert.rejects(apiRequest(defaults, '', '/models'), /404: Model not loaded/)
  globalThis.fetch = async () => { throw new TypeError('Failed to fetch') }
  await assert.rejects(apiRequest(defaults, '', '/models'), /CORS/)
})

test('preserves aborts so cancellation works', async () => {
  globalThis.fetch = async () => { throw new DOMException('Aborted', 'AbortError') }
  await assert.rejects(apiRequest(defaults, '', '/models'), { name: 'AbortError' })
})

test('rejects empty and truncated completions', async () => {
  globalThis.fetch = async () => Response.json({ choices: [{ message: { content: '' } }] })
  await assert.rejects(convertCode(defaults, '', 'END', true, false, new AbortController().signal), /no Python code/)
  globalThis.fetch = async () => Response.json({ choices: [{ message: { content: 'partial' }, finish_reason: 'length' }] })
  await assert.rejects(convertCode(defaults, '', 'END', true, false, new AbortController().signal), /output limit/)
})

test('removes Markdown wrappers while preserving Python indentation', () => {
  assert.equal(cleanPython('```python\ndef f():\n    return 1\n```'), 'def f():\n    return 1')
  assert.equal(cleanPython('print(1)'), 'print(1)')
})
