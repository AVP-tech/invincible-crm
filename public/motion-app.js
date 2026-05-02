/* ─── FadingVideo ─── */
function FadingVideo(props) {
  var videoRef = useRef(null);
  var rafRef = useRef(null);
  var fadingOutRef = useRef(false);
  var FADE_MS = 500;

  var fadeTo = useCallback(function(target, dur) {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    var v = videoRef.current; if (!v) return;
    var s = parseFloat(v.style.opacity) || 0;
    var t0 = performance.now();
    function step(now) {
      var p = Math.min((now - t0) / dur, 1);
      v.style.opacity = s + (target - s) * p;
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(function() {
    var v = videoRef.current; if (!v) return;
    function onLoad() { v.style.opacity = 0; v.play().catch(function(){}); fadeTo(1, FADE_MS); }
    function onTime() {
      if (!fadingOutRef.current && v.duration - v.currentTime <= 0.55 && v.duration - v.currentTime > 0) {
        fadingOutRef.current = true; fadeTo(0, FADE_MS);
      }
    }
    function onEnd() {
      v.style.opacity = 0;
      setTimeout(function() { v.currentTime = 0; v.play().catch(function(){}); fadingOutRef.current = false; fadeTo(1, FADE_MS); }, 100);
    }
    v.addEventListener("loadeddata", onLoad);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("ended", onEnd);
    return function() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      v.removeEventListener("loadeddata", onLoad);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("ended", onEnd);
    };
  }, [fadeTo]);

  return html`<video ref=${videoRef} src=${props.src} autoPlay muted playsInline preload="auto"
    className=${props.className || ""} style=${{ ...(props.style || {}), opacity: 0 }} />`;
}

/* ─── BlurText ─── */
function BlurText(props) {
  var ref = useRef(null);
  var vis = useState(false);
  var visible = vis[0], setVisible = vis[1];
  useEffect(function() {
    var el = ref.current; if (!el) return;
    var obs = new IntersectionObserver(function(e) { if (e[0].isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el); return function() { obs.disconnect(); };
  }, []);
  var words = props.text.split(" ");
  return html`<p ref=${ref} className=${props.className} style=${{ display: "flex", flexWrap: "wrap", justifyContent: "center", rowGap: "0.1em" }}>
    ${words.map(function(w, i) {
      return html`<${motion.span} key=${i}
        initial=${{ filter: "blur(10px)", opacity: 0, y: 50 }}
        animate=${visible ? { filter: "blur(0px)", opacity: 1, y: 0 } : {}}
        transition=${{ duration: 0.7, delay: i * 0.1, ease: "easeOut" }}
        style=${{ display: "inline-block", marginRight: "0.28em" }}>${w}</${motion.span}>`;
    })}
  </p>`;
}

/* ─── Anim helper ─── */
function Anim(props) {
  return html`<${motion.div}
    initial=${{ filter: "blur(10px)", opacity: 0, y: 20 }}
    animate=${{ filter: "blur(0px)", opacity: 1, y: 0 }}
    transition=${{ delay: props.d || 0, duration: 0.6, ease: "easeOut" }}
    className=${props.className || ""}>${props.children}</${motion.div}>`;
}

/* ─── SVG Icons ─── */
function ArrowUR(p) {
  return html`<svg className=${p.className||""} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>`;
}
function PlayI(p) {
  return html`<svg className=${p.className||""} viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>`;
}
function ClockI(p) {
  return html`<svg className=${p.className||""} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
}
function GlobeI(p) {
  return html`<svg className=${p.className||""} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;
}
function BotI(p) {
  return html`<svg className=${p.className||""} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>`;
}
function MsgI(p) {
  return html`<svg className=${p.className||""} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
}
function PipeI(p) {
  return html`<svg className=${p.className||""} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>`;
}

/* ─── Navbar ─── */
function Navbar() {
  var links = ["Home", "Features", "Capture", "Pipeline", "Pricing"];
  return html`<nav className="fixed top-4 left-0 right-0 px-8 lg:px-16 z-50 flex items-center justify-between">
    <div className="lg rounded-full h-12 w-12 flex items-center justify-center">
      <span className="font-heading italic text-white text-xl">i</span>
    </div>
    <div className="hidden md:flex lg rounded-full px-1.5 py-1.5 items-center gap-0">
      ${links.map(function(l) {
        return html`<a key=${l} href="#" className="px-3 py-2 text-sm font-medium text-white/90 font-body hover:text-white transition">${l}</a>`;
      })}
      <a href="#" className="bg-white text-black rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap flex items-center gap-1.5 ml-1">
        Get Started <${ArrowUR} className="h-4 w-4"/>
      </a>
    </div>
    <div className="h-12 w-12"/>
  </nav>`;
}

/* ─── Hero ─── */
function HeroSection() {
  return html`<section className="relative h-screen flex flex-col bg-black overflow-hidden">
    <${FadingVideo}
      src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
      className="absolute left-1/2 top-0 -translate-x-1/2 object-cover object-top z-0"
      style=${{ width: "120%", height: "120%" }}/>
    <div className="relative z-10 flex flex-col flex-1 items-center">
      <div className="flex-1 flex flex-col items-center justify-center pt-24 px-4">
        <${Anim} d=${0.4}>
          <div className="lg rounded-full flex items-center gap-2 pr-3">
            <span className="bg-white text-black rounded-full px-3 py-1 text-xs font-semibold">New</span>
            <span className="text-sm text-white/90 font-body">Captain Hook AI Agent — Your CRM Copilot is Live</span>
          </div>
        </${Anim}>

        <div className="mt-6">
          <${BlurText} text="Command Your Business Like Never Before"
            className="text-6xl md:text-7xl lg:text-[5.5rem] font-heading italic text-white leading-[0.8] max-w-2xl tracking-[-4px] text-center"/>
        </div>

        <${Anim} d=${0.8} className="mt-4 text-sm md:text-base text-white max-w-2xl font-body font-light leading-tight text-center">
          The CRM that never drops the ball. One sentence captures contacts, deals, and follow-ups.
          Captain Hook AI works while you sleep. WhatsApp reminders keep your pipeline alive 24/7.
        </${Anim}>

        <${Anim} d=${1.1} className="flex items-center gap-6 mt-6">
          <a href="#" className="lgs rounded-full px-5 py-2.5 text-sm font-medium text-white flex items-center gap-2">
            Start Free Trial <${ArrowUR} className="h-5 w-5"/>
          </a>
          <a href="#" className="text-white text-sm font-medium flex items-center gap-2 hover:opacity-80 transition">
            Watch Demo <${PlayI} className="h-4 w-4"/>
          </a>
        </${Anim}>

        <${Anim} d=${1.3} className="flex items-stretch gap-4 mt-8">
          <div className="lg rounded-[1.25rem] p-5 w-[220px] shim">
            <${ClockI} className="h-7 w-7 text-white"/>
            <p className="font-heading italic text-white text-4xl tracking-[-1px] leading-none mt-3">2 Sec</p>
            <p className="text-xs text-white font-body font-light mt-2">Average AI Capture Time Per Entry</p>
          </div>
          <div className="lg rounded-[1.25rem] p-5 w-[220px] shim">
            <${GlobeI} className="h-7 w-7 text-white"/>
            <p className="font-heading italic text-white text-4xl tracking-[-1px] leading-none mt-3">24/7</p>
            <p className="text-xs text-white font-body font-light mt-2">Always-On WhatsApp Reminders</p>
          </div>
        </${Anim}>
      </div>

      <${Anim} d=${1.4} className="flex flex-col items-center gap-4 pb-8">
        <div className="lg rounded-full px-3.5 py-1 text-xs font-medium text-white font-body">
          Powered by the technologies that define the future
        </div>
        <div className="flex items-center gap-12 md:gap-16">
          ${["Gemini", "OpenAI", "WhatsApp", "Resend", "Prisma"].map(function(n) {
            return html`<span key=${n} className="font-heading italic text-white text-2xl md:text-3xl tracking-tight">${n}</span>`;
          })}
        </div>
      </${Anim}>
    </div>
  </section>`;
}

/* ─── Capabilities ─── */
function CapSection() {
  var cards = [
    { icon: BotI, title: "Captain Hook AI", desc: "An autonomous AI agent that lives inside your CRM. It triages deals, surfaces overdue follow-ups, routes conversations, and executes CRM actions — all from natural language.", tags: ["Autonomous Agent", "Deal Triage", "Action Executor", "Always On-Deck"] },
    { icon: MsgI, title: "WhatsApp Automation", desc: "Background webhook capture syncs conversations automatically. Intelligent reminders reach your phone even when your laptop is off — powered by Meta Graph API.", tags: ["Auto Sync", "Offline Reminders", "Meta API", "Background Jobs"] },
    { icon: PipeI, title: "AI Quick Capture", desc: "Type one messy sentence and watch AI extract contacts, deals, tasks, and notes simultaneously. Zero forms. Zero clicks. Natural language to structured CRM in 2 seconds.", tags: ["NLP Engine", "Entity Detection", "Date Parsing", "Multi-Action"] },
  ];

  return html`<section className="relative min-h-screen bg-black overflow-hidden">
    <${FadingVideo}
      src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4"
      className="absolute inset-0 w-full h-full object-cover z-0"/>
    <div className="relative z-10 px-8 md:px-16 lg:px-20 pt-24 pb-10 flex flex-col min-h-screen">
      <div className="mb-auto">
        <${motion.p} className="text-sm font-body text-white/80 mb-6"
          initial=${{ opacity: 0 }} whileInView=${{ opacity: 1 }} viewport=${{ once: true }}
          transition=${{ duration: 0.6 }}>// What Makes Us Invincible</${motion.p}>
        <${motion.h2} className="font-heading italic text-white text-6xl md:text-7xl lg:text-[6rem] leading-[0.9] tracking-[-3px]"
          initial=${{ opacity: 0, y: 30 }} whileInView=${{ opacity: 1, y: 0 }} viewport=${{ once: true }}
          transition=${{ duration: 0.8, ease: "easeOut" }}>
          Intelligence<br/>evolved
        </${motion.h2}>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
        ${cards.map(function(card, idx) {
          return html`<${motion.div} key=${card.title}
            className="lg rounded-[1.25rem] p-6 min-h-[360px] flex flex-col"
            initial=${{ opacity: 0, y: 40 }} whileInView=${{ opacity: 1, y: 0 }} viewport=${{ once: true }}
            transition=${{ delay: idx * 0.15, duration: 0.7, ease: "easeOut" }}>
            <div className="flex items-start justify-between gap-4">
              <div className="lg rounded-[0.75rem] h-11 w-11 flex items-center justify-center flex-shrink-0">
                <${card.icon} className="h-6 w-6 text-white"/>
              </div>
              <div className="flex flex-wrap justify-end gap-1.5 max-w-[70%]">
                ${card.tags.map(function(t) {
                  return html`<span key=${t} className="lg rounded-full px-3 py-1 text-[11px] text-white/90 font-body whitespace-nowrap">${t}</span>`;
                })}
              </div>
            </div>
            <div className="flex-1"/>
            <div className="mt-6">
              <h3 className="font-heading italic text-white text-3xl md:text-4xl tracking-[-1px] leading-none">${card.title}</h3>
              <p className="mt-3 text-sm text-white/90 font-body font-light leading-snug max-w-[32ch]">${card.desc}</p>
            </div>
          </${motion.div}>`;
        })}
      </div>
    </div>
  </section>`;
}

/* ─── App ─── */
function App() {
  return html`<div>
    <${Navbar}/>
    <${HeroSection}/>
    <${CapSection}/>
  </div>`;
}

ReactDOM.createRoot(document.getElementById("root")).render(html`<${App}/>`);
