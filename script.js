/* ═══════════════════════════════════════════════════════
   A5000 PLAYER · SCRIPT · Этап 1
   ═══════════════════════════════════════════════════════ */

/* ── Библиотека треков ── */
const TRACKS = [
  {
    id: "01",
    file: "01-vernulsya.mp3",
    cover: "01-vernulsya.webp",
    title: "Вернулся — забери своё",
    feat: "",
    year: 2026,
    duration: "3:16",
  },
  {
    id: "02",
    file: "02-moy-vtoroy.mp3",
    cover: "02-moy-vtoroy.webp",
    title: "Мой второй",
    feat: "",
    year: 2026,
    duration: "3:02",
  },
  {
    id: "03",
    file: "03-villa.mp3",
    cover: "03-villa.webp",
    title: "Вилла",
    feat: "Блогерский Бит",
    year: 2026,
    duration: "2:31",
  },
  {
    id: "04",
    file: "04-rozovoe-vino-3.mp3",
    cover: "04-rozovoe-vino-3.webp",
    title: "Розовое вино 3",
    feat: "Блогерский Бит",
    year: 2026,
    duration: "4:06",
  },
  {
    id: "05",
    file: "05-krest.mp3",
    cover: "05-krest.webp",
    title: "Крест",
    feat: "",
    year: 2026,
    duration: "3:20",
  },
  {
    id: "06",
    file: "06-gta.mp3",
    cover: "06-gta.webp",
    title: "GTA / Новый этап 1",
    feat: "",
    year: 2026,
    duration: "3:16",
  },
  {
    id: "07",
    file: "07-i-ya-tak-zhivu.mp3",
    cover: "07-i-ya-tak-zhivu.webp",
    title: "И я так живу",
    feat: "",
    year: 2026,
    duration: "3:16",
  },
  {
    id: "08",
    file: "08-silence.mp3",
    cover: "08-silence.webp",
    title: "Тишина (Silence)",
    feat: "",
    year: 2026,
    duration: "3:00",
  },
];

/* ── Состояние плеера ── */
const state = {
  currentIndex: 0,
  isPlaying: false,
  shuffle: false,
  repeat: false /* false | 'one' | 'all' */,
  coverExists:
    {} /* кэш: { id: true | false } — чтобы не дёргать 404 каждый раз */,
};

/* ── DOM ── */
const audio = document.getElementById("audio");
const els = {
  splash: document.getElementById("splash"),
  app: document.getElementById("app"),
  coverWrap: document.getElementById("coverWrap"),
  npTitle: document.getElementById("npTitle"),
  npFeat: document.getElementById("npFeat"),
  progressBar: document.getElementById("progressBar"),
  progressFill: document.getElementById("progressFill"),
  timeCurrent: document.getElementById("timeCurrent"),
  timeTotal: document.getElementById("timeTotal"),
  playBtn: document.getElementById("playBtn"),
  prevBtn: document.getElementById("prevBtn"),
  nextBtn: document.getElementById("nextBtn"),
  shuffleBtn: document.getElementById("shuffleBtn"),
  repeatBtn: document.getElementById("repeatBtn"),
  gdeBtn: document.getElementById("gdeBtn"),
  unreleasedBtn: document.getElementById("unreleasedBtn"),
  trackList: document.getElementById("trackList"),
  libCount: document.getElementById("libCount"),
  toast: document.getElementById("toast"),
};

/* ═══════════════════════════════════════════════════════
   SVG-плейсхолдер обложки
   ═══════════════════════════════════════════════════════ */
function escapeXml(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}

