import { useState, useEffect, useCallback } from "react";

// ============================================================
// CONSTANTS & DATA
// ============================================================
const PAGES = { HOME: "home", VERIFY: "verify", RESEARCH: "research", INTENT: "intent", ANALYTICS: "analytics", ADMIN: "admin" };
const QUEUE_TABS = ["Verification", "Research", "Intent Review", "Completed"];

const COLORS = {
  gradientHeader: "linear-gradient(135deg, #dc2626 0%, #7c3aed 100%)",
  purple: "#7c3aed", darkPurple: "#6d28d9", pink: "#be185d",
  green: "#059669", greenLight: "#10b981", blue: "#3b82f6",
  amber: "#d97706", red: "#dc2626", dark: "#1a1a2e", darkAlt: "#2d2d44",
  gray100: "#f3f4f6", gray200: "#e5e7eb", gray300: "#d1d5db",
  gray500: "#6b7280", gray700: "#374151", gray900: "#1a1a2e",
  bgPage: "#f5f6fa",
  // AI Agent teal wash palette (Option D)
  aiGradient: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(13,148,136,0.08))",
  aiBorder: "rgba(13,148,136,0.2)",
  aiStatBg: "rgba(13,148,136,0.06)",
  aiText: "#134e4a", aiTextMuted: "#5f6b6a", aiTextFaint: "#6b7280",
  teal: "#0d9488", tealDark: "#134e4a", tealLight: "#5eead4", tealBg: "#f0fdfa",
  aiAccent: "#0d9488", aiSuccess: "#059669", aiHandoff: "#b45309", aiError: "#dc2626",
};

const VERIFY_ITEMS = [
  { id: 1, file: "Appeal_266_Docs.pdf", type: "PDF", channel: "Fax", pages: 12, time: "5m ago", confidence: 84, audit: "AUD-2026-78432", patient: "Martinez, Robert J.", claim: "CLM-ABC-998341", provider: "Memorial Regional", reason: "Name variation: 'Rob' vs 'Robert'", locked: false },
  { id: 2, file: "MR_Additional_8827.pdf", type: "PDF", channel: "Portal", pages: 48, time: "18m ago", confidence: 91, audit: "AUD-2026-91102", patient: "Chen, Michelle L.", claim: "CLM-DEF-112847", provider: "Cedars-Sinai", reason: "DOS mismatch within tolerance (±2 days)", locked: true, lockedBy: "SK" },
  { id: 3, file: "Fax_Inbound_0121.tif", type: "TIF", channel: "Fax", pages: 8, time: "32m ago", confidence: 86, audit: "AUD-2026-88521", patient: "Williams, James T.", claim: "CLM-GHI-554231", provider: "Johns Hopkins", reason: "Provider ID partial match", locked: false },
  { id: 4, file: "Portal_Records_5521.pdf", type: "PDF", channel: "Portal", pages: 156, time: "45m ago", confidence: 89, audit: "AUD-2026-77841", patient: "Johnson, Patricia A.", claim: "CLM-JKL-887123", provider: "Mayo Clinic", reason: "Multiple candidate audits (2 matches)", locked: false },
  { id: 5, file: "SFTP_Batch_Record.pdf", type: "PDF", channel: "SFTP", pages: 24, time: "1h ago", confidence: 82, audit: "AUD-2026-65892", patient: "Davis, Michael R.", claim: "CLM-MNO-223456", provider: "Cleveland Clinic", reason: "Low overall confidence score", locked: true, lockedBy: "JR" },
];

const RESEARCH_ITEMS = [
  { id: 10, file: "Fax_NoLetter_0121.tif", type: "TIF", channel: "Fax", pages: 14, time: "12m ago", badge: "No Match", badgeColor: "#f59e0b", reason: "No CGI letter + payer iteration exhausted", locked: false },
  { id: 11, file: "SFTP_MultiMatch.pdf", type: "PDF", channel: "SFTP", pages: 36, time: "45m ago", badge: "Multi-Match", badgeColor: "#f59e0b", reason: "3 possible audit matches found", locked: false },
  { id: 12, file: "Portal_MultiDOS_9921.pdf", type: "PDF", channel: "Portal", pages: 82, time: "1h ago", badge: "Multi-Encounter", badgeColor: "#8b5cf6", reason: "Multiple DOS detected: 10/03-10/08, 11/14-11/18", locked: true, lockedBy: "DM" },
];

const INTENT_ITEMS = [
  { id: 20, file: "Provider_Response_4521.pdf", type: "PDF", channel: "Portal", pages: 6, time: "28m ago", badge: "Conflict", badgeColor: "#f59e0b", reason: "Checkbox: Agree · Comments: partial disagreement", scenario: "conflict", audit: "AUD-2026-55210", patient: "Thompson, Karen M." },
  { id: 21, file: "Fax_Response_0892.pdf", type: "PDF", channel: "Fax", pages: 4, time: "1h ago", badge: "Low Conf", badgeColor: "#dc2626", reason: "Intent confidence 62% · Checkbox unclear", scenario: "low-conf", audit: "AUD-2026-44781", patient: "Baker, William S." },
  { id: 22, file: "SFTP_ProvDocs_7741.pdf", type: "PDF", channel: "SFTP", pages: 38, time: "2h ago", badge: "No Form", badgeColor: "#8b5cf6", reason: "No Provider Response Form detected in packet", scenario: "no-form", audit: "AUD-2026-71083", patient: "Rodriguez, Maria L." },
];

const FEED_ITEMS = [
  { type: "processing", file: "SFTP_Batch_0121_007.pdf", meta: "OCR complete · Running classification", time: "Just now" },
  { type: "success", file: "MR_570f2c8_Records.pdf", meta: "Auto-indexed at 97% confidence → AVA, Audit Studio", time: "2m ago" },
  { type: "handoff", file: "Appeal_266_Docs.pdf", meta: "Sent to Verification · 84% confidence", reason: "Name variation: 'Rob' vs 'Robert'", time: "5m ago" },
  { type: "success", file: "Portal_Upload_5UB.pdf", meta: "Auto-indexed at 98% confidence → AVA", time: "8m ago" },
  { type: "handoff", file: "Fax_NoLetter_0121.tif", meta: "Sent to Research · No matching audit found", reason: "No request letter · Payer ID extraction failed", time: "12m ago" },
  { type: "error", file: "Fax_Corrupted_0094.tif", meta: "Processing failed · OCR returned empty", time: "15m ago" },
];

const AGENTS = [
  { name: "Indexing & Reconciliation", status: "Processing" },
  { name: "Clinical NLP Classification", status: "Active" },
  { name: "Document Completeness", status: "Active" },
  { name: "Intent Analysis", status: "Idle" },
];

// ============================================================
// SHARED COMPONENTS
// ============================================================

// Toast notification
function Toast({ message, sub, visible }) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-xl" style={{ background: COLORS.dark, color: "white", animation: "slideUp 0.3s ease" }}>
      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ background: COLORS.greenLight }}>✓</div>
      <div><div className="font-semibold text-sm">{message}</div><div className="text-xs opacity-70">{sub}</div></div>
    </div>
  );
}

// Lock indicator
function LockBadge({ initials }) {
  return (
    <div className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold" style={{ background: "#fee2e2", color: "#991b1b" }}>
      🔒 {initials}
    </div>
  );
}

// Confidence badge
function ConfBadge({ value, size = "sm" }) {
  const bg = value >= 95 ? "#d1fae5" : value >= 80 ? "#dbeafe" : "#fef3c7";
  const color = value >= 95 ? "#059669" : value >= 80 ? "#1d4ed8" : "#b45309";
  const sz = size === "lg" ? "text-lg px-3 py-1" : "text-xs px-2 py-0.5";
  return <span className={`rounded-full font-bold ${sz}`} style={{ background: bg, color }}>{value}%</span>;
}

// Confidence gauge bar
function ConfGauge({ value }) {
  const fillColor = value >= 95 ? "#059669" : value >= 80 ? "#d97706" : "#dc2626";
  const textColor = value >= 95 ? "#059669" : value >= 80 ? "#d97706" : "#dc2626";
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Confidence</span>
      <div className="flex-1 h-2 bg-gray-200 rounded-full relative">
        <div className="absolute" style={{ left: "80%", top: -2, bottom: -2, width: 2, background: "rgba(0,0,0,0.2)", borderRadius: 1 }} />
        <div className="absolute" style={{ left: "95%", top: -2, bottom: -2, width: 2, background: "rgba(0,0,0,0.2)", borderRadius: 1 }} />
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: fillColor }} />
      </div>
      <span className="text-xl font-bold tabular-nums" style={{ color: textColor, minWidth: 42, textAlign: "right" }}>{value}%</span>
    </div>
  );
}

