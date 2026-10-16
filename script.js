/* ═══ A5000 PLAYER · SCRIPT · v1.1 · Liquid Glass ═══ */

const TRACKS = [
  { id:'01', file:'01-vernulsya.mp3', cover:'01-vernulsya.webp', title:'Вернулся — забери своё', feat:'', year:2026, duration:'3:16',
    color:'#ff1493', color2:'#ff6b00', keyMoments:[0.12,0.38,0.72] },
  { id:'02', file:'02-moy-vtoroy.mp3', cover:'02-moy-vtoroy.webp', title:'Мой второй', feat:'', year:2026, duration:'3:02',
    color:'#5a9bff', color2:'#a855f7', keyMoments:[0.15,0.45] },
  { id:'03', file:'03-villa.mp3', cover:'03-villa.webp', title:'The Villa', feat:'Блогерский Бит', year:2026, duration:'2:31',
    color:'#00ffff', color2:'#0080ff', keyMoments:[0.10,0.35,0.65,0.85] },
  { id:'04', file:'04-rozovoe-vino-3.mp3', cover:'04-rozovoe-vino-3.webp', title:'Розовое вино 3', feat:'Блогерский Бит', year:2026, duration:'4:06',
    color:'#ff006e', color2:'#c2006e', keyMoments:[0.18,0.42,0.70] },
  { id:'05', file:'05-krest.mp3', cover:'05-krest.webp', title:'Крест', feat:'', year:2026, duration:'3:20',
    color:'#8a2be2', color2:'#4b0082', keyMoments:[0.20,0.55] },
  { id:'06', file:'06-gta.mp3', cover:'06-gta.webp', title:'GTA / Новый этап 1', feat:'', year:2026, duration:'3:16',
    color:'#ff6b00', color2:'#ff0044', keyMoments:[0.14,0.40,0.68] },
  { id:'07', file:'07-i-ya-tak-zhivu.mp3', cover:'07-i-ya-tak-zhivu.webp', title:'И я так живу', feat:'', year:2026, duration:'3:16',
    color:'#ffd700', color2:'#ff9500', keyMoments:[0.12,0.36,0.60] },
  { id:'08', file:'08-silence.mp3', cover:'08-silence.webp', title:'Тишина (Silence)', feat:'', year:2026, duration:'3:00',
    color:'#00ffaa', color2:'#0088ff', keyMoments:[0.25,0.50,0.75] }
];

const state = {
  current: 0, playing: false, shuffle: false, repeat: 0,
  filter: 'all', view: 'list', sort: 0,
  coverCache: {},
  plays: JSON.parse(localStorage.getItem('a5000_plays') || '{}'),
  liked: JSON.parse(localStorage.getItem('a5000_liked') || '[]'),
  vibrate: localStorage.getItem('a5000_vibrate') !== 'off',
  wake: localStorage.getItem('a5000_wake') !== 'off',
  theme: localStorage.getItem('a5000_theme') || 'auto',
  eq: localStorage.getItem('a5000_eq') || 'flat',
  mood: null,
  queue: [],
  queuePos: 0
};

const SORTS = [
  { label: 'По номеру', fn: (a,b) => TRACKS.indexOf(a) - TRACKS.indexOf(b) },
  { label: 'А-Я',       fn: (a,b) => a.title.localeCompare(b.title, 'ru') },
  { label: 'По длине',  fn: (a,b) => parseDur(a.duration) - parseDur(b.duration) },
  { label: 'По плеям',  fn: (a,b) => (state.plays[b.id]||0) - (state.plays[a.id]||0) }
];

const MOODS = [
  { id:'party', emoji:'🔥', title:'Для вечеринки', tracks:['01','04','06'], bg:'linear-gradient(135deg,#ff1493,#ff6b00)' },
  { id:'think', emoji:'🌙', title:'Для размышлений', tracks:['08','02','05'], bg:'linear-gradient(135deg,#4a00ff,#00ffff)' },
  { id:'drunk', emoji:'🍷', title:'Пьяный вайб', tracks:['03','04','07'], bg:'linear-gradient(135deg,#c2006e,#ff9500)' },
  { id:'train', emoji:'💪', title:'Для тренировок', tracks:['06','01','05'], bg:'linear-gradient(135deg,#00d4ff,#00ff88)' }
];

const EQ_PRESETS = [
  { id:'flat',   name:'Ровно' },
  { id:'bass',   name:'Бас' },
  { id:'vocal',  name:'Вокал' },
  { id:'classic',name:'Классика' }
];

