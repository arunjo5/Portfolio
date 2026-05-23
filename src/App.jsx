import React from 'react';
import DotField from './DotField.jsx';
import {
  useTweaks, TweaksPanel, TweakSection,
  TweakSlider, TweakToggle, TweakRadio, TweakSelect, TweakColor,
} from './TweaksPanel.jsx';

const TWEAK_DEFAULTS = {
  "dark": true,
  "dotDensity": 22,
  "rippleIntensity": 1,
  "accent": "sage",
  "dotEffect": "synapse",
  "dotColor": "#335f9a",
  "nameFont": "mono",
  "cursorStyle": "default"
} ;

const EXPERIENCES = [
{
  role: 'Software Engineering Intern',
  company: 'Florida Blue',
  location: 'Jacksonville, FL',
  dates: 'Summer 2026',
  bullets: [
  'Optimized production Go microservices powering high-volume payment processing.']
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
  role: 'Software Engineering Intern',
  company: 'Perceptify',
  location: 'Boulder, CO',
  dates: 'Summer 2024',
  bullets: [
  'Enhanced backend analytics infrastructure and improved NLP sentiment analysis for a React-based engagement dashboard.']
}];

const PROJECTS = [
{
  name: 'Poker Analytics Engine',
  tag: 'Backend systems',
  blurb: "Computes win probabilities and hand equities for 2–9 player scenarios in Texas Hold'em via Monte Carlo simulation. 35% faster than the baseline.",
  stack: ['Node.js', 'PostgreSQL', 'AWS'],
  href: 'https://holdemanalytics.vercel.app/'
},
{
  name: 'Voice Retail Assistant',
  tag: 'Embedded systems',
  blurb: 'Answers natural language inventory and store questions for 200+ daily customers and staff in a local retail store. Built on a Raspberry Pi.',
  stack: ['Python', 'LangChain', 'Pinecone'],
  href: '#'
},
{
  name: 'Clinical Document Pipeline',
  tag: 'Applied ML',
  blurb: 'Extracts data from scanned clinical supply PDFs for Pfizer using RAG and multi-engine OCR. 95% accuracy across 10K+ documents.',
  stack: ['Python', 'RAG', 'FAISS'],
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

function Hero({ dark, dotDensity, rippleIntensity, dotEffect, dotColor }) {
  return (
    <section className="hero" id="top">
      <DotField density={dotDensity} intensity={rippleIntensity} dark={dark} effect={dotEffect} color={dotColor} />
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
          <a href="#contact">Get in touch ↓</a>
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
                <div className="exp-loc">{e.location}</div>
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

function Projects() {
  return (
    <section className="section" id="projects">
      <SectionLabel num="02">Selected Projects</SectionLabel>
      <div className="proj-grid">
        {PROJECTS.map((p, i) => {
          const linkable = p.href && p.href !== '#';
          const cardProps = linkable ?
            { as: 'a', href: p.href, target: '_blank', rel: 'noreferrer',
              'aria-label': `View ${p.name}` } :
            {};
          return (
          <Reveal key={i} delay={i % 3 * 80}
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
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    document.documentElement.dataset.theme = t.dark ? 'dark' : 'light';
    document.documentElement.dataset.accent = t.accent;
    document.documentElement.dataset.nameFont = t.nameFont;
    document.documentElement.dataset.cursor = t.cursorStyle;
  }, [t.dark, t.accent, t.nameFont, t.cursorStyle]);

  return (
    <>
      <Nav dark={t.dark} onToggleDark={() => setTweak('dark', !t.dark)} />
      <main>
        <Hero dark={t.dark} dotDensity={t.dotDensity} rippleIntensity={t.rippleIntensity} dotEffect={t.dotEffect} dotColor={t.dotColor} />
        <Experience />
        <Projects />
        <Contact />
      </main>
      <TweaksPanel title="Tweaks">
        <TweakSection label="Name">
          <TweakSelect label="Font" value={t.nameFont}
          options={[
          { value: 'editorial', label: 'Editorial — Geist + Newsreader' },
          { value: 'sora', label: 'Sora — modern geometric' },
          { value: 'manrope', label: 'Manrope — clean humanist' },
          { value: 'dmsans', label: 'DM Sans — neutral modern' },
          { value: 'jakarta', label: 'Plus Jakarta Sans' },
          { value: 'albert', label: 'Albert Sans — sharp modern' },
          { value: 'inter-tight', label: 'Inter Tight — tight grotesque' },
          { value: 'lexend', label: 'Lexend — open + sleek' },
          { value: 'funnel', label: 'Funnel Display — modern display' },
          { value: 'syne', label: 'Syne — geometric display' },
          { value: 'commissioner', label: 'Commissioner — editorial' },
          { value: 'bricolage', label: 'Bricolage Grotesque' },
          { value: 'onest', label: 'Onest' },
          { value: 'outfit', label: 'Outfit' },
          { value: 'unbounded', label: 'Unbounded — bold display' },
          { value: 'schibsted', label: 'Schibsted Grotesk' },
          { value: 'familjen', label: 'Familjen Grotesk' },
          { value: 'serif', label: 'Instrument Serif' },
          { value: 'dm-serif', label: 'DM Serif Display — editorial' },
          { value: 'cormorant', label: 'Cormorant Garamond — elegant' },
          { value: 'bodoni', label: 'Bodoni Moda — high-contrast' },
          { value: 'crimson', label: 'Crimson Pro — book serif' },
          { value: 'source-serif', label: 'Source Serif 4 — modern warm' },
          { value: 'literata', label: 'Literata — reading serif' },
          { value: 'spectral', label: 'Spectral — distinctive' },
          { value: 'petrona', label: 'Petrona — variable warm' },
          { value: 'marcellus', label: 'Marcellus — elegant Roman' },
          { value: 'gloock', label: 'Gloock — high-contrast display' },
          { value: 'warm', label: 'Fraunces' },
          { value: 'mono', label: 'Geist Mono' },
          { value: 'jbmono', label: 'JetBrains Mono' },
          { value: 'plex-mono', label: 'IBM Plex Mono' },
          { value: 'space-mono', label: 'Space Mono — retro tech' }]
          }
          onChange={(v) => setTweak('nameFont', v)} />
        </TweakSection>
        <TweakSection label="Theme">
          <TweakToggle label="Dark mode" value={t.dark}
          onChange={(v) => setTweak('dark', v)} />
          <TweakRadio label="Accent" value={t.accent}
          options={[
          { value: 'sky', label: 'Sky' },
          { value: 'sage', label: 'Sage' },
          { value: 'rose', label: 'Rose' },
          { value: 'amber', label: 'Amber' },
          { value: 'violet', label: 'Violet' },
          { value: 'teal', label: 'Teal' }]
          }
          onChange={(v) => setTweak('accent', v)} />
        </TweakSection>
        <TweakSection label="Hero dots">
          <TweakSelect label="Cursor effect" value={t.dotEffect}
          options={[
          { value: 'ripple', label: 'Ripple — outward waves' },
          { value: 'repel', label: 'Repel — push away' },
          { value: 'attract', label: 'Attract — pull in' },
          { value: 'glow', label: 'Glow — light up nearby' },
          { value: 'trail', label: 'Trail — fading path' },
          { value: 'constellation', label: 'Constellation — lines' },
          { value: 'synapse', label: 'Synapse — heatmap + lines' },
          { value: 'spotlight', label: 'Spotlight — reveal only nearby' },
          { value: 'heatmap', label: 'Heatmap — persistent heat' },
          { value: 'elastic', label: 'Elastic — springy mesh' },
          { value: 'confetti', label: 'Confetti — click to burst' },
          { value: 'zdepth', label: 'Z-depth — parallax float' },
          { value: 'rings', label: 'Rings — sonar pulse' },
          { value: 'swarm', label: 'Swarm — comet trail' }]
          }
          onChange={(v) => setTweak('dotEffect', v)} />
          <TweakSlider label="Dot spacing" value={t.dotDensity}
          min={14} max={72} step={1} unit="px"
          onChange={(v) => setTweak('dotDensity', v)} />
          <TweakSlider label="Intensity" value={t.rippleIntensity}
          min={0.2} max={2.4} step={0.1}
          onChange={(v) => setTweak('rippleIntensity', v)} />
          <TweakColor label="Dot color" value={t.dotColor}
          options={['#181c28', '#e8eaf0', '#335f9a', '#6b5ca8', '#3f8a6b', '#c0392b', '#e07b3c', '#a8523f', '#8a7a3f']}
          onChange={(v) => setTweak('dotColor', v)} />
          <TweakSelect label="Cursor style" value={t.cursorStyle}
          options={[
          { value: 'default', label: 'Default — system arrow' },
          { value: 'crosshair', label: 'Crosshair' },
          { value: 'ring', label: 'Ring — hollow circle' },
          { value: 'dot', label: 'Dot — small filled' },
          { value: 'big-dot', label: 'Big dot' },
          { value: 'plus', label: 'Plus +' },
          { value: 'pointer', label: 'Pointer — hand' },
          { value: 'hidden', label: 'Hidden — no cursor' }]
          }
          onChange={(v) => setTweak('cursorStyle', v)} />
        </TweakSection>
      </TweaksPanel>
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
