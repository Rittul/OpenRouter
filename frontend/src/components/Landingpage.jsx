import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import "../css/Landingpage.css";
import Auth from './Auth'

const MODELS = [
  { name: 'Claude Sonnet 4.6',  provider: 'Anthropic', ctx: '200K', input: '$3.00',  output: '$15.00', color: '#d4915a' },
  { name: 'GPT-4o',             provider: 'OpenAI',    ctx: '128K', input: '$5.00',  output: '$15.00', color: '#74b9e8' },
  { name: 'Gemini 1.5 Pro',     provider: 'Google',    ctx: '1M',   input: '$3.50',  output: '$10.50', color: '#81c784' },
  { name: 'Llama 3.1 405B',     provider: 'Meta',      ctx: '128K', input: '$2.00',  output: '$2.00',  color: '#b39ddb' },
  { name: 'Mistral Large 2',    provider: 'Mistral',   ctx: '128K', input: '$2.00',  output: '$6.00',  color: '#f48fb1' },
  { name: 'DeepSeek R1',        provider: 'DeepSeek',  ctx: '64K',  input: '$0.55',  output: '$2.19',  color: '#80cbc4' },
  { name: 'Grok 2',             provider: 'xAI',       ctx: '128K', input: '$2.00',  output: '$10.00', color: '#ffe082' },
  { name: 'Command R+',         provider: 'Cohere',    ctx: '128K', input: '$2.50',  output: '$10.00', color: '#ef9a9a' },
]

const STATS = [
  { value: '300+',  label: 'Models available' },
  { value: '50+',   label: 'AI providers' },
  { value: '1M+',   label: 'Developers' },
  { value: '99.9%', label: 'Uptime SLA' },
]

const FEATURES = [
  {
    title: 'Unified API',
    desc: 'One standardized interface across every provider. Switch models with a single parameter change — no SDK rewrites, no auth headaches.',
  },
  {
    title: 'Smart Fallbacks',
    desc: 'Configure automatic failover across providers. If one goes down, requests route seamlessly to your next preferred model.',
  },
  {
    title: 'Cost Optimization',
    desc: 'Real-time pricing across every model. Route by cost, latency, or capability — or let our optimizer decide for you.',
  },
  {
    title: 'Usage Analytics',
    desc: 'Granular token usage, spend tracking, and latency metrics per model and per endpoint. Export or query via API.',
  },
  {
    title: 'Team Management',
    desc: 'Shared API keys, per-team budget limits, and audit logs. Built for orgs that need control without friction.',
  },
  {
    title: 'OpenAI Compatible',
    desc: 'Drop-in replacement for the OpenAI SDK. Change one line — your existing code works with every model we support.',
  },
]

const NAV_LINKS = ['Models', 'Docs', 'Pricing', 'Rankings', 'Changelog']

