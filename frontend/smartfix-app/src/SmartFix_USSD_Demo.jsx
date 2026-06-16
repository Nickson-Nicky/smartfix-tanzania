import { useState, useRef, useEffect } from "react";

const STEPS = [
  {
    id: 0,
    isDialer: true,
  },
  {
    id: 1,
    header: "CON",
    body: `Welcome to SmartFix Tanzania\n\nYour Device Repair Platform\n\n1. Book a Repair\n2. Track Repair\n3. Pay for Repair\n0. Exit`,
    placeholder: "Enter option (e.g. 3)",
    expected: "3",
  },
  {
    id: 2,
    header: "CON",
    body: `SmartFix Payments\n\nEnter your Tracking ID:\ne.g. SFX-2026-00847`,
    placeholder: "Enter Tracking ID",
    expected: "SFX-2026-00847",
  },
  {
    id: 3,
    header: "CON",
    body: `Order #SFX-2026-00847\n- Laptop Screen Repair\nTotal: TZS 50,000\nDelivery: FREE\nGrand Total: TZS 50,000\n\n1. Pay Now\n0. Cancel`,
    placeholder: "Enter option (1 to Pay)",
    expected: "1",
  },
  {
    id: 4,
    header: "CON",
    body: `Select Payment Method:\n\n1. M-Pesa (Vodacom)\n2. Airtel Money\n3. Tigo Pesa\n0. Cancel`,
    placeholder: "Enter option (e.g. 1)",
    expected: "1",
  },
  {
    id: 5,
    header: "CON",
    body: `M-Pesa Payment\n\nEnter your M-Pesa PIN to confirm\npayment of TZS 50,000 to\nSmartFix Tanzania:`,
    placeholder: "Enter PIN",
    isPin: true,
    expected: "any",
  },
  {
    id: 6,
    header: "END",
    body: `✓ Payment Successful!\n\nAmount: TZS 50,000\nRef: SFX-MPE-2026-847\n\nThank you for using\nSmartFix Tanzania!\nYour repair is confirmed.`,
    isFinal: true,
  },
];

const DIALER_KEYS = ["1","2","3","4","5","6","7","8","9","*","0","#"];

