/* ═══ A5000 PLAYER · SCRIPT · MASTER EDITION ═══ */

const WALLPAPERS = {
  rebel:   'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop',
  wine:    'https://images.unsplash.com/photo-1578314675249-a6910f80cc04?q=80&w=1200&auto=format&fit=crop',
  silence: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1200&auto=format&fit=crop',
  gta:     'https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=1200&auto=format&fit=crop',
  street:  'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=1200&auto=format&fit=crop',
  default: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?q=80&w=1200&auto=format&fit=crop'
};

const TRACKS = [
  { id:'01', file:'01-vernulsya.mp3', cover:'01-vernulsya.webp', title:'Вернулся — забери своё', feat:'', year:2026, duration:'3:16', color:'#ff1493', color2:'#ff6b00', tags:['рэп','энергия'], viz:'fire', mode:'rebel', lrc: `[00:00.00] A5000\n[00:10.00] Вернулся — забери своё\n[00:20.00] Это новый этап` },
  { id:'02', file:'02-moy-vtoroy.mp3', cover:'02-moy-vtoroy.webp', title:'Мой второй', feat:'', year:2026, duration:'3:02', color:'#5a9bff', color2:'#a855f7', tags:['рэп','размышление'], viz:'flow', mode:'silence' },
  { id:'03', file:'03-villa.mp3', cover:'03-villa.webp', title:'The Villa', feat:'Блогерский Бит', year:2026, duration:'2:31', color:'#00ffff', color2:'#0080ff', tags:['трэп','фит','вилла'], viz:'rings', mode:'wine' },
  { id:'04', file:'04-rozovoe-vino-3.mp3', cover:'04-rozovoe-vino-3.webp', title:'Розовое вино 3', feat:'Блогерский Бит', year:2026, duration:'4:06', color:'#ff006e', color2:'#c2006e', tags:['трэп','вино','фит'], viz:'drops', mode:'wine' },
  { id:'05', file:'05-krest.mp3', cover:'05-krest.webp', title:'Крест', feat:'', year:2026, duration:'3:20', color:'#8a2be2', color2:'#4b0082', tags:['рэп','личное'], viz:'cross', mode:'silence' },
  { id:'06', file:'06-gta.mp3', cover:'06-gta.webp', title:'GTA / Новый этап 1', feat:'', year:2026, duration:'3:16', color:'#ff6b00', color2:'#ff0044', tags:['трэп','энергия','игра'], viz:'pixels', mode:'gta' },
  { id:'07', file:'07-i-ya-tak-zhivu.mp3', cover:'07-i-ya-tak-zhivu.webp', title:'И я так живу', feat:'', year:2026, duration:'3:16', color:'#ffd700', color2:'#ff9500', tags:['рэп','манифест'], viz:'sun', mode:'street' },
  { id:'08', file:'08-silence.mp3', cover:'08-silence.webp', title:'Тишина (Silence)', feat:'', year:2026, duration:'3:00', color:'#00ffaa', color2:'#0088ff', tags:['тишина','ночь'], viz:'dust', mode:'silence' },
  { id:'09', file:'09-tsaritsa.mp3', cover:'09-tsaritsa.webp', title:'Царица на одну ночь', feat:'', year:2026, duration:'3:57', color:'#ff1493', color2:'#8a2be2', tags:['рэп','ночь'], viz:'petals', mode:'wine' },
  { id:'10', file:'10-fake-angry-sad.mp3', cover:'10-fake-angry-sad.webp', title:'Fake-angry-sad', feat:'', year:2026, duration:'2:17', color:'#ff3355', color2:'#4400ff', tags:['энергия','злость'], viz:'spikes', mode:'rebel' },
  { id:'11', file:'11-minus-26626.mp3', cover:'11-minus-26626.webp', title:'-26626', feat:'', year:2026, duration:'0:51', color:'#6666ff', color2:'#220044', tags:['арт'], viz:'pulse', mode:'silence' }
];

const state = {
  current: 0, playing: false, shuffle: false, repeat: 0,
  filter: 'all', sort: 0,
  plays: JSON.parse(localStorage.getItem('a5000_plays') || '{}'),
  liked: JSON.parse(localStorage.getItem('a5000_liked') || '[]'),
  vibrate: localStorage.getItem('a5000_vibrate') !== 'off',
  theme: localStorage.getItem('a5000_theme') || 'auto',
  eq: localStorage.getItem('a5000_eq') || 'flat',
  queue: [], queuePos: 0,
  lyrics: [], lyricsIdx: -1, showLyrics: false,
  sleepTimerId: null,
  coverCache: {}
};

const SORTS = [
  { label: 'По номеру', fn: (a,b) => TRACKS.indexOf(a) - TRACKS.indexOf(b) },
  { label: 'А-Я',       fn: (a,b) => a.title.localeCompare(b.title, 'ru') },
  { label: 'По длине',  fn: (a,b) => parseDur(a.duration) - parseDur(b.duration) },
  { label: 'По плеям',  fn: (a,b) => (state.plays[b.id]||0) - (state.plays[a.id]||0) }
];

const EQ_MODES = [
  { id: 'flat', icon: '🎚', name: 'Студия', desc: 'Оригинал' },
  { id: 'wine', icon: '🍷', name: 'Под вином', desc: 'Тепло + вайб' },
  { id: 'high', icon: '🌫', name: 'Под чем-то', desc: 'Глубина + эхо' },
  { id: 'stadium', icon: '🏟', name: 'Стадион', desc: 'Большой зал' },
  { id: 'underwater', icon: '🌊', name: 'Под водой', desc: 'Глухо и мягко' },
  { id: 'bass', icon: '🔊', name: 'Бас', desc: 'Мощные низы' }
];

const $ = id => document.getElementById(id);
let els = {};