function makeCoverSVG(track, size) {
  const s = size || 320;
  const gid = "g_" + track.id;
  const isFeat = !!track.feat;
  const a1 = isFeat ? "#00ffff" : "#ff1493";
  const a2 = isFeat ? "#ff1493" : "#00ffff";

  /* Разбиваем название на две строки по 14 символов */
  const words = track.title.split(" ");
  let line1 = "",
    line2 = "",
    cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > 14 && line2 === "") {
      line1 = cur.trim();
      cur = w;
    } else {
      cur = (cur + " " + w).trim();
    }
  }
  line2 = cur.trim();

  const title1 = escapeXml(line1);
  const title2 = escapeXml(line2);
  const featTxt = track.feat ? escapeXml(track.feat) : "";
  const fs1 = s * 0.06;
  const fs2 = s * 0.038;
  const fsLogo = s * 0.19;
  const fsSub = s * 0.036;
  const fsSmall = s * 0.034;

  return (
    '<svg viewBox="0 0 ' +
    s +
    " " +
    s +
    '" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">' +
    "<defs>" +
    '<linearGradient id="' +
    gid +
    '" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0%" stop-color="' +
    a1 +
    '" stop-opacity="0.16"/>' +
    '<stop offset="100%" stop-color="' +
    a2 +
    '" stop-opacity="0.06"/>' +
    "</linearGradient>" +
    '<radialGradient id="' +
    gid +
    '_r" cx="50%" cy="30%" r="75%">' +
    '<stop offset="0%" stop-color="' +
    a1 +
    '" stop-opacity="0.32"/>' +
    '<stop offset="100%" stop-color="#000" stop-opacity="0"/>' +
    "</radialGradient>" +
    "</defs>" +
    '<rect width="' +
    s +
    '" height="' +
    s +
    '" fill="#000"/>' +
    '<rect width="' +
    s +
    '" height="' +
    s +
    '" fill="url(#' +
    gid +
    '_r)"/>' +
    '<rect width="' +
    s +
    '" height="' +
    s +
    '" fill="url(#' +
    gid +
    ')"/>' +
    /* Логотип */
    '<text x="' +
    s / 2 +
    '" y="' +
    s * 0.4 +
    '" text-anchor="middle" ' +
    'font-family="Bebas Neue, Impact, sans-serif" ' +
    'font-size="' +
    fsLogo +
    '" letter-spacing="' +
    s * 0.02 +
    '" ' +
    'fill="#ffffff" font-weight="900">A5000</text>' +
    /* Название (2 строки) */
    '<text x="' +
    s / 2 +
    '" y="' +
    s * 0.56 +
    '" text-anchor="middle" ' +
    'font-family="Inter, sans-serif" ' +
    'font-size="' +
    fs1 +
    '" letter-spacing="0.5" ' +
    'fill="' +
    a1 +
    '" font-weight="900">' +
    title1 +
    "</text>" +
    (title2
      ? '<text x="' +
        s / 2 +
        '" y="' +
        s * 0.635 +
        '" text-anchor="middle" ' +
        'font-family="Inter, sans-serif" ' +
        'font-size="' +
        fs1 +
        '" letter-spacing="0.5" ' +
        'fill="' +
        a1 +
        '" font-weight="900">' +
        title2 +
        "</text>"
      : "") +
    /* Фит */
    (featTxt
      ? '<text x="' +
        s / 2 +
        '" y="' +
        s * 0.72 +
        '" text-anchor="middle" ' +
        'font-family="Inter, sans-serif" ' +
        'font-size="' +
        fs2 +
        '" letter-spacing="0.6" ' +
        'fill="#00ffff" font-weight="700">feat. ' +
        featTxt +
        "</text>"
      : "") +
    /* Нижняя подпись */
    '<text x="' +
    s / 2 +
    '" y="' +
    s * 0.93 +
    '" text-anchor="middle" ' +
    'font-family="Bebas Neue, Impact, sans-serif" ' +
    'font-size="' +
    fsSmall +
    '" letter-spacing="' +
    s * 0.012 +
    '" ' +
    'fill="rgba(255,255,255,0.30)">NULL NULL NULL MUSIC</text>' +
    "</svg>"
  );
}

/* ═══════════════════════════════════════════════════════
   Подгрузка реальных обложек из ./covers/
   Если файла нет — оставляем SVG-плейсхолдер
   ═══════════════════════════════════════════════════════ */
function hydrateCover(container, track, svgSize) {
  if (!container) return;
  /* Уже знаем что файла нет — сразу SVG */
  if (state.coverExists[track.id] === false) {
    container.innerHTML = makeCoverSVG(track, svgSize);
    return;
  }
  /* Уже знаем что файл есть — сразу img */
  if (state.coverExists[track.id] === true) {
    const img = document.createElement("img");
    img.src = "./covers/" + track.cover;
    img.alt = track.title;
    container.innerHTML = "";
    container.appendChild(img);
    return;
  }
  /* Первый раз — пробуем загрузить */
  const img = new Image();
  img.onload = () => {
    state.coverExists[track.id] = true;
    container.innerHTML = "";
    container.appendChild(img);
  };
  img.onerror = () => {
    state.coverExists[track.id] = false;
    container.innerHTML = makeCoverSVG(track, svgSize);
  };
  img.src = "./covers/" + track.cover;
}

/* ═══════════════════════════════════════════════════════
   SPLASH → APP
   ═══════════════════════════════════════════════════════ */
