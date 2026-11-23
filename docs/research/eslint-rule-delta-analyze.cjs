const fs = require("fs"); const D = process.argv[2];
const J = f => JSON.parse(fs.readFileSync(`${D}/${f}.json`, "utf8"));
const sev = v => { const s = Array.isArray(v) ? v[0] : v; return s === 0 || s === "off" ? 0 : s === 1 || s === "warn" ? 1 : 2; };
const norm = v => { const a = Array.isArray(v) ? v : [v]; return JSON.stringify([sev(a), ...a.slice(1)]); };
const S = ["off", "warn", "error"];
const out = [];
// violations
const count = f => { const c = {}; let fatal = 0, files = 0; for (const r of J(f)) { if (r.messages.length) files++; for (const m of r.messages) { if (m.fatal) fatal++; const k = `${m.ruleId || "FATAL:" + m.message.slice(0, 60)}|${m.severity}`; c[k] = (c[k] || 0) + 1; } } return { c, fatal, files }; };
const b = count("before"), a = count("after");
const tot = x => Object.entries(x.c).reduce((t, [k, n]) => { t[k.endsWith("|2") ? "errors" : "warnings"] += n; return t; }, { errors: 0, warnings: 0 });
out.push("## Violations across the repo (`eslint .`)\n", "| | errors | warnings | files with messages | fatal parse errors |", "|---|---|---|---|---|",
  `| before (airbnb) | ${tot(b).errors} | ${tot(b).warnings} | ${b.files} | ${b.fatal} |`, `| after (@react-native) | ${tot(a).errors} | ${tot(a).warnings} | ${a.files} | ${a.fatal} |`, "");
out.push("### Per-rule change in violation counts\n", "| rule | severity | before | after |", "|---|---|---|---|");
const keys = [...new Set([...Object.keys(b.c), ...Object.keys(a.c)])].filter(k => (b.c[k] || 0) !== (a.c[k] || 0)).sort((x, y) => (a.c[y] || 0) - (b.c[y] || 0) - ((a.c[x] || 0) - (b.c[x] || 0)));
for (const k of keys) { const [r, s] = k.split("|"); out.push(`| \`${r}\` | ${S[s]} | ${b.c[k] || 0} | ${a.c[k] || 0} |`); }
// config delta
const lost = {}, gained = {}, changed = {};
for (const k of ["TSX", "JS", "TEST"]) {
  const B = J(`before-${k}`), A = J(`after-${k}`);
  out.push("", `Parser for ${k}: before \`${(B.parser||"").split("node_modules/").pop()}\`, after \`${(A.parser||"").split("node_modules/").pop()}\``);
  for (const r of new Set([...Object.keys(B.rules), ...Object.keys(A.rules)])) {
    const bs = B.rules[r] ? sev(B.rules[r]) : 0, as = A.rules[r] ? sev(A.rules[r]) : 0;
    if (bs && !as) (lost[r] ||= { s: S[bs], f: [] }).f.push(k);
    else if (!bs && as) (gained[r] ||= { s: S[as], f: [] }).f.push(k);
    else if (bs && as && norm(B.rules[r]) !== norm(A.rules[r])) (changed[r] ||= { b: norm(B.rules[r]), a: norm(A.rules[r]), f: [] }).f.push(k);
  }
}
const viol = r => (a.c[`${r}|1`] || 0) + (a.c[`${r}|2`] || 0);
const violB = r => (b.c[`${r}|1`] || 0) + (b.c[`${r}|2`] || 0);
const tbl = (title, o, row, head) => { out.push("", `## ${title} (${Object.keys(o).length})\n`, head, head.replace(/[^|]+/g, "---")); for (const r of Object.keys(o).sort()) out.push(row(r, o[r])); };
tbl("Rules active today that disappear", lost, (r, v) => `| \`${r}\` | ${v.s} | ${v.f.join(", ")} | ${violB(r)} |`, "| rule | severity today | file kinds | violations today |");
tbl("Rules new from the React Native base", gained, (r, v) => `| \`${r}\` | ${v.s} | ${v.f.join(", ")} | ${viol(r)} |`, "| rule | severity | file kinds | violations |");
tbl("Rules active in both whose severity or options change", changed, (r, v) => `| \`${r}\` | \`${v.b}\` | \`${v.a}\` | ${v.f.join(", ")} | ${violB(r)} → ${viol(r)} |`, "| rule | before | after | file kinds | violations |");
// dead overrides
const local = require(process.cwd() + "/.eslintrc.js").rules; const base = J("base-TSX").rules; const before = J("before-TSX").rules;
out.push("", "## Local overrides that become dead after the swap\n", "A local rule is dead when the swapped base (all `extends`, no local `rules`) already gives the same result for a `.tsx` file.\n", "| local rule | local value | base-only value after swap |", "|---|---|---|");
let dead = 0;
for (const [r, v] of Object.entries(local)) { const bv = base[r]; const same = bv ? norm(bv) === norm(v) : sev(v) === 0; if (same) { dead++; out.push(`| \`${r}\` | \`${norm(v)}\` | \`${bv ? norm(bv) : "not set"}\` |`); } }
out.push("", `${dead} of ${Object.keys(local).length} local rules are dead.`);
console.log(out.join("\n"));
