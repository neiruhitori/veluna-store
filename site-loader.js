const siteLoader = document.querySelector("[data-site-loader]");

if (siteLoader) {
  const loaderIcon = siteLoader.querySelector("[data-site-loader-icon]");
  const loaderImages = [
    "image/atutu.gif",
    "image/kiss.gif",
    "image/yattra.gif",
  ];
  const selectedImage = loaderImages[Math.floor(Math.random() * loaderImages.length)];

  loaderIcon.src = selectedImage;
  loaderIcon.alt = "";

  const hideLoader = () => {
    window.setTimeout(() => {
      siteLoader.classList.add("is-hidden");
      siteLoader.setAttribute("aria-hidden", "true");
    }, 350);
  };

  if (document.readyState === "complete") {
    hideLoader();
  } else {
    window.addEventListener("load", hideLoader, { once: true });
  }
}

const floatingDecorations = document.createElement("div");
floatingDecorations.className = "floating-stickers";
floatingDecorations.setAttribute("aria-label", "Stiker Veluna interaktif");
document.body.append(floatingDecorations);

const floatingStickerSources = [
  { src: "image/atutu.gif", label: "Stiker Atutu" },
  { src: "image/kiss.gif", label: "Stiker Kiss" },
  { src: "image/yattra.gif", label: "Stiker Yatta" },
];
const reducedStickerMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const floatingStickers = floatingStickerSources.map((sticker, index) => {
  const button = document.createElement("button");
  const image = document.createElement("img");
  const size = window.matchMedia("(max-width: 600px)").matches ? 54 : 72;
  const angle = Math.random() * Math.PI * 2;
  const speed = 65 + Math.random() * 65;
  const position = {
    x: Math.random() * Math.max(0, window.innerWidth - size),
    y: Math.random() * Math.max(0, window.innerHeight - size),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    size,
    respawnTimer: 0,
  };

  button.type = "button";
  button.className = "floating-sticker";
  button.setAttribute("aria-label", `${sticker.label}. Klik untuk menyembunyikan sementara.`);
  button.dataset.stickerIndex = String(index);
  image.src = sticker.src;
  image.alt = "";
  button.append(image);
  floatingDecorations.append(button);

  button.addEventListener("click", () => {
    if (button.classList.contains("is-fading")) return;
    button.classList.add("is-fading");
    position.respawnTimer = window.setTimeout(() => {
      position.x = Math.random() * Math.max(0, window.innerWidth - position.size);
      position.y = Math.random() * Math.max(0, window.innerHeight - position.size);
      const nextAngle = Math.random() * Math.PI * 2;
      position.vx = Math.cos(nextAngle) * speed;
      position.vy = Math.sin(nextAngle) * speed;
      button.style.transform = "translate3d(0, 0, 0)";
      button.style.left = `${position.x}px`;
      button.style.top = `${position.y}px`;
      button.classList.remove("is-fading");
    }, 2500);
  });

  button.style.left = `${position.x}px`;
  button.style.top = `${position.y}px`;
  return { button, position };
});

let previousFrameTime = 0;
const moveFloatingStickers = (time) => {
  if (!document.hidden && !reducedStickerMotion.matches) {
    const elapsed = previousFrameTime ? Math.min((time - previousFrameTime) / 1000, 0.04) : 0;
    floatingStickers.forEach(({ button, position }) => {
      if (!button.classList.contains("is-fading") && elapsed) {
        position.x += position.vx * elapsed;
        position.y += position.vy * elapsed;

        const maxX = Math.max(0, window.innerWidth - position.size);
        const maxY = Math.max(0, window.innerHeight - position.size);
        if (position.x <= 0 || position.x >= maxX) {
          position.x = Math.max(0, Math.min(position.x, maxX));
          position.vx *= -1;
        }
        if (position.y <= 0 || position.y >= maxY) {
          position.y = Math.max(0, Math.min(position.y, maxY));
          position.vy *= -1;
        }

        button.style.left = `${position.x}px`;
        button.style.top = `${position.y}px`;
      }
    });
  }

  previousFrameTime = time;
  window.requestAnimationFrame(moveFloatingStickers);
};

window.addEventListener("resize", () => {
  floatingStickers.forEach(({ position }) => {
    position.size = window.matchMedia("(max-width: 600px)").matches ? 54 : 72;
    position.x = Math.min(position.x, Math.max(0, window.innerWidth - position.size));
    position.y = Math.min(position.y, Math.max(0, window.innerHeight - position.size));
  });
});
window.requestAnimationFrame(moveFloatingStickers);
