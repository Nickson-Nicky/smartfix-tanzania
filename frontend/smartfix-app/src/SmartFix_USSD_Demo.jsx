import { useState, useEffect } from "react";

const SCREENS = [
  {
    id: 0,
    title: "Dial Code",
    content: null,
    isDialer: true,
  },
  {
    id: 1,
    title: "Welcome",
    content: {
      header: "CON",
      body: `Welcome to SmartFix Tanzania\n\nYour Device Repair Platform\n\n1. Book a Repair\n2. Track Repair\n3. Pay for Repair\n0. Exit`,
    },
    input: "",
    hint: "Type 3 to Pay",
  },
  {
    id: 2,
    title: "Enter Order",
    content: {
      header: "CON",
      body: `SmartFix Payments\n\nEnter your Order/Tracking ID:\ne.g. SFX-2026-00847`,
    },
    input: "SFX-2026-00847",
    hint: "Type your tracking ID",
  },
  {
    id: 3,
    title: "Order Found",
    content: {
      header: "CON",
      body: `Order #SFX-2026-00847\n- Laptop Screen Repair\nTotal: TZS 50,000\nDelivery: FREE\nGrand Total: TZS 50,000\n\n1. Pay Now\n0. Cancel`,
    },
    input: "",
    hint: "Type 1 to Pay Now",
  },
  {
    id: 4,
    title: "Select Network",
    content: {
      header: "CON",
      body: `Select Payment Method:\n\n1. M-Pesa (Vodacom)\n2. Airtel Money\n3. Tigo Pesa\n0. Cancel`,
    },
    input: "",
    hint: "Type 1 for M-Pesa",
  },
  {
    id: 5,
    title: "Enter PIN",
    content: {
      header: "CON",
      body: `M-Pesa Payment\n\nEnter your M-Pesa PIN to confirm payment of TZS 50,000 to SmartFix Tanzania:`,
    },
    input: "",
    hint: "Enter your PIN",
    isPin: true,
  },
  {
    id: 6,
    title: "Success",
    content: {
      header: "END",
      body: `✓ Payment Successful!\n\nAmount: TZS 50,000\nRef: SFX-MPE-2026-847\nDate: ${new Date().toLocaleDateString()}\n\nThank you for using SmartFix Tanzania!\nYour repair is confirmed.`,
    },
    input: "",
    hint: "",
    isFinal: true,
  },
];

const DIALER = ["1","2","3","4","5","6","7","8","9","*","0","#"];