const $ = id => document.getElementById(id);
const audio = $('audio');
const els = {
  splash:$('splash'), app:$('app'), greeting:$('greetingText'),
  moodTint:$('moodTint'), moodBadge:$('moodBadge'),
  moodBadgeEmoji:$('moodBadgeEmoji'), moodBadgeName:$('moodBadgeName'),
  recentRow:$('recentRow'), topTracks:$('topTracks'), moodGrid:$('moodGrid'),
  searchInput:$('searchInput'), searchClear:$('searchClear'),
  searchEmpty:$('searchEmpty'), searchResults:$('searchResults'),
  suggestChips:$('suggestChips'), genreGrid:$('genreGrid'),
  filterRow:$('filterRow'), sortLabel:$('sortLabel'),
  libraryTracks:$('libraryTracks'), libraryGrid:$('libraryGrid'),
  likedTracks:$('likedTracks'), likedEmpty:$('likedEmpty'), likedCount:$('likedCount'),
  miniPlayer:$('miniPlayer'), mpCover:$('mpCover'), mpTitle:$('mpTitle'),
  mpFeat:$('mpFeat'), mpProgress:$('mpProgress'), mpPlayIcon:$('mpPlayIcon'),
  np:$('nowPlaying'), npBg:$('npBg'), npCover:$('npCover'),
  npTitle:$('npTitle'), npArtist:$('npArtist'), npAlbum:$('npAlbum'),
  npHeaderName:$('npHeaderName'), npProgressBar:$('npProgressBar'),
  npProgressFill:$('npProgressFill'), npProgressDots:$('npProgressDots'),
  npProgressKnob:$('npProgressKnob'), npTimeCurrent:$('npTimeCurrent'),
  npTimeTotal:$('npTimeTotal'), npPlayIcon:$('npPlayIcon'),
  npLike:$('npLike'), npLikeIcon:$('npLikeIcon'),
  npShuffle:$('npShuffle'), npRepeat:$('npRepeat'),
  toast:$('toast'),
  statTotalPlays:$('statTotalPlays'), statTopTrack:$('statTopTrack'), statLiked:$('statLiked'),
  queueSheet:$('queueSheet'), queueList:$('queueList'),
  eqSheet:$('eqSheet'), eqPresets:$('eqPresets'),
  themeSeg:$('themeSeg')
};

