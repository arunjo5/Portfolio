import React from 'react';
import DotField from './DotField.jsx';

const CONFIG = {
  accent: 'sage',
  nameFont: 'mono',
  cursorStyle: 'default',
  dotEffect: 'synapse',
  dotColor: '#335f9a',
  dotDensity: 22,
  rippleIntensity: 1,
  projectLayout: 'grid',
};

// Hero enhancements: 1 entrance · 2 idle firings · 16 scroll handoff · 32 micro-polish
const HERO_FX = 1 | 2 | 16 | 32;

const EXPERIENCES = [
{
  role: 'Software Engineer',
  company: 'Handshake',
  location: 'Remote',
  dates: 'April 2026 — Present',
  bullets: [
  'Built agentic coding eval pipelines with reference solutions and reproducible environments around real open-source issues.']
},
{
  role: 'Software Engineer Intern',
  company: 'Florida Blue',
  location: 'Jacksonville, FL',
  dates: 'Summer 2026',
  bullets: [
  'Improved the security and reliability of production payment microservices through vulnerability fixes, migration tests, and memory diagnostics.']
},
{
  role: 'Data Science Intern',
  company: 'V2X',
  location: 'West Lafayette, IN',
  dates: 'Jan 2026 — May 2026',
  bullets: [
  'Deployed a high-throughput computer vision pipeline for license plate recognition in live traffic environments.']
},
{
  role: 'Software Developer',
  company: 'Purdue Space Program',
  location: 'West Lafayette, IN',
  dates: 'Dec 2024 — Dec 2025',
  bullets: [
  'Developed real-time, fault-tolerant flight software for autonomous spacecraft guidance, navigation, and control systems.']
},
{
  role: 'Software Engineer Intern',
  company: 'Perceptify',
  location: 'Boulder, CO',
  dates: 'Summer 2024',
  bullets: [
  'Enhanced backend analytics infrastructure and improved NLP sentiment analysis for a React-based engagement dashboard.']
}];

const PROJECTS = [
{
  name: 'PokerLab',
  tag: 'Full-stack',
  blurb: "Poker analytics platform for equity calculation, pot-odds analysis, and hand-history replay. Optimized the naive simulation runtime by 10x by using worker threads and batched Monte Carlo, running up to 1M simulations per hand. Enforced rate limiting with Redis so per-user limits hold across stateless serverless instances.",
  stack: ['Node.js', 'PostgreSQL', 'Redis'],
  href: 'https://pokerlab.dev/'
},
{
  name: 'LedgerCore',
  tag: 'Backend systems',
  blurb: 'Double-entry payment ledger that derives balances from an immutable record of every transaction, with overdraft protection so accounts can\'t go negative. Writes are idempotent, so retries and concurrent requests never create duplicates. Correctness is verified with property-based tests over random transaction sequences.',
  stack: ['Go', 'PostgreSQL', 'Docker'],
  href: 'https://ledgercore.dev/'
},
{
  name: 'DialGPT',
  tag: 'AI',
  blurb: 'Phone-based voice assistant that connects a Twilio number to a GPT voice model for live spoken conversations. Streams audio in both directions in real time and handles interruptions. Each call runs as an explicit state machine, so the whole call shuts down cleanly if either connection drops.',
  stack: ['Twilio', 'OpenAI', 'WebSockets'],
  href: 'https://github.com/arunjo5/DialGPT'
},
{
  name: 'Retail Assistant',
  tag: 'Embedded systems',
  blurb: 'Raspberry Pi based voice assistant that processes natural language queries and delivers inventory/store information for 200+ daily customers and staff in a local retail store. Used Datadog dashboards to track retries and error rates, achieving 99% uptime across daily use.',
  stack: ['Raspberry Pi', 'LangChain', 'Datadog'],
  href: '#'
}];

function SectionLabel({ children, num }) {
  return (
    <div className="section-label">
      <span className="section-num">{num}</span>
      <span className="section-rule" />
      <span className="section-name">{children}</span>
    </div>);

}

function useReveal() {
  const ref = React.useRef(null);
  const [shown, setShown] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {if (e.isIntersecting) setShown(true);});
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, shown];
}