export default function USSDDemo() {
  const [screen, setScreen]       = useState(0);
  const [input, setInput]         = useState("");
  const [pin, setPin]             = useState("");
  const [dialCode, setDialCode]   = useState("");
  const [typing, setTyping]       = useState(false);
  const [animKey, setAnimKey]     = useState(0);
  const [autoPlay, setAutoPlay]   = useState(false);
  const [autoStep, setAutoStep]   = useState(0);

  const AUTO_INPUTS = ["3", "SFX-2026-00847", "1", "1", "1234"];

  useEffect(() => {
    if (!autoPlay) return;
    if (autoStep === 0) {
      // dial the code
      let code = "";
      const chars = "*150*00#".split("");
      let i = 0;
      const t = setInterval(() => {
        code += chars[i];
        setDialCode(code);
        i++;
        if (i >= chars.length) {
          clearInterval(t);
          setTimeout(() => { setScreen(1); setAutoStep(1); setAnimKey(k=>k+1); }, 800);
        }
      }, 150);
      return () => clearInterval(t);
    }
    if (autoStep >= 1 && autoStep <= 5) {
      const targetInput = AUTO_INPUTS[autoStep - 1];
      let typed = "";
      let i = 0;
      setTyping(true);
      const t = setInterval(() => {
        typed += targetInput[i];
        if (autoStep === 5) setPin(typed); else setInput(typed);
        i++;
        if (i >= targetInput.length) {
          clearInterval(t);
          setTimeout(() => {
            setTyping(false);
            setTimeout(() => {
              setScreen(s => s + 1);
              setInput("");
              setPin("");
              setAnimKey(k => k+1);
              setAutoStep(s => s+1);
            }, 600);
          }, 400);
        }
      }, autoStep === 5 ? 300 : 120);
      return () => clearInterval(t);
    }
  }, [autoPlay, autoStep]);

  const reset = () => {
    setScreen(0); setInput(""); setPin("");
    setDialCode(""); setAutoPlay(false); setAutoStep(0); setAnimKey(k=>k+1);
  };

  const handleDial = (d) => {
    if (screen !== 0) return;
    setDialCode(p => p + d);
  };

  const handleSend = () => {
    if (screen === 0) { if (dialCode) { setScreen(1); setAnimKey(k=>k+1); setDialCode(""); } return; }
    if (screen >= 1 && screen <= 5) {
      setScreen(s => s+1);
      setInput("");
      setPin("");
      setAnimKey(k=>k+1);
    }
  };

  const handleCancel = () => { if (screen === 0) setDialCode(p => p.slice(0,-1)); else reset(); };

  const cur = SCREENS[screen];

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(135deg,#0A1931 0%,#0e2a4a 60%,#142a3a 100%)",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:"2rem 1rem", fontFamily:"'DM Sans',sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;700&family=Share+Tech+Mono&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes glow{0%,100%{box-shadow:0 0 8px rgba(243,156,18,.4)}50%{box-shadow:0 0 20px rgba(243,156,18,.8)}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
        .screen-content{animation:fadeIn .3s ease forwards;}
        .cursor{animation:blink 1s infinite;}
        .btn-dial:hover{background:rgba(255,255,255,.2)!important;}
        .btn-dial:active{background:rgba(255,255,255,.35)!important;transform:scale(.95);}
        .send-btn:hover{background:#D68910!important;}
        .play-btn:hover{opacity:.9;}
      `}</style>

      {/* Header */}
      <div style={{ textAlign:"center", marginBottom:"2rem" }}>
        <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:"clamp(1.4rem,4vw,2rem)", color:"#fff" }}>
          ⚙️ SmartFix <span style={{color:"#F39C12"}}>USSD Demo</span>
        </div>
        <div style={{ color:"#94b5cc", fontSize:".88rem", marginTop:".4rem" }}>
          Dial <span style={{color:"#F39C12",fontWeight:700}}>*150*00#</span> to pay via M-Pesa, Airtel, or Tigo Pesa
        </div>
      </div>

      <div style={{ display:"flex", gap:"3rem", flexWrap:"wrap", justifyContent:"center", alignItems:"flex-start" }}>

        {/* Phone Mockup */}
        <div style={{
          width:280, background:"#1a1a2e",
          borderRadius:40, padding:"12px",
          boxShadow:"0 30px 80px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.1)",
          border:"2px solid rgba(255,255,255,.08)",
          position:"relative",
        }}>
          {/* Speaker */}
          <div style={{ width:60, height:6, background:"#333", borderRadius:3, margin:"0 auto 10px" }} />

          {/* Screen */}
          <div style={{
            background:"#000", borderRadius:24, overflow:"hidden",
            minHeight:420, display:"flex", flexDirection:"column",
          }}>
            {/* Status bar */}
            <div style={{ background:"#111", padding:"8px 16px", display:"flex",
              justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ color:"#fff", fontSize:".7rem", fontWeight:700 }}>
                {new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}
              </span>
              <span style={{ color:"#F39C12", fontSize:".65rem", fontWeight:700 }}>Africa's Talking</span>
              <span style={{ color:"#fff", fontSize:".7rem" }}>📶 🔋</span>
            </div>

            {/* App header */}
            <div style={{ background:"#F39C12", padding:"8px 16px", textAlign:"center" }}>
              <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:".8rem", color:"#0A1931" }}>
                ⚙️ SMARTFIX TANZANIA
              </div>
            </div>

            {/* USSD Content */}
            <div style={{ flex:1, padding:"16px", display:"flex", flexDirection:"column" }}>
              {screen === 0 ? (
                // Dialer screen
                <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12 }}>
                  <div style={{ color:"#888", fontSize:".7rem", textAlign:"center" }}>Enter USSD Code</div>
                  <div style={{
                    background:"#111", borderRadius:8, padding:"12px 16px",
                    minWidth:"100%", textAlign:"center", minHeight:44,
                    border:"1px solid #333", display:"flex", alignItems:"center", justifyContent:"center",
                  }}>
                    <span style={{ fontFamily:"'Share Tech Mono',monospace", color:"#F39C12", fontSize:"1.2rem", letterSpacing:2 }}>
                      {dialCode || <span style={{color:"#444"}}>*___*__#</span>}
                    </span>
                    {dialCode && <span className="cursor" style={{color:"#F39C12",marginLeft:2}}>|</span>}
                  </div>
                  {/* Dialer */}
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6, width:"100%" }}>
                    {DIALER.map(d => (
                      <button key={d} className="btn-dial" onClick={() => handleDial(d)}
                        style={{ background:"rgba(255,255,255,.08)", border:"none", borderRadius:8,
                          padding:"10px", color:"#fff", fontSize:"1rem", fontWeight:700,
                          cursor:"pointer", transition:"all .1s", fontFamily:"'Share Tech Mono',monospace" }}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                // USSD screen
                <div key={animKey} className="screen-content" style={{ flex:1, display:"flex", flexDirection:"column" }}>
                  {/* USSD header tag */}
                  <div style={{ background: cur.content?.header==="END"?"#1E8449":"#1A5276",
                    borderRadius:4, padding:"2px 8px", alignSelf:"flex-start", marginBottom:8 }}>
                    <span style={{ color:"#fff", fontSize:".65rem", fontWeight:700,
                      fontFamily:"'Share Tech Mono',monospace" }}>
                      {cur.content?.header}
                    </span>
                  </div>

                  {/* USSD body */}
                  <div style={{ flex:1, background:"#0d0d0d", borderRadius:8, padding:"12px",
                    border:"1px solid #222", marginBottom:10 }}>
                    <pre style={{ color:"#e0e0e0", fontSize:".72rem", lineHeight:1.7,
                      fontFamily:"'Share Tech Mono',monospace", whiteSpace:"pre-wrap",
                      wordBreak:"break-word" }}>
                      {cur.content?.body}
                    </pre>
                  </div>

                  {/* Input field */}
                  {!cur.isFinal && (
                    <div style={{ background:"#111", borderRadius:8, padding:"8px 12px",
                      border:"1px solid #F39C12", marginBottom:8, minHeight:36,
                      display:"flex", alignItems:"center" }}>
                      <span style={{ fontFamily:"'Share Tech Mono',monospace",
                        color: cur.isPin ? "#F39C12" : "#fff", fontSize:".85rem", letterSpacing: cur.isPin?4:1 }}>
                        {cur.isPin ? (pin ? "●".repeat(pin.length) : "") : input}
                      </span>
                      <span className="cursor" style={{color:"#F39C12", marginLeft:2}}>|</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div style={{ padding:"0 12px 12px", display:"flex", gap:8 }}>
              <button onClick={handleCancel}
                style={{ flex:1, background:"#c0392b", border:"none", borderRadius:8,
                  padding:"10px", color:"#fff", fontWeight:700, fontSize:".8rem", cursor:"pointer" }}>
                {screen===0 ? "⌫" : "CANCEL"}
              </button>
              {!cur?.isFinal && (
                <button className="send-btn" onClick={handleSend}
                  style={{ flex:1, background:"#F39C12", border:"none", borderRadius:8,
                    padding:"10px", color:"#0A1931", fontWeight:800, fontSize:".8rem",
                    cursor:"pointer", transition:"all .2s" }}>
                  SEND
                </button>
              )}
              {cur?.isFinal && (
                <button onClick={reset}
                  style={{ flex:1, background:"#27AE60", border:"none", borderRadius:8,
                    padding:"10px", color:"#fff", fontWeight:800, fontSize:".8rem", cursor:"pointer" }}>
                  NEW
                </button>
              )}
            </div>
          </div>

          {/* Home button */}
          <div style={{ width:40, height:40, borderRadius:"50%", background:"#222",
            border:"2px solid #333", margin:"10px auto 4px",
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ width:16, height:16, borderRadius:4, background:"#444" }} />
          </div>
        </div>

        {/* Right side — controls and info */}
        <div style={{ maxWidth:320, display:"flex", flexDirection:"column", gap:"1.2rem" }}>

          {/* Auto Demo Button */}
          <div style={{ background:"rgba(243,156,18,.1)", border:"1.5px solid rgba(243,156,18,.4)",
            borderRadius:16, padding:"1.4rem" }}>
            <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, color:"#F39C12",
              fontSize:"1rem", marginBottom:".5rem" }}>🎬 Auto Demo Mode</div>
            <div style={{ color:"#94b5cc", fontSize:".82rem", lineHeight:1.6, marginBottom:"1rem" }}>
              Watch the full M-Pesa payment flow automatically — perfect for showing judges!
            </div>
            <button className="play-btn" onClick={() => { reset(); setTimeout(() => { setAutoPlay(true); }, 100); }}
              style={{ width:"100%", background:"#F39C12", color:"#0A1931", border:"none",
                padding:".85rem", borderRadius:8, fontWeight:800, fontSize:"1rem",
                cursor:"pointer", fontFamily:"'Sora',sans-serif", transition:"all .2s" }}>
              ▶ Play Full Demo
            </button>
            <button onClick={reset}
              style={{ width:"100%", background:"transparent", color:"#94b5cc",
                border:"1px solid rgba(255,255,255,.15)", padding:".6rem", borderRadius:8,
                fontWeight:600, fontSize:".85rem", cursor:"pointer", marginTop:8 }}>
              ↺ Reset
            </button>
          </div>

          {/* Flow steps */}
          <div style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)",
            borderRadius:16, padding:"1.4rem" }}>
            <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, color:"#fff",
              fontSize:".9rem", marginBottom:"1rem" }}>📋 Payment Flow</div>
            {[
              ["1","Dial *150*00#","Customer dials USSD code"],
              ["2","Select Pay","Choose option 3 → Pay for Repair"],
              ["3","Enter Order ID","Type tracking ID e.g. SFX-2026-00847"],
              ["4","Confirm Amount","Review order total TZS 50,000"],
              ["5","Select Network","Choose M-Pesa / Airtel / Tigo"],
              ["6","Enter PIN","Secure PIN confirmation"],
              ["7","Done! ✓","Payment confirmed instantly"],
            ].map(([n, title, desc]) => (
              <div key={n} style={{ display:"flex", gap:".8rem", marginBottom:".8rem",
                opacity: screen >= parseInt(n)-1 ? 1 : .4, transition:"opacity .3s" }}>
                <div style={{ width:24, height:24, borderRadius:"50%", flexShrink:0,
                  background: screen >= parseInt(n) ? "#27AE60" : screen === parseInt(n)-1 ? "#F39C12" : "rgba(255,255,255,.1)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:".7rem", fontWeight:800,
                  color: screen >= parseInt(n)-1 ? "#fff" : "#555" }}>
                  {screen >= parseInt(n) ? "✓" : n}
                </div>
                <div>
                  <div style={{ color:"#fff", fontSize:".82rem", fontWeight:600 }}>{title}</div>
                  <div style={{ color:"#7a9ab0", fontSize:".72rem" }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Networks */}
          <div style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)",
            borderRadius:16, padding:"1.2rem" }}>
            <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, color:"#fff",
              fontSize:".9rem", marginBottom:".8rem" }}>📱 Supported Networks</div>
            <div style={{ display:"flex", gap:".6rem", flexWrap:"wrap" }}>
              {[["🟢","M-Pesa","Vodacom"],["🔴","Airtel Money","Airtel"],["🔵","Tigo Pesa","Tigo"]].map(([emoji,name,net]) => (
                <div key={name} style={{ background:"rgba(255,255,255,.06)", borderRadius:8,
                  padding:".5rem .8rem", flex:1, minWidth:80 }}>
                  <div style={{ fontSize:"1rem", marginBottom:2 }}>{emoji}</div>
                  <div style={{ color:"#fff", fontSize:".75rem", fontWeight:700 }}>{name}</div>
                  <div style={{ color:"#7a9ab0", fontSize:".68rem" }}>{net}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Note */}
          <div style={{ background:"rgba(39,174,96,.08)", border:"1px solid rgba(39,174,96,.25)",
            borderRadius:12, padding:"1rem" }}>
            <div style={{ color:"#27AE60", fontSize:".78rem", lineHeight:1.6 }}>
              ✅ <strong>Works on any phone</strong> — no internet needed!<br />
              ✅ <strong>No smartphone required</strong> — even feature phones<br />
              ✅ <strong>Instant confirmation</strong> via SMS<br />
              ✅ Powered by <strong>Africa's Talking API</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop:"2rem", color:"#5a7a8a", fontSize:".78rem", textAlign:"center" }}>
        ⚙️ SmartFix Tanzania · USSD Payment Demo · Powered by Africa's Talking
      </div>
    </div>
  );
}
