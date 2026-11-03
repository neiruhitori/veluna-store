const backgroundMusic = new Audio("music/harvest-moon.mp3");
const musicControl = document.createElement("button");
const floatingControls = document.createElement("div");
const MUSIC_TIME_KEY = "veluna-music-time";
const MUSIC_PAUSED_KEY = "veluna-music-paused";
const backgroundMusicVolume = 0.18;

backgroundMusic.loop = true;
backgroundMusic.volume = backgroundMusicVolume;
backgroundMusic.preload = "auto";
backgroundMusic.setAttribute("aria-hidden", "true");
backgroundMusic.tabIndex = -1;
backgroundMusic.style.display = "none";
document.body.append(backgroundMusic);
floatingControls.className = "floating-controls";
floatingControls.setAttribute("aria-label", "Kontrol musik dan WhatsApp");
document.body.append(floatingControls);
musicControl.type = "button";
musicControl.className = "music-control";
musicControl.setAttribute("aria-label", "Putar musik latar");
musicControl.setAttribute("aria-pressed", "false");
musicControl.innerHTML = '<span class="music-control-icon" aria-hidden="true">♫</span><span class="music-control-label">Musik</span>';
floatingControls.append(musicControl);

const whatsappHeaderLink = document.querySelector(".header-actions .whatsapp-link");
let whatsappPlaceholder;

if (whatsappHeaderLink) {
  whatsappPlaceholder = document.createComment("WhatsApp header button position");
  whatsappHeaderLink.before(whatsappPlaceholder);
}

const updateFloatingWhatsapp = () => {
  if (!whatsappHeaderLink || !whatsappPlaceholder) return;

  if (window.scrollY > 120 && whatsappHeaderLink.parentElement !== floatingControls) {
    floatingControls.insertBefore(whatsappHeaderLink, musicControl);
    whatsappHeaderLink.classList.add("is-floating");
  } else if (window.scrollY <= 120 && whatsappHeaderLink.parentElement === floatingControls) {
    whatsappPlaceholder.replaceWith(whatsappHeaderLink);
    whatsappPlaceholder = document.createComment("WhatsApp header button position");
    whatsappHeaderLink.before(whatsappPlaceholder);
    whatsappHeaderLink.classList.remove("is-floating");
  }
};

window.addEventListener("scroll", updateFloatingWhatsapp, { passive: true });
updateFloatingWhatsapp();

let musicWasPaused = sessionStorage.getItem(MUSIC_PAUSED_KEY) === "true";
let musicStarted = false;

const updateMusicControl = (isPlaying) => {
  musicControl.classList.toggle("is-playing", isPlaying);
  musicControl.setAttribute("aria-pressed", String(isPlaying));
  musicControl.setAttribute(
    "aria-label",
    isPlaying ? "Jeda musik latar" : "Putar musik latar",
  );
  musicControl.title = isPlaying ? "Jeda musik latar" : "Putar musik latar";
};

const startBackgroundMusic = () => {
  if (musicStarted || musicWasPaused) return;

  const savedTime = Number(sessionStorage.getItem(MUSIC_TIME_KEY));
  if (Number.isFinite(savedTime) && savedTime > 0) {
    const restorePosition = () => {
      if (backgroundMusic.duration && Number.isFinite(backgroundMusic.duration)) {
        backgroundMusic.currentTime = savedTime % backgroundMusic.duration;
      }
    };

    if (backgroundMusic.readyState >= HTMLMediaElement.HAVE_METADATA) {
      restorePosition();
    } else {
      backgroundMusic.addEventListener("loadedmetadata", restorePosition, { once: true });
    }
  }

  backgroundMusic.play().then(() => {
    musicStarted = true;
    musicWasPaused = false;
    sessionStorage.setItem(MUSIC_PAUSED_KEY, "false");
    updateMusicControl(true);
  }).catch((error) => {
    if (error.name === "NotAllowedError") {
      updateMusicControl(false);
      return;
    }

    musicControl.setAttribute("aria-label", "Musik latar gagal dimuat");
    musicControl.title = "Musik latar gagal dimuat";
    console.error("Musik latar Veluna gagal diputar.", error);
  });
};

const resumeOnFirstInteraction = () => {
  if (musicWasPaused) return;
  startBackgroundMusic();
  if (!backgroundMusic.paused) {
    document.removeEventListener("pointerdown", resumeOnFirstInteraction);
    document.removeEventListener("keydown", resumeOnFirstInteraction);
  }
};

backgroundMusic.addEventListener("play", () => updateMusicControl(true));
backgroundMusic.addEventListener("pause", () => updateMusicControl(false));
backgroundMusic.addEventListener("timeupdate", () => {
  if (!backgroundMusic.paused && Number.isFinite(backgroundMusic.currentTime)) {
    sessionStorage.setItem(MUSIC_TIME_KEY, String(backgroundMusic.currentTime));
  }
});

musicControl.addEventListener("click", () => {
  if (backgroundMusic.paused) {
    musicWasPaused = false;
    sessionStorage.setItem(MUSIC_PAUSED_KEY, "false");
    backgroundMusic.play().then(() => {
      musicStarted = true;
      updateMusicControl(true);
    }).catch((error) => {
      if (error.name === "NotAllowedError") {
        updateMusicControl(false);
        return;
      }

      musicControl.setAttribute("aria-label", "Musik latar gagal dimuat");
      musicControl.title = "Musik latar gagal dimuat";
      console.error("Musik latar Veluna gagal diputar.", error);
    });
  } else {
    musicWasPaused = true;
    sessionStorage.setItem(MUSIC_PAUSED_KEY, "true");
    sessionStorage.setItem(MUSIC_TIME_KEY, String(backgroundMusic.currentTime));
    backgroundMusic.pause();
  }
});

window.addEventListener("pagehide", () => {
  if (Number.isFinite(backgroundMusic.currentTime)) {
    sessionStorage.setItem(MUSIC_TIME_KEY, String(backgroundMusic.currentTime));
  }
});

document.addEventListener("pointerdown", resumeOnFirstInteraction, { once: true });
document.addEventListener("keydown", resumeOnFirstInteraction, { once: true });
startBackgroundMusic();