/* ═══ УТИЛИТЫ ═══ */
function parseDur(s){ const [m,sec]=s.split(':').map(Number); return m*60+sec; }
function formatTime(s){ if(!isFinite(s)||s<0) return '0:00'; const m=Math.floor(s/60); const sec=Math.floor(s%60); return m+':'+String(sec).padStart(2,'0'); }
function vibrate(p){ if(state.vibrate && navigator.vibrate) navigator.vibrate(p); }
function esc(s){ return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function plural(n,one,few,many){ const m10=n%10,m100=n%100; if(m10===1&&m100!==11)return one; if(m10>=2&&m10<=4&&(m100<10||m100>=20))return few; return many; }
function toast(msg){ els.toast.textContent=msg; els.toast.classList.add('show'); clearTimeout(window.__toastT); window.__toastT=setTimeout(()=>els.toast.classList.remove('show'),2200); }

/* ═══ SVG-ОБЛОЖКА ═══ */
function makeCoverSVG(t, size=320){
  const s=size, gid='g_'+t.id, a1=t.color||'#ff1493', a2=t.color2||'#00ffff';
  const words=t.title.split(' '); let l1='',l2='',cur='';
  for(const w of words){ if((cur+' '+w).trim().length>14 && l2===''){ l1=cur.trim(); cur=w; } else cur=(cur+' '+w).trim(); }
  l2=cur.trim();
  return `<svg viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${a1}" stop-opacity="0.22"/>
        <stop offset="100%" stop-color="${a2}" stop-opacity="0.08"/>
      </linearGradient>
      <radialGradient id="${gid}_r" cx="50%" cy="30%" r="75%">
        <stop offset="0%" stop-color="${a1}" stop-opacity="0.42"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${s}" height="${s}" fill="#000"/>
    <rect width="${s}" height="${s}" fill="url(#${gid}_r)"/>
    <rect width="${s}" height="${s}" fill="url(#${gid})"/>
    <text x="${s/2}" y="${s*0.38}" text-anchor="middle" font-family="Bebas Neue, Impact, sans-serif" font-size="${s*0.22}" letter-spacing="${s*0.015}" fill="#fff" font-weight="900">A5000</text>
    <text x="${s/2}" y="${s*0.58}" text-anchor="middle" font-family="Inter, sans-serif" font-size="${s*0.075}" letter-spacing="0.5" fill="${a1}" font-weight="900">${esc(l1)}</text>
    ${l2 ? `<text x="${s/2}" y="${s*0.68}" text-anchor="middle" font-family="Inter, sans-serif" font-size="${s*0.075}" letter-spacing="0.5" fill="${a1}" font-weight="900">${esc(l2)}</text>` : ''}
    ${t.feat ? `<text x="${s/2}" y="${s*0.76}" text-anchor="middle" font-family="Inter, sans-serif" font-size="${s*0.04}" letter-spacing="0.6" fill="${a2}" font-weight="700">feat. ${esc(t.feat)}</text>` : ''}
    <text x="${s/2}" y="${s*0.94}" text-anchor="middle" font-family="Bebas Neue, Impact, sans-serif" font-size="${s*0.034}" letter-spacing="${s*0.012}" fill="rgba(255,255,255,0.32)">NULL NULL NULL MUSIC</text>
  </svg>`;
}

/* ═══ ПРЕДЗАГРУЗКА ОБЛОЖЕК (лечит главную) ═══ */
function preloadCovers(){
  return Promise.all(TRACKS.map(t => new Promise(resolve => {
    const img = new Image();
    img.onload = () => { state.coverCache[t.id] = true; resolve(); };
    img.onerror = () => { state.coverCache[t.id] = false; resolve(); };
    img.src = './covers/' + t.cover;
  })));
}

function coverHTML(t, size=200){
  if (state.coverCache[t.id] === true) {
    return `<img src="./covers/${t.cover}" alt="${esc(t.title)}" loading="lazy">`;
  }
  return makeCoverSVG(t, size);
}

function hydrateCover(el, t, size=320){
  if (!el) return;
  if (state.coverCache[t.id] === true) {
    el.innerHTML = `<img src="./covers/${t.cover}" alt="${esc(t.title)}" loading="lazy">`;
  } else {
    el.innerHTML = makeCoverSVG(t, size);
  }
}

/* ═══ ЦВЕТ ТРЕКА (применяется к NP + мини-плееру) ═══ */
function applyTrackColor(t){
  const root = document.documentElement;
  root.style.setProperty('--track-color', t.color || '#ff1493');
  root.style.setProperty('--track-color-2', t.color2 || '#00ffff');
  els.np.style.setProperty('--track-color', t.color || '#ff1493');
  els.np.style.setProperty('--track-color-2', t.color2 || '#00ffff');
}

/* ═══ MOOD ═══ */
function applyMood(mood){
  state.mood = mood;
  if (mood) {
    document.body.dataset.mood = mood.id;
    els.moodBadge.style.display = 'flex';
    els.moodBadgeEmoji.textContent = mood.emoji;
    els.moodBadgeName.textContent = mood.title;
  } else {
    delete document.body.dataset.mood;
    els.moodBadge.style.display = 'none';
  }
}
function clearMood(){
  applyMood(null);
  toast('Настроение сброшено');
  vibrate(8);
}

/* ═══ ТЕМА ═══ */
function applyTheme(){
  let theme = state.theme;
  if (theme === 'auto') {
    const h = new Date().getHours();
    theme = (h >= 22 || h < 6) ? 'dark' : 'dark'; // оставим тёмную по умолчанию, но можно light
    // Простой вариант: авто = тёмная ночью, светлая днём если системная светлая
    theme = (h >= 22 || h < 6) ? 'dark'
      : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  }
  document.documentElement.setAttribute('data-theme', theme);
  const meta = $('themeMeta');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#000000' : '#f2f2f7');
  els.themeSeg.querySelectorAll('.theme-seg-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.themeOpt === state.theme);
  });
}
els.themeSeg.querySelectorAll('.theme-seg-btn').forEach(b => {
  b.addEventListener('click', () => {
    state.theme = b.dataset.themeOpt;
    localStorage.setItem('a5000_theme', state.theme);
    applyTheme();
    vibrate(8);
  });
});
setInterval(applyTheme, 5 * 60 * 1000);

/* ═══ РЕНДЕР СПИСКОВ ═══ */
function trackListHTML(tracks){
  return tracks.map((t,i)=>{
    const idx = TRACKS.indexOf(t);
    const liked = state.liked.includes(t.id);
    const playing = idx === state.current;
    return `
    <div class="track-item ${playing?'playing':''}" data-idx="${idx}" style="animation-delay:${Math.min(i*30,300)}ms">
      <div class="track-cover">${coverHTML(t,100)}</div>
      <div class="track-info">
        <div class="track-name">${esc(t.title)}</div>
        <div class="track-feat ${t.feat?'feat':''}">${t.feat ? 'feat. '+esc(t.feat) : 'A5000 · '+t.year}</div>
      </div>
      <div class="track-meta">
        <span class="track-dur">${t.duration}</span>
        <button class="track-like ${liked?'liked':''}" data-like="${t.id}" aria-label="Любимый">
          <svg viewBox="0 0 24 24" fill="${liked?'currentColor':'none'}" stroke="currentColor" stroke-width="2" stroke-linejoin="round">
            <path d="M12 21s-7-4.7-9.3-8.5C1 9.8 2.5 6 6 6c2 0 3.3 1.2 4 2.5.7-1.3 2-2.5 4-2.5 3.5 0 5 3.8 3.3 6.5C19 16.3 12 21 12 21z"/>
          </svg>
        </button>
      </div>
    </div>`;
  }).join('');
}