function parseDur(s){ const [m,sec]=s.split(':').map(Number); return m*60+sec; }
function formatTime(s){ if (!isFinite(s) || s<0) return '0:00'; const m=Math.floor(s/60); const sec=Math.floor(s%60); return m+':'+String(sec).padStart(2,'0'); }
function vibrate(p){ if (state.vibrate && navigator.vibrate) navigator.vibrate(p); }
function esc(s){ return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function toast(msg){ if(!els.toast) return; els.toast.textContent = msg; els.toast.classList.add('show'); clearTimeout(window.__toastT); window.__toastT = setTimeout(()=>els.toast.classList.remove('show'), 2200); }
function withAlpha(color, a){
  if (!color) return `rgba(255,255,255,${a})`;
  const c = String(color).trim();
  if (c.startsWith('#')) {
    let h = c.substring(1); if (h.length === 3) h = h.split('').map(x => x + x).join('');
    const r = parseInt(h.substring(0, 2), 16) || 0, g = parseInt(h.substring(2, 4), 16) || 0, b = parseInt(h.substring(4, 6), 16) || 0;
    return `rgba(${r},${g},${b},${a})`;
  }
  return c;
}

document.addEventListener('pointerdown', e=>{ if (e.target.closest('button, .track-item, .recent-card, .mood-card, .tl-card')) vibrate(5); }, { passive: true });

function applyTheme(){
  let theme = state.theme;
  if (theme === 'auto') { const h = new Date().getHours(); theme = (h >= 20 || h < 6) ? 'dark' : 'light'; }
  document.documentElement.setAttribute('data-theme', theme);
  const meta = $('themeMeta'); if (meta) meta.setAttribute('content', theme === 'light' ? '#f2f2f7' : '#000000');
  if (els.themeHint) els.themeHint.textContent = theme === 'light' ? '☀️ ДЕНЬ' : '🌙 НОЧЬ';
  if (els.themeSeg) els.themeSeg.querySelectorAll('.seg-btn').forEach(b => b.classList.toggle('active', b.dataset.themeOpt === state.theme));
}

let wallActive = -1;
function setWallpaper(mode){
  const img = WALLPAPERS[mode] || WALLPAPERS.default;
  const layers = [els.wallA, els.wallB]; if (!layers[0] || !layers[1]) return;
  const next = (wallActive + 1) % 2;
  layers[next].style.backgroundImage = `url('${img}')`;
  layers[next].classList.add('visible');
  if (wallActive >= 0) layers[wallActive].classList.remove('visible');
  wallActive = next;
}

let cachedC1 = '#ff1493', cachedC2 = '#00ffff';
function applyTrackColors(t){
  if (!t) return;
  document.documentElement.style.setProperty('--track-color', t.color || '#ff1493');
  document.documentElement.style.setProperty('--track-color-2', t.color2 || '#00ffff');
  cachedC1 = t.color || '#ff1493'; cachedC2 = t.color2 || '#00ffff';
}

function makeCoverSVG(t, size=320){
  const s = size, gid = 'g_'+t.id, a1 = t.color || '#ff1493', a2 = t.color2 || '#00ffff';
  return `<svg viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${a1}" stop-opacity="0.5"/><stop offset="100%" stop-color="${a2}" stop-opacity="0.2"/></linearGradient><radialGradient id="${gid}_r" cx="50%" cy="30%" r="80%"><stop offset="0%" stop-color="${a1}" stop-opacity="0.7"/><stop offset="100%" stop-color="#000" stop-opacity="0"/></radialGradient></defs><rect width="${s}" height="${s}" fill="#000"/><rect width="${s}" height="${s}" fill="url(#${gid}_r)"/><rect width="${s}" height="${s}" fill="url(#${gid})"/><text x="${s/2}" y="${s*0.57}" text-anchor="middle" font-family="Bebas Neue, Impact, sans-serif" font-size="${s*0.14}" letter-spacing="${s*0.012}" fill="#fff" font-weight="900">A5000</text></svg>`;
}
function coverHTML(t, size=200){ return state.coverCache[t.id] === true ? `<img src="./covers/${t.cover}" alt="${esc(t.title)}" loading="lazy">` : makeCoverSVG(t, size); }
function hydrateCover(el, t, size=320){ if (el) el.innerHTML = coverHTML(t, size); }

async function preloadCovers(){
  await Promise.all(TRACKS.map(t => new Promise(resolve => {
    const img = new Image();
    img.onload = () => { state.coverCache[t.id] = true; resolve(); };
    img.onerror = () => { state.coverCache[t.id] = false; resolve(); };
    img.src = './covers/' + t.cover;
  })));
}

function trackListHTML(tracks){
  return tracks.map(t => {
    const idx = TRACKS.indexOf(t), liked = state.liked.includes(t.id), playing = idx === state.current;
    return `<div class="track-item ${playing?'playing':''}" data-idx="${idx}">
      <div class="track-cover">${coverHTML(t, 100)}</div>
      <div class="track-info"><div class="track-name">${esc(t.title)}</div><div class="track-feat">${t.feat ? 'feat. '+esc(t.feat) : 'A5000 · '+t.year}</div></div>
      <div class="track-meta"><span class="track-dur">${t.duration}</span><button class="track-like ${liked?'liked':''}" data-like="${t.id}"><svg viewBox="0 0 24 24" fill="${liked?'currentColor':'none'}" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 21s-7-4.7-9.3-8.5C1 9.8 2.5 6 6 6c2 0 3.3 1.2 4 2.5.7-1.3 2-2.5 4-2.5 3.5 0 5 3.8 3.3 6.5C19 16.3 12 21 12 21z"/></svg></button></div>
    </div>`;
  }).join('');
}

function bindTrackClicks(root){
  if (!root) return;
  root.querySelectorAll('[data-idx]').forEach(el=>{ el.addEventListener('click', e=>{ if (e.target.closest('[data-like]')) return; playTrack(parseInt(el.dataset.idx, 10)); }); });
  root.querySelectorAll('[data-like]').forEach(btn=>{ btn.addEventListener('click', e=>{ e.stopPropagation(); toggleLike(btn.dataset.like); }); });
}

function getGreeting(){ const h = new Date().getHours(); if (h < 5) return 'Доброй ночи'; if (h < 12) return 'Доброе утро'; if (h < 18) return 'Добрый день'; return 'Добрый вечер'; }

function renderHome(){
  if (els.greetingText) els.greetingText.textContent = getGreeting();
  if (els.timeline) {
    const items = [{ year: '2026', title: 'Null Null Null', desc: 'Новый этап • 11 треков' },{ year: 'GTA',  title: 'Новый этап 1',   desc: 'Энергия улиц' },{ year: 'Wine', title: 'Розовое вино 3', desc: 'Фит • вайб' }];
    els.timeline.innerHTML = items.map(it => `<div class="tl-card"><div class="tl-year">${it.year}</div><div class="tl-name">${it.title}</div><div class="tl-sub">${it.desc}</div></div>`).join('');
  }
  if (els.recentRow) {
    const recents = TRACKS.slice().sort((a,b)=>(state.plays[b.id]||0)-(state.plays[a.id]||0)).slice(0,6);
    els.recentRow.innerHTML = recents.map(t => `<div class="recent-card" data-idx="${TRACKS.indexOf(t)}"><div class="recent-cover">${coverHTML(t, 260)}</div><div class="recent-name">${esc(t.title)}</div></div>`).join('');
    bindTrackClicks(els.recentRow);
  }
  if (els.topTracks) { els.topTracks.innerHTML = trackListHTML(TRACKS.slice().sort((a,b)=>(state.plays[b.id]||0)-(state.plays[a.id]||0)).slice(0,5)); bindTrackClicks(els.topTracks); }
  if (els.moodGrid) {
    const moods = [{ id: 'rebel', label: 'Rebel', emoji: '🔥' },{ id: 'wine', label: 'Wine', emoji: '🍷' },{ id: 'silence', label: 'Silence', emoji: '🌙' },{ id: 'gta', label: 'GTA', emoji: '🎮' }];
    els.moodGrid.innerHTML = moods.map(m => `<div class="mood-card" data-mood="${m.id}"><span class="mood-emoji">${m.emoji}</span><span>${m.label}</span></div>`).join('');
    els.moodGrid.querySelectorAll('[data-mood]').forEach(btn => { btn.addEventListener('click', () => { const list = TRACKS.filter(t => t.mode === btn.dataset.mood); if (list.length) playTrack(TRACKS.indexOf(list[0]), list.map(t => TRACKS.indexOf(t))); }); });
  }
}

function renderLibrary(){
  let arr = TRACKS.slice();
  if (state.filter === 'feat') arr = arr.filter(t => t.feat);
  else if (state.filter === 'solo') arr = arr.filter(t => !t.feat);
  else if (state.filter === 'liked') arr = arr.filter(t => state.liked.includes(t.id));
  arr.sort(SORTS[state.sort].fn);
  if (els.libraryTracks) { els.libraryTracks.innerHTML = trackListHTML(arr); bindTrackClicks(els.libraryTracks); }
  if (els.sortLabel) els.sortLabel.textContent = SORTS[state.sort].label;
}
function cycleSort(){ state.sort = (state.sort + 1) % SORTS.length; renderLibrary(); vibrate(6); }
function renderLiked(){
  const liked = TRACKS.filter(t => state.liked.includes(t.id));
  if (!liked.length) { if (els.likedTracks) els.likedTracks.innerHTML = ''; if (els.likedEmpty) els.likedEmpty.style.display = 'block'; return; }
  if (els.likedEmpty) els.likedEmpty.style.display = 'none';
  if (els.likedTracks) { els.likedTracks.innerHTML = trackListHTML(liked); bindTrackClicks(els.likedTracks); }
}

function initSearch(){
  const allTags = [...new Set(TRACKS.flatMap(t => t.tags || []))];
  if (els.suggestChips) {
    els.suggestChips.innerHTML = allTags.map(tag => `<button class="chip" data-suggest="${esc(tag)}">${esc(tag)}</button>`).join('');
    els.suggestChips.querySelectorAll('[data-suggest]').forEach(c=>{ c.addEventListener('click', ()=>{ if (els.searchInput) { els.searchInput.value = c.dataset.suggest; doSearch(); } }); });
  }
  if (els.searchInput) { els.searchInput.addEventListener('input', doSearch); els.searchInput.addEventListener('keydown', e => { if (e.key === 'Escape') clearSearch(); }); doSearch(); }
}

function doSearch(){
  if (!els.searchInput) return;
  const q = els.searchInput.value.trim().toLowerCase();
  if (els.searchClear) els.searchClear.classList.toggle('show', !!q);
  if (!q) { if (els.searchEmpty) els.searchEmpty.style.display = 'block'; if (els.searchResults) els.searchResults.innerHTML = ''; return; }
  if (els.searchEmpty) els.searchEmpty.style.display = 'none';
  const found = TRACKS.filter(t => t.title.toLowerCase().includes(q) || (t.feat && t.feat.toLowerCase().includes(q)) || (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q))));
  if (!els.searchResults) return;
  if (!found.length) { els.searchResults.innerHTML = `<div class="empty"><div class="empty-emoji">🔍</div><div class="empty-title">Ничего не найдено</div><div class="empty-sub">Попробуй другой запрос</div></div>`; return; }
  els.searchResults.innerHTML = `<div class="track-list">${trackListHTML(found)}</div>`; bindTrackClicks(els.searchResults);
}
function clearSearch(){ if (!els.searchInput) return; els.searchInput.value = ''; doSearch(); els.searchInput.focus(); }

