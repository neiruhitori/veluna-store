const carousel = document.querySelector("[data-carousel]");

if (carousel) {
  const track = carousel.querySelector("[data-carousel-track]");
  const slides = Array.from(track.children);
  const dots = Array.from(carousel.querySelectorAll("[data-carousel-dot]"));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeIndex = 0;
  let timer;

  const showSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${activeIndex * 100}%)`;

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
      slide.inert = !isActive;
    });

    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === activeIndex;
      dot.classList.toggle("selected", isActive);
      if (isActive) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });
  };

  const stopAutoplay = () => {
    window.clearInterval(timer);
    timer = undefined;
  };

  const startAutoplay = () => {
    stopAutoplay();
    if (
      !reducedMotion.matches &&
      !document.hidden &&
      !carousel.matches(":hover") &&
      !carousel.contains(document.activeElement)
    ) {
      timer = window.setInterval(() => showSlide(activeIndex + 1), 5000);
    }
  };

  carousel.querySelector("[data-carousel-previous]").addEventListener("click", () => {
    showSlide(activeIndex - 1);
    startAutoplay();
  });
  carousel.querySelector("[data-carousel-next]").addEventListener("click", () => {
    showSlide(activeIndex + 1);
    startAutoplay();
  });
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showSlide(index);
      startAutoplay();
    });
  });

  carousel.addEventListener("mouseenter", stopAutoplay);
  carousel.addEventListener("mouseleave", startAutoplay);
  carousel.addEventListener("focusin", stopAutoplay);
  carousel.addEventListener("focusout", (event) => {
    if (!carousel.contains(event.relatedTarget)) startAutoplay();
  });
  document.addEventListener("visibilitychange", startAutoplay);
  reducedMotion.addEventListener("change", startAutoplay);

  showSlide(activeIndex);
  startAutoplay();
}

const productTabs = Array.from(document.querySelectorAll("[data-product-tab]"));
const productPanels = Array.from(document.querySelectorAll("[data-product-panel]"));

const activateProductTab = (selectedTab, moveFocus = false) => {
  productTabs.forEach((tab) => {
    const isSelected = tab === selectedTab;
    tab.classList.toggle("active", isSelected);
    tab.setAttribute("aria-selected", String(isSelected));
    tab.tabIndex = isSelected ? 0 : -1;
  });

  productPanels.forEach((panel) => {
    const isSelected = panel.dataset.productPanel === selectedTab.dataset.productTab;
    panel.hidden = !isSelected;
    panel.setAttribute("aria-hidden", String(!isSelected));
  });

  if (moveFocus) selectedTab.focus();
};

productTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateProductTab(tab));
  tab.addEventListener("keydown", (event) => {
    let nextIndex;

    if (event.key === "ArrowRight") nextIndex = (index + 1) % productTabs.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + productTabs.length) % productTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = productTabs.length - 1;

    if (nextIndex !== undefined) {
      event.preventDefault();
      activateProductTab(productTabs[nextIndex], true);
    }
  });
});

const robloxMethodDialog = document.querySelector("[data-roblox-method-dialog]");
const robloxMethodTriggers = document.querySelectorAll("[data-roblox-methods]");

if (robloxMethodDialog) {
  const closeButton = robloxMethodDialog.querySelector("[data-method-dialog-close]");

  robloxMethodTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      robloxMethodDialog.showModal();
    });
  });

  closeButton.addEventListener("click", () => robloxMethodDialog.close());
  robloxMethodDialog.addEventListener("click", (event) => {
    if (event.target === robloxMethodDialog) robloxMethodDialog.close();
  });
}