export default function USSDDemo() {
  const [screen, setScreen]     = useState(0);
  const [dialCode, setDialCode] = useState("");
  const [userInput, setUserInput] = useState("");
  const [animKey, setAnimKey]   = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoStep, setAutoStep] = useState(0);
  const [error, setError]       = useState("");
  const inputRef = useRef();

  const AUTO_INPUTS = ["*150*00#", "3", "SFX-2026-00847", "1", "1", "1234"];

  // Auto focus input when screen changes
  useEffect(() => {
    if (screen > 0 && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [screen]);

  // Auto demo
  useEffect(() => {
    if (!autoPlay) return;
    const targetInput = AUTO_INPUTS[autoStep];
    if (!targetInput) return;

    let typed = "";
    let i = 0;
    const delay = autoStep === 0 ? 150 : 100;

    const t = setInterval(() => {
      typed += targetInput[i];
      if (autoStep === 0) setDialCode(typed);
      else setUserInput(typed);
      i++;
      if (i >= targetInput.length) {
        clearInterval(t);
        setTimeout(() => {
          if (autoStep === 0) {
            setScreen(1);
            setDialCode("");
            setAnimKey(k => k+1);
          } else {
            setScreen(s => s+1);
            setAnimKey(k => k+1);
          }
          setUserInput("");
          setAutoStep(s => s+1);
        }, 700);
      }
    }, delay);
    return () => clearInterval(t);
  }, [autoPlay, autoStep]);

  const reset = () => {
    setScreen(0); setDialCode(""); setUserInput("");
    setAutoPlay(false); setAutoStep(0); setAnimKey(k=>k+1); setError("");
  };

  const handleSend = () => {
    setError("");
    if (screen === 0) {
      if (!dialCode) { setError("Enter USSD code first!"); return; }
      if (dialCode !== "*150*00#") { setError("Wrong code! Try *150*00#"); return; }
      setScreen(1); setDialCode(""); setAnimKey(k=>k+1); return;
    }
    const cur = STEPS[screen];
    if (!userInput.trim()) { setError("Please enter something!"); return; }
    setScreen(s => s+1);
    setUserInput("");
    setAnimKey(k=>k+1);
  };

  const handleKey = (e) => { if (e.key === "Enter") handleSend(); };

  const cur = STEPS[screen];

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(135deg,#0A1931 0%,#0e2a4a 60%,#142a3a 100%)",
      display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", padding:"2rem 1rem",
      fontFamily:"'DM Sans',sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;700&family=Share+Tech+Mono&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        .screen-anim{animation:fadeIn .3s ease forwards;}
        .cursor{animation:blink 1s infinite;}
        .dial-key:active{transform:scale(.92);background:rgba(255,255,255,.25)!important;}
        .ussd-input{
          width:100%; background:#111; border:1.5px solid #F39C12;
          border-radius:8px; padding:10px 12px; color:#F39C12;
          font-family:'Share Tech Mono',monospace; font-size:.9rem;
          letter-spacing:1px; outline:none;
        }
        .ussd-input::placeholder{color:#555;}
        .ussd-input:focus{border-color:#fff; box-shadow:0 0 0 2px rgba(243,156,18,.3);}
      `}</style>

      {/* Title */}
      <div style={{ textAlign:"center", marginBottom:"1.5rem" }}>
        <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800,
          fontSize:"clamp(1.3rem,4vw,1.8rem)", color:"#fff" }}>
          ⚙️ SmartFix <span style={{color:"#F39C12"}}>USSD Demo</span>
        </div>
        <div style={{ color:"#94b5cc", fontSize:".85rem", marginTop:".3rem" }}>
          Dial <span style={{color:"#F39C12",fontWeight:700}}>*150*00#</span> · Works on ANY phone · No internet needed
        </div>
      </div>

      <div style={{ display:"flex", gap:"2rem", flexWrap:"wrap", justifyContent:"center", alignItems:"flex-start" }}>

        {/* ── PHONE MOCKUP ── */}
        <div style={{
          width:270, background:"#1a1a2e", borderRadius:40, padding:"10px",
          boxShadow:"0 30px 80px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.1)",
          border:"2px solid rgba(255,255,255,.08)",
        }}>
          {/* Speaker grille */}
          <div style={{ width:55, height:5, background:"#333", borderRadius:3, margin:"0 auto 8px" }} />

          {/* Screen */}
          <div style={{ background:"#000", borderRadius:22, overflow:"hidden", minHeight:460,
            display:"flex", flexDirection:"column" }}>

            {/* Status bar */}
            <div style={{ background:"#111", padding:"6px 14px",
              display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ color:"#fff", fontSize:".65rem", fontWeight:700 }}>
                {new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
              </span>
              <span style={{ color:"#F39C12", fontSize:".6rem", fontWeight:700 }}>Africa's Talking</span>
              <span style={{ color:"#fff", fontSize:".65rem" }}>📶🔋</span>
            </div>

            {/* App bar */}
            <div style={{ background:"#F39C12", padding:"6px 14px", textAlign:"center" }}>
              <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:800,
                fontSize:".75rem", color:"#0A1931" }}>⚙️ SMARTFIX TANZANIA</span>
            </div>

            {/* Content area */}
            <div style={{ flex:1, padding:"12px", display:"flex", flexDirection:"column", gap:8 }}>

              {screen === 0 ? (
                // ── DIALER SCREEN ──
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  <div style={{ color:"#888", fontSize:".65rem", textAlign:"center" }}>Enter USSD Code</div>

                  {/* Code display */}
                  <div style={{ background:"#111", borderRadius:8, padding:"10px",
                    textAlign:"center", border:"1px solid #333", minHeight:40,
                    display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontFamily:"'Share Tech Mono',monospace",
                      color:"#F39C12", fontSize:"1.1rem", letterSpacing:2 }}>
                      {dialCode || <span style={{color:"#333"}}>*___*__#</span>}
                    </span>
                    {dialCode && <span className="cursor" style={{color:"#F39C12",marginLeft:2}}>|</span>}
                  </div>

                  {/* Dialer grid */}
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:5 }}>
                    {DIALER_KEYS.map(d => (
                      <button key={d} className="dial-key"
                        onClick={() => setDialCode(p => p + d)}
                        style={{ background:"rgba(255,255,255,.08)", border:"none",
                          borderRadius:7, padding:"9px", color:"#fff",
                          fontSize:".95rem", fontWeight:700, cursor:"pointer",
                          transition:"all .1s", fontFamily:"'Share Tech Mono',monospace" }}>
                        {d}
                      </button>
                    ))}
                  </div>

                  {error && <div style={{ color:"#e74c3c", fontSize:".7rem", textAlign:"center" }}>{error}</div>}
                </div>

              ) : (
                // ── USSD SCREENS ──
                <div key={animKey} className="screen-anim" style={{ display:"flex", flexDirection:"column", gap:8, flex:1 }}>

                  {/* CON / END tag */}
                  <div style={{ background: cur.header==="END"?"#1E8449":"#1A5276",
                    borderRadius:4, padding:"2px 7px", alignSelf:"flex-start" }}>
                    <span style={{ color:"#fff", fontSize:".6rem", fontWeight:700,
                      fontFamily:"'Share Tech Mono',monospace" }}>{cur.header}</span>
                  </div>

                  {/* USSD body text */}
                  <div style={{ background:"#0d0d0d", borderRadius:8, padding:"10px",
                    border:"1px solid #222", flex:1 }}>
                    <pre style={{ color:"#e0e0e0", fontSize:".68rem", lineHeight:1.75,
                      fontFamily:"'Share Tech Mono',monospace", whiteSpace:"pre-wrap",
                      wordBreak:"break-word" }}>
                      {cur.body}
                    </pre>
                  </div>

                  {/* Input field — visible on all non-final screens */}
                  {!cur.isFinal && (
                    <div>
                      <input
                        ref={inputRef}
                        className="ussd-input"
                        type={cur.isPin ? "password" : "text"}
                        value={userInput}
                        onChange={e => { setUserInput(e.target.value); setError(""); }}
                        onKeyDown={handleKey}
                        placeholder={cur.placeholder}
                        autoFocus
                      />
                      {error && <div style={{ color:"#e74c3c", fontSize:".68rem", marginTop:4 }}>{error}</div>}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom buttons */}
            <div style={{ padding:"0 10px 10px", display:"flex", gap:6 }}>
              <button onClick={() => screen===0 ? setDialCode(p=>p.slice(0,-1)) : reset()}
                style={{ flex:1, background:"#c0392b", border:"none", borderRadius:8,
                  padding:"9px", color:"#fff", fontWeight:700, fontSize:".75rem", cursor:"pointer" }}>
                {screen===0 ? "⌫ DEL" : "✕ CANCEL"}
              </button>
              {!cur?.isFinal && (
                <button onClick={handleSend}
                  style={{ flex:1, background:"#F39C12", border:"none", borderRadius:8,
                    padding:"9px", color:"#0A1931", fontWeight:800,
                    fontSize:".75rem", cursor:"pointer" }}>
                  SEND ▶
                </button>
              )}
              {cur?.isFinal && (
                <button onClick={reset}
                  style={{ flex:1, background:"#27AE60", border:"none", borderRadius:8,
                    padding:"9px", color:"#fff", fontWeight:800,
                    fontSize:".75rem", cursor:"pointer" }}>
                  ↺ NEW
                </button>
              )}
            </div>
          </div>

          {/* Home button */}
          <div style={{ width:36, height:36, borderRadius:"50%", background:"#222",
            border:"2px solid #333", margin:"8px auto 2px",
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ width:14, height:14, borderRadius:3, background:"#444" }} />
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ maxWidth:300, display:"flex", flexDirection:"column", gap:"1rem" }}>

          {/* Auto demo */}
          <div style={{ background:"rgba(243,156,18,.1)", border:"1.5px solid rgba(243,156,18,.4)",
            borderRadius:14, padding:"1.2rem" }}>
            <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:700,
              color:"#F39C12", fontSize:".95rem", marginBottom:".4rem" }}>🎬 Auto Demo</div>
            <div style={{ color:"#94b5cc", fontSize:".78rem", lineHeight:1.6, marginBottom:".8rem" }}>
              Watch the full payment flow automatically — perfect for judges!
            </div>
            <button onClick={() => { reset(); setTimeout(() => setAutoPlay(true), 200); }}
              style={{ width:"100%", background:"#F39C12", color:"#0A1931", border:"none",
                padding:".8rem", borderRadius:8, fontWeight:800, fontSize:".95rem",
                cursor:"pointer", fontFamily:"'Sora',sans-serif", marginBottom:6 }}>
              ▶ Play Full Demo
            </button>
            <button onClick={reset}
              style={{ width:"100%", background:"transparent", color:"#94b5cc",
                border:"1px solid rgba(255,255,255,.15)", padding:".55rem",
                borderRadius:8, fontWeight:600, fontSize:".82rem", cursor:"pointer" }}>
              ↺ Reset
            </button>
          </div>

          {/* Steps tracker */}
          <div style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)",
            borderRadius:14, padding:"1.2rem" }}>
            <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:700,
              color:"#fff", fontSize:".88rem", marginBottom:".8rem" }}>📋 Steps</div>
            {[
              ["Dial *150*00#","Use phone keypad"],
              ["Choose Pay","Option 3"],
              ["Enter Order ID","Your tracking ID"],
              ["Confirm Amount","Review total"],
              ["Select Network","M-Pesa / Airtel / Tigo"],
              ["Enter PIN","Secure confirmation"],
              ["Done ✓","Payment confirmed!"],
            ].map(([title, desc], i) => (
              <div key={i} style={{ display:"flex", gap:".7rem", marginBottom:".65rem",
                opacity: screen >= i ? 1 : .35, transition:"opacity .3s" }}>
                <div style={{ width:22, height:22, borderRadius:"50%", flexShrink:0,
                  background: screen > i ? "#27AE60" : screen === i ? "#F39C12" : "rgba(255,255,255,.08)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:".62rem", fontWeight:800,
                  color: screen >= i ? "#fff" : "#555" }}>
                  {screen > i ? "✓" : i+1}
                </div>
                <div>
                  <div style={{ color:"#fff", fontSize:".78rem", fontWeight:600 }}>{title}</div>
                  <div style={{ color:"#7a9ab0", fontSize:".68rem" }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Networks */}
          <div style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)",
            borderRadius:14, padding:"1.2rem" }}>
            <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:700,
              color:"#fff", fontSize:".88rem", marginBottom:".7rem" }}>📱 Networks</div>
            <div style={{ display:"flex", gap:".5rem", flexWrap:"wrap" }}>
              {[["🟢","M-Pesa"],["🔴","Airtel"],["🔵","Tigo"]].map(([e,n]) => (
                <div key={n} style={{ background:"rgba(255,255,255,.06)", borderRadius:8,
                  padding:".5rem .8rem", flex:1, textAlign:"center" }}>
                  <div style={{ fontSize:"1rem" }}>{e}</div>
                  <div style={{ color:"#fff", fontSize:".72rem", fontWeight:700 }}>{n}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div style={{ background:"rgba(39,174,96,.08)", border:"1px solid rgba(39,174,96,.25)",
            borderRadius:12, padding:"1rem" }}>
            <div style={{ color:"#27AE60", fontSize:".75rem", lineHeight:1.8 }}>
              ✅ Works on <strong>any phone</strong> — no internet!<br/>
              ✅ Even <strong>feature phones</strong> can pay<br/>
              ✅ <strong>Instant SMS</strong> confirmation<br/>
              ✅ Powered by <strong>Africa's Talking</strong>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop:"1.5rem", color:"#5a7a8a", fontSize:".75rem", textAlign:"center" }}>
        ⚙️ SmartFix Tanzania · USSD Payment Demo · Africa's Talking API
      </div>
    </div>
  );
}