function trackGridHTML(tracks){
  return tracks.map((t,i)=>{
    const idx = TRACKS.indexOf(t);
    const playing = idx === state.current;
    return `
    <div class="grid-card ${playing?'playing':''}" data-idx="${idx}" style="animation-delay:${Math.min(i*30,300)}ms">
      <div class="grid-cover">${coverHTML(t,300)}</div>
      <div class="grid-name">${esc(t.title)}</div>
      <div class="grid-feat">${t.feat ? 'feat. '+esc(t.feat) : 'A5000 · '+t.year}</div>
    </div>`;
  }).join('');
}

function getFilteredTracks(){
  let arr = TRACKS.slice();
  if (state.filter === 'feat') arr = arr.filter(t => t.feat);
  else if (state.filter === 'solo') arr = arr.filter(t => !t.feat);
  else if (state.filter === 'liked') arr = arr.filter(t => state.liked.includes(t.id));
  arr.sort(SORTS[state.sort].fn);
  return arr;
}

/* ═══ РЕНДЕР ЭКРАНОВ ═══ */
function renderHome(){
  els.greeting.textContent = getGreeting();
  const recents = TRACKS.slice().sort((a,b)=>(state.plays[b.id]||0)-(state.plays[a.id]||0)).slice(0,6);
  els.recentRow.innerHTML = recents.map(t=>{
    const idx = TRACKS.indexOf(t);
    return `<div class="recent-card" data-idx="${idx}">
      <div class="recent-cover">${coverHTML(t,260)}</div>
      <div class="recent-name">${esc(t.title)}</div>
      <div class="recent-feat">${t.feat ? 'feat. '+esc(t.feat) : 'A5000'}</div>
    </div>`;
  }).join('');
  const top = TRACKS.slice().sort((a,b)=>(state.plays[b.id]||0)-(state.plays[a.id]||0)).slice(0,5);
  els.topTracks.innerHTML = trackListHTML(top);
  els.moodGrid.innerHTML = MOODS.map(m=>`
    <div class="mood-card" data-mood="${m.id}" style="background:${m.bg}">
      <div class="mood-emoji">${m.emoji}</div>
      <div>
        <div class="mood-title">${m.title}</div>
        <div class="mood-count">${m.tracks.length} трека</div>
      </div>
    </div>`).join('');
  bindTrackClicks(els.recentRow);
  bindTrackClicks(els.topTracks);
  bindMoodClicks();
}

function getGreeting(){
  const h = new Date().getHours();
  if (h < 5) return 'Доброй ночи';
  if (h < 12) return 'Доброе утро';
  if (h < 18) return 'Добрый день';
  return 'Добрый вечер';
}

function renderLibrary(){
  const list = getFilteredTracks();
  els.libraryTracks.innerHTML = state.view === 'list' ? trackListHTML(list) : '';
  els.libraryGrid.innerHTML = state.view === 'grid' ? trackGridHTML(list) : '';
  els.libraryTracks.style.display = state.view === 'list' ? 'flex' : 'none';
  els.libraryGrid.style.display = state.view === 'grid' ? 'grid' : 'none';
  els.sortLabel.textContent = SORTS[state.sort].label;
  bindTrackClicks(els.libraryTracks);
  bindTrackClicks(els.libraryGrid);
}

function renderLiked(){
  const liked = TRACKS.filter(t => state.liked.includes(t.id));
  els.likedCount.textContent = liked.length + ' ' + plural(liked.length,'трек','трека','треков');
  if (!liked.length) { els.likedTracks.innerHTML=''; els.likedEmpty.style.display='block'; return; }
  els.likedEmpty.style.display = 'none';
  els.likedTracks.innerHTML = trackListHTML(liked);
  bindTrackClicks(els.likedTracks);
}

function renderSettings(){
  const total = Object.values(state.plays).reduce((a,b)=>a+b,0);
  els.statTotalPlays.textContent = total;
  const top = TRACKS.slice().sort((a,b)=>(state.plays[b.id]||0)-(state.plays[a.id]||0))[0];
  els.statTopTrack.textContent = top && state.plays[top.id] ? top.title.split(' ')[0] : '—';
  els.statLiked.textContent = state.liked.length;
  $('toggleVibrate').classList.toggle('on', state.vibrate);
  $('toggleWake').classList.toggle('on', state.wake);
}

