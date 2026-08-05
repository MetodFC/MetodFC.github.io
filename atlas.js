const atlasHeader = document.querySelector("[data-atlas-header]");

function updateAtlasHeader() {
  atlasHeader?.classList.toggle("is-scrolled", window.scrollY > 12);
}

window.addEventListener("scroll", updateAtlasHeader, {
  passive: true,
});

updateAtlasHeader();

/* =========================================
   ATLAS CAROUSEL
========================================= */

const atlasSlider = document.querySelector("[data-atlas-slider]");

if (atlasSlider) {
  const viewport = atlasSlider.querySelector("[data-atlas-viewport]");
  const track = atlasSlider.querySelector("[data-atlas-track]");

  const previousButton = atlasSlider.querySelector("[data-atlas-prev]");
  const nextButton = atlasSlider.querySelector("[data-atlas-next]");

  const pagination = document.querySelector("[data-atlas-pagination]");
  const currentElement = document.querySelector("[data-atlas-current]");
  const totalElement = document.querySelector("[data-atlas-total]");

  const imageCount = 36;

  let currentPage = 0;
  let paginationButtons = [];

  let touchStartX = 0;
  let touchStartY = 0;
  let touchCurrentX = 0;
  let touchCurrentY = 0;
  let isTouching = false;

  function formatNumber(number) {
    return String(number).padStart(2, "0");
  }

  function isMobile() {
    return window.innerWidth <= 760;
  }

  function getVisibleSlides() {
    if (window.innerWidth <= 760) {
      return 1;
    }

    if (window.innerWidth <= 1180) {
      return 3;
    }

    return 5;
  }

  function getPageCount() {
    if (isMobile()) {
      return imageCount;
    }

    return Math.ceil(imageCount / getVisibleSlides());
  }

  function normalizePage(page) {
    const pageCount = getPageCount();

    if (!pageCount) {
      return 0;
    }

    return (page + pageCount) % pageCount;
  }

  /* =========================================
     CREATE 36 CARDS
  ========================================= */

  function createCards() {
    if (!track) {
      return;
    }

    track.innerHTML = "";

    const fragment = document.createDocumentFragment();

    for (let index = 1; index <= imageCount; index += 1) {
      const article = document.createElement("article");

      article.className = "atlas-card";
      article.dataset.atlasCard = "";
      article.dataset.imageIndex = String(index - 1);

      article.innerHTML = `
        <button
          class="atlas-card__button"
          type="button"
          data-atlas-open="${index - 1}"
          aria-label="Відкрити коліркод ${index} на весь екран"
        >
          <img
            class="atlas-card__image"
            src="img/atlas/${index}.jpg"
            alt="Коліркод ${index}"
            loading="${index <= 5 ? "eager" : "lazy"}"
            decoding="async"
          />

          <span
            class="atlas-card__overlay"
            aria-hidden="true"
          >
            <span class="atlas-card__number">
              ${formatNumber(index)}
            </span>

            <span class="atlas-card__zoom"></span>
          </span>
        </button>
      `;

      fragment.append(article);
    }

    track.append(fragment);
  }

  /* =========================================
     PAGINATION
  ========================================= */

  function createPagination() {
    if (!pagination) {
      return;
    }

    pagination.innerHTML = "";
    paginationButtons = [];

    const pageCount = getPageCount();

    for (let index = 0; index < pageCount; index += 1) {
      const button = document.createElement("button");

      button.className = "atlas-slider__dot";
      button.type = "button";

      button.setAttribute(
        "aria-label",
        isMobile()
          ? `Перейти до коліркоду ${index + 1}`
          : `Перейти до групи ${index + 1}`,
      );

      button.addEventListener("click", () => {
        goToPage(index);
      });

      pagination.append(button);
      paginationButtons.push(button);
    }
  }

  function updatePagination() {
    paginationButtons.forEach((button, index) => {
      const isActive = index === currentPage;

      button.classList.toggle("is-active", isActive);

      button.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }

  function updateCounter() {
    if (currentElement) {
      currentElement.textContent = formatNumber(currentPage + 1);
    }

    if (totalElement) {
      totalElement.textContent = formatNumber(getPageCount());
    }
  }

  /* =========================================
     SLIDER POSITION
  ========================================= */

  function updateDesktopPosition() {
    if (!track || !viewport) {
      return;
    }

    const cards = Array.from(track.querySelectorAll("[data-atlas-card]"));

    const firstCardIndex = currentPage * getVisibleSlides();

    const targetCard = cards[firstCardIndex];

    if (!targetCard) {
      return;
    }

    track.style.transform = `translate3d(-${targetCard.offsetLeft}px, 0, 0)`;
  }

  function updateMobilePosition() {
    if (!track || !viewport) {
      return;
    }

    const cards = Array.from(track.querySelectorAll("[data-atlas-card]"));

    const activeCard = cards[currentPage];

    if (!activeCard) {
      return;
    }

    const cardCenter = activeCard.offsetLeft + activeCard.offsetWidth / 2;

    const viewportCenter = viewport.clientWidth / 2;

    const translateX = viewportCenter - cardCenter;

    track.style.transform = `translate3d(${translateX}px, 0, 0)`;
  }

  function updateSlider() {
    currentPage = normalizePage(currentPage);

    if (isMobile()) {
      updateMobilePosition();
    } else {
      updateDesktopPosition();
    }

    updatePagination();
    updateCounter();
  }

  function goToPage(page) {
    currentPage = normalizePage(page);

    updateSlider();
  }

  function showPreviousPage() {
    goToPage(currentPage - 1);
  }

  function showNextPage() {
    goToPage(currentPage + 1);
  }

  /* =========================================
     BUTTONS
  ========================================= */

  previousButton?.addEventListener("click", showPreviousPage);

  nextButton?.addEventListener("click", showNextPage);

  /* =========================================
     KEYBOARD
  ========================================= */

  atlasSlider.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();

      showPreviousPage();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();

      showNextPage();
    }
  });

  /* =========================================
     MOBILE SWIPE
  ========================================= */

  atlasSlider.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.touches[0];

      touchStartX = touch.clientX;
      touchStartY = touch.clientY;

      touchCurrentX = touchStartX;
      touchCurrentY = touchStartY;

      isTouching = true;
    },
    {
      passive: true,
    },
  );

  atlasSlider.addEventListener(
    "touchmove",
    (event) => {
      if (!isTouching) {
        return;
      }

      const touch = event.touches[0];

      touchCurrentX = touch.clientX;
      touchCurrentY = touch.clientY;
    },
    {
      passive: true,
    },
  );

  atlasSlider.addEventListener(
    "touchend",
    () => {
      if (!isTouching) {
        return;
      }

      isTouching = false;

      const deltaX = touchCurrentX - touchStartX;

      const deltaY = touchCurrentY - touchStartY;

      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY) * 1.2;

      if (!isHorizontalSwipe) {
        return;
      }

      if (Math.abs(deltaX) < 45) {
        return;
      }

      if (deltaX < 0) {
        showNextPage();
      } else {
        showPreviousPage();
      }
    },
    {
      passive: true,
    },
  );

  atlasSlider.addEventListener(
    "touchcancel",
    () => {
      isTouching = false;
    },
    {
      passive: true,
    },
  );

  /* =========================================
     RESIZE
  ========================================= */

  let previousVisibleSlides = getVisibleSlides();

  window.addEventListener("resize", () => {
    const currentVisibleSlides = getVisibleSlides();

    if (currentVisibleSlides !== previousVisibleSlides) {
      previousVisibleSlides = currentVisibleSlides;

      currentPage = 0;

      createPagination();
    }

    window.requestAnimationFrame(() => {
      updateSlider();
    });
  });

  /* =========================================
     LIGHTBOX
  ========================================= */

  const lightbox = document.querySelector("[data-atlas-lightbox]");

  const lightboxImage = lightbox?.querySelector("[data-lightbox-image]");

  const lightboxNumber = lightbox?.querySelector("[data-lightbox-number]");

  const lightboxCloseButtons = lightbox?.querySelectorAll(
    "[data-lightbox-close]",
  );

  const lightboxPreviousButton = lightbox?.querySelector(
    "[data-lightbox-prev]",
  );

  const lightboxNextButton = lightbox?.querySelector("[data-lightbox-next]");

  let lightboxIndex = 0;
  let lastFocusedElement = null;

  function normalizeImageIndex(index) {
    return (index + imageCount) % imageCount;
  }

  function updateLightbox() {
    if (!lightboxImage || !lightboxNumber) {
      return;
    }

    const imageNumber = lightboxIndex + 1;

    lightboxImage.src = `img/atlas/${imageNumber}.jpg`;

    lightboxImage.alt = `Коліркод ${imageNumber}`;

    lightboxNumber.textContent = formatNumber(imageNumber);
  }

  function openLightbox(index) {
    if (!lightbox) {
      return;
    }

    lastFocusedElement = document.activeElement;

    lightboxIndex = normalizeImageIndex(index);

    updateLightbox();

    lightbox.classList.add("is-open");

    lightbox.setAttribute("aria-hidden", "false");

    document.body.classList.add("atlas-lightbox-open");

    window.setTimeout(() => {
      lightbox.querySelector(".atlas-lightbox__close")?.focus();
    }, 100);
  }

  function closeLightbox() {
    if (!lightbox) {
      return;
    }

    lightbox.classList.remove("is-open");

    lightbox.setAttribute("aria-hidden", "true");

    document.body.classList.remove("atlas-lightbox-open");

    lastFocusedElement?.focus();
  }

  function showPreviousLightboxImage() {
    lightboxIndex = normalizeImageIndex(lightboxIndex - 1);

    updateLightbox();
  }

  function showNextLightboxImage() {
    lightboxIndex = normalizeImageIndex(lightboxIndex + 1);

    updateLightbox();
  }

  track?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-atlas-open]");

    if (!button) {
      return;
    }

    openLightbox(Number(button.dataset.atlasOpen));
  });

  lightboxCloseButtons?.forEach((button) => {
    button.addEventListener("click", closeLightbox);
  });

  lightboxPreviousButton?.addEventListener("click", showPreviousLightboxImage);

  lightboxNextButton?.addEventListener("click", showNextLightboxImage);

  document.addEventListener("keydown", (event) => {
    if (!lightbox?.classList.contains("is-open")) {
      return;
    }

    if (event.key === "Escape") {
      closeLightbox();
    }

    if (event.key === "ArrowLeft") {
      showPreviousLightboxImage();
    }

    if (event.key === "ArrowRight") {
      showNextLightboxImage();
    }
  });

  /* =========================================
     LIGHTBOX SWIPE
  ========================================= */

  let lightboxTouchStartX = 0;
  let lightboxTouchEndX = 0;

  lightbox?.addEventListener(
    "touchstart",
    (event) => {
      lightboxTouchStartX = event.changedTouches[0].clientX;
    },
    {
      passive: true,
    },
  );

  lightbox?.addEventListener(
    "touchend",
    (event) => {
      lightboxTouchEndX = event.changedTouches[0].clientX;

      const distance = lightboxTouchStartX - lightboxTouchEndX;

      if (Math.abs(distance) < 50) {
        return;
      }

      if (distance > 0) {
        showNextLightboxImage();
      } else {
        showPreviousLightboxImage();
      }
    },
    {
      passive: true,
    },
  );

  /* =========================================
     INIT
  ========================================= */

  createCards();
  createPagination();

  window.requestAnimationFrame(() => {
    updateSlider();
  });
}