function navigate(screen){
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.dataset.screen === screen));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.nav === screen));
  if (screen === 'home') renderHome();
  if (screen === 'library') renderLibrary();
  if (screen === 'liked') renderLiked();
  if (screen === 'settings') renderSettings();
  vibrate(6);
}

function renderSettings(){
  const total = Object.values(state.plays).reduce((a,b)=>a+b,0);
  if (els.statTotalPlays) els.statTotalPlays.textContent = total;
  const top = TRACKS.slice().sort((a,b)=>(state.plays[b.id]||0)-(state.plays[a.id]||0))[0];
  if (els.statTopTrack) els.statTopTrack.textContent = (top && state.plays[top.id]) ? top.title.split(' ')[0] : '—';
  if (els.statLiked) els.statLiked.textContent = state.liked.length;
}

function toggleLike(id){
  const i = state.liked.indexOf(id); if (i === -1) state.liked.push(id); else state.liked.splice(i,1);
  localStorage.setItem('a5000_liked', JSON.stringify(state.liked)); vibrate(10);
  document.querySelectorAll(`[data-like="${id}"]`).forEach(btn => { const liked = state.liked.includes(id); btn.classList.toggle('liked', liked); const s = btn.querySelector('svg'); if (s) s.setAttribute('fill', liked ? 'currentColor' : 'none'); });
  updateLikeButton(); if (document.querySelector('.screen[data-screen="liked"].active')) renderLiked();
}
function toggleLikeCurrent(){ const t = TRACKS[state.current]; if (t) toggleLike(t.id); }
function updateLikeButton(){ const t = TRACKS[state.current]; if (!t || !els.npLike) return; const liked = state.liked.includes(t.id); els.npLike.classList.toggle('active', liked); if (els.npLikeIcon) els.npLikeIcon.setAttribute('fill', liked ? 'currentColor' : 'none'); }

/* ═══ АУДИО ═══ */
let audioCtx = null, sourceNode = null, analyser = null;
let bassFilter = null, midFilter = null, trebleFilter = null, convolver = null, wetGain = null, dryGain = null;