setTimeout(() => {
  if (els.splash) els.splash.classList.add("hide");
  if (els.app) els.app.classList.add("show");
  setTimeout(() => {
    if (els.splash && els.splash.parentNode) {
      els.splash.parentNode.removeChild(els.splash);
    }
  }, 700);
}, 1800);

/* ═══════════════════════════════════════════════════════
   Библиотека
   ═══════════════════════════════════════════════════════ */
function renderLibrary() {
  if (!els.trackList) return;
  els.libCount.textContent = TRACKS.length + " треков";

  els.trackList.innerHTML = TRACKS.map(
    (t, i) =>
      '<div class="track-item" data-idx="' +
      i +
      '">' +
      '<div class="track-num">' +
      String(i + 1).padStart(2, "0") +
      "</div>" +
      '<div class="track-cover-mini" data-cover-id="' +
      t.id +
      '"></div>' +
      '<div class="track-meta">' +
      '<div class="track-name">' +
      t.title +
      "</div>" +
      '<div class="track-feat ' +
      (t.feat ? "feat-cyan" : "") +
      '">' +
      (t.feat ? "feat. " + t.feat : "A5000 · " + t.year) +
      "</div>" +
      "</div>" +
      '<div class="track-dur">' +
      t.duration +
      "</div>" +
      "</div>",
  ).join("");

  /* Подгружаем обложки в мини-слоты */
  TRACKS.forEach((t, i) => {
    const slot = els.trackList.querySelector('[data-cover-id="' + t.id + '"]');
    if (slot) hydrateCover(slot, t, 96);
  });

  /* Обработчик клика */
  els.trackList.querySelectorAll(".track-item").forEach((el) => {
    el.addEventListener("click", () => {
      const idx = parseInt(el.dataset.idx, 10);
      playTrack(idx);
    });
  });
}

/* ═══════════════════════════════════════════════════════
   Now Playing
   ═══════════════════════════════════════════════════════ */
function renderNowPlaying() {
  const t = TRACKS[state.currentIndex];
  if (!t) return;

  if (els.coverWrap) {
    hydrateCover(els.coverWrap, t, 320);
  }
  if (els.npTitle) els.npTitle.textContent = t.title;
  if (els.npFeat) {
    els.npFeat.textContent = t.feat ? "feat. " + t.feat : "A5000 · " + t.year;
  }

  /* Подсветка в списке */
  if (els.trackList) {
    els.trackList.querySelectorAll(".track-item").forEach((el, i) => {
      el.classList.toggle("playing", i === state.currentIndex);
    });
  }
}

/* ═══════════════════════════════════════════════════════
   Воспроизведение
   ═══════════════════════════════════════════════════════ */
function playTrack(idx) {
  state.currentIndex = idx;
  const t = TRACKS[idx];
  if (!t) return;

  audio.src = "./tracks/" + t.file;
  try {
    audio.load();
  } catch (e) {}

  renderNowPlaying();

  const p = audio.play();
  if (p && typeof p.then === "function") {
    p.then(() => {
      state.isPlaying = true;
      updatePlayBtn();
    }).catch((err) => {
      state.isPlaying = false;
      updatePlayBtn();
      /* Файла ещё нет в /tracks/ или формат не поддержан — дружелюбный тост */
      if (
        err &&
        (err.name === "NotSupportedError" || err.name === "NotAllowedError")
      ) {
        toast("⚠️ Трек ещё не загружен: /tracks/" + t.file);
      } else {
        toast("⚠️ Не удалось воспроизвести: " + t.file);
      }
    });
  }
}

function togglePlay() {
  if (!audio.src) {
    playTrack(state.currentIndex);
    return;
  }
  if (audio.paused) {
    const p = audio.play();
    if (p && typeof p.then === "function") {
      p.then(() => {
        state.isPlaying = true;
        updatePlayBtn();
      }).catch(() => toast("⚠️ Не удалось воспроизвести"));
    }
  } else {
    audio.pause();
    state.isPlaying = false;
    updatePlayBtn();
  }
}

function updatePlayBtn() {
  if (els.playBtn) els.playBtn.textContent = state.isPlaying ? "❚❚" : "▶";
}

function nextTrack() {
  if (state.shuffle) {
    if (TRACKS.length < 2) {
      playTrack(0);
      return;
    }
    let n;
    do {
      n = Math.floor(Math.random() * TRACKS.length);
    } while (n === state.currentIndex);
    playTrack(n);
    return;
  }
  let next = state.currentIndex + 1;
  if (next >= TRACKS.length) {
    if (state.repeat === "all") next = 0;
    else {
      audio.pause();
      state.isPlaying = false;
      updatePlayBtn();
      return;
    }
  }
  playTrack(next);
}