function bindTrackClicks(root){
  if (!root) return;
  root.querySelectorAll('[data-idx]').forEach(el=>{
    el.addEventListener('click', e=>{
      if (e.target.closest('[data-like]')) return;
      playTrack(parseInt(el.dataset.idx,10));
    });
  });
  root.querySelectorAll('[data-like]').forEach(btn=>{
    btn.addEventListener('click', e=>{ e.stopPropagation(); toggleLike(btn.dataset.like); });
  });
}

function bindMoodClicks(){
  els.moodGrid.querySelectorAll('[data-mood]').forEach(card=>{
    card.addEventListener('click', ()=>{
      const mood = MOODS.find(m=>m.id === card.dataset.mood);
      if (!mood) return;
      applyMood(mood);
      const firstIdx = TRACKS.findIndex(t => t.id === mood.tracks[0]);
      if (firstIdx >= 0) {
        playTrack(firstIdx);
        toast(mood.emoji + ' ' + mood.title);
      }
    });
  });
}

/* ═══ ПОИСК ═══ */
function initSearch(){
  els.suggestChips.innerHTML = ['Вилла','Крест','Тишина','GTA','Розовое','Блогерский']
    .map(s=>`<button class="chip" data-suggest="${s}">${s}</button>`).join('');
  els.suggestChips.querySelectorAll('[data-suggest]').forEach(c=>{
    c.addEventListener('click', ()=>{ els.searchInput.value = c.dataset.suggest; doSearch(); });
  });
  const genres = [
    { name:'Рэп',      bg:'linear-gradient(135deg,#ff1493,#ff6b00)' },
    { name:'Трэп',     bg:'linear-gradient(135deg,#7c00ff,#ff1493)' },
    { name:'Для души', bg:'linear-gradient(135deg,#00aaff,#00ffff)' },
    { name:'Хип-хоп',  bg:'linear-gradient(135deg,#ff9500,#ffd700)' }
  ];
  els.genreGrid.innerHTML = genres.map(g=>`<div class="genre-card" style="background:${g.bg}">${g.name}</div>`).join('');
  els.searchInput.addEventListener('input', doSearch);
}

function doSearch(){
  const q = els.searchInput.value.trim().toLowerCase();
  if (!q) {
    els.searchEmpty.style.display = 'block';
    els.searchResults.style.display = 'none';
    els.searchClear.classList.remove('show');
    return;
  }
  els.searchEmpty.style.display = 'none';
  els.searchResults.style.display = 'block';
  els.searchClear.classList.add('show');
  const found = TRACKS.filter(t =>
    t.title.toLowerCase().includes(q) ||
    (t.feat && t.feat.toLowerCase().includes(q)) ||
    t.year.toString().includes(q)
  );
  if (!found.length) {
    els.searchResults.innerHTML = `<div class="empty"><div class="empty-icon">🔍</div><div class="empty-title">Ничего не найдено</div><div class="empty-sub">Попробуй другое слово</div></div>`;
    return;
  }
  els.searchResults.innerHTML = `<div class="section-head" style="padding-top:8px"><h2>Найдено: ${found.length}</h2></div><div class="track-list">${trackListHTML(found)}</div>`;
  bindTrackClicks(els.searchResults);
}

function clearSearch(){ els.searchInput.value=''; doSearch(); els.searchInput.focus(); }

/* ═══ НАВИГАЦИЯ ═══ */
function navigate(screen){
  document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active', s.dataset.screen === screen));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active', n.dataset.nav === screen));
  if (screen === 'home') renderHome();
  if (screen === 'library') renderLibrary();
  if (screen === 'liked') renderLiked();
  vibrate(8);
}

function openSettings(){
  document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active', s.dataset.screen === 'settings'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  renderSettings();
}
function closeSettings(){ navigate('home'); }

/* ═══ ПЛЕЕР ═══ */
function playTrack(idx, context){
  state.current = idx;
  const t = TRACKS[idx];
  if (!t) return;

  // Queue: если контекст передан, используем его; иначе — вся библиотека
  if (context && context.length) {
    state.queue = context.slice();
  } else if (!state.queue.length) {
    state.queue = TRACKS.map((_,i)=>i);
  }
  state.queuePos = state.queue.indexOf(idx);
  if (state.queuePos === -1) { state.queue = TRACKS.map((_,i)=>i); state.queuePos = idx; }

  audio.src = './tracks/' + t.file;
  try { audio.load(); } catch(e) {}

  applyTrackColor(t);
  updateUIForTrack(t, true);

  const p = audio.play();
  if (p && p.then) {
    p.then(()=>{ state.playing = true; updatePlayIcons(); countPlay(t.id); })
     .catch(()=>{ state.playing = false; updatePlayIcons(); toast('⚠ Трек ещё не загружен: /tracks/' + t.file); });
  }
}

