import React, { useState } from "react";
import "../css/Docs.css";

const SECTIONS = [
  { id: "intro",        label: "Introduction" },
  { id: "auth",         label: "Authentication" },
  { id: "endpoint",     label: "Chat Completion" },
  { id: "request",      label: "Request Body" },
  { id: "response",     label: "Success Response" },
  { id: "errors",       label: "Error Responses" },
  { id: "models",       label: "Supported Models" },
  { id: "ratelimits",   label: "Rate Limits" },
  { id: "pricing",      label: "Pricing" },
  { id: "examples",     label: "Code Examples" },
  { id: "dashboard",    label: "Dashboard" },
];

const CodeBlock = ({ code, language = "json" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="docs__code-block">
      <div className="docs__code-header">
        <span className="docs__code-lang">{language}</span>
        <button
          className={`docs__code-copy${copied ? " docs__code-copy--copied" : ""}`}
          onClick={handleCopy}
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <pre className="docs__code-body"><code>{code.trim()}</code></pre>
    </div>
  );
};

const Docs = () => {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="docs">
      {/* ── LEFT SIDEBAR NAV ── */}
      <aside className="docs__nav">
        <p className="docs__nav-heading">On this page</p>
        <ul className="docs__nav-list">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <button className="docs__nav-link" onClick={() => scrollTo(s.id)}>
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="docs__content">

        {/* ── 1. HERO ── */}
        <section id="intro" className="docs__section">
          <div className="docs__hero">
            <div className="docs__hero-badge">API Reference</div>
            <h1 className="docs__hero-title">OpenRouter API Documentation</h1>
            <p className="docs__hero-sub">
              Integrate multiple AI models through a single, simple API. No per-provider
              SDKs, no juggling auth tokens — one key, every model.
            </p>
            <div className="docs__hero-meta">
              <div className="docs__meta-item">
                <span className="docs__meta-label">Base URL</span>
                    <code className="docs__meta-value">https://openrouter.ai/v1</code>
              </div>
              <div className="docs__meta-item">
                <span className="docs__meta-label">Currently Supported</span>
                <span className="docs__meta-value">
                  <span className="docs__badge docs__badge--green">✅ Gemini 2.5 Flash</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. AUTH ── */}
        <section id="auth" className="docs__section">
          <h2 className="docs__h2">Authentication</h2>
          <p className="docs__p">
            Every request to the OpenRouter API must include your API key in the
            <code className="docs__inline">Authorization</code> header using the Bearer scheme.
          </p>
          <CodeBlock language="http" code={`Authorization: Bearer YOUR_API_KEY`} />

          <div className="docs__callout">
            <ul className="docs__list">
              <li>API keys are created and managed from your dashboard.</li>
              <li>Every request must include the <code className="docs__inline">Authorization</code> header.</li>
              <li>Disabled API keys return <code className="docs__inline">401 Unauthorized</code>.</li>
            </ul>
          </div>

          <p className="docs__label">Example</p>
          <CodeBlock language="http" code={`Authorization: Bearer sh-o3-xxxxxxxxxxxxxxxx`} />
        </section>

        {/* ── 3. ENDPOINT ── */}
        <section id="endpoint" className="docs__section">
          <h2 className="docs__h2">Chat Completion</h2>
          <p className="docs__p">
            Generate AI responses by sending a conversation history to the completion endpoint.
            The model processes the messages array and returns the next response in the conversation.
          </p>
          <div className="docs__endpoint">
            <span className="docs__method">POST</span>
              <code className="docs__path">/v1/chat/completions</code>
          </div>
        </section>

        {/* ── 4. REQUEST BODY ── */}
        <section id="request" className="docs__section">
          <h2 className="docs__h2">Request Body</h2>
          <CodeBlock language="json" code={`{
  "model": "gemini-2.5-flash",
  "messages": [
    {
      "role": "user",
      "content": "Explain Redis in simple terms."
    }
  ]
}`} />

          <div className="docs__table-wrap">
            <table className="docs__table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code className="docs__inline">model</code></td>
                  <td>string</td>
                  <td><span className="docs__badge docs__badge--muted">No</span></td>
                  <td>AI model slug to use. Defaults to Gemini 2.5 Flash if omitted.</td>
                </tr>
                <tr>
                  <td><code className="docs__inline">messages</code></td>
                  <td>array</td>
                  <td><span className="docs__badge docs__badge--accent">Yes</span></td>
                  <td>Array of message objects representing conversation history.</td>
                </tr>
                <tr>
                  <td><code className="docs__inline">role</code></td>
                  <td>string</td>
                  <td><span className="docs__badge docs__badge--accent">Yes</span></td>
                  <td>One of <code className="docs__inline">user</code>, <code className="docs__inline">assistant</code>, or <code className="docs__inline">system</code>.</td>
                </tr>
                <tr>
                  <td><code className="docs__inline">content</code></td>
                  <td>string</td>
                  <td><span className="docs__badge docs__badge--accent">Yes</span></td>
                  <td>The text content of the message.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 5. SUCCESS RESPONSE ── */}
        <section id="response" className="docs__section">
          <h2 className="docs__h2">Success Response</h2>
          <div className="docs__status-row">
            <span className="docs__status docs__status--green">200 OK</span>
          </div>
          <CodeBlock language="json" code={`{
  "model": "gemini-2.5-flash",
  "content": "Redis is an in-memory database used for caching, rate limiting, and messaging.",
  "usage": {
    "prompt_tokens": 18,
    "completion_tokens": 14,
    "total_tokens": 52
  }
}`} />
        </section>

        {/* ── 6. ERRORS ── */}
        <section id="errors" className="docs__section">
          <h2 className="docs__h2">Error Responses</h2>
          <p className="docs__p">
            The API uses standard HTTP status codes. All error bodies follow the same shape.
          </p>

          <div className="docs__error-grid">
            <div className="docs__error-item">
              <div className="docs__error-header">
                <span className="docs__status docs__status--red">401 Unauthorized</span>
                <span className="docs__error-title">Invalid API Key</span>
              </div>
              <CodeBlock language="json" code={`{ "message": "Invalid API key" }`} />
            </div>

            <div className="docs__error-item">
              <div className="docs__error-header">
                <span className="docs__status docs__status--yellow">400 Bad Request</span>
                <span className="docs__error-title">Insufficient Credits</span>
              </div>
              <CodeBlock language="json" code={`{ "message": "Insufficient credits" }`} />
            </div>

            <div className="docs__error-item">
              <div className="docs__error-header">
                <span className="docs__status docs__status--yellow">400 Bad Request</span>
                <span className="docs__error-title">Unsupported Model</span>
              </div>
              <CodeBlock language="json" code={`{ "message": "claude-4 is not supported yet" }`} />
            </div>

            <div className="docs__error-item">
              <div className="docs__error-header">
                <span className="docs__status docs__status--orange">429 Too Many Requests</span>
                <span className="docs__error-title">Rate Limit Exceeded</span>
              </div>
              <CodeBlock language="json" code={`{
  "message": "Rate limit exceeded",
  "retryAfter": 42
}`} />
            </div>
          </div>
        </section>

        {/* ── 7. MODELS ── */}
        <section id="models" className="docs__section">
          <h2 className="docs__h2">Supported Models</h2>
          <div className="docs__table-wrap">
            <table className="docs__table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Slug</th>
                  <th>Provider</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Gemini 2.5 Flash</td>
                  <td><code className="docs__inline">gemini-2.5-flash</code></td>
                  <td>Google</td>
                  <td><span className="docs__badge docs__badge--green">✅ Available</span></td>
                </tr>
                <tr>
                  <td>GPT-4o</td>
                  <td><code className="docs__inline">gpt-4o</code></td>
                  <td>OpenAI</td>
                  <td><span className="docs__badge docs__badge--muted">🚧 Coming Soon</span></td>
                </tr>
                <tr>
                  <td>Claude Sonnet</td>
                  <td><code className="docs__inline">claude-sonnet</code></td>
                  <td>Anthropic</td>
                  <td><span className="docs__badge docs__badge--muted">🚧 Coming Soon</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 8. RATE LIMITS ── */}
        <section id="ratelimits" className="docs__section">
          <h2 className="docs__h2">Rate Limits</h2>
          <p className="docs__p">
            Rate limiting is enforced per API key using Redis. Limits reset on a rolling
            60-second window.
          </p>
          <div className="docs__callout docs__callout--accent">
            <strong>100 requests per minute</strong> per API key.
          </div>
          <p className="docs__p">When the limit is exceeded, the API returns:</p>
          <div className="docs__table-wrap">
            <table className="docs__table">
              <thead>
                <tr><th>Field</th><th>Value</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>HTTP Status</td>
                  <td><span className="docs__status docs__status--orange">429 Too Many Requests</span></td>
                </tr>
                <tr>
                  <td><code className="docs__inline">retryAfter</code></td>
                  <td>Seconds remaining until the window resets</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 9. PRICING ── */}
        <section id="pricing" className="docs__section">
          <h2 className="docs__h2">Pricing</h2>
          <p className="docs__p">
            Credits are deducted automatically after each successful completion based on
            token usage. There are no flat fees — you only pay for what you use.
          </p>
          <div className="docs__table-wrap">
            <table className="docs__table">
              <thead>
                <tr><th>Operation</th><th>Charged</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>Input Tokens</td>
                  <td>Based on selected model pricing</td>
                </tr>
                <tr>
                  <td>Output Tokens</td>
                  <td>Based on selected model pricing</td>
                </tr>
                <tr>
                  <td>Credits</td>
                  <td>Automatically deducted after successful completion</td>
                </tr>
                <tr>
                  <td>Failed Requests</td>
                  <td>Not charged</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 10. CODE EXAMPLES ── */}
        <section id="examples" className="docs__section">
          <h2 className="docs__h2">Code Examples</h2>

          <h3 className="docs__h3">JavaScript (Axios)</h3>
          <CodeBlock language="javascript" code={`import axios from "axios";

const response = await axios.post(
    "https://openrouter.ai/v1/chat/completions",
  {
    model: "gemini-2.5-flash",
    messages: [
      {
        role: "user",
        content: "Hello"
      }
    ]
  },
  {
    headers: {
      Authorization: "Bearer YOUR_API_KEY"
    }
  }
);

console.log(response.data);`} />

          <h3 className="docs__h3">cURL</h3>
              <CodeBlock language="bash" code={`curl -X POST https://openrouter.ai/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gemini-2.5-flash",
    "messages": [
      {
        "role": "user",
        "content": "Hello"
      }
    ]
  }'`} />
        </section>

        {/* ── 11. DASHBOARD CTA ── */}
        <section id="dashboard" className="docs__section">
          <div className="docs__cta-card">
            <div className="docs__cta-glow" />
            <div className="docs__cta-content">
              <span className="docs__cta-icon">🔑</span>
              <h3 className="docs__cta-title">Need an API Key?</h3>
              <p className="docs__cta-sub">
                Create and manage your API keys, monitor usage, and top up credits
                from your dashboard.
              </p>
              <a href="/apikey" className="docs__cta-btn">
                Go to Dashboard →
              </a>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Docs;