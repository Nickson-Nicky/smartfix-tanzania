import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONFIG (replace with your deployed backend URL) ───────
const API_BASE = "https://your-backend.railway.app"; // ← change this
const STRIPE_PK = "pk_test_your_stripe_key";          // ← change this
const FLW_PK   = "FLWPUBK_TEST-your-flutterwave-key"; // ← change this

// ─── COLORS / DESIGN TOKENS ────────────────────────────────
const C = {
  navy:    "#0A1931",
  blue:    "#1A5276",
  accent:  "#F39C12",
  accentD: "#D68910",
  light:   "#EBF5FB",
  gray:    "#7F8C8D",
  dark:    "#2C3E50",
  green:   "#1E8449",
  success: "#27AE60",
  white:   "#FFFFFF",
};

const PRICING = {
  Smartphone: { labour: 12000, parts: 20000, fee: 2000 },
  Laptop:     { labour: 18000, parts: 30000, fee: 2000 },
  Tablet:     { labour: 14000, parts: 22000, fee: 2000 },
  Printer:    { labour: 10000, parts: 15000, fee: 2000 },
  Other:      { labour: 10000, parts: 10000, fee: 2000 },
};

const TECHNICIANS = [
  { id:"TECH-001", name:"John Mwangi",   rating:4.9, jobs:312, dist:"1.2 km", specialty:["Smartphone","Tablet"], badge:"Top Rated" },
  { id:"TECH-002", name:"Amina Salehe",  rating:4.8, jobs:198, dist:"2.5 km", specialty:["Laptop","Printer"],    badge:"Expert" },
  { id:"TECH-003", name:"Peter Kimaro",  rating:4.7, jobs:445, dist:"3.1 km", specialty:["Smartphone","Laptop","Tablet"], badge:"Most Experienced" },
];

const SERVICES = [
  { id:"Smartphone", icon:"📱", label:"Smartphone",  desc:"Screen, battery, charging port" },
  { id:"Laptop",     icon:"💻", label:"Laptop",       desc:"Hardware, OS, screen repair" },
  { id:"Tablet",     icon:"📟", label:"Tablet",       desc:"Display, battery, software" },
  { id:"Printer",    icon:"🖨️", label:"Printer",      desc:"Ink, paper jam, hardware" },
  { id:"Other",      icon:"🔧", label:"Other Device", desc:"Any electronics repair" },
];

const STEPS_LABELS = ["Device","Details","Quote","Payment","Done"];
const TRACK_STAGES = [
  { label:"Booking Confirmed",    desc:"Your booking is confirmed" },
  { label:"Technician Assigned",  desc:"Expert matched to your device" },
  { label:"Repair In Progress",   desc:"Technician is working on it" },
  { label:"Quality Check",        desc:"Device tested after repair" },
  { label:"Repair Complete",      desc:"Ready for collection" },
];

// ─── HELPERS ───────────────────────────────────────────────
const fmt = (n) => "TZS " + n.toLocaleString();
const calcPrice = (device) => {
  const p = PRICING[device] || PRICING.Other;
  return { labour: p.labour, parts: p.parts, fee: p.fee, total: p.labour + p.parts + p.fee };
};
const genTrackId = () => `SFX-${new Date().getFullYear()}-${String(Math.floor(Math.random()*90000+10000))}`;
const tomorrow = () => {
  const d = new Date(); d.setDate(d.getDate()+1);
  return d.toISOString().split("T")[0];
};

// ─── TOAST ─────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState(null);
  const show = (msg, type="info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };
  return [toast, show];
}