function countPlay(id){
  state.plays[id] = (state.plays[id] || 0) + 1;
  localStorage.setItem('a5000_plays', JSON.stringify(state.plays));
}

function togglePlay(){
  if (!audio.src) { playTrack(state.current); return; }
  if (audio.paused) {
    audio.play().then(()=>{ state.playing = true; updatePlayIcons(); countPlay(TRACKS[state.current].id); })
      .catch(()=>toast('⚠ Не удалось воспроизвести'));
  } else {
    audio.pause();
    state.playing = false;
    updatePlayIcons();
  }
}

function nextTrack(){
  if (state.shuffle) {
    let n; do { n = Math.floor(Math.random() * TRACKS.length); } while (n === state.current && TRACKS.length > 1);
    playTrack(n);
    return;
  }
  if (state.queue.length) {
    state.queuePos = (state.queuePos + 1) % state.queue.length;
    if (state.queuePos === 0 && state.repeat !== 2) { audio.pause(); state.playing=false; updatePlayIcons(); return; }
    playTrack(state.queue[state.queuePos], state.queue);
    return;
  }
  let n = state.current + 1;
  if (n >= TRACKS.length) {
    if (state.repeat === 2) n = 0;
    else { audio.pause(); state.playing=false; updatePlayIcons(); return; }
  }
  playTrack(n);
}

function prevTrack(){
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  if (state.queue.length) {
    state.queuePos = (state.queuePos - 1 + state.queue.length) % state.queue.length;
    playTrack(state.queue[state.queuePos], state.queue);
    return;
  }
  let n = state.current - 1;
  if (n < 0) n = TRACKS.length - 1;
  playTrack(n);
}

function playRandom(){
  if (TRACKS.length < 2) { playTrack(0); return; }
  let n; do { n = Math.floor(Math.random() * TRACKS.length); } while (n === state.current);
  playTrack(n);
  toast('Гдеееее 🖤');
  vibrate([10,30,10]);
}

function playAllFromStart(){ playTrack(0, TRACKS.map((_,i)=>i)); toast('▶ Всё подряд'); }

function toggleShuffle(){
  state.shuffle = !state.shuffle;
  els.npShuffle.classList.toggle('active', state.shuffle);
  toast(state.shuffle ? '🔀 Перемешать' : '🔀 По порядку');
  vibrate(8);
}
function cycleRepeat(){
  state.repeat = (state.repeat + 1) % 3;
  els.npRepeat.classList.toggle('active', state.repeat !== 0);
  els.npRepeat.style.color = state.repeat === 1 ? 'var(--cyan)' : '';
  toast(['↩ Без повтора','🔂 Повтор трека','🔁 Повтор всех'][state.repeat]);
  vibrate(8);
}

/* ═══ ЛАЙКИ ═══ */
function toggleLike(id){
  const i = state.liked.indexOf(id);
  if (i === -1) state.liked.push(id); else state.liked.splice(i,1);
  localStorage.setItem('a5000_liked', JSON.stringify(state.liked));
  vibrate(10);
  document.querySelectorAll(`[data-like="${id}"]`).forEach(btn=>{
    const liked = state.liked.includes(id);
    btn.classList.toggle('liked', liked);
    const s = btn.querySelector('svg');
    if (s) s.setAttribute('fill', liked ? 'currentColor' : 'none');
  });
  updateLikeButton();
  if (document.querySelector('#screenLiked.active')) renderLiked();
}
function toggleLikeCurrent(){ const t = TRACKS[state.current]; if (t) toggleLike(t.id); }
function updateLikeButton(){
  const t = TRACKS[state.current]; if (!t) return;
  const liked = state.liked.includes(t.id);
  els.npLike.classList.toggle('active', liked);
  els.npLikeIcon.setAttribute('fill', liked ? 'currentColor' : 'none');
}