function prevTrack() {
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  let prev = state.currentIndex - 1;
  if (prev < 0) prev = TRACKS.length - 1;
  playTrack(prev);
}

/* ═══════════════════════════════════════════════════════
   Аудио-события
   ═══════════════════════════════════════════════════════ */
audio.addEventListener("timeupdate", () => {
  if (!audio.duration || !isFinite(audio.duration)) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  if (els.progressFill) els.progressFill.style.width = pct + "%";
  if (els.timeCurrent)
    els.timeCurrent.textContent = formatTime(audio.currentTime);
});

audio.addEventListener("loadedmetadata", () => {
  if (els.timeTotal) els.timeTotal.textContent = formatTime(audio.duration);
});

audio.addEventListener("ended", () => {
  if (state.repeat === "one") {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } else {
    nextTrack();
  }
});

audio.addEventListener("play", () => {
  state.isPlaying = true;
  updatePlayBtn();
});
audio.addEventListener("pause", () => {
  state.isPlaying = false;
  updatePlayBtn();
});

function formatTime(s) {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return m + ":" + String(sec).padStart(2, "0");
}

/* ═══════════════════════════════════════════════════════
   Прогресс-бар — перетаскивание
   ═══════════════════════════════════════════════════════ */
(function bindSeek() {
  if (!els.progressBar) return;
  let dragging = false;

  const seekTo = (clientX) => {
    if (!audio.duration || !isFinite(audio.duration)) return;
    const rect = els.progressBar.getBoundingClientRect();
    let x = (clientX - rect.left) / rect.width;
    x = Math.max(0, Math.min(1, x));
    audio.currentTime = x * audio.duration;
  };

  els.progressBar.addEventListener("click", (e) => seekTo(e.clientX));
  els.progressBar.addEventListener("pointerdown", (e) => {
    dragging = true;
    try {
      els.progressBar.setPointerCapture(e.pointerId);
    } catch (err) {}
    seekTo(e.clientX);
  });
  els.progressBar.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    seekTo(e.clientX);
  });
  els.progressBar.addEventListener("pointerup", (e) => {
    dragging = false;
    try {
      els.progressBar.releasePointerCapture(e.pointerId);
    } catch (err) {}
  });
  els.progressBar.addEventListener("pointercancel", () => {
    dragging = false;
  });
})();

/* ═══════════════════════════════════════════════════════
   Кнопки
   ═══════════════════════════════════════════════════════ */
els.playBtn.addEventListener("click", togglePlay);
els.nextBtn.addEventListener("click", nextTrack);
els.prevBtn.addEventListener("click", prevTrack);

els.shuffleBtn.addEventListener("click", () => {
  state.shuffle = !state.shuffle;
  els.shuffleBtn.classList.toggle("active", state.shuffle);
  toast(state.shuffle ? "🔀 Перемешать" : "🔀 По порядку");
  if (navigator.vibrate) navigator.vibrate(8);
});

els.repeatBtn.addEventListener("click", () => {
  if (state.repeat === false) state.repeat = "one";
  else if (state.repeat === "one") state.repeat = "all";
  else state.repeat = false;

  els.repeatBtn.classList.toggle("active", state.repeat !== false);
  els.repeatBtn.textContent = state.repeat === "one" ? "🔂" : "🔁";

  toast(
    state.repeat === "one"
      ? "🔂 Повтор трека"
      : state.repeat === "all"
        ? "🔁 Повтор всех"
        : "↩ Без повтора",
  );
  if (navigator.vibrate) navigator.vibrate(8);
});

els.gdeBtn.addEventListener("click", () => {
  if (TRACKS.length < 2) {
    playTrack(0);
    return;
  }
  let n;
  do {
    n = Math.floor(Math.random() * TRACKS.length);
  } while (n === state.currentIndex);
  playTrack(n);
  toast("Гдееееее 🖤");
  if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
});

els.unreleasedBtn.addEventListener("click", () => {
  toast("🔒 Доступ только для A5000. Скоро здесь появятся демо.");
  if (navigator.vibrate) navigator.vibrate([15, 30, 15]);
});

/* ═══════════════════════════════════════════════════════
   Toast
   ═══════════════════════════════════════════════════════ */
let toastTimer = null;
function toast(msg) {
  if (!els.toast) return;
  els.toast.textContent = msg;
  els.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.remove("show"), 2400);
}

/* ═══════════════════════════════════════════════════════
   Старт
   ═══════════════════════════════════════════════════════ */
renderLibrary();
renderNowPlaying();
updatePlayBtn();