// ─── MAIN APP ──────────────────────────────────────────────
export default function SmartFix() {
  const [page, setPage]         = useState("home");   // home | booking | tracking | admin
  const [toast, showToast]      = useToast();
  const [step, setStep]         = useState(1);
 const [state, setState]       = useState({
    device: null, tech: null, problem: "", date: tomorrow(),
    payment: null, trackingId: null, userPhone: "", userName: "",
  });
  const [userPhone, setUserPhone] = useState("");
  const [userName, setUserName] = useState("");

  const go = (p) => { setPage(p); window.scrollTo(0,0); };
  const set = useCallback((k, v) => setState(s => ({...s, [k]: v})), []);

  // Nav
  const NavBar = () => (
    <nav style={{
      background: C.navy, padding:"0 1.5rem", height:60,
      display:"flex", alignItems:"center", justifyContent:"space-between",
      position:"sticky", top:0, zIndex:100,
      borderBottom:`2px solid rgba(243,156,18,.25)`,
    }}>
      <div
        onClick={() => go("home")}
        style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:"1.1rem",
          color: C.accent, cursor:"pointer", letterSpacing:".04em" }}
      >
        ⚙️ SmartFix <span style={{color:"#fff", fontWeight:300, fontSize:".85rem"}}>Tanzania</span>
      </div>
      <div style={{ display:"flex", gap:4 }}>
        {[["home","Home"],["booking","Book Repair"],["tracking","Track"],["admin","Admin"]].map(([id,label]) => (
          <button key={id} onClick={() => { go(id); if(id==="booking") setStep(1); }}
            style={{
              background: page===id ? "rgba(255,255,255,.12)" : "transparent",
              border:"none", color: page===id ? "#fff" : "#94b5cc",
              padding:".35rem .8rem", borderRadius:6, cursor:"pointer",
              fontSize:".82rem", fontWeight: page===id ? 600 : 400,
              transition:"all .2s",
            }}>
            {label}
          </button>
        ))}
      </div>
    </nav>
  );

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background: C.navy, minHeight:"100vh", color: C.dark }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=DM+Sans:wght@300;400;500;700&display=swap');
        * { box-sizing: border-box; margin:0; padding:0; }
        input, textarea, select { font-family: 'DM Sans', sans-serif; }
        button { font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:#0A1931; }
        ::-webkit-scrollbar-thumb { background:#F39C12; border-radius:3px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        .fade-up { animation: fadeUp .4s ease forwards; }
        .card-hover:hover { transform:translateY(-3px); box-shadow:0 12px 36px rgba(0,0,0,.15) !important; }
        .btn-primary { background:#F39C12; color:#0A1931; border:none; padding:".75rem 1.5rem"; border-radius:8px; font-weight:700; cursor:pointer; font-size:".95rem"; transition:all .2s; }
        .btn-primary:hover { background:#D68910; transform:translateY(-1px); }
        .pay-radio:checked + label { border-color:#F39C12 !important; background:rgba(243,156,18,.08) !important; }
        input:focus, textarea:focus { outline:2px solid #F39C12 !important; outline-offset:1px; }
      `}</style>

      <NavBar />

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)",
          background: toast.type==="error" ? "#c0392b" : C.navy,
          color:"#fff", padding:".75rem 1.5rem", borderRadius:10,
          boxShadow:"0 8px 32px rgba(0,0,0,.4)", zIndex:9999,
          border:`1px solid ${toast.type==="error"?"#e74c3c":"rgba(243,156,18,.4)"}`,
          fontSize:".9rem", fontWeight:500, whiteSpace:"nowrap",
          animation:"fadeUp .3s ease",
        }}>{toast.msg}</div>
      )}

      {/* ═══════════ HOME PAGE ═══════════ */}
      {page === "home" && <HomePage go={go} setStep={setStep} set={set} showToast={showToast} />}

      {/* ═══════════ BOOKING PAGE ═══════════ */}
      {page === "booking" && (
        <BookingPage
          step={step} setStep={setStep}
          state={state} set={set} setState={setState}
          showToast={showToast} go={go}
        />
      )}

      {/* ═══════════ TRACKING PAGE ═══════════ */}
      {page === "tracking" && <TrackingPage showToast={showToast} />}

      {/* ═══════════ ADMIN DASHBOARD ═══════════ */}
      {page === "admin" && <AdminPage showToast={showToast} />}

      <footer style={{
        background:"#060e1a", color:"#5a7a8a", textAlign:"center",
        padding:"1.5rem", fontSize:".82rem", borderTop:`1px solid rgba(255,255,255,.05)`
      }}>
        © 2026 <span style={{color:C.accent, fontWeight:700}}>SmartFix Tanzania</span> &nbsp;|&nbsp;
        www.smartfixtanzania.co.tz &nbsp;|&nbsp; Powered by FastAPI + Next.js
      </footer>
    </div>
  );
}

// ─── HOME PAGE ─────────────────────────────────────────────
function HomePage({ go, setStep, set, showToast }) {
  return (
    <div className="fade-up">
      {/* Hero */}
      <div style={{
        background:`linear-gradient(135deg, #0A1931 0%, #0e2a4a 60%, #142a3a 100%)`,
        padding:"5rem 1.5rem 4rem", textAlign:"center",
        display:"flex", flexDirection:"column", alignItems:"center", gap:"1.2rem",
        position:"relative", overflow:"hidden",
      }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 50% at 50% 40%, rgba(243,156,18,.07) 0%, transparent 70%)", pointerEvents:"none" }} />
        <div style={{ background:"rgba(243,156,18,.15)", border:"1px solid rgba(243,156,18,.4)", color:"#F39C12", fontSize:".75rem", fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", padding:".3rem 1rem", borderRadius:99 }}>
          🇹🇿 Tanzania's #1 Repair Platform
        </div>
        <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(1.8rem,5vw,3.2rem)", fontWeight:800, color:"#fff", lineHeight:1.1, maxWidth:640 }}>
          Fast, Trusted Device Repair<br /><span style={{color:"#F39C12"}}>At Your Doorstep</span>
        </h1>
        <p style={{ color:"#94b5cc", fontSize:"1rem", maxWidth:480, lineHeight:1.6, fontWeight:300 }}>
          Book a certified technician in minutes. Track your repair live. Pay with M-Pesa, Airtel, or card.
        </p>
        <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center", marginTop:".5rem" }}>
          <button onClick={() => { go("booking"); setStep(1); }}
            style={{ background:"#F39C12", color:"#0A1931", border:"none", padding:".85rem 2rem", borderRadius:8, fontWeight:800, fontSize:"1rem", cursor:"pointer", fontFamily:"'Sora',sans-serif", transition:"all .2s" }}>
            Book a Repair →
          </button>
          <button onClick={() => go("tracking")}
            style={{ background:"transparent", color:"#fff", border:"1.5px solid rgba(255,255,255,.3)", padding:".85rem 2rem", borderRadius:8, fontWeight:600, fontSize:"1rem", cursor:"pointer", transition:"all .2s" }}>
            Track Repair
          </button>
        </div>

        {/* Stats */}
        <div style={{ display:"flex", gap:"2rem", marginTop:"1rem", flexWrap:"wrap", justifyContent:"center" }}>
          {[["2,400+","Repairs Done"],["4.9★","Avg Rating"],["30 min","Response Time"],["100%","Certified Techs"]].map(([val,label]) => (
            <div key={label} style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:"1.4rem", color:"#F39C12" }}>{val}</div>
              <div style={{ color:"#7a9ab0", fontSize:".75rem", marginTop:2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
      <div style={{ padding:"3rem 1.5rem", background:"#fff" }} id="services">
        <div style={{ fontFamily:"'Sora',sans-serif", fontSize:"1.4rem", fontWeight:700, color:"#0A1931", textAlign:"center", marginBottom:".4rem" }}>What Can We Fix?</div>
        <div style={{ textAlign:"center", color:"#7F8C8D", fontSize:".88rem", marginBottom:"2rem" }}>Tap a service to book instantly</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:"1rem", maxWidth:800, margin:"0 auto" }}>
          {SERVICES.map(s => (
            <div key={s.id} className="card-hover"
              onClick={() => { set("device", s.id); go("booking"); setStep(1); }}
              style={{ background:"#fff", border:"1.5px solid #dde8f0", borderRadius:12, padding:"1.4rem 1rem", textAlign:"center", cursor:"pointer", transition:"all .25s", boxShadow:"0 2px 12px rgba(0,0,0,.06)" }}>
              <div style={{ fontSize:"2rem", marginBottom:".6rem" }}>{s.icon}</div>
              <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, color:"#0A1931", fontSize:".9rem", marginBottom:".3rem" }}>{s.label}</div>
              <div style={{ color:"#7F8C8D", fontSize:".75rem", lineHeight:1.4 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div style={{ padding:"3rem 1.5rem", background:"#EBF5FB" }}>
        <div style={{ fontFamily:"'Sora',sans-serif", fontSize:"1.4rem", fontWeight:700, color:"#0A1931", textAlign:"center", marginBottom:".4rem" }}>How It Works</div>
        <div style={{ textAlign:"center", color:"#7F8C8D", fontSize:".88rem", marginBottom:"2rem" }}>Get repaired in 4 simple steps</div>
        <div style={{ display:"flex", gap:"1.2rem", maxWidth:800, margin:"0 auto", flexWrap:"wrap", justifyContent:"center" }}>
          {[["1","Book Online","Choose your device and preferred technician"],["2","Get a Quote","Transparent pricing before any work starts"],["3","Repair","Certified tech fixes your device"],["4","Pay & Collect","Pay via M-Pesa or card when done"]].map(([n,title,desc]) => (
            <div key={n} className="card-hover" style={{ background:"#fff", border:"1.5px solid #e0eaf2", borderRadius:14, padding:"1.5rem 1.2rem", textAlign:"center", flex:1, minWidth:150, maxWidth:190, boxShadow:"0 2px 12px rgba(0,0,0,.06)", transition:"all .25s" }}>
              <div style={{ width:44, height:44, background:"#F39C12", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:"1.1rem", color:"#0A1931", margin:"0 auto 1rem" }}>{n}</div>
              <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, color:"#0A1931", fontSize:".9rem", marginBottom:".4rem" }}>{title}</div>
              <div style={{ color:"#7F8C8D", fontSize:".78rem", lineHeight:1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment methods */}
      <div style={{ padding:"2.5rem 1.5rem", background:"#fff", textAlign:"center" }}>
        <div style={{ color:"#7F8C8D", fontSize:".85rem", marginBottom:"1rem", fontWeight:500 }}>ACCEPTED PAYMENTS</div>
        <div style={{ display:"flex", gap:"1rem", justifyContent:"center", flexWrap:"wrap" }}>
          {[["📲","M-Pesa"],["📱","Airtel Money"],["💳","Visa/Mastercard"],["🦋","Flutterwave"],["⚡","Stripe"]].map(([icon,label]) => (
            <div key={label} style={{ background:"#f4f8fb", border:"1px solid #dde8f0", borderRadius:8, padding:".5rem 1rem", fontSize:".82rem", fontWeight:600, color:"#2C3E50", display:"flex", alignItems:"center", gap:6 }}>
              <span>{icon}</span>{label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── BOOKING WIZARD ────────────────────────────────────────
function BookingPage({ step, setStep, state, set, setState, showToast, go }) {
  const price = state.device ? calcPrice(state.device) : null;

  const ProgressBar = () => (
    <div style={{ display:"flex", gap:0, background:"#fff", padding:"1rem 1.5rem", borderBottom:"1px solid #e8eef4", overflowX:"auto" }}>
      {STEPS_LABELS.map((label, i) => {
        const n = i+1;
        const done = n < step, active = n === step;
        return (
          <div key={n} style={{ display:"flex", alignItems:"center", flex:1, minWidth:0 }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, flex:1 }}>
              <div style={{
                width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                background: done ? "#27AE60" : active ? "#F39C12" : "#e0eaf2",
                color: done||active ? "#fff" : "#aaa",
                fontWeight:700, fontSize:".85rem", transition:"all .3s",
              }}>{done ? "✓" : n}</div>
              <div style={{ fontSize:".68rem", color: active ? "#0A1931" : "#aaa", fontWeight: active ? 700 : 400, textAlign:"center", whiteSpace:"nowrap" }}>{label}</div>
            </div>
            {i < STEPS_LABELS.length-1 && <div style={{ height:2, flex:1, background: done ? "#27AE60" : "#e0eaf2", transition:"all .3s", margin:"0 4px", marginBottom:20 }} />}
          </div>
        );
      })}
    </div>
  );

  const Panel = ({ children, title }) => (
    <div style={{ background:"#fff", borderRadius:14, overflow:"hidden", boxShadow:"0 4px 24px rgba(0,0,0,.08)", marginBottom:"1rem" }}>
      {title && <div style={{ background:"#0A1931", color:"#F39C12", padding:".85rem 1.2rem", fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:".95rem" }}>{title}</div>}
      <div style={{ padding:"1.4rem 1.2rem" }}>{children}</div>
    </div>
  );

  // STEP 1 — Device selection
  const Step1 = () => (
    <div className="fade-up">
      <Panel title="📱 Step 1 — Select Device Type">
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:"0.8rem" }}>
          {SERVICES.map(s => (
            <button key={s.id} onClick={() => set("device", s.id)}
              style={{
                background: state.device===s.id ? "rgba(243,156,18,.12)" : "#f7fafc",
                border: state.device===s.id ? "2px solid #F39C12" : "1.5px solid #dde8f0",
                borderRadius:12, padding:"1.2rem .8rem", cursor:"pointer", textAlign:"center",
                transition:"all .2s",
              }}>
              <div style={{ fontSize:"1.8rem", marginBottom:".4rem" }}>{s.icon}</div>
              <div style={{ fontWeight:700, color:"#0A1931", fontSize:".85rem" }}>{s.label}</div>
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="👨‍🔧 Choose a Technician (Optional)">
        <div style={{ display:"flex", flexDirection:"column", gap:".8rem" }}>
          {TECHNICIANS.map(t => (
            <div key={t.id} onClick={() => set("tech", t)}
              style={{
                border: state.tech?.id===t.id ? "2px solid #F39C12" : "1.5px solid #dde8f0",
                background: state.tech?.id===t.id ? "rgba(243,156,18,.06)" : "#f9fbfc",
                borderRadius:12, padding:"1rem", cursor:"pointer", transition:"all .2s",
                display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8
              }}>
              <div>
                <div style={{ fontWeight:700, color:"#0A1931", fontSize:".95rem" }}>{t.name}
                  <span style={{ background:"#F39C12", color:"#0A1931", fontSize:".65rem", fontWeight:800, padding:"2px 7px", borderRadius:99, marginLeft:8 }}>{t.badge}</span>
                </div>
                <div style={{ color:"#7F8C8D", fontSize:".8rem", marginTop:2 }}>
                  ⭐ {t.rating} · {t.jobs} jobs · {t.dist} away
                </div>
                <div style={{ display:"flex", gap:4, marginTop:4, flexWrap:"wrap" }}>
                  {t.specialty.map(sp => <span key={sp} style={{ background:"#EBF5FB", color:"#1A5276", fontSize:".68rem", padding:"2px 8px", borderRadius:99 }}>{sp}</span>)}
                </div>
              </div>
              {state.tech?.id===t.id && <div style={{ color:"#F39C12", fontWeight:800, fontSize:"1.2rem" }}>✓</div>}
            </div>
          ))}
        </div>
      </Panel>

      {/* User info */}
      <Panel title="👤 Your Contact Details">
        <div style={{ display:"flex", flexDirection:"column", gap:".8rem" }}>
          <div>
            <label style={{ fontSize:".82rem", color:"#5a7a8a", fontWeight:600, display:"block", marginBottom:4 }}>Full Name</label>
            <input value={state.userName} onChange={e => set("userName", e.target.value)}
              placeholder="e.g. Juma Hassan"
              style={{ width:"100%", padding:".7rem", border:"1.5px solid #dde8f0", borderRadius:8, fontSize:".9rem" }} />
          </div>
          <div>
            <label style={{ fontSize:".82rem", color:"#5a7a8a", fontWeight:600, display:"block", marginBottom:4 }}>Phone Number (M-Pesa / Airtel)</label>
            <input value={state.userPhone} onChange={e => set("userPhone", e.target.value)}
              placeholder="+255 7XX XXX XXX"
              style={{ width:"100%", padding:".7rem", border:"1.5px solid #dde8f0", borderRadius:8, fontSize:".9rem" }} />
          </div>
        </div>
      </Panel>

      <button onClick={() => {
          if (!state.device) { showToast("⚠️ Please select a device", "error"); return; }
          if (!state.userPhone) { showToast("⚠️ Please enter your phone number", "error"); return; }
          setStep(2);
        }}
        style={{ width:"100%", background:"#F39C12", color:"#0A1931", border:"none", padding:".9rem", borderRadius:8, fontWeight:800, fontSize:"1rem", cursor:"pointer", fontFamily:"'Sora',sans-serif" }}>
        Next: Describe Problem →
      </button>
    </div>
  );

  // STEP 2 — Problem description
  const Step2 = () => (
    <div className="fade-up">
      <Panel title="🔍 Step 2 — Describe the Problem">
        <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
          <div>
            <label style={{ fontSize:".82rem", color:"#5a7a8a", fontWeight:600, display:"block", marginBottom:4 }}>Problem Description *</label>
            <textarea value={state.problem} onChange={e => set("problem", e.target.value)}
              rows={4} placeholder="e.g. My phone screen cracked after falling. Touch still works but display has lines..."
              style={{ width:"100%", padding:".8rem", border:"1.5px solid #dde8f0", borderRadius:8, fontSize:".9rem", resize:"vertical" }} />
          </div>
          <div>
            <label style={{ fontSize:".82rem", color:"#5a7a8a", fontWeight:600, display:"block", marginBottom:4 }}>Preferred Appointment Date</label>
            <input type="date" value={state.date} min={tomorrow()} onChange={e => set("date", e.target.value)}
              style={{ width:"100%", padding:".7rem", border:"1.5px solid #dde8f0", borderRadius:8, fontSize:".9rem" }} />
          </div>
          <div style={{ background:"#EBF5FB", borderRadius:8, padding:".8rem 1rem", fontSize:".82rem", color:"#1A5276" }}>
            ℹ️ Estimated quote for <strong>{state.device}</strong>: <strong>{price ? fmt(price.total) : "—"}</strong><br />
            <span style={{ color:"#7F8C8D" }}>Final price confirmed after technician inspection</span>
          </div>
        </div>
      </Panel>
      <div style={{ display:"flex", gap:".8rem" }}>
        <button onClick={() => setStep(1)} style={{ flex:1, background:"#f0f4f8", color:"#0A1931", border:"none", padding:".85rem", borderRadius:8, fontWeight:700, cursor:"pointer" }}>← Back</button>
        <button onClick={() => {
            if (!state.problem.trim()) { showToast("⚠️ Please describe the problem", "error"); return; }
            setStep(3);
          }}
          style={{ flex:2, background:"#F39C12", color:"#0A1931", border:"none", padding:".85rem", borderRadius:8, fontWeight:800, cursor:"pointer", fontFamily:"'Sora',sans-serif" }}>
          Next: See Quote →
        </button>
      </div>
    </div>
  );

  // STEP 3 — Quote
  const Step3 = () => {
    const p = price || calcPrice("Other");
    const Row = ({label, val, bold}) => (
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:".6rem 0", borderBottom:"1px solid #f0f4f8" }}>
        <span style={{ color:"#7F8C8D", fontSize:".88rem" }}>{label}</span>
        <span style={{ fontWeight: bold ? 800 : 600, color: bold ? "#0A1931" : "#2C3E50", fontSize: bold ? "1rem" : ".9rem" }}>{val}</span>
      </div>
    );
    return (
      <div className="fade-up">
        <Panel title="💰 Step 3 — Your Quote">
          <Row label="Device" val={state.device} />
          <Row label="Problem" val={state.problem.length>50 ? state.problem.slice(0,50)+"…" : state.problem} />
          <Row label="Technician" val={state.tech?.name || "Auto-assigned"} />
          <Row label="Appointment" val={state.date} />
          <div style={{ marginTop:"1rem", background:"#f7fafc", borderRadius:8, padding:"1rem" }}>
            <Row label="Labour Fee" val={fmt(p.labour)} />
            <Row label="Parts Estimate" val={fmt(p.parts)} />
            <Row label="Service Fee" val={fmt(p.fee)} />
            <Row label="TOTAL" val={fmt(p.total)} bold />
          </div>
          <div style={{ marginTop:".8rem", background:"rgba(39,174,96,.1)", border:"1px solid rgba(39,174,96,.3)", borderRadius:8, padding:".7rem 1rem", fontSize:".8rem", color:"#1E8449" }}>
            ✅ No hidden charges · Final price confirmed before repair starts
          </div>
        </Panel>
        <div style={{ display:"flex", gap:".8rem" }}>
          <button onClick={() => setStep(2)} style={{ flex:1, background:"#f0f4f8", color:"#0A1931", border:"none", padding:".85rem", borderRadius:8, fontWeight:700, cursor:"pointer" }}>← Back</button>
          <button onClick={() => setStep(4)} style={{ flex:2, background:"#F39C12", color:"#0A1931", border:"none", padding:".85rem", borderRadius:8, fontWeight:800, cursor:"pointer", fontFamily:"'Sora',sans-serif" }}>
            Confirm & Pay →
          </button>
        </div>
      </div>
    );
  };

  // STEP 4 — Payment
  const Step4 = () => {
    const p = price || calcPrice("Other");
    const METHODS = [
      { id:"mpesa",   icon:"📲", label:"M-Pesa",         desc:"Lipa Na M-Pesa · Most popular",     provider:"Flutterwave" },
      { id:"airtel",  icon:"📱", label:"Airtel Money",    desc:"Airtel / Tigo Pesa mobile wallet",   provider:"Flutterwave" },
      { id:"card",    icon:"💳", label:"Visa / Mastercard",desc:"Secure 3D-authenticated payment",   provider:"Stripe" },
      { id:"flw",     icon:"🦋", label:"Flutterwave",     desc:"All payment methods via Flutterwave", provider:"Flutterwave" },
    ];
    const [processing, setProcessing] = useState(false);
    const pay = async () => {
      if (!state.payment) { showToast("⚠️ Select a payment method", "error"); return; }
      setProcessing(true);
      showToast("⏳ Processing payment...");
      // Simulate API call — replace with real Flutterwave/Stripe integration
      setTimeout(() => {
        const tid = genTrackId();
        setState(s => ({...s, trackingId: tid}));
        setProcessing(false);
        setStep(5);
      }, 1800);
    };
    return (
      <div className="fade-up">
        <Panel title="💳 Step 4 — Payment">
          <div style={{ background:"#EBF5FB", borderRadius:8, padding:".8rem 1rem", marginBottom:"1rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ color:"#5a7a8a", fontSize:".88rem" }}>Amount Due</span>
            <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, color:"#0A1931", fontSize:"1.2rem" }}>{fmt(p.total)}</span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:".6rem" }}>
            {METHODS.map(m => (
              <div key={m.id} onClick={() => set("payment", m.id)}
                style={{
                  border: state.payment===m.id ? "2px solid #F39C12" : "1.5px solid #dde8f0",
                  background: state.payment===m.id ? "rgba(243,156,18,.06)" : "#f9fbfc",
                  borderRadius:10, padding:".9rem 1rem", cursor:"pointer", transition:"all .2s",
                  display:"flex", alignItems:"center", gap:"0.8rem",
                }}>
                <span style={{ fontSize:"1.5rem" }}>{m.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:"#0A1931", fontSize:".9rem" }}>{m.label}</div>
                  <div style={{ color:"#7F8C8D", fontSize:".75rem" }}>{m.desc}</div>
                </div>
                <span style={{ background:"#EBF5FB", color:"#1A5276", fontSize:".68rem", padding:"2px 8px", borderRadius:99, fontWeight:600 }}>{m.provider}</span>
              </div>
            ))}
          </div>
          {state.payment && ["mpesa","airtel"].includes(state.payment) && (
            <div style={{ marginTop:".8rem", background:"rgba(243,156,18,.08)", border:"1px solid rgba(243,156,18,.3)", borderRadius:8, padding:".8rem 1rem", fontSize:".82rem", color:"#8a5500" }}>
              📲 A payment prompt will be sent to <strong>{state.userPhone}</strong>. Enter your PIN to confirm.
            </div>
          )}
          {state.payment === "card" && (
            <div style={{ marginTop:".8rem", background:"rgba(39,174,96,.08)", border:"1px solid rgba(39,174,96,.3)", borderRadius:8, padding:".8rem 1rem", fontSize:".82rem", color:"#1E8449" }}>
              🔒 Secured by Stripe · PCI-DSS compliant · Card details never stored
            </div>
          )}
        </Panel>
        <div style={{ display:"flex", gap:".8rem" }}>
          <button onClick={() => setStep(3)} style={{ flex:1, background:"#f0f4f8", color:"#0A1931", border:"none", padding:".85rem", borderRadius:8, fontWeight:700, cursor:"pointer" }}>← Back</button>
          <button onClick={pay} disabled={processing}
            style={{ flex:2, background: processing ? "#ccc" : "#F39C12", color:"#0A1931", border:"none", padding:".85rem", borderRadius:8, fontWeight:800, cursor: processing?"wait":"pointer", fontFamily:"'Sora',sans-serif" }}>
            {processing ? "Processing..." : `Pay ${fmt(p.total)} →`}
          </button>
        </div>
      </div>
    );
  };

  // STEP 5 — Confirmation
  const Step5 = () => (
    <div className="fade-up" style={{ textAlign:"center" }}>
      <Panel>
        <div style={{ fontSize:"3.5rem", marginBottom:"1rem" }}>🎉</div>
        <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:"1.4rem", color:"#0A1931", marginBottom:".5rem" }}>Booking Confirmed!</div>
        <div style={{ color:"#7F8C8D", fontSize:".9rem", marginBottom:"1.5rem" }}>Your device repair has been booked. SMS confirmation sent to {state.userPhone}</div>
        <div style={{ background:"#EBF5FB", border:"2px solid #F39C12", borderRadius:12, padding:"1.2rem", marginBottom:"1.5rem" }}>
          <div style={{ color:"#7F8C8D", fontSize:".8rem", marginBottom:4 }}>YOUR TRACKING ID</div>
          <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:"1.5rem", color:"#F39C12", letterSpacing:".05em" }}>{state.trackingId}</div>
          <div style={{ color:"#5a7a8a", fontSize:".78rem", marginTop:4 }}>Save this to track your repair</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:".6rem" }}>
          {TRACK_STAGES.slice(0,2).map((s, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:".8rem", textAlign:"left" }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:"#27AE60", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:".85rem", flexShrink:0 }}>✓</div>
              <div>
                <div style={{ fontWeight:600, color:"#0A1931", fontSize:".88rem" }}>{s.label}</div>
                <div style={{ color:"#7F8C8D", fontSize:".75rem" }}>{new Date().toLocaleString()}</div>
              </div>
            </div>
          ))}
          {TRACK_STAGES.slice(2).map((s, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:".8rem", textAlign:"left", opacity:.5 }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:"#dde8f0", display:"flex", alignItems:"center", justifyContent:"center", color:"#7F8C8D", fontWeight:700, fontSize:".85rem", flexShrink:0 }}>{i+3}</div>
              <div>
                <div style={{ fontWeight:600, color:"#0A1931", fontSize:".88rem" }}>{s.label}</div>
                <div style={{ color:"#7F8C8D", fontSize:".75rem" }}>Pending</div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => { go("home"); setStep(1); setState(s => ({...s, device:null, tech:null, problem:"", payment:null})); }}
          style={{ marginTop:"1.5rem", width:"100%", background:"#0A1931", color:"#F39C12", border:"none", padding:".9rem", borderRadius:8, fontWeight:700, cursor:"pointer", fontSize:".95rem" }}>
          🏠 Back to Home
        </button>
      </Panel>
    </div>
  );

  return (
    <div style={{ background:"#EBF5FB", minHeight:"calc(100vh - 60px)" }}>
      <ProgressBar />
      <div style={{ maxWidth:640, margin:"0 auto", padding:"1.5rem 1rem" }}>
        {step===1 && <Step1 />}
        {step===2 && <Step2 />}
        {step===3 && <Step3 />}
        {step===4 && <Step4 />}
        {step===5 && <Step5 />}
      </div>
    </div>
  );
}

// ─── TRACKING PAGE ─────────────────────────────────────────
function TrackingPage({ showToast }) {
  const [input, setInput] = useState("SFX-2026-00847");
  const [result, setResult] = useState(null);
  const DEMO = {
    trackingId:"SFX-2026-00847", device:"Laptop", technician:"John Mwangi",
    status:"In Progress", stage:3,
    timeline:[
      { stage:1, label:"Booking Confirmed",   time:"3 Jun 2026, 08:42 AM", done:true },
      { stage:2, label:"Technician Assigned", time:"3 Jun 2026, 09:15 AM", done:true },
      { stage:3, label:"Repair In Progress",  time:"In progress now",       done:false, active:true },
      { stage:4, label:"Quality Check",       time:"Pending",               done:false },
      { stage:5, label:"Repair Complete",     time:"Pending",               done:false },
    ]
  };
  const track = () => {
    if (!input.trim()) { showToast("⚠️ Enter a tracking ID", "error"); return; }
    setResult(DEMO);
    showToast("✅ Repair found!");
  };
  return (
    <div style={{ background:"#EBF5FB", minHeight:"calc(100vh - 60px)", padding:"2rem 1rem" }}>
      <div style={{ maxWidth:580, margin:"0 auto" }}>
        <div style={{ background:"#fff", borderRadius:14, overflow:"hidden", boxShadow:"0 4px 24px rgba(0,0,0,.08)", marginBottom:"1rem" }}>
          <div style={{ background:"#0A1931", color:"#F39C12", padding:".85rem 1.2rem", fontFamily:"'Sora',sans-serif", fontWeight:700 }}>📍 Track Your Repair</div>
          <div style={{ padding:"1.4rem 1.2rem" }}>
            <label style={{ fontSize:".82rem", color:"#5a7a8a", fontWeight:600, display:"block", marginBottom:6 }}>Tracking ID</label>
            <div style={{ display:"flex", gap:".6rem" }}>
              <input value={input} onChange={e => setInput(e.target.value)}
                placeholder="e.g. SFX-2026-00847"
                style={{ flex:1, padding:".7rem", border:"1.5px solid #dde8f0", borderRadius:8, fontSize:".9rem" }} />
              <button onClick={track}
                style={{ background:"#F39C12", color:"#0A1931", border:"none", padding:".7rem 1.2rem", borderRadius:8, fontWeight:700, cursor:"pointer" }}>
                Track →
              </button>
            </div>
          </div>
        </div>

        {result && (
          <div className="fade-up" style={{ background:"#fff", borderRadius:14, boxShadow:"0 4px 24px rgba(0,0,0,.08)", padding:"1.4rem 1.2rem" }}>
            {[["Tracking ID", result.trackingId],["Device", result.device],["Technician", result.technician]].map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:".5rem 0", borderBottom:"1px solid #f0f4f8" }}>
                <span style={{ color:"#7F8C8D", fontSize:".85rem" }}>{k}</span>
                <span style={{ fontWeight:600, color:"#0A1931", fontSize:".85rem" }}>{v}</span>
              </div>
            ))}
            <div style={{ display:"flex", justifyContent:"space-between", padding:".5rem 0", marginBottom:"1rem", borderBottom:"1px solid #f0f4f8" }}>
              <span style={{ color:"#7F8C8D", fontSize:".85rem" }}>Status</span>
              <span style={{ background:"#F39C12", color:"#0A1931", padding:"2px 10px", borderRadius:99, fontWeight:700, fontSize:".8rem" }}>{result.status}</span>
            </div>
            {result.timeline.map((t, i) => (
              <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:".8rem", marginBottom:".8rem" }}>
                <div style={{ width:30, height:30, borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:".8rem",
                  background: t.done ? "#27AE60" : t.active ? "#F39C12" : "#e0eaf2",
                  color: t.done||t.active ? "#fff" : "#aaa",
                }}>{t.done ? "✓" : t.active ? "→" : t.stage}</div>
                <div>
                  <div style={{ fontWeight:600, color:"#0A1931", fontSize:".88rem" }}>{t.label}</div>
                  <div style={{ color:"#7F8C8D", fontSize:".75rem" }}>{t.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ADMIN DASHBOARD ───────────────────────────────────────
function AdminPage({ showToast }) {
  const stats = [
    { icon:"📋", label:"Total Bookings",    val:"2,418",   color:"#1A5276" },
    { icon:"✅", label:"Completed",         val:"2,105",   color:"#27AE60" },
    { icon:"🔧", label:"In Progress",       val:"243",     color:"#F39C12" },
    { icon:"💰", label:"Revenue (TZS)",     val:"87.4M",   color:"#8e44ad" },
  ];
  const recent = [
    { id:"SFX-2026-00847", name:"Juma Hassan",  device:"Laptop",     status:"In Progress", amount:"50,000" },
    { id:"SFX-2026-00846", name:"Amina Said",   device:"Smartphone", status:"Complete",    amount:"34,000" },
    { id:"SFX-2026-00845", name:"Peter Mbeki",  device:"Tablet",     status:"Booked",      amount:"38,000" },
    { id:"SFX-2026-00844", name:"Grace Kimani", device:"Printer",    status:"Complete",    amount:"27,000" },
  ];
  const statusColor = { "Complete":"#27AE60", "In Progress":"#F39C12", "Booked":"#1A5276" };
  return (
    <div style={{ background:"#EBF5FB", minHeight:"calc(100vh - 60px)", padding:"1.5rem 1rem" }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:"1.4rem", color:"#0A1931", marginBottom:"1.2rem" }}>
          📊 Admin Dashboard
        </div>
        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:"1rem", marginBottom:"1.5rem" }}>
          {stats.map(s => (
            <div key={s.label} style={{ background:"#fff", borderRadius:12, padding:"1.2rem", boxShadow:"0 2px 12px rgba(0,0,0,.07)", borderLeft:`4px solid ${s.color}` }}>
              <div style={{ fontSize:"1.6rem", marginBottom:".4rem" }}>{s.icon}</div>
              <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:"1.5rem", color: s.color }}>{s.val}</div>
              <div style={{ color:"#7F8C8D", fontSize:".8rem" }}>{s.label}</div>
            </div>
          ))}
        </div>
        {/* Recent bookings */}
        <div style={{ background:"#fff", borderRadius:14, overflow:"hidden", boxShadow:"0 4px 24px rgba(0,0,0,.08)" }}>
          <div style={{ background:"#0A1931", color:"#F39C12", padding:".85rem 1.2rem", fontFamily:"'Sora',sans-serif", fontWeight:700 }}>
            Recent Bookings
          </div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"#f4f8fb" }}>
                  {["Tracking ID","Customer","Device","Status","Amount (TZS)"].map(h => (
                    <th key={h} style={{ padding:".7rem 1rem", textAlign:"left", fontSize:".78rem", color:"#5a7a8a", fontWeight:700, borderBottom:"1px solid #e8eef4" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((r, i) => (
                  <tr key={i} style={{ borderBottom:"1px solid #f0f4f8" }}>
                    <td style={{ padding:".8rem 1rem", fontSize:".82rem", fontWeight:600, color:"#F39C12" }}>{r.id}</td>
                    <td style={{ padding:".8rem 1rem", fontSize:".85rem", color:"#0A1931", fontWeight:600 }}>{r.name}</td>
                    <td style={{ padding:".8rem 1rem", fontSize:".85rem", color:"#2C3E50" }}>{r.device}</td>
                    <td style={{ padding:".8rem 1rem" }}>
                      <span style={{ background: statusColor[r.status]+"22", color: statusColor[r.status], padding:"3px 10px", borderRadius:99, fontSize:".75rem", fontWeight:700 }}>{r.status}</span>
                    </td>
                    <td style={{ padding:".8rem 1rem", fontSize:".85rem", fontWeight:700, color:"#0A1931" }}>{r.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Technician overview */}
        <div style={{ marginTop:"1.2rem", background:"#fff", borderRadius:14, overflow:"hidden", boxShadow:"0 4px 24px rgba(0,0,0,.08)" }}>
          <div style={{ background:"#0A1931", color:"#F39C12", padding:".85rem 1.2rem", fontFamily:"'Sora',sans-serif", fontWeight:700 }}>Technicians</div>
          <div style={{ padding:"1rem" }}>
            {TECHNICIANS.map(t => (
              <div key={t.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:".8rem 0", borderBottom:"1px solid #f0f4f8", flexWrap:"wrap", gap:8 }}>
                <div>
                  <div style={{ fontWeight:700, color:"#0A1931", fontSize:".9rem" }}>{t.name}</div>
                  <div style={{ color:"#7F8C8D", fontSize:".78rem" }}>⭐ {t.rating} · {t.jobs} jobs · {t.specialty.join(", ")}</div>
                </div>
                <span style={{ background:"rgba(39,174,96,.15)", color:"#1E8449", padding:"3px 12px", borderRadius:99, fontSize:".75rem", fontWeight:700 }}>● Available</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
