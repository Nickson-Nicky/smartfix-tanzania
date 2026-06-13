import { useState, useRef, useCallback } from "react";

const C = {
  navy: "#0A1931", blue: "#1A5276", accent: "#F39C12",
  light: "#EBF5FB", gray: "#7F8C8D", dark: "#2C3E50",
  green: "#27AE60", white: "#FFFFFF",
};

const PRICING = {
  Smartphone: { labour: 12000, parts: 20000, fee: 2000 },
  Laptop:     { labour: 18000, parts: 30000, fee: 2000 },
  Tablet:     { labour: 14000, parts: 22000, fee: 2000 },
  Printer:    { labour: 10000, parts: 15000, fee: 2000 },
  Other:      { labour: 10000, parts: 10000, fee: 2000 },
};

const TECHNICIANS = [
  { id:"TECH-001", name:"John Mwangi",  rating:4.9, jobs:312, dist:"1.2 km", specialty:["Smartphone","Tablet"],        badge:"Top Rated" },
  { id:"TECH-002", name:"Amina Salehe", rating:4.8, jobs:198, dist:"2.5 km", specialty:["Laptop","Printer"],           badge:"Expert" },
  { id:"TECH-003", name:"Peter Kimaro", rating:4.7, jobs:445, dist:"3.1 km", specialty:["Smartphone","Laptop","Tablet"],badge:"Most Experienced" },
];

const SERVICES = [
  { id:"Smartphone", icon:"📱", label:"Smartphone",   desc:"Screen, battery, charging port" },
  { id:"Laptop",     icon:"💻", label:"Laptop",        desc:"Hardware, OS, screen repair" },
  { id:"Tablet",     icon:"📟", label:"Tablet",        desc:"Display, battery, software" },
  { id:"Printer",    icon:"🖨️", label:"Printer",       desc:"Ink, paper jam, hardware" },
  { id:"Other",      icon:"🔧", label:"Other Device",  desc:"Any electronics repair" },
];

const TRACK_STAGES = [
  { label:"Booking Confirmed",   desc:"Your booking is confirmed" },
  { label:"Technician Assigned", desc:"Expert matched to your device" },
  { label:"Repair In Progress",  desc:"Technician is working on it" },
  { label:"Quality Check",       desc:"Device tested after repair" },
  { label:"Repair Complete",     desc:"Ready for collection" },
];

const STEPS_LABELS = ["Device","Details","Quote","Payment","Done"];

const fmt = (n) => "TZS " + n.toLocaleString();
const calcPrice = (device) => {
  const p = PRICING[device] || PRICING.Other;
  return { labour: p.labour, parts: p.parts, fee: p.fee, total: p.labour + p.parts + p.fee };
};
const genTrackId = () => `SFX-${new Date().getFullYear()}-${String(Math.floor(Math.random()*90000+10000))}`;
const tomorrow = () => { const d = new Date(); d.setDate(d.getDate()+1); return d.toISOString().split("T")[0]; };

const inputStyle = {
  width:"100%", padding:".75rem", border:"1.5px solid #dde8f0",
  borderRadius:8, fontSize:"1rem", fontFamily:"'DM Sans',sans-serif",
  outline:"none", boxSizing:"border-box", background:"#fff",
};