function initAudioEngine(){
  if (audioCtx) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    sourceNode = audioCtx.createMediaElementSource(audio);
    analyser = audioCtx.createAnalyser(); analyser.fftSize = 1024; analyser.smoothingTimeConstant = 0.65;
    bassFilter = audioCtx.createBiquadFilter(); bassFilter.type = 'lowshelf'; bassFilter.frequency.value = 200; bassFilter.gain.value = 0;
    midFilter = audioCtx.createBiquadFilter(); midFilter.type = 'peaking'; midFilter.frequency.value = 1000; midFilter.Q.value = 1; midFilter.gain.value = 0;
    trebleFilter = audioCtx.createBiquadFilter(); trebleFilter.type = 'highshelf'; trebleFilter.frequency.value = 4000; trebleFilter.gain.value = 0;
    convolver = audioCtx.createConvolver(); convolver.buffer = generateReverbImpulse(1.8, 2.0);
    wetGain = audioCtx.createGain(); wetGain.gain.value = 0; dryGain = audioCtx.createGain(); dryGain.gain.value = 1;
    sourceNode.connect(bassFilter); bassFilter.connect(midFilter); midFilter.connect(trebleFilter);
    trebleFilter.connect(dryGain); dryGain.connect(audioCtx.destination);
    trebleFilter.connect(convolver); convolver.connect(wetGain); wetGain.connect(audioCtx.destination);
    trebleFilter.connect(analyser);
  } catch(e){ console.warn('AudioCtx error', e); }
}
function ensureAudioRunning(){ initAudioEngine(); if (audioCtx && audioCtx.state === 'suspended') return audioCtx.resume(); return Promise.resolve(); }
function generateReverbImpulse(duration, decay){
  const rate = audioCtx.sampleRate, length = Math.floor(rate * duration), impulse = audioCtx.createBuffer(2, length, rate);
  for (let ch = 0; ch < 2; ch++) { const data = impulse.getChannelData(ch); for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay); }
  return impulse;
}
function applyEqMode(modeId, silent = false){
  initAudioEngine(); if (!audioCtx) return;
  state.eq = modeId; localStorage.setItem('a5000_eq', modeId);
  const now = audioCtx.currentTime;
  const ramp = (param, val) => { param.cancelScheduledValues(now); param.setValueAtTime(param.value, now); param.linearRampToValueAtTime(val, now + 0.3); };
  ramp(bassFilter.gain, 0); ramp(midFilter.gain, 0); ramp(trebleFilter.gain, 0); ramp(wetGain.gain, 0); ramp(dryGain.gain, 1);
  if (modeId === 'bass') { ramp(bassFilter.gain, 10); ramp(midFilter.gain, -3); }
  else if (modeId === 'wine') { ramp(bassFilter.gain, 5); ramp(midFilter.gain, 3); ramp(trebleFilter.gain, -4); ramp(wetGain.gain, 0.25); ramp(dryGain.gain, 0.85); }
  else if (modeId === 'high') { ramp(bassFilter.gain, -8); ramp(midFilter.gain, -5); ramp(trebleFilter.gain, -8); ramp(wetGain.gain, 0.7); ramp(dryGain.gain, 0.5); }
  else if (modeId === 'stadium') { ramp(bassFilter.gain, 2); ramp(wetGain.gain, 0.5); ramp(dryGain.gain, 0.8); }
  else if (modeId === 'underwater') { ramp(bassFilter.gain, 8); ramp(midFilter.gain, -15); ramp(trebleFilter.gain, -20); ramp(wetGain.gain, 0.4); }
  if (!silent) { const mode = EQ_MODES.find(p => p.id === modeId); if (mode) toast('🎚 ' + mode.name); closeEq(); }
}
function openEq(){
  if (els.eqPresets) {
    els.eqPresets.innerHTML = EQ_MODES.map(p => `<button class="eq-preset ${state.eq === p.id ? 'active':''}" data-eq="${p.id}"><div class="eq-icon">${p.icon}</div><div>${p.name}</div><div class="eq-desc">${p.desc}</div></button>`).join('');
    els.eqPresets.querySelectorAll('[data-eq]').forEach(b => b.addEventListener('click', () => applyEqMode(b.dataset.eq)));
  }
  if (els.eqSheet) els.eqSheet.classList.add('open');
}
function closeEq(){ if (els.eqSheet) els.eqSheet.classList.remove('open'); }

/* ═══════════════════════════════════════════════════════════
   🎨 ВИЗУАЛИЗАТОР (Адаптирован под новые размеры)
   ═══════════════════════════════════════════════════════════ */
let vizRunning = false, vizRAF = null, vizLast = 0, vizRot = 0, vizAGC = 0.1, vizTime = 0;
let vizCtx = null, vizSize = { w: 0, h: 0 };
const FPS = (navigator.hardwareConcurrency || 4) < 4 ? 24 : 30;
const VIZ_INTERVAL = 1000 / FPS;

function prepareViz(){
  const c = els.visualizer; if (!c) return false;
  vizCtx = c.getContext('2d', { alpha: true }); if (!vizCtx) return false;
  const rect = c.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(1, Math.round(rect.width * dpr)), h = Math.max(1, Math.round(rect.height * dpr));
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  vizCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  vizSize = { w: rect.width, h: rect.height };
  return true;
}
function startViz(){
  if (vizRunning) return; if (!analyser) initAudioEngine(); if (!analyser) return;
  if (!prepareViz()) return; vizRunning = true; vizLast = 0; vizRAF = requestAnimationFrame(vizLoop);
}
function stopViz(){
  vizRunning = false; if (vizRAF) cancelAnimationFrame(vizRAF); vizRAF = null;
  if (vizCtx && els.visualizer) vizCtx.clearRect(0, 0, els.visualizer.width, els.visualizer.height);
}
function vizLoop(ts){
  if (!vizRunning) return; vizRAF = requestAnimationFrame(vizLoop);
  if (ts - vizLast < VIZ_INTERVAL) return;
  vizLast = ts; vizTime = ts / 1000;
  if (!els.nowPlaying || !els.nowPlaying.classList.contains('open') || document.hidden) return;
  drawViz();
}
function drawViz(){
  if (!vizCtx || !analyser) return;
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  const dataLen = analyser.frequencyBinCount, raw = new Uint8Array(dataLen); analyser.getByteFrequencyData(raw);
  const w = vizSize.w, h = vizSize.h; vizCtx.clearRect(0, 0, w, h);
  const cx = w / 2, cy = h / 2;
  
  let baseR = Math.min(w, h) * 0.35; // Fallback
  if (els.npCover) {
    const coverW = els.npCover.offsetWidth, canvasW = els.visualizer.offsetWidth;
    if (canvasW > 0) baseR = (coverW / 2) * (w / canvasW) + 4;
  }
  
  const c1 = cachedC1, c2 = cachedC2, t = TRACKS[state.current], vizType = (t && t.viz) || 'fire';
  const N = 64, bands = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const lo = Math.floor(Math.pow(i / N, 1.8) * dataLen), hi = Math.floor(Math.pow((i + 1) / N, 1.8) * dataLen);
    let sum = 0, cnt = 0; for (let j = lo; j <= hi && j < dataLen; j++) { sum += raw[j]; cnt++; }
    bands[i] = cnt ? (sum / cnt) / 255 : 0;
  }
  let frameSum = 0; for (let i = 0; i < N; i++) frameSum += bands[i];
  const frameAvg = frameSum / N;
  vizAGC = Math.max(frameAvg, vizAGC * 0.92); 
  const gain = Math.min(4.5, Math.max(1.2, 0.7 / Math.max(vizAGC, 0.02)));
  for (let i = 0; i < N; i++) bands[i] = Math.min(1.5, bands[i] * gain);
  
  let bassW = 0, bassSum = 0;
  for (let i = 0; i < 12; i++) { const wgt = 12 - i; bassSum += bands[i] * wgt; bassW += wgt; }
  const bass = Math.min(1.5, bassSum / bassW);

  switch (vizType) {
    case 'fire':   vizFire(cx, cy, baseR, bands, bass, c1, c2, N); break;
    case 'flow':   vizFlow(cx, cy, baseR, bands, bass, c1, c2, N); break;
    case 'rings':  vizRings(cx, cy, baseR, bands, bass, c1, c2, N); break;
    case 'drops':  vizDrops(cx, cy, baseR, bands, bass, c1, c2, N); break;
    case 'cross':  vizCross(cx, cy, baseR, bands, bass, c1, c2, N); break;
    case 'pixels': vizPixels(cx, cy, baseR, bands, bass, c1, c2, N); break;
    case 'sun':    vizSun(cx, cy, baseR, bands, bass, c1, c2, N); break;
    case 'dust':   vizDust(cx, cy, baseR, bands, bass, c1, c2, N); break;
    case 'petals': vizPetals(cx, cy, baseR, bands, bass, c1, c2, N); break;
    case 'spikes': vizSpikes(cx, cy, baseR, bands, bass, c1, c2, N); break;
    case 'pulse':  vizPulse(cx, cy, baseR, bands, bass, c1, c2, N); break;
    default:       vizFire(cx, cy, baseR, bands, bass, c1, c2, N);
  }
}

