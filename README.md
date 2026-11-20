# Think First

An AI writing partner that helps students think, not write for them. Research prototype for a GSLS 2026 technical report.

1. **Your opinion**: the student writes a one-sentence position before the AI argues.
2. **Get challenged**: the AI asks questions and raises the other side.
3. **Write**: only the student types; the AI comments on highlighted sentences but cannot rewrite them.

Every AI reply passes a code check (`guardCheck` in `index.html`) that hides essay-like text, independent of the model's instructions.

## Files
- `index.html`: the whole website (no build step).
- `worker.js` + `wrangler.toml`: a Cloudflare Worker that forwards requests to Gemini, so users need no API key.
- `guard_test.mjs`: unit tests for the code check (`node guard_test.mjs`). The test cases are synthetic.

## AI
Uses Chrome's built-in AI (Gemini Nano) when available, otherwise the Worker.