/* ═══ ОБНОВЛЕНИЕ UI ═══ */
function updateUIForTrack(t, animate){
  hydrateCover(els.mpCover, t, 96);
  els.mpTitle.textContent = t.title;
  els.mpFeat.textContent = t.feat ? 'feat. ' + t.feat : 'A5000 · ' + t.year;
  els.miniPlayer.classList.add('show');

  hydrateCover(els.npCover, t, 480);
  els.npTitle.textContent = t.title;
  els.npArtist.textContent = t.feat ? 'A5000 × ' + t.feat : 'A5000';
  els.npAlbum.textContent = t.year + ' · Single · A5000 Labs';
  els.npHeaderName.textContent = t.title;
  els.npTimeCurrent.textContent = '0:00';
  els.npTimeTotal.textContent = t.duration;
  els.npProgressFill.style.width = '0%';
  els.npProgressKnob.style.left = '0%';

  // Точки ключевых моментов
  els.npProgressDots.innerHTML = (t.keyMoments || []).map(p =>
    `<i style="left:${(p*100).toFixed(1)}%"></i>`
  ).join('');

  // BG градиент от цвета трека (фон задаётся через CSS, здесь только подстраховка)
  els.npBg.style.backgroundImage = '';

  updateLikeButton();
  els.npShuffle.classList.toggle('active', state.shuffle);
  els.npRepeat.classList.toggle('active', state.repeat !== 0);

  if (document.querySelector('#screenLibrary.active')) renderLibrary();
  if (document.querySelector('#screenHome.active')) renderHome();
  if (document.querySelector('#screenLiked.active')) renderLiked();
  if (els.queueSheet.classList.contains('open')) renderQueue();

  if (animate) {
    els.npCover.classList.remove('flip');
    void els.npCover.offsetWidth;
    els.npCover.classList.add('flip');
  }
}

function updatePlayIcons(){
  const playSvg = '<path d="M8 5v14l11-7z"/>';
  const pauseSvg = '<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>';
  els.mpPlayIcon.innerHTML = state.playing ? pauseSvg : playSvg;
  els.npPlayIcon.innerHTML = state.playing ? pauseSvg : playSvg;
}

/* ═══ NOW PLAYING ═══ */
function openNowPlaying(){ if (!audio.src) { toast('Сначала выбери трек'); return; } els.np.classList.add('open'); vibrate(8); }
function closeNowPlaying(){ els.np.classList.remove('open'); vibrate(6); }

(function initNPSwipe(){
  let startY=0, curY=0, dragging=false;
  els.np.addEventListener('touchstart', e=>{
    if (e.target.closest('.np-progress-bar') || e.target.closest('button')) return;
    startY = e.touches[0].clientY; dragging = true;
  }, { passive:true });
  els.np.addEventListener('touchmove', e=>{
    if (!dragging) return;
    curY = e.touches[0].clientY;
    const dy = curY - startY;
    if (dy > 0) els.np.style.transform = `translateY(${dy}px)`;
  }, { passive:true });
  els.np.addEventListener('touchend', ()=>{
    if (!dragging) return;
    dragging = false;
    const dy = curY - startY;
    els.np.style.transform = '';
    if (dy > 100) closeNowPlaying();
    startY = curY = 0;
  });
})();

/* ═══ PROGRESS ═══ */
audio.addEventListener('timeupdate', ()=>{
  if (!audio.duration || !isFinite(audio.duration)) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  els.npProgressFill.style.width = pct + '%';
  els.npProgressKnob.style.left = pct + '%';
  els.npTimeCurrent.textContent = formatTime(audio.currentTime);
  els.mpProgress.style.setProperty('--mp-progress', pct + '%');
});
audio.addEventListener('loadedmetadata', ()=>{ els.npTimeTotal.textContent = formatTime(audio.duration); });
audio.addEventListener('play', ()=>{ state.playing = true; updatePlayIcons(); });
audio.addEventListener('pause', ()=>{ state.playing = false; updatePlayIcons(); });
audio.addEventListener('ended', ()=>{
  if (state.repeat === 1) { audio.currentTime = 0; audio.play().catch(()=>{}); }
  else nextTrack();
});

(function initSeek(){
  const bar = els.npProgressBar;
  let dragging = false;
  const seek = clientX => {
    if (!audio.duration || !isFinite(audio.duration)) return;
    const r = bar.getBoundingClientRect();
    let x = (clientX - r.left) / r.width;
    x = Math.max(0, Math.min(1, x));
    audio.currentTime = x * audio.duration;
  };
  bar.addEventListener('pointerdown', e=>{
    dragging = true; bar.classList.add('dragging');
    try { bar.setPointerCapture(e.pointerId); } catch(err){}
    seek(e.clientX);
  });
  bar.addEventListener('pointermove', e=>{ if (dragging) seek(e.clientX); });
  bar.addEventListener('pointerup', e=>{
    dragging = false; bar.classList.remove('dragging');
    try { bar.releasePointerCapture(e.pointerId); } catch(err){}
  });
  bar.addEventListener('pointercancel', ()=>{ dragging = false; bar.classList.remove('dragging'); });
})();