function vizFire(cx, cy, baseR, bands, bass, c1, c2, N){
  const SPIKES = 54; vizCtx.lineCap = 'round';
  for (let i = 0; i < SPIKES; i++) {
    const bi = Math.floor((i / SPIKES) * N), v = bands[bi], a = (i / SPIKES) * Math.PI * 2 + vizTime * 0.15, jitter = Math.sin(vizTime * 4 + i * 1.7) * 0.08, len = v * 110 + bass * 40 + 5;
    vizCtx.lineWidth = 2 + v * 4; vizCtx.strokeStyle = i % 3 === 0 ? c1 : i % 3 === 1 ? c2 : withAlpha(c1, 0.7);
    vizCtx.beginPath(); vizCtx.moveTo(cx + Math.cos(a) * baseR, cy + Math.sin(a) * baseR);
    vizCtx.lineTo(cx + Math.cos(a + jitter) * (baseR + len), cy + Math.sin(a + jitter) * (baseR + len)); vizCtx.stroke();
  }
}
function vizFlow(cx, cy, baseR, bands, bass, c1, c2, N){
  for (let layer = 0; layer < 3; layer++) {
    vizCtx.strokeStyle = layer === 0 ? c1 : withAlpha(c2, 0.7 - layer * 0.2); vizCtx.lineWidth = 3.5 - layer * 1; vizCtx.beginPath();
    const points = 90;
    for (let i = 0; i <= points; i++) {
      const p = i / points, bi = Math.min(Math.floor(p * N * 0.9), N - 1), v = bands[bi], a = p * Math.PI * 2 + vizTime * 0.3 + layer * 0.5, r = baseR + v * 70 + bass * 30 + Math.sin(p * 12 + vizTime * 2 + layer) * 12;
      i === 0 ? vizCtx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : vizCtx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
    vizCtx.closePath(); vizCtx.stroke();
  }
}
function vizRings(cx, cy, baseR, bands, bass, c1, c2, N){
  for (let i = 0; i < 6; i++) {
    const v = bands[i * 6] || 0, r = baseR + (i + 1) * 18 + v * 80 + bass * 30 + Math.sin(vizTime * 2.5 + i) * 6;
    vizCtx.strokeStyle = i % 2 ? c2 : c1; vizCtx.lineWidth = 2 + v * 2; vizCtx.globalAlpha = 0.9 - i * 0.13;
    vizCtx.beginPath(); vizCtx.arc(cx, cy, r, 0, Math.PI * 2); vizCtx.stroke();
  }
  vizCtx.globalAlpha = 1;
}
function vizDrops(cx, cy, baseR, bands, bass, c1, c2, N){
  const DROPS = 32;
  for (let i = 0; i < DROPS; i++) {
    const bi = Math.floor((i / DROPS) * N), v = bands[bi], a = (i / DROPS) * Math.PI * 2 + vizTime * 0.15, offset = Math.sin(vizTime * 2 + i * 0.9) * 16;
    const r = baseR + 15 + v * 90 + bass * 40 + offset, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r, radius = 3 + v * 12;
    const grad = vizCtx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, c1); grad.addColorStop(0.5, withAlpha(c2, 0.6)); grad.addColorStop(1, withAlpha(c2, 0));
    vizCtx.fillStyle = grad; vizCtx.beginPath(); vizCtx.arc(x, y, radius, 0, Math.PI * 2); vizCtx.fill();
  }
}
function vizCross(cx, cy, baseR, bands, bass, c1, c2, N){
  const N_ = 24; vizCtx.lineCap = 'round';
  for (let i = 0; i < N_; i++) {
    const v = bands[i * 2], a = (i / N_) * Math.PI * 2, crossWeight = Math.pow(Math.abs(Math.cos(a * 2)), 1.5), len = (v * 100 + 5) * (0.4 + crossWeight * 1.2) + bass * 25;
    vizCtx.lineWidth = 3 + v * 2; vizCtx.strokeStyle = i % 2 ? c2 : c1;
    vizCtx.beginPath(); vizCtx.moveTo(cx + Math.cos(a) * baseR, cy + Math.sin(a) * baseR);
    vizCtx.lineTo(cx + Math.cos(a) * (baseR + len), cy + Math.sin(a) * (baseR + len)); vizCtx.stroke();
  }
}
function vizPixels(cx, cy, baseR, bands, bass, c1, c2, N){
  const COUNT = 44, sqSize = 7;
  for (let i = 0; i < COUNT; i++) {
    const bi = Math.floor((i / COUNT) * N), v = bands[bi], a = (i / COUNT) * Math.PI * 2 + vizTime * 0.15, r = baseR + 10 + Math.floor(v * 8) * 10 + bass * 30;
    vizCtx.fillStyle = i % 2 ? c2 : c1; vizCtx.fillRect(cx + Math.cos(a) * r - sqSize / 2, cy + Math.sin(a) * r - sqSize / 2, sqSize, sqSize);
  }
}
function vizSun(cx, cy, baseR, bands, bass, c1, c2, N){
  const RAYS = 36; vizCtx.lineCap = 'round';
  for (let i = 0; i < RAYS; i++) {
    const bi = Math.floor((i / RAYS) * N), v = bands[bi], a = (i / RAYS) * Math.PI * 2 + vizTime * 0.1, len = v * 130 + bass * 50 + 8;
    const x1 = cx + Math.cos(a) * baseR, y1 = cy + Math.sin(a) * baseR, x2 = cx + Math.cos(a) * (baseR + len), y2 = cy + Math.sin(a) * (baseR + len);
    const grad = vizCtx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, c1); grad.addColorStop(1, withAlpha(c2, 0.1));
    vizCtx.strokeStyle = grad; vizCtx.lineWidth = 3 + v * 3; vizCtx.beginPath(); vizCtx.moveTo(x1, y1); vizCtx.lineTo(x2, y2); vizCtx.stroke();
  }
}
function vizDust(cx, cy, baseR, bands, bass, c1, c2, N){
  const PARTICLES = 48;
  for (let i = 0; i < PARTICLES; i++) {
    const seed = i * 7.123, bi = i % 24, v = bands[bi], driftA = Math.sin(vizTime * 0.5 + seed) * 0.4;
    const a = (i / PARTICLES) * Math.PI * 2 + vizTime * 0.05 + driftA, r = baseR + 20 + Math.sin(vizTime * 0.4 + seed) * 30 + v * 70 + bass * 20;
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r, radius = 1.5 + v * 5;
    vizCtx.fillStyle = i % 3 ? withAlpha(c2, 0.5 + v * 0.5) : withAlpha(c1, 0.8);
    vizCtx.beginPath(); vizCtx.arc(x, y, radius, 0, Math.PI * 2); vizCtx.fill();
  }
}
function vizPetals(cx, cy, baseR, bands, bass, c1, c2, N){
  const PETALS = 24; vizCtx.globalAlpha = 0.85;
  for (let i = 0; i < PETALS; i++) {
    const bi = Math.floor((i / PETALS) * N * 0.8), v = bands[bi], a = (i / PETALS) * Math.PI * 2 + vizTime * 0.25, r = baseR + 5 + v * 80 + bass * 25;
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r, sizeW = 4 + v * 12, sizeH = 15 + v * 35;
    vizCtx.save(); vizCtx.translate(x, y); vizCtx.rotate(a + Math.PI / 2 + Math.sin(vizTime + i) * 0.3);
    vizCtx.fillStyle = i % 2 ? c1 : c2; vizCtx.beginPath(); vizCtx.ellipse(0, 0, sizeW, sizeH, 0, 0, Math.PI * 2); vizCtx.fill(); vizCtx.restore();
  }
  vizCtx.globalAlpha = 1;
}
function vizSpikes(cx, cy, baseR, bands, bass, c1, c2, N){
  const SPIKES = 70; vizCtx.lineCap = 'round';
  for (let i = 0; i < SPIKES; i++) {
    const bi = Math.floor((i / SPIKES) * N), v = bands[bi], chaos = Math.sin(vizTime * 18 + i * 3.7) * 0.5 + 0.5, a = (i / SPIKES) * Math.PI * 2 + Math.sin(vizTime * 6 + i) * 0.2, len = v * 110 + bass * 45 + chaos * 25 + 3;
    vizCtx.lineWidth = 1.5 + v * 3; vizCtx.strokeStyle = i % 2 ? c2 : c1;
    vizCtx.beginPath(); vizCtx.moveTo(cx + Math.cos(a) * baseR, cy + Math.sin(a) * baseR);
    vizCtx.lineTo(cx + Math.cos(a) * (baseR + len), cy + Math.sin(a) * (baseR + len)); vizCtx.stroke();
  }
}
function vizPulse(cx, cy, baseR, bands, bass, c1, c2, N){
  const RINGS = 4;
  for (let i = 0; i < RINGS; i++) {
    const phase = (vizTime * 0.5 + i * 0.25) % 1, r = baseR + phase * 100 + bass * 40, opacity = Math.max(0, 1 - phase) * 0.9;
    vizCtx.strokeStyle = withAlpha(c1, opacity); vizCtx.lineWidth = 3 + bass * 3;
    vizCtx.beginPath(); vizCtx.arc(cx, cy, r, 0, Math.PI * 2); vizCtx.stroke();
  }
  const cPulse = baseR + bass * 15;
  vizCtx.strokeStyle = withAlpha(c2, 0.5 + bass * 0.5); vizCtx.lineWidth = 1.5; vizCtx.beginPath(); vizCtx.arc(cx, cy, cPulse, 0, Math.PI * 2); vizCtx.stroke();
}