const Landingpage = ({ showAuthModal = false }) => {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [showAuth, setShowAuth] = useState(showAuthModal)

  const openAuth = (e) => {
    e?.preventDefault()
    setShowAuth(true)
    navigate('/Auth', { replace: true })
  }

  const closeAuth = () => {
    setShowAuth(false)
    navigate('/', { replace: true })
  }

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <>
      {/* ── NAV ── */}
      <nav className={`nav${scrolled ? ' nav--scrolled' : ''}`}>
        <div className="nav__wrap">
          <a href="#" className="nav__brand">
            <span className="nav__brand-icon">◈</span>
            <span className="nav__brand-name">OpenRouter</span>
          </a>
          <ul className="nav__links">
            {NAV_LINKS.map(l => (
              <li key={l}><a href="#" className="nav__link">{l}</a></li>
            ))}
          </ul>
          <div className="nav__right">
            <a href="#" className="nav__signin" onClick={openAuth}>Sign in</a>
            <a href="#" className="btn btn--primary" onClick={openAuth}>Get started</a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero__glow" />
        <div className="hero__wrap">
          <div className="hero__label">One API. Every model.</div>
          <h1 className="hero__heading">
            The open gateway<br />to frontier AI
          </h1>
          <p className="hero__body">
            OpenRouter gives you a single, unified API to access 300+ language models
            from Anthropic, OpenAI, Google, Meta, and more — with automatic fallbacks,
            real-time pricing, and zero lock-in.
          </p>
          <div className="hero__actions">
            <a href="#" className="btn btn--primary btn--lg" onClick={openAuth}>Start for free</a>
            <a href="#" className="btn btn--outline btn--lg">Browse models</a>
          </div>
          <div className="hero__code">
            <div className="hero__code-bar">
              <span className="hero__code-title">Quick start</span>
              <span className="hero__code-copy">Copy</span>
            </div>
            <pre className="hero__code-body">{`const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${process.env.OPENROUTER_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'anthropic/claude-sonnet-4-6',
    messages: [{ role: 'user', content: 'Hello!' }],
  }),
})`}</pre>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="stats">
        {STATS.map(s => (
          <div className="stats__cell" key={s.label}>
            <span className="stats__val">{s.value}</span>
            <span className="stats__lbl">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── MODELS TABLE ── */}
      <section className="models">
        <div className="section__wrap">
          <div className="section__header">
            <div>
              <p className="section__eyebrow">Model Marketplace</p>
              <h2 className="section__title">Every frontier model, one key</h2>
              <p className="section__sub">Compare context windows and pricing across providers. Switch with a single parameter.</p>
            </div>
            <a href="#" className="btn btn--outline">View all models</a>
          </div>

          <div className="mtable">
            <div className="mtable__head">
              <span>Model</span>
              <span>Provider</span>
              <span>Context</span>
              <span>Input / 1M</span>
              <span>Output / 1M</span>
              <span></span>
            </div>
            {MODELS.map(m => (
              <div className="mtable__row" key={m.name}>
                <span className="mtable__name">
                  <span className="mtable__dot" style={{ background: m.color }} />
                  {m.name}
                </span>
                <span className="mtable__provider">{m.provider}</span>
                <span className="mtable__ctx">{m.ctx}</span>
                <span className="mtable__price">${m.input}</span>
                <span className="mtable__price">${m.output}</span>
                <span className="mtable__action"><a href="#" className="mtable__link">Use →</a></span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features">
        <div className="section__wrap">
          <p className="section__eyebrow">Platform</p>
          <h2 className="section__title">Everything you need.<br />Nothing you don't.</h2>
          <div className="features__grid">
            {FEATURES.map((f, i) => (
              <div className="feat" key={f.title} style={{ animationDelay: `${i * 0.07}s` }}>
                <div className="feat__num">0{i + 1}</div>
                <h3 className="feat__title">{f.title}</h3>
                <p className="feat__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTEGRATION ── */}
      <section className="compat">
        <div className="section__wrap compat__inner">
          <div className="compat__text">
            <p className="section__eyebrow">Compatibility</p>
            <h2 className="section__title">Works with your existing stack</h2>
            <p className="section__sub">
              OpenRouter is a drop-in replacement for the OpenAI API. Change one URL, one key —
              your existing code immediately gains access to every model we support.
            </p>
            <div className="compat__tags">
              {['OpenAI SDK', 'LangChain', 'LlamaIndex', 'Vercel AI', 'Python', 'Node.js', 'REST'].map(t => (
                <span className="compat__tag" key={t}>{t}</span>
              ))}
            </div>
          </div>
          <div className="compat__card">
            <div className="compat__card-label">Replace this</div>
            <pre className="compat__code compat__code--before">{`baseURL: 'https://api.openai.com/v1'`}</pre>
            <div className="compat__arrow">↓</div>
            <div className="compat__card-label">With this</div>
            <pre className="compat__code compat__code--after">{`baseURL: 'https://openrouter.ai/api/v1'`}</pre>
            <p className="compat__note">That's it. Every model, instantly.</p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta">
        <div className="cta__glow" />
        <div className="cta__wrap">
          <h2 className="cta__title">Start building today</h2>
          <p className="cta__sub">
            Free tier included. No credit card required.<br />
            Upgrade as your usage grows.
          </p>
          <div className="cta__actions">
            <a href="#" className="btn btn--primary btn--lg" onClick={openAuth}>Create free account</a>
            <a href="#" className="btn btn--outline btn--lg">Read the docs</a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer__wrap">
          <div className="footer__brand">
            <a href="#" className="nav__brand">
              <span className="nav__brand-icon">◈</span>
              <span className="nav__brand-name">OpenRouter</span>
            </a>
            <p className="footer__tagline">The open gateway to frontier AI.</p>
          </div>
          <div className="footer__cols">
            {[
              { heading: 'Product',    items: ['Models', 'Pricing', 'Playground', 'Status', 'Changelog'] },
              { heading: 'Developers', items: ['Documentation', 'API Reference', 'SDKs', 'Examples', 'Discord'] },
              { heading: 'Company',    items: ['About', 'Blog', 'Careers', 'Privacy', 'Terms'] },
            ].map(col => (
              <div className="footer__col" key={col.heading}>
                <p className="footer__heading">{col.heading}</p>
                {col.items.map(item => (
                  <a key={item} href="#" className="footer__link">{item}</a>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="footer__bar">
          <span>© 2026 OpenRouter. All rights reserved.</span>
          <span>Made for developers.</span>
        </div>
      </footer>

      {showAuth && <Auth onClose={closeAuth} />}
    </>
  )
}

export default Landingpage