export default function SmartFix() {
  const [page, setPage]   = useState("home");
  const [step, setStep]   = useState(1);
  const [toast, setToast] = useState(null);

  // booking state
  const [device,     setDevice]     = useState(null);
  const [tech,       setTech]       = useState(null);
  const [payment,    setPayment]    = useState(null);
  const [trackingId, setTrackingId] = useState(null);
  const [date,       setDate]       = useState(tomorrow());

  // uncontrolled refs for text inputs (fixes the jump bug)
  const nameRef    = useRef();
  const phoneRef   = useRef();
  const problemRef = useRef();

  const showToast = useCallback((msg, type="info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const go = (p) => { setPage(p); window.scrollTo(0,0); };

  const NavBar = () => (
    <nav style={{ background:C.navy, padding:"0 1.5rem", height:60,
      display:"flex", alignItems:"center", justifyContent:"space-between",
      position:"sticky", top:0, zIndex:100, borderBottom:"2px solid rgba(243,156,18,.25)" }}>
      <div onClick={() => go("home")} style={{ fontFamily:"'Sora',sans-serif",
        fontWeight:800, fontSize:"1.1rem", color:C.accent, cursor:"pointer" }}>
        ⚙️ SmartFix <span style={{color:"#fff",fontWeight:300,fontSize:".85rem"}}>Tanzania</span>
      </div>
      <div style={{ display:"flex", gap:4 }}>
        {[["home","Home"],["booking","Book"],["tracking","Track"],["admin","Admin"]].map(([id,label]) => (
          <button key={id} onClick={() => { go(id); if(id==="booking") setStep(1); }}
            style={{ background:page===id?"rgba(255,255,255,.12)":"transparent",
              border:"none", color:page===id?"#fff":"#94b5cc",
              padding:".35rem .8rem", borderRadius:6, cursor:"pointer", fontSize:".82rem",
              fontWeight:page===id?600:400 }}>
            {label}
          </button>
        ))}
      </div>
    </nav>
  );

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background:C.navy, minHeight:"100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;700;800&family=DM+Sans:wght@400;500;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        input,textarea{font-family:'DM Sans',sans-serif;-webkit-appearance:none;}
        input:focus,textarea:focus{outline:2px solid #F39C12!important;outline-offset:1px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp .35s ease forwards;}
        .card:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(0,0,0,.12)!important;}
      `}</style>

      <NavBar />

      {toast && (
        <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)",
          background:toast.type==="error"?"#c0392b":C.navy, color:"#fff",
          padding:".75rem 1.5rem", borderRadius:10, zIndex:9999,
          border:`1px solid ${toast.type==="error"?"#e74c3c":"rgba(243,156,18,.4)"}`,
          fontSize:".9rem", fontWeight:500, animation:"fadeUp .3s ease" }}>
          {toast.msg}
        </div>
      )}

      {page==="home"     && <HomePage go={go} setStep={setStep} setDevice={setDevice} />}
      {page==="booking"  && (
        <BookingPage
          step={step} setStep={setStep}
          device={device} setDevice={setDevice}
          tech={tech} setTech={setTech}
          payment={payment} setPayment={setPayment}
          trackingId={trackingId} setTrackingId={setTrackingId}
          date={date} setDate={setDate}
          nameRef={nameRef} phoneRef={phoneRef} problemRef={problemRef}
          showToast={showToast} go={go}
        />
      )}
      {page==="tracking" && <TrackingPage showToast={showToast} />}
      {page==="admin"    && <AdminPage />}

      <footer style={{ background:"#060e1a", color:"#5a7a8a", textAlign:"center",
        padding:"1.5rem", fontSize:".82rem", borderTop:"1px solid rgba(255,255,255,.05)" }}>
        © 2026 <span style={{color:C.accent,fontWeight:700}}>SmartFix Tanzania</span> · smartfixtanzania.co.tz
      </footer>
    </div>
  );
}

// ─── HOME ──────────────────────────────────────────────────
function HomePage({ go, setStep, setDevice }) {
  return (
    <div className="fade-up">
      <div style={{ background:"linear-gradient(135deg,#0A1931,#0e2a4a)", padding:"5rem 1.5rem 4rem",
        textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:"1.2rem" }}>
        <div style={{ background:"rgba(243,156,18,.15)", border:"1px solid rgba(243,156,18,.4)",
          color:"#F39C12", fontSize:".75rem", fontWeight:700, letterSpacing:".12em",
          textTransform:"uppercase", padding:".3rem 1rem", borderRadius:99 }}>
          🇹🇿 Tanzania's #1 Repair Platform
        </div>
        <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(1.8rem,5vw,3rem)",
          fontWeight:800, color:"#fff", lineHeight:1.1, maxWidth:600 }}>
          Fast Device Repair<br /><span style={{color:"#F39C12"}}>At Your Doorstep</span>
        </h1>
        <p style={{ color:"#94b5cc", fontSize:"1rem", maxWidth:480, lineHeight:1.6, fontWeight:300 }}>
          Book a certified technician in minutes. Track live. Pay with M-Pesa or card.
        </p>
        <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center", marginTop:".5rem" }}>
          <button onClick={() => { go("booking"); setStep(1); }}
            style={{ background:"#F39C12", color:"#0A1931", border:"none", padding:".85rem 2rem",
              borderRadius:8, fontWeight:800, fontSize:"1rem", cursor:"pointer" }}>
            Book a Repair →
          </button>
          <button onClick={() => go("tracking")}
            style={{ background:"transparent", color:"#fff", border:"1.5px solid rgba(255,255,255,.3)",
              padding:".85rem 2rem", borderRadius:8, fontWeight:600, fontSize:"1rem", cursor:"pointer" }}>
            Track Repair
          </button>
        </div>
        <div style={{ display:"flex", gap:"2rem", marginTop:"1rem", flexWrap:"wrap", justifyContent:"center" }}>
          {[["2,400+","Repairs Done"],["4.9★","Avg Rating"],["30 min","Response Time"],["100%","Certified"]].map(([val,label]) => (
            <div key={label} style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:"1.4rem", color:"#F39C12" }}>{val}</div>
              <div style={{ color:"#7a9ab0", fontSize:".75rem", marginTop:2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:"3rem 1.5rem", background:"#fff" }}>
        <div style={{ fontFamily:"'Sora',sans-serif", fontSize:"1.4rem", fontWeight:700,
          color:"#0A1931", textAlign:"center", marginBottom:".4rem" }}>What Can We Fix?</div>
        <div style={{ textAlign:"center", color:"#7F8C8D", fontSize:".88rem", marginBottom:"2rem" }}>Tap to book instantly</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",
          gap:"1rem", maxWidth:800, margin:"0 auto" }}>
          {SERVICES.map(s => (
            <div key={s.id} className="card"
              onClick={() => { setDevice(s.id); go("booking"); setStep(1); }}
              style={{ background:"#fff", border:"1.5px solid #dde8f0", borderRadius:12,
                padding:"1.4rem 1rem", textAlign:"center", cursor:"pointer",
                transition:"all .25s", boxShadow:"0 2px 12px rgba(0,0,0,.06)" }}>
              <div style={{ fontSize:"2rem", marginBottom:".6rem" }}>{s.icon}</div>
              <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, color:"#0A1931", fontSize:".9rem", marginBottom:".3rem" }}>{s.label}</div>
              <div style={{ color:"#7F8C8D", fontSize:".75rem", lineHeight:1.4 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:"2.5rem 1.5rem", background:"#fff", textAlign:"center", borderTop:"1px solid #f0f4f8" }}>
        <div style={{ color:"#7F8C8D", fontSize:".85rem", marginBottom:"1rem", fontWeight:500 }}>ACCEPTED PAYMENTS</div>
        <div style={{ display:"flex", gap:"1rem", justifyContent:"center", flexWrap:"wrap" }}>
          {[["📲","M-Pesa"],["📱","Airtel Money"],["💳","Visa/Mastercard"],["🦋","Flutterwave"],["⚡","Stripe"]].map(([icon,label]) => (
            <div key={label} style={{ background:"#f4f8fb", border:"1px solid #dde8f0", borderRadius:8,
              padding:".5rem 1rem", fontSize:".82rem", fontWeight:600, color:"#2C3E50",
              display:"flex", alignItems:"center", gap:6 }}>
              {icon} {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── BOOKING ───────────────────────────────────────────────
function BookingPage({ step, setStep, device, setDevice, tech, setTech, payment, setPayment,
  trackingId, setTrackingId, date, setDate, nameRef, phoneRef, problemRef, showToast, go }) {

  const price = device ? calcPrice(device) : null;

  const ProgressBar = () => (
    <div style={{ display:"flex", background:"#fff", padding:"1rem 1.5rem",
      borderBottom:"1px solid #e8eef4", overflowX:"auto" }}>
      {STEPS_LABELS.map((label, i) => {
        const n=i+1, done=n<step, active=n===step;
        return (
          <div key={n} style={{ display:"flex", alignItems:"center", flex:1, minWidth:0 }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, flex:1 }}>
              <div style={{ width:32, height:32, borderRadius:"50%", display:"flex",
                alignItems:"center", justifyContent:"center",
                background:done?"#27AE60":active?"#F39C12":"#e0eaf2",
                color:done||active?"#fff":"#aaa", fontWeight:700, fontSize:".85rem" }}>
                {done?"✓":n}
              </div>
              <div style={{ fontSize:".68rem", color:active?"#0A1931":"#aaa",
                fontWeight:active?700:400, textAlign:"center", whiteSpace:"nowrap" }}>{label}</div>
            </div>
            {i<STEPS_LABELS.length-1 && (
              <div style={{ height:2, flex:1, background:done?"#27AE60":"#e0eaf2", margin:"0 4px", marginBottom:20 }} />
            )}
          </div>
        );
      })}
    </div>
  );

  const Panel = ({ children, title }) => (
    <div style={{ background:"#fff", borderRadius:14, overflow:"hidden",
      boxShadow:"0 4px 24px rgba(0,0,0,.08)", marginBottom:"1rem" }}>
      {title && <div style={{ background:"#0A1931", color:"#F39C12", padding:".85rem 1.2rem",
        fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:".95rem" }}>{title}</div>}
      <div style={{ padding:"1.4rem 1.2rem" }}>{children}</div>
    </div>
  );

  const Btn = ({ onClick, children, full, secondary, disabled }) => (
    <button onClick={onClick} disabled={disabled}
      style={{ flex:full?undefined:1, width:full?"100%":undefined,
        background:secondary?"#f0f4f8":disabled?"#ccc":"#F39C12",
        color:secondary?"#0A1931":"#0A1931", border:"none",
        padding:".9rem", borderRadius:8, fontWeight:800,
        cursor:disabled?"not-allowed":"pointer", fontSize:"1rem",
        fontFamily:"'Sora',sans-serif" }}>
      {children}
    </button>
  );

  // STEP 1
  const Step1 = () => (
    <div className="fade-up">
      <Panel title="📱 Step 1 — Select Device">
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:".8rem" }}>
          {SERVICES.map(s => (
            <button key={s.id} onClick={() => setDevice(s.id)}
              style={{ background:device===s.id?"rgba(243,156,18,.12)":"#f7fafc",
                border:device===s.id?"2px solid #F39C12":"1.5px solid #dde8f0",
                borderRadius:12, padding:"1.2rem .8rem", cursor:"pointer", textAlign:"center" }}>
              <div style={{ fontSize:"1.8rem", marginBottom:".4rem" }}>{s.icon}</div>
              <div style={{ fontWeight:700, color:"#0A1931", fontSize:".85rem" }}>{s.label}</div>
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="👨‍🔧 Choose Technician (Optional)">
        <div style={{ display:"flex", flexDirection:"column", gap:".8rem" }}>
          {TECHNICIANS.map(t => (
            <div key={t.id} onClick={() => setTech(t)}
              style={{ border:tech?.id===t.id?"2px solid #F39C12":"1.5px solid #dde8f0",
                background:tech?.id===t.id?"rgba(243,156,18,.06)":"#f9fbfc",
                borderRadius:12, padding:"1rem", cursor:"pointer",
                display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
              <div>
                <div style={{ fontWeight:700, color:"#0A1931", fontSize:".95rem" }}>
                  {t.name}
                  <span style={{ background:"#F39C12", color:"#0A1931", fontSize:".65rem",
                    fontWeight:800, padding:"2px 7px", borderRadius:99, marginLeft:8 }}>{t.badge}</span>
                </div>
                <div style={{ color:"#7F8C8D", fontSize:".8rem", marginTop:2 }}>⭐ {t.rating} · {t.jobs} jobs · {t.dist}</div>
                <div style={{ display:"flex", gap:4, marginTop:4, flexWrap:"wrap" }}>
                  {t.specialty.map(sp => (
                    <span key={sp} style={{ background:"#EBF5FB", color:"#1A5276",
                      fontSize:".68rem", padding:"2px 8px", borderRadius:99 }}>{sp}</span>
                  ))}
                </div>
              </div>
              {tech?.id===t.id && <span style={{ color:"#F39C12", fontWeight:800, fontSize:"1.2rem" }}>✓</span>}
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="👤 Your Details">
        <div style={{ display:"flex", flexDirection:"column", gap:".8rem" }}>
          <div>
            <label style={{ fontSize:".82rem", color:"#5a7a8a", fontWeight:600, display:"block", marginBottom:4 }}>Full Name</label>
            <input ref={nameRef} defaultValue="" placeholder="e.g. Juma Hassan" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize:".82rem", color:"#5a7a8a", fontWeight:600, display:"block", marginBottom:4 }}>Phone (M-Pesa / Airtel)</label>
            <input ref={phoneRef} defaultValue="" placeholder="+255 7XX XXX XXX" style={inputStyle} type="tel" />
          </div>
        </div>
      </Panel>

      <Btn full onClick={() => {
        if (!device) { showToast("⚠️ Please select a device", "error"); return; }
        if (!phoneRef.current?.value) { showToast("⚠️ Please enter your phone number", "error"); return; }
        setStep(2);
      }}>Next: Describe Problem →</Btn>
    </div>
  );

  // STEP 2
  const Step2 = () => (
    <div className="fade-up">
      <Panel title="🔍 Step 2 — Describe the Problem">
        <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
          <div>
            <label style={{ fontSize:".82rem", color:"#5a7a8a", fontWeight:600, display:"block", marginBottom:4 }}>Problem Description *</label>
            <textarea ref={problemRef} defaultValue="" rows={4}
              placeholder="e.g. Screen cracked after falling. Touch still works but has lines..."
              style={{ ...inputStyle, resize:"vertical" }} />
          </div>
          <div>
            <label style={{ fontSize:".82rem", color:"#5a7a8a", fontWeight:600, display:"block", marginBottom:4 }}>Appointment Date</label>
            <input type="date" value={date} min={tomorrow()} onChange={e => setDate(e.target.value)} style={inputStyle} />
          </div>
          {price && (
            <div style={{ background:"#EBF5FB", borderRadius:8, padding:".8rem 1rem", fontSize:".82rem", color:"#1A5276" }}>
              ℹ️ Estimated quote for <strong>{device}</strong>: <strong>{fmt(price.total)}</strong>
            </div>
          )}
        </div>
      </Panel>
      <div style={{ display:"flex", gap:".8rem" }}>
        <Btn secondary onClick={() => setStep(1)}>← Back</Btn>
        <Btn onClick={() => {
          if (!problemRef.current?.value.trim()) { showToast("⚠️ Please describe the problem", "error"); return; }
          setStep(3);
        }}>Next: See Quote →</Btn>
      </div>
    </div>
  );

  // STEP 3
  const Step3 = () => {
    const p = price || calcPrice("Other");
    const Row = ({label, val, bold}) => (
      <div style={{ display:"flex", justifyContent:"space-between", padding:".6rem 0", borderBottom:"1px solid #f0f4f8" }}>
        <span style={{ color:"#7F8C8D", fontSize:".88rem" }}>{label}</span>
        <span style={{ fontWeight:bold?800:600, color:bold?"#0A1931":"#2C3E50", fontSize:bold?"1rem":".9rem" }}>{val}</span>
      </div>
    );
    return (
      <div className="fade-up">
        <Panel title="💰 Step 3 — Your Quote">
          <Row label="Device" val={device} />
          <Row label="Technician" val={tech?.name || "Auto-assigned"} />
          <Row label="Appointment" val={date} />
          <div style={{ marginTop:"1rem", background:"#f7fafc", borderRadius:8, padding:"1rem" }}>
            <Row label="Labour Fee" val={fmt(p.labour)} />
            <Row label="Parts Estimate" val={fmt(p.parts)} />
            <Row label="Service Fee" val={fmt(p.fee)} />
            <Row label="TOTAL" val={fmt(p.total)} bold />
          </div>
          <div style={{ marginTop:".8rem", background:"rgba(39,174,96,.1)",
            border:"1px solid rgba(39,174,96,.3)", borderRadius:8, padding:".7rem 1rem",
            fontSize:".8rem", color:"#1E8449" }}>
            ✅ No hidden charges · Final price confirmed before repair starts
          </div>
        </Panel>
        <div style={{ display:"flex", gap:".8rem" }}>
          <Btn secondary onClick={() => setStep(2)}>← Back</Btn>
          <Btn onClick={() => setStep(4)}>Confirm & Pay →</Btn>
        </div>
      </div>
    );
  };

  // STEP 4
  const Step4 = () => {
    const p = price || calcPrice("Other");
    const [processing, setProcessing] = useState(false);
    const METHODS = [
      { id:"mpesa",  icon:"📲", label:"M-Pesa",          desc:"Lipa Na M-Pesa",              provider:"Flutterwave" },
      { id:"airtel", icon:"📱", label:"Airtel Money",     desc:"Airtel / Tigo Pesa",          provider:"Flutterwave" },
      { id:"card",   icon:"💳", label:"Visa/Mastercard",  desc:"Secure 3D payment",           provider:"Stripe" },
      { id:"flw",    icon:"🦋", label:"Flutterwave",      desc:"All methods via Flutterwave", provider:"Flutterwave" },
    ];
    const pay = () => {
      if (!payment) { showToast("⚠️ Select a payment method", "error"); return; }
      setProcessing(true);
      showToast("⏳ Processing payment...");
      setTimeout(() => {
        setTrackingId(genTrackId());
        setProcessing(false);
        setStep(5);
      }, 1800);
    };
    return (
      <div className="fade-up">
        <Panel title="💳 Step 4 — Payment">
          <div style={{ background:"#EBF5FB", borderRadius:8, padding:".8rem 1rem",
            marginBottom:"1rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ color:"#5a7a8a", fontSize:".88rem" }}>Amount Due</span>
            <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, color:"#0A1931", fontSize:"1.2rem" }}>{fmt(p.total)}</span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:".6rem" }}>
            {METHODS.map(m => (
              <div key={m.id} onClick={() => setPayment(m.id)}
                style={{ border:payment===m.id?"2px solid #F39C12":"1.5px solid #dde8f0",
                  background:payment===m.id?"rgba(243,156,18,.06)":"#f9fbfc",
                  borderRadius:10, padding:".9rem 1rem", cursor:"pointer",
                  display:"flex", alignItems:"center", gap:".8rem" }}>
                <span style={{ fontSize:"1.5rem" }}>{m.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:"#0A1931", fontSize:".9rem" }}>{m.label}</div>
                  <div style={{ color:"#7F8C8D", fontSize:".75rem" }}>{m.desc}</div>
                </div>
                <span style={{ background:"#EBF5FB", color:"#1A5276", fontSize:".68rem",
                  padding:"2px 8px", borderRadius:99, fontWeight:600 }}>{m.provider}</span>
              </div>
            ))}
          </div>
          {payment && ["mpesa","airtel"].includes(payment) && (
            <div style={{ marginTop:".8rem", background:"rgba(243,156,18,.08)",
              border:"1px solid rgba(243,156,18,.3)", borderRadius:8, padding:".8rem 1rem",
              fontSize:".82rem", color:"#8a5500" }}>
              📲 A payment prompt will be sent to your phone. Enter your PIN to confirm.
            </div>
          )}
        </Panel>
        <div style={{ display:"flex", gap:".8rem" }}>
          <Btn secondary onClick={() => setStep(3)}>← Back</Btn>
          <Btn onClick={pay} disabled={processing}>{processing ? "Processing..." : `Pay ${fmt(p.total)} →`}</Btn>
        </div>
      </div>
    );
  };

  // STEP 5
  const Step5 = () => (
    <div className="fade-up" style={{ textAlign:"center" }}>
      <Panel>
        <div style={{ fontSize:"3.5rem", marginBottom:"1rem" }}>🎉</div>
        <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:"1.4rem",
          color:"#0A1931", marginBottom:".5rem" }}>Booking Confirmed!</div>
        <div style={{ color:"#7F8C8D", fontSize:".9rem", marginBottom:"1.5rem" }}>
          SMS confirmation sent to your phone
        </div>
        <div style={{ background:"#EBF5FB", border:"2px solid #F39C12",
          borderRadius:12, padding:"1.2rem", marginBottom:"1.5rem" }}>
          <div style={{ color:"#7F8C8D", fontSize:".8rem", marginBottom:4 }}>YOUR TRACKING ID</div>
          <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800,
            fontSize:"1.5rem", color:"#F39C12", letterSpacing:".05em" }}>{trackingId}</div>
          <div style={{ color:"#5a7a8a", fontSize:".78rem", marginTop:4 }}>Save this to track your repair</div>
        </div>
        {TRACK_STAGES.map((s, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:".8rem",
            textAlign:"left", marginBottom:".6rem", opacity:i>1?.5:1 }}>
            <div style={{ width:28, height:28, borderRadius:"50%", flexShrink:0,
              background:i<2?"#27AE60":"#dde8f0", display:"flex", alignItems:"center",
              justifyContent:"center", color:i<2?"#fff":"#7F8C8D", fontWeight:700, fontSize:".85rem" }}>
              {i<2?"✓":i+1}
            </div>
            <div>
              <div style={{ fontWeight:600, color:"#0A1931", fontSize:".88rem" }}>{s.label}</div>
              <div style={{ color:"#7F8C8D", fontSize:".75rem" }}>{i<2?"Done":"Pending"}</div>
            </div>
          </div>
        ))}
        <button onClick={() => { go("home"); setStep(1); setDevice(null); setTech(null); setPayment(null); }}
          style={{ marginTop:"1.5rem", width:"100%", background:"#0A1931", color:"#F39C12",
            border:"none", padding:".9rem", borderRadius:8, fontWeight:700, cursor:"pointer", fontSize:".95rem" }}>
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

// ─── TRACKING ──────────────────────────────────────────────
function TrackingPage({ showToast }) {
  const inputRef = useRef();
  const [result, setResult] = useState(null);
  const DEMO = {
    trackingId:"SFX-2026-00847", device:"Laptop", technician:"John Mwangi", status:"In Progress",
    timeline:[
      { stage:1, label:"Booking Confirmed",   time:"3 Jun 2026, 08:42 AM", done:true },
      { stage:2, label:"Technician Assigned", time:"3 Jun 2026, 09:15 AM", done:true },
      { stage:3, label:"Repair In Progress",  time:"In progress now",       done:false, active:true },
      { stage:4, label:"Quality Check",       time:"Pending",               done:false },
      { stage:5, label:"Repair Complete",     time:"Pending",               done:false },
    ]
  };
  const track = () => {
    if (!inputRef.current?.value.trim()) { showToast("⚠️ Enter a tracking ID", "error"); return; }
    setResult(DEMO);
    showToast("✅ Repair found!");
  };
  return (
    <div style={{ background:"#EBF5FB", minHeight:"calc(100vh - 60px)", padding:"2rem 1rem" }}>
      <div style={{ maxWidth:580, margin:"0 auto" }}>
        <div style={{ background:"#fff", borderRadius:14, overflow:"hidden",
          boxShadow:"0 4px 24px rgba(0,0,0,.08)", marginBottom:"1rem" }}>
          <div style={{ background:"#0A1931", color:"#F39C12", padding:".85rem 1.2rem",
            fontFamily:"'Sora',sans-serif", fontWeight:700 }}>📍 Track Your Repair</div>
          <div style={{ padding:"1.4rem 1.2rem" }}>
            <label style={{ fontSize:".82rem", color:"#5a7a8a", fontWeight:600, display:"block", marginBottom:6 }}>Tracking ID</label>
            <div style={{ display:"flex", gap:".6rem" }}>
              <input ref={inputRef} defaultValue="SFX-2026-00847" placeholder="e.g. SFX-2026-00847" style={{ ...inputStyle, flex:1 }} />
              <button onClick={track}
                style={{ background:"#F39C12", color:"#0A1931", border:"none",
                  padding:".7rem 1.2rem", borderRadius:8, fontWeight:700, cursor:"pointer" }}>
                Track →
              </button>
            </div>
          </div>
        </div>
        {result && (
          <div className="fade-up" style={{ background:"#fff", borderRadius:14,
            boxShadow:"0 4px 24px rgba(0,0,0,.08)", padding:"1.4rem 1.2rem" }}>
            {[["Tracking ID",result.trackingId],["Device",result.device],["Technician",result.technician]].map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between",
                padding:".5rem 0", borderBottom:"1px solid #f0f4f8" }}>
                <span style={{ color:"#7F8C8D", fontSize:".85rem" }}>{k}</span>
                <span style={{ fontWeight:600, color:"#0A1931", fontSize:".85rem" }}>{v}</span>
              </div>
            ))}
            <div style={{ display:"flex", justifyContent:"space-between",
              padding:".5rem 0", marginBottom:"1rem", borderBottom:"1px solid #f0f4f8" }}>
              <span style={{ color:"#7F8C8D", fontSize:".85rem" }}>Status</span>
              <span style={{ background:"#F39C12", color:"#0A1931", padding:"2px 10px",
                borderRadius:99, fontWeight:700, fontSize:".8rem" }}>{result.status}</span>
            </div>
            {result.timeline.map((t, i) => (
              <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:".8rem", marginBottom:".8rem" }}>
                <div style={{ width:30, height:30, borderRadius:"50%", flexShrink:0,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontWeight:700, fontSize:".8rem",
                  background:t.done?"#27AE60":t.active?"#F39C12":"#e0eaf2",
                  color:t.done||t.active?"#fff":"#aaa" }}>
                  {t.done?"✓":t.active?"→":t.stage}
                </div>
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

// ─── ADMIN ─────────────────────────────────────────────────
function AdminPage() {
  const stats = [
    { icon:"📋", label:"Total Bookings", val:"2,418", color:"#1A5276" },
    { icon:"✅", label:"Completed",      val:"2,105", color:"#27AE60" },
    { icon:"🔧", label:"In Progress",    val:"243",   color:"#F39C12" },
    { icon:"💰", label:"Revenue (TZS)",  val:"87.4M", color:"#8e44ad" },
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
        <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:"1.4rem",
          color:"#0A1931", marginBottom:"1.2rem" }}>📊 Admin Dashboard</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",
          gap:"1rem", marginBottom:"1.5rem" }}>
          {stats.map(s => (
            <div key={s.label} style={{ background:"#fff", borderRadius:12, padding:"1.2rem",
              boxShadow:"0 2px 12px rgba(0,0,0,.07)", borderLeft:`4px solid ${s.color}` }}>
              <div style={{ fontSize:"1.6rem", marginBottom:".4rem" }}>{s.icon}</div>
              <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800,
                fontSize:"1.5rem", color:s.color }}>{s.val}</div>
              <div style={{ color:"#7F8C8D", fontSize:".8rem" }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ background:"#fff", borderRadius:14, overflow:"hidden",
          boxShadow:"0 4px 24px rgba(0,0,0,.08)" }}>
          <div style={{ background:"#0A1931", color:"#F39C12", padding:".85rem 1.2rem",
            fontFamily:"'Sora',sans-serif", fontWeight:700 }}>Recent Bookings</div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"#f4f8fb" }}>
                  {["Tracking ID","Customer","Device","Status","Amount (TZS)"].map(h => (
                    <th key={h} style={{ padding:".7rem 1rem", textAlign:"left",
                      fontSize:".78rem", color:"#5a7a8a", fontWeight:700,
                      borderBottom:"1px solid #e8eef4" }}>{h}</th>
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
                      <span style={{ background:statusColor[r.status]+"22",
                        color:statusColor[r.status], padding:"3px 10px",
                        borderRadius:99, fontSize:".75rem", fontWeight:700 }}>{r.status}</span>
                    </td>
                    <td style={{ padding:".8rem 1rem", fontSize:".85rem", fontWeight:700, color:"#0A1931" }}>{r.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