/* ═══ ТЕКСТЫ / ТАЙМЕР / ПЛЕЕР ═══ */
async function loadLyrics(t){
  state.lyrics = []; state.lyricsIdx = -1; if (els.lyricsBox) els.lyricsBox.innerHTML = '';
  if (!t || !t.lrc) return;
  let text = t.lrc;
  if (/\.lrc$/i.test(t.lrc)) { try { const res = await fetch(t.lrc); if (res.ok) text = await res.text(); else return; } catch { return; } }
  state.lyrics = text.split(/\r?\n/).map(line => { const m = line.match(/\[(\d+):(\d+(?:\.\d+)?)\](.*)/); if (!m) return null; return { time: (+m[1]) * 60 + parseFloat(m[2]), text: m[3].trim() }; }).filter(l => l && l.text);
}
function updateLyrics(){
  if (!state.showLyrics || !state.lyrics.length) return;
  const t = audio.currentTime; let idx = -1;
  for (let i = 0; i < state.lyrics.length; i++) { if (t >= state.lyrics[i].time) idx = i; else break; }
  if (idx === state.lyricsIdx) return;
  state.lyricsIdx = idx; if (!els.lyricsBox) return;
  els.lyricsBox.innerHTML = state.lyrics.map((l, i) => `<div class="lyric-line ${i === idx ? 'active':''}">${esc(l.text)}</div>`).join('');
  const active = els.lyricsBox.querySelector('.active'); if (active) active.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function toggleLyrics(){
  state.showLyrics = !state.showLyrics;
  if (els.lyricsBox) els.lyricsBox.style.display = state.showLyrics ? 'block' : 'none';
  if (els.npCover) els.npCover.style.opacity = state.showLyrics ? '0' : '1';
  if (els.npLyricsBtn) els.npLyricsBtn.classList.toggle('active', state.showLyrics);
  if (state.showLyrics) updateLyrics();
}
function setSleepTimer(mins){
  if (state.sleepTimerId) clearTimeout(state.sleepTimerId); state.sleepTimerId = null;
  if (!mins) { toast('Таймер сна выключен'); return; }
  state.sleepTimerId = setTimeout(() => { audio.pause(); state.playing = false; updatePlayIcons(); state.sleepTimerId = null; toast('Спокойной ночи 🌙'); vibrate([20, 40, 20]); }, mins * 60 * 1000);
  toast(`Сон через ${mins} мин`); closeEq();
}

function playTrack(idx, context){
  state.current = idx; const t = TRACKS[idx]; if (!t) return;
  if (context && context.length) state.queue = context.slice(); else if (!state.queue.length) state.queue = TRACKS.map((_, i) => i);
  state.queuePos = state.queue.indexOf(idx);
  if (state.queuePos === -1) { state.queue = TRACKS.map((_, i) => i); state.queuePos = idx; }
  audio.src = './tracks/' + t.file; try { audio.load(); } catch(e){}
  applyTrackColors(t); setWallpaper(t.mode || 'default'); updateUIForTrack(t); loadLyrics(t);
  ensureAudioRunning().then(() => { if (state.eq && state.eq !== 'flat') applyEqMode(state.eq, true); return audio.play(); })
  .then(() => { state.playing = true; updatePlayIcons(); countPlay(t.id); if (els.nowPlaying && els.nowPlaying.classList.contains('open')) setTimeout(() => startViz(), 60); })
  .catch(() => { toast('⚠ Нет файла: /tracks/' + t.file); });
}
function togglePlay(){
  if (!audio.src) { playTrack(state.current); return; }
  if (audio.paused) { ensureAudioRunning().then(() => audio.play()).then(() => { state.playing = true; updatePlayIcons(); if (els.nowPlaying && els.nowPlaying.classList.contains('open')) startViz(); }).catch(()=>{}); }
  else { audio.pause(); state.playing = false; updatePlayIcons(); }
}
function countPlay(id){ state.plays[id] = (state.plays[id] || 0) + 1; localStorage.setItem('a5000_plays', JSON.stringify(state.plays)); }

function nextTrack(){
  if (state.shuffle) { let n; do { n = Math.floor(Math.random() * TRACKS.length); } while (n === state.current && TRACKS.length > 1); playTrack(n); return; }
  if (state.queue.length) {
    state.queuePos = (state.queuePos + 1) % state.queue.length;
    if (state.queuePos === 0 && state.repeat !== 2) { audio.pause(); state.playing = false; updatePlayIcons(); return; }
    playTrack(state.queue[state.queuePos], state.queue); return;
  }
  let n = state.current + 1; if (n >= TRACKS.length) { if (state.repeat === 2) n = 0; else { audio.pause(); state.playing = false; updatePlayIcons(); return; } }
  playTrack(n);
}
function prevTrack(){
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  if (state.queue.length) { state.queuePos = (state.queuePos - 1 + state.queue.length) % state.queue.length; playTrack(state.queue[state.queuePos], state.queue); return; }
  let n = state.current - 1; if (n < 0) n = TRACKS.length - 1; playTrack(n);
}
function playRandom(){ if (TRACKS.length < 2) { playTrack(0); return; } let n; do { n = Math.floor(Math.random() * TRACKS.length); } while (n === state.current); playTrack(n); toast('Гдееее 🖤'); }
function playAllFromStart(){ state.queue = TRACKS.map((_, i) => i); state.queuePos = 0; state.shuffle = false; playTrack(0, state.queue); toast('▶ Всё подряд'); }
function toggleShuffle(){ state.shuffle = !state.shuffle; if (els.npShuffle) els.npShuffle.classList.toggle('active', state.shuffle); toast(state.shuffle ? '🔀 Перемешать' : '🔀 По порядку'); vibrate(6); }
function cycleRepeat(){ state.repeat = (state.repeat + 1) % 3; if (els.npRepeat) els.npRepeat.classList.toggle('active', state.repeat !== 0); toast(['↩ Без повтора','🔂 Трек','🔁 Все'][state.repeat]); vibrate(6); }

function updateUIForTrack(t){
  hydrateCover(els.mpCover, t, 96); if (els.mpTitle) els.mpTitle.textContent = t.title; if (els.mpFeat) els.mpFeat.textContent = t.feat ? 'feat. ' + t.feat : 'A5000 · ' + t.year; if (els.miniPlayer) els.miniPlayer.classList.add('show');
  hydrateCover(els.npCover, t, 480); if (els.npTitle) els.npTitle.textContent = t.title; if (els.npArtist) els.npArtist.textContent = t.feat ? 'A5000 × ' + t.feat : 'A5000'; if (els.npAlbum) els.npAlbum.textContent = t.year + ' · Single'; if (els.npHeaderName) els.npHeaderName.textContent = t.title;
  if (els.npTimeCurrent) els.npTimeCurrent.textContent = '0:00'; if (els.npTimeTotal) els.npTimeTotal.textContent = t.duration; if (els.npProgressFill) els.npProgressFill.style.width = '0%'; if (els.npProgressKnob) els.npProgressKnob.style.left = '0%';
  updateLikeButton(); if (els.npShuffle) els.npShuffle.classList.toggle('active', state.shuffle); if (els.npRepeat) els.npRepeat.classList.toggle('active', state.repeat !== 0);
  updateMediaSession(t);
}
function updatePlayIcons(){
  const play = '<path d="M8 5v14l11-7z"/>', pause = '<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>';
  if (els.mpPlayIcon) els.mpPlayIcon.innerHTML = state.playing ? pause : play; if (els.npPlayIcon) els.npPlayIcon.innerHTML = state.playing ? pause : play;
  if (els.npPlay) els.npPlay.classList.toggle('playing', state.playing); if (els.mpPlay) els.mpPlay.classList.toggle('playing', state.playing);
  if (els.npCover) els.npCover.classList.toggle('playing', state.playing);
}
function openNowPlaying(){
  if (!audio.src) { toast('Сначала выбери трек'); return; }
  if (els.nowPlaying) els.nowPlaying.classList.add('open'); ensureAudioRunning().then(() => { setTimeout(() => startViz(), 80); }); vibrate(6);
}
function closeNowPlaying(){ if (els.nowPlaying) els.nowPlaying.classList.remove('open'); stopViz(); vibrate(4); }

/* ═══ ПРОГРЕСС & MEDIA SESSION (APPLE STYLE) ═══ */
let lastProg = 0;
audio.addEventListener('timeupdate', () => {
  const now = performance.now(); if (now - lastProg < 200) return; lastProg = now;
  if (!audio.duration || !isFinite(audio.duration)) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  if (els.npProgressFill) els.npProgressFill.style.width = pct + '%'; if (els.npProgressKnob) els.npProgressKnob.style.left = pct + '%';
  if (els.npTimeCurrent) els.npTimeCurrent.textContent = formatTime(audio.currentTime); if (els.mpProgress) els.mpProgress.style.setProperty('--mp-progress', pct + '%');
  updateLyrics();
  
  // Синхронизация полосы на экране блокировки iOS/Android
  if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession && audio.duration) {
    try {
      navigator.mediaSession.setPositionState({
        duration: audio.duration,
        playbackRate: audio.playbackRate,
        position: audio.currentTime
      });
    } catch(e){}
  }
});
audio.addEventListener('loadedmetadata', () => { if (els.npTimeTotal) els.npTimeTotal.textContent = formatTime(audio.duration); });
audio.addEventListener('play', () => { state.playing = true; updatePlayIcons(); });
audio.addEventListener('pause', () => { state.playing = false; updatePlayIcons(); });
audio.addEventListener('ended', () => { if (state.repeat === 1) { audio.currentTime = 0; audio.play().catch(()=>{}); } else { nextTrack(); } });