// Document mock viewer
function DocViewer({ title, children }) {
  return (
    <div className="flex flex-col h-full" style={{ background: COLORS.dark }}>
      <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0" style={{ background: COLORS.darkAlt }}>
        <span className="text-white text-xs font-medium">{title}</span>
        <div className="flex gap-1">
          {["◀", "▶", "🔍", "⬇"].map((b, i) => (
            <button key={i} className="px-2 py-1 rounded text-xs border border-white/20 text-white bg-transparent hover:bg-white/10">{b}</button>
          ))}
        </div>
      </div>
      <div className="flex-1 p-4 overflow-auto flex items-start justify-center">
        <div className="bg-white rounded w-full h-full p-6 overflow-auto text-xs leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}

// Queue rail (Pattern B collapsed)
function QueueRail({ items, activeId, onSelect, onToggle, locked = {} }) {
  return (
    <div className="flex flex-col items-center pt-3 border-r flex-shrink-0 bg-white" style={{ width: 52 }}>
      <button onClick={onToggle} className="w-9 h-9 rounded-lg flex items-center justify-center text-base mb-3 border hover:bg-purple-50 hover:border-purple-300" style={{ background: COLORS.gray100, borderColor: COLORS.gray200 }}>☰</button>
      <div className="text-xs font-bold" style={{ color: COLORS.purple }}>{items.filter(i => !i.locked).length}</div>
      <div className="text-[8px] text-gray-400 uppercase tracking-wide mb-4">avail</div>
      <div className="flex flex-col gap-1.5 items-center">
        {items.map((item, idx) => (
          <button key={item.id} onClick={() => !item.locked && onSelect(item.id)}
            className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-semibold transition-all ${item.id === activeId ? "text-white" : item.locked ? "text-gray-400 cursor-not-allowed" : "text-gray-500 hover:bg-purple-50 hover:text-purple-600"}`}
            style={{ background: item.id === activeId ? COLORS.purple : item.locked ? "#fee2e2" : COLORS.gray100, border: "2px solid transparent", fontSize: 10 }}
            title={item.locked ? `Locked by ${item.lockedBy}` : item.file}>
            {item.locked ? item.lockedBy : idx + 1}
          </button>
        ))}
      </div>
      <div className="mt-auto mb-3 flex flex-col gap-1 items-center">
        <button className="w-8 h-7 rounded border text-xs text-gray-500 bg-white hover:bg-gray-50" style={{ borderColor: COLORS.gray200 }}>▲</button>
        <button className="w-8 h-7 rounded border text-xs text-gray-500 bg-white hover:bg-gray-50" style={{ borderColor: COLORS.gray200 }}>▼</button>
      </div>
    </div>
  );
}

// Queue drawer (Pattern B expanded)
function QueueDrawer({ items, activeId, onSelect, onClose, title, renderBadge }) {
  return (
    <div className="absolute left-[52px] top-0 bottom-0 bg-white border-r z-20 flex flex-col shadow-xl" style={{ width: 340, borderColor: COLORS.gray200 }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: COLORS.gray200 }}>
        <span className="text-sm"><strong style={{ color: COLORS.purple }}>{items.length}</strong> {title}</span>
        <button onClick={onClose} className="w-7 h-7 rounded-md border flex items-center justify-center text-xs hover:bg-gray-50" style={{ borderColor: COLORS.gray200 }}>✕</button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {items.map(item => (
          <div key={item.id} onClick={() => !item.locked && onSelect(item.id)}
            className={`px-4 py-3 border-b cursor-pointer transition-colors ${item.id === activeId ? "border-l-[3px]" : "border-l-[3px] border-l-transparent"} ${item.locked ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`}
            style={{ background: item.id === activeId ? "linear-gradient(135deg, #ede9fe, #dbeafe)" : undefined, borderBottomColor: COLORS.gray100, borderLeftColor: item.id === activeId ? COLORS.purple : "transparent" }}>
            <div className="flex items-start justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md flex items-center justify-center text-[9px] font-bold" style={{ background: "#fee2e2", color: "#dc2626" }}>{item.type}</div>
                <div>
                  <div className="font-semibold text-xs truncate max-w-[150px]">{item.file}</div>
                  <div className="text-[10px] text-gray-500">{item.channel} · {item.pages}p · {item.time}</div>
                </div>
              </div>
              {item.locked ? <LockBadge initials={item.lockedBy} /> : renderBadge(item)}
            </div>
            {!item.locked && (
              <div className="rounded-md px-2.5 py-1.5 text-[10px]" style={{ background: item.id === activeId ? "rgba(124,58,237,0.08)" : COLORS.gray100 }}>
                <div className="font-semibold uppercase tracking-wide mb-0.5" style={{ color: COLORS.purple, fontSize: 9 }}>🤖 {item.confidence ? "AI Match" : "Routing Reason"}</div>
                <div className="text-gray-600">{item.confidence ? `${item.audit} · ${item.patient}` : item.reason}</div>
              </div>
            )}
            {item.locked && <div className="text-[10px] text-red-700 mt-1">🔒 Locked by {item.lockedBy}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// Workbench footer
function WorkbenchFooter({ itemNum, totalItems, actions, onAutoAdvance }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t flex-shrink-0" style={{ background: "#f9fafb", borderColor: COLORS.gray200 }}>
      <span className="text-xs text-gray-500">Item {itemNum} of {totalItems} · Auto-advance on</span>
      <div className="flex gap-2">{actions}</div>
    </div>
  );
}

// Section heading in analytics
function SectionHeading({ title, sub }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-bold" style={{ color: COLORS.dark }}>{title}</h2>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

// ============================================================
// PAGE: HOME (Landing Page)
// ============================================================
function HomePage({ navigate }) {
  const [agentPopover, setAgentPopover] = useState(false);

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: COLORS.dark }}>Good morning, David 👋</h1>
        <p className="text-sm text-gray-500">Here's what's happening with document intake today</p>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 380px" }}>
        {/* Main Column */}
        <div className="flex flex-col gap-6">
          {/* AI Activity Panel — Light Teal Wash (Option D) */}
          <div className="rounded-xl overflow-hidden shadow-sm border" style={{ background: COLORS.aiGradient, borderColor: COLORS.aiBorder }}>
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${COLORS.aiBorder}` }}>
              <span className="font-semibold text-sm flex items-center gap-2" style={{ color: COLORS.aiText }}>🤖 AI Agent Activity</span>
              <div className="relative">
                <button onClick={() => setAgentPopover(!agentPopover)} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium cursor-pointer" style={{ background: "rgba(16,185,129,0.12)", color: COLORS.teal }}>
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> 3 Agents Active
                </button>
                {agentPopover && (
                  <div className="absolute right-0 top-full mt-2 w-64 rounded-xl p-3 shadow-xl z-50 bg-white border" style={{ borderColor: COLORS.aiBorder }}>
                    {AGENTS.map((a, i) => (
                      <div key={i} className="flex items-center gap-2.5 py-2 last:border-0" style={{ borderBottom: `1px solid ${COLORS.gray100}` }}>
                        <span className={`w-2 h-2 rounded-full ${a.status === "Idle" ? "bg-gray-400" : "bg-green-500"}`} />
                        <span className="text-xs font-medium flex-1" style={{ color: COLORS.aiText }}>{a.name}</span>
                        <span className="text-[10px]" style={{ color: COLORS.aiTextMuted }}>{a.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-5 gap-3 mb-5">
                {[
                  { v: "187", l: "Received Today" },
                  { v: "156", l: "Auto-Indexed", hl: COLORS.teal },
                  { v: "83%", l: "Automation Rate" },
                  { v: "18s", l: "Avg Processing" },
                  { v: "4", l: "Errors Today", hl: COLORS.amber },
                ].map((s, i) => (
                  <div key={i} className="text-center p-3 rounded-lg" style={{ background: COLORS.aiStatBg }}>
                    <div className="text-2xl font-bold" style={{ color: s.hl || COLORS.tealDark }}>{s.v}</div>
                    <div className="text-[10px] mt-1" style={{ color: COLORS.aiTextMuted }}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div className="max-h-[180px] overflow-y-auto space-y-0">
                {FEED_ITEMS.map((f, i) => (
                  <div key={i} className="flex items-start gap-3 py-2.5 last:border-0" style={{ borderBottom: `1px solid rgba(13,148,136,0.08)` }}>
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs flex-shrink-0`}
                      style={{ background: f.type === "processing" ? "rgba(124,58,237,0.12)" : f.type === "success" ? "rgba(16,185,129,0.15)" : f.type === "error" ? "rgba(220,38,38,0.1)" : "rgba(217,119,6,0.12)",
                               color: f.type === "processing" ? COLORS.purple : f.type === "success" ? COLORS.aiSuccess : f.type === "error" ? COLORS.aiError : COLORS.aiHandoff }}>
                      {f.type === "processing" ? <span className="w-3.5 h-3.5 border-2 border-purple-300/30 border-t-purple-500 rounded-full animate-spin" /> : f.type === "success" ? "✓" : f.type === "error" ? "✕" : "→"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs truncate" style={{ color: COLORS.aiText }}>{f.file}</div>
                      <div className="text-[10px]" style={{ color: COLORS.aiTextMuted }}>{f.meta}</div>
                      {f.reason && <div className="text-[10px] italic mt-0.5" style={{ color: COLORS.aiTextFaint }}>{f.reason}</div>}
                    </div>
                    <span className="text-[10px] whitespace-nowrap" style={{ color: COLORS.aiTextFaint }}>{f.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Queue Cards */}
          <div>
            <h2 className="text-base font-semibold mb-4" style={{ color: COLORS.dark }}>👤 Your Work Queues</h2>
            <div className="grid grid-cols-2 gap-4 mb-3">
              {/* Verification */}
              <div onClick={() => navigate(PAGES.VERIFY)} className="bg-white rounded-xl shadow-sm border-2 border-transparent hover:border-purple-500 hover:-translate-y-0.5 transition-all cursor-pointer">
                <div className="p-5 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: "linear-gradient(135deg, #dbeafe, #bfdbfe)" }}>🔍</div>
                  <div className="flex-1">
                    <div className="font-semibold text-base" style={{ color: COLORS.dark }}>Verification Queue</div>
                    <div className="text-xs text-gray-500 mb-3">AI matched with 80–94% confidence. Quick review to confirm.</div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full text-sm font-semibold" style={{ background: "#fee2e2", color: "#dc2626" }}>8 items</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">⏱ Oldest: 2h 14m</span>
                    </div>
                  </div>
                </div>
                <div className="px-5 pb-5 space-y-2">
                  {VERIFY_ITEMS.slice(0, 2).map(item => (
                    <div key={item.id} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: COLORS.gray100 }}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-md flex items-center justify-center text-[9px] font-bold" style={{ background: "#fee2e2", color: "#dc2626" }}>{item.type}</div>
                        <div>
                          <div className="text-xs font-medium">{item.file}</div>
                          <div className="text-[10px] text-gray-500">{item.confidence}% · {item.channel} · {item.time}</div>
                        </div>
                      </div>
                      {item.locked ? <LockBadge initials={item.lockedBy} /> : <span className="text-[10px] font-medium px-2 py-0.5 rounded-md" style={{ background: "#dbeafe", color: "#1d4ed8" }}>Verify</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Research */}
              <div onClick={() => navigate(PAGES.RESEARCH)} className="bg-white rounded-xl shadow-sm border-2 border-transparent hover:border-purple-500 hover:-translate-y-0.5 transition-all cursor-pointer">
                <div className="p-5 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: "linear-gradient(135deg, #fef3c7, #fde68a)" }}>🔬</div>
                  <div className="flex-1">
                    <div className="font-semibold text-base" style={{ color: COLORS.dark }}>Research Queue</div>
                    <div className="text-xs text-gray-500 mb-3">AI couldn't match confidently. Manual investigation needed.</div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full text-sm font-semibold" style={{ background: "#fee2e2", color: "#dc2626" }}>3 items</span>
                      <span className="text-xs font-medium flex items-center gap-1" style={{ color: "#dc2626" }}>⏱ Oldest: 4h 52m</span>
                    </div>
                  </div>
                </div>
                <div className="px-5 pb-5 space-y-2">
                  {RESEARCH_ITEMS.slice(0, 2).map(item => (
                    <div key={item.id} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: COLORS.gray100 }}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-md flex items-center justify-center text-[9px] font-bold" style={{ background: "#fee2e2", color: "#dc2626" }}>{item.type}</div>
                        <div>
                          <div className="text-xs font-medium">{item.file}</div>
                          <div className="text-[10px] text-gray-500">{item.badge} · {item.time}</div>
                        </div>
                      </div>
                      {item.locked ? <LockBadge initials={item.lockedBy} /> : <span className="text-[10px] font-medium px-2 py-0.5 rounded-md" style={{ background: "#fef3c7", color: "#b45309" }}>Research</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Intent Review compact */}
            <div onClick={() => navigate(PAGES.INTENT)} className="bg-white rounded-xl shadow-sm border-2 border-transparent hover:border-purple-500 hover:-translate-y-0.5 transition-all cursor-pointer">
              <div className="px-5 py-4 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: "linear-gradient(135deg, #fce7f3, #fbcfe8)" }}>💬</div>
                <div className="flex-1">
                  <div className="font-semibold text-sm" style={{ color: COLORS.dark }}>Intent Review</div>
                  <div className="text-[11px] text-gray-500">Provider responses with unclear or conflicting intent</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "#fee2e2", color: "#dc2626" }}>3 items</span>
                  <span className="text-[10px] text-gray-500">⏱ 2h 14m</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          {/* Up Next */}
          <div className="rounded-xl overflow-hidden shadow-sm border-2" style={{ borderColor: COLORS.purple, background: "linear-gradient(135deg, #faf5ff, #f5f3ff)" }}>
            <div className="px-5 py-3.5 flex items-center justify-between text-white" style={{ background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.darkPurple})` }}>
              <span className="font-semibold text-sm flex items-center gap-2">⚡ Up Next</span>
              <span className="text-xs opacity-80">Highest priority</span>
            </div>
            <div className="p-5">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-white shadow flex items-center justify-center text-xl">📄</div>
                <div>
                  <div className="font-semibold text-sm">{INTENT_ITEMS[0].file}</div>
                  <div className="text-xs text-gray-500">{INTENT_ITEMS[0].pages} pages · {INTENT_ITEMS[0].channel} · {INTENT_ITEMS[0].time}</div>
                </div>
              </div>
              <ConfGauge value={72} />
              <div className="rounded-lg p-3 my-4 border" style={{ background: COLORS.tealBg, borderColor: COLORS.aiBorder }}>
                <div className="text-[9px] font-semibold uppercase tracking-wide mb-1" style={{ color: COLORS.teal }}>🤖 AI Handoff Reason</div>
                <div className="text-xs" style={{ color: COLORS.gray700 }}>Checkbox/content conflict: Provider checked "Agree" but written comments express partial disagreement on shoulder arthroscopy.</div>
              </div>
              <button onClick={() => navigate(PAGES.INTENT)} className="w-full py-3 rounded-lg text-white font-semibold text-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all" style={{ background: `linear-gradient(135deg, ${COLORS.pink}, #9d174d)` }}>
                ▶ Resolve Intent
              </button>
            </div>
          </div>

          {/* Completed Today */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: COLORS.gray100 }}>
              <span className="font-semibold text-sm">📊 Completed Today</span>
              <span className="text-xs font-medium cursor-pointer" style={{ color: COLORS.purple }}>View All</span>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center p-4 rounded-lg" style={{ background: "#f9fafb" }}>
                  <div className="text-2xl font-bold" style={{ color: COLORS.greenLight }}>156</div>
                  <div className="text-[10px] text-gray-500 mt-1">AI Auto-Indexed</div>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ background: "#f9fafb" }}>
                  <div className="text-2xl font-bold" style={{ color: COLORS.blue }}>23</div>
                  <div className="text-[10px] text-gray-500 mt-1">Human Verified</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 mb-2">Total: 179 documents processed</div>
              <div className="h-2 bg-gray-200 rounded-full flex overflow-hidden mb-2">
                <div className="h-full rounded-l-full" style={{ width: "87%", background: `linear-gradient(90deg, ${COLORS.greenLight}, ${COLORS.green})` }} />
                <div className="h-full rounded-r-full" style={{ width: "13%", background: `linear-gradient(90deg, ${COLORS.blue}, #2563eb)` }} />
              </div>
              <div className="flex justify-between text-[10px] text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: COLORS.greenLight }} /> AI (87%)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: COLORS.blue }} /> Human (13%)</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="px-5 py-3 border-b" style={{ borderColor: COLORS.gray100 }}>
              <span className="font-semibold text-sm">⚡ Quick Actions</span>
            </div>
            <div className="p-5 space-y-2">
              {[
                { icon: "📤", bg: "#ede9fe", label: "Upload Documents", desc: "Manually add files to intake" },
                { icon: "⚠️", bg: "#fee2e2", label: "Processing Errors", desc: "Documents that failed OCR or intake", badge: 4 },
                { icon: "🕐", bg: "#dbeafe", label: "Search History", desc: "Find previously indexed documents" },
                { icon: "⚙️", bg: "#f3f4f6", label: "Configuration", desc: "Manage routing and thresholds", onClick: () => navigate(PAGES.ADMIN) },
              ].map((a, i) => (
                <button key={i} onClick={a.onClick} className="flex items-center gap-3 w-full px-4 py-3 rounded-lg border text-left hover:border-purple-400 transition-colors" style={{ background: "#f9fafb", borderColor: COLORS.gray200 }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base" style={{ background: a.bg }}>{a.icon}</div>
                  <div className="flex-1"><div className="text-xs font-medium">{a.label}</div><div className="text-[10px] text-gray-500">{a.desc}</div></div>
                  {a.badge && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#fee2e2", color: "#dc2626" }}>{a.badge}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAGE: VERIFICATION QUEUE
// ============================================================
function VerificationPage({ navigate }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeId, setActiveId] = useState(VERIFY_ITEMS[0].id);
  const [toast, setToast] = useState(null);
  const active = VERIFY_ITEMS.find(i => i.id === activeId) || VERIFY_ITEMS[0];

  const handleConfirm = () => {
    setToast({ msg: "Indexed Successfully", sub: `${active.audit} → AVA, Audit Studio` });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-1 overflow-hidden relative">
        <QueueRail items={VERIFY_ITEMS} activeId={activeId} onSelect={(id) => { setActiveId(id); setDrawerOpen(false); }} onToggle={() => setDrawerOpen(!drawerOpen)} />
        {drawerOpen && <QueueDrawer items={VERIFY_ITEMS} activeId={activeId} onSelect={(id) => { setActiveId(id); setDrawerOpen(false); }} onClose={() => setDrawerOpen(false)} title="items need verification" renderBadge={(item) => <ConfBadge value={item.confidence} />} />}

        {/* Doc Viewer */}
        <div className="flex-1 min-w-0">
          <DocViewer title={`${active.file} — Page 1 of ${active.pages}`}>
            <div className="text-center mb-4 pb-3 border-b-2 border-gray-200">
              <h3 className="text-sm font-bold">{active.provider}</h3>
              <p className="text-[9px] text-gray-500">Medical Records Department</p>
            </div>
            <div className="text-[9px] font-semibold text-gray-500 mb-2">APPEAL DOCUMENTATION</div>
            <table className="w-full text-[10px] mb-3 border-collapse">
              {[["Patient", active.patient], ["DOB", "03/15/1958"], ["Audit #", active.audit], ["Claim #", active.claim]].map(([k, v], i) => (
                <tr key={i}><td className="border border-gray-200 bg-gray-50 px-2 py-1 font-medium w-24">{k}</td><td className="border border-gray-200 px-2 py-1"><span className="px-1 rounded" style={{ background: k === "Patient" ? "#fef3c7" : "rgba(124,58,237,0.1)", border: k === "Patient" ? "1px solid #fcd34d" : "1px solid rgba(124,58,237,0.2)" }}>{v}</span></td></tr>
              ))}
            </table>
            {active.reason.includes("Name") && (
              <div className="bg-amber-50 px-2 py-1.5 rounded text-[9px] text-amber-800">
                <strong>⚠ AI Note:</strong> {active.reason}
              </div>
            )}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="text-[9px] font-semibold text-gray-500 uppercase mb-1">History & Physical (pp. 1-2)</div>
              <div className="text-[10px] text-gray-600 leading-relaxed">Chief Complaint: Left hip pain, progressive over 3 months. Patient is a 67-year-old male presenting for evaluation of progressive left hip osteoarthritis with decreasing mobility and increasing reliance on assistive device...</div>
            </div>
          </DocViewer>
        </div>

        {/* Workbench */}
        <div className="flex flex-col bg-white border-l flex-shrink-0 overflow-hidden" style={{ width: 440, borderColor: COLORS.gray200 }}>
          <div className="px-5 py-4 border-b flex-shrink-0" style={{ borderColor: COLORS.gray200 }}>
            <div className="font-semibold text-sm">Verify AI Match</div>
            <div className="text-[11px] text-gray-500">Confirm indexing before applying</div>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {/* Handoff Card — Teal Wash */}
            <div className="rounded-xl p-4 mb-5 border" style={{ background: COLORS.aiGradient, borderColor: COLORS.aiBorder }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base" style={{ background: "rgba(13,148,136,0.15)", color: COLORS.teal }}>🤖</div>
                <div><div className="text-xs font-semibold" style={{ color: COLORS.aiText }}>AI Analysis Complete</div><div className="text-[10px]" style={{ color: COLORS.aiTextMuted }}>Handed off for verification</div></div>
              </div>
              <div className="rounded-lg p-3 mb-3 bg-white border" style={{ borderColor: COLORS.aiBorder }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] uppercase tracking-wide" style={{ color: COLORS.aiTextMuted }}>Matched Audit</span>
                  <div className="flex items-center gap-1.5"><span className="text-xl font-bold" style={{ color: COLORS.teal }}>{active.confidence}%</span><span className="text-[10px]" style={{ color: COLORS.aiTextMuted }}>conf.</span></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[["Audit Number", active.audit], ["Claim Number", active.claim], ["Patient (System)", active.patient], ["Provider", active.provider]].map(([l, v], i) => (
                    <div key={i}><div className="text-[9px]" style={{ color: COLORS.aiTextMuted }}>{l}</div><div className="text-xs font-medium" style={{ color: COLORS.aiText }}>{v}</div></div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg p-3" style={{ background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.2)" }}>
                <div className="text-[9px] font-semibold uppercase tracking-wide mb-1" style={{ color: COLORS.amber }}>⚠ Why Verification Needed</div>
                <div className="text-[11px] leading-relaxed" style={{ color: COLORS.gray700 }}>{active.reason}</div>
              </div>
            </div>

            {/* Classification */}
            <div className="mb-5">
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Clinical Classification</div>
              <div className="grid grid-cols-2 gap-1.5">
                {[["📋 H&P", "97%"], ["📝 Progress Notes", "95%"], ["📊 Lab Results", "99%"], ["📄 Appeal Letter", "98%"]].map(([t, c], i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: COLORS.gray100 }}>
                    <span className="text-[11px] font-medium">{t}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#d1fae5", color: "#059669" }}>{c}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Keywords */}
            <div>
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Indexing Keywords</div>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  ["Audit #", active.audit, "DB"], ["Claim #", active.claim, "DB"],
                  ["First Name", active.patient.split(", ")[1]?.split(" ")[0] || "", "AI"], ["Last Name", active.patient.split(", ")[0], "AI"],
                  ["DOB", "03/15/1958", "AI"], ["Doc Type", "COM Appeals 1", "AI"],
                ].map(([l, v, src], i) => (
                  <div key={i}>
                    <label className="text-[10px] text-gray-500 mb-1 flex items-center gap-1">{l} <span className={`text-[8px] font-bold px-1 rounded ${src === "AI" ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"}`}>{src}</span></label>
                    {l === "Doc Type" ? (
                      <select className="w-full px-2 py-1.5 text-xs border rounded-md" style={{ borderColor: COLORS.gray200 }}><option>COM Appeals 1</option><option>MR ALL</option></select>
                    ) : (
                      <input className="w-full px-2 py-1.5 text-xs border rounded-md" style={{ background: "#faf5ff", borderColor: "#c4b5fd" }} defaultValue={v} readOnly={src === "DB"} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <WorkbenchFooter itemNum={VERIFY_ITEMS.indexOf(active) + 1} totalItems={VERIFY_ITEMS.length} actions={<>
            <button className="px-4 py-2 rounded-lg text-xs font-semibold border" style={{ background: "#fef3c7", color: "#b45309", borderColor: "#fcd34d" }}>⚠ Research</button>
            <button onClick={handleConfirm} className="px-4 py-2 rounded-lg text-xs font-semibold text-white" style={{ background: `linear-gradient(135deg, ${COLORS.greenLight}, ${COLORS.green})` }}>✓ Confirm & Index</button>
          </>} />
        </div>
      </div>
      <Toast message={toast?.msg} sub={toast?.sub} visible={!!toast} />
    </div>
  );
}

// ============================================================
// PAGE: RESEARCH QUEUE
// ============================================================
function ResearchPage({ navigate }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeId, setActiveId] = useState(RESEARCH_ITEMS[0].id);
  const [toast, setToast] = useState(null);
  const active = RESEARCH_ITEMS.find(i => i.id === activeId) || RESEARCH_ITEMS[0];

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-1 overflow-hidden relative">
        <QueueRail items={RESEARCH_ITEMS} activeId={activeId} onSelect={(id) => { setActiveId(id); setDrawerOpen(false); }} onToggle={() => setDrawerOpen(!drawerOpen)} />
        {drawerOpen && <QueueDrawer items={RESEARCH_ITEMS} activeId={activeId} onSelect={(id) => { setActiveId(id); setDrawerOpen(false); }} onClose={() => setDrawerOpen(false)} title="items need research" renderBadge={(item) => <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: item.badgeColor + "22", color: item.badgeColor }}>{item.badge}</span>} />}

        <div className="flex-1 min-w-0">
          <DocViewer title={`${active.file} — Page 1 of ${active.pages}`}>
            <div className="text-center mb-4 pb-3 border-b-2 border-gray-200">
              <h3 className="text-sm font-bold">Medical Records</h3>
              <p className="text-[9px] text-gray-500">Received via {active.channel}</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center my-6">
              <div className="text-2xl mb-2">🔬</div>
              <div className="text-xs font-semibold text-amber-800">{active.badge}</div>
              <div className="text-[10px] text-amber-700 mt-1">{active.reason}</div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="text-[9px] font-semibold text-gray-500 uppercase mb-1">Document Content Preview</div>
              <div className="text-[10px] text-gray-600 leading-relaxed">This document contains clinical records that could not be automatically matched to an audit record. Manual research is required to identify the correct audit and apply indexing keywords.</div>
            </div>
          </DocViewer>
        </div>

        {/* Workbench */}
        <div className="flex flex-col bg-white border-l flex-shrink-0 overflow-hidden" style={{ width: 440, borderColor: COLORS.gray200 }}>
          <div className="px-5 py-4 border-b flex-shrink-0" style={{ borderColor: COLORS.gray200 }}>
            <div className="font-semibold text-sm">Research & Index</div>
            <div className="text-[11px] text-gray-500">Search for the correct audit and apply indexing</div>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {/* AI Analysis — Teal Wash */}
            <div className="rounded-xl p-4 mb-5 border" style={{ background: COLORS.aiGradient, borderColor: COLORS.aiBorder }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base" style={{ background: "rgba(217,119,6,0.1)" }}>🔬</div>
                <div><div className="text-xs font-semibold" style={{ color: COLORS.aiText }}>Manual Research Required</div><div className="text-[10px]" style={{ color: COLORS.aiTextMuted }}>{active.badge}</div></div>
              </div>
              <div className="rounded-lg p-3" style={{ background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.2)" }}>
                <div className="text-[9px] font-semibold uppercase tracking-wide mb-1" style={{ color: COLORS.amber }}>Reason</div>
                <div className="text-[11px]" style={{ color: COLORS.gray700 }}>{active.reason}</div>
              </div>
            </div>

            {/* Audit Search */}
            <div className="mb-5">
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Audit Search</div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {["Patient Name", "DOB", "Claim Number", "Audit Number", "Dates of Service", "Provider"].map((f, i) => (
                  <div key={i}><label className="text-[10px] text-gray-500">{f}</label><input className="w-full px-2 py-1.5 text-xs border rounded-md" style={{ borderColor: COLORS.gray200 }} placeholder={f} /></div>
                ))}
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-lg text-xs font-semibold text-white" style={{ background: COLORS.purple }}>Search</button>
                <button className="px-4 py-2 rounded-lg text-xs font-semibold border" style={{ borderColor: COLORS.gray200 }}>Clear</button>
              </div>
            </div>

            {/* Search Results placeholder */}
            <div className="text-center py-8 text-gray-400">
              <div className="text-3xl mb-2">🔍</div>
              <div className="text-xs">Search for an audit to begin indexing</div>
            </div>
          </div>
          <WorkbenchFooter itemNum={RESEARCH_ITEMS.indexOf(active) + 1} totalItems={RESEARCH_ITEMS.length} actions={<>
            <button className="px-4 py-2 rounded-lg text-xs font-semibold text-white opacity-50 cursor-not-allowed" style={{ background: COLORS.green }}>✓ Apply Index</button>
          </>} />
        </div>
      </div>
      <Toast message={toast?.msg} sub={toast?.sub} visible={!!toast} />
    </div>
  );
}

// ============================================================
// PAGE: INTENT REVIEW QUEUE
// ============================================================
function IntentReviewPage({ navigate }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeId, setActiveId] = useState(INTENT_ITEMS[0].id);
  const [intent, setIntent] = useState(null);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const active = INTENT_ITEMS.find(i => i.id === activeId) || INTENT_ITEMS[0];

  const selectItem = (id) => { setActiveId(id); setDrawerOpen(false); setIntent(null); setOverrideOpen(false); };

  const handleSubmit = () => {
    setToast({ msg: `Intent Resolved — ${intent === "agree" ? "Agree" : "Disagree"}`, sub: intent === "agree" ? "COM Signature Form · Event published" : "COM Appeals 1 · Event published" });
    setTimeout(() => setToast(null), 3000);
  };

  const isNoForm = active.scenario === "no-form";

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-1 overflow-hidden relative">
        <QueueRail items={INTENT_ITEMS} activeId={activeId} onSelect={selectItem} onToggle={() => setDrawerOpen(!drawerOpen)} />
        {drawerOpen && <QueueDrawer items={INTENT_ITEMS} activeId={activeId} onSelect={selectItem} onClose={() => setDrawerOpen(false)} title="items need intent review" renderBadge={(item) => <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: item.badgeColor + "22", color: item.badgeColor }}>{item.badge}</span>} />}

        {/* Doc Viewer */}
        <div className="flex-1 min-w-0">
          <DocViewer title={`${active.file} — Page 1 of ${active.pages}`}>
            {isNoForm ? (
              <>
                <div className="text-center mb-4 pb-3 border-b-2 border-gray-200"><h3 className="text-sm font-bold">Riverside Community Hospital</h3><p className="text-[9px] text-gray-500">Medical Records Department · Pittsburgh, PA</p></div>
                <div className="text-[10px] text-gray-600 mb-3">TO: CGI ProperPay — Medical Record Request</div>
                <div className="text-[10px] text-gray-500 mb-4 leading-relaxed">Please find attached the requested medical records for the patient below. Records include: H&P, Operative Report, Discharge Summary, Nursing Notes, Lab Results.</div>
                <table className="w-full text-[10px] mb-4 border-collapse">
                  {[["Patient", active.patient], ["MRN", "MRN-2025-88421"], ["Admission", "10/03/2025"], ["Discharge", "10/08/2025"]].map(([k, v], i) => (
                    <tr key={i}><td className="border border-gray-200 bg-gray-50 px-2 py-1 font-medium w-24">{k}</td><td className="border border-gray-200 px-2 py-1"><span className="px-1 rounded" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>{v}</span></td></tr>
                  ))}
                </table>
                <div className="border-2 border-dashed border-amber-400 rounded-lg p-6 text-center my-4" style={{ background: "#fef3c7" }}>
                  <div className="text-3xl mb-2">📋</div>
                  <div className="text-xs font-semibold text-amber-800">No Provider Response Form Detected</div>
                  <div className="text-[10px] text-amber-700 mt-1">This packet contains medical records and a cover letter but no response form.</div>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-4 pb-3 border-b-2 border-gray-200"><h3 className="text-sm font-bold">CGI — ProperPay Audit Findings Response</h3><p className="text-[9px] text-gray-500">FINDINGS LETTER (FINDALL)</p></div>
                <table className="w-full text-[10px] mb-3 border-collapse">
                  {[["Patient", active.patient], ["DOB", "07/22/1965"], ["DOS", "11/14/2025 – 11/18/2025"], ["Audit #", active.audit]].map(([k, v], i) => (
                    <tr key={i}><td className="border border-gray-200 bg-gray-50 px-2 py-1 font-medium w-24">{k}</td><td className="border border-gray-200 px-2 py-1"><span className="px-1 rounded" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>{v}</span></td></tr>
                  ))}
                </table>
                <div className="border-2 border-amber-400 rounded-lg p-3 my-3 relative">
                  <div className="absolute -top-2.5 left-3 text-[8px] font-semibold px-2 py-0.5 rounded" style={{ background: "#fef3c7", color: "#92400e" }}>🤖 AI analyzed this area</div>
                  <div className="flex items-center gap-2 mb-2 text-xs"><div className="w-4 h-4 rounded border-2 bg-blue-600 border-blue-600 text-white text-[8px] flex items-center justify-center">✓</div><span><strong>I AGREE</strong> with the audit findings</span></div>
                  <div className="flex items-center gap-2 text-xs"><div className="w-4 h-4 rounded border-2 border-gray-400" /><span><strong>I DISAGREE</strong> with the audit findings</span></div>
                </div>
                <div className="border-2 border-purple-400 rounded-lg p-3 my-3 relative">
                  <div className="absolute -top-2.5 left-3 text-[8px] font-semibold px-2 py-0.5 rounded" style={{ background: "#ede9fe", color: "#6b21a8" }}>🤖 AI analyzed comments</div>
                  <div className="text-[10px] text-gray-600 italic leading-relaxed">"I agree with the findings on the hip replacement but strongly disagree with the downcode on the shoulder arthroscopy. Please see attached operative report pp. 3-5."</div>
                </div>
              </>
            )}
          </DocViewer>
        </div>

        {/* Workbench */}
        <div className="flex flex-col bg-white border-l flex-shrink-0 overflow-hidden" style={{ width: 440, borderColor: COLORS.gray200 }}>
          <div className="px-5 py-4 border-b flex-shrink-0" style={{ borderColor: COLORS.gray200 }}>
            <div className="font-semibold text-sm">{isNoForm ? "Determine Provider Intent" : "Resolve Provider Intent"}</div>
            <div className="text-[11px] text-gray-500">{isNoForm ? "No response form detected — review packet context" : "Checkbox/content conflict — determine Agree or Disagree"}</div>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {/* AI Analysis Card — Teal Wash */}
            <div className="rounded-xl p-4 mb-5 border" style={{ background: COLORS.aiGradient, borderColor: COLORS.aiBorder }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base" style={{ background: "rgba(190,24,93,0.1)", color: COLORS.pink }}>🤖</div>
                <div><div className="text-xs font-semibold" style={{ color: COLORS.aiText }}>AI Intent Analysis</div><div className="text-[10px]" style={{ color: COLORS.aiTextMuted }}>{isNoForm ? "No response form detected" : "Checkbox/content conflict detected"}</div></div>
              </div>
              {!isNoForm ? (
                <div className="rounded-lg p-3 mb-3 bg-white border" style={{ borderColor: COLORS.aiBorder }}>
                  <div className="grid grid-cols-3 gap-2 items-center">
                    <div className="text-center p-2 rounded-lg" style={{ background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.2)" }}>
                      <div className="text-[9px] font-semibold uppercase mb-1" style={{ color: COLORS.amber }}>Checkbox</div>
                      <div className="text-sm font-bold" style={{ color: COLORS.aiText }}>✓ Agree</div>
                    </div>
                    <div className="text-center font-bold" style={{ color: COLORS.gray300 }}>VS</div>
                    <div className="text-center p-2 rounded-lg" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}>
                      <div className="text-[9px] font-semibold uppercase mb-1" style={{ color: COLORS.purple }}>Comments</div>
                      <div className="text-sm font-bold" style={{ color: COLORS.aiText }}>Mixed</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: `1px solid ${COLORS.gray200}` }}>
                    <span className="text-[10px]" style={{ color: COLORS.aiTextMuted }}>AI Confidence (content-wins)</span>
                    <span className="text-lg font-bold" style={{ color: COLORS.red }}>58%</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg p-4 mb-3 text-center bg-white border" style={{ borderColor: COLORS.aiBorder }}>
                  <div className="text-3xl mb-2">📋</div>
                  <div className="text-sm font-semibold" style={{ color: COLORS.aiText }}>No Provider Response Form</div>
                  <div className="text-xs mt-1" style={{ color: COLORS.aiTextMuted }}>Packet contains medical records and cover letter only</div>
                </div>
              )}
              <div className="rounded-lg p-3" style={{ background: isNoForm ? "rgba(124,58,237,0.06)" : "rgba(217,119,6,0.08)", border: `1px solid ${isNoForm ? "rgba(124,58,237,0.15)" : "rgba(217,119,6,0.2)"}` }}>
                <div className="text-[9px] font-semibold uppercase tracking-wide mb-1" style={{ color: isNoForm ? COLORS.purple : COLORS.amber }}>{isNoForm ? "ℹ" : "⚠"} Why Human Review Needed</div>
                <div className="text-[11px] leading-relaxed" style={{ color: COLORS.gray700 }}>{isNoForm ? "Provider sent records without a response form. Intent cannot be determined by AI." : "Provider checked Agree but written comments express partial disagreement on shoulder arthroscopy downcode."}</div>
              </div>
            </div>

            {/* Correspondence History */}
            <div className="mb-5">
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-3">Correspondence History</div>
              <div className="pl-5 relative">
                <div className="absolute left-[7px] top-1 bottom-1 w-0.5 bg-gray-200" />
                {(isNoForm ? [
                  { label: "Provider Response Received", code: "Current", date: "Jan 21, 2026", current: true },
                  { label: "Initial MR Request Sent", code: "REQMI", date: "Nov 20, 2025" },
                ] : [
                  { label: "Provider Response Received", code: "Current", date: "Jan 21, 2026", current: true },
                  { label: "Findings Letter Sent", code: "FINDALL", date: "Jan 3, 2026" },
                  { label: "Medical Records Received", code: "REC", date: "Dec 12, 2025" },
                  { label: "Initial MR Request Sent", code: "REQMI", date: "Nov 20, 2025" },
                ]).map((c, i) => (
                  <div key={i} className="relative pb-4 last:pb-0">
                    <div className={`absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full border-2 ${c.current ? "border-pink-600 bg-pink-50" : "border-gray-400 bg-white"}`} />
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-semibold">{c.label}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${c.current ? "bg-pink-50 text-pink-700" : "bg-gray-100 text-gray-500"}`}>{c.code}</span>
                    </div>
                    <div className="text-[10px] text-gray-500">{c.date}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Context */}
            <div className="mb-5">
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Matched Audit</div>
              <div className="grid grid-cols-2 gap-2">
                {[["Audit Number", active.audit], ["Patient", active.patient], ["Audit Type", "DRG Validation"], ["Status", isNoForm ? "Awaiting Records" : "Findings Issued"]].map(([l, v], i) => (
                  <div key={i} className="px-3 py-2 rounded-lg" style={{ background: COLORS.gray100 }}>
                    <div className="text-[9px] text-gray-500">{l}</div>
                    <div className="text-xs font-semibold">{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Intent Decision */}
            <div className="rounded-xl p-5 border-2" style={{ background: "#fdf2f8", borderColor: "#fbcfe8" }}>
              <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#9d174d" }}>Your Determination</div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {["agree", "disagree"].map(opt => (
                  <button key={opt} onClick={() => { setIntent(opt); setOverrideOpen(false); }}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${intent === opt ? (opt === "agree" ? "border-green-600 bg-green-50 shadow-sm shadow-green-200" : "border-red-600 bg-red-50 shadow-sm shadow-red-200") : "border-gray-200 bg-white hover:border-pink-400"}`}>
                    <div className="text-2xl mb-1">{opt === "agree" ? "✅" : "❌"}</div>
                    <div className="text-sm font-semibold">{opt === "agree" ? "Agree" : "Disagree"}</div>
                    <div className="text-[10px] text-gray-500 mt-1">{opt === "agree" ? "Provider accepts findings" : "Provider appeals findings"}</div>
                  </button>
                ))}
              </div>

              {intent && (
                <>
                  <div className="bg-white rounded-lg p-3 mb-3">
                    <div className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide mb-2">What happens next (from rules engine)</div>
                    <div className="flex items-center gap-2.5 p-2.5 rounded-lg mb-2" style={{ background: COLORS.gray100 }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: "#dbeafe", color: "#1d4ed8" }}>📄</div>
                      <div><div className="text-xs font-semibold">Response Type: {intent === "agree" ? "COM Signature Form" : "COM Appeals 1"}</div><div className="text-[10px] text-gray-500">FINDALL + {intent === "agree" ? "Agree" : "Disagree"} → {intent === "agree" ? "COM Signature Form" : "COM Appeals 1"}</div></div>
                    </div>
                    <div className="flex items-center gap-2.5 p-2.5 rounded-lg" style={{ background: COLORS.gray100 }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: intent === "agree" ? "#d1fae5" : "#fee2e2", color: intent === "agree" ? "#059669" : "#dc2626" }}>{intent === "agree" ? "→" : "⚡"}</div>
                      <div><div className="text-xs font-semibold">Triggers: {intent === "agree" ? "Provider Agreement workflow" : "Appeal Level 1 creation"}</div><div className="text-[10px] text-gray-500">{intent === "agree" ? "Audit → Ready for adjustment & reconciliation" : "Creates appeal in Audit Studio · SLA timer starts"}</div></div>
                    </div>
                  </div>

                  <button onClick={() => setOverrideOpen(!overrideOpen)} className="text-xs text-gray-500 hover:text-pink-600 flex items-center gap-1 mb-2">
                    <span>{overrideOpen ? "▾" : "▸"}</span> Override Response Type
                  </button>
                  {overrideOpen && (
                    <div className="bg-white border rounded-lg p-3" style={{ borderColor: "#fbcfe8" }}>
                      <div className="flex items-start gap-2 p-2 rounded-md mb-2 text-[10px]" style={{ background: "#fef3c7", color: "#92400e" }}>⚠️ Overriding rules engine output. Will be logged in audit trail.</div>
                      <div className="text-[10px] font-semibold mb-1" style={{ color: "#9d174d" }}>Select Response Type</div>
                      <select className="w-full px-2 py-1.5 text-xs border rounded-md mb-2" style={{ borderColor: COLORS.gray200 }}>
                        <option>— Use rules engine result —</option><option>MR ALL</option><option>MR Additional Documents</option><option>COM Signature Form</option><option>COM Appeals 1</option><option>COM Appeals 3</option>
                      </select>
                      <div className="text-[10px] font-semibold mb-1" style={{ color: "#9d174d" }}>Override Reason (required)</div>
                      <textarea className="w-full px-2 py-1.5 text-xs border rounded-md resize-y" style={{ borderColor: COLORS.gray200, minHeight: 50 }} placeholder="Explain why the rules engine result is incorrect..." />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <WorkbenchFooter itemNum={INTENT_ITEMS.indexOf(active) + 1} totalItems={INTENT_ITEMS.length} actions={<>
            <button className="px-4 py-2 rounded-lg text-xs font-semibold" style={{ background: "#fef3c7", color: "#b45309", border: "1px solid #fcd34d" }}>⚠ Research</button>
            <button onClick={handleSubmit} disabled={!intent} className={`px-4 py-2 rounded-lg text-xs font-semibold text-white ${!intent ? "opacity-40 cursor-not-allowed" : "hover:-translate-y-0.5"}`} style={{ background: `linear-gradient(135deg, ${COLORS.pink}, #9d174d)` }}>✓ Submit Determination</button>
          </>} />
        </div>
      </div>
      <Toast message={toast?.msg} sub={toast?.sub} visible={!!toast} />
    </div>
  );
}

// ============================================================
// PAGE: ANALYTICS
// ============================================================
function AnalyticsPage({ navigate }) {
  const barData = [
    { day: "Mon", total: 162, pcts: [82, 12, 4, 2] },
    { day: "Tue", total: 189, pcts: [85, 10, 3, 2] },
    { day: "Wed", total: 201, pcts: [84, 11, 3, 2] },
    { day: "Thu", total: 178, pcts: [80, 14, 4, 2] },
    { day: "Fri", total: 155, pcts: [83, 12, 3, 2] },
    { day: "Sat", total: 175, pcts: [84, 11, 3, 2] },
    { day: "Today", total: 187, pcts: [83, 12, 4, 1] },
  ];
  const barColors = [COLORS.greenLight, COLORS.blue, COLORS.amber, COLORS.red];
  const maxTotal = Math.max(...barData.map(d => d.total));

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div><h1 className="text-2xl font-bold" style={{ color: COLORS.dark }}>Analytics</h1><p className="text-sm text-gray-500">Document intake performance, trends, and operational intelligence</p></div>
        <div className="flex items-center gap-3">
          <select className="px-3 py-2 border rounded-lg text-xs font-medium" style={{ borderColor: COLORS.gray200 }}><option>Highmark BCBS</option><option>All Payers</option></select>
          <select className="px-3 py-2 border rounded-lg text-xs font-medium" style={{ borderColor: COLORS.gray200 }}><option>Last 7 Days</option><option>Today</option><option>Last 30 Days</option></select>
          <button className="px-4 py-2 rounded-lg text-xs font-medium border" style={{ borderColor: COLORS.gray200 }}>📤 Export</button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-6 gap-4 mb-7">
        {[
          { l: "Documents Received", v: "1,247", t: "↑ 8%", tc: COLORS.green },
          { l: "Auto-Indexed", v: "1,038", vc: COLORS.green, t: "83.2% rate", tc: COLORS.green },
          { l: "Human Verified", v: "152", t: "12.2% of total", tc: COLORS.gray500 },
          { l: "In Research", v: "41", vc: COLORS.amber, t: "↑ 3.3% exception", tc: COLORS.red },
          { l: "Avg Processing", v: "17s", t: "↓ 3s improvement", tc: COLORS.green },
          { l: "Errors", v: "16", t: "1.3% error rate", tc: COLORS.gray500 },
        ].map((m, i) => (
          <div key={i} className="bg-white rounded-xl px-5 py-4 shadow-sm">
            <div className="text-[10px] text-gray-500 font-medium mb-1.5">{m.l}</div>
            <div className="text-2xl font-bold tabular-nums" style={{ color: m.vc || COLORS.dark }}>{m.v}</div>
            <div className="text-[10px] font-medium mt-1" style={{ color: m.tc }}>{m.t}</div>
          </div>
        ))}
      </div>

      <SectionHeading title="Trends" sub="Volume, automation, and processing patterns over the selected period" />

      <div className="grid grid-cols-2 gap-5 mb-7">
        {/* Daily Volume */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b" style={{ borderColor: COLORS.gray100 }}><div className="text-sm font-semibold">Daily Volume & Outcome Split</div><div className="text-[10px] text-gray-500">Documents received per day with AI vs human breakdown</div></div>
          <div className="p-5">
            <div className="flex items-end gap-1.5" style={{ height: 140 }}>
              {barData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-[8px] font-semibold text-gray-600">{d.total}</div>
                  <div className="w-full rounded-t flex flex-col justify-end overflow-hidden" style={{ height: `${(d.total / maxTotal) * 100}%` }}>
                    {d.pcts.map((p, j) => <div key={j} style={{ height: `${p}%`, background: barColors[j] }} />)}
                  </div>
                  <div className="text-[8px] text-gray-400">{d.day}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-3 text-[10px] text-gray-500">
              {["Auto-Indexed", "Verified", "Research", "Error"].map((l, i) => (
                <span key={i} className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: barColors[i] }} />{l}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Automation Rate */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: COLORS.gray100 }}>
            <div><div className="text-sm font-semibold">Automation Rate Trend</div><div className="text-[10px] text-gray-500">Percentage auto-indexed without human review</div></div>
            <span className="text-2xl font-bold" style={{ color: COLORS.green }}>83.2%</span>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between text-[10px] mb-2"><span className="text-gray-500">Target: 90%</span><span className="font-semibold" style={{ color: COLORS.amber }}>6.8% below target</span></div>
            <div className="h-2 bg-gray-200 rounded-full relative mb-5">
              <div className="h-full rounded-full" style={{ width: "83.2%", background: `linear-gradient(90deg, ${COLORS.greenLight}, ${COLORS.green})` }} />
              <div className="absolute" style={{ left: "90%", top: -3, bottom: -3, width: 2, background: COLORS.amber, borderRadius: 1 }} />
            </div>
            <div className="text-xs font-semibold mb-2">7-Day Trend</div>
            <div className="flex items-end gap-1" style={{ height: 48 }}>
              {[82, 85, 84, 80, 83, 84, 83].map((v, i) => <div key={i} className="flex-1 rounded-t" style={{ height: `${v}%`, background: COLORS.greenLight }} />)}
            </div>
            <div className="flex justify-between text-[8px] text-gray-400 mt-1">{barData.map((d, i) => <span key={i}>{d.day}</span>)}</div>
          </div>
        </div>
      </div>

      {/* Operational Intelligence */}
      <SectionHeading title="Operational Intelligence" sub="Patterns that may require configuration changes or staffing adjustments" />

      <div className="grid grid-cols-2 gap-5 mb-7">
        {/* Verification Reasons */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b" style={{ borderColor: COLORS.gray100 }}><div className="text-sm font-semibold">Top Verification Queue Reasons</div><div className="text-[10px] text-gray-500">152 items, 7 days</div></div>
          <div className="p-5">
            {[
              { r: "Name variation (fuzzy match below threshold)", c: 94, p: 62 },
              { r: "Date of service mismatch (within tolerance)", c: 32, p: 21 },
              { r: "Multiple audit candidates (2 matches)", c: 17, p: 11 },
              { r: "Provider ID mismatch", c: 9, p: 6 },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 mb-3">
                <span className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold" style={{ background: COLORS.gray100, color: COLORS.gray500 }}>{i + 1}</span>
                <div className="flex-1">
                  <div className="text-xs font-medium mb-1">{item.r}</div>
                  <div className="h-1.5 rounded-full" style={{ background: COLORS.gray100 }}><div className="h-full rounded-full" style={{ width: `${item.p}%`, background: `linear-gradient(90deg, ${COLORS.blue}, #60a5fa)` }} /></div>
                </div>
                <span className="text-xs font-bold tabular-nums w-8 text-right">{item.c}</span>
                <span className="text-[10px] text-gray-500 w-8 text-right">{item.p}%</span>
              </div>
            ))}
            <div className="flex items-center gap-2.5 mt-4 p-3 rounded-lg text-xs border" style={{ background: "#faf5ff", borderColor: "#ede9fe", color: "#5b21b6" }}>
              💡 62% are name variations. <button onClick={() => navigate(PAGES.ADMIN)} className="font-semibold underline" style={{ color: COLORS.purple }}>Adjust Name Matching Thresholds</button>
            </div>
          </div>
        </div>

        {/* Channel Health */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b" style={{ borderColor: COLORS.gray100 }}><div className="text-sm font-semibold">Channel Health</div><div className="text-[10px] text-gray-500">Volume and exception rates by delivery channel</div></div>
          <div className="p-5">
            {[
              { icon: "📁", name: "SFTP", vol: "612 docs · 49%", auto: "87%", err: "1.8%", bg: "#d1fae5" },
              { icon: "📠", name: "Fax", vol: "387 docs · 31%", auto: "76%", err: "2.8%", bg: "#fef3c7", warn: true },
              { icon: "🌐", name: "Portal", vol: "198 docs · 16%", auto: "91%", err: "0.5%", bg: "#dbeafe" },
              { icon: "📬", name: "Mail/Scan", vol: "50 docs · 4%", auto: "72%", err: "4.0%", bg: "#ede9fe", warn: true },
            ].map((ch, i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b last:border-0" style={{ borderColor: COLORS.gray100 }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: ch.bg }}>{ch.icon}</div>
                <div className="flex-1"><div className="text-xs font-medium">{ch.name}</div><div className="text-[10px] text-gray-500">{ch.vol}</div></div>
                <div className="text-center"><div className={`text-xs font-bold ${ch.warn ? "text-amber-600" : ""}`}>{ch.auto}</div><div className="text-[8px] text-gray-400">Auto</div></div>
                <div className="text-center ml-4"><div className={`text-xs font-bold ${ch.warn ? "text-amber-600" : ""}`}>{ch.err}</div><div className="text-[8px] text-gray-400">Error</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Bar */}
      <div className="bg-white rounded-xl shadow-sm px-5 py-4 flex items-center justify-between">
        <span className="text-xs text-gray-500">📊 Showing analytics for <strong>Highmark BCBS</strong> · Last 7 days (Apr 1 – Apr 7, 2026)</span>
        <div className="flex gap-2">
          {["📄 PDF", "📊 CSV", "📧 Schedule"].map((b, i) => <button key={i} className="px-3 py-1.5 rounded-lg text-xs font-medium border" style={{ borderColor: COLORS.gray200 }}>{b}</button>)}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAGE: ADMIN CONFIGURATION
// ============================================================
function AdminPage({ navigate }) {
  const [activeTab, setActiveTab] = useState("routing");
  const [payer, setPayer] = useState("highmark");
  const [unsaved, setUnsaved] = useState(false);
  const [saveModal, setSaveModal] = useState(false);
  const [saveReason, setSaveReason] = useState("");

  const tabs = [
    { id: "routing", label: "Document Routing", scope: "Payer" },
    { id: "thresholds", label: "Matching & Thresholds", scope: "Payer" },
    { id: "completeness", label: "Completeness Rules", scope: "Payer" },
    { id: "response-rules", label: "Response Type Rules", scope: "Payer" },
    { id: "channels", label: "Channel Settings", scope: "Entity" },
  ];

  const routingRows = [
    { icon: "📄", name: "MR ALL", desc: "Initial medical record request", iconBg: "#dbeafe", ava: true, audit: true, pareo: false },
    { icon: "📎", name: "MR Additional Documents", desc: "Supplemental documentation", iconBg: "#dbeafe", ava: true, audit: false, pareo: false },
    { icon: "💵", name: "MR Billing", desc: "Itemized bills and charges", iconBg: "#d1fae5", ava: true, audit: true, pareo: false },
    { icon: "⚖️", name: "COM Appeals 1", desc: "First level appeal", iconBg: "#fef3c7", ava: true, audit: true, pareo: false },
    { icon: "⚖️", name: "COM Appeals 3", desc: "Final level appeal", iconBg: "#fef3c7", ava: true, audit: true, pareo: false },
    { icon: "✍️", name: "COM Signature Form", desc: "Provider agreement forms", iconBg: "#f3f4f6", ava: false, audit: true, pareo: false },
  ];

  const rulesMatrix = [
    { corr: "REQMI", corrColor: "#dbeafe", corrText: "#1d4ed8", intent: "—", intentColor: "#9ca3af", mrAction: "≠ REC", classify: "—", responseType: "MR ALL", event: "MR.DocumentIndexed" },
    { corr: "MRREM", corrColor: "#dbeafe", corrText: "#1d4ed8", intent: "—", intentColor: "#9ca3af", mrAction: "≠ REC", classify: "—", responseType: "MR ALL", event: "MR.DocumentIndexed" },
    { corr: "REQMI", corrColor: "#dbeafe", corrText: "#1d4ed8", intent: "—", intentColor: "#9ca3af", mrAction: "= REC", classify: "—", responseType: "MR Additional Docs", event: "MR.DocumentIndexed" },
    { corr: "OUTREACH", corrColor: "#d1fae5", corrText: "#065f46", intent: "—", intentColor: "#9ca3af", mrAction: "= REC", classify: "= I-Bill", responseType: "MR Billing", event: "MR.DocumentIndexed" },
    { corr: "FINDALL", corrColor: "#fef3c7", corrText: "#92400e", intent: "Agree", intentColor: "#059669", mrAction: "—", classify: "—", responseType: "COM Signature Form", event: "MR.ProviderAgreementReceived", eventColor: "#059669" },
    { corr: "FINDALL", corrColor: "#fef3c7", corrText: "#92400e", intent: "Disagree", intentColor: "#dc2626", mrAction: "—", classify: "—", responseType: "COM Appeals 1", event: "MR.AppealOneSubmitted", eventColor: "#dc2626" },
    { corr: "APALL1", corrColor: "#fee2e2", corrText: "#991b1b", intent: "Agree", intentColor: "#059669", mrAction: "—", classify: "—", responseType: "COM Signature Form", event: "MR.ProviderAgreementReceived", eventColor: "#059669" },
    { corr: "APALL1", corrColor: "#fee2e2", corrText: "#991b1b", intent: "Disagree", intentColor: "#dc2626", mrAction: "—", classify: "—", responseType: "COM Appeals 3", event: "MR.AppealThreeSubmitted", eventColor: "#dc2626" },
    { corr: "APALL3", corrColor: "#fee2e2", corrText: "#991b1b", intent: "Disagree", intentColor: "#dc2626", mrAction: "—", classify: "—", responseType: "→ Research Queue", event: "Final appeal exhausted", isResearch: true },
  ];

  const Toggle = ({ defaultChecked = false }) => (
    <label className="relative inline-block w-10 h-5 cursor-pointer">
      <input type="checkbox" defaultChecked={defaultChecked} onChange={() => setUnsaved(true)} className="sr-only peer" />
      <div className="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-purple-600 transition-colors" />
      <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
    </label>
  );

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="text-xs text-gray-500 mb-1"><button onClick={() => navigate(PAGES.HOME)} className="text-purple-600 hover:underline">Document Manager</button> / Admin</div>
          <h1 className="text-2xl font-bold" style={{ color: COLORS.dark }}>Configuration</h1>
          <p className="text-sm text-gray-500">Manage routing, thresholds, rules, and channel settings</p>
        </div>
        <div className="flex items-center gap-3">
          {unsaved && <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600"><span className="w-2 h-2 rounded-full bg-amber-500" />Unsaved changes</span>}
          <button className="px-4 py-2 rounded-lg text-xs font-medium border" style={{ borderColor: COLORS.gray200 }}>Export</button>
          <button onClick={() => setSaveModal(true)} className="px-4 py-2 rounded-lg text-xs font-semibold text-white" style={{ background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.darkPurple})` }}>💾 Save Changes</button>
        </div>
      </div>

      {/* Scope Selector */}
      <div className="bg-white border rounded-xl px-5 py-3.5 mb-5 flex items-center justify-between" style={{ borderColor: COLORS.gray200 }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-lg flex items-center justify-center text-base" style={{ background: "#ede9fe" }}>🏢</div><div><div className="text-[9px] text-gray-500 font-semibold uppercase">Operating Entity</div><div className="text-sm font-semibold">CGI ProperPay</div></div></div>
          <span className="text-gray-300 text-lg">→</span>
          <div className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-lg flex items-center justify-center text-base" style={{ background: "#dbeafe" }}>🏥</div><div><div className="text-[9px] text-gray-500 font-semibold uppercase">Payer Configuration</div><select value={payer} onChange={e => setPayer(e.target.value)} className="text-sm font-semibold border rounded-md px-2 py-1 min-w-[180px]" style={{ borderColor: COLORS.gray200 }}><option value="highmark">Highmark BCBS</option><option value="anthem">Anthem Blue Cross</option><option value="defaults">— Global Defaults —</option></select></div></div>
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: payer === "defaults" ? "#d1fae5" : "#fef3c7", color: payer === "defaults" ? "#065f46" : "#92400e" }}>{payer === "defaults" ? "Global Defaults" : "3 overrides"}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b" style={{ borderColor: COLORS.gray200 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-5 py-3 text-xs font-medium relative flex items-center gap-1.5 ${activeTab === t.id ? "text-purple-600" : "text-gray-500 hover:text-gray-900"}`}>
            {t.label}
            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${t.scope === "Payer" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"}`}>{t.scope}</span>
            {activeTab === t.id && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5" style={{ background: COLORS.purple }} />}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "routing" && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: COLORS.gray200 }}>
            <div><div className="font-semibold">Document Type Routing</div><div className="text-xs text-gray-500">Configure which systems receive indexed documents for {payer === "defaults" ? "all payers" : "Highmark"}</div></div>
            <button className="px-3 py-1.5 rounded-lg text-xs font-medium border" style={{ borderColor: COLORS.gray200 }}>+ Add Doc Type</button>
          </div>
          <table className="w-full">
            <thead><tr className="bg-gray-50 border-b" style={{ borderColor: COLORS.gray200 }}>
              {["Document Type", "AVA", "Audit Studio", "Pareo", "Actions"].map((h, i) => <th key={i} className="text-left px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}
            </tr></thead>
            <tbody>
              {routingRows.map((r, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-gray-50" style={{ borderColor: COLORS.gray100 }}>
                  <td className="px-5 py-3"><div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: r.iconBg }}>{r.icon}</div><div><div className="text-sm font-medium">{r.name}</div><div className="text-[10px] text-gray-500">{r.desc}</div></div></div></td>
                  <td className="px-5 py-3"><Toggle defaultChecked={r.ava} /></td>
                  <td className="px-5 py-3"><Toggle defaultChecked={r.audit} /></td>
                  <td className="px-5 py-3"><Toggle defaultChecked={r.pareo} /></td>
                  <td className="px-5 py-3"><button className="px-3 py-1 rounded-md text-xs font-medium border" style={{ borderColor: COLORS.gray200 }}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "thresholds" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: COLORS.gray200 }}>
              <div><div className="font-semibold">Confidence Routing Thresholds</div><div className="text-xs text-gray-500">How documents are routed based on AI match confidence</div></div>
              <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: "#f0fdf4", color: "#065f46" }}>Current auto-index rate: 83%</span>
            </div>
            <div className="p-6 grid grid-cols-3 gap-5">
              {[
                { icon: "✓", iconBg: "#d1fae5", iconColor: "#065f46", title: "Auto-Approve", sub: "High confidence", prefix: "≥", val: "95", inherited: false },
                { icon: "👁", iconBg: "#fef3c7", iconColor: "#92400e", title: "Verification Queue", sub: "Human verification", val1: "80", val2: "94", inherited: true },
                { icon: "!", iconBg: "#fee2e2", iconColor: "#991b1b", title: "Research Queue", sub: "Manual research", prefix: "<", val: "80", inherited: true },
              ].map((t, i) => (
                <div key={i} className="p-5 rounded-xl border" style={{ background: COLORS.gray100, borderColor: COLORS.gray200 }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold" style={{ background: t.iconBg, color: t.iconColor }}>{t.icon}</div>
                    <div><div className="font-semibold text-sm">{t.title}</div><div className="text-xs text-gray-500">{t.sub}</div></div>
                  </div>
                  <div className="flex items-center gap-2">
                    {t.prefix && <span className="text-sm text-gray-500">{t.prefix}</span>}
                    <input className="w-16 px-2.5 py-2 border rounded-lg text-base font-bold text-center" style={{ borderColor: COLORS.gray200 }} defaultValue={t.val || t.val1} onChange={() => setUnsaved(true)} />
                    {t.val2 && <><span className="text-sm text-gray-500">% to</span><input className="w-16 px-2.5 py-2 border rounded-lg text-base font-bold text-center" style={{ borderColor: COLORS.gray200 }} defaultValue={t.val2} onChange={() => setUnsaved(true)} /></>}
                    <span className="text-sm text-gray-500">%</span>
                  </div>
                  <div className={`mt-3 text-[10px] font-semibold inline-flex items-center gap-1 px-2 py-0.5 rounded ${t.inherited ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                    {t.inherited ? "✓ Using global default" : "⚠ Overridden (default: 95%)"}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b" style={{ borderColor: COLORS.gray200 }}><div className="font-semibold">Matching Settings</div><div className="text-xs text-gray-500">Name matching, date tolerances, and scoring</div></div>
            <div className="p-6 grid grid-cols-2 gap-5">
              <div className="p-5 rounded-xl border" style={{ background: COLORS.gray100, borderColor: COLORS.gray200 }}>
                <div className="font-semibold text-sm mb-1">Name Matching</div>
                <div className="text-xs text-gray-500 mb-4">Patient name comparison settings</div>
                {[["Similarity Threshold", "0.85"], ["Exact Match Threshold", "0.95"]].map(([l, v], i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b" style={{ borderColor: COLORS.gray100 }}><span className="text-xs text-gray-700">{l}</span><input className="w-24 px-2 py-1 text-xs text-center border rounded-md" style={{ borderColor: COLORS.gray200 }} defaultValue={v} onChange={() => setUnsaved(true)} /></div>
                ))}
                {["Nickname Expansion (Rob → Robert)", "Phonetic Matching", "Strip Suffixes (Jr., Sr.)"].map((l, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: COLORS.gray100 }}><span className="text-xs text-gray-700">{l}</span><Toggle defaultChecked={true} /></div>
                ))}
              </div>
              <div className="p-5 rounded-xl border" style={{ background: COLORS.gray100, borderColor: COLORS.gray200 }}>
                <div className="font-semibold text-sm mb-1">Date Matching Tolerances</div>
                <div className="text-xs text-gray-500 mb-4">Allowed variance for date comparisons</div>
                {[["Admission Date", "± 3 days"], ["Discharge Date", "± 5 days"], ["Date of Birth", "Exact"]].map(([l, v], i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b" style={{ borderColor: COLORS.gray100 }}><span className="text-xs text-gray-700">{l}</span><input className="w-24 px-2 py-1 text-xs text-center border rounded-md" style={{ borderColor: COLORS.gray200 }} defaultValue={v} onChange={() => setUnsaved(true)} /></div>
                ))}
                <div className="mt-3"><div className="text-xs text-gray-500 mb-2">Scoring Mode</div>
                  <div className="flex gap-3">{["Graduated", "Binary", "Exact Only"].map((m, i) => (
                    <label key={i} className="flex items-center gap-1.5 text-xs cursor-pointer"><input type="radio" name="scoring" defaultChecked={i === 0} className="accent-purple-600" />{m}</label>
                  ))}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "completeness" && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: COLORS.gray200 }}>
            <div><div className="font-semibold">Document Completeness Rules</div><div className="text-xs text-gray-500">Required documents based on claim characteristics</div></div>
            <button className="px-3 py-1.5 rounded-lg text-xs font-medium border" style={{ borderColor: COLORS.gray200 }}>+ Add Rule</button>
          </div>
          {[
            { icon: "🔪", name: "Surgical Claims Require Operative Notes", desc: "When claim has ICD-10-PCS procedure codes", on: true },
            { icon: "💵", name: "Charge Audits Require Itemized Bill", desc: "When audit type is Charge/Itemized Review", on: true },
            { icon: "🏥", name: "Extended Stay Requires Discharge Summary", desc: "When inpatient LOS > 3 days", on: true },
            { icon: "🚑", name: "Emergency Admits Require ED Notes", desc: "When admission type is Emergency", on: false },
          ].map((r, i) => (
            <div key={i} className={`flex items-center justify-between px-6 py-4 border-b last:border-0 ${!r.on ? "opacity-50" : ""}`} style={{ borderColor: COLORS.gray100 }}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ background: COLORS.gray100 }}>{r.icon}</div>
                <div><div className="text-sm font-medium">{r.name}</div><div className="text-xs text-gray-500">{r.desc}</div></div>
              </div>
              <div className="flex items-center gap-4">
                <Toggle defaultChecked={r.on} />
                <button className="px-3 py-1 rounded-md text-xs font-medium border" style={{ borderColor: COLORS.gray200 }}>Edit</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "response-rules" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: COLORS.gray200 }}>
              <div><div className="font-semibold">Response Type Decision Matrix</div><div className="text-xs text-gray-500">Rules engine for E-MRI-09 — determines Response Type from correspondence history and intent</div></div>
              <span className="text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-wide" style={{ background: COLORS.gray100, color: COLORS.gray500 }}>🔒 Read-Only MVP</span>
            </div>
            <table className="w-full text-xs">
              <thead><tr className="bg-gray-50 border-b" style={{ borderColor: COLORS.gray200 }}>
                {["Correspondence", "Intent", "Last MR Action", "Classify", "Response Type", "Event"].map((h, i) => <th key={i} className="text-left px-4 py-2.5 text-[9px] font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}
              </tr></thead>
              <tbody>
                {rulesMatrix.map((r, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-pink-50" style={{ borderColor: COLORS.gray100 }}>
                    <td className="px-4 py-3"><span className="text-[10px] font-semibold px-2 py-0.5 rounded" style={{ background: r.corrColor, color: r.corrText }}>{r.corr}</span></td>
                    <td className="px-4 py-3"><span className="text-[10px] font-semibold" style={{ color: r.intentColor }}>{r.intent}</span></td>
                    <td className="px-4 py-3 text-gray-600">{r.mrAction}</td>
                    <td className="px-4 py-3 text-gray-600">{r.classify}</td>
                    <td className="px-4 py-3"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${r.isResearch ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-700"}`}>{r.responseType}</span></td>
                    <td className="px-4 py-3 text-[10px]" style={{ color: r.eventColor || COLORS.gray500 }}>{r.event}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "channels" && (
        <div>
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-lg mb-5 text-xs border" style={{ background: "#ede9fe", borderColor: "#c4b5fd", color: "#5b21b6" }}>
            🏢 These settings apply to <strong>CGI ProperPay</strong> (Operating Entity level) and are shared across all payers.
          </div>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b" style={{ borderColor: COLORS.gray200 }}><div className="font-semibold">Delivery Channels</div><div className="text-xs text-gray-500">Document ingestion sources and connection settings</div></div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {[
                { icon: "🌐", name: "Provider Portal", bg: "#dbeafe", status: "Active", details: [["Endpoint", "/api/v1/documents/upload"], ["Max file", "50 MB"], ["Formats", "PDF, TIF, PNG"]] },
                { icon: "📁", name: "SFTP", bg: "#d1fae5", status: "Active", details: [["Endpoint", "sftp.properpay.cgi.com"], ["Polling", "Every 5 min"], ["Directory", "/inbound/medical-records/"]] },
                { icon: "📠", name: "Fax Gateway", bg: "#fef3c7", status: "Active", details: [["Fax #", "(800) 555-0142"], ["Provider", "RingCentral"], ["Auto-OCR", "Enabled"]] },
                { icon: "📬", name: "Mail / Scan", bg: "#ede9fe", status: "Active", details: [["Directory", "/inbound/scanned/"], ["Polling", "Every 15 min"], ["Auto-OCR", "Enabled"]] },
                { icon: "📧", name: "Email", bg: "#fce7f3", status: "Inactive", inactive: true, details: [["Status", "Not configured"]] },
              ].map((ch, i) => (
                <div key={i} className={`p-5 rounded-xl border ${ch.inactive ? "opacity-50" : ""}`} style={{ background: COLORS.gray100, borderColor: COLORS.gray200 }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-lg flex items-center justify-center text-base" style={{ background: ch.bg }}>{ch.icon}</div><span className="font-semibold text-sm">{ch.name}</span></div>
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${ch.inactive ? "bg-gray-200 text-gray-500" : "bg-green-100 text-green-700"}`}>{ch.status}</span>
                  </div>
                  {ch.details.map(([l, v], j) => (
                    <div key={j} className="flex justify-between py-1.5 text-xs"><span className="text-gray-500">{l}</span><span className="font-medium">{v}</span></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Audit Trail */}
      <div className="bg-white rounded-xl shadow-sm mt-6 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: COLORS.gray200 }}>
          <div><div className="font-semibold text-sm">Recent Configuration Changes</div><div className="text-xs text-gray-500">Audit trail with reasons</div></div>
          <button className="px-3 py-1.5 rounded-lg text-xs font-medium border" style={{ borderColor: COLORS.gray200 }}>View Full Log</button>
        </div>
        {[
          { avatar: "DM", name: "David Morrison", action: 'updated Auto-Approve Threshold: ', old: "90%", new_: "95%", scope: "Highmark", reason: "Reducing false positives after 3 mis-indexed appeals", time: "Today, 9:14 AM", tab: "Matching & Thresholds" },
          { avatar: "DM", name: "David Morrison", action: "enabled COM Signature Form → Audit Studio routing", scope: "Highmark", reason: "Highmark requested signed forms route to Audit Studio for reconciliation", time: "Yesterday, 3:42 PM", tab: "Document Routing" },
          { avatar: "RR", name: "Rani Ramahi", action: "added completeness rule: Emergency Admits Require ED Notes", scope: "Global Default", reason: "New requirement per QA review — missing ED notes caused 12 rework items", time: "Apr 4, 2026", tab: "Completeness Rules" },
        ].map((a, i) => (
          <div key={i} className="flex items-start gap-3.5 px-6 py-3.5 border-b last:border-0" style={{ borderColor: COLORS.gray100 }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0" style={{ background: "#ede9fe", color: COLORS.purple }}>{a.avatar}</div>
            <div className="flex-1">
              <div className="text-xs"><strong>{a.name}</strong> {a.action}{a.old && <><span className="line-through text-red-500">{a.old}</span> → <span className="font-semibold text-green-600">{a.new_}</span></>} for {a.scope}</div>
              <div className="text-[10px] text-gray-500 italic mt-1 pl-3 border-l-2" style={{ borderColor: COLORS.gray200 }}>"{a.reason}"</div>
              <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-2"><span>{a.time}</span><span>·</span><span>{a.tab}</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* Save Modal */}
      {saveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: COLORS.gray200 }}>
              <span className="text-lg font-semibold">Save Configuration Changes</span>
              <button onClick={() => setSaveModal(false)} className="w-8 h-8 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100" style={{ background: COLORS.gray100 }}>✕</button>
            </div>
            <div className="p-6">
              <div className="rounded-lg p-3 mb-4" style={{ background: COLORS.gray100 }}>
                <div className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Changes to save</div>
                <div className="text-xs flex items-center gap-2"><span className="font-medium">Auto-Approve Threshold:</span><span className="text-red-500 line-through">90%</span><span>→</span><span className="text-green-600 font-semibold">95%</span></div>
              </div>
              <label className="text-xs font-medium block mb-2">Change Reason (required)</label>
              <textarea value={saveReason} onChange={e => setSaveReason(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-lg resize-y" style={{ borderColor: COLORS.gray200, minHeight: 70 }} placeholder="Explain why these changes are being made..." />
              <div className="text-[10px] text-gray-500 mt-2">Scope: <strong>Highmark BCBS</strong> · Changes take effect immediately.</div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: COLORS.gray200 }}>
              <button onClick={() => setSaveModal(false)} className="px-4 py-2 rounded-lg text-xs font-medium border" style={{ borderColor: COLORS.gray200 }}>Cancel</button>
              <button onClick={() => { if (!saveReason.trim()) { alert("Please provide a change reason."); return; } setSaveModal(false); setUnsaved(false); setSaveReason(""); }} className="px-4 py-2 rounded-lg text-xs font-semibold text-white" style={{ background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.darkPurple})` }}>💾 Confirm & Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN APP — Navigation Shell
// ============================================================
export default function App() {
  const [page, setPage] = useState(PAGES.HOME);
  const [queueTab, setQueueTab] = useState("Verification");

  const navigate = useCallback((target) => {
    setPage(target);
    if (target === PAGES.VERIFY) setQueueTab("Verification");
    if (target === PAGES.RESEARCH) setQueueTab("Research");
    if (target === PAGES.INTENT) setQueueTab("Intent Review");
    window.scrollTo(0, 0);
  }, []);

  const isQueuePage = [PAGES.VERIFY, PAGES.RESEARCH, PAGES.INTENT].includes(page);
  const queuePageHeight = "calc(100vh - 100px)";

  return (
    <div className="min-h-screen" style={{ background: COLORS.bgPage, fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Global Header */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 shadow-md" style={{ background: COLORS.gradientHeader, height: 52 }}>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 text-white">
            <span className="font-bold text-base tracking-tight">ClaimCompl<span className="font-normal opacity-90">AI</span></span>
            <div className="w-px h-5 bg-white/30" />
            <span className="font-medium text-sm opacity-95">Document Manager</span>
          </div>
          <nav className="flex gap-1">
            {[
              { id: PAGES.HOME, label: "Home" },
              { id: "queues", label: "Queues" },
              { id: PAGES.ANALYTICS, label: "Analytics" },
              { id: PAGES.ADMIN, label: "Admin" },
            ].map(t => (
              <button key={t.id} onClick={() => t.id === "queues" ? navigate(PAGES.VERIFY) : navigate(t.id)}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${(t.id === page || (t.id === "queues" && isQueuePage)) ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
                {t.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1 rounded-md text-white bg-white/15 border border-white/25">Highmark</span>
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-semibold text-white">DM</div>
        </div>
      </header>

      {/* Queue Sub-Nav */}
      {isQueuePage && (
        <div className="fixed left-0 right-0 z-30 bg-white border-b flex items-center justify-between px-6" style={{ top: 52, height: 48, borderColor: COLORS.gray200 }}>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(PAGES.HOME)} className="text-xs text-gray-500 hover:text-gray-900 px-2 py-1">← Home</button>
            <div className="flex items-center gap-2 ml-2">
              <div className="w-7 h-7 rounded-md flex items-center justify-center text-sm" style={{ background: queueTab === "Intent Review" ? "linear-gradient(135deg, #fce7f3, #fbcfe8)" : queueTab === "Research" ? "linear-gradient(135deg, #fef3c7, #fde68a)" : "linear-gradient(135deg, #dbeafe, #bfdbfe)" }}>
                {queueTab === "Intent Review" ? "💬" : queueTab === "Research" ? "🔬" : "🔍"}
              </div>
              <span className="text-sm font-semibold">{queueTab} Queue</span>
            </div>
          </div>
          <div className="flex gap-1">
            {QUEUE_TABS.map(t => (
              <button key={t} onClick={() => {
                if (t === "Verification") navigate(PAGES.VERIFY);
                else if (t === "Research") navigate(PAGES.RESEARCH);
                else if (t === "Intent Review") navigate(PAGES.INTENT);
              }}
                className={`px-4 py-3 text-xs font-medium relative flex items-center gap-1.5 ${queueTab === t ? (t === "Intent Review" ? "text-pink-600" : "text-purple-600") : "text-gray-500 hover:text-gray-900"}`}>
                {t}
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${t === "Verification" ? "bg-blue-100 text-blue-600" : t === "Research" ? "bg-amber-100 text-amber-700" : t === "Intent Review" ? "bg-pink-100 text-pink-700" : "bg-green-100 text-green-700"}`}>
                  {t === "Verification" ? 8 : t === "Research" ? 3 : t === "Intent Review" ? 3 : 179}
                </span>
                {queueTab === t && <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: t === "Intent Review" ? COLORS.pink : COLORS.purple }} />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Page Content */}
      <div style={{ marginTop: isQueuePage ? 100 : 52 }}>
        {isQueuePage ? (
          <div style={{ height: queuePageHeight }}>
            {page === PAGES.VERIFY && <VerificationPage navigate={navigate} />}
            {page === PAGES.RESEARCH && <ResearchPage navigate={navigate} />}
            {page === PAGES.INTENT && <IntentReviewPage navigate={navigate} />}
          </div>
        ) : (
          <>
            {page === PAGES.HOME && <HomePage navigate={navigate} />}
            {page === PAGES.ANALYTICS && <AnalyticsPage navigate={navigate} />}
            {page === PAGES.ADMIN && <AdminPage navigate={navigate} />}
          </>
        )}
      </div>

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        * { scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.15) transparent; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 2px; }
        input[type="number"]::-webkit-outer-spin-button, input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; }
      `}</style>
    </div>
  );
}