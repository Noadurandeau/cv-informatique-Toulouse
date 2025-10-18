
// Helpers
function getParam(name){ const url = new URL(window.location.href); return url.searchParams.get(name); }
async function copy(text){
  try { await navigator.clipboard.writeText(text); alert("Copié ✔"); }
  catch (e) { const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t); alert("Copié ✔"); }
}
let STATE = { profiles: [], current: null };
function setAccent(color){ document.documentElement.style.setProperty('--brand', color || '#7C3AED'); }
function setTheme(next){ document.documentElement.setAttribute('data-theme', next); localStorage.setItem('cv.theme', next); }
function toggleTheme(){ const cur = document.documentElement.getAttribute('data-theme') || 'dark'; setTheme(cur === 'dark' ? 'light' : 'dark'); }

function dateRange(start, end){
  const fmt = (s) => (!s ? "" : s.length === 7 ? s : (s || "").slice(0,7));
  const months = ["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];
  const f = (iso) => { const [y,m] = iso.split("-"); return months[parseInt(m,10)-1] + " " + y; };
  const s = fmt(start), e = fmt(end);
  if (!s && !e) return "";
  if (s && e) return `${f(s)} – ${f(e)}`;
  if (s && !e) return `${f(s)} – présent`;
  return e;
}
function linkOrText(label, value, href){
  const li = document.createElement('li'); li.className = "item";
  const span = document.createElement('span'); span.className="badge"; span.textContent = label;
  li.appendChild(span);
  if (href) { const a = document.createElement('a'); a.href = href; a.textContent = value; a.target="_blank"; a.rel="noopener"; li.appendChild(a); }
  else { const s = document.createElement('span'); s.textContent = value; li.appendChild(s); }
  return li;
}

function renderProfile(profileId){
  const p = STATE.profiles.find(x => x.id === profileId) || STATE.profiles[0];
  STATE.current = p;

  // Accent & title
  setAccent(p.theme?.accent);
  document.getElementById('brandName').textContent = p.label || p.role || "CV";
  document.title = `CV – ${p.name}`;

  // Hero
  const [first, ...rest] = p.name.split(" ");
  document.getElementById('firstName').textContent = first || p.name;
  document.getElementById('lastName').textContent = rest.join(" ") || "";
  document.getElementById('role').textContent = p.role;
  document.getElementById('summary').textContent = p.summary;
  document.getElementById('avatar').src = p.avatar || "assets/avatar.jpg";

  // Contact
  const c = p.contact || {};
  const ul = document.getElementById('contact'); ul.innerHTML = "";
  if (c.email) ul.appendChild(linkOrText("Email", c.email, `mailto:${c.email}`));
  if (c.phone) ul.appendChild(linkOrText("Téléphone", c.phone, `tel:${c.phone.replace(/\s+/g,"")}`));
  if (c.location) ul.appendChild(linkOrText("Localisation", c.location));
  if (c.driving_license) ul.appendChild(linkOrText("Permis", c.driving_license));
  if (c.website) ul.appendChild(linkOrText("Site", c.website, c.website));
  if (c.linkedin) ul.appendChild(linkOrText("LinkedIn", c.linkedin, c.linkedin));
  if (c.github) ul.appendChild(linkOrText("GitHub", c.github, c.github));

  // CTA
  const mailCTA = document.getElementById('mailCTA');
  mailCTA.href = c.email ? `mailto:${encodeURIComponent(c.email)}?subject=${encodeURIComponent("[Candidature]")}` : "#";
  document.getElementById('copyEmail').onclick = () => c.email && copy(c.email);
  document.getElementById('copyPhone').onclick = () => c.phone && copy(c.phone);

  // Skills
  const skillsWrap = document.getElementById('skills'); skillsWrap.innerHTML = "";
  const groups = p.skills || {};
  Object.keys(groups).forEach(title => {
    const g = document.createElement('div'); g.className="group";
    const h = document.createElement('div'); h.className="group-title"; h.textContent = title;
    const chips = document.createElement('div'); chips.className = "chips";
    (groups[title] || []).forEach(skill => { const span = document.createElement('span'); span.className="chip"; span.textContent = skill; chips.appendChild(span); });
    g.appendChild(h); g.appendChild(chips);
    skillsWrap.appendChild(g);
  });

  // Soft skills
  const ulSoft = document.getElementById('softSkills'); ulSoft.innerHTML = "";
  (p.soft_skills || []).forEach(s => { const li = document.createElement('li'); li.textContent = s; ulSoft.appendChild(li); });

  // Languages
  const ulLang = document.getElementById('languages'); ulLang.innerHTML = "";
  (p.languages || []).forEach(s => { const li = document.createElement('li'); li.textContent = s; ulLang.appendChild(li); });

  // Experience
  const expOl = document.getElementById('experience'); expOl.innerHTML = "";
  (p.experience || []).forEach(e => {
    const li = document.createElement('li');
    const title = document.createElement('div'); title.className="title";
    title.innerHTML = `<span>${e.role} — ${e.company || ""}</span><span class="meta">${dateRange(e.start, e.end)}</span>`;
    li.appendChild(title);
    if (e.location || e.context){
      const m = document.createElement('div'); m.className = "meta";
      m.textContent = [e.location, e.context].filter(Boolean).join(" • ");
      li.appendChild(m);
    }
    if (Array.isArray(e.bullets)){
      const ul = document.createElement('ul');
      e.bullets.forEach(b => { const li2 = document.createElement('li'); li2.textContent = b; ul.appendChild(li2); });
      li.appendChild(ul);
    }
    expOl.appendChild(li);
  });

  // Projects
  const projWrap = document.getElementById('projects'); projWrap.innerHTML = "";
  (p.projects || []).forEach(pr => {
    const c = document.createElement('div'); c.className = "card-mini";
    const h = document.createElement('h3'); h.textContent = pr.title; c.appendChild(h);
    if (pr.subtitle){ const sub = document.createElement('div'); sub.className = "meta"; sub.textContent = pr.subtitle; c.appendChild(sub); }
    if (Array.isArray(pr.bullets)){
      const ul = document.createElement('ul');
      pr.bullets.forEach(b => { const li = document.createElement('li'); li.textContent = b; ul.appendChild(li); });
      c.appendChild(ul);
    }
    projWrap.appendChild(c);
  });

  // Education & certifs
  const edu = document.getElementById('education'); edu.innerHTML = "";
  (p.education || []).forEach(ed => {
    const li = document.createElement('li');
    const title = document.createElement('div'); title.className="title";
    const when = (ed.start || ed.end) ? ` — ${[ed.start, ed.end].filter(Boolean).join("–")}` : "";
    title.innerHTML = `<span>${ed.degree}</span><span class="meta">${ed.school}${when}</span>`;
    li.appendChild(title);
    edu.appendChild(li);
  });
  const certs = document.getElementById('certifications'); certs.innerHTML = "";
  (p.certifications || []).forEach(c => { const li = document.createElement('li'); li.textContent = c; certs.appendChild(li); });

  // vCard
  const v = [];
  v.push("BEGIN:VCARD"); v.push("VERSION:3.0");
  const last = (rest.join(" ") || "").trim();
  v.push(`N:${last};${first};;;`); v.push(`FN:${p.name}`);
  if ((p.contact||{}).phone) v.push(`TEL;TYPE=CELL:${p.contact.phone.replace(/\\s+/g,"")}`);
  if ((p.contact||{}).email) v.push(`EMAIL:${p.contact.email}`);
  if ((p.contact||{}).location) v.push(`ADR;TYPE=HOME:;;${p.contact.location};;;;`);
  v.push("END:VCARD");
  const blob = new Blob([v.join("\\n")], {type: "text/vcard"});
  const url = URL.createObjectURL(blob);
  const btnV = document.getElementById('btnVCard'); btnV.href = url; btnV.download = `${p.name.replace(/\\s+/g,"-")}-${p.id}.vcf`;

  const metaTitle = document.querySelector('meta[property="og:title"]');
  if (metaTitle) metaTitle.setAttribute('content', `CV – ${p.name} (${p.label || p.role})`);
}

async function boot(){
  function readInline(){
    const node = document.getElementById('profilesFallback');
    if (!node || !node.textContent) return null;
    try { return JSON.parse(node.textContent); } catch(e) { return null; }
  }
  let loaded = readInline();

  if (location.protocol.startsWith('http')){
    try {
      const res = await fetch('data/profiles.json', {cache:'no-store'});
      if (res.ok){
        const j = await res.json();
        if (j && Array.isArray(j.profiles)) loaded = j;
      }
    } catch(e) { /* ignore */ }
  }

  if (!loaded || !Array.isArray(loaded.profiles) || !loaded.profiles.length){
    loaded = { profiles: [{
      id: "support-min",
      label: "Support",
      name: "Noa Durandeau",
      role: "Technicien Support Informatique",
      summary: "Version minimale (vérifie data/profiles.json).",
      avatar: "assets/avatar.jpg",
      contact: { email: "noadurandeau.pro@gmail.com", phone: "+33 7 68 81 91 14", location: "Pontarlier, FR" },
      skills: { "Support": ["GLPI","Jira","Microsoft 365"], "Systèmes": ["Windows","Linux"], "Réseaux": ["TCP/IP","VPN"] },
      soft_skills: ["Rigueur","Autonomie"],
      languages: ["Français (C1)","Anglais (B2)"],
      experience: [], projects: [], education: [], certifications: [],
      theme: { accent: "#7C3AED" }
    }]};
  }

  STATE.profiles = loaded.profiles || [];

  function setActiveTab(id) {
    document.querySelectorAll('#trackTabs .seg-btn').forEach(btn => {
      const active = btn.dataset.id === id;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  const fromUrl = getParam('p') || getParam('cv') || (STATE.profiles[0]?.id) || 'support';
  const target = STATE.profiles.some(p => p.id === fromUrl) ? fromUrl :
                 (STATE.profiles.some(p => p.id === 'support') ? 'support' : STATE.profiles[0].id);
  setActiveTab(target);
  renderProfile(target);

  document.getElementById('trackTabs').addEventListener('click', (e) => {
    const btn = e.target.closest('.seg-btn');
    if (!btn) return;
    const id = btn.dataset.id;
    setActiveTab(id);
    const url = new URL(window.location.href);
    url.searchParams.set('p', id);
    history.replaceState({}, "", url);
    renderProfile(id);
  });

  document.getElementById('btnPrint').addEventListener('click', () => window.print());
  document.getElementById('btnTheme').addEventListener('click', toggleTheme);

  const btnShare = document.getElementById('btnShare');
  btnShare.addEventListener('click', async () => {
    const url = new URL(window.location.href);
    const current = document.querySelector('#trackTabs .seg-btn[aria-selected="true"]')?.dataset.id;
    if (current) url.searchParams.set('p', current);
    if (navigator.share) {
      try { await navigator.share({title: document.title, url: url.toString()}); } catch (e) {}
    } else { await copy(url.toString()); }
  });

  document.getElementById('howToLink').addEventListener('click', (e) => {
    e.preventDefault();
    alert("Clique sur les onglets Support / Réseaux / Cyber pour basculer. Modifie data/profiles.json pour éditer chaque piste. Partage avec ?p=support | ?p=reseaux | ?p=cyber. Export PDF pour un rendu propre.");
  });
}

document.addEventListener('DOMContentLoaded', boot);