let seeking = false;
function seekFromEvent(e){
  if (!els.npProgressBar || !audio.duration) return;
  const r = els.npProgressBar.getBoundingClientRect(), pct = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
  audio.currentTime = pct * audio.duration;
  if (els.npProgressFill) els.npProgressFill.style.width = (pct*100) + '%'; if (els.npProgressKnob) els.npProgressKnob.style.left = (pct*100) + '%';
  if (els.npTimeCurrent) els.npTimeCurrent.textContent = formatTime(audio.currentTime);
}

function resetStats(){
  state.plays = {}; state.liked = []; localStorage.removeItem('a5000_plays'); localStorage.removeItem('a5000_liked');
  renderHome(); renderLiked(); renderSettings(); document.querySelectorAll('.track-like').forEach(b => { b.classList.remove('liked'); const s = b.querySelector('svg'); if (s) s.setAttribute('fill', 'none'); });
  updateLikeButton(); toast('Статистика сброшена');
}
function forceUpdate(){
  if ('serviceWorker' in navigator) navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
  if ('caches' in window) caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
  toast('Обновление...'); setTimeout(() => location.reload(true), 500);
}

function updateMediaSession(t){
  if (!('mediaSession' in navigator)) return;
  
  // Формируем массив иконок разных размеров (iOS требует разные размеры)
  const artwork = [
    { src: state.coverCache[t.id] ? './covers/' + t.cover : './icon-512.png', sizes: '96x96', type: 'image/webp' },
    { src: state.coverCache[t.id] ? './covers/' + t.cover : './icon-512.png', sizes: '128x128', type: 'image/webp' },
    { src: state.coverCache[t.id] ? './covers/' + t.cover : './icon-512.png', sizes: '192x192', type: 'image/webp' },
    { src: state.coverCache[t.id] ? './covers/' + t.cover : './icon-512.png', sizes: '256x256', type: 'image/webp' },
    { src: state.coverCache[t.id] ? './covers/' + t.cover : './icon-512.png', sizes: '384x384', type: 'image/webp' },
    { src: state.coverCache[t.id] ? './covers/' + t.cover : './icon-512.png', sizes: '512x512', type: 'image/webp' }
  ];

  navigator.mediaSession.metadata = new MediaMetadata({
    title: t.title,
    artist: t.feat ? 'A5000 × ' + t.feat : 'A5000',
    album: t.year + ' · Null Null Null Music',
    artwork: artwork
  });

  try {
    navigator.mediaSession.setActionHandler('play', () => { if (audio.paused) togglePlay(); });
    navigator.mediaSession.setActionHandler('pause', () => { if (!audio.paused) togglePlay(); });
    navigator.mediaSession.setActionHandler('previoustrack', prevTrack);
    navigator.mediaSession.setActionHandler('nexttrack', nextTrack);
    navigator.mediaSession.setActionHandler('seekbackward', (details) => { audio.currentTime = Math.max(audio.currentTime - (details.seekOffset || 10), 0); });
    navigator.mediaSession.setActionHandler('seekforward', (details) => { audio.currentTime = Math.min(audio.currentTime + (details.seekOffset || 10), audio.duration); });
    navigator.mediaSession.setActionHandler('seekto', (details) => { if (details.fastSeek && 'fastSeek' in audio) { audio.fastSeek(details.seekTime); return; } audio.currentTime = details.seekTime; });
  } catch(e){}
}

