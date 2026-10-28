![Header image](./public/header_fortran-to-python.png)

# Reanimate Fortran — old code, new life

_This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 4: Ghost in the Machine](https://dev.to/challenges/hacktoberfest-week4-2026-10-26)_

A Halloween-themed, client-side React + TypeScript + Vite app that converts legacy FORTRAN to Python using your own OpenAI-compatible LLM server.

![App screenshot](./public/fortran%20screenshot.png)

## Run locally

Use Node.js 22.18+ or 24+.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. In **Settings**, choose a server preset or enter its hostname/IP, port, protocol, API base path, and exact model name. The default base path is `/v1`. IPv4, IPv6, and hostnames are supported. API keys are optional.

**Test connection & discover models** calls `GET /v1/models`. You can also enter the model ID manually when discovery is unavailable. Conversion calls `POST /v1/chat/completions` with your selected model and uses non-streaming responses for broad server compatibility. No server is contacted automatically on page load.

| Server preset | Address   | Port  |
| ------------- | --------- | ----- |
| Ollama        | 127.0.0.1 | 11434 |
| LM Studio     | 127.0.0.1 | 1234  |
| llama.cpp     | 127.0.0.1 | 8080  |

The model must already be installed/loaded on your server. Enable the server's OpenAI-compatible API and allow this app's exact origin in its CORS settings. Requests use JSON, so the server must allow preflight requests, the `Content-Type` header, and `Authorization` if you supply a key. Local network browser permissions may also be necessary. Use the app over local HTTP if an HTTPS deployment cannot access your HTTP model server.

## Use

Dark mode is enabled by default. Use the moon button in the header to switch between dark and light themes; your choice is saved in this browser.

Paste FORTRAN or upload/drop a text source file up to 1 MB. A Fibonacci example is included. Choose whether to add comments explaining changes and whether NumPy is allowed, then select **Resurrect as Python**. Cancel an in-flight request at any time. Copy the Python or download a `.py` file when complete.

Requests time out after five minutes; connection tests time out after ten seconds. Cancelling stops the browser request, though the server may continue generating. Truncated and empty responses are reported as errors. Generated programs are never executed by this app; review and test their behavior, especially numerical precision, indexing, and I/O.

## Privacy

- No app backend, analytics, CDN scripts, remote fonts, or third-party assets.
- Requests go directly from the browser to the address you configure. Keep it pointed at your own local server for local-only processing.
- Only server settings and the theme preference are stored in `localStorage`. Source and output code remain in memory and disappear on reload.
- API keys remain in tab memory and are never saved to browser storage.
- API requests omit cookies, suppress referrer information, and request no caching.
- Your chosen model server controls its own logs and retention.

## Checks and production build

```sh
npm test
npm run build
npm run preview
```

Tests cover endpoint validation, IPv6, payloads, privacy-related request options, model discovery, response cleanup, cancellation, empty/truncated completions, and error handling using mocked API responses. Build output is in `dist/`, which can be served with any static web server. No runtime app server is required.