function Reveal({ children, delay = 0, as: As = 'div', className = '', ...rest }) {
  const [ref, shown] = useReveal();
  return (
    <As ref={ref}
    className={`reveal ${shown ? 'in' : ''} ${className}`}
    style={{ transitionDelay: `${delay}ms` }}
    {...rest}>
      {children}
    </As>);

}

function Hero({ dark }) {
  const ref = React.useRef(null);
  const [offscreen, setOffscreen] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([e]) => {
      if (!e.target.isConnected) return;
      setOffscreen(!e.isIntersecting);
    }, { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let raf = 0;
    const tick = () => {
      raf = 0;
      const h = el.offsetHeight || 1;
      const p = Math.min(1, Math.max(0, window.scrollY / h));
      el.style.setProperty('--sy', p.toFixed(4));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={ref} className="hero enter handoff micro" id="top">
      <DotField density={CONFIG.dotDensity} intensity={CONFIG.rippleIntensity} dark={dark}
      effect={CONFIG.dotEffect} color={CONFIG.dotColor} fx={HERO_FX} paused={offscreen} />
      <div className="hero-inner">
        <h1 className="hero-title">
          <span>Arun</span>
        </h1>
        <p className="hero-tagline">CS @ Purdue · Junior · Distributed systems, backend services, and the occasional trading bot.

        </p>
        <div className="hero-meta">
          <span>West Lafayette, IN</span>
          <span className="meta-dot" />
          <span>B.S. Computer Science, 2027</span>
          <span className="meta-dot" />
          <a href="#contact">Get in touch <span className="drift">↓</span></a>
        </div>
      </div>
    </section>);

}

function Experience() {
  return (
    <section className="section" id="experience">
      <SectionLabel num="01">Experience</SectionLabel>
      <div className="exp-list">
        {EXPERIENCES.map((e, i) =>
        <Reveal key={i} delay={i * 60} className="exp-row">
            <div className="exp-dates">{e.dates}</div>
            <div className="exp-body">
              <div className="exp-head">
                <h3>
                  <span className="exp-role">{e.role}</span>
                  <span className="exp-sep"> · </span>
                  <span className="exp-co">{e.company}</span>
                </h3>
                {e.location && <div className="exp-loc">{e.location}</div>}
              </div>
              {e.bullets.length > 0 &&
            <ul className="exp-bullets">
                  {e.bullets.map((b, j) => <li key={j}>{b}</li>)}
                </ul>
            }
            </div>
          </Reveal>
        )}
      </div>
    </section>);

}

function Projects({ layout = 'list' }) {
  const isRows = layout === 'list' || layout === 'index';
  return (
    <section className="section" id="projects">
      <SectionLabel num="02">Selected Projects</SectionLabel>
      {isRows ? (
        <div className={`proj-rows ${layout === 'index' ? 'big-index' : ''}`}>
          {PROJECTS.map((p, i) => {
            const linkable = p.href && p.href !== '#';
            const rowProps = linkable ?
              { as: 'a', href: p.href, target: '_blank', rel: 'noreferrer',
                'aria-label': `View ${p.name}` } :
              {};
            return (
            <Reveal key={i} delay={i * 60}
              className={`proj-row ${linkable ? 'is-linked' : ''}`}
              {...rowProps}>
              <div className="proj-row-index">{String(i + 1).padStart(2, '0')}</div>
              <div className="proj-row-main">
                <div className="proj-row-head">
                  <span className="proj-row-name">{p.name}</span>
                  {linkable &&
                  <span className="proj-arrow" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
                    stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="2" y1="22" x2="17" y2="7" />
                      <polyline points="9 7 17 7 17 15" />
                    </svg>
                  </span>
                  }
                </div>
                <div className="proj-row-blurb">{p.blurb}</div>
              </div>
              <div className="proj-row-side">
                <div className="proj-tag">{p.tag}</div>
                <div className="proj-stack">
                  {p.stack.map((s, j) => <span key={j}>{s}</span>)}
                </div>
              </div>
            </Reveal>);
          })}
        </div>
      ) : (
        <div className="proj-grid cols-2">
          {PROJECTS.map((p, i) => {
            const linkable = p.href && p.href !== '#';
            const cardProps = linkable ?
              { as: 'a', href: p.href, target: '_blank', rel: 'noreferrer',
                'aria-label': `View ${p.name}` } :
              {};
            return (
            <Reveal key={i} delay={i % 2 * 80}
              className={`proj-card ${linkable ? 'is-linked' : ''}`}
              {...cardProps}>
              <div className="proj-card-top">
                <div className="proj-tag">{p.tag}</div>
                {linkable &&
                <span className="proj-arrow" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
                  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="2" y1="22" x2="17" y2="7" />
                    <polyline points="9 7 17 7 17 15" />
                  </svg>
                </span>
                }
              </div>
              <div className="proj-name">{p.name}</div>
              <div className="proj-blurb">{p.blurb}</div>
              <div className="proj-stack">
                {p.stack.map((s, j) => <span key={j}>{s}</span>)}
              </div>
            </Reveal>);
          })}
        </div>
      )}
    </section>);

}

function Contact() {
  const [copied, setCopied] = React.useState(false);
  const email = 'arunjo528@gmail.com';
  const copy = (e) => {
    e.preventDefault();
    navigator.clipboard?.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <section className="section contact" id="contact">
      <SectionLabel num="03">Contact</SectionLabel>
      <Reveal className="contact-inner">
        <h2 className="contact-title">
          Lets <em className="serif">talk</em>.
        </h2>
        <p className="contact-sub">I always read my emails.

        </p>
        <div className="contact-grid">
          <a className="contact-card" href={`mailto:${email}`} onClick={copy}>
            <div className="contact-label">Email</div>
            <div className="contact-value" style={{ fontSize: "15px" }}>{email}</div>
            <div className="contact-action">{copied ? 'Copied ✓' : 'Click to copy'}</div>
          </a>
          <a className="contact-card" href="https://github.com/arunjo5" target="_blank" rel="noreferrer">
            <div className="contact-label">GitHub</div>
            <div className="contact-value">github.com/arunjo5</div>
            <div className="contact-action">Open ↗</div>
          </a>
          <a className="contact-card" href="https://www.linkedin.com/in/arun-jonnavithula/" target="_blank" rel="noreferrer">
            <div className="contact-label">LinkedIn</div>
            <div className="contact-value">in/arun-jonnavithula</div>
            <div className="contact-action">Open ↗</div>
          </a>
        </div>
      </Reveal>
      <footer className="footer">
        <div>© 2026 Arun Jonnavithula</div>
      </footer>
    </section>);

}

function App() {
  const [dark, setDark] = React.useState(() => {
    try {
      const v = localStorage.getItem('portfolio-theme');
      if (v === 'light') return false;
      if (v === 'dark') return true;
    } catch (e) {/* ignore */}
    return true;
  });

  React.useEffect(() => {
    const r = document.documentElement;
    r.dataset.theme = dark ? 'dark' : 'light';
    r.dataset.accent = CONFIG.accent;
    r.dataset.nameFont = CONFIG.nameFont;
    r.dataset.cursor = CONFIG.cursorStyle;
    try { localStorage.setItem('portfolio-theme', dark ? 'dark' : 'light'); } catch (e) {/* ignore */}
  }, [dark]);

  return (
    <>
      <Nav dark={dark} onToggleDark={() => setDark((d) => !d)} />
      <main>
        <Hero dark={dark} />
        <Experience />
        <Projects layout={CONFIG.projectLayout} />
        <Contact />
      </main>
    </>);

}

function Nav({ dark, onToggleDark }) {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-spacer" />
      <div className="nav-links">
        <a href="#experience">Experience</a>
        <a href="#projects">Projects</a>
        <a href="#contact">Contact</a>
        <button className="theme-toggle" onClick={onToggleDark}
        aria-label="Toggle dark mode" title="Toggle dark mode">
          {dark ?
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
          stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
            </svg> :

          <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
          stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
            </svg>
          }
        </button>
      </div>
    </nav>);

}

export default App;