/* ═══ BLUETOOTH & DEVICE DETECTION ═══ */
// Пауза при отключении наушников/колонок (как в iOS)
if (navigator.mediaDevices && navigator.mediaDevices.addEventListener) {
  navigator.mediaDevices.addEventListener('devicechange', async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const hasAudioOutput = devices.some(d => d.kind === 'audiooutput');
    if (!hasAudioOutput && state.playing) {
      audio.pause();
      state.playing = false;
      updatePlayIcons();
      toast('🎧 Наушники отключены');
    }
  });
}

/* ═══ ИНИЦИАЛИЗАЦИЯ ═══ */
(async function init(){
  els = {
    splash: $('splash'), app: $('app'), greetingText: $('greetingText'), themeHint: $('themeHint'), wallA: $('wallA'), wallB: $('wallB'), wallTint: $('wallTint'),
    timeline: $('timeline'), recentRow: $('recentRow'), topTracks: $('topTracks'), moodGrid: $('moodGrid'), searchInput: $('searchInput'), searchClear: $('searchClear'),
    searchEmpty: $('searchEmpty'), searchResults: $('searchResults'), suggestChips: $('suggestChips'), filterRow: $('filterRow'), libraryTracks: $('libraryTracks'),
    sortLabel: $('sortLabel'), likedTracks: $('likedTracks'), likedEmpty: $('likedEmpty'), miniPlayer: $('miniPlayer'), mpCover: $('mpCover'), mpTitle: $('mpTitle'),
    mpFeat: $('mpFeat'), mpProgress: $('mpProgress'), mpPlayIcon: $('mpPlayIcon'), nowPlaying: $('nowPlaying'), npBg: $('npBg'), npCover: $('npCover'),
    visualizer: $('visualizer'), lyricsBox: $('lyricsBox'), npTitle: $('npTitle'), npArtist: $('npArtist'), npAlbum: $('npAlbum'), npHeaderName: $('npHeaderName'),
    npProgressBar: $('npProgressBar'), npProgressFill: $('npProgressFill'), npProgressKnob: $('npProgressKnob'), npTimeCurrent: $('npTimeCurrent'), npTimeTotal: $('npTimeTotal'),
    npPlayIcon: $('npPlayIcon'), npLyricsBtn: $('npLyricsBtn'), npLike: $('npLike'), npLikeIcon: $('npLikeIcon'), npShuffle: $('npShuffle'), npRepeat: $('npRepeat'),
    toast: $('toast'), eqSheet: $('eqSheet'), eqPresets: $('eqPresets'), themeSeg: $('themeSeg'), statTotalPlays: $('statTotalPlays'), statTopTrack: $('statTopTrack'),
    statLiked: $('statLiked'), toggleVibrate: $('toggleVibrate')
  };

  applyTheme();
  document.querySelectorAll('.nav-item').forEach(n => n.addEventListener('click', () => navigate(n.dataset.nav)));
  if (els.themeSeg) els.themeSeg.querySelectorAll('.seg-btn').forEach(b => b.addEventListener('click', () => { state.theme = b.dataset.themeOpt; localStorage.setItem('a5000_theme', state.theme); applyTheme(); vibrate(6); }));
  if (els.toggleVibrate) {
    els.toggleVibrate.classList.toggle('on', state.vibrate);
    els.toggleVibrate.addEventListener('click', () => { state.vibrate = !state.vibrate; localStorage.setItem('a5000_vibrate', state.vibrate ? 'on' : 'off'); els.toggleVibrate.classList.toggle('on', state.vibrate); vibrate(10); });
  }
  if (els.filterRow) els.filterRow.querySelectorAll('[data-filter]').forEach(b => b.addEventListener('click', () => { state.filter = b.dataset.filter; els.filterRow.querySelectorAll('.chip').forEach(x => x.classList.toggle('active', x === b)); renderLibrary(); }));
  if (els.npProgressBar) {
    els.npProgressBar.addEventListener('pointerdown', e => { seeking = true; els.npProgressBar.setPointerCapture(e.pointerId); seekFromEvent(e); });
    els.npProgressBar.addEventListener('pointermove', e => { if (seeking) seekFromEvent(e); });
    els.npProgressBar.addEventListener('pointerup', () => { seeking = false; });
    els.npProgressBar.addEventListener('pointercancel', () => { seeking = false; });
  }

  await Promise.race([preloadCovers(), new Promise(r => setTimeout(r, 2000))]);
  renderHome(); initSearch(); updatePlayIcons(); renderLibrary(); setWallpaper('default');

  setTimeout(() => {
    if (els.splash) els.splash.classList.add('hide'); if (els.app) els.app.classList.add('show');
    setTimeout(() => { if (els.splash && els.splash.parentNode) els.splash.parentNode.removeChild(els.splash); }, 700);
  }, 1200);

  if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(()=>{}));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (els.nowPlaying && els.nowPlaying.classList.contains('open')) closeNowPlaying(); if (els.eqSheet && els.eqSheet.classList.contains('open')) closeEq(); }
    if (e.code === 'Space' && document.activeElement?.tagName !== 'INPUT') { e.preventDefault(); togglePlay(); }
  });
  window.addEventListener('resize', () => { if (vizRunning) prepareViz(); }, { passive: true });
})();