/* ═══ ФИЛЬТРЫ / СОРТИРОВКА / VIEW ═══ */
els.filterRow.querySelectorAll('.chip').forEach(c=>{
  c.addEventListener('click', ()=>{
    els.filterRow.querySelectorAll('.chip').forEach(x=>x.classList.remove('active'));
    c.classList.add('active');
    state.filter = c.dataset.filter;
    renderLibrary();
    vibrate(6);
  });
});
function setView(v){
  state.view = v;
  document.querySelectorAll('.vt-btn').forEach(b=>b.classList.toggle('active', b.dataset.view === v));
  renderLibrary();
  vibrate(6);
}
function cycleSort(){
  state.sort = (state.sort + 1) % SORTS.length;
  renderLibrary();
  toast('↓ ' + SORTS[state.sort].label);
  vibrate(6);
}

/* ═══ SETTINGS ═══ */
$('toggleVibrate').addEventListener('click', ()=>{
  state.vibrate = !state.vibrate;
  localStorage.setItem('a5000_vibrate', state.vibrate ? 'on' : 'off');
  $('toggleVibrate').classList.toggle('on', state.vibrate);
  vibrate(10);
});
$('toggleWake').addEventListener('click', ()=>{
  state.wake = !state.wake;
  localStorage.setItem('a5000_wake', state.wake ? 'on' : 'off');
  $('toggleWake').classList.toggle('on', state.wake);
  vibrate(8);
  if (state.wake) requestWakeLock(); else releaseWakeLock();
});
function resetStats(){
  if (!confirm('Сбросить статистику прослушиваний?')) return;
  state.plays = {};
  localStorage.removeItem('a5000_plays');
  renderSettings();
  toast('Статистика сброшена');
}

/* ═══ WAKE LOCK ═══ */
let wakeLock = null;
async function requestWakeLock(){
  if (!('wakeLock' in navigator) || !state.wake) return;
  try { wakeLock = await navigator.wakeLock.request('screen'); } catch(e){}
}
function releaseWakeLock(){ if (wakeLock) { wakeLock.release().catch(()=>{}); wakeLock = null; } }
document.addEventListener('visibilitychange', ()=>{
  if (document.visibilityState === 'visible' && state.wake) requestWakeLock();
});

/* ═══ QUEUE BOTTOM SHEET ═══ */
function openQueue(){
  renderQueue();
  els.queueSheet.classList.add('open');
  vibrate(8);
}
function closeQueue(){ els.queueSheet.classList.remove('open'); }
function renderQueue(){
  if (!state.queue.length) {
    els.queueList.innerHTML = '<div class="empty"><div class="empty-icon">📭</div><div class="empty-title">Очередь пуста</div></div>';
    return;
  }
  const upcoming = state.queue.slice(state.queuePos + 1);
  const current = TRACKS[state.queue[state.queuePos]];
  const rest = upcoming.map(i => TRACKS[i]);
  if (current) rest.unshift(current);
  els.queueList.innerHTML = trackListHTML(rest);
  bindTrackClicks(els.queueList);
}

/* ═══ EQ BOTTOM SHEET ═══ */
function openEq(){
  renderEq();
  els.eqSheet.classList.add('open');
  vibrate(8);
}
function closeEq(){ els.eqSheet.classList.remove('open'); }
function renderEq(){
  els.eqPresets.innerHTML = EQ_PRESETS.map(p =>
    `<button class="eq-preset ${state.eq === p.id ? 'active' : ''}" data-eq="${p.id}">${p.name}</button>`
  ).join('');
  els.eqPresets.querySelectorAll('.eq-preset').forEach(b=>{
    b.addEventListener('click', ()=>{
      state.eq = b.dataset.eq;
      localStorage.setItem('a5000_eq', state.eq);
      renderEq();
      toast('🎚 ' + EQ_PRESETS.find(p=>p.id === state.eq).name);
      vibrate(6);
    });
  });
}

/* ═══ ИНИЦИАЛИЗАЦИЯ ═══ */
(async function init(){
  applyTheme();

  // Предзагружаем обложки, чтобы главная сразу их показала
  const coversPromise = preloadCovers();
  const timeout = new Promise(r => setTimeout(r, 2500));
  await Promise.race([coversPromise, timeout]);

  renderHome();
  initSearch();
  updatePlayIcons();
  els.npShuffle.classList.toggle('active', state.shuffle);
  els.npRepeat.classList.toggle('active', state.repeat !== 0);

  setTimeout(()=>{
    els.splash.classList.add('hide');
    els.app.classList.add('show');
    setTimeout(()=>{ if (els.splash.parentNode) els.splash.parentNode.removeChild(els.splash); }, 700);
  }, 1400);

  if (audio.src) els.miniPlayer.classList.add('show');
  requestWakeLock();
})();

window.addEventListener('keydown', e=>{
  if (e.target.tagName === 'INPUT') return;
  if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
  if (e.code === 'ArrowRight') nextTrack();
  if (e.code === 'ArrowLeft') prevTrack();
  if (e.code === 'Escape') { closeNowPlaying(); closeQueue(); closeEq(); }
});