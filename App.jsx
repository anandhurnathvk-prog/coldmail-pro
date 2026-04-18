import { useState, useEffect, useRef } from "react";
import { Storage } from "./storage.js";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Mono:wght@300;400;500&family=Syne:wght@400;500;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#080808;--s1:#0f0f0f;--s2:#161616;--s3:#1e1e1e;
  --b1:#1f1f1f;--b2:#2a2a2a;--b3:#383838;
  --acc:#c8f545;--acc2:#ff6b2b;
  --tx:#f2efe9;--txm:#7a7a7a;--txd:#2e2e2e;
  --ok:#4ade80;--err:#f87171;--warn:#fbbf24;
}
html,body,#root{height:100%;background:var(--bg);color:var(--tx);font-family:'DM Mono',monospace;-webkit-font-smoothing:antialiased;}
button{cursor:pointer;font-family:'DM Mono',monospace;}
input,textarea{font-family:'DM Mono',monospace;}
::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:var(--b3);}

.auth-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;position:relative;overflow:hidden;}
.auth-bg{position:absolute;inset:0;background:radial-gradient(ellipse 70% 50% at 50% -10%,rgba(200,245,69,0.07) 0%,transparent 65%);}
.auth-dots{position:absolute;inset:0;background-image:radial-gradient(var(--b2) 1px,transparent 1px);background-size:32px 32px;opacity:0.6;}
.auth-card{position:relative;width:100%;max-width:400px;background:var(--s1);border:1px solid var(--b2);padding:44px 36px;animation:fadeUp 0.4s ease both;}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
.auth-brand{margin-bottom:28px;}
.auth-eyebrow{font-size:9px;letter-spacing:0.25em;text-transform:uppercase;color:var(--acc);margin-bottom:8px;}
.auth-title{font-family:'Syne',sans-serif;font-size:26px;font-weight:800;letter-spacing:-0.03em;line-height:1;}
.auth-title span{color:var(--acc);}
.auth-sub{font-size:11px;color:var(--txm);margin-top:6px;line-height:1.5;}
.auth-tabs{display:flex;border-bottom:1px solid var(--b2);margin-bottom:24px;}
.auth-tab{flex:1;padding:10px 0;background:none;border:none;color:var(--txm);font-size:11px;letter-spacing:0.12em;text-transform:uppercase;transition:color 0.15s;border-bottom:2px solid transparent;margin-bottom:-1px;}
.auth-tab:hover{color:var(--tx);}
.auth-tab.on{color:var(--acc);border-bottom-color:var(--acc);}
.f{margin-bottom:14px;}
.f label{display:block;font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:var(--txm);margin-bottom:6px;}
.f input{width:100%;background:var(--s2);border:1px solid var(--b2);color:var(--tx);font-size:12px;padding:10px 12px;outline:none;transition:border-color 0.15s;}
.f input:focus{border-color:var(--acc);}
.f input::placeholder{color:var(--txd);}
.auth-btn{width:100%;margin-top:6px;padding:13px;background:var(--acc);border:none;color:#000;font-family:'Syne',sans-serif;font-size:13px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;transition:all 0.2s;}
.auth-btn:hover:not(:disabled){background:#d9ff5a;transform:translateY(-1px);}
.auth-btn:disabled{background:var(--b2);color:var(--txm);cursor:not-allowed;}
.auth-err{margin-top:10px;padding:9px 12px;background:rgba(248,113,113,0.07);border:1px solid rgba(248,113,113,0.2);color:var(--err);font-size:11px;line-height:1.5;}
.auth-note{margin-top:20px;text-align:center;font-size:10px;color:var(--txm);}

.shell{height:100vh;display:flex;flex-direction:column;overflow:hidden;}
.topbar{display:flex;align-items:center;justify-content:space-between;padding:0 20px;height:52px;border-bottom:1px solid var(--b1);background:var(--bg);flex-shrink:0;}
.tb-left{display:flex;align-items:center;gap:14px;}
.tb-logo{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;letter-spacing:-0.03em;}
.tb-logo span{color:var(--acc);}
.tb-badge{padding:2px 8px;background:rgba(200,245,69,0.1);border:1px solid rgba(200,245,69,0.2);font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:var(--acc);}
.tb-right{display:flex;align-items:center;gap:10px;}
.tb-user{font-size:11px;color:var(--txm);}
.tb-user strong{color:var(--tx);}
.signout{padding:5px 11px;background:transparent;border:1px solid var(--b2);color:var(--txm);font-size:10px;letter-spacing:0.08em;text-transform:uppercase;transition:all 0.15s;}
.signout:hover{border-color:var(--err);color:var(--err);}

.body{flex:1;display:flex;overflow:hidden;}

.sidebar{width:260px;flex-shrink:0;border-right:1px solid var(--b1);display:flex;flex-direction:column;background:var(--s1);overflow:hidden;}
.sb-head{padding:16px;border-bottom:1px solid var(--b1);display:flex;align-items:center;justify-content:space-between;}
.sb-title{font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:var(--txm);}
.sb-count{font-size:9px;color:var(--txd);padding:2px 6px;background:var(--s2);border:1px solid var(--b1);}
.sb-search{padding:10px 12px;border-bottom:1px solid var(--b1);}
.sb-search input{width:100%;background:var(--s2);border:1px solid var(--b1);color:var(--tx);font-size:11px;padding:7px 10px;outline:none;transition:border-color 0.15s;}
.sb-search input:focus{border-color:var(--acc);}
.sb-search input::placeholder{color:var(--txd);}
.new-btn{margin:10px 12px;padding:10px;background:var(--acc);border:none;color:#000;font-family:'Syne',sans-serif;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;transition:all 0.2s;flex-shrink:0;}
.new-btn:hover{background:#d9ff5a;}
.hist-list{flex:1;overflow-y:auto;padding:6px;}
.hist-empty{padding:28px 12px;text-align:center;color:var(--txm);font-size:11px;line-height:1.8;white-space:pre-line;}
.hi{padding:12px;margin-bottom:2px;background:transparent;border:1px solid transparent;cursor:pointer;transition:all 0.15s;text-align:left;width:100%;display:block;}
.hi:hover{background:var(--s2);border-color:var(--b1);}
.hi.active{background:var(--s2);border-color:var(--b2);}
.hi-name{font-size:12px;color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:3px;}
.hi-co{font-size:10px;color:var(--txm);margin-bottom:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.hi-foot{display:flex;align-items:center;justify-content:space-between;}
.hi-tags{font-size:9px;color:var(--txd);text-transform:uppercase;letter-spacing:0.08em;}
.hi-del{padding:1px 5px;background:transparent;border:none;color:transparent;font-size:10px;transition:color 0.15s;}
.hi:hover .hi-del{color:var(--txm);}
.hi-del:hover{color:var(--err) !important;}

.editor{flex:1;display:flex;overflow:hidden;}
.form-wrap{width:340px;flex-shrink:0;border-right:1px solid var(--b1);display:flex;flex-direction:column;overflow:hidden;}
.form-scroll{flex:1;overflow-y:auto;padding:20px;}
.sec-label{font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:var(--txm);margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid var(--b1);display:flex;gap:7px;}
.sec-label .n{color:var(--acc);}
.field{margin-bottom:12px;}
.field label{display:flex;align-items:center;justify-content:space-between;font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:var(--txm);margin-bottom:5px;}
.req{color:var(--acc2);font-size:8px;}
.field input,.field textarea{width:100%;background:var(--s2);border:1px solid var(--b2);color:var(--tx);font-size:12px;padding:8px 11px;outline:none;transition:border-color 0.15s;resize:none;}
.field input:focus,.field textarea:focus{border-color:var(--acc);}
.field input::placeholder,.field textarea::placeholder{color:var(--txd);}
.field input.verr,.field textarea.verr{border-color:var(--err);}
.ferr{font-size:9px;color:var(--err);margin-top:3px;}
.fhint{font-size:9px;color:var(--txd);margin-top:3px;line-height:1.5;}
.fchar{font-size:9px;color:var(--txd);text-align:right;margin-top:2px;}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.tg{display:flex;gap:2px;background:var(--s3);border:1px solid var(--b2);padding:2px;}
.tgb{flex:1;padding:6px 3px;background:transparent;border:none;color:var(--txm);font-family:'DM Mono',monospace;font-size:9px;letter-spacing:0.06em;text-transform:uppercase;transition:all 0.15s;}
.tgb:hover{color:var(--tx);}
.tgb.on{background:var(--acc);color:#000;font-weight:500;}
.form-foot{padding:14px 20px;border-top:1px solid var(--b1);flex-shrink:0;}
.gen-btn{width:100%;padding:13px;background:var(--acc);border:none;color:#000;font-family:'Syne',sans-serif;font-size:13px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:8px;}
.gen-btn:hover:not(:disabled){background:#d9ff5a;transform:translateY(-1px);}
.gen-btn:disabled{background:var(--b2);color:var(--txm);cursor:not-allowed;transform:none;}
.spin{width:12px;height:12px;border:2px solid rgba(0,0,0,0.25);border-top-color:#000;border-radius:50%;animation:spin 0.7s linear infinite;flex-shrink:0;}
@keyframes spin{to{transform:rotate(360deg);}}

.out-wrap{flex:1;display:flex;flex-direction:column;overflow:hidden;}
.out-scroll{flex:1;overflow-y:auto;padding:20px;}
.out-empty{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;padding:40px;}
.oe-icon{width:56px;height:56px;border:1px solid var(--b2);display:flex;align-items:center;justify-content:center;font-size:22px;color:var(--txd);}
.oe-title{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:var(--txd);}
.oe-sub{font-size:11px;color:var(--txd);line-height:1.7;max-width:260px;}
.email-card{background:var(--s1);border:1px solid var(--b2);margin-bottom:10px;animation:fadeUp 0.3s ease both;}
.ec-head{padding:12px 16px;border-bottom:1px solid var(--b1);}
.ec-subj-label{font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:var(--txm);margin-bottom:3px;}
.ec-subj{font-size:13px;color:var(--tx);line-height:1.4;}
.ec-body{padding:18px 16px;}
.email-body{font-family:'Playfair Display',serif;font-size:14px;line-height:1.9;color:var(--tx);white-space:pre-wrap;}
.cursor{display:inline-block;width:2px;height:15px;background:var(--acc);vertical-align:middle;margin-left:2px;animation:blink 1s step-end infinite;}
@keyframes blink{0%,100%{opacity:1;}50%{opacity:0;}}
.act-row{padding:10px 16px;border-top:1px solid var(--b1);display:flex;gap:5px;flex-wrap:wrap;}
.act{padding:6px 12px;background:var(--s2);border:1px solid var(--b2);color:var(--txm);font-size:10px;letter-spacing:0.08em;text-transform:uppercase;transition:all 0.15s;display:flex;align-items:center;gap:4px;}
.act:hover{background:var(--s3);color:var(--tx);border-color:var(--b3);}
.act.ok{color:var(--ok);border-color:var(--ok);}
.tips-card{background:rgba(200,245,69,0.03);border:1px solid rgba(200,245,69,0.12);padding:14px 16px;margin-bottom:10px;animation:fadeUp 0.3s ease 0.08s both;}
.tips-head{font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:var(--acc);margin-bottom:10px;display:flex;align-items:center;gap:6px;}
.tips-head::before{content:'';width:5px;height:5px;background:var(--acc);border-radius:50%;}
.tip{display:flex;gap:8px;margin-bottom:7px;font-size:11px;color:var(--txm);line-height:1.55;}
.tip:last-child{margin-bottom:0;}
.tip-n{color:var(--acc);flex-shrink:0;font-size:9px;margin-top:1px;}
.fu-card{background:var(--s1);border:1px solid var(--b2);margin-bottom:10px;animation:fadeUp 0.3s ease 0.12s both;}
.fu-toggle{width:100%;padding:12px 16px;background:transparent;border:none;color:var(--tx);display:flex;align-items:center;justify-content:space-between;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;text-align:left;transition:background 0.15s;}
.fu-toggle:hover{background:var(--s2);}
.fu-body{padding:16px;border-top:1px solid var(--b1);}
.fu-body .email-body{font-size:13px;color:#c2bdb4;}
.err-card{background:rgba(248,113,113,0.05);border:1px solid rgba(248,113,113,0.2);padding:18px;display:flex;gap:12px;animation:fadeUp 0.3s ease both;}
.err-ico{font-size:18px;}
.err-title{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:var(--err);margin-bottom:4px;}
.err-msg{font-size:11px;color:var(--txm);line-height:1.6;margin-bottom:10px;}
.retry{padding:7px 14px;background:var(--err);border:none;color:#000;font-family:'Syne',sans-serif;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;}
.retry:hover{background:#fca5a5;}
.statusbar{padding:10px 20px;border-top:1px solid var(--b1);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;background:var(--s1);}
.sb-l{display:flex;align-items:center;gap:7px;font-size:10px;color:var(--txm);}
.dot{width:6px;height:6px;border-radius:50%;background:var(--b3);}
.dot.loading{background:var(--warn);animation:pulse 1.5s ease infinite;}
.dot.done{background:var(--ok);}
.dot.error{background:var(--err);}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.3;}}
.sb-r{font-size:10px;color:var(--txd);}

@media(max-width:860px){.sidebar{width:220px;}.form-wrap{width:300px;}}
@media(max-width:680px){
  .sidebar{display:none;}
  .editor{flex-direction:column;}
  .form-wrap{width:100%;border-right:none;border-bottom:1px solid var(--b1);max-height:55vh;}
  .out-wrap{min-height:300px;}
}
`;

function AuthScreen({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const validate = () => {
    if (!email.trim()) return "Email address is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Please enter a valid email address.";
    if (!pass) return "Password is required.";
    if (pass.length < 6) return "Password must be at least 6 characters.";
    if (tab === "register" && !name.trim()) return "Your name is required.";
    return null;
  };

  const submit = () => {
    setErr("");
    const ve = validate();
    if (ve) { setErr(ve); return; }
    setLoading(true);
    try {
      const users = Storage.getUsers();
      const key = email.trim().toLowerCase();
      if (tab === "login") {
        const user = users[key];
        if (!user) { setErr("No account found with this email."); setLoading(false); return; }
        if (user.password !== btoa(unescape(encodeURIComponent(pass)))) { setErr("Incorrect password. Please try again."); setLoading(false); return; }
        const session = { uid: key, name: user.name, email: key };
        Storage.setSession(session);
        onLogin(session);
      } else {
        if (users[key]) { setErr("An account with this email already exists."); setLoading(false); return; }
        users[key] = { name: name.trim(), password: btoa(unescape(encodeURIComponent(pass))), createdAt: Date.now() };
        Storage.setUsers(users);
        const session = { uid: key, name: name.trim(), email: key };
        Storage.setSession(session);
        onLogin(session);
      }
    } catch {
      setErr("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const onKey = e => { if (e.key === "Enter") submit(); };

  return (
    <div className="auth-wrap">
      <div className="auth-bg" />
      <div className="auth-dots" />
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-eyebrow">↗ Sales Intelligence</div>
          <div className="auth-title">Cold<span>Mail</span> Pro</div>
          <div className="auth-sub">AI cold emails that sound genuinely human</div>
        </div>
        <div className="auth-tabs">
          <button className={`auth-tab${tab === "login" ? " on" : ""}`} onClick={() => { setTab("login"); setErr(""); }}>Sign In</button>
          <button className={`auth-tab${tab === "register" ? " on" : ""}`} onClick={() => { setTab("register"); setErr(""); }}>Create Account</button>
        </div>
        {tab === "register" && (
          <div className="f">
            <label>Full Name</label>
            <input type="text" placeholder="Sarah Chen" value={name} onChange={e => setName(e.target.value)} onKeyDown={onKey} autoFocus />
          </div>
        )}
        <div className="f">
          <label>Email Address</label>
          <input type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={onKey} autoFocus={tab === "login"} />
        </div>
        <div className="f">
          <label>Password</label>
          <input type="password" placeholder="Min. 6 characters" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={onKey} />
        </div>
        {err && <div className="auth-err">⚠ {err}</div>}
        <button className="auth-btn" onClick={submit} disabled={loading}>
          {loading ? "Please wait…" : tab === "login" ? "Sign In →" : "Create Account →"}
        </button>
        <div className="auth-note">Your data stays in your browser. Always free.</div>
      </div>
    </div>
  );
}

function HistItem({ item, active, onSelect, onDelete }) {
  const d = new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return (
    <button className={`hi${active ? " active" : ""}`} onClick={() => onSelect(item)}>
      <div className="hi-name">{item.form.prospect || "Unknown Prospect"}</div>
      <div className="hi-co">{item.form.company || "—"}</div>
      <div className="hi-foot">
        <span className="hi-tags">{item.form.tone} · {item.form.goal}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 9, color: "var(--txd)" }}>{d}</span>
          <button className="hi-del" onClick={e => { e.stopPropagation(); onDelete(item.id); }}>✕</button>
        </span>
      </div>
    </button>
  );
}

function Output({ result, streaming, status, error, onRetry, onRegen }) {
  const [showFU, setShowFU] = useState(false);
  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(false);
  const copy = (text, set) => { navigator.clipboard.writeText(text).catch(() => {}); set(true); setTimeout(() => set(false), 2000); };

  if (status === "idle") return (
    <div className="out-empty">
      <div className="oe-icon">✉</div>
      <div className="oe-title">Ready to generate</div>
      <div className="oe-sub">Fill in the prospect details on the left and hit Generate.</div>
    </div>
  );

  if (status === "error") return (
    <div className="err-card">
      <div className="err-ico">⚠</div>
      <div>
        <div className="err-title">Generation Failed</div>
        <div className="err-msg">{error}</div>
        <button className="retry" onClick={onRetry}>Try Again</button>
      </div>
    </div>
  );

  const body = streaming || result?.body || "";

  return (
    <>
      {body && (
        <div className="email-card">
          {result && <div className="ec-head"><div className="ec-subj-label">Subject Line</div><div className="ec-subj">{result.subject}</div></div>}
          <div className="ec-body">
            <div className="email-body">{body}{streaming && <span className="cursor" />}</div>
          </div>
          {result && (
            <div className="act-row">
              <button className={`act${c1 ? " ok" : ""}`} onClick={() => copy(`Subject: ${result.subject}\n\n${result.body}`, setC1)}>{c1 ? "✓ Copied!" : "⎘ Copy Email"}</button>
              <button className="act" onClick={onRegen}>↺ Regenerate</button>
            </div>
          )}
        </div>
      )}
      {result?.tips?.length > 0 && (
        <div className="tips-card">
          <div className="tips-head">Tactical Tips</div>
          {result.tips.map((t, i) => <div className="tip" key={i}><span className="tip-n">0{i + 1}</span><span>{t}</span></div>)}
        </div>
      )}
      {result?.followUp && (
        <div className="fu-card">
          <button className="fu-toggle" onClick={() => setShowFU(v => !v)}>
            <span>↳ Day-3 Follow-up Email</span><span>{showFU ? "▲" : "▼"}</span>
          </button>
          {showFU && (
            <div className="fu-body">
              <div className="email-body">{result.followUp}</div>
              <div className="act-row" style={{ paddingLeft: 0, paddingRight: 0, marginTop: 10 }}>
                <button className={`act${c2 ? " ok" : ""}`} onClick={() => copy(result.followUp, setC2)}>{c2 ? "✓ Copied!" : "⎘ Copy Follow-up"}</button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

const BLANK = { prospect: "", company: "", role: "", painPoint: "", yourProduct: "", goal: "call", tone: "direct", length: "medium" };

export default function App() {
  const [session, setSession] = useState(null);
  const [booting, setBooting] = useState(true);
  const [history, setHistory] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [result, setResult] = useState(null);
  const [streaming, setStreaming] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [fieldErrs, setFieldErrs] = useState({});
  const timer = useRef(null);

  useEffect(() => {
    const s = Storage.getSession();
    if (s) { setSession(s); setHistory(Storage.getHistory(s.uid)); }
    setBooting(false);
  }, []);

  const login = s => { setSession(s); setHistory(Storage.getHistory(s.uid)); };

  const logout = () => {
    if (timer.current) clearInterval(timer.current);
    Storage.clearSession();
    setSession(null); setHistory([]); setForm(BLANK);
    setResult(null); setStatus("idle"); setActiveId(null);
  };

  const sf = (k, v) => { setForm(f => ({ ...f, [k]: v })); setFieldErrs(e => ({ ...e, [k]: null })); };

  const freshEmail = () => {
    if (timer.current) clearInterval(timer.current);
    setForm(BLANK); setResult(null); setStreaming(""); setStatus("idle");
    setError(""); setActiveId(null); setFieldErrs({});
  };

  const generate = async () => {
    const errs = {};
    if (!form.yourProduct.trim()) errs.yourProduct = "Required — describe your product or service.";
    if (Object.keys(errs).length) { setFieldErrs(errs); return; }
    if (timer.current) clearInterval(timer.current);
    setStatus("loading"); setError(""); setResult(null); setStreaming("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);

      const full = data.body;
      let i = 0;
      timer.current = setInterval(() => {
        i += 5;
        setStreaming(full.slice(0, i));
        if (i >= full.length) {
          clearInterval(timer.current);
          setStreaming("");
          setResult(data);
          setStatus("done");
          const entry = { id: Date.now().toString(), createdAt: Date.now(), form: { ...form }, result: data };
          setHistory(h => {
            const updated = [entry, ...h].slice(0, 100);
            Storage.setHistory(session.uid, updated);
            return updated;
          });
          setActiveId(entry.id);
        }
      }, 10);
    } catch (e) {
      setStatus("error");
      setError(e.message || "Unexpected error. Please try again.");
    }
  };

  const loadItem = item => {
    if (timer.current) clearInterval(timer.current);
    setForm(item.form); setResult(item.result); setStreaming("");
    setStatus("done"); setActiveId(item.id); setFieldErrs({}); setError("");
  };

  const deleteItem = id => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    Storage.setHistory(session.uid, updated);
    if (activeId === id) freshEmail();
  };

  const filtered = history.filter(h => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (h.form.prospect + h.form.company + h.form.role).toLowerCase().includes(q);
  });

  const wc = result ? result.body.split(/\s+/).filter(Boolean).length : 0;
  const statusLabel = { idle: "Ready", loading: "Generating…", done: `${wc} words`, error: "Error" }[status];

  if (booting) return <><style>{CSS}</style><div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--txm)", fontSize: 11 }}>Loading…</div></>;
  if (!session) return <><style>{CSS}</style><AuthScreen onLogin={login} /></>;

  return (
    <>
      <style>{CSS}</style>
      <div className="shell">
        <div className="topbar">
          <div className="tb-left">
            <div className="tb-logo">Cold<span>Mail</span></div>
            <div className="tb-badge">Pro</div>
          </div>
          <div className="tb-right">
            <div className="tb-user">Hi, <strong>{session.name}</strong></div>
            <button className="signout" onClick={logout}>Sign Out</button>
          </div>
        </div>
        <div className="body">
          <div className="sidebar">
            <div className="sb-head">
              <span className="sb-title">History</span>
              <span className="sb-count">{history.length}</span>
            </div>
            <div className="sb-search">
              <input type="text" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button className="new-btn" onClick={freshEmail}>+ New Email</button>
            <div className="hist-list">
              {filtered.length === 0 && <div className="hist-empty">{search ? "No results." : "No emails yet.\nGenerate your first one."}</div>}
              {filtered.map(item => <HistItem key={item.id} item={item} active={activeId === item.id} onSelect={loadItem} onDelete={deleteItem} />)}
            </div>
          </div>
          <div className="editor">
            <div className="form-wrap">
              <div className="form-scroll">
                <div className="sec-label"><span className="n">01</span> Prospect</div>
                <div className="row2">
                  <div className="field"><label>Name</label><input type="text" placeholder="Sarah Chen" value={form.prospect} onChange={e => sf("prospect", e.target.value)} /></div>
                  <div className="field"><label>Role / Title</label><input type="text" placeholder="VP of Sales" value={form.role} onChange={e => sf("role", e.target.value)} /></div>
                </div>
                <div className="field"><label>Company</label><input type="text" placeholder="Acme Corp" value={form.company} onChange={e => sf("company", e.target.value)} /></div>
                <div className="field">
                  <label>Their Pain Point</label>
                  <textarea rows={2} placeholder="e.g. slow sales cycles, reps spending too much time on admin…" value={form.painPoint} onChange={e => sf("painPoint", e.target.value)} />
                  <div className="fhint">More specific = better email.</div>
                </div>
                <div className="field">
                  <label>Your Product / Service <span className="req">* required</span></label>
                  <textarea rows={2} placeholder="e.g. AI coaching platform that cuts sales ramp time by 40%…" value={form.yourProduct} onChange={e => sf("yourProduct", e.target.value)} className={fieldErrs.yourProduct ? "verr" : ""} />
                  {fieldErrs.yourProduct && <div className="ferr">⚠ {fieldErrs.yourProduct}</div>}
                  <div className="fchar">{form.yourProduct.length} / 300</div>
                </div>
                <div className="sec-label" style={{ marginTop: 18 }}><span className="n">02</span> Settings</div>
                <div className="field">
                  <label>Goal</label>
                  <div className="tg">
                    {[["call","Book Call"],["demo","Get Demo"],["reply","Get Reply"],["partnership","Partner"]].map(([v,l]) => (
                      <button key={v} className={`tgb${form.goal===v?" on":""}`} onClick={() => sf("goal",v)}>{l}</button>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <label>Tone</label>
                  <div className="tg">
                    {[["direct","Direct"],["casual","Casual"],["formal","Formal"],["witty","Witty"]].map(([v,l]) => (
                      <button key={v} className={`tgb${form.tone===v?" on":""}`} onClick={() => sf("tone",v)}>{l}</button>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <label>Length</label>
                  <div className="tg">
                    {[["short","Short"],["medium","Medium"],["long","Long"]].map(([v,l]) => (
                      <button key={v} className={`tgb${form.length===v?" on":""}`} onClick={() => sf("length",v)}>{l}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="form-foot">
                <button className="gen-btn" onClick={generate} disabled={status === "loading"}>
                  {status === "loading" ? <><div className="spin" />Generating…</> : "↗ Generate Email"}
                </button>
              </div>
            </div>
            <div className="out-wrap">
              <div className="out-scroll">
                <Output result={result} streaming={streaming} status={status} error={error} onRetry={generate} onRegen={generate} />
              </div>
              <div className="statusbar">
                <div className="sb-l">
                  <div className={`dot${status==="loading"?" loading":status==="done"?" done":status==="error"?" error":""}`} />
                  {statusLabel}
                </div>
                {result && <div className="sb-r">{new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
