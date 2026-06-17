const navLinks = [...document.querySelectorAll(".nav-links a")];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
const toast = document.querySelector("#toast");
const copyButtons = document.querySelectorAll("[data-copy]");
const carousels = document.querySelectorAll("[data-carousel]");
const lightbox = document.querySelector("#imageLightbox");
const lightboxImage = document.querySelector("#lightboxImage");
const lightboxCaption = document.querySelector("#lightboxCaption");
const lightboxClose = document.querySelector("[data-lightbox-close]");
const lightboxPrevious = document.querySelector("[data-lightbox-prev]");
const lightboxNext = document.querySelector("[data-lightbox-next]");
let activeLightbox = null;
let lastLightboxTrigger = null;

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
);

sections.forEach((section) => observer.observe(section));

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1800);
}

copyButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const value = button.dataset.copy || "";
    try {
      await navigator.clipboard.writeText(value);
      showToast("\u5df2\u590d\u5236\u8054\u7cfb\u65b9\u5f0f");
    } catch {
      showToast("\u590d\u5236\u5931\u8d25\uff0c\u8bf7\u624b\u52a8\u9009\u62e9");
    }
  });
});

carousels.forEach((carousel) => {
  const slides = [...carousel.querySelectorAll(".showcase-slide")];
  const dots = [...carousel.querySelectorAll("[data-carousel-dot]")];
  const count = carousel.querySelector("[data-carousel-count]");
  const previous = carousel.querySelector("[data-carousel-prev]");
  const next = carousel.querySelector("[data-carousel-next]");
  let current = 0;

  function syncLightboxImage() {
    if (!lightboxImage || !lightboxCaption) return;
    const slide = slides[current];
    const image = slide.querySelector("img");
    const caption = slide.querySelector("figcaption")?.textContent || image.alt;
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = caption;
  }

  function showSlide(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === current);
    });
    if (count) count.textContent = `${current + 1} / ${slides.length}`;
    if (activeLightbox?.carousel === carousel) syncLightboxImage();
  }

  function openLightbox(index, trigger) {
    if (!lightbox) return;
    activeLightbox = { carousel, getCurrent: () => current, showSlide };
    lastLightboxTrigger = trigger;
    showSlide(index);
    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");
    lightboxClose?.focus();
  }

  previous?.addEventListener("click", () => showSlide(current - 1));
  next?.addEventListener("click", () => showSlide(current + 1));
  dots.forEach((dot, index) => dot.addEventListener("click", () => showSlide(index)));
  slides.forEach((slide, index) => {
    const trigger = slide.querySelector("[data-lightbox-open]");
    trigger?.addEventListener("click", () => openLightbox(index, trigger));
  });
  showSlide(0);
});

function closeLightbox() {
  if (!lightbox) return;
  lightbox.hidden = true;
  document.body.classList.remove("lightbox-open");
  activeLightbox = null;
  lastLightboxTrigger?.focus();
  lastLightboxTrigger = null;
}

lightboxClose?.addEventListener("click", closeLightbox);
lightboxPrevious?.addEventListener("click", () => {
  if (!activeLightbox) return;
  activeLightbox.showSlide(activeLightbox.getCurrent() - 1);
});
lightboxNext?.addEventListener("click", () => {
  if (!activeLightbox) return;
  activeLightbox.showSlide(activeLightbox.getCurrent() + 1);
});
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox && !lightbox.hidden) closeLightbox();
